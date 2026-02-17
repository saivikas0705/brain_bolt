import { config } from '../config';

const {
  baseScorePerCorrect,
  maxStreakMultiplier,
  streakMultiplierStep,
} = config;

export function getStreakMultiplier(streak: number): number {
  const raw = 1 + streak * streakMultiplierStep;
  return Math.min(maxStreakMultiplier, Math.max(1, raw));
}

export function computeScoreDelta(
  correct: boolean,
  difficulty: number,
  streakBeforeAnswer: number
): number {
  if (!correct) return 0;
  const difficultyWeight = 0.5 + difficulty * 0.1;
  const mult = getStreakMultiplier(streakBeforeAnswer);
  return Math.round(baseScorePerCorrect * difficultyWeight * mult);
}
