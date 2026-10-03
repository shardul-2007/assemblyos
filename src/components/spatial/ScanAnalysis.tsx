'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader } from 'lucide-react';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';

const ANALYSIS_STAGES = [
  'Image received',
  'Detecting objects',
  'Identifying equipment',
  'Reading visible labels',
  'Estimating spatial relationships',
  'Building semantic scene',
  'Updating digital twin',
];

interface ScanAnalysisProps {
  onComplete: () => void;
  isDemo?: boolean;
}

export function ScanAnalysis({ onComplete, isDemo = true }: ScanAnalysisProps) {
  const [stageIdx, setStageIdx] = useState(0);

  useEffect(() => {
    if (stageIdx >= ANALYSIS_STAGES.length) {
      const t = setTimeout(onComplete, 400);
      return () => clearTimeout(t);
    }
    const delay = stageIdx === 0 ? 300 : 500 + Math.random() * 300;
    const t = setTimeout(() => setStageIdx((i) => i + 1), delay);
    return () => clearTimeout(t);
  }, [stageIdx, onComplete]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-6 rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[#080b0f] shadow-2xl"
      >
        <div className="text-center mb-6">
          <TechnicalLabel className="block mb-1.5" variant={isDemo ? 'warning' : 'accent'}>
            {isDemo ? 'DEMO ANALYSIS' : 'AI VISION ANALYSIS'}
          </TechnicalLabel>
          <h3 className="text-[20px] font-bold text-[#F5F7FA]">ANALYZING SPACE</h3>
          {isDemo && (
            <p className="font-mono text-[11px] text-[rgba(245,247,250,0.4)] mt-1">
              Deterministic local analysis — no external API key required
            </p>
          )}
        </div>

        <div className="space-y-3 mb-6">
          {ANALYSIS_STAGES.map((stage, i) => (
            <motion.div
              key={stage}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: i <= stageIdx ? 1 : 0.2, x: 0 }}
              transition={{ delay: i * 0.04, duration: 0.25 }}
              className="flex items-center gap-3"
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                {i < stageIdx ? (
                  <CheckCircle2 size={16} className="text-[#7DFFB2]" />
                ) : i === stageIdx ? (
                  <Loader size={16} className="text-[#8BE9FF] animate-spin" />
                ) : (
                  <div className="w-3 h-3 rounded-full border border-[rgba(255,255,255,0.15)]" />
                )}
              </div>
              <span
                className="text-[13px] font-mono tracking-wide"
                style={{
                  color:
                    i < stageIdx
                      ? '#7DFFB2'
                      : i === stageIdx
                      ? '#F5F7FA'
                      : 'rgba(245,247,250,0.25)',
                }}
              >
                {i < stageIdx ? '✓ ' : ''}{stage}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Progress meter */}
        <div className="w-full h-1.5 rounded-full bg-[rgba(255,255,255,0.06)] overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #7DFFB2, #8BE9FF)' }}
            animate={{ width: `${Math.min(100, ((stageIdx + 1) / ANALYSIS_STAGES.length) * 100)}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>
    </div>
  );
}
