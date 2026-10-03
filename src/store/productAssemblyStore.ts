import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Part, ProductAssembly, AIProductAnalysis } from '@/types/productAssembly';
import { DRONE_REFERENCE_ASSEMBLY, DRONE_PARTS } from '@/data/droneAssembly';

export type ProductMode = 'inspect' | 'how-it-works' | 'dependencies';

interface ProductAssemblyStore {
  // Current Assembly
  currentAssembly: ProductAssembly;
  parts: Part[];
  selectedPartId: string | null;
  highlightedPartIds: string[];
  isolatedPartId: string | null;
  
  // 3D & Operation State
  explodedProgress: number; // 0 to 1
  isExploded: boolean;
  mode: ProductMode;
  
  // History for Undo / Redo
  history: Array<{ parts: Part[]; explodedProgress: number }>;
  historyIndex: number;
  
  // Photo & Recognition pipeline
  showCamera: boolean;
  isAnalyzing: boolean;
  capturedImageUrl: string | null;
  capturedImageHint: string | null;
  analysisResult: AIProductAnalysis | null;
  showAnalysisModal: boolean;
  showExportModal: boolean;

  // View Modes & Intelligence Layers
  showSourceOverlay: boolean;
  showGraphView: boolean;
  evidenceMode: boolean;

  // Actions — Part Operations
  selectPart: (id: string | null) => void;
  highlightParts: (ids: string[]) => void;
  removePart: (id: string) => void;
  reattachPart: (id: string) => void;
  replacePart: (id: string, newOption: { name: string; partNumber: string }) => void;
  isolatePart: (id: string | null) => void;
  hidePart: (id: string) => void;
  showPart: (id: string) => void;
  
  // Actions — Assembly Operations
  setExplodedProgress: (progress: number) => void;
  toggleExploded: () => void;
  setMode: (mode: ProductMode) => void;
  toggleSourceOverlay: () => void;
  setSourceOverlay: (v: boolean) => void;
  toggleGraphView: () => void;
  setGraphView: (v: boolean) => void;
  toggleEvidenceMode: () => void;
  setEvidenceMode: (v: boolean) => void;
  resetAssembly: () => void;
  reassembleAll: () => void;
  
  // Actions — Photo Attachment to Part
  attachPhotoToPart: (partId: string, photoDataUrl: string) => void;
  
  // Actions — Undo / Redo
  undo: () => void;
  redo: () => void;
  
  // Actions — Camera & Analysis
  openCamera: () => void;
  closeCamera: () => void;
  setCapturedImage: (url: string | null, hint?: string) => void;
  setIsAnalyzing: (v: boolean) => void;
  setAnalysisResult: (res: AIProductAnalysis | null) => void;
  openAnalysisModal: () => void;
  closeAnalysisModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  applyAnalysisAssembly: (assemblyId: string) => void;
}

