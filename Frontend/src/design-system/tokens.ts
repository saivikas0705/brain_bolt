/**
 * Design system tokens only. No hardcoded CSS values in components.
 */

export const colors = {
  light: {
    background: 'var(--bg)',
    surface: 'var(--surface)',
    primary: 'var(--primary)',
    primaryHover: 'var(--primary-hover)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    border: 'var(--border)',
    success: 'var(--success)',
    error: 'var(--error)',
    streak: 'var(--streak)',
  },
  dark: {
    background: 'var(--bg)',
    surface: 'var(--surface)',
    primary: 'var(--primary)',
    primaryHover: 'var(--primary-hover)',
    text: 'var(--text)',
    textMuted: 'var(--text-muted)',
    border: 'var(--border)',
    success: 'var(--success)',
    error: 'var(--error)',
    streak: 'var(--streak)',
  },
} as const;

export const spacing = {
  0: 'var(--spacing-0)',
  1: 'var(--spacing-1)',
  2: 'var(--spacing-2)',
  3: 'var(--spacing-3)',
  4: 'var(--spacing-4)',
  5: 'var(--spacing-5)',
  6: 'var(--spacing-6)',
  8: 'var(--spacing-8)',
  10: 'var(--spacing-10)',
  12: 'var(--spacing-12)',
  16: 'var(--spacing-16)',
  20: 'var(--spacing-20)',
  24: 'var(--spacing-24)',
} as const;

export const typography = {
  fontFamily: 'var(--font-sans)',
  fontMono: 'var(--font-mono)',
  size: {
    xs: 'var(--text-xs)',
    sm: 'var(--text-sm)',
    base: 'var(--text-base)',
    lg: 'var(--text-lg)',
    xl: 'var(--text-xl)',
    '2xl': 'var(--text-2xl)',
    '3xl': 'var(--text-3xl)',
  },
  weight: {
    normal: 'var(--font-normal)',
    medium: 'var(--font-medium)',
    semibold: 'var(--font-semibold)',
    bold: 'var(--font-bold)',
  },
} as const;

export const radius = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  full: 'var(--radius-full)',
} as const;

export const shadows = {
  sm: 'var(--shadow-sm)',
  md: 'var(--shadow-md)',
  lg: 'var(--shadow-lg)',
} as const;

export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;
