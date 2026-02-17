'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { fetchScoreLeaderboard, fetchStreakLeaderboard, getUserId } from '@/lib/api';
import type { LeaderboardEntry } from '@/lib/api';

interface Props {
  initialScore?: LeaderboardEntry[];
  initialStreak?: LeaderboardEntry[];
}

export function LeaderboardPageContent({ initialScore = [], initialStreak = [] }: Props) {
  const [scoreList, setScoreList] = useState<LeaderboardEntry[]>(initialScore);
  const [streakList, setStreakList] = useState<LeaderboardEntry[]>(initialStreak);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      const [score, streak] = await Promise.all([fetchScoreLeaderboard(), fetchStreakLeaderboard()]);
      setScoreList(score);
      setStreakList(streak);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  const uid = typeof window !== 'undefined' ? getUserId() : '';
  const myScoreRank = scoreList.findIndex((e) => e.userId === uid) + 1;
  const myStreakRank = streakList.findIndex((e) => e.userId === uid) + 1;

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-[var(--spacing-6)]">
        <p className="text-[var(--text-muted)]">Loading leaderboards…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-[var(--spacing-6)]">
      <h1 className="mb-[var(--spacing-6)] text-[var(--text-2xl)] font-[var(--font-bold)]">
        Live Leaderboards
      </h1>
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader className="text-[var(--text-lg)] font-[var(--font-semibold)]">
            Top by Total Score
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {scoreList.map((e) => (
                <li
                  key={e.userId}
                  className={`flex justify-between rounded-[var(--radius-md)] px-2 py-1 ${
                    e.userId === uid ? 'bg-[var(--primary)]/20' : ''
                  }`}
                >
                  <span>#{e.rank}</span>
                  <span className="font-[var(--font-medium)]">{e.totalScore ?? 0}</span>
                </li>
              ))}
            </ul>
            {myScoreRank > 0 && (
              <p className="mt-3 text-[var(--text-muted)] text-[var(--text-sm)]">
                Your rank: #{myScoreRank}
              </p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-[var(--text-lg)] font-[var(--font-semibold)]">
            Top by Max Streak
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {streakList.map((e) => (
                <li
                  key={e.userId}
                  className={`flex justify-between rounded-[var(--radius-md)] px-2 py-1 ${
                    e.userId === uid ? 'bg-[var(--streak)]/20' : ''
                  }`}
                >
                  <span>#{e.rank}</span>
                  <span className="font-[var(--font-medium)] text-[var(--streak)]">
                    {e.maxStreak ?? 0}
                  </span>
                </li>
              ))}
            </ul>
            {myStreakRank > 0 && (
              <p className="mt-3 text-[var(--text-muted)] text-[var(--text-sm)]">
                Your rank: #{myStreakRank}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
