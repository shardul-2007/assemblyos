import { type NextRequest, NextResponse } from 'next/server';
import { ChatRequestSchema } from '@/lib/ai/schemas';
import { demoAssistantResponse } from '@/lib/ai/demoAssistant';

// Provider abstraction — swap model by changing env vars
const AI_ENABLED = !!(process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ChatRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request', details: parsed.error.flatten() }, { status: 400 });
    }

    const { messages, currentStep, selectedComponent, assemblyState } = parsed.data;
    const lastUserMessage = messages[messages.length - 1]?.content ?? '';

    // Demo mode — no API key required
    if (!AI_ENABLED) {
      const response = await demoAssistantResponse(lastUserMessage, {
        currentStep,
        selectedComponent,
      });

      return NextResponse.json({
        message: response.message,
        actions: response.actions ?? [],
        mode: 'demo',
      });
    }

    // Real AI mode (when key exists)
    try {
      const { buildContextMessage, SYSTEM_PROMPT } = await import('@/lib/ai/prompts');
      const { createOpenAI } = await import('@ai-sdk/openai');
      const { generateText } = await import('ai');

      const openai = createOpenAI({
        apiKey: process.env.AI_GATEWAY_API_KEY || process.env.OPENAI_API_KEY,
      });

      const contextMessage = buildContextMessage(
        currentStep,
        selectedComponent,
        (assemblyState as Record<string, unknown>) ?? {}
      );

      const result = await generateText({
        model: openai('gpt-4o-mini'),
        system: SYSTEM_PROMPT,
        messages: [
          { role: 'user', content: contextMessage },
          ...messages,
        ],
      });

      let parsedResponse: { message: string; actions?: unknown[] };
      try {
        parsedResponse = JSON.parse(result.text);
      } catch {
        parsedResponse = { message: result.text, actions: [] };
      }

      return NextResponse.json({
        message: parsedResponse.message,
        actions: parsedResponse.actions ?? [],
        mode: 'ai',
      });
    } catch (aiError) {
      console.error('AI call failed, falling back to demo:', aiError);
      const response = await demoAssistantResponse(lastUserMessage, { currentStep, selectedComponent });
      return NextResponse.json({
        message: response.message,
        actions: response.actions ?? [],
        mode: 'fallback',
      });
    }
  } catch (err) {
    console.error('/api/chat error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
