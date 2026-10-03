'use client';
import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { TopBar } from '@/components/workspace/TopBar';
import { ComponentSidebar } from '@/components/workspace/ComponentSidebar';
import { ViewerControls } from '@/components/workspace/ViewerControls';
import { ComponentInspector } from '@/components/workspace/ComponentInspector';
import { AssemblyTimeline } from '@/components/workspace/AssemblyTimeline';
import { Copilot } from '@/components/workspace/Copilot';
import { VerificationPanel } from '@/components/workspace/VerificationPanel';
import { AssemblyReport } from '@/components/workspace/AssemblyReport';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useAssemblyStore } from '@/store/assemblyStore';
import { ASSEMBLY_STEPS } from '@/data/demoProduct';
import { FileText, ChevronRight, ShieldCheck, AlertTriangle, Layers2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Dynamic import of 3D viewer to avoid SSR issues
const AssemblyViewer = dynamic(
  () => import('@/components/workspace/AssemblyViewer').then((m) => ({ default: m.AssemblyViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border border-[rgba(139,233,255,0.3)] rounded-full flex items-center justify-center mx-auto mb-3 animate-pulse">
            <div className="w-2 h-2 rounded-full bg-[#8BE9FF]" />
          </div>
          <p className="font-mono text-[10px] text-[rgba(245,247,250,0.35)] uppercase tracking-widest">Loading 3D Engine</p>
        </div>
      </div>
    ),
  }
);

export default function WorkspaceDemoPage() {
  const [showGrid, setShowGrid] = useState(true);
  const [wireframe, setWireframe] = useState(false);
  const [showLabels, setShowLabels] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [activePanel, setActivePanel] = useState<'parts' | 'steps' | 'copilot'>('copilot');

  const { currentStep, completedSteps, totalSteps, startAssembly, assemblyStarted, assemblyFinished, finishAssembly } = useAssemblyStore();
  const step = ASSEMBLY_STEPS.find((s) => s.order === currentStep);

  useEffect(() => {
    if (!assemblyStarted) startAssembly();
  }, [assemblyStarted, startAssembly]);

  useEffect(() => {
    if (completedSteps.length >= totalSteps && !assemblyFinished) {
      finishAssembly();
    }
  }, [completedSteps, totalSteps, assemblyFinished, finishAssembly]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const { nextStep, previousStep, toggleExploded, resetAssembly, triggerShowMe, startVerification } = useAssemblyStore.getState();
      switch (e.key.toUpperCase()) {
        case 'N': nextStep(); break;
        case 'P': previousStep(); break;
        case 'E': toggleExploded(); break;
        case 'R': resetAssembly(); break;
        case 'F': triggerShowMe(); break;
        case 'V': startVerification(); setShowVerify(true); break;
        case 'C': setActivePanel('copilot'); break;
        case 'ESCAPE': setShowReport(false); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col h-[100dvh] overflow-hidden bg-[#050607]">
      {/* Top bar */}
      <TopBar />

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT — Component sidebar (desktop) */}
        <aside className="hidden lg:flex flex-col w-[240px] border-r border-[rgba(255,255,255,0.06)] bg-[rgba(5,6,7,0.6)]">
          <ComponentSidebar />
        </aside>

        {/* CENTER — 3D Viewer */}
        <main className="flex-1 relative overflow-hidden">
          {/* 3D Canvas */}
          <div className="absolute inset-0">
            <AssemblyViewer showGrid={showGrid} wireframe={wireframe} />
          </div>

          {/* Viewer controls (right side) */}
          <div className="absolute top-4 right-4 z-10">
            <ViewerControls
              showGrid={showGrid} setShowGrid={setShowGrid}
              wireframe={wireframe} setWireframe={setWireframe}
              showLabels={showLabels} setShowLabels={setShowLabels}
            />
          </div>

          {/* Current step card (top left) */}
          {step && (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="absolute top-4 left-4 z-10 w-72 hidden md:block"
            >
              <div
                className="rounded-xl p-3"
                style={{ background: 'rgba(5,6,7,0.85)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[#8BE9FF]">STEP {step.order} / {totalSteps}</span>
                  <span className={`font-mono text-[9px] uppercase tracking-widest ml-auto ${
                    step.difficulty === 'easy' ? 'text-[#7DFFB2]' : step.difficulty === 'medium' ? 'text-[#FFD36A]' : 'text-[#FF7F8A]'
                  }`}>{step.difficulty}</span>
                </div>
                <h3 className="text-[13px] font-semibold text-[#F5F7FA] mb-1">{step.title}</h3>
                <p className="text-[11px] text-[rgba(245,247,250,0.5)] leading-relaxed line-clamp-2">{step.description}</p>
                {step.warnings && step.warnings.length > 0 && (
                  <div className="flex items-start gap-1.5 mt-2 pt-2 border-t border-[rgba(255,255,255,0.05)]">
                    <AlertTriangle size={11} className="text-[#FFD36A] flex-shrink-0 mt-0.5" />
                    <span className="text-[10px] text-[#FFD36A] leading-relaxed">{step.warnings[0]}</span>
                  </div>
                )}
                {step.tools.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="font-mono text-[9px] text-[rgba(245,247,250,0.3)] uppercase">Tools:</span>
                    <span className="font-mono text-[9px] text-[rgba(245,247,250,0.55)]">{step.tools.join(', ')}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Component inspector overlay */}
          <ComponentInspector />

          {/* Verification panel overlay */}
          <AnimatePresence>
            {showVerify && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-6 left-4 w-80 z-20"
              >
                <VerificationPanel />
                <GlowButton variant="ghost" size="sm" className="mt-2 w-full" onClick={() => setShowVerify(false)}>
                  Close Verification
                </GlowButton>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Assembly complete banner */}
          {assemblyFinished && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-30"
            >
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{ background: 'rgba(125,255,178,0.1)', border: '1px solid rgba(125,255,178,0.3)', backdropFilter: 'blur(20px)' }}
              >
                <span className="text-[#7DFFB2] font-bold text-[13px]">🎉 Assembly Complete!</span>
                <GlowButton variant="secondary" size="sm" icon={<FileText size={12} />} onClick={() => setShowReport(true)}>
                  View Report
                </GlowButton>
              </div>
            </motion.div>
          )}

          {/* Mobile bottom nav */}
          <div className="lg:hidden absolute bottom-0 left-0 right-0 flex border-t border-[rgba(255,255,255,0.06)]"
            style={{ background: 'rgba(5,6,7,0.95)', backdropFilter: 'blur(20px)' }}>
            {(['parts', 'steps', 'copilot'] as const).map((panel) => (
              <button key={panel} onClick={() => setActivePanel(panel)}
                className={`flex-1 py-3 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  activePanel === panel ? 'text-[#8BE9FF] border-t border-[#8BE9FF]' : 'text-[rgba(245,247,250,0.35)]'
                }`}>
                {panel === 'parts' ? '⬛ Parts' : panel === 'steps' ? '≡ Steps' : '💬 Copilot'}
              </button>
            ))}
          </div>
        </main>

        {/* RIGHT — Copilot + controls (desktop) */}
        <aside className="hidden lg:flex flex-col w-[320px] border-l border-[rgba(255,255,255,0.06)] bg-[rgba(5,6,7,0.6)]">
          {/* Tab header */}
          <div className="flex border-b border-[rgba(255,255,255,0.06)]">
            {[
              { id: 'copilot', label: 'Copilot' },
              { id: 'verify', label: 'Verify' },
            ].map((tab) => (
              <button key={tab.id}
                onClick={() => {
                  if (tab.id === 'verify') setShowVerify(!showVerify);
                  else setActivePanel('copilot');
                }}
                className={`flex-1 py-2.5 font-mono text-[10px] uppercase tracking-widest transition-colors ${
                  (tab.id === 'copilot' && activePanel === 'copilot') || (tab.id === 'verify' && showVerify)
                    ? 'text-[#8BE9FF] border-b border-[#8BE9FF]'
                    : 'text-[rgba(245,247,250,0.35)] hover:text-[rgba(245,247,250,0.6)]'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {showVerify ? (
            <div className="p-4 overflow-y-auto flex-1">
              <VerificationPanel />
            </div>
          ) : (
            <div className="flex-1 overflow-hidden">
              <Copilot />
            </div>
          )}

          {/* Report button */}
          <div className="p-3 border-t border-[rgba(255,255,255,0.06)]">
            <GlowButton
              variant="secondary"
              size="sm"
              className="w-full"
              icon={<FileText size={12} />}
              onClick={() => setShowReport(true)}
            >
              View Assembly Report
            </GlowButton>
          </div>
        </aside>
      </div>

      {/* BOTTOM — Timeline */}
      <div className="h-[88px] border-t border-[rgba(255,255,255,0.06)]">
        <AssemblyTimeline />
      </div>

      {/* Report modal */}
      <AnimatePresence>
        {showReport && <AssemblyReport onClose={() => setShowReport(false)} />}
      </AnimatePresence>
    </div>
  );
}
