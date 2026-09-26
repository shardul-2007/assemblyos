'use client';
import { motion } from 'framer-motion';

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export function AssemblyOSLogo({ size = 32, showText = true, className }: LogoProps) {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className ?? ''}`}>
      {/* Geometric A logo */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        aria-label="AssemblyOS logo"
      >
        {/* Left stroke of A */}
        <line
          x1="4"
          y1="28"
          x2="16"
          y2="4"
          stroke="#8BE9FF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Right stroke of A */}
        <line
          x1="16"
          y1="4"
          x2="28"
          y2="28"
          stroke="#8BE9FF"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Crossbar */}
        <line
          x1="9"
          y1="19"
          x2="23"
          y2="19"
          stroke="rgba(139,233,255,0.5)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        {/* Animated node at apex */}
        <motion.circle
          cx="16"
          cy="4"
          r="2.5"
          fill="#8BE9FF"
          animate={{ opacity: [1, 0.4, 1], r: [2.5, 3.5, 2.5] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        />
        {/* Secondary nodes at base */}
        <circle cx="4" cy="28" r="1.5" fill="rgba(139,233,255,0.4)" />
        <circle cx="28" cy="28" r="1.5" fill="rgba(139,233,255,0.4)" />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className="text-[13px] font-bold tracking-[0.15em] uppercase text-[#F5F7FA]"
            style={{ fontFamily: 'var(--font-geist, sans-serif)' }}
          >
            ASSEMBLY
            <span className="text-[#8BE9FF]">OS</span>
          </span>
        </div>
      )}
    </div>
  );
}
