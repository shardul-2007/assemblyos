'use client';
import { motion } from 'framer-motion';
import { CheckCircle2, ChevronRight, X, Cpu, Eye, AlertTriangle, Layers, Info } from 'lucide-react';
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
  const hasCompatible3D = analysis.isReferenceMatch && !!analysis.referenceAssemblyId;

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
                {analysis.confidence ? (
                  <span className="font-mono text-[9px] text-[#7DFFB2] px-2 py-0.5 rounded bg-[rgba(125,255,178,0.1)] border border-[rgba(125,255,178,0.2)]">
                    {Math.round(analysis.confidence * 100)}% CONFIDENCE
                  </span>
                ) : (
                  <span className="font-mono text-[9px] text-[rgba(245,247,250,0.4)] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.04)]">
                    CONFIDENCE: NOT AVAILABLE
                  </span>
                )}
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

          {/* Photo Preview + Summary Banner */}
          <div className="flex gap-4 items-center my-4 p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
            {imageUrl && (
              <div className="w-20 h-20 rounded-lg overflow-hidden border border-[rgba(255,255,255,0.1)] flex-shrink-0 bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="Uploaded item" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 text-xs text-[rgba(245,247,250,0.7)] leading-relaxed">
              <span className="text-[#8BE9FF] font-semibold">Vision Synthesis: </span>
              {analysis.summary}
            </div>
          </div>

          {/* Directly Detected Visible Parts */}
          <div className="space-y-3 mb-4">
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Eye size={12} className="text-[#7DFFB2]" />
                <TechnicalLabel variant="success">DIRECTLY DETECTED — VISIBLE PARTS</TechnicalLabel>
              </div>
              <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                {analysis.detectedVisibleParts.map((part, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-2 rounded-lg bg-[rgba(125,255,178,0.04)] border border-[rgba(125,255,178,0.15)] text-xs font-mono"
                  >
                    <span className="text-[#F5F7FA] font-medium">{part.name}</span>
                    <span className="text-[#7DFFB2] text-[10px] font-semibold">● VISIBLE</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inferred Parts (Clearly Marked as NOT Directly Visible) */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <Cpu size={12} className="text-[#FFD36A]" />
                <TechnicalLabel variant="warning">INFERRED — NOT DIRECTLY VISIBLE</TechnicalLabel>
              </div>
              <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                {analysis.inferredParts.map((part, i) => (
                  <div
                    key={i}
                    className="p-2 rounded-lg bg-[rgba(255,211,106,0.04)] border border-[rgba(255,211,106,0.15)] text-xs font-mono"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-[#F5F7FA] font-medium">{part.name}</span>
                      <span className="text-[#FFD36A] text-[10px]">◐ INFERRED</span>
                    </div>
                    <p className="text-[10px] text-[rgba(245,247,250,0.5)] mt-0.5">{part.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 3D Reference Match Status Section */}
          <div className="my-4 p-3 rounded-xl border">
            {hasCompatible3D ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 text-[#8BE9FF] font-mono text-[10px] uppercase font-bold">
                    <CheckCircle2 size={13} />
                    <span>COMPATIBLE 3D REFERENCE FOUND</span>
                  </div>
                  <p className="text-xs text-[rgba(245,247,250,0.7)] mt-0.5">
                    Matched: <span className="font-semibold text-white">Drone-X1 (13 CAD Components)</span>
                  </p>
                </div>
                <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded bg-[rgba(139,233,255,0.15)] text-[#8BE9FF]">
                  CAD READY
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-1.5 text-[#FFD36A] font-mono text-[10px] uppercase font-bold">
                  <AlertTriangle size={13} />
                  <span>NO COMPATIBLE 3D REFERENCE IN LIBRARY</span>
                </div>
                <p className="text-xs text-[rgba(245,247,250,0.65)] mt-1 leading-relaxed">
                  The AI identified this product and mapped its visible and internal parts, but AssemblyOS does not currently have a matching 3D reference CAD model for <span className="font-semibold text-white">{analysis.productName}</span> in the assembly library.
                </p>
              </div>
            )}
          </div>

          {/* Honest Technical Limitation Note */}
          <div className="flex items-start gap-1.5 text-[10px] font-mono text-[rgba(245,247,250,0.4)] leading-relaxed mb-5">
            <Info size={12} className="flex-shrink-0 mt-0.5" />
            <span>
              Image analysis recognizes visible parts and infers internal architecture. 3D geometry loads from verified reference models, not single-photo hallucinated CAD.
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <GlowButton variant="ghost" size="md" onClick={onCancel} className="flex-1">
              {hasCompatible3D ? 'Cancel' : 'Close Analysis'}
            </GlowButton>

            {hasCompatible3D ? (
              <GlowButton
                variant="primary"
                size="md"
                icon={<ChevronRight size={14} />}
                onClick={onConfirm}
                className="flex-1"
              >
                Load 3D Reference Assembly
              </GlowButton>
            ) : (
              <GlowButton
                variant="secondary"
                size="md"
                onClick={onCancel}
                className="flex-1"
              >
                Save Part Analysis
              </GlowButton>
            )}
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
