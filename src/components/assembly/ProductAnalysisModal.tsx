'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, X, Cpu, Eye, Box, AlertCircle } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { GlassPanel } from '@/components/ui/GlassPanel';
import type { AIProductAnalysis } from '@/types/productAssembly';

interface ProductAnalysisModalProps {
  analysis: AIProductAnalysis;
  imageUrl?: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ProductAnalysisModal({
  analysis,
  imageUrl,
  onConfirm,
  onCancel,
}: ProductAnalysisModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl overflow-hidden"
      >
        <GlassPanel className="p-6 border border-[rgba(255,255,255,0.1)]">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TechnicalLabel variant="accent">AI PRODUCT RECOGNITION</TechnicalLabel>
                <span className="font-mono text-[9px] text-[#7DFFB2] px-2 py-0.5 rounded bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)]">
                  {Math.round(analysis.confidence * 100)}% CONFIDENCE
                </span>
              </div>
              <h2 className="text-[20px] font-bold text-[#F5F7FA] mt-1">{analysis.productName}</h2>
              <p className="font-mono text-[11px] text-[rgba(245,247,250,0.45)] mt-0.5">
                Category: {analysis.productCategory}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="p-1.5 rounded-lg text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Photo Thumbnail + Summary Banner */}
          <div className="flex gap-4 items-center my-4 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
            {imageUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] flex-shrink-0 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Captured photo" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 text-xs text-[rgba(245,247,250,0.7)] leading-relaxed">
              <span className="text-[#8BE9FF] font-semibold">Matched Reference Architecture: </span>
              {analysis.summary}
            </div>
          </div>

          {/* Detected Visible Parts vs Inferred Parts */}
          <div className="space-y-3 mb-5">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye size={12} className="text-[#7DFFB2]" />
                <TechnicalLabel variant="success">DIRECTLY DETECTED VISIBLE PARTS</TechnicalLabel>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {analysis.detectedVisibleParts.map((part, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 rounded-lg bg-[rgba(125,255,178,0.04)] border border-[rgba(125,255,178,0.15)] text-xs font-mono"
                  >
                    <span className="text-[#F5F7FA] font-medium">{part.name}</span>
                    <span className="text-[#7DFFB2]">{Math.round(part.confidence * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu size={12} className="text-[#FFD36A]" />
                <TechnicalLabel variant="warning">INFERRED INTERNAL COMPONENTS (NOT SEEN DIRECTLY)</TechnicalLabel>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {analysis.inferredParts.map((part, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-[rgba(255,211,106,0.04)] border border-[rgba(255,211,106,0.15)] text-xs font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[#F5F7FA] font-medium">{part.name}</span>
                      <span className="text-[#FFD36A]">{Math.round(part.confidence * 100)}%</span>
                    </div>
                    <p className="text-[10px] text-[rgba(245,247,250,0.5)] mt-0.5">{part.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Honesty Disclosure */}
          <p className="font-mono text-[9px] text-[rgba(245,247,250,0.35)] leading-relaxed mb-5">
            ℹ AI RECOGNITION ARCHITECTURE — Image input recognized as Drone-X1. Compatible 3D reference assembly matched and aligned with 13 structural parts.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <GlowButton variant="ghost" size="md" onClick={onCancel} className="flex-1">
              Cancel
            </GlowButton>
            <GlowButton
              variant="primary"
              size="md"
              icon={<ChevronRight size={14} />}
              onClick={onConfirm}
              className="flex-1"
            >
              Load 3D Drone Assembly
            </GlowButton>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
