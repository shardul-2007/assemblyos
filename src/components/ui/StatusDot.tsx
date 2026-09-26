import { cn } from '@/lib/utils';

interface StatusDotProps {
  status: 'online' | 'offline' | 'warning' | 'processing';
  label?: string;
  size?: 'sm' | 'md';
}

const colors = {
  online:     'bg-[#7DFFB2] shadow-[0_0_6px_rgba(125,255,178,0.6)]',
  offline:    'bg-[rgba(245,247,250,0.22)]',
  warning:    'bg-[#FFD36A] shadow-[0_0_6px_rgba(255,211,106,0.6)]',
  processing: 'bg-[#8BE9FF] shadow-[0_0_6px_rgba(139,233,255,0.6)]',
};

export function StatusDot({ status, label, size = 'md' }: StatusDotProps) {
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn(
          'rounded-full flex-shrink-0',
          dotSize,
          colors[status],
          status === 'processing' && 'animate-pulse'
        )}
        aria-hidden
      />
      {label && (
        <span
          className={cn(
            'font-mono uppercase tracking-widest',
            size === 'sm' ? 'text-[10px]' : 'text-[11px]',
            status === 'online' && 'text-[#7DFFB2]',
            status === 'offline' && 'text-[rgba(245,247,250,0.38)]',
            status === 'warning' && 'text-[#FFD36A]',
            status === 'processing' && 'text-[#8BE9FF]'
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
