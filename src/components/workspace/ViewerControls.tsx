'use client';
import { useState } from 'react';
import { useAssemblyStore } from '@/store/assemblyStore';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import {
  Grid3x3, Layers, Eye, Maximize2, Camera,
  RefreshCw, ScanLine, Tag, ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewerControlsProps {
  showGrid: boolean;
  setShowGrid: (v: boolean) => void;
  wireframe: boolean;
  setWireframe: (v: boolean) => void;
  showLabels: boolean;
  setShowLabels: (v: boolean) => void;
  onScreenshot?: () => void;
  onFullscreen?: () => void;
}

export function ViewerControls({
  showGrid, setShowGrid,
  wireframe, setWireframe,
  showLabels, setShowLabels,
  onScreenshot,
  onFullscreen,
}: ViewerControlsProps) {
  const { toggleExploded, isExploded, explodedProgress, setExplodedProgress, resetAssembly } = useAssemblyStore();

  const ControlBtn = ({
    active, onClick, icon, label, title,
  }: { active?: boolean; onClick: () => void; icon: React.ReactNode; label: string; title?: string }) => (
    <button
      onClick={onClick}
      title={title ?? label}
      aria-label={label}
      aria-pressed={active}
      className={cn(
        'flex flex-col items-center gap-1 px-2.5 py-1.5 rounded-xl transition-all duration-150 text-center min-w-[44px]',
        active
          ? 'bg-[rgba(139,233,255,0.12)] text-[#8BE9FF] border border-[rgba(139,233,255,0.3)]'
          : 'text-[rgba(245,247,250,0.45)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
      )}
    >
      <span className="text-current">{icon}</span>
      <span className="font-mono text-[8px] uppercase tracking-widest leading-none">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col gap-3">
      {/* Mode controls */}
      <div
        className="rounded-2xl p-1.5 flex flex-col gap-0.5"
        style={{ background: 'rgba(5,6,7,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
      >
        <ControlBtn active={isExploded} onClick={toggleExploded} icon={<Layers size={14} />} label="Explode" />
        <ControlBtn active={wireframe} onClick={() => setWireframe(!wireframe)} icon={<ScanLine size={14} />} label="X-Ray" />
        <ControlBtn active={showGrid} onClick={() => setShowGrid(!showGrid)} icon={<Grid3x3 size={14} />} label="Grid" />
        <ControlBtn active={showLabels} onClick={() => setShowLabels(!showLabels)} icon={<Tag size={14} />} label="Labels" />
        <div className="h-px bg-[rgba(255,255,255,0.06)] my-1" />
        <ControlBtn onClick={() => resetAssembly()} icon={<RefreshCw size={14} />} label="Reset" />
        <ControlBtn onClick={onScreenshot ?? (() => {})} icon={<Camera size={14} />} label="Snap" />
        <ControlBtn onClick={onFullscreen ?? (() => {})} icon={<Maximize2 size={14} />} label="Full" />
      </div>

      {/* Explode slider */}
      <div
        className="rounded-2xl p-3"
        style={{ background: 'rgba(5,6,7,0.8)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)', writingMode: 'vertical-lr' }}
      >
        <div style={{ writingMode: 'horizontal-tb' }} className="flex flex-col items-center gap-2">
          <span className="font-mono text-[8px] uppercase tracking-widest text-[#8BE9FF]">EXPLODED</span>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(explodedProgress * 100)}
            onChange={(e) => setExplodedProgress(Number(e.target.value) / 100)}
            aria-label="Explode progress"
            className="w-full h-1 appearance-none rounded-full cursor-pointer"
            style={{
              background: `linear-gradient(to right, #8BE9FF ${explodedProgress * 100}%, rgba(255,255,255,0.1) ${explodedProgress * 100}%)`,
              accentColor: '#8BE9FF',
            }}
          />
          <span className="font-mono text-[8px] uppercase tracking-widest text-[rgba(245,247,250,0.3)]">ASSEMBLED</span>
        </div>
      </div>
    </div>
  );
}
