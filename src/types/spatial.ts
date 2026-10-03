// AssemblyOS — Spatial Intelligence Type Definitions
// Evolved from assembly types → spatial twin types

// ─── Core identifiers ─────────────────────────────────────────────────────────

export type ObjectCategory =
  | 'room-element'
  | 'furniture'
  | 'machine'
  | 'electrical'
  | 'equipment'
  | 'safety'
  | 'vehicle'
  | 'storage'
  | 'other';

export type ObjectStatus =
  | 'operational'
  | 'inspection_required'
  | 'maintenance_due'
  | 'offline'
  | 'unknown';

export type ScanStatus = 'pending' | 'scanning' | 'analyzing' | 'completed' | 'failed';
export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type PhotoSource = 'camera' | 'upload' | 'import' | 'inspection';
export type SceneMode = 'normal' | 'semantic' | 'wireframe' | 'inspection';

// ─── Geometry ─────────────────────────────────────────────────────────────────

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface BoundingBox {
  x: number;  // top-left x (0-1 normalized)
  y: number;  // top-left y (0-1 normalized)
  w: number;  // width (0-1 normalized)
  h: number;  // height (0-1 normalized)
}

export interface Dimensions3D {
  width: number;   // meters
  height: number;
  depth: number;
}

// ─── Photo / Media ────────────────────────────────────────────────────────────

export interface Detection {
  id: string;
  objectId?: string;       // matched to SpatialObject after confirmation
  name: string;
  category: ObjectCategory;
  confidence: number;      // 0-1
  boundingBox: BoundingBox;
  estimatedDimensions?: Dimensions3D;
  ocr?: {
    text: string[];
    manufacturer?: string;
    model?: string;
    serial?: string;
    confidence: number;
  };
  isConfirmed: boolean;
  isRejected: boolean;
}

export interface Photo {
  id: string;
  spaceId: string;
  objectId?: string;        // attached to a specific object
  url: string;              // object URL or data URL
  thumbnailUrl: string;
  timestamp: Date;
  source: PhotoSource;
  analysisStatus: AnalysisStatus;
  detections: Detection[];
  photoType?: string;       // 'front' | 'left' | 'right' | 'rear' | 'nameplate' | 'close-up' | 'other'
  notes?: string;
  width?: number;
  height?: number;
}

// ─── Observation / Inspection ─────────────────────────────────────────────────

export interface Observation {
  id: string;
  objectId: string;
  type: 'ai' | 'manual' | 'safety' | 'maintenance';
  content: string;
  severity?: 'info' | 'warning' | 'critical';
  timestamp: Date;
  isAIGenerated: boolean;
}

export interface InspectionEvent {
  id: string;
  objectId: string;
  type: 'photo_captured' | 'analysis_completed' | 'note_added' | 'status_changed' | 'created';
  description: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

// ─── Spatial Object ───────────────────────────────────────────────────────────

export interface SpatialObject {
  id: string;
  spaceId: string;
  name: string;
  category: ObjectCategory;
  type: string;             // e.g. 'cnc-milling', 'chair', 'fire-extinguisher'
  confidence: number;       // AI confidence 0-1
  position: Vector3;
  dimensions?: Dimensions3D;
  rotation?: Vector3;
  status: ObjectStatus;
  photos: string[];         // Photo IDs
  observations: Observation[];
  inspectionHistory: InspectionEvent[];
  metadata: {
    manufacturer?: string;
    model?: string;
    serial?: string;
    location?: string;
    components?: string[];
    tags?: string[];
  };
  isSelected: boolean;
  isHighlighted: boolean;
  isHidden: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Scan ─────────────────────────────────────────────────────────────────────

export interface Scan {
  id: string;
  spaceId: string;
  photoIds: string[];
  status: ScanStatus;
  detectedObjects: Detection[];
  confirmedObjectIds: string[];
  createdAt: Date;
  completedAt?: Date;
  source: PhotoSource;
  label?: string;
}

// ─── Space ────────────────────────────────────────────────────────────────────

export interface Space {
  id: string;
  name: string;
  description?: string;
  dimensions?: Dimensions3D;
  photoIds: string[];
  objectIds: string[];
  scanIds: string[];
  createdAt: Date;
  updatedAt: Date;
  thumbnail?: string;
  objectCount?: number;
}

// ─── Scene / 3D State ─────────────────────────────────────────────────────────

export interface SceneState {
  mode: SceneMode;
  selectedObjectId: string | null;
  highlightedObjectIds: string[];
  hiddenObjectIds: string[];
  showGrid: boolean;
  showLabels: boolean;
  showMeasurements: boolean;
  cameraTarget?: Vector3;
  cameraPosition?: Vector3;
}

// ─── AI / Spatial Assistant ───────────────────────────────────────────────────

export type SpatialActionType =
  | 'focusObject'
  | 'highlightObject'
  | 'highlightCategory'
  | 'showObjectPhotos'
  | 'openInspector'
  | 'openCamera'
  | 'filterObjects'
  | 'setSceneMode'
  | 'showMeasurement'
  | 'showSafetyObservation'
  | 'resetScene'
  | 'showObjects';

export interface SpatialAction {
  type: SpatialActionType;
  objectId?: string;
  objectIds?: string[];
  category?: ObjectCategory;
  mode?: SceneMode;
  value?: unknown;
  message?: string;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  actions?: SpatialAction[];
  timestamp: Date;
}

// ─── Legacy Assembly types (preserved for backward compat) ────────────────────

export type ComponentStatus = 'pending' | 'active' | 'installed' | 'verified' | 'error';
export type ComponentType = 'frame' | 'motor' | 'battery' | 'pcb' | 'bracket' | 'screw' | 'washer' | 'propeller' | 'gear' | 'other';
export type StepDifficulty = 'easy' | 'medium' | 'hard';

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

// AI action (legacy, kept for the chat API)
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  actions?: AIAction[];
  timestamp: Date;
}

// Verification types (kept for VerificationPanel)
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

export interface VerificationStatus {
  status: 'idle' | 'scanning' | 'verified' | 'failed';
  confidence: number;
  checks: VerificationCheck[];
  issues: VerificationIssue[];
  isSimulated: boolean;
}
