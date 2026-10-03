// AssemblyOS — Vision Service abstraction
// Supports: demo (local), OpenAI vision, Gemini vision

import type { Detection, ObjectCategory } from '@/types/spatial';

export interface VisionAnalysisResult {
  objects: Detection[];
  observations: string[];
  ocrText?: string[];
  mode: 'demo' | 'ai';
  confidence: number;
}

export interface VisionProvider {
  name: string;
  analyze(imageDataUrl: string, context?: string): Promise<VisionAnalysisResult>;
}

// ─── Demo provider (no API key required) ─────────────────────────────────────

export class DemoVisionProvider implements VisionProvider {
  name = 'Demo Analysis';

  async analyze(imageDataUrl: string): Promise<VisionAnalysisResult> {
    // Simulate processing time
    await new Promise((r) => setTimeout(r, 1800 + Math.random() * 1200));

    // Return deterministic demo detections
    const { DEMO_DETECTIONS } = await import('@/data/demoSpace');

    const detections: Detection[] = DEMO_DETECTIONS.map((d, i) => ({
      id: `det-${Date.now()}-${i}`,
      name: d.name,
      category: d.category as ObjectCategory,
      confidence: d.confidence,
      boundingBox: {
        x: 0.05 + Math.random() * 0.4,
        y: 0.05 + Math.random() * 0.4,
        w: 0.1 + Math.random() * 0.3,
        h: 0.1 + Math.random() * 0.3,
      },
      isConfirmed: false,
      isRejected: false,
    }));

    return {
      objects: detections,
      observations: [
        'AI observation — verify on site. Multiple machines detected. Ensure adequate clearance between equipment.',
        'AI observation — verify on site. Fire extinguisher detected near east wall. Verify inspection tag is current.',
        'AI observation — verify on site. Electrical panel detected. Ensure minimum clearance of 1m is maintained.',
      ],
      mode: 'demo',
      confidence: 0.91,
    };
  }
}

// ─── OpenAI Vision provider ───────────────────────────────────────────────────

export class OpenAIVisionProvider implements VisionProvider {
  name = 'OpenAI Vision';

  async analyze(imageDataUrl: string, context?: string): Promise<VisionAnalysisResult> {
    const response = await fetch('/api/vision/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: imageDataUrl, context }),
    });

    if (!response.ok) throw new Error('Vision API error');
    const data = await response.json();

    return {
      objects: data.objects ?? [],
      observations: data.observations ?? [],
      ocrText: data.ocrText ?? [],
      mode: 'ai',
      confidence: data.confidence ?? 0,
    };
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

const AI_ENABLED = typeof window !== 'undefined'
  ? false // Check is server-side only
  : !!(process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY);

export const visionService: VisionProvider = new DemoVisionProvider();

export async function analyzeImage(
  imageDataUrl: string,
  context?: string
): Promise<VisionAnalysisResult> {
  return visionService.analyze(imageDataUrl, context);
}
