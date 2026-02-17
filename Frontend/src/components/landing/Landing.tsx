"use client";

import Link from 'next/link';
import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';

export function Landing() {
  return (
    <section className="container">
      <div className="hero">
        <div>
          <h1>BrainBolt — Learn Faster. Play Smarter.</h1>
          <p className="mt-4">Adaptive, bite-sized quizzes that adjust to your level and keep you motivated with live leaderboards.</p>

          <div className="mt-6 flex items-center gap-4">
            <a href="#quiz">
              <Button size="lg">Start Quiz</Button>
            </a>
            <Link href="/leaderboard" className="btn-chip">View Leaderboard</Link>
          </div>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent>
                <h4 className="text-[var(--text-sm)] font-[var(--font-semibold)]">Adaptive</h4>
                <p className="text-[var(--text-muted)] text-[var(--text-sm)]">Questions scale to your knowledge in real-time.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <h4 className="text-[var(--text-sm)] font-[var(--font-semibold)]">Short Sessions</h4>
                <p className="text-[var(--text-muted)] text-[var(--text-sm)]">Quick 1–2 minute rounds to fit anywhere in your day.</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent>
                <h4 className="text-[var(--text-sm)] font-[var(--font-semibold)]">Leaderboards</h4>
                <p className="text-[var(--text-muted)] text-[var(--text-sm)]">Compete with others and track your progress over time.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="hidden md:block">
          <div className="w-[380px] rounded-[var(--radius-lg)] overflow-hidden shadow-[var(--shadow-lg)] bg-[var(--surface)] border border-[var(--border)]">
            <div className="p-[var(--spacing-4)]">
              <h3 className="text-[var(--text-lg)] font-[var(--font-semibold)]">Live Preview</h3>
              <p className="text-[var(--text-muted)] text-[var(--text-sm)] mt-2">A sample question, score and streak to show the experience.</p>
            </div>
            <div className="p-[var(--spacing-4)] border-t border-[var(--border)]">
              <div className="mb-4 text-[var(--text-lg)]">What is 7 × 8?</div>
              <div className="space-y-2">
                <div className="choice-button">54</div>
                <div className="choice-selected">56</div>
                <div className="choice-button">48</div>
                <div className="choice-button">63</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Landing;
