'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, X } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { GlassPanel } from '@/components/ui/GlassPanel';
import type { Detection } from '@/types/spatial';
import { CATEGORY_META } from '@/data/demoSpace';
import { cn } from '@/lib/utils';

interface DetectionReviewProps {
  detections: Detection[];
  onConfirm: (confirmedIds: string[]) => void;
  onCancel: () => void;
  isDemo?: boolean;
}

export function DetectionReview({ detections, onConfirm, onCancel, isDemo = true }: DetectionReviewProps) {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(detections.map((d) => [d.id, !d.isRejected]))
  );

  const toggle = (id: string) => setStates((s) => ({ ...s, [id]: !s[id] }));
  const selectAll = () => setStates(Object.fromEntries(detections.map((d) => [d.id, true])));
  const deselectAll = () => setStates(Object.fromEntries(detections.map((d) => [d.id, false])));
  const confirmedCount = Object.values(states).filter(Boolean).length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <GlassPanel className="overflow-hidden border border-[rgba(255,255,255,0.1)]">
          {/* Header */}
          <div className="px-5 py-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
            <div className="flex items-center justify-between">
              <div>
                <TechnicalLabel variant={isDemo ? 'warning' : 'accent'}>
                  {isDemo ? 'DEMO DETECTIONS' : 'AI VISION DETECTIONS'}
                </TechnicalLabel>
                <h3 className="text-[17px] font-bold text-[#F5F7FA] mt-0.5">
                  REVIEW DETECTIONS
                </h3>
                <p className="text-[12px] text-[rgba(245,247,250,0.45)] mt-0.5">
                  Confirm the detected objects before adding them to your Digital Twin.
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-1.5 rounded-lg text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[rgba(255,255,255,0.04)]">
              <div className="flex gap-3">
                <button onClick={selectAll} className="font-mono text-[10px] text-[#8BE9FF] hover:underline uppercase tracking-wider">
                  Select All
                </button>
                <button onClick={deselectAll} className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] hover:underline uppercase tracking-wider">
                  Deselect All
                </button>
              </div>
              <span className="font-mono text-[11px] font-bold text-[#8BE9FF]">
                {confirmedCount} of {detections.length} selected
              </span>
            </div>
          </div>

          {/* Detections List */}
          <div className="max-h-80 overflow-y-auto px-4 py-3 space-y-1.5">
            {detections.map((det) => {
              const meta = CATEGORY_META[det.category] ?? CATEGORY_META.other;
              const checked = states[det.id] ?? false;
              return (
                <div
                  key={det.id}
                  onClick={() => toggle(det.id)}
                  className={cn(
                    'w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-150 cursor-pointer border',
                    checked
                      ? 'bg-[rgba(139,233,255,0.06)] border-[rgba(139,233,255,0.25)]'
                      : 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.04)] opacity-40'
                  )}
                >
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-colors"
                    style={{
                      background: checked ? 'rgba(139,233,255,0.2)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${checked ? '#8BE9FF' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    {checked && <CheckCircle2 size={12} className="text-[#8BE9FF]" />}
                  </div>
                  <span className="text-base select-none" style={{ color: meta.color }}>
                    {meta.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-semibold text-[#F5F7FA] truncate">{det.name}</div>
                    <div className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] uppercase tracking-wider">
                      {meta.label}
                    </div>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span
                      className="font-mono text-[11px] font-bold"
                      style={{
                        color:
                          det.confidence >= 0.9
                            ? '#7DFFB2'
                            : det.confidence >= 0.75
                            ? '#FFD36A'
                            : '#FF7F8A',
                      }}
                    >
                      {Math.round(det.confidence * 100)}%
                    </span>
                    <span className="font-mono text-[8px] uppercase tracking-widest text-[rgba(245,247,250,0.3)]">
                      CONFIDENCE
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] flex gap-3">
            <GlowButton variant="ghost" size="md" onClick={onCancel} className="flex-1">
              Cancel
            </GlowButton>
            <GlowButton
              variant="primary"
              size="md"
              onClick={() => onConfirm(detections.filter((d) => states[d.id]).map((d) => d.id))}
              disabled={confirmedCount === 0}
              className="flex-1"
              icon={<ChevronRight size={14} />}
            >
              Add to Digital Twin
            </GlowButton>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
