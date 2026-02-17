const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface NextQuestionResponse {
  questionId: string;
  difficulty: number;
  prompt: string;
  choices: string[];
  sessionId: string;
  stateVersion: number;
  currentScore: number;
  currentStreak: number;
}

export interface SubmitAnswerResponse {
  correct: boolean;
  newDifficulty: number;
  newStreak: number;
  scoreDelta: number;
  totalScore: number;
  stateVersion: number;
  leaderboardRankScore: number;
  leaderboardRankStreak: number;
}

export interface MetricsResponse {
  currentDifficulty: number;
  streak: number;
  maxStreak: number;
  totalScore: number;
  accuracy: number;
  difficultyHistogram: Record<number, number>;
  recentPerformance: Array<{ correct: boolean; difficulty: number; answeredAt: string }>;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  totalScore?: number;
  maxStreak?: number;
  updatedAt: string;
}

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('brainbolt_token');
}

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const authUserId = localStorage.getItem('brainbolt_user');
  if (authUserId) return authUserId;
  let id = localStorage.getItem('brainbolt_user_id');
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('brainbolt_user_id', id);
  }
  return id;
}

function authHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function fetchNextQuestion(sessionId?: string): Promise<NextQuestionResponse> {
  const url = new URL(`${API_URL}/v1/quiz/next`);
  if (sessionId) url.searchParams.set('sessionId', sessionId);
  const res = await fetch(url.toString(), { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function submitAnswer(
  sessionId: string,
  questionId: string,
  answer: string,
  stateVersion: number,
  idempotencyKey: string
): Promise<SubmitAnswerResponse> {
  const res = await fetch(`${API_URL}/v1/quiz/answer`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      sessionId,
      questionId,
      answer,
      stateVersion,
      answerIdempotencyKey: idempotencyKey,
    }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchMetrics(): Promise<MetricsResponse> {
  const res = await fetch(`${API_URL}/v1/quiz/metrics`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function fetchScoreLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/v1/leaderboard/score`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.entries || [];
}

export async function fetchStreakLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/v1/leaderboard/streak`, { headers: authHeaders() });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.entries || [];
}

export { getUserId, getToken };
