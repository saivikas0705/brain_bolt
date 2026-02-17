'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  fetchNextQuestion,
  submitAnswer,
  fetchScoreLeaderboard,
  fetchStreakLeaderboard,
  getUserId,
  type NextQuestionResponse,
  type SubmitAnswerResponse,
  type LeaderboardEntry,
} from '@/lib/api';

type QuizStatus = 'loading' | 'question' | 'submitting' | 'feedback' | 'error';

export function QuizPageClient() {
  const [question, setQuestion] = useState<NextQuestionResponse | null>(null);
  const [status, setStatus] = useState<QuizStatus>('loading');
  const [lastResult, setLastResult] = useState<SubmitAnswerResponse | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [scoreLeaderboard, setScoreLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [streakLeaderboard, setStreakLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [myRankScore, setMyRankScore] = useState<number | null>(null);
  const [myRankStreak, setMyRankStreak] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadNext = useCallback(async () => {
    setStatus('loading');
    setError(null);
    setSelectedChoice(null);
    setLastResult(null);
    try {
      const next = await fetchNextQuestion(question?.sessionId);
      setQuestion(next);
      setStatus('question');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load question');
      setStatus('error');
    }
  }, [question?.sessionId]);

  const loadLeaderboards = useCallback(async () => {
    try {
      const [score, streak] = await Promise.all([fetchScoreLeaderboard(), fetchStreakLeaderboard()]);
      setScoreLeaderboard(score);
      setStreakLeaderboard(streak);
      const uid = getUserId();
      const myScoreRank = score.findIndex((e) => e.userId === uid) + 1;
      const myStreakRank = streak.findIndex((e) => e.userId === uid) + 1;
      setMyRankScore(myScoreRank > 0 ? myScoreRank : null);
      setMyRankStreak(myStreakRank > 0 ? myStreakRank : null);
    } catch (_) {}
  }, []);

  useEffect(() => {
    loadNext();
  }, []);

  useEffect(() => {
    loadLeaderboards();
    const t = setInterval(loadLeaderboards, 10000);
    return () => clearInterval(t);
  }, [loadLeaderboards]);

  const handleSubmit = async () => {
    if (!question || !selectedChoice || status !== 'question') return;
    setStatus('submitting');
    const idempotencyKey = `${question.questionId}:${selectedChoice}:${question.stateVersion}`;
    try {
      const result = await submitAnswer(
        question.sessionId,
        question.questionId,
        selectedChoice,
        question.stateVersion,
        idempotencyKey
      );
      setLastResult(result);
      setQuestion((q) => (q ? { ...q, stateVersion: result.stateVersion, currentScore: result.totalScore, currentStreak: result.newStreak } : null));
      setStatus('feedback');
      loadLeaderboards();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Submit failed');
      setStatus('error');
    }
  };

  const handleNext = () => {
    loadNext();
  };

  if (status === 'error') {
    return (
      <div className="mx-auto max-w-2xl p-[var(--spacing-6)]">
        <Card>
          <CardContent className="pt-[var(--spacing-6)]">
            <p className="text-[var(--error)]">{error}</p>
            <Button onClick={loadNext} className="mt-4">Try again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-[var(--spacing-6)]">
      <div className="mb-[var(--spacing-6)] grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-[var(--spacing-4)]">
            <p className="text-[var(--text-muted)] text-[var(--text-sm)]">Total Score</p>
            <p className="text-[var(--text-2xl)] font-[var(--font-bold)]">{question?.currentScore ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-[var(--spacing-4)]">
            <p className="text-[var(--text-muted)] text-[var(--text-sm)]">Current Streak</p>
            <p className="text-[var(--text-2xl)] font-[var(--font-bold)] text-[var(--streak)]">{question?.currentStreak ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      {status === 'loading' && (
        <Card>
          <CardContent className="py-[var(--spacing-12)] text-center text-[var(--text-muted)]">Loading question…</CardContent>
        </Card>
      )}

      {status === 'question' && question && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <span className="text-[var(--text-muted)] text-[var(--text-sm)]">Difficulty: {question.difficulty}</span>
          </CardHeader>
          <CardContent>
            <p className="mb-[var(--spacing-6)] text-[var(--text-lg)]">{question.prompt}</p>
            <ul className="space-y-2">
              {question.choices.map((choice) => (
                <li key={choice}>
                  <button
                    type="button"
                    onClick={() => setSelectedChoice(choice)}
                    className={`${selectedChoice === choice ? 'choice-selected' : 'choice-button'}`}
                  >
                    {choice}
                  </button>
                </li>
              ))}
            </ul>
            <Button fullWidth className="mt-6" onClick={handleSubmit} disabled={!selectedChoice}>
              Submit
            </Button>
          </CardContent>
        </Card>
      )}

      {status === 'submitting' && (
        <Card>
          <CardContent className="py-[var(--spacing-12)] text-center text-[var(--text-muted)]">Checking answer…</CardContent>
        </Card>
      )}

      {status === 'feedback' && lastResult && (
        <Card>
          <CardHeader>
            <p className={lastResult.correct ? 'text-[var(--success)]' : 'text-[var(--error)]'}>
              {lastResult.correct ? 'Correct!' : 'Incorrect'}
            </p>
            {lastResult.correct && <p className="text-[var(--text-muted)]">+{lastResult.scoreDelta} points</p>}
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-[var(--text-sm)] text-[var(--text-muted)]">
              New difficulty: {lastResult.newDifficulty} · Streak: {lastResult.newStreak} · Total: {lastResult.totalScore}
            </p>
            <p className="mb-4 text-[var(--text-sm)]">
              Your rank — Score: #{lastResult.leaderboardRankScore} · Streak: #{lastResult.leaderboardRankStreak}
            </p>
            <Button fullWidth onClick={handleNext}>Next question</Button>
          </CardContent>
        </Card>
      )}

      <section className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="text-[var(--text-lg)] font-[var(--font-semibold)]">Top by Score</CardHeader>
          <CardContent>
            <ul className="space-y-1 text-[var(--text-sm)]">
              {scoreLeaderboard.slice(0, 5).map((e) => (
                <li key={e.userId} className="flex justify-between">
                  <span>#{e.rank}</span>
                  <span>{e.totalScore ?? 0}</span>
                </li>
              ))}
            </ul>
            {myRankScore != null && (
              <p className="mt-2 text-[var(--text-muted)] text-[var(--text-xs)]">Your rank: #{myRankScore}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-[var(--text-lg)] font-[var(--font-semibold)]">Top by Streak</CardHeader>
          <CardContent>
            <ul className="space-y-1 text-[var(--text-sm)]">
              {streakLeaderboard.slice(0, 5).map((e) => (
                <li key={e.userId} className="flex justify-between">
                  <span>#{e.rank}</span>
                  <span>{e.maxStreak ?? 0}</span>
                </li>
              ))}
            </ul>
            {myRankStreak != null && (
              <p className="mt-2 text-[var(--text-muted)] text-[var(--text-xs)]">Your rank: #{myRankStreak}</p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
