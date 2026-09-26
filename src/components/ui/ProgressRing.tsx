'use client';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
}

export function ProgressRing({
  progress,
  size = 60,
  strokeWidth = 3,
  color = '#8BE9FF',
  label,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      {label && (
        <span
          className="absolute font-mono text-[10px] text-[rgba(245,247,250,0.7)]"
          style={{ fontSize: size < 50 ? 8 : 10 }}
        >
          {label}
        </span>
      )}
    </div>
  );
}
