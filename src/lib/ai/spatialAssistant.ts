// AssemblyOS — Spatial Demo Assistant
// Keyword-matching AI that fully controls the spatial store without an API key

import type { AssistantMessage, SpatialAction, SpatialObject } from '@/types/spatial';
import type { useSpatialStore } from '@/store/spatialStore';

interface AssistantContext {
  objects: SpatialObject[];
  spaceName: string;
}

interface AssistantResponse {
  message: string;
  actions: SpatialAction[];
}

type Handler = (ctx: AssistantContext, input: string) => AssistantResponse;

function matchesAny(input: string, keywords: string[]): boolean {
  const lower = input.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

function getObjectsByCategory(objects: SpatialObject[], category: string) {
  return objects.filter((o) => o.category === category);
}

function getObjectsByStatus(objects: SpatialObject[], status: string) {
  return objects.filter((o) => o.status === status);
}

function findObject(objects: SpatialObject[], query: string): SpatialObject | undefined {
  const lower = query.toLowerCase();
  return objects.find(
    (o) =>
      o.name.toLowerCase().includes(lower) ||
      o.type.toLowerCase().includes(lower) ||
      o.metadata.tags?.some((t) => t.toLowerCase().includes(lower))
  );
}

const handlers: Array<{ keywords: string[]; handle: Handler }> = [
  // ── Machine queries ─────────────────────────────────────────────────────────
  {
    keywords: ['all machines', 'show machines', 'machines', 'equipment', 'show all machines'],
    handle: (ctx) => {
      const machines = getObjectsByCategory(ctx.objects, 'machine');
      const ids = machines.map((m) => m.id);
      return {
        message: `Found **${machines.length} machines** in ${ctx.spaceName}:\n${machines.map((m) => `• ${m.name}`).join('\n')}\n\nHighlighting all machines in the scene.`,
        actions: [{ type: 'highlightCategory', category: 'machine' }],
      };
    },
  },

  // ── CNC machine ─────────────────────────────────────────────────────────────
  {
    keywords: ['cnc', 'milling machine', 'milling', 'haas'],
    handle: (ctx) => {
      const obj = findObject(ctx.objects, 'cnc');
      if (!obj) return { message: 'No CNC machine found in the current space.', actions: [] };
      return {
        message: `**${obj.name}** is located in ${obj.metadata.location ?? 'the scene'}.\n\nStatus: **${obj.status.replace('_', ' ')}**\nAI Confidence: ${Math.round(obj.confidence * 100)}%\n\nOpening inspector...`,
        actions: [
          { type: 'focusObject', objectId: obj.id },
          { type: 'openInspector', objectId: obj.id },
        ],
      };
    },
  },

  // ── CNC photos ──────────────────────────────────────────────────────────────
  {
    keywords: ['cnc machine photos', 'cnc photos', 'show cnc machine photos', 'milling machine photos'],
    handle: (ctx) => {
      const obj = findObject(ctx.objects, 'cnc');
      if (!obj) return { message: 'No CNC machine found.', actions: [] };
      return {
        message: `Opening photo gallery for **${obj.name}**. The machine has ${obj.photos.length} photo(s) attached.\n\nUse **"+ Capture Photo"** in the inspector to add new photos.`,
        actions: [
          { type: 'focusObject', objectId: obj.id },
          { type: 'showObjectPhotos', objectId: obj.id },
          { type: 'openInspector', objectId: obj.id },
        ],
      };
    },
  },

  // ── Inspection / maintenance ─────────────────────────────────────────────────
  {
    keywords: ['inspection', 'needs inspection', 'require inspection', 'inspection required', 'maintenance', 'maintenance due'],
    handle: (ctx) => {
      const pending = getObjectsByStatus(ctx.objects, 'inspection_required');
      const maintenance = getObjectsByStatus(ctx.objects, 'maintenance_due');
      const all = [...pending, ...maintenance];
      if (all.length === 0) {
        return { message: 'All objects are showing **Operational** status. No inspections required at this time.', actions: [] };
      }
      return {
        message: `**${all.length} object(s) require attention:**\n${all.map((o) => `• ${o.name} — ${o.status.replace('_', ' ')}`).join('\n')}\n\nHighlighting affected objects.`,
        actions: [{ type: 'showObjects', objectIds: all.map((o) => o.id) }],
      };
    },
  },

  // ── Safety / fire extinguisher ───────────────────────────────────────────────
  {
    keywords: ['safety', 'fire extinguisher', 'fire', 'emergency', 'safety equipment'],
    handle: (ctx) => {
      const safety = getObjectsByCategory(ctx.objects, 'safety');
      return {
        message: `Found **${safety.length} safety-related object(s)**:\n${safety.map((o) => `• ${o.name}`).join('\n')}\n\nAI observation — verify on site. Always ensure safety equipment is unobstructed and inspection tags are current.`,
        actions: [{ type: 'highlightCategory', category: 'safety' }],
      };
    },
  },

  // ── Obstruction / movement ───────────────────────────────────────────────────
  {
    keywords: ['obstruct', 'block', 'movement', 'pathway', 'walkway', 'clearance'],
    handle: (ctx) => {
      const machines = getObjectsByCategory(ctx.objects, 'machine');
      const equipment = getObjectsByCategory(ctx.objects, 'equipment');
      const possible = [...machines, ...equipment].slice(0, 3);
      return {
        message: `**AI observation — verify on site.** The following objects may affect movement corridors:\n${possible.map((o) => `• ${o.name} (${o.dimensions ? `${o.dimensions.width}m × ${o.dimensions.depth}m` : 'dimensions unknown'})`).join('\n')}\n\nThis is an AI estimate only. A physical walkthrough is required for accurate assessment.`,
        actions: possible.length > 0 ? [{ type: 'showObjects', objectIds: possible.map((o) => o.id) }] : [],
      };
    },
  },

  // ── Furniture ────────────────────────────────────────────────────────────────
  {
    keywords: ['furniture', 'chairs', 'tables', 'sofa', 'desk', 'seating', 'all chairs'],
    handle: (ctx) => {
      const furniture = getObjectsByCategory(ctx.objects, 'furniture');
      return {
        message: `Found **${furniture.length} furniture items**:\n${furniture.map((o) => `• ${o.name}`).join('\n')}`,
        actions: [{ type: 'highlightCategory', category: 'furniture' }],
      };
    },
  },

  // ── Electrical ───────────────────────────────────────────────────────────────
  {
    keywords: ['electrical', 'control panel', 'server', 'server rack', 'panel'],
    handle: (ctx) => {
      const electrical = getObjectsByCategory(ctx.objects, 'electrical');
      const panel = findObject(ctx.objects, 'control');
      const actions: SpatialAction[] = [{ type: 'highlightCategory', category: 'electrical' }];
      if (matchesAny('control panel', ['control panel', 'panel']) && panel) {
        actions.push({ type: 'focusObject', objectId: panel.id });
      }
      return {
        message: `Found **${electrical.length} electrical item(s)**:\n${electrical.map((o) => `• ${o.name}`).join('\n')}`,
        actions,
      };
    },
  },

  // ── Count / how many ────────────────────────────────────────────────────────
  {
    keywords: ['how many', 'count', 'total', 'number of'],
    handle: (ctx, input) => {
      const lower = input.toLowerCase();
      let list = ctx.objects;
      let label = 'objects';

      if (lower.includes('machine')) { list = getObjectsByCategory(ctx.objects, 'machine'); label = 'machines'; }
      else if (lower.includes('furniture')) { list = getObjectsByCategory(ctx.objects, 'furniture'); label = 'furniture items'; }
      else if (lower.includes('electrical')) { list = getObjectsByCategory(ctx.objects, 'electrical'); label = 'electrical items'; }
      else if (lower.includes('safety')) { list = getObjectsByCategory(ctx.objects, 'safety'); label = 'safety items'; }

      return {
        message: `There are **${list.length} ${label}** in **${ctx.spaceName}**:\n${list.map((o) => `• ${o.name} (${Math.round(o.confidence * 100)}%)`).join('\n')}`,
        actions: [],
      };
    },
  },

  // ── Espresso / coffee machine ────────────────────────────────────────────────
  {
    keywords: ['espresso', 'coffee', 'la marzocco', 'linea'],
    handle: (ctx) => {
      const obj = findObject(ctx.objects, 'espresso');
      if (!obj) return { message: 'No espresso machine found.', actions: [] };
      return {
        message: `**${obj.name}** — ${obj.metadata.manufacturer ?? ''} ${obj.metadata.model ?? ''}.\nLocated: ${obj.metadata.location ?? 'bar area'}\nStatus: **${obj.status}**\n\nOpening inspector...`,
        actions: [
          { type: 'focusObject', objectId: obj.id },
          { type: 'openInspector', objectId: obj.id },
        ],
      };
    },
  },

  // ── Reset ────────────────────────────────────────────────────────────────────
  {
    keywords: ['reset', 'clear', 'show all', 'normal view'],
    handle: (ctx) => ({
      message: 'Scene reset. All objects visible.',
      actions: [{ type: 'resetScene' }],
    }),
  },

  // ── Photos query ─────────────────────────────────────────────────────────────
  {
    keywords: ['photos', 'photographed', 'captured today', 'images'],
    handle: (ctx) => {
      const withPhotos = ctx.objects.filter((o) => o.photos.length > 0);
      if (withPhotos.length === 0) {
        return {
          message: 'No objects have photos yet. Click **Capture** in the toolbar to photograph a machine or space.',
          actions: [],
        };
      }
      return {
        message: `**${withPhotos.length} object(s) have photos attached:**\n${withPhotos.map((o) => `• ${o.name} (${o.photos.length} photo${o.photos.length > 1 ? 's' : ''})`).join('\n')}`,
        actions: [{ type: 'showObjects', objectIds: withPhotos.map((o) => o.id) }],
      };
    },
  },
];

// ─── Main exported function ───────────────────────────────────────────────────

export async function demoSpatialAssistant(
  input: string,
  context: AssistantContext
): Promise<AssistantResponse> {
  await new Promise((r) => setTimeout(r, 400 + Math.random() * 400));

  for (const { keywords, handle } of handlers) {
    if (matchesAny(input, keywords)) {
      return handle(context, input);
    }
  }

  // Fallback: generic object lookup
  const found = findObject(context.objects, input);
  if (found) {
    return {
      message: `Found **${found.name}** in the scene.\n\nCategory: ${found.category}\nStatus: ${found.status.replace('_', ' ')}\nConfidence: ${Math.round(found.confidence * 100)}%\n\n${found.observations.length > 0 ? `**AI Observation:** ${found.observations[0].content}` : ''}`,
      actions: [
        { type: 'focusObject', objectId: found.id },
        { type: 'openInspector', objectId: found.id },
      ],
    };
  }

  // Default
  return {
    message: `I can help you explore **${context.spaceName}**. The space contains ${context.objects.length} detected objects.\n\nTry asking:\n• "Show me all machines"\n• "Which objects need inspection?"\n• "Where is the CNC machine?"\n• "Show me safety equipment"\n• "How many furniture items are there?"`,
    actions: [],
  };
}
