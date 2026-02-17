"use client";

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Landing from '@/components/landing/Landing';
import { QuizPageClient } from '@/components/quiz/QuizPageClient';

export default function HomePage() {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('brainbolt_token');
      if (!token) {
        router.push('/auth');
        return;
      }
    } catch {
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <>
      <Landing />
      <div id="quiz" className="container mt-[var(--spacing-8)]">
        <QuizPageClient />
      </div>
    </>
  );
}
