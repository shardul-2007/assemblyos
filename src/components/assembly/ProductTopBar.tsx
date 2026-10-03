'use client';
import Link from 'next/link';
import {
  Camera,
  Layers,
  FileDown,
  RefreshCw,
  Undo2,
  Redo2,
  Activity,
  Maximize2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { AssemblyOSLogo } from '@/components/ui/AssemblyOSLogo';
import { StatusDot } from '@/components/ui/StatusDot';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import { cn } from '@/lib/utils';

export function ProductTopBar() {
  const {
    currentAssembly,
    explodedProgress,
    setExplodedProgress,
    toggleExploded,
    isExploded,
    mode,
    setMode,
    showSourceOverlay,
    toggleSourceOverlay,
    showGraphView,
    toggleGraphView,
    evidenceMode,
    toggleEvidenceMode,
    undo,
    redo,
    historyIndex,
    history,
    resetAssembly,
    openCamera,
    openExportModal,
    parts,
  } = useProductAssemblyStore();

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <header className="flex items-center justify-between px-4 h-14 border-b border-[rgba(255,255,255,0.06)] bg-[#050607]/90 backdrop-blur-xl z-30 select-none">
      {/* Left: Brand + Product Identity */}
      <div className="flex items-center gap-3.5">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <AssemblyOSLogo size={24} />
        </Link>

        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />

        <div>
          <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)] block leading-none">
            3D MECHANICAL PRODUCT
          </span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[13px] font-bold text-[#F5F7FA] leading-none">
              {currentAssembly.name}
            </span>
            <span className="font-mono text-[10px] text-[#8BE9FF] bg-[rgba(139,233,255,0.1)] px-1.5 py-0.5 rounded">
              {parts.length} PARTS
            </span>
          </div>
        </div>
      </div>

      {/* Center: Reorganized Workflow Actions (Capture is Primary) */}
      <nav className="hidden md:flex items-center gap-1.5 bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-1 rounded-xl">
        {/* PRIMARY ACTION: CAPTURE WITH CAMERA */}
        <button
          onClick={openCamera}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#8BE9FF] text-[#050607] font-semibold text-xs tracking-wider uppercase transition-colors hover:bg-white shadow-[0_0_15px_rgba(139,233,255,0.3)]"
        >
          <Camera size={13} />
          <span>Capture Product</span>
        </button>

        {/* Explode / Collapse Toggle */}
        <button
          onClick={toggleExploded}
          className={cn(
            'flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
            isExploded
              ? 'bg-[rgba(139,233,255,0.15)] text-[#8BE9FF] border border-[rgba(139,233,255,0.3)] font-bold'
              : 'text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
          )}
        >
          <Layers size={13} />
          <span>{isExploded ? 'Collapse' : 'Explode'}</span>
        </button>

        {/* 2D Perception / Source Photo Toggle */}
        <button
          onClick={toggleSourceOverlay}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
            showSourceOverlay
              ? 'bg-[rgba(139,233,255,0.15)] text-[#8BE9FF] border border-[rgba(139,233,255,0.3)] font-bold'
              : 'text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
          )}
          title="Toggle 2D Image Annotations & Perception Overlay"
        >
          <ImageIcon size={13} />
          <span>2D Perception</span>
        </button>

        {/* Machine Dependency Graph Toggle */}
        <button
          onClick={toggleGraphView}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
            showGraphView
              ? 'bg-[rgba(139,233,255,0.15)] text-[#8BE9FF] border border-[rgba(139,233,255,0.3)] font-bold'
              : 'text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
          )}
          title="Toggle Machine Dependency & Functional Graph"
        >
          <Activity size={13} />
          <span>Graph</span>
        </button>

        {/* Evidence Mode Toggle */}
        <button
          onClick={toggleEvidenceMode}
          className={cn(
            'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
            evidenceMode
              ? 'bg-[rgba(255,211,106,0.15)] text-[#FFD36A] border border-[rgba(255,211,106,0.3)] font-bold'
              : 'text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
          )}
          title="Highlight Visible vs Inferred Parts"
        >
          <Sparkles size={13} />
          <span>Evidence</span>
        </button>

        {/* How It Works Mode Toggle */}
        <button
          onClick={() => setMode(mode === 'how-it-works' ? 'inspect' : 'how-it-works')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all',
            mode === 'how-it-works'
              ? 'bg-[rgba(125,255,178,0.15)] text-[#7DFFB2] border border-[rgba(125,255,178,0.3)] font-bold'
              : 'text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)]'
          )}
        >
          <Activity size={13} />
          <span>Flow</span>
        </button>

        {/* Export Assembly Report */}
        <button
          onClick={openExportModal}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-[rgba(245,247,250,0.7)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] transition-colors"
        >
          <FileDown size={13} />
          <span>Export</span>
        </button>
      </nav>

      {/* Right: Undo/Redo & Assembly Controls */}
      <div className="flex items-center gap-2">
        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className="p-2 rounded-lg border border-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.6)] hover:text-[#8BE9FF] disabled:opacity-30 disabled:hover:text-[rgba(245,247,250,0.6)] transition-colors"
          title="Undo Assembly Change (Ctrl+Z)"
        >
          <Undo2 size={13} />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className="p-2 rounded-lg border border-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.6)] hover:text-[#8BE9FF] disabled:opacity-30 disabled:hover:text-[rgba(245,247,250,0.6)] transition-colors"
          title="Redo Assembly Change (Ctrl+Shift+Z)"
        >
          <Redo2 size={13} />
        </button>

        {/* Reset */}
        <button
          onClick={resetAssembly}
          className="p-2 rounded-lg border border-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] transition-colors"
          title="Reset Assembly"
        >
          <RefreshCw size={13} />
        </button>

        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)] hidden sm:block" />

        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
          <StatusDot status="online" size="sm" label="ASSEMBLY READY" />
        </div>
      </div>
    </header>
  );
}
