import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatDuration(startedAt: Date, finishedAt: Date): string {
  const diff = Math.floor((finishedAt.getTime() - startedAt.getTime()) / 1000);
  return formatTime(diff);
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
