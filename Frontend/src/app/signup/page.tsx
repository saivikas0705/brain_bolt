'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiBase}/v1/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim() || undefined,
          email: email.trim(),
          password,
        }),
      });
      const ct = res.headers.get('content-type') || '';
      const body = ct.includes('application/json') ? await res.json() : await res.text();
      if (!res.ok) {
        const errMsg = typeof body === 'string' ? body : (body as { error?: string })?.error || 'Signup failed';
        throw new Error(errMsg);
      }
      const data = body as { token: string; userId: string };
      try {
        localStorage.setItem('brainbolt_token', data.token);
        localStorage.setItem('brainbolt_user', data.userId);
        localStorage.setItem('brainbolt_user_id', data.userId);
      } catch {}
      router.push('/');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Signup failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md p-[var(--spacing-6)]">
      <Card>
        <CardHeader>
          <h1 className="text-[var(--text-2xl)] font-[var(--font-bold)]">Create account</h1>
          <p className="text-[var(--text-muted)] text-[var(--text-sm)]">Sign up to start the quiz</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[var(--text-sm)] text-[var(--text-muted)] mb-1">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                type="text"
                placeholder="Your name"
                className="w-full p-[var(--spacing-3)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--text)]"
              />
            </div>
            <div>
              <label className="block text-[var(--text-sm)] text-[var(--text-muted)] mb-1">Email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                type="email"
                placeholder="you@example.com"
                className="w-full p-[var(--spacing-3)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--text)]"
              />
            </div>
            <div>
              <label className="block text-[var(--text-sm)] text-[var(--text-muted)] mb-1">Password</label>
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                type="password"
                placeholder="At least 6 characters"
                minLength={6}
                className="w-full p-[var(--spacing-3)] border border-[var(--border)] rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--text)]"
              />
            </div>
            {message && (
              <p className="text-[var(--error)] text-[var(--text-sm)]">{message}</p>
            )}
            <Button type="submit" fullWidth disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
            <p className="text-[var(--text-muted)] text-[var(--text-sm)] text-center">
              Already have an account? <Link href="/login" className="text-[var(--primary)] underline">Sign in</Link>
            </p>
          </form>
        </CardContent>
      </Card>
      <p className="mt-4 text-center">
        <Link href="/auth" className="text-[var(--text-muted)] text-[var(--text-sm)] underline">Back to welcome</Link>
      </p>
    </div>
  );
}
