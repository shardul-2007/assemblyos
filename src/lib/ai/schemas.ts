import { z } from 'zod';
import type { AIAction, AIActionType } from '@/types/assembly';

// ── Zod Schemas for AI action validation ─────────────────────────────────────

export const AIActionTypeSchema = z.enum([
  'focusComponent',
  'highlightComponent',
  'setExplodedView',
  'setAssemblyStep',
  'showAssemblyAnimation',
  'explainComponent',
  'showMeasurement',
  'verifyAssembly',
  'resetScene',
] as [AIActionType, ...AIActionType[]]);

export const AIActionSchema = z.object({
  type: AIActionTypeSchema,
  componentId: z.string().optional(),
  stepIndex: z.number().int().min(1).max(18).optional(),
  value: z.union([z.number(), z.boolean(), z.string()]).optional(),
});

export const AIResponseSchema = z.object({
  message: z.string().min(1),
  actions: z.array(AIActionSchema).optional(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant'] as const),
      content: z.string(),
    })
  ),
  currentStep: z.number().int().min(1).max(18),
  selectedComponent: z.string().nullable().optional(),
  product: z.string().default('drone-x1'),
  assemblyState: z.record(z.string(), z.unknown()).optional(),
});

export const AnalyzeRequestSchema = z.object({
  modelId: z.string(),
  fileName: z.string(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const VerifyRequestSchema = z.object({
  productId: z.string(),
  currentStep: z.number(),
  expectedComponents: z.array(z.string()),
  detectedState: z.record(z.string(), z.unknown()),
});

// Validate and parse AI actions (never execute raw model output)
export function parseAIActions(raw: unknown): AIAction[] {
  if (!Array.isArray(raw)) return [];
  const result: AIAction[] = [];
  for (const item of raw) {
    const parsed = AIActionSchema.safeParse(item);
    if (parsed.success) {
      result.push(parsed.data as AIAction);
    }
  }
  return result;
}
