import crypto from 'crypto';
import mongoose from 'mongoose';
import { Question } from '../models/Question';
import { UserState } from '../models/UserState';
import { AnswerLog } from '../models/AnswerLog';
import { LeaderboardScore } from '../models/LeaderboardScore';
import { LeaderboardStreak } from '../models/LeaderboardStreak';
import { User } from '../models/User';
import { config } from '../config';
import { computeNextDifficulty } from './adaptiveAlgorithm';
import { computeScoreDelta } from './scoreService';
import * as cache from './cache';

const STREAK_DECAY_SEC = config.streakDecayAfterSeconds;

function hashAnswer(answer: string): string {
  return crypto.createHash('sha256').update(answer.trim().toLowerCase()).digest('hex');
}

function applyStreakDecay(lastAnswerAt: Date, currentStreak: number): number {
  const elapsed = (Date.now() - lastAnswerAt.getTime()) / 1000;
  if (elapsed >= STREAK_DECAY_SEC && currentStreak > 0) return 0;
  return currentStreak;
}

export async function getOrCreateUser(userId: string): Promise<mongoose.Types.ObjectId | string> {
  const id = String(userId).trim() || undefined;
  if (!id) {
    const user = await User.create({ _id: new mongoose.Types.ObjectId().toString() });
    return user._id;
  }
  const existing = await User.findById(id);
  if (!existing) await User.create({ _id: id });
  return id;
}

export async function getOrCreateUserState(userId: string) {
  const uidStr = typeof userId === 'string' ? userId : (userId as mongoose.Types.ObjectId).toString();
  let state = await UserState.findOne({ userId: uidStr });
  if (!state) {
    state = await UserState.create({
      userId: uidStr,
      currentDifficulty: config.minDifficulty,
      streak: 0,
      maxStreak: 0,
      totalScore: 0,
      totalCorrect: 0,
      totalAnswered: 0,
      stateVersion: 0,
      recentCorrect: [],
    });
  }
  const lastAnswerAt = state.lastAnswerAt || state.updatedAt;
  const decayedStreak = applyStreakDecay(lastAnswerAt, state.streak);
  if (decayedStreak !== state.streak) {
    state.streak = decayedStreak;
    state.lastAnswerAt = new Date();
    await state.save();
  }
  return state;
}

async function pickQuestionId(difficulty: number, excludeId?: mongoose.Types.ObjectId): Promise<mongoose.Types.ObjectId | null> {
  let ids = await cache.getQuestionPoolIds(difficulty);
  if (!ids) {
    const questions = await Question.find({ difficulty }).select('_id').lean();
    ids = questions.map((q) => q._id.toString());
    if (ids.length) await cache.setQuestionPoolIds(difficulty, ids);
  }
  const exclude = excludeId?.toString();
  const available = ids.filter((id) => id !== exclude);
  if (available.length === 0) return null;
  const chosen = available[Math.floor(Math.random() * available.length)];
  return new mongoose.Types.ObjectId(chosen);
}

export async function getNextQuestion(userId: string, sessionId?: string) {
  const uid = await getOrCreateUser(userId);
  const uidStr = typeof uid === 'string' ? uid : uid.toString();
  const state = await getOrCreateUserState(uidStr);
  await cache.invalidateUserState(uidStr);

  const difficulty = state.currentDifficulty;
  const questionId = await pickQuestionId(difficulty, state.lastQuestionId);
  if (!questionId) {
    const fallback = await Question.findOne({ difficulty }).select('_id prompt choices difficulty').lean();
    if (!fallback) return null;
    return {
      questionId: fallback._id,
      difficulty: fallback.difficulty,
      prompt: fallback.prompt,
      choices: fallback.choices,
      sessionId: sessionId || uidStr,
      stateVersion: state.stateVersion,
      currentScore: state.totalScore,
      currentStreak: state.streak,
    };
  }

  const q = await Question.findById(questionId).select('_id prompt choices difficulty').lean();
  if (!q) return null;

  const stateJson = JSON.stringify({
    currentDifficulty: state.currentDifficulty,
    streak: state.streak,
    maxStreak: state.maxStreak,
    totalScore: state.totalScore,
    totalCorrect: state.totalCorrect,
    totalAnswered: state.totalAnswered,
    lastQuestionId: state.lastQuestionId,
    lastAnswerAt: state.lastAnswerAt,
    stateVersion: state.stateVersion,
    recentCorrect: state.recentCorrect,
  });
  await cache.setCachedUserState(uidStr, stateJson);

  return {
    questionId: q._id,
    difficulty: q.difficulty,
    prompt: q.prompt,
    choices: q.choices,
    sessionId: sessionId || uidStr,
    stateVersion: state.stateVersion,
    currentScore: state.totalScore,
    currentStreak: state.streak,
  };
}

