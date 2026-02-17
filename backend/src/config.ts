export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/brainbolt',
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  // Adaptive algorithm
  minDifficulty: 1,
  maxDifficulty: 10,
  hysteresisBand: 1,           // Don't change difficulty unless move exceeds this
  minStreakToIncreaseDifficulty: 2,
  confidenceWindowSize: 5,     // Rolling window for stability
  // Scoring
  baseScorePerCorrect: 100,
  maxStreakMultiplier: 3,
  streakMultiplierStep: 0.25,  // +0.25 per streak up to cap
  // Streak decay (inactivity in seconds)
  streakDecayAfterSeconds: 300, // 5 min
  // Leaderboard
  leaderboardTopN: 100,
  // Rate limiting
  rateLimitWindowMs: 60000,
  rateLimitMax: 120,
  // Idempotency TTL for answer keys (seconds)
  idempotencyTtlSeconds: 86400,
  jwtSecret: process.env.JWT_SECRET || 'brainbolt-dev-secret-change-in-production',
  jwtExpiresIn: '7d',
} as const;

export type Config = typeof config;
