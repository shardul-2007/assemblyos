'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import { SpatialTopBar } from '@/components/spatial/SpatialTopBar';
import { ObjectSidebar } from '@/components/spatial/ObjectSidebar';
import { ObjectInspector } from '@/components/spatial/ObjectInspector';
import { SpatialAssistant } from '@/components/spatial/SpatialAssistant';
import { CameraScanner } from '@/components/spatial/CameraScanner';
import { ScanAnalysis } from '@/components/spatial/ScanAnalysis';
import { DetectionReview } from '@/components/spatial/DetectionReview';
import { SpatialReport } from '@/components/spatial/SpatialReport';
import { useSpatialStore } from '@/store/spatialStore';
import { analyzeImage } from '@/lib/vision/visionService';
import type { Detection, SpatialObject } from '@/types/spatial';

// Dynamic 3D Viewer to prevent SSR issues
const SpatialViewer3D = dynamic(
  () => import('@/components/spatial/SpatialViewer3D').then((m) => ({ default: m.SpatialViewer3D })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#050607]">
        <div className="w-12 h-12 border-2 border-[#8BE9FF] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="font-mono text-[11px] text-[rgba(245,247,250,0.4)] uppercase tracking-widest">
          Loading Spatial 3D Engine...
        </span>
      </div>
    ),
  }
);

export default function WorkspacePage() {
  const {
    showCamera,
    closeCamera,
    cameraTargetObjectId,
    showScanFlow,
    closeScanFlow,
    isAnalyzing,
    setIsAnalyzing,
    pendingDetections,
    setPendingDetections,
    clearPendingDetections,
    showExportPanel,
    closeExportPanel,
    objects,
    addPhoto,
    attachPhoto,
    addObjects,
  } = useSpatialStore();

  const [activeRightTab, setActiveRightTab] = useState<'assistant' | 'inspector'>('assistant');
  const targetObject = objects.find((o) => o.id === cameraTargetObjectId);

  // When a photo is captured from CameraScanner
  const handlePhotoCaptured = async (dataUrl: string) => {
    closeCamera();

    const newPhotoId = `photo-${Date.now()}`;
    const newPhoto = {
      id: newPhotoId,
      spaceId: 'space-cafe-lounge-001',
      objectId: cameraTargetObjectId || undefined,
      url: dataUrl,
      thumbnailUrl: dataUrl,
      timestamp: new Date(),
      source: 'camera' as const,
      analysisStatus: 'completed' as const,
      detections: [],
      photoType: cameraTargetObjectId ? 'Close-up' : 'Scan',
    };

    addPhoto(newPhoto);

    // If attached to a specific machine/object:
    if (cameraTargetObjectId) {
      attachPhoto(cameraTargetObjectId, newPhotoId);
      return;
    }

    // Otherwise, this is a space scan photo: run AI vision analysis
    setIsAnalyzing(true);
  };

  // When ScanAnalysis sequence finishes
  const handleAnalysisComplete = async () => {
    setIsAnalyzing(false);
    // Fetch detections from vision service (demo mode works seamlessly)
    const result = await analyzeImage('demo-image');
    setPendingDetections(result.objects);
  };

  // When user reviews and confirms detections to add into Digital Twin
  const handleConfirmDetections = (confirmedIds: string[]) => {
    const confirmed = pendingDetections.filter((d) => confirmedIds.includes(d.id));

    // Convert detections into full SpatialObject entities
    const newEntities: SpatialObject[] = confirmed.map((det, i) => ({
      id: `obj-detected-${Date.now()}-${i}`,
      spaceId: 'space-cafe-lounge-001',
      name: det.name,
      category: det.category,
      type: det.category,
      confidence: det.confidence,
      position: {
        x: (Math.random() - 0.5) * 6,
        y: 0.5,
        z: (Math.random() - 0.5) * 4,
      },
      dimensions: { width: 1.0, height: 1.0, depth: 1.0 },
      status: 'operational',
      photos: [],
      observations: [],
      inspectionHistory: [
        {
          id: `evt-${Date.now()}-${i}`,
          objectId: `obj-detected-${Date.now()}-${i}`,
          type: 'created',
          description: 'Entity detected via AI scan and confirmed by user',
          timestamp: new Date(),
        },
      ],
      metadata: {},
      isSelected: false,
      isHighlighted: false,
      isHidden: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    addObjects(newEntities);
    clearPendingDetections();
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-[#050607] overflow-hidden text-[#F5F7FA]">
      {/* Top Bar with reorganized controls (Capture is primary) */}
      <SpatialTopBar />

      {/* Main 3-column workspace */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Left: Space info & Objects sidebar */}
        <aside className="w-72 lg:w-80 flex-shrink-0 hidden md:block">
          <ObjectSidebar />
        </aside>

        {/* Center: 3D Digital Twin Viewer */}
        <main className="flex-1 relative overflow-hidden">
          <SpatialViewer3D />
          {/* Object Inspector overlay on top of viewer */}
          <ObjectInspector />
        </main>

        {/* Right: Spatial Assistant Copilot */}
        <aside className="w-80 lg:w-96 flex-shrink-0 hidden lg:block">
          <SpatialAssistant />
        </aside>
      </div>

      {/* Modals & Flows */}
      <AnimatePresence>
        {/* 1. Camera Scanner */}
        {showCamera && (
          <CameraScanner
            onCapture={handlePhotoCaptured}
            onClose={closeCamera}
            forObjectName={targetObject?.name}
          />
        )}

        {/* 2. Scanning / Analysis Sequence Screen */}
        {isAnalyzing && (
          <ScanAnalysis
            onComplete={handleAnalysisComplete}
            isDemo={true}
          />
        )}

        {/* 3. Review Detections Screen */}
        {pendingDetections.length > 0 && (
          <DetectionReview
            detections={pendingDetections}
            onConfirm={handleConfirmDetections}
            onCancel={clearPendingDetections}
            isDemo={true}
          />
        )}

        {/* 4. Spatial Report Modal */}
        {showExportPanel && (
          <SpatialReport onClose={closeExportPanel} />
        )}
      </AnimatePresence>
    </div>
  );
}
