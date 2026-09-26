import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { AssemblyState, CameraMode, VerificationStatus } from '@/types/assembly';

interface AssemblyStore extends AssemblyState {
  // Setters / actions
  selectComponent: (id: string | null) => void;
  highlightComponent: (id: string | null) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: number) => void;
  setExplodedProgress: (v: number) => void;
  toggleExploded: () => void;
  setExploded: (v: boolean) => void;
  startVerification: () => void;
  completeVerification: (status: VerificationStatus) => void;
  resetAssembly: () => void;
  startAssembly: () => void;
  finishAssembly: () => void;
  triggerShowMe: () => void;
  stopShowMe: () => void;
  setCameraMode: (mode: CameraMode) => void;
  setVisibleComponents: (ids: string[]) => void;
  showAllComponents: () => void;
  addCorrection: () => void;
  totalSteps: number;
}

const TOTAL_STEPS = 18;

const initialState: AssemblyState = {
  currentStep: 7, // Start at step 7 for demo interest
  completedSteps: [1, 2, 3, 4, 5, 6],
  selectedComponentId: null,
  explodedProgress: 0,
  isExploded: false,
  verificationStatus: null,
  corrections: 0,
  startedAt: null,
  finishedAt: null,
  assemblyStarted: false,
  assemblyFinished: false,
  cameraMode: 'orbit',
  highlightedComponentId: null,
  showMeActive: false,
  visibleComponents: [],
};

export const useAssemblyStore = create<AssemblyStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      ...initialState,
      totalSteps: TOTAL_STEPS,

      selectComponent: (id) => set({ selectedComponentId: id }),

      highlightComponent: (id) => set({ highlightedComponentId: id }),

      nextStep: () => {
        const { currentStep, completedSteps } = get();
        if (currentStep >= TOTAL_STEPS) return;
        set({
          completedSteps: Array.from(new Set([...completedSteps, currentStep])),
          currentStep: currentStep + 1,
        });
      },

      previousStep: () => {
        const { currentStep } = get();
        if (currentStep <= 1) return;
        set({ currentStep: currentStep - 1 });
      },

      setStep: (step) => {
        const { completedSteps, currentStep } = get();
        // Mark previous steps as complete if jumping forward
        if (step > currentStep) {
          const newCompleted = Array.from(
            new Set([...completedSteps, ...Array.from({ length: step - 1 }, (_, i) => i + 1)])
          );
          set({ currentStep: step, completedSteps: newCompleted });
        } else {
          set({ currentStep: step });
        }
      },

      setExplodedProgress: (v) =>
        set({ explodedProgress: Math.max(0, Math.min(1, v)), isExploded: v > 0.5 }),

      toggleExploded: () => {
        const { isExploded } = get();
        set({
          isExploded: !isExploded,
          explodedProgress: isExploded ? 0 : 1,
        });
      },

      setExploded: (v) =>
        set({ isExploded: v, explodedProgress: v ? 1 : 0 }),

      startVerification: () =>
        set({
          verificationStatus: {
            status: 'scanning',
            confidence: 0,
            checks: [],
            issues: [],
            isSimulated: true,
          },
        }),

      completeVerification: (status) => set({ verificationStatus: status }),

      resetAssembly: () =>
        set({
          ...initialState,
          startedAt: get().startedAt, // preserve start time
        }),

      startAssembly: () =>
        set({ assemblyStarted: true, startedAt: new Date() }),

      finishAssembly: () =>
        set({ assemblyFinished: true, finishedAt: new Date() }),

      triggerShowMe: () => set({ showMeActive: true }),

      stopShowMe: () => set({ showMeActive: false, visibleComponents: [] }),

      setCameraMode: (mode) => set({ cameraMode: mode }),

      setVisibleComponents: (ids) => set({ visibleComponents: ids }),

      showAllComponents: () => set({ visibleComponents: [] }),

      addCorrection: () => set((s) => ({ corrections: s.corrections + 1 })),
    })),
    { name: 'assembly-store' }
  )
);