export const useProductAssemblyStore = create<ProductAssemblyStore>()(
  devtools((set, get) => ({
    currentAssembly: DRONE_REFERENCE_ASSEMBLY,
    parts: DRONE_PARTS.map(p => ({ ...p, status: 'installed' as const })),
    selectedPartId: null,
    highlightedPartIds: [],
    isolatedPartId: null,
    explodedProgress: 0,
    isExploded: false,
    mode: 'inspect',

    // View Modes & Intelligence Layers
    showSourceOverlay: false,
    showGraphView: false,
    evidenceMode: false,
    
    history: [{ parts: DRONE_PARTS.map(p => ({ ...p })), explodedProgress: 0 }],
    historyIndex: 0,
    
    showCamera: false,
    isAnalyzing: false,
    capturedImageUrl: null,
    capturedImageHint: null,
    analysisResult: null,
    showAnalysisModal: false,
    showExportModal: false,

    selectPart: (id) => set({ selectedPartId: id }),

    highlightParts: (ids) => set({ highlightedPartIds: ids }),

    removePart: (id) => {
      const { parts, history, historyIndex, explodedProgress } = get();
      const updated = parts.map(p => p.id === id ? { ...p, status: 'removed' as const } : p);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ parts: updated, explodedProgress });
      set({ parts: updated, history: newHistory, historyIndex: newHistory.length - 1 });
    },

    reattachPart: (id) => {
      const { parts, history, historyIndex, explodedProgress } = get();
      const updated = parts.map(p => p.id === id ? { ...p, status: 'installed' as const } : p);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ parts: updated, explodedProgress });
      set({ parts: updated, history: newHistory, historyIndex: newHistory.length - 1 });
    },

    replacePart: (id, newOption) => {
      const { parts, history, historyIndex, explodedProgress } = get();
      const updated = parts.map(p => p.id === id ? {
        ...p,
        name: newOption.name,
        partNumber: newOption.partNumber,
        status: 'installed' as const
      } : p);
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({ parts: updated, explodedProgress });
      set({ parts: updated, history: newHistory, historyIndex: newHistory.length - 1 });
    },

    isolatePart: (id) => set((s) => ({
      isolatedPartId: s.isolatedPartId === id ? null : id
    })),

    hidePart: (id) => set((s) => ({
      parts: s.parts.map(p => p.id === id ? { ...p, status: 'hidden' as const } : p)
    })),

    showPart: (id) => set((s) => ({
      parts: s.parts.map(p => p.id === id ? { ...p, status: 'installed' as const } : p)
    })),

    setExplodedProgress: (v) => set({
      explodedProgress: Math.max(0, Math.min(1, v)),
      isExploded: v > 0.05
    }),

    toggleExploded: () => {
      const { isExploded } = get();
      set({ isExploded: !isExploded, explodedProgress: isExploded ? 0 : 1 });
    },

    setMode: (mode) => set({ mode }),

    toggleSourceOverlay: () => set((s) => ({ showSourceOverlay: !s.showSourceOverlay })),
    setSourceOverlay: (v) => set({ showSourceOverlay: v }),
    toggleGraphView: () => set((s) => ({ showGraphView: !s.showGraphView })),
    setGraphView: (v) => set({ showGraphView: v }),
    toggleEvidenceMode: () => set((s) => ({ evidenceMode: !s.evidenceMode })),
    setEvidenceMode: (v) => set({ evidenceMode: v }),

    resetAssembly: () => set({
      parts: DRONE_PARTS.map(p => ({ ...p, status: 'installed' as const })),
      selectedPartId: null,
      highlightedPartIds: [],
      isolatedPartId: null,
      explodedProgress: 0,
      isExploded: false,
      mode: 'inspect'
    }),

    reassembleAll: () => set((s) => ({
      parts: s.parts.map(p => ({ ...p, status: 'installed' as const })),
      explodedProgress: 0,
      isExploded: false,
      isolatedPartId: null
    })),

    attachPhotoToPart: (partId, photoDataUrl) => set((s) => ({
      parts: s.parts.map(p => p.id === partId ? {
        ...p,
        photos: [photoDataUrl, ...p.photos]
      } : p)
    })),

    undo: () => {
      const { history, historyIndex } = get();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        const state = history[nextIdx];
        set({ parts: state.parts, explodedProgress: state.explodedProgress, historyIndex: nextIdx });
      }
    },

    redo: () => {
      const { history, historyIndex } = get();
      if (historyIndex < history.length - 1) {
        const nextIdx = historyIndex + 1;
        const state = history[nextIdx];
        set({ parts: state.parts, explodedProgress: state.explodedProgress, historyIndex: nextIdx });
      }
    },

    openCamera: () => set({ showCamera: true }),
    closeCamera: () => set({ showCamera: false }),
    setCapturedImage: (url, hint) => set({ capturedImageUrl: url, capturedImageHint: hint ?? null }),
    setIsAnalyzing: (v) => set({ isAnalyzing: v }),
    setAnalysisResult: (res) => set({ analysisResult: res }),
    openAnalysisModal: () => set({ showAnalysisModal: true }),
    closeAnalysisModal: () => set({ showAnalysisModal: false }),
    openExportModal: () => set({ showExportModal: true }),
    closeExportModal: () => set({ showExportModal: false }),

    applyAnalysisAssembly: (assemblyId) => {
      if (assemblyId === 'drone-x1') {
        set({
          currentAssembly: DRONE_REFERENCE_ASSEMBLY,
          parts: DRONE_PARTS.map(p => ({ ...p, status: 'installed' as const })),
          showAnalysisModal: false,
          explodedProgress: 0,
          isExploded: false
        });
      }
    }
  }))
);
