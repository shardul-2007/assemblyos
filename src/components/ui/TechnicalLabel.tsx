import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface TechnicalLabelProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'danger';
}

const variants = {
  default: 'text-[rgba(245,247,250,0.38)]',
  accent:  'text-[#8BE9FF]',
  success: 'text-[#7DFFB2]',
  warning: 'text-[#FFD36A]',
  danger:  'text-[#FF7F8A]',
};

export function TechnicalLabel({
  children,
  className,
  variant = 'default',
}: TechnicalLabelProps) {
  return (
    <span
      className={cn(
        'font-mono text-[10px] uppercase tracking-[0.1em]',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
