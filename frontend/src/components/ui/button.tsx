import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/60 disabled:opacity-50 disabled:cursor-not-allowed',
        variant === 'primary' &&
          'bg-[#3B82F6] text-white hover:bg-[#2563EB] active:scale-[0.98] shadow-lg shadow-blue-500/20',
        variant === 'ghost' &&
          'bg-transparent text-[#A1A1AA] hover:bg-[#1F1F23] hover:text-[#FAFAFA]',
        variant === 'outline' &&
          'border border-[#1F1F23] bg-transparent text-[#FAFAFA] hover:bg-[#1F1F23]',
        variant === 'danger' &&
          'bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20',
        size === 'sm' && 'h-7 px-3 text-xs',
        size === 'md' && 'h-9 px-4 text-sm',
        size === 'lg' && 'h-11 px-6 text-base',
        className
      )}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="32" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
