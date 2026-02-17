import Redis from 'ioredis';
import { config } from '../config';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis(config.redisUrl, { maxRetriesPerRequest: 3 });
  }
  return redis;
}

const PREFIX = 'brainbolt:';
const USER_STATE_PREFIX = PREFIX + 'user_state:';
const IDEMPOTENCY_PREFIX = PREFIX + 'idempotency:';
const QUESTION_POOL_PREFIX = PREFIX + 'question_pool:';

export const cacheKeys = {
  userState: (userId: string) => USER_STATE_PREFIX + userId,
  idempotency: (userId: string, key: string) => IDEMPOTENCY_PREFIX + userId + ':' + key,
  questionPool: (difficulty: number) => QUESTION_POOL_PREFIX + difficulty,
};

export const TTL = {
  userState: 600,
  idempotency: config.idempotencyTtlSeconds,
  questionPool: 3600,
};

export async function getCachedUserState(userId: string): Promise<string | null> {
  return getRedis().get(cacheKeys.userState(userId));
}

export async function setCachedUserState(userId: string, json: string): Promise<void> {
  await getRedis().setex(cacheKeys.userState(userId), TTL.userState, json);
}

export async function invalidateUserState(userId: string): Promise<void> {
  await getRedis().del(cacheKeys.userState(userId));
}

export async function getIdempotencyResult(userId: string, key: string): Promise<string | null> {
  return getRedis().get(cacheKeys.idempotency(userId, key));
}

export async function setIdempotencyResult(
  userId: string,
  key: string,
  result: string
): Promise<void> {
  await getRedis().setex(cacheKeys.idempotency(userId, key), TTL.idempotency, result);
}

export async function getQuestionPoolIds(difficulty: number): Promise<string[] | null> {
  const raw = await getRedis().get(cacheKeys.questionPool(difficulty));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as string[];
  } catch {
    return null;
  }
}

export async function setQuestionPoolIds(difficulty: number, ids: string[]): Promise<void> {
  await getRedis().setex(
    cacheKeys.questionPool(difficulty),
    TTL.questionPool,
    JSON.stringify(ids)
  );
}

export async function invalidateQuestionPool(difficulty: number): Promise<void> {
  await getRedis().del(cacheKeys.questionPool(difficulty));
}
