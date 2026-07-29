import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { RiskLevel } from '@/types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso));
}

export function formatLatency(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export function riskColor(level: RiskLevel): string {
  switch (level) {
    case 'high':   return '#EF4444';
    case 'medium': return '#F59E0B';
    case 'low':    return '#22C55E';
    default:       return '#A1A1AA';
  }
}

export function riskBg(level: RiskLevel): string {
  switch (level) {
    case 'high':   return 'bg-red-500/10 text-red-400 border-red-500/20';
    case 'medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    case 'low':    return 'bg-green-500/10 text-green-400 border-green-500/20';
    default:       return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  }
}

export function riskLabel(level: RiskLevel): string {
  switch (level) {
    case 'high':   return 'HIGH RISK';
    case 'medium': return 'MEDIUM RISK';
    case 'low':    return 'LOW RISK';
    default:       return 'UNKNOWN';
  }
}

export function truncate(str: string, n: number): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
