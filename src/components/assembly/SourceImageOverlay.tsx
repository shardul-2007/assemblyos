'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  Camera,
  Layers,
  Sparkles,
  Maximize2,
  CheckCircle2,
  HelpCircle,
  X,
  Crosshair,
  Filter,
} from 'lucide-react';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import { cn } from '@/lib/utils';
import type { Part } from '@/types/productAssembly';

interface SourceImageOverlayProps {
  onClose?: () => void;
  className?: string;
}

export function SourceImageOverlay({ onClose, className }: SourceImageOverlayProps) {
  const {
    capturedImageUrl,
    capturedImageHint,
    parts,
    selectedPartId,
    selectPart,
    highlightParts,
    openCamera,
  } = useProductAssemblyStore();

  const [hoveredPartId, setHoveredPartId] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'visible' | 'inferred'>('all');
  const [showLabels, setShowLabels] = useState(true);

  // Filter parts with bounding boxes
  const annotatedParts = useMemo(() => {
    return parts.filter((p) => {
      if (!p.boundingBox) return false;
      if (filterMode === 'visible') return p.visibility === 'visible';
      if (filterMode === 'inferred') return p.visibility === 'inferred';
      return true;
    });
  }, [parts, filterMode]);

  const visibleCount = parts.filter((p) => p.visibility === 'visible' && p.boundingBox).length;
  const inferredCount = parts.filter((p) => p.visibility === 'inferred' && p.boundingBox).length;

  return (
    <div
      className={cn(
        'relative flex flex-col h-full bg-[#080b0f] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden shadow-2xl select-none',
        className
      )}
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[#0c1017]/90 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#8BE9FF] animate-pulse" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F5F7FA]">
            2D Perception &amp; Ground Truth
          </span>
          {capturedImageHint && (
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-[rgba(139,233,255,0.1)] text-[#8BE9FF]">
              {capturedImageHint}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Filter Pills */}
          <div className="flex items-center bg-[rgba(255,255,255,0.04)] rounded-lg p-0.5 border border-[rgba(255,255,255,0.06)] text-[9px] font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterMode === 'all'
                  ? 'bg-[#8BE9FF] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#F5F7FA]'
              )}
            >
              ALL ({visibleCount + inferredCount})
            </button>
            <button
              onClick={() => setFilterMode('visible')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterMode === 'visible'
                  ? 'bg-[#7DFFB2] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#7DFFB2]'
              )}
            >
              VIS ({visibleCount})
            </button>
            <button
              onClick={() => setFilterMode('inferred')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterMode === 'inferred'
                  ? 'bg-[#FFD36A] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#FFD36A]'
              )}
            >
              INF ({inferredCount})
            </button>
          </div>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              showLabels
                ? 'border-[#8BE9FF]/40 text-[#8BE9FF] bg-[rgba(139,233,255,0.1)]'
                : 'border-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)]'
            )}
            title="Toggle Annotation Labels"
          >
            <Eye size={12} />
          </button>

          {/* Retake Photo */}
          <button
            onClick={openCamera}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] font-mono text-[9px] uppercase tracking-wider text-[#8BE9FF] transition-colors"
          >
            <Camera size={11} />
            <span>Retake</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Image Container with 2D Bounding Box Overlay */}
      <div className="relative flex-1 w-full h-full bg-[#050607] overflow-hidden flex items-center justify-center">
        {capturedImageUrl ? (
          // Captured Image
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={capturedImageUrl}
            alt="Source Captured Machine"
            className="w-full h-full object-contain pointer-events-none select-none opacity-90"
          />
        ) : (
          // Default Engineering Top-Down Photorealistic Canvas Schematic
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-[#0a0f18] to-[#040609] select-none">
            {/* Tech grid background */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  'radial-gradient(circle, rgba(139,233,255,0.2) 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            />

            {/* Stylized Top-down Drone Graphic */}
            <svg
              viewBox="0 0 1000 1000"
              className="w-[90%] h-[90%] max-w-[540px] max-h-[540px] opacity-75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Circular calibration reticle */}
              <circle cx="500" cy="500" r="420" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 6" />
              <circle cx="500" cy="500" r="280" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="500" cy="500" r="140" stroke="#334155" strokeWidth="1.5" />
              <line x1="500" y1="60" x2="500" y2="940" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
              <line x1="60" y1="500" x2="940" y2="500" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

              {/* Diagonal Carbon Arms */}
              <line x1="230" y1="230" x2="770" y2="770" stroke="#334155" strokeWidth="24" strokeLinecap="round" />
              <line x1="770" y1="230" x2="230" y2="770" stroke="#334155" strokeWidth="24" strokeLinecap="round" />

              {/* Central Frame Plate */}
              <rect x="370" y="320" width="260" height="360" rx="20" fill="#0f172a" stroke="#475569" strokeWidth="4" />
              <rect x="420" y="420" width="160" height="160" rx="8" fill="#1e293b" stroke="#00E5FF" strokeWidth="2" strokeDasharray="4 2" />

              {/* 4 Motors (FL, FR, RL, RR) */}
              <circle cx="230" cy="230" r="68" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="770" cy="230" r="68" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="230" cy="770" r="68" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />
              <circle cx="770" cy="770" r="68" fill="#1e293b" stroke="#38bdf8" strokeWidth="4" />

              {/* Motor Hub Pins */}
              <circle cx="230" cy="230" r="14" fill="#0284c7" />
              <circle cx="770" cy="230" r="14" fill="#0284c7" />
              <circle cx="230" cy="770" r="14" fill="#0284c7" />
              <circle cx="770" cy="770" r="14" fill="#0284c7" />

              {/* Rotor Blade Sweeps */}
              <circle cx="230" cy="230" r="130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
              <circle cx="770" cy="230" r="130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
              <circle cx="230" cy="770" r="130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />
              <circle cx="770" cy="770" r="130" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="6 6" opacity="0.6" />

              {/* Camera Mount at Front */}
              <rect x="460" y="240" width="80" height="70" rx="8" fill="#e11d48" opacity="0.8" />
              <circle cx="500" cy="275" r="18" fill="#fda4af" />

              {/* Battery Strap / Pack */}
              <rect x="420" y="520" width="160" height="200" rx="12" fill="#d97706" opacity="0.85" />
            </svg>
          </div>
        )}

        {/* 2D Bounding Boxes Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-auto">
          {annotatedParts.map((part) => {
            const box = part.boundingBox!;
            const isSelected = selectedPartId === part.id;
            const isHovered = hoveredPartId === part.id;
            const isVisible = part.visibility === 'visible';

            return (
              <motion.div
                key={part.id}
                onClick={(e) => {
                  e.stopPropagation();
                  selectPart(part.id);
                }}
                onMouseEnter={() => {
                  setHoveredPartId(part.id);
                  highlightParts([part.id]);
                }}
                onMouseLeave={() => {
                  setHoveredPartId(null);
                  highlightParts([]);
                }}
                className={cn(
                  'absolute cursor-pointer transition-all duration-150 group rounded',
                  // Visible vs Inferred styling
                  isVisible
                    ? isSelected
                      ? 'border-2 border-[#7DFFB2] bg-[#7DFFB2]/20 shadow-[0_0_20px_rgba(125,255,178,0.5)] z-30'
                      : isHovered
                      ? 'border-2 border-[#8BE9FF] bg-[#8BE9FF]/15 z-20'
                      : 'border border-[#7DFFB2]/50 bg-[#7DFFB2]/5 hover:border-[#8BE9FF]'
                    : isSelected
                    ? 'border-2 border-dashed border-[#FFD36A] bg-[#FFD36A]/20 shadow-[0_0_20px_rgba(255,211,106,0.5)] z-30'
                    : isHovered
                    ? 'border-2 border-dashed border-[#FFD36A] bg-[#FFD36A]/15 z-20'
                    : 'border border-dashed border-[#FFD36A]/50 bg-[#FFD36A]/5 hover:border-[#FFD36A]'
                )}
                style={{
                  left: `${box.x * 100}%`,
                  top: `${box.y * 100}%`,
                  width: `${box.width * 100}%`,
                  height: `${box.height * 100}%`,
                }}
              >
                {/* Corner Targeting Brackets for Selected / Hovered */}
                {(isSelected || isHovered) && (
                  <>
                    <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-current" />
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-current" />
                    <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-current" />
                    <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-current" />
                  </>
                )}

                {/* Floating Tag Label */}
                {showLabels && (
                  <div
                    className={cn(
                      'absolute -top-6 left-0 px-1.5 py-0.5 rounded text-[9px] font-mono whitespace-nowrap pointer-events-none transition-all flex items-center gap-1 shadow-md',
                      isSelected
                        ? 'bg-[#8BE9FF] text-[#050607] font-bold scale-105'
                        : isHovered
                        ? 'bg-[#0f172a] text-[#8BE9FF] border border-[#8BE9FF]/40'
                        : isVisible
                        ? 'bg-[#050607]/80 text-[#7DFFB2] border border-[#7DFFB2]/30 opacity-70 group-hover:opacity-100'
                        : 'bg-[#050607]/80 text-[#FFD36A] border border-[#FFD36A]/30 opacity-70 group-hover:opacity-100'
                    )}
                  >
                    <span>{part.name}</span>
                    <span
                      className={cn(
                        'text-[8px] uppercase px-1 rounded',
                        isVisible ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      )}
                    >
                      {isVisible ? 'VIS' : 'INF'}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Bottom Status & Instructions Readout */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[#080b0f] text-[10px] font-mono z-20">
        <div className="flex items-center gap-2">
          <Crosshair size={12} className="text-[#8BE9FF]" />
          <span className="text-[rgba(245,247,250,0.5)]">
            Click any bounding box to highlight part in 3D
          </span>
        </div>

        {selectedPartId && (
          <div className="flex items-center gap-1.5 text-[#8BE9FF] font-semibold">
            <span>SELECTED:</span>
            <span className="text-white truncate max-w-[120px]">
              {parts.find((p) => p.id === selectedPartId)?.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
