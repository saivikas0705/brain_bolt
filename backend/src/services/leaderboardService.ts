import { LeaderboardScore } from '../models/LeaderboardScore';
import { LeaderboardStreak } from '../models/LeaderboardStreak';
import { config } from '../config';

const TOP_N = config.leaderboardTopN;

export async function getScoreLeaderboard() {
  const list = await LeaderboardScore.find()
    .sort({ totalScore: -1 })
    .limit(TOP_N)
    .lean();
  return list.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    totalScore: entry.totalScore,
    updatedAt: entry.updatedAt,
  }));
}

export async function getStreakLeaderboard() {
  const list = await LeaderboardStreak.find()
    .sort({ maxStreak: -1 })
    .limit(TOP_N)
    .lean();
  return list.map((entry, index) => ({
    rank: index + 1,
    userId: entry.userId,
    maxStreak: entry.maxStreak,
    updatedAt: entry.updatedAt,
  }));
}
