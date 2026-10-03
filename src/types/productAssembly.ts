// AssemblyOS — Product & Assembly Type Definitions

export type PartCategory =
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

export type PartVisibility = 'visible' | 'inferred' | 'reference' | 'unknown';
export type PartStatus = 'installed' | 'removed' | 'isolated' | 'hidden';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface PartConnection {
  targetPartId: string;
  type: 'screw' | 'plug' | 'mount' | 'snap' | 'bearing' | 'bracket';
  description: string;
  isSecured: boolean;
}

export interface Part {
  id: string;
  name: string;
  category: PartCategory;
  description: string;
  material: string;
  dimensions?: string;
  weight?: string;
  partNumber?: string;
  position: Vector3D;
  explodedPosition: Vector3D;
  rotation: Vector3D;
  color: string;
  emissiveColor?: string;
  
  // Intelligence & Hierarchy
  parentId?: string;
  childrenIds?: string[];
  dependencies?: string[];      // Parts that require this part to function
  requiredBy?: string[];        // Parts this part relies on
  connections: PartConnection[];
  
  // Detection classification
  visibility: PartVisibility;
  detectionConfidence: number;  // 0 - 1
  
  // State
  status: PartStatus;
  photos: string[];             // URLs / DataUrls of attached part photos
  notes?: string[];
  replacementOptions?: Array<{
    name: string;
    partNumber: string;
    specs: string;
  }>;
}

export interface ProductAssembly {
  id: string;
  name: string;
  category: string;
  description: string;
  hierarchy: {
    name: string;
    category: string;
    children?: string[];
  }[];
  parts: Part[];
  functionalFlow?: {
    from: string;
    to: string;
    label: string;
  }[];
}

export interface AIProductAnalysis {
  productName: string;
  productCategory: string;
  confidence: number;
  isReferenceMatch: boolean;
  referenceAssemblyId: string;
  detectedVisibleParts: Array<{
    name: string;
    category: PartCategory;
    confidence: number;
    visibility: 'visible';
  }>;
  inferredParts: Array<{
    name: string;
    category: PartCategory;
    confidence: number;
    visibility: 'inferred';
    rationale: string;
  }>;
  referencePartsCount: number;
  summary: string;
}
