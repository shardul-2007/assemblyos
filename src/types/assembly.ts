// AssemblyOS — Core Type Definitions

export type ComponentStatus = 'pending' | 'active' | 'installed' | 'verified' | 'error';
export type ComponentType = 'frame' | 'motor' | 'battery' | 'pcb' | 'bracket' | 'screw' | 'washer' | 'propeller' | 'gear' | 'other';
export type StepDifficulty = 'easy' | 'medium' | 'hard';
export type AssemblyStepStatus = 'upcoming' | 'active' | 'completed';

export interface Vector3Data {
  x: number;
  y: number;
  z: number;
}

export interface Component {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  material: string;
  quantity: number;
  position: Vector3Data;
  explodedPosition: Vector3Data;
  rotation: Vector3Data;
  color: string;
  emissiveColor?: string;
  status: ComponentStatus;
  stepIntroduced: number;
  requiredTool?: string;
  partNumber?: string;
  weight?: string;
  dimensions?: string;
  visible: boolean;
}

export interface AssemblyStep {
  id: string;
  order: number;
  title: string;
  description: string;
  components: string[]; // component IDs
  tools: string[];
  duration: string; // e.g. "2 min"
  difficulty: StepDifficulty;
  warnings?: string[];
  notes?: string[];
  animation?: StepAnimation;
  status: AssemblyStepStatus;
}

export interface StepAnimation {
  type: 'insert' | 'rotate' | 'screw' | 'snap';
  targetComponentId: string;
  targetPosition: Vector3Data;
  targetRotation: Vector3Data;
  direction: Vector3Data;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  modelUrl?: string;
  components: Component[];
  steps: AssemblyStep[];
  tools: string[];
  metadata: ProductMetadata;
}

export interface ProductMetadata {
  manufacturer?: string;
  version?: string;
  estimatedAssemblyTime: string;
  difficulty: StepDifficulty;
  totalComponents: number;
  totalSteps: number;
  tags: string[];
}

export interface AssemblyState {
  currentStep: number;
  completedSteps: number[];
  selectedComponentId: string | null;
  explodedProgress: number; // 0–1
  isExploded: boolean;
  verificationStatus: VerificationStatus | null;
  corrections: number;
  startedAt: Date | null;
  finishedAt: Date | null;
  assemblyStarted: boolean;
  assemblyFinished: boolean;
  cameraMode: CameraMode;
  highlightedComponentId: string | null;
  showMeActive: boolean;
  visibleComponents: string[]; // IDs; empty = all visible
}

export type CameraMode = 'orbit' | 'focus' | 'cinematic';

export interface VerificationStatus {
  status: 'idle' | 'scanning' | 'verified' | 'failed';
  confidence: number;
  checks: VerificationCheck[];
  issues: VerificationIssue[];
  isSimulated: boolean;
}

export interface VerificationCheck {
  id: string;
  label: string;
  passed: boolean;
}

export interface VerificationIssue {
  id: string;
  componentId?: string;
  description: string;
  severity: 'warning' | 'error';
}

export interface AssemblyReport {
  productName: string;
  startedAt: Date;
  completedAt: Date;
  totalTime: number; // seconds
  stepsCompleted: number;
  totalSteps: number;
  corrections: number;
  verificationScore: number;
  toolsUsed: string[];
  componentsInstalled: string[];
  difficultSteps: number[];
  finalStatus: 'complete' | 'incomplete' | 'verified';
}

// AI / Copilot types

export type AIActionType =
  | 'focusComponent'
  | 'highlightComponent'
  | 'setExplodedView'
  | 'setAssemblyStep'
  | 'showAssemblyAnimation'
  | 'explainComponent'
  | 'showMeasurement'
  | 'verifyAssembly'
  | 'resetScene';

export interface AIAction {
  type: AIActionType;
  componentId?: string;
  stepIndex?: number;
  value?: number | boolean | string;
}

export interface AIResponse {
  message: string;
  actions?: AIAction[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AIAction[];
  timestamp: Date;
}

// API types

export interface ChatRequest {
  messages: { role: 'user' | 'assistant'; content: string }[];
  currentStep: number;
  selectedComponent?: string | null;
  product: string;
  assemblyState: Partial<AssemblyState>;
}

export interface AnalyzeRequest {
  modelId: string;
  fileName: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyzeResponse {
  status: 'ready' | 'processing' | 'error';
  components: Component[];
  estimatedSteps: number;
  tools: string[];
  warnings: string[];
}

export interface VerifyRequest {
  productId: string;
  currentStep: number;
  expectedComponents: string[];
  detectedState: Record<string, unknown>;
}

export interface VerifyResponse {
  status: 'verified' | 'failed' | 'pending';
  confidence: number;
  issues: VerificationIssue[];
  isSimulated: boolean;
}
