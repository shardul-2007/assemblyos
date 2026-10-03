import type { Part, ProductAssembly, AIProductAnalysis } from '@/types/productAssembly';
import { DRONE_REFERENCE_ASSEMBLY } from '@/data/droneAssembly';

export interface ReferenceAssemblyEntry {
  id: string;
  name: string;
  category: string;
  keywords: string[];
  description: string;
  assembly: ProductAssembly;
}

// ─────────────────────────────────────────────────────────────────────────────
// REFERENCE PRODUCT CATALOG
// ─────────────────────────────────────────────────────────────────────────────

export const REFERENCE_ASSEMBLY_CATALOG: ReferenceAssemblyEntry[] = [
  {
    id: 'drone-x1',
    name: 'Drone-X1 (5-inch Freestyle Quadcopter)',
    category: 'UAV / Multi-Rotor Aircraft',
    keywords: ['drone', 'quadcopter', 'uav', 'multirotor', 'propeller', 'aerial', 'fpv'],
    description: 'Carbon-fibre airframe with 4 brushless motors, 4 propellers, F7 avionics, ESC, LiPo battery, and FPV camera.',
    assembly: DRONE_REFERENCE_ASSEMBLY,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// RECOGNITION ARCHETYPES (What the AI vision can recognize in an image)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductArchetype {
  productName: string;
  category: string;
  keywords: string[];
  referenceAssemblyId?: string;
  detectedVisibleParts: Array<{
    name: string;
    category: any;
    confidence?: number;
    visibility: 'visible';
  }>;
  inferredParts: Array<{
    name: string;
    category: any;
    confidence?: number;
    visibility: 'inferred';
    rationale: string;
  }>;
  summary: string;
}

export const KNOWN_PRODUCT_ARCHETYPES: ProductArchetype[] = [
  // 1. DRONE
  {
    productName: 'Freestyle Quadcopter',
    category: 'UAV / Multi-Rotor Aircraft',
    keywords: ['drone', 'quadcopter', 'uav', 'multirotor', 'fpv', 'propeller', 'copty'],
    referenceAssemblyId: 'drone-x1',
    detectedVisibleParts: [
      { name: 'Carbon-Fibre Main Frame & 4 Arms', category: 'frame', visibility: 'visible' },
      { name: 'Brushless Motors (4 Units)', category: 'motor', visibility: 'visible' },
      { name: 'Tri-Blade Propellers (4 Units)', category: 'propeller', visibility: 'visible' },
      { name: 'FPV Camera & Adjustable TPU Mount', category: 'camera', visibility: 'visible' },
      { name: '4S LiPo Battery Tray & XT60 Connector', category: 'battery', visibility: 'visible' },
    ],
    inferredParts: [
      {
        name: 'F7 Flight Controller & 8kHz IMU Gyro',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Inferred central compute flight stack located inside carbon frame cavity based on motor wire routing.',
      },
      {
        name: '4-in-1 55A BLHeli_32 Electronic Speed Controller (ESC)',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Inferred power distribution layer positioned beneath flight controller.',
      },
    ],
    summary: 'Visual evidence matches multirotor quadcopter architecture. All 4 propulsion points and airframe arms align with reference Drone-X1 CAD model.',
  },

  // 2. SMARTPHONE
  {
    productName: 'Modern Smartphone',
    category: 'Consumer Electronics / Mobile Device',
    keywords: ['phone', 'smartphone', 'mobile', 'iphone', 'android', 'screen', 'cellphone'],
    referenceAssemblyId: undefined, // Honest: No 3D reference CAD model in catalog yet!
    detectedVisibleParts: [
      { name: 'Front Glass Display Panel & Touch Digitizer', category: 'display', visibility: 'visible' },
      { name: 'Precision CNC Aluminum / Titanium Outer Chassis', category: 'frame', visibility: 'visible' },
      { name: 'Rear Multi-Lens Camera Island (Wide, Ultra-Wide, Tele)', category: 'camera', visibility: 'visible' },
      { name: 'USB-C / Lightning Bottom Power Port', category: 'electronics', visibility: 'visible' },
      { name: 'Side Volume & Power Push Buttons', category: 'housing', visibility: 'visible' },
    ],
    inferredParts: [
      {
        name: 'High-Density Lithium-Polymer Pouch Battery (3800-4500mAh)',
        category: 'battery',
        visibility: 'inferred',
        rationale: 'Internal power cell occupying 65% of interior chassis volume.',
      },
      {
        name: 'Stacked Logic Board (SoC, RAM & Flash Storage)',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Multi-layer PCB sealed beneath thermal dissipation graphite sheet.',
      },
      {
        name: 'Haptic Linear Resonance Actuator & Stereo Loudspeakers',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Sub-surface acoustic and vibration components.',
      },
    ],
    summary: 'Recognized smartphone device with glass front and multi-camera cluster. Visible exterior components identified. No compatible 3D reference CAD assembly is currently available in the library.',
  },

  // 3. LAPTOP
  {
    productName: 'Portable Clamshell Laptop',
    category: 'Compute & Workspace Device',
    keywords: ['laptop', 'notebook', 'macbook', 'keyboard', 'trackpad', 'thinkpad', 'computer'],
    referenceAssemblyId: undefined,
    detectedVisibleParts: [
      { name: 'IPS/OLED Display Lid Assembly & Bezel', category: 'display', visibility: 'visible' },
      { name: 'Dual-Axis Friction Display Hinges', category: 'bracket', visibility: 'visible' },
      { name: 'Scissor-Switch Chiclet Keyboard Deck', category: 'housing', visibility: 'visible' },
      { name: 'Precision Glass Haptic Trackpad', category: 'housing', visibility: 'visible' },
      { name: 'CNC Anodized Lower Chassis & Exhaust Grilles', category: 'frame', visibility: 'visible' },
    ],
    inferredParts: [
      {
        name: 'Main Motherboard with CPU/GPU SoC & Thermal Heatpipe Array',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Central logic compute assembly mounted directly to magnesium chassis.',
      },
      {
        name: 'Centrifugal Active Blower Cooling Fans',
        category: 'motor',
        visibility: 'inferred',
        rationale: 'Forced-air cooling units inferred from visible chassis exhaust vents.',
      },
      {
        name: 'Modular M.2 NVMe Solid State Storage Drive',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'High-speed storage module connected via internal PCIe slot.',
      },
      {
        name: 'Multi-Cell 60-80Wh Lithium Battery Pack',
        category: 'battery',
        visibility: 'inferred',
        rationale: 'Internal prismatic pack spanning palm-rest bottom housing.',
      },
    ],
    summary: 'Recognized portable laptop clamshell computer. Exterior interfaces identified. No 3D CAD reference model currently loaded for this category.',
  },

  // 4. DIGITAL CAMERA
  {
    productName: 'Mirrorless / DSLR Digital Camera',
    category: 'Optical & Imaging Hardware',
    keywords: ['camera', 'dslr', 'mirrorless', 'lens', 'nikon', 'canon', 'sony', 'optics'],
    referenceAssemblyId: undefined,
    detectedVisibleParts: [
      { name: 'Optical Multi-Element Lens Barrel Assembly', category: 'camera', visibility: 'visible' },
      { name: 'Ergonomic Grip Body & Rubberized Thumb Pad', category: 'housing', visibility: 'visible' },
      { name: 'Top Mechanical Shutter Button & Mode Command Dials', category: 'electronics', visibility: 'visible' },
      { name: 'Articulating Rear LCD Monitoring Screen', category: 'display', visibility: 'visible' },
      { name: 'Top Hot-Shoe Flash Mount', category: 'bracket', visibility: 'visible' },
    ],
    inferredParts: [
      {
        name: 'CMOS Full-Frame / APS-C Imaging Sensor with 5-Axis IBIS',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Image capture transducer mounted behind lens bayonet flange.',
      },
      {
        name: 'High-Speed Mechanical Focal-Plane Shutter Mechanism',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'Precision curtain shutter positioned directly in front of imaging plane.',
      },
      {
        name: 'Rechargeable Li-Ion Grip Battery Pack',
        category: 'battery',
        visibility: 'inferred',
        rationale: 'Removable power module located in internal bottom handgrip cavity.',
      },
    ],
    summary: 'Recognized optical digital camera. Exterior controls and lens barrel mapped. No 3D reference CAD model available.',
  },

  // 5. ELECTRIC MOTOR / INDUSTRIAL MACHINE
  {
    productName: 'Industrial Electric Motor',
    category: 'Electro-Mechanical Power Equipment',
    keywords: ['motor', 'engine', 'dynamo', 'rotor', 'stator', 'spindle', 'machinery', 'generator'],
    referenceAssemblyId: undefined,
    detectedVisibleParts: [
      { name: 'Cast Iron / Extruded Aluminum Stator Housing Body', category: 'housing', visibility: 'visible' },
      { name: 'Ground Steel Drive Output Shaft with Keyway', category: 'motor', visibility: 'visible' },
      { name: 'Machined Cast End-Bell Flange & Mounting Feet', category: 'frame', visibility: 'visible' },
      { name: 'Sealed Conduit Electrical Terminal Junction Box', category: 'electronics', visibility: 'visible' },
      { name: 'Rear Protective Cowling & Impeller Cooling Fan', category: 'housing', visibility: 'visible' },
    ],
    inferredParts: [
      {
        name: 'Copper Enamelled Stator Electromagnetic Windings',
        category: 'electronics',
        visibility: 'inferred',
        rationale: 'High-density copper coils wound through stator iron laminations.',
      },
      {
        name: 'Precision Deep-Groove Ball Bearings (Drive & Non-Drive End)',
        category: 'bracket',
        visibility: 'inferred',
        rationale: 'Dual rotational supports seated within end-bell housings.',
      },
      {
        name: 'Squirrel-Cage / Permanent Magnet Rotor Core',
        category: 'motor',
        visibility: 'inferred',
        rationale: 'Balanced internal rotational core pressed onto output shaft.',
      },
    ],
    summary: 'Recognized industrial electric motor. Exterior casing, drive shaft, and cooling cowl detected. No 3D CAD model available in catalog.',
  },
];
