import { type NextRequest, NextResponse } from 'next/server';
import { VerifyRequestSchema } from '@/lib/ai/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = VerifyRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const { currentStep } = parsed.data;

    // Simulated verification — clearly marked as demo
    await new Promise((r) => setTimeout(r, 1500));

    const confidence = 0.88 + Math.random() * 0.1;
    const hasIssue = Math.random() < 0.25; // 25% chance of simulated issue

    return NextResponse.json({
      status: hasIssue ? 'failed' : 'verified',
      confidence: Math.round(confidence * 100) / 100,
      currentStep,
      checks: [
        { id: 'frame-alignment', label: 'Frame Alignment', passed: true },
        { id: 'motor-orientation', label: 'Motor Orientation', passed: !hasIssue },
        { id: 'screw-placement', label: 'Screw Placement', passed: true },
        { id: 'battery-position', label: 'Battery Position', passed: true },
      ],
      issues: hasIssue
        ? [
            {
              id: 'issue-1',
              componentId: 'motor-rl',
              description: 'Motor orientation appears incorrect. The shaft should face vertically upward.',
              severity: 'warning',
            },
          ]
        : [],
      isSimulated: true,
      disclaimer: 'DEMO SIMULATION — This is not real computer vision verification.',
    });
  } catch {
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
