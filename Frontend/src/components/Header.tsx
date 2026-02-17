'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export function Header() {
  const [user, setUser] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    try {
      const uid = localStorage.getItem('brainbolt_user');
      setUser(uid);
    } catch {
      setUser(null);
    }
  }, []);

  function logout() {
    try {
      localStorage.removeItem('brainbolt_token');
      localStorage.removeItem('brainbolt_user');
      localStorage.removeItem('brainbolt_user_id');
    } catch {}
    setUser(null);
    router.push('/auth');
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-[var(--spacing-4)] shadow-[var(--shadow-sm)]">
      <div className="flex items-center gap-[var(--spacing-4)]">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <div className="rounded-full w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-400 flex items-center justify-center text-white font-[var(--font-bold)]">B</div>
          <span className="text-[var(--text-xl)] font-[var(--font-bold)] text-[var(--text)]">BrainBolt</span>
        </Link>
        <p className="text-[var(--text-muted)] text-[var(--text-sm)] hidden md:block">Adaptive quizzes · Live leaderboards</p>
      </div>
      <nav className="flex items-center gap-[var(--spacing-3)]">
        <Link href="/" className="btn-chip">Quiz</Link>
        <Link href="/leaderboard" className="btn-chip">Leaderboard</Link>
        {!user && <Link href="/signup" className="btn-chip">Sign up</Link>}
        {!user && <Link href="/login" className="btn-chip">Log in</Link>}
        {user && (
          <button onClick={logout} className="btn-chip">Sign out</button>
        )}
        <ThemeToggle />
      </nav>
    </header>
  );
}
