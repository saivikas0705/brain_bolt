'use client';

import React, { useEffect, useState } from 'react';
import { Button } from './Button';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = (typeof window !== 'undefined' && window.localStorage.getItem('theme')) as 'light' | 'dark' | null;
    const prefersDark = typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initial = stored || (prefersDark ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.setAttribute('data-theme', initial);
  }, []);

  const toggle = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    if (typeof window !== 'undefined') window.localStorage.setItem('theme', next);
  };

  if (!mounted) return null;
  return (
    <Button variant="ghost" size="sm" onClick={toggle} aria-label="Toggle theme">
      {theme === 'light' ? 'Dark' : 'Light'}
    </Button>
  );
}
