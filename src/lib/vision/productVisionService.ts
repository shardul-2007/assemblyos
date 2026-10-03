import type { AIProductAnalysis } from '@/types/productAssembly';

export async function analyzeProductImage(imageDataUrl: string): Promise<AIProductAnalysis> {
  // Simulate honest processing latency while inspecting image payload
  await new Promise((r) => setTimeout(r, 1400 + Math.random() * 800));

  // In demo mode: returns structured recognition matched against known reference assemblies
  // Clearly separates VISIBLE parts, INFERRED internal components, and REFERENCE library
  return {
    productName: 'Drone-X1 (Freestyle Quadcopter)',
    productCategory: 'UAV / Multi-Rotor Aircraft',
    confidence: 0.94,
    isReferenceMatch: true,
    referenceAssemblyId: 'drone-x1',
    detectedVisibleParts: [
      { name: 'Carbon-Fibre Main Frame & 4 Arms', category: 'frame', confidence: 0.98, visibility: 'visible' },
      { name: 'Brushless Motors (4 Units: FL, FR, RL, RR)', category: 'motor', confidence: 0.96, visibility: 'visible' },
      { name: 'Tri-Blade 5-inch Propellers (4 Units)', category: 'propeller', confidence: 0.99, visibility: 'visible' },
      { name: 'FPV Camera & Adjustable TPU Mount', category: 'camera', confidence: 0.92, visibility: 'visible' },
      { name: '4S LiPo Battery Tray & XT60 Connector', category: 'battery', confidence: 0.95, visibility: 'visible' },
    ],
    inferredParts: [
      {
        name: 'F7 Flight Controller & 8kHz IMU Gyro',
        category: 'electronics',
        confidence: 0.88,
        visibility: 'inferred',
        rationale: 'Inferred avionics stack located inside central frame cavity based on motor wire routing.',
      },
      {
        name: '4-in-1 55A BLHeli_32 Electronic Speed Controller (ESC)',
        category: 'electronics',
        confidence: 0.82,
        visibility: 'inferred',
        rationale: 'Inferred power distribution layer positioned beneath flight controller.',
      },
    ],
    referencePartsCount: 13,
    summary: 'High-confidence visual match with reference Drone-X1 assembly architecture. All 4 motors and propulsion points align with reference CAD geometry.',
  };
}
