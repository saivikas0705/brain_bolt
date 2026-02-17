'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  children: React.ReactNode;
}

const base =
  'inline-flex items-center justify-center font-medium rounded-[var(--radius-md)] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none shadow-[var(--shadow-sm)]';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] focus:ring-[var(--primary)]',
  secondary: 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--border)]',
  ghost: 'text-[var(--text)] hover:bg-[var(--surface)]',
  danger: 'bg-[var(--error)] text-white hover:opacity-90 focus:ring-[var(--error)]',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'text-[var(--text-sm)] py-[var(--spacing-2)] px-[var(--spacing-3)]',
  md: 'text-[var(--text-base)] py-[var(--spacing-3)] px-[var(--spacing-4)]',
  lg: 'text-[var(--text-lg)] py-[var(--spacing-4)] px-[var(--spacing-6)]',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth, className = '', children, ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = 'Button';