export interface SubmitAnswerResult {
  correct: boolean;
  newDifficulty: number;
  newStreak: number;
  scoreDelta: number;
  totalScore: number;
  stateVersion: number;
  leaderboardRankScore: number;
  leaderboardRankStreak: number;
}

export async function submitAnswer(
  userId: string,
  sessionId: string,
  questionId: string,
  answer: string,
  stateVersion: number,
  answerIdempotencyKey: string
): Promise<SubmitAnswerResult | null> {
  const uid = await getOrCreateUser(userId);
  const uidStr = typeof uid === 'string' ? uid : uid.toString();
  const idempotencyKey = answerIdempotencyKey || `${questionId}:${answer}:${stateVersion}`;
  const cached = await cache.getIdempotencyResult(uidStr, idempotencyKey);
  if (cached) {
    return JSON.parse(cached) as SubmitAnswerResult;
  }

  const question = await Question.findById(questionId).lean();
  if (!question) return null;

  const correctHash = question.correctAnswerHash;
  const userHash = hashAnswer(answer);
  const correct = userHash === correctHash;

  let state = await UserState.findOne({ userId: uidStr });
  if (!state) state = await getOrCreateUserState(uidStr);

  const optimisticVersion = stateVersion;
  if (state.stateVersion !== optimisticVersion) {
    state = await getOrCreateUserState(uidStr);
  }

  const streakBefore = state.streak;
  const newStreak = correct ? streakBefore + 1 : 0;
  const scoreDelta = computeScoreDelta(correct, question.difficulty, streakBefore);

  const { newDifficulty, updatedRecentCorrect } = computeNextDifficulty({
    correct,
    currentDifficulty: state.currentDifficulty,
    currentStreak: streakBefore,
    recentCorrect: state.recentCorrect || [],
  });

  state.streak = newStreak;
  state.maxStreak = Math.max(state.maxStreak, newStreak);
  state.totalScore += scoreDelta;
  state.totalCorrect += correct ? 1 : 0;
  state.totalAnswered += 1;
  state.currentDifficulty = newDifficulty;
  state.lastQuestionId = new mongoose.Types.ObjectId(questionId);
  state.lastAnswerAt = new Date();
  state.stateVersion += 1;
  state.recentCorrect = updatedRecentCorrect;
  await state.save();

  await AnswerLog.create({
    userId: uidStr,
    questionId: new mongoose.Types.ObjectId(questionId),
    difficulty: question.difficulty,
    answer,
    correct,
    scoreDelta,
    streakAtAnswer: streakBefore,
    idempotencyKey: idempotencyKey,
  });

  await LeaderboardScore.findOneAndUpdate(
    { userId: uidStr },
    { $set: { totalScore: state.totalScore, updatedAt: new Date() } },
    { upsert: true }
  );
  await LeaderboardStreak.findOneAndUpdate(
    { userId: uidStr },
    { $set: { maxStreak: state.maxStreak, updatedAt: new Date() } },
    { upsert: true }
  );

  await cache.invalidateUserState(uidStr);

  const rankScore = await LeaderboardScore.countDocuments({ totalScore: { $gt: state.totalScore } }) + 1;
  const rankStreak = await LeaderboardStreak.countDocuments({ maxStreak: { $gt: state.maxStreak } }) + 1;

  const result: SubmitAnswerResult = {
    correct,
    newDifficulty,
    newStreak,
    scoreDelta,
    totalScore: state.totalScore,
    stateVersion: state.stateVersion,
    leaderboardRankScore: rankScore,
    leaderboardRankStreak: rankStreak,
  };

  await cache.setIdempotencyResult(uidStr, idempotencyKey, JSON.stringify(result));
  return result;
}

export async function getMetrics(userId: string) {
  const uid = await getOrCreateUser(userId);
  const uidStr = typeof uid === 'string' ? uid : uid.toString();
  const state = await getOrCreateUserState(uidStr);
  const recentLogs = await AnswerLog.find({ userId: uidStr })
    .sort({ answeredAt: -1 })
    .limit(20)
    .lean();
  const difficultyHistogram: Record<number, number> = {};
  recentLogs.forEach((log) => {
    difficultyHistogram[log.difficulty] = (difficultyHistogram[log.difficulty] || 0) + 1;
  });
  const recentPerformance = recentLogs.slice(0, 10).map((l) => ({
    correct: l.correct,
    difficulty: l.difficulty,
    answeredAt: l.answeredAt,
  }));
  return {
    currentDifficulty: state.currentDifficulty,
    streak: state.streak,
    maxStreak: state.maxStreak,
    totalScore: state.totalScore,
    accuracy: state.totalAnswered ? state.totalCorrect / state.totalAnswered : 0,
    difficultyHistogram,
    recentPerformance,
  };
}
