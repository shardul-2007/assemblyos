// AssemblyOS — Machine Graph & Perception Architecture
// Ground truth definition for the perception -> machine graph -> 3D projection pipeline

export type EvidenceLevel = 'visible' | 'inferred' | 'reference' | 'unknown';
export type ConfidenceTier = 'high' | 'medium' | 'low' | 'unknown';
export type ComponentStatus = 'installed' | 'removed' | 'isolated' | 'hidden';

export type ComponentCategory =
  | 'frame'
  | 'motor'
  | 'propeller'
  | 'electronics'
  | 'battery'
  | 'camera'
  | 'bracket'
  | 'fastener'
  | 'sensor'
  | 'housing'
  | 'display'
  | 'other';

export interface BoundingBox2D {
  x: number;      // 0 - 1 normalized
  y: number;      // 0 - 1 normalized
  width: number;  // 0 - 1 normalized
  height: number; // 0 - 1 normalized
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface GraphRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: 'mountedOn' | 'powers' | 'controls' | 'drives' | 'connectsTo' | 'protects';
  label: string;
  evidence: EvidenceLevel;
  confidence: ConfidenceTier;
  description?: string;
}

export interface MachineComponent {
  id: string;                      // Stable Canonical ID (e.g., 'drone-x1.motor.fl')
  name: string;
  category: ComponentCategory;
  description: string;
  
  // Evidence & Traceability
  evidence: EvidenceLevel;
  confidence: ConfidenceTier;
  confidenceScore?: number;        // Raw numeric score only if returned by actual vision engine
  evidenceRationale?: string;      // Technical explanation of why it was inferred or detected
  observedInImages?: number[];     // Indices of source photos where this component is visible
  boundingBox?: BoundingBox2D;     // 2D ROI on the primary source photo for interactive overlay
  
  // 3D Spatial Projection
  position: Vector3D;
  explodedPosition: Vector3D;
  rotation: Vector3D;
  dimensions?: Vector3D;
  color: string;
  emissiveColor?: string;
  
  // Graph Topology & State
  parentId?: string;
  childrenIds?: string[];
  dependencies?: string[];         // Downstream components that rely on this component
  status: ComponentStatus;
  
  // Engineering Metadata
  material?: string;
  partNumber?: string;
  photos: string[];                // User captured forensic / close-up photos
  replacementOptions?: Array<{
    name: string;
    partNumber: string;
    specs: string;
    compatibility: 'full' | 'upgrade' | 'modified';
  }>;
}

export interface ReferenceCandidate {
  id: string;
  name: string;
  category: string;
  compatibilityTier: 'high' | 'medium' | 'low';
  matchedFeatures: string[];
  unmatchedFeatures: string[];
  rationale: string;
  componentCount: number;
}

export interface MachineGraph {
  id: string;
  productName: string;
  category: string;
  description: string;
  overallConfidence: ConfidenceTier;
  confidenceScore?: number;
  
  // Core Graph Nodes & Edges
  components: MachineComponent[];
  relationships: GraphRelationship[];
  
  // Reference Library Integration
  referenceCandidates: ReferenceCandidate[];
  selectedReferenceId?: string;
  
  // Forensic / Pipeline Provenance
  sourceImages: Array<{
    id: string;
    url: string;
    aspectRatio: number;
    resolution?: string;
    angleHint?: string;
    qualityIssues?: string[];
  }>;
  analysisTimeline: Array<{
    step: string;
    timestamp: number;
    details?: string;
  }>;
  warnings: string[];
  limitations: string[];
}
