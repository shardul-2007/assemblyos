'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { Upload, FileBox, CheckCircle2, Loader, AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const ACCEPTED = ['.glb', '.gltf', '.obj', '.stl'];

type Phase = 'idle' | 'uploading' | 'analyzing' | 'ready' | 'error';

const ANALYSIS_STAGES = [
  'Component Detection',
  'Geometry Analysis',
  'Assembly Graph',
  'Guidance Generation',
];

export function ImportModel() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [stageIdx, setStageIdx] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const processFile = useCallback(async (f: File) => {
    setFile(f);
    setPhase('uploading');
    await new Promise((r) => setTimeout(r, 800));
    setPhase('analyzing');

    for (let i = 0; i < ANALYSIS_STAGES.length; i++) {
      setStageIdx(i);
      await new Promise((r) => setTimeout(r, 900 + Math.random() * 500));
    }

    setPhase('ready');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) processFile(f);
  }, [processFile]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  }, [processFile]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <GlassPanel className="w-full max-w-lg p-8" animate>
        {/* Header */}
        <div className="text-center mb-8">
          <TechnicalLabel className="mb-2 block">Import Model</TechnicalLabel>
          <h2 className="text-[24px] font-bold text-[#F5F7FA]">Drop Your Model</h2>
          <p className="text-[13px] text-[rgba(245,247,250,0.45)] mt-2">
            Upload a GLB, GLTF, OBJ or STL model to begin.
          </p>
        </div>

        {/* Idle / Drop zone */}
        {phase === 'idle' && (
          <label
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex flex-col items-center justify-center gap-4 p-10 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-[#8BE9FF] bg-[rgba(139,233,255,0.06)]'
                : 'border-[rgba(255,255,255,0.12)] hover:border-[rgba(255,255,255,0.22)] bg-[rgba(255,255,255,0.02)]'
            }`}
          >
            <input type="file" accept={ACCEPTED.join(',')} onChange={handleInput} className="sr-only" />
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${dragOver ? 'bg-[rgba(139,233,255,0.15)]' : 'bg-[rgba(255,255,255,0.05)]'} transition-colors`}>
              <Upload size={22} className={dragOver ? 'text-[#8BE9FF]' : 'text-[rgba(245,247,250,0.4)]'} />
            </div>
            <div className="text-center">
              <div className="text-[14px] font-semibold text-[rgba(245,247,250,0.8)]">
                {dragOver ? 'Drop to upload' : 'Drag & drop or click to browse'}
              </div>
              <div className="font-mono text-[11px] text-[rgba(245,247,250,0.35)] mt-1 uppercase tracking-widest">
                {ACCEPTED.join('  ')}
              </div>
            </div>
          </label>
        )}

        {/* Uploading */}
        {phase === 'uploading' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <Loader size={28} className="text-[#8BE9FF] animate-spin" />
            <div className="text-center">
              <div className="font-mono text-[12px] text-[#8BE9FF] uppercase tracking-widest">Uploading...</div>
              <div className="text-[11px] text-[rgba(245,247,250,0.4)] mt-1">{file?.name}</div>
            </div>
          </div>
        )}

        {/* Analyzing */}
        {phase === 'analyzing' && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-2 mb-4">
              <Loader size={14} className="text-[#8BE9FF] animate-spin" />
              <span className="font-mono text-[11px] text-[#8BE9FF] uppercase tracking-widest">Analyzing Model...</span>
            </div>
            {ANALYSIS_STAGES.map((stage, i) => (
              <div key={stage} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                  i < stageIdx ? 'bg-[rgba(125,255,178,0.15)]' :
                  i === stageIdx ? 'bg-[rgba(139,233,255,0.15)] animate-pulse' :
                  'bg-[rgba(255,255,255,0.04)]'
                }`}>
                  {i < stageIdx
                    ? <CheckCircle2 size={12} className="text-[#7DFFB2]" />
                    : i === stageIdx
                    ? <Loader size={12} className="text-[#8BE9FF] animate-spin" />
                    : <div className="w-1.5 h-1.5 rounded-full bg-[rgba(255,255,255,0.15)]" />}
                </div>
                <span className={`font-mono text-[11px] uppercase tracking-widest ${
                  i <= stageIdx ? 'text-[rgba(245,247,250,0.7)]' : 'text-[rgba(245,247,250,0.25)]'
                }`}>{stage}</span>
              </div>
            ))}
          </div>
        )}

        {/* Ready */}
        {phase === 'ready' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 py-4"
          >
            <div className="w-16 h-16 rounded-2xl bg-[rgba(125,255,178,0.12)] border border-[rgba(125,255,178,0.3)] flex items-center justify-center">
              <CheckCircle2 size={28} className="text-[#7DFFB2]" />
            </div>
            <div className="text-center">
              <div className="font-mono text-[13px] font-bold text-[#7DFFB2] uppercase tracking-widest">Model Ready</div>
              <div className="text-[11px] text-[rgba(245,247,250,0.45)] mt-1">{file?.name}</div>
              <p className="text-[11px] text-[rgba(245,247,250,0.4)] mt-3 max-w-[300px] mx-auto">
                Note: For the MVP demo, the DRONE-X1 procedural model will be used in the workspace.
              </p>
            </div>
            <Link href="/workspace/demo" className="w-full">
              <GlowButton variant="primary" size="lg" className="w-full" icon={<ArrowRight size={14} />}>
                Enter Workspace
              </GlowButton>
            </Link>
            <GlowButton variant="ghost" size="sm" onClick={() => { setPhase('idle'); setFile(null); }}>
              Upload Different File
            </GlowButton>
          </motion.div>
        )}

        {/* Supported formats note */}
        {phase === 'idle' && (
          <div className="mt-6 flex items-start gap-2 p-3 rounded-xl bg-[rgba(255,211,106,0.06)] border border-[rgba(255,211,106,0.15)]">
            <AlertTriangle size={13} className="text-[#FFD36A] flex-shrink-0 mt-0.5" />
            <p className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] leading-relaxed">
              GLB/GLTF: Full support. OBJ/STL: Demo processing mode. No file is uploaded to any server — processing happens locally in this demo.
            </p>
          </div>
        )}
      </GlassPanel>

      {/* Or use demo */}
      <div className="mt-6 text-center">
        <span className="text-[13px] text-[rgba(245,247,250,0.35)]">No model? </span>
        <Link href="/workspace/demo" className="text-[13px] text-[#8BE9FF] hover:underline">
          Use the DRONE-X1 demo →
        </Link>
      </div>
    </div>
  );
}
