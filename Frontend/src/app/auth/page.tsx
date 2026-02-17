"use client";

import React from 'react';
import Link from 'next/link';

export default function AuthChooser() {
  return (
    <div className="container mx-auto p-[var(--spacing-12)]">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-[var(--text-3xl)] font-[var(--font-bold)] mb-4">Welcome to BrainBolt</h1>
        <p className="text-[var(--text-muted)] mb-8">Please sign up or log in to continue.</p>

        <div className="flex justify-center gap-4">
          <Link href="/signup" className="inline-flex items-center justify-center rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[var(--text)] no-underline hover:bg-[var(--border)]">
            Sign up
          </Link>
          <Link href="/login" className="inline-flex items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 py-2 text-white no-underline hover:opacity-90">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
