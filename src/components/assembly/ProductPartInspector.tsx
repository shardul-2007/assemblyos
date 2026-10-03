'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Camera,
  Layers,
  Eye,
  EyeOff,
  Maximize2,
  Trash2,
  PlusCircle,
  RefreshCw,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';

export function ProductPartInspector() {
  const {
    selectedPartId,
    parts,
    selectPart,
    removePart,
    reattachPart,
    replacePart,
    isolatePart,
    hidePart,
    showPart,
    isolatedPartId,
    openCamera,
  } = useProductAssemblyStore();

  const [activeTab, setActiveTab] = useState<'specs' | 'connections' | 'replace' | 'photos'>('specs');
  const part = parts.find((p) => p.id === selectedPartId);

  if (!part) return null;

  const isRemoved = part.status === 'removed';
  const isHidden = part.status === 'hidden';
  const isIsolated = isolatedPartId === part.id;

  return (
    <AnimatePresence>
      <motion.aside
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.2 }}
        className="absolute top-0 right-0 bottom-0 w-84 sm:w-96 z-20 flex flex-col border-l border-[rgba(255,255,255,0.08)] bg-[#080b0f]/95 backdrop-blur-2xl shadow-2xl select-none"
      >
        {/* Header */}
        <div className="p-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 pr-3">
              <div className="flex items-center gap-2 mb-1">
                <TechnicalLabel variant="accent">{part.category.toUpperCase()}</TechnicalLabel>
                <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.4)]">
                  {part.visibility === 'visible' ? '● DETECTED' : '◇ INFERRED'}
                </span>
              </div>
              <h2 className="text-[16px] font-bold text-[#F5F7FA] leading-tight truncate">{part.name}</h2>
              <div className="flex items-center gap-2 mt-1.5 font-mono text-[10px]">
                <span className="text-[rgba(245,247,250,0.4)]">Part ID:</span>
                <span className="text-[#8BE9FF] font-semibold">{part.partNumber ?? part.id}</span>
                <span className="mx-1 text-[rgba(245,247,250,0.2)]">|</span>
                <span className={isRemoved ? 'text-[#FF7F8A]' : 'text-[#7DFFB2]'}>
                  {isRemoved ? '✕ Detached' : '✓ Installed'}
                </span>
              </div>
            </div>
            <button
              onClick={() => selectPart(null)}
              className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Primary Mechanical Operations Bar */}
        <div className="grid grid-cols-3 gap-1 p-2.5 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          {/* 1. Remove / Reattach */}
          {isRemoved ? (
            <button
              onClick={() => reattachPart(part.id)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[rgba(125,255,178,0.15)] hover:bg-[rgba(125,255,178,0.25)] border border-[rgba(125,255,178,0.3)] text-[#7DFFB2] font-mono text-[10px] uppercase tracking-wider font-semibold"
            >
              <PlusCircle size={12} />
              Reattach
            </button>
          ) : (
            <button
              onClick={() => removePart(part.id)}
              className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[rgba(255,127,138,0.1)] hover:bg-[rgba(255,127,138,0.2)] border border-[rgba(255,127,138,0.25)] text-[#FF7F8A] font-mono text-[10px] uppercase tracking-wider font-semibold"
            >
              <Trash2 size={12} />
              Remove
            </button>
          )}

          {/* 2. Isolate */}
          <button
            onClick={() => isolatePart(part.id)}
            className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg font-mono text-[10px] uppercase tracking-wider font-semibold border ${
              isIsolated
                ? 'bg-[#8BE9FF] text-[#050607] border-[#8BE9FF]'
                : 'bg-[rgba(255,255,255,0.03)] text-[rgba(245,247,250,0.7)] border-[rgba(255,255,255,0.08)] hover:text-[#8BE9FF]'
            }`}
          >
            <Maximize2 size={12} />
            {isIsolated ? 'Reset' : 'Isolate'}
          </button>

          {/* 3. Hide / Show */}
          <button
            onClick={() => (isHidden ? showPart(part.id) : hidePart(part.id))}
            className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.08)] text-[rgba(245,247,250,0.7)] font-mono text-[10px] uppercase tracking-wider font-semibold"
          >
            {isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
            {isHidden ? 'Show' : 'Hide'}
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-[rgba(255,255,255,0.06)] text-[10px] font-mono uppercase tracking-wider">
          {(['specs', 'connections', 'replace', 'photos'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 transition-colors ${
                activeTab === tab
                  ? 'text-[#8BE9FF] border-b-2 border-[#8BE9FF] font-bold'
                  : 'text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]'
              }`}
            >
              {tab === 'specs' && 'Specs'}
              {tab === 'connections' && 'Links'}
              {tab === 'replace' && 'Swap'}
              {tab === 'photos' && `Photos (${part.photos.length})`}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: SPECS & DEPENDENCIES */}
          {activeTab === 'specs' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] space-y-2 text-xs">
                <TechnicalLabel className="block mb-1">PHYSICAL SPECIFICATIONS</TechnicalLabel>
                <div className="flex justify-between font-mono">
                  <span className="text-[rgba(245,247,250,0.4)]">Material:</span>
                  <span className="text-[#F5F7FA]">{part.material}</span>
                </div>
                {part.dimensions && (
                  <div className="flex justify-between font-mono">
                    <span className="text-[rgba(245,247,250,0.4)]">Dimensions:</span>
                    <span className="text-[#8BE9FF]">{part.dimensions}</span>
                  </div>
                )}
                {part.weight && (
                  <div className="flex justify-between font-mono">
                    <span className="text-[rgba(245,247,250,0.4)]">Weight:</span>
                    <span className="text-[#F5F7FA]">{part.weight}</span>
                  </div>
                )}
                <div className="flex justify-between font-mono">
                  <span className="text-[rgba(245,247,250,0.4)]">Detection:</span>
                  <span className="text-[#7DFFB2]">{Math.round(part.detectionConfidence * 100)}%</span>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
                <TechnicalLabel className="block mb-1">FUNCTIONAL DESCRIPTION</TechnicalLabel>
                <p className="text-xs text-[rgba(245,247,250,0.7)] leading-relaxed">{part.description}</p>
              </div>

              {/* Dependencies Warning if removed */}
              {isRemoved && part.dependencies && part.dependencies.length > 0 && (
                <div className="p-3 rounded-xl bg-[rgba(255,127,138,0.08)] border border-[rgba(255,127,138,0.25)] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#FF7F8A] font-mono text-[10px] uppercase font-bold">
                    <AlertTriangle size={13} />
                    <span>AFFECTED DOWNSTREAM SYSTEMS</span>
                  </div>
                  <p className="text-xs text-[rgba(245,247,250,0.7)]">
                    Detaching this part breaks flight operation for: {part.dependencies.join(', ')}.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CONNECTIONS */}
          {activeTab === 'connections' && (
            <div className="space-y-3">
              <TechnicalLabel className="block">MECHANICAL & ELECTRICAL JOINTS</TechnicalLabel>
              {part.connections.length === 0 ? (
                <p className="text-xs text-[rgba(245,247,250,0.4)] font-mono">No direct joints defined.</p>
              ) : (
                part.connections.map((conn, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] space-y-1"
                  >
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-[#8BE9FF] font-semibold">Join: {conn.targetPartId}</span>
                      <span className="text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.4)]">
                        {conn.type}
                      </span>
                    </div>
                    <p className="text-xs text-[rgba(245,247,250,0.65)]">{conn.description}</p>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: REPLACE / SWAP */}
          {activeTab === 'replace' && (
            <div className="space-y-3">
              <TechnicalLabel className="block">COMPATIBLE REPLACEMENT MODULES</TechnicalLabel>
              {!part.replacementOptions || part.replacementOptions.length === 0 ? (
                <p className="text-xs text-[rgba(245,247,250,0.4)] font-mono">No alternative options defined.</p>
              ) : (
                part.replacementOptions.map((opt, i) => (
                  <div
                    key={i}
                    className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] hover:border-[#8BE9FF] transition-all space-y-2"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-[#F5F7FA]">{opt.name}</h4>
                      <div className="font-mono text-[10px] text-[#8BE9FF] mt-0.5">{opt.partNumber}</div>
                      <p className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] mt-0.5">{opt.specs}</p>
                    </div>
                    <button
                      onClick={() => replacePart(part.id, opt)}
                      className="w-full py-1.5 rounded-lg bg-[rgba(139,233,255,0.12)] hover:bg-[#8BE9FF] text-[#8BE9FF] hover:text-[#050607] font-mono text-[10px] uppercase font-bold tracking-wider transition-colors"
                    >
                      Swap Component
                    </button>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: PART PHOTOS */}
          {activeTab === 'photos' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <TechnicalLabel>ATTACHED PHOTOS ({part.photos.length})</TechnicalLabel>
                <GlowButton variant="secondary" size="sm" icon={<Camera size={12} />} onClick={openCamera}>
                  Photograph
                </GlowButton>
              </div>

              {part.photos.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-[rgba(255,255,255,0.08)] text-center space-y-2">
                  <ImageIcon size={22} className="text-[rgba(245,247,250,0.3)] mx-auto" />
                  <p className="text-xs text-[rgba(245,247,250,0.5)]">
                    No photos attached. Photograph the real component label or serial plate.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {part.photos.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] bg-black"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={part.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] flex gap-2">
          <GlowButton
            variant="secondary"
            size="sm"
            icon={<Camera size={12} />}
            onClick={openCamera}
            className="flex-1"
          >
            Capture Photo of Part
          </GlowButton>
        </div>
      </motion.aside>
    </AnimatePresence>
  );
}
