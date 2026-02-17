import { LeaderboardPageContent } from '@/components/leaderboard/LeaderboardPageContent';

export const dynamic = 'force-dynamic';

async function fetchLeaderboards() {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
  try {
    const [scoreRes, streakRes] = await Promise.all([
      fetch(`${base}/v1/leaderboard/score`, { next: { revalidate: 0 } }),
      fetch(`${base}/v1/leaderboard/streak`, { next: { revalidate: 0 } }),
    ]);
    const score = scoreRes.ok ? (await scoreRes.json()).entries || [] : [];
    const streak = streakRes.ok ? (await streakRes.json()).entries || [] : [];
    return { score, streak };
  } catch {
    return { score: [], streak: [] };
  }
}

export default async function LeaderboardPage() {
  const { score, streak } = await fetchLeaderboards();
  return <LeaderboardPageContent initialScore={score} initialStreak={streak} />;
}
