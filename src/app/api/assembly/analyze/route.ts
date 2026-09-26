import { type NextRequest, NextResponse } from 'next/server';
import { AnalyzeRequestSchema } from '@/lib/ai/schemas';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = AnalyzeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // MVP: return mock analysis — production would run ML pipeline
    await new Promise((r) => setTimeout(r, 2000)); // simulate processing

    return NextResponse.json({
      status: 'ready',
      modelId: parsed.data.modelId,
      components: [
        { id: 'auto-1', name: 'Component A', type: 'other' },
        { id: 'auto-2', name: 'Component B', type: 'other' },
      ],
      estimatedSteps: 18,
      tools: ['Allen Key Set', 'Screwdriver'],
      warnings: [],
      simulated: true,
      note: 'This is a simulated analysis for demo purposes.',
    });
  } catch {
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
