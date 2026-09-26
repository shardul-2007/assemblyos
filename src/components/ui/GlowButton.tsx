'use client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: ReactNode;
}

const variants = {
  primary:
    'bg-[#8BE9FF] text-[#050607] font-semibold hover:bg-white shadow-[0_0_20px_rgba(139,233,255,0.3)]',
  secondary:
    'bg-transparent border border-[rgba(255,255,255,0.18)] text-[#F5F7FA] hover:border-[rgba(139,233,255,0.5)] hover:text-[#8BE9FF]',
  ghost:
    'bg-transparent text-[rgba(245,247,250,0.58)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]',
  danger:
    'bg-transparent border border-[rgba(255,127,138,0.4)] text-[#FF7F8A] hover:bg-[rgba(255,127,138,0.1)]',
};

const sizes = {
  sm: 'h-8 px-3 text-xs rounded-lg gap-1.5',
  md: 'h-10 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-sm rounded-xl gap-2',
};

export function GlowButton({
  children,
  variant = 'secondary',
  size = 'md',
  loading = false,
  icon,
  className,
  disabled,
  ...props
}: GlowButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15 }}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors duration-200',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className
      )}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading ? (
        <span className="flex gap-1 items-center">
          <span className="typing-dot w-1 h-1 rounded-full bg-current" />
          <span className="typing-dot w-1 h-1 rounded-full bg-current" />
          <span className="typing-dot w-1 h-1 rounded-full bg-current" />
        </span>
      ) : (
        <>
          {icon && <span>{icon}</span>}
          {children}
        </>
      )}
    </motion.button>
  );
}
