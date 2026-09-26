'use client';
import { cn } from '@/lib/utils';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { type ReactNode } from 'react';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
  glow?: boolean;
}

export function GlassPanel({
  children,
  className,
  size = 'md',
  animate = false,
  glow = false,
  ...props
}: GlassPanelProps) {
  const sizeClass = size === 'sm' ? 'glass-sm' : 'glass';

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(sizeClass, glow && 'glow-accent', className)}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ borderColor: 'rgba(255,255,255,0.14)' }}
      transition={{ duration: 0.2 }}
      className={cn(sizeClass, glow && 'glow-accent', className)}
      {...(props as HTMLMotionProps<'div'>)}
    >
      {children}
    </motion.div>
  );
}
