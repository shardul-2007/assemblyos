import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type {
  SpatialObject, Space, Photo, Scan, SceneState, SceneMode,
  SpatialAction, AssistantMessage, Detection, Observation, InspectionEvent
} from '@/types/spatial';
import { DEMO_OBJECTS, DEMO_SPACE, DEMO_SCAN } from '@/data/demoSpace';

// ─── State Interface ───────────────────────────────────────────────────────────

interface SpatialStore {
  // Data
  space: Space;
  objects: SpatialObject[];
  photos: Photo[];
  scans: Scan[];
  scanHistory: Scan[];

  // Scene state
  scene: SceneState;

  // UI state
  activeTool: 'capture' | 'inspect' | 'scan' | 'semantic' | 'ai-briefing' | 'export' | null;
  showCamera: boolean;
  showScanFlow: boolean;
  cameraTargetObjectId: string | null;   // if capturing for a specific object
  showObjectInspector: boolean;
  inspectorObjectId: string | null;
  showMediaLibrary: boolean;
  showExportPanel: boolean;
  showScanHistory: boolean;
  isAnalyzing: boolean;
  pendingDetections: Detection[];        // awaiting user review
  currentScanId: string | null;

  // Assistant
  assistantMessages: AssistantMessage[];
  isAssistantThinking: boolean;

  // Actions — Space
  setSpace: (space: Space) => void;
  updateSpaceName: (name: string) => void;

  // Actions — Objects
  addObject: (obj: SpatialObject) => void;
  addObjects: (objs: SpatialObject[]) => void;
  updateObject: (id: string, patch: Partial<SpatialObject>) => void;
  removeObject: (id: string) => void;
  selectObject: (id: string | null) => void;
  highlightObjects: (ids: string[]) => void;
  highlightCategory: (cat: string | null) => void;
  clearHighlights: () => void;
  hideObjects: (ids: string[]) => void;
  showAllObjects: () => void;
  addObservation: (objectId: string, obs: Observation) => void;
  addInspectionEvent: (objectId: string, evt: InspectionEvent) => void;
  attachPhoto: (objectId: string, photoId: string) => void;

  // Actions — Photos
  addPhoto: (photo: Photo) => void;
  updatePhoto: (id: string, patch: Partial<Photo>) => void;
  removePhoto: (id: string) => void;
  getObjectPhotos: (objectId: string) => Photo[];

  // Actions — Scans
  addScan: (scan: Scan) => void;
  updateScan: (id: string, patch: Partial<Scan>) => void;
  setPendingDetections: (detections: Detection[]) => void;
  confirmDetections: (ids: string[]) => void;
  rejectDetection: (id: string) => void;
  clearPendingDetections: () => void;

  // Actions — Scene
  setSceneMode: (mode: SceneMode) => void;
  setShowGrid: (v: boolean) => void;
  setShowLabels: (v: boolean) => void;
  resetScene: () => void;

  // Actions — UI
  setActiveTool: (tool: SpatialStore['activeTool']) => void;
  openCamera: (forObjectId?: string) => void;
  closeCamera: () => void;
  openScanFlow: () => void;
  closeScanFlow: () => void;
  openInspector: (objectId: string) => void;
  closeInspector: () => void;
  setIsAnalyzing: (v: boolean) => void;
  openMediaLibrary: () => void;
  closeMediaLibrary: () => void;
  openExportPanel: () => void;
  closeExportPanel: () => void;
  openScanHistory: () => void;
  closeScanHistory: () => void;

  // Actions — Assistant
  addAssistantMessage: (msg: AssistantMessage) => void;
  setAssistantThinking: (v: boolean) => void;
  executeAction: (action: SpatialAction) => void;
}

// ─── Initial scene state ───────────────────────────────────────────────────────

