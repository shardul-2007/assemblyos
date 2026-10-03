'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { ProductTopBar } from '@/components/assembly/ProductTopBar';
import { ProductAssemblyTree } from '@/components/assembly/ProductAssemblyTree';
import { ProductPartInspector } from '@/components/assembly/ProductPartInspector';
import { ProductAssemblyCopilot } from '@/components/assembly/ProductAssemblyCopilot';
import { ProductAnalysisModal } from '@/components/assembly/ProductAnalysisModal';
import { ProductAssemblyReport } from '@/components/assembly/ProductAssemblyReport';
import { CameraScanner } from '@/components/spatial/CameraScanner';
import { ScanAnalysis } from '@/components/spatial/ScanAnalysis';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import { analyzeProductImage } from '@/lib/vision/productVisionService';

// Dynamic import of 3D Drone Assembly Viewer to prevent SSR canvas hydration mismatch
const DroneAssemblyViewer = dynamic(
  () => import('@/components/assembly/DroneAssemblyViewer').then((m) => ({ default: m.DroneAssemblyViewer })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050607]">
        <div className="w-12 h-12 border-2 border-[#8BE9FF] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="font-mono text-[11px] text-[rgba(245,247,250,0.4)] uppercase tracking-widest">
          Loading Drone 3D Assembly Engine...
        </span>
      </div>
    ),
  }
);

export default function WorkspacePage() {
  const {
    showCamera,
    closeCamera,
    isAnalyzing,
    setIsAnalyzing,
    capturedImageUrl,
    setCapturedImage,
    analysisResult,
    setAnalysisResult,
    showAnalysisModal,
    openAnalysisModal,
    closeAnalysisModal,
    showExportModal,
    closeExportModal,
    applyAnalysisAssembly,
    selectedPartId,
    attachPhotoToPart,
    undo,
    redo,
    toggleExploded,
    explodedProgress,
    setExplodedProgress,
    reassembleAll,
  } = useProductAssemblyStore();

  // Keyboard Shortcuts: Ctrl+Z (Undo), Ctrl+Shift+Z (Redo), E (Explode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      } else if (e.key === 'e' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        toggleExploded();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, toggleExploded]);

  // When photo is taken from real camera or uploaded
  const handlePhotoCaptured = async (dataUrl: string) => {
    closeCamera();
    setCapturedImage(dataUrl);

    // If a part was selected, attach this photo to that part
    if (selectedPartId) {
      attachPhotoToPart(selectedPartId, dataUrl);
      return;
    }

    // Otherwise, trigger the AI product identification pipeline with the actual image
    setIsAnalyzing(true);
  };

  // When scanning sequence completes
  const handleAnalysisComplete = async () => {
    setIsAnalyzing(false);
    if (!capturedImageUrl) return;

    // Run real/demo product vision service with captured image
    const result = await analyzeProductImage(capturedImageUrl);
    setAnalysisResult(result);
    openAnalysisModal();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050607] overflow-hidden text-[#F5F7FA]">
      {/* Top Bar with prominent Capture button, Explode, and Undo/Redo */}
      <ProductTopBar />

      {/* Main 3-Column Workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Product Assembly Hierarchy Tree */}
        <aside className="w-72 lg:w-80 flex-shrink-0 hidden md:block">
          <ProductAssemblyTree />
        </aside>

        {/* Center: 3D Drone Assembly Viewer */}
        <main className="flex-1 relative overflow-hidden">
          <DroneAssemblyViewer />

          {/* Part Inspector Floating Overlay */}
          <ProductPartInspector />

          {/* Bottom Quick Controls Bar: Explode Slider, Reassemble, Undo/Redo */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#080b0f]/85 border border-[rgba(255,255,255,0.08)] backdrop-blur shadow-2xl">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.4)]">
              EXPLODE
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={explodedProgress}
              onChange={(e) => setExplodedProgress(parseFloat(e.target.value))}
              className="w-32 h-1 accent-[#8BE9FF] cursor-pointer"
            />
            <button
              onClick={reassembleAll}
              className="px-2.5 py-1 rounded-lg bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.08)] font-mono text-[9px] uppercase tracking-wider text-[#8BE9FF] transition-colors"
            >
              Reassemble
            </button>
          </div>
        </main>

        {/* Right: Assembly Copilot */}
        <aside className="w-80 lg:w-96 flex-shrink-0 hidden lg:block">
          <ProductAssemblyCopilot />
        </aside>
      </div>

      {/* Modals & Capture Pipelines */}
      <AnimatePresence>
        {/* 1. Real Camera Scanner */}
        {showCamera && (
          <CameraScanner
            onCapture={handlePhotoCaptured}
            onClose={closeCamera}
            forObjectName={selectedPartId ?? undefined}
          />
        )}

        {/* 2. Structured Scanning Sequence Screen */}
        {isAnalyzing && (
          <ScanAnalysis
            onComplete={handleAnalysisComplete}
            isDemo={true}
          />
        )}

        {/* 3. Product Recognition & Matching Modal */}
        {showAnalysisModal && analysisResult && (
          <ProductAnalysisModal
            analysis={analysisResult}
            imageUrl={capturedImageUrl}
            onConfirm={() => applyAnalysisAssembly('drone-x1')}
            onCancel={closeAnalysisModal}
          />
        )}

        {/* 4. Assembly Report Modal */}
        {showExportModal && (
          <ProductAssemblyReport onClose={closeExportModal} />
        )}
      </AnimatePresence>
    </div>
  );
}
