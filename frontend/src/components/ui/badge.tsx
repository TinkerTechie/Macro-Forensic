import * as React from 'react';
import { cn, riskBg } from '@/lib/utils';
import type { RiskLevel } from '@/types';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'outline' | 'risk';
  risk?: RiskLevel;
}

export function Badge({ className, variant = 'default', risk, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase',
        variant === 'default' && 'border-[#1F1F23] bg-[#1F1F23] text-[#A1A1AA]',
        variant === 'outline' && 'border-[#3B82F6]/40 bg-transparent text-[#3B82F6]',
        variant === 'risk' && risk && riskBg(risk),
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