const initialScene: SceneState = {
  mode: 'normal',
  selectedObjectId: null,
  highlightedObjectIds: [],
  hiddenObjectIds: [],
  showGrid: true,
  showLabels: true,
  showMeasurements: false,
};

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useSpatialStore = create<SpatialStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // Initial data
      space: DEMO_SPACE,
      objects: DEMO_OBJECTS.map((o) => ({ ...o })),
      photos: [],
      scans: [DEMO_SCAN],
      scanHistory: [DEMO_SCAN],

      scene: { ...initialScene },

      activeTool: null,
      showCamera: false,
      showScanFlow: false,
      cameraTargetObjectId: null,
      showObjectInspector: false,
      inspectorObjectId: null,
      showMediaLibrary: false,
      showExportPanel: false,
      showScanHistory: false,
      isAnalyzing: false,
      pendingDetections: [],
      currentScanId: null,

      assistantMessages: [
        {
          id: 'msg-welcome',
          role: 'assistant',
          content: "Hello! I'm your **Spatial Assistant**. I can see **Photo Café Lounge** with 12 detected objects including machines, furniture and safety equipment.\n\nTry asking:\n- *\"Show me all machines\"*\n- *\"Where is the CNC machine?\"*\n- *\"Which objects need inspection?\"*",
          timestamp: new Date(),
        },
      ],
      isAssistantThinking: false,

      // ── Space ──────────────────────────────────────────────────────────────

      setSpace: (space) => set({ space }),
      updateSpaceName: (name) => set((s) => ({ space: { ...s.space, name } })),

      // ── Objects ────────────────────────────────────────────────────────────

      addObject: (obj) =>
        set((s) => ({
          objects: [...s.objects, obj],
          space: {
            ...s.space,
            objectIds: [...s.space.objectIds, obj.id],
            objectCount: s.objects.length + 1,
          },
        })),

      addObjects: (objs) =>
        set((s) => ({
          objects: [...s.objects, ...objs],
          space: {
            ...s.space,
            objectIds: [...s.space.objectIds, ...objs.map((o) => o.id)],
            objectCount: s.objects.length + objs.length,
          },
        })),

      updateObject: (id, patch) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === id ? { ...o, ...patch, updatedAt: new Date() } : o
          ),
        })),

      removeObject: (id) =>
        set((s) => ({
          objects: s.objects.filter((o) => o.id !== id),
          space: {
            ...s.space,
            objectIds: s.space.objectIds.filter((oid) => oid !== id),
          },
        })),

      selectObject: (id) =>
        set((s) => ({
          objects: s.objects.map((o) => ({ ...o, isSelected: o.id === id })),
          scene: { ...s.scene, selectedObjectId: id },
          inspectorObjectId: id,
          showObjectInspector: !!id,
        })),

      highlightObjects: (ids) =>
        set((s) => ({
          objects: s.objects.map((o) => ({ ...o, isHighlighted: ids.includes(o.id) })),
          scene: { ...s.scene, highlightedObjectIds: ids },
        })),

      highlightCategory: (cat) =>
        set((s) => {
          const ids = cat ? s.objects.filter((o) => o.category === cat).map((o) => o.id) : [];
          return {
            objects: s.objects.map((o) => ({ ...o, isHighlighted: ids.includes(o.id) })),
            scene: { ...s.scene, highlightedObjectIds: ids },
          };
        }),

      clearHighlights: () =>
        set((s) => ({
          objects: s.objects.map((o) => ({ ...o, isHighlighted: false })),
          scene: { ...s.scene, highlightedObjectIds: [] },
        })),

      hideObjects: (ids) =>
        set((s) => ({
          objects: s.objects.map((o) => ({ ...o, isHidden: ids.includes(o.id) })),
          scene: { ...s.scene, hiddenObjectIds: ids },
        })),

      showAllObjects: () =>
        set((s) => ({
          objects: s.objects.map((o) => ({ ...o, isHidden: false })),
          scene: { ...s.scene, hiddenObjectIds: [] },
        })),

      addObservation: (objectId, obs) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === objectId
              ? { ...o, observations: [...o.observations, obs], updatedAt: new Date() }
              : o
          ),
        })),

      addInspectionEvent: (objectId, evt) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === objectId
              ? { ...o, inspectionHistory: [...o.inspectionHistory, evt] }
              : o
          ),
        })),

      attachPhoto: (objectId, photoId) =>
        set((s) => ({
          objects: s.objects.map((o) =>
            o.id === objectId
              ? { ...o, photos: [...o.photos, photoId], updatedAt: new Date() }
              : o
          ),
          photos: s.photos.map((p) =>
            p.id === photoId ? { ...p, objectId } : p
          ),
        })),

      // ── Photos ─────────────────────────────────────────────────────────────

      addPhoto: (photo) =>
        set((s) => ({ photos: [...s.photos, photo] })),

      updatePhoto: (id, patch) =>
        set((s) => ({
          photos: s.photos.map((p) => (p.id === id ? { ...p, ...patch } : p)),
        })),

      removePhoto: (id) =>
        set((s) => ({ photos: s.photos.filter((p) => p.id !== id) })),

      getObjectPhotos: (objectId) =>
        get().photos.filter((p) => p.objectId === objectId),

      // ── Scans ──────────────────────────────────────────────────────────────

      addScan: (scan) =>
        set((s) => ({
          scans: [...s.scans, scan],
          scanHistory: [scan, ...s.scanHistory],
          currentScanId: scan.id,
        })),

      updateScan: (id, patch) =>
        set((s) => ({
          scans: s.scans.map((sc) => (sc.id === id ? { ...sc, ...patch } : sc)),
        })),

      setPendingDetections: (detections) => set({ pendingDetections: detections }),

      confirmDetections: (ids) => set({ pendingDetections: [] }),

      rejectDetection: (id) =>
        set((s) => ({
          pendingDetections: s.pendingDetections.map((d) =>
            d.id === id ? { ...d, isRejected: true } : d
          ),
        })),

      clearPendingDetections: () => set({ pendingDetections: [] }),

      // ── Scene ──────────────────────────────────────────────────────────────

      setSceneMode: (mode) =>
        set((s) => ({ scene: { ...s.scene, mode } })),

      setShowGrid: (v) =>
        set((s) => ({ scene: { ...s.scene, showGrid: v } })),

      setShowLabels: (v) =>
        set((s) => ({ scene: { ...s.scene, showLabels: v } })),

      resetScene: () =>
        set((s) => ({
          scene: { ...initialScene },
          objects: s.objects.map((o) => ({
            ...o, isSelected: false, isHighlighted: false, isHidden: false,
          })),
        })),

      // ── UI ─────────────────────────────────────────────────────────────────

      setActiveTool: (tool) => set({ activeTool: tool }),

      openCamera: (forObjectId) =>
        set({ showCamera: true, cameraTargetObjectId: forObjectId ?? null }),

      closeCamera: () =>
        set({ showCamera: false, cameraTargetObjectId: null }),

      openScanFlow: () => set({ showScanFlow: true }),
      closeScanFlow: () => set({ showScanFlow: false }),

      openInspector: (objectId) =>
        set({ showObjectInspector: true, inspectorObjectId: objectId }),

      closeInspector: () =>
        set({ showObjectInspector: false, inspectorObjectId: null }),

      setIsAnalyzing: (v) => set({ isAnalyzing: v }),

      openMediaLibrary: () => set({ showMediaLibrary: true }),
      closeMediaLibrary: () => set({ showMediaLibrary: false }),
      openExportPanel: () => set({ showExportPanel: true }),
      closeExportPanel: () => set({ showExportPanel: false }),
      openScanHistory: () => set({ showScanHistory: true }),
      closeScanHistory: () => set({ showScanHistory: false }),

      // ── Assistant ──────────────────────────────────────────────────────────

      addAssistantMessage: (msg) =>
        set((s) => ({ assistantMessages: [...s.assistantMessages, msg] })),

      setAssistantThinking: (v) => set({ isAssistantThinking: v }),

      executeAction: (action) => {
        const { highlightObjects, selectObject, openInspector, openCamera,
                highlightCategory, showAllObjects, setSceneMode, resetScene } = get();
        switch (action.type) {
          case 'focusObject':
          case 'openInspector':
            if (action.objectId) {
              selectObject(action.objectId);
              openInspector(action.objectId);
            }
            break;
          case 'highlightObject':
            if (action.objectId) highlightObjects([action.objectId]);
            break;
          case 'highlightCategory':
            if (action.category) highlightCategory(action.category);
            break;
          case 'showObjects':
            if (action.objectIds) highlightObjects(action.objectIds);
            break;
          case 'openCamera':
            openCamera(action.objectId);
            break;
          case 'setSceneMode':
            if (action.mode) setSceneMode(action.mode);
            break;
          case 'resetScene':
            resetScene();
            break;
        }
      },
    })),
    { name: 'spatial-store' }
  )
);
