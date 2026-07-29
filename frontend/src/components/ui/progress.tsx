import * as React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number; // 0–100
  className?: string;
  color?: string;
}

export function Progress({ value, className, color = '#3B82F6' }: ProgressProps) {
  return (
    <div
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-[#1F1F23]', className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }}
      />
    </div>
  );
}
