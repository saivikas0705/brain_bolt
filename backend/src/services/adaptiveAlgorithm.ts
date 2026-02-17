import { config } from '../config';

const {
  minDifficulty,
  maxDifficulty,
  minStreakToIncreaseDifficulty,
  confidenceWindowSize,
} = config;

export interface AdaptiveInput {
  correct: boolean;
  currentDifficulty: number;
  currentStreak: number;
  recentCorrect: boolean[];
}

export interface AdaptiveOutput {
  newDifficulty: number;
  updatedRecentCorrect: boolean[];
}

export function computeNextDifficulty(input: AdaptiveInput): AdaptiveOutput {
  const { correct, currentDifficulty, currentStreak, recentCorrect } = input;
  const window = [...recentCorrect].slice(-confidenceWindowSize);
  const updatedRecent = [...window, correct].slice(-confidenceWindowSize);

  if (correct) {
    const canIncrease =
      currentDifficulty < maxDifficulty &&
      currentStreak >= minStreakToIncreaseDifficulty;
    const windowMajorityCorrect =
      window.length === 0 || window.filter(Boolean).length >= Math.ceil(window.length / 2);
    if (canIncrease && windowMajorityCorrect) {
      return {
        newDifficulty: Math.min(maxDifficulty, currentDifficulty + 1),
        updatedRecentCorrect: updatedRecent,
      };
    }
    return { newDifficulty: currentDifficulty, updatedRecentCorrect: updatedRecent };
  }

  const newDifficulty = Math.max(minDifficulty, currentDifficulty - 1);
  return { newDifficulty, updatedRecentCorrect: updatedRecent };
}

export function clampDifficulty(d: number): number {
  return Math.max(minDifficulty, Math.min(maxDifficulty, Math.round(d)));
}
