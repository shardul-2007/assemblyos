'use client';
import { useState } from 'react';
import Link from 'next/link';
import {
  Camera, Upload, Sparkles, Layers, FileDown, Eye, RefreshCw,
  Search, ShieldCheck, Grid, Tag, HelpCircle
} from 'lucide-react';
import { AssemblyOSLogo } from '@/components/ui/AssemblyOSLogo';
import { GlowButton } from '@/components/ui/GlowButton';
import { StatusDot } from '@/components/ui/StatusDot';
import { useSpatialStore } from '@/store/spatialStore';
import { cn } from '@/lib/utils';

export function SpatialTopBar() {
  const {
    space,
    scene,
    setSceneMode,
    setShowGrid,
    setShowLabels,
    openCamera,
    openScanFlow,
    openExportPanel,
    resetScene,
    objects,
  } = useSpatialStore();

  const isSemantic = scene.mode === 'semantic';

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-[rgba(255,255,255,0.06)] bg-[#050607]/90 backdrop-blur-xl z-30 select-none">
      {/* Left: Brand + Active Space Identity */}
      <div className="flex items-center gap-3.5">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <AssemblyOSLogo size={24} />
        </Link>

        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />

        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)] block leading-none">
            ACTIVE DIGITAL TWIN
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[13px] font-bold text-[#F5F7FA] leading-none">
              {space.name}
            </span>
            <span className="font-mono text-[10px] text-[#8BE9FF] bg-[rgba(139,233,255,0.1)] px-1.5 py-0.5 rounded">
              {objects.length} OBJ
            </span>
          </div>
        </div>
      </div>

      {/* Center: Reorganized Workflow Actions (Capture is Primary) */}
      <nav className="hidden md:flex items-center gap-1 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-1 rounded-xl">
        {/* PRIMARY ACTION: CAPTURE */}
        <button
          onClick={() => openCamera()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#8BE9FF] text-[#050607] font-semibold text-xs tracking-wider uppercase transition-colors hover:bg-white shadow-[0_0_15px_rgba(139,233,255,0.3)]"
        >
          <Camera size={13} />
          <span>Capture</span>
        </button>

        {/* Scan Workflow */}
        <button
          onClick={() => openScanFlow()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <Sparkles size={13} className="text-[#7DFFB2]" />
          <span>Scan</span>
        </button>

        {/* Semantic Twin Mode toggle */}
        <button
          onClick={() => setSceneMode(isSemantic ? 'normal' : 'semantic')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
            isSemantic
              ? 'bg-[rgba(139,233,255,0.15)] text-[#8BE9FF] border border-[rgba(139,233,255,0.3)]'
              : 'text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
          )}
        >
          <Layers size={13} />
          <span>Semantic Twin</span>
        </button>

        {/* Export Report */}
        <button
          onClick={() => openExportPanel()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <FileDown size={13} />
          <span>Export</span>
        </button>
      </nav>

      {/* Right: Scene view helpers & Status */}
      <div className="flex items-center gap-2.5">
        {/* Toggle Grid */}
        <button
          onClick={() => setShowGrid(!scene.showGrid)}
          className={cn(
            'p-2 rounded-lg border text-xs transition-colors',
            scene.showGrid
              ? 'border-[rgba(139,233,255,0.3)] bg-[rgba(139,233,255,0.1)] text-[#8BE9FF]'
              : 'border-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]'
          )}
          title="Toggle Grid"
          aria-label="Toggle Grid"
        >
          <Grid size={14} />
        </button>

        {/* Reset Camera / Scene */}
        <button
          onClick={resetScene}
          className="p-2 rounded-lg border border-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.04)] transition-colors"
          title="Reset Scene"
          aria-label="Reset Scene"
        >
          <RefreshCw size={14} />
        </button>

        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)] hidden sm:block" />

        {/* Status Indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
          <StatusDot status="online" size="sm" label="LIVE TWIN" />
        </div>
      </div>
    </header>
  );
}
