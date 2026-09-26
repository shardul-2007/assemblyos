import type { AIResponse } from '@/types/assembly';
import { DRONE_COMPONENTS, ASSEMBLY_STEPS } from '@/data/demoProduct';

// ── Keyword-based demo assistant — works with NO API key ─────────────────────

interface DemoContext {
  currentStep: number;
  selectedComponent?: string | null;
}

function getComponentById(id: string) {
  return DRONE_COMPONENTS.find((c) => c.id === id);
}

function getStepByOrder(order: number) {
  return ASSEMBLY_STEPS.find((s) => s.order === order);
}

const responses: Array<{
  keywords: string[];
  handler: (ctx: DemoContext, query: string) => AIResponse;
}> = [
  {
    keywords: ['screw', 'screws', 'bolt', 'fastener'],
    handler: (ctx) => {
      const step = getStepByOrder(ctx.currentStep);
      return {
        message: `For Step ${ctx.currentStep}, use **M3 × 8mm stainless steel hex socket screws** (Part #DX1-SCR-M3x8). You'll need four per motor — 16 total. Tighten in a cross pattern for even clamping pressure. ${step?.tools.includes('4mm Allen Key') ? 'A 4mm Allen Key is required.' : ''}`,
        actions: [
          { type: 'highlightComponent', componentId: 'screw-m3' },
        ],
      };
    },
  },
  {
    keywords: ['motor', 'motors', 'where motor', 'mount motor'],
    handler: (ctx) => {
      const activeMotors: Record<number, string> = {
        5: 'motor-fl',
        6: 'motor-fr',
        7: 'motor-rl',
        8: 'motor-rr',
      };
      const motorId = activeMotors[ctx.currentStep] ?? 'motor-rl';
      return {
        message: `The **motor** attaches to its corresponding motor arm bracket. Align the four mounting holes, insert M3 × 8mm screws through washers, and tighten in a cross pattern. I've highlighted the target motor and bracket in the 3D view.`,
        actions: [
          { type: 'highlightComponent', componentId: motorId },
          { type: 'focusComponent', componentId: motorId },
        ],
      };
    },
  },
  {
    keywords: ['battery', 'power', 'lipo'],
    handler: () => ({
      message: `The **4S 1500mAh LiPo battery** (Part #DX1-BAT-4S) slides into the bottom frame tray. Orient the XT60 connector toward the rear. Secure with the battery strap. **Do not connect the battery until all electronics are fully installed and verified.**`,
      actions: [
        { type: 'highlightComponent', componentId: 'battery' },
        { type: 'focusComponent', componentId: 'battery' },
      ],
    }),
  },
  {
    keywords: ['pcb', 'flight controller', 'fc', 'board'],
    handler: () => ({
      message: `The **F7 Flight Controller PCB** (Part #DX1-FC-F7) mounts on the central stack using vibration-damping M2 standoffs. Orient the USB-C port toward the rear of the frame. Handle by edges only to avoid static discharge.`,
      actions: [
        { type: 'highlightComponent', componentId: 'pcb' },
        { type: 'focusComponent', componentId: 'pcb' },
      ],
    }),
  },
  {
    keywords: ['propeller', 'prop', 'blade'],
    handler: () => ({
      message: `Use 5" tri-blade propellers. **CW propellers** go on FL and RR motors; **CCW propellers** on FR and RL. The grey stripe indicates CW. Tighten with the prop spanner — note the CCW-threaded prop nut on CW motors (tighten clockwise).`,
      actions: [
        { type: 'highlightComponent', componentId: 'prop-fl' },
      ],
    }),
  },
  {
    keywords: ['frame', 'chassis', 'body'],
    handler: () => ({
      message: `The **Main Frame** (Part #DX1-FRM-001) is a carbon-fibre composite chassis weighing 180g. It's the central structural element. All motor arms, the PCB stack, battery tray, and landing gear attach to it.`,
      actions: [
        { type: 'highlightComponent', componentId: 'frame' },
        { type: 'focusComponent', componentId: 'frame' },
      ],
    }),
  },
  {
    keywords: ['explode', 'exploded', 'blow up', 'separate'],
    handler: () => ({
      message: `Switching to **exploded view** so you can see how every component relates to the others. Drag the slider at the bottom to control the explode amount.`,
      actions: [{ type: 'setExplodedView', value: true }],
    }),
  },
  {
    keywords: ['assemble', 'assembled', 'close', 'together', 'reset view'],
    handler: () => ({
      message: `Returning to the **assembled view**. All components will animate back to their installed positions.`,
      actions: [{ type: 'setExplodedView', value: false }],
    }),
  },
  {
    keywords: ['next step', 'next', 'continue', 'proceed'],
    handler: (ctx) => {
      const next = getStepByOrder(ctx.currentStep + 1);
      return {
        message: next
          ? `Moving to **Step ${next.order}: ${next.title}**. ${next.description.split('.')[0]}.`
          : `You're on the final step — almost done!`,
        actions: next ? [{ type: 'setAssemblyStep', stepIndex: next.order }] : [],
      };
    },
  },
  {
    keywords: ['previous step', 'previous', 'back', 'go back'],
    handler: (ctx) => {
      const prev = getStepByOrder(ctx.currentStep - 1);
      return {
        message: prev
          ? `Going back to **Step ${prev.order}: ${prev.title}**.`
          : `You're at the beginning of the assembly.`,
        actions: prev ? [{ type: 'setAssemblyStep', stepIndex: prev.order }] : [],
      };
    },
  },
  {
    keywords: ['show me', 'demonstrate', 'animation', 'animate'],
    handler: (ctx) => ({
      message: `Starting the **Show Me** animation for Step ${ctx.currentStep}. Watch how the component moves into position. Irrelevant parts will be hidden for clarity.`,
      actions: [{ type: 'showAssemblyAnimation', stepIndex: ctx.currentStep }],
    }),
  },
  {
    keywords: ['verify', 'check', 'inspection', 'confirm', 'correct'],
    handler: () => ({
      message: `Launching **assembly verification**. This is a demo simulation — the system will check component placement, orientation, and fastener torque indicators.`,
      actions: [{ type: 'verifyAssembly' }],
    }),
  },
  {
    keywords: ['reset', 'start over', 'restart'],
    handler: () => ({
      message: `Resetting the assembly to the beginning. All progress will be cleared.`,
      actions: [{ type: 'resetScene' }],
    }),
  },
  {
    keywords: ['tool', 'tools', 'what tool', 'which tool'],
    handler: (ctx) => {
      const step = getStepByOrder(ctx.currentStep);
      return {
        message: step?.tools.length
          ? `For Step ${ctx.currentStep} you need: **${step.tools.join(', ')}**.`
          : `No special tools are required for Step ${ctx.currentStep}.`,
        actions: [],
      };
    },
  },
  {
    keywords: ['what is this', 'what is', 'explain', 'tell me about', 'describe'],
    handler: (ctx) => {
      const comp = ctx.selectedComponent ? getComponentById(ctx.selectedComponent) : null;
      if (comp) {
        return {
          message: `**${comp.name}** (${comp.partNumber ?? 'N/A'})\n\n${comp.description}\n\n- **Material:** ${comp.material}\n- **Weight:** ${comp.weight ?? 'N/A'}\n- **Introduced at step:** ${comp.stepIntroduced}${comp.requiredTool ? `\n- **Required tool:** ${comp.requiredTool}` : ''}`,
          actions: [
            { type: 'highlightComponent', componentId: comp.id },
          ],
        };
      }
      const step = getStepByOrder(ctx.currentStep);
      return {
        message: step
          ? `**Step ${step.order}: ${step.title}**\n\n${step.description}\n\nDifficulty: ${step.difficulty} | Duration: ${step.duration}`
          : `Select a component to get more information about it.`,
        actions: [],
      };
    },
  },
  {
    keywords: ['help', 'how to', 'how do i', 'guide'],
    handler: (ctx) => ({
      message: `I'm your **AssemblyOS Copilot**. Here's what I can do:\n\n- Answer questions about components and steps\n- Highlight parts in the 3D view\n- Trigger the **Show Me** animation\n- Switch between assembled and exploded views\n- Navigate between assembly steps\n\nYou're currently on **Step ${ctx.currentStep}**. Ask me anything!`,
      actions: [],
    }),
  },
  {
    keywords: ['bracket', 'arm', 'mount'],
    handler: (ctx) => ({
      message: `The **motor brackets** are carbon-fibre arm extensions that connect the motors to the central frame. There are four — one per motor position (FL, FR, RL, RR). Each is secured to the frame at Step 2.`,
      actions: [
        { type: 'highlightComponent', componentId: 'bracket-rl' },
      ],
    }),
  },
  {
    keywords: ['washer', 'washers'],
    handler: () => ({
      message: `Use **M3 stainless steel flat washers** (Part #DX1-WSH-M3) between the motor mounting plate and the screws. They distribute clamping force and protect the carbon-fibre arm surface. 16 are required total.`,
      actions: [{ type: 'highlightComponent', componentId: 'washer' }],
    }),
  },
  {
    keywords: ['landing', 'gear', 'legs'],
    handler: () => ({
      message: `The **Landing Gear** consists of aluminium alloy struts with TPU (rubber) tips to absorb impact on landing. They attach to the underside of the frame at Step 4 using Phillips #2 screws.`,
      actions: [
        { type: 'highlightComponent', componentId: 'landing-gear' },
        { type: 'focusComponent', componentId: 'landing-gear' },
      ],
    }),
  },
];

function computeResponse(query: string, ctx: DemoContext): AIResponse {
  const lower = query.toLowerCase();

  for (const entry of responses) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.handler(ctx, query);
    }
  }

  // Default fallback
  const step = getStepByOrder(ctx.currentStep);
  return {
    message: `You're working on **Step ${ctx.currentStep}: ${step?.title ?? 'Unknown'}**. ${step?.description ?? ''}\n\nAsk me about any component, tool, or step — or say **"show me"** to see a guided animation.`,
    actions: [],
  };
}

// Simulated streaming delay
export async function demoAssistantResponse(
  query: string,
  ctx: DemoContext
): Promise<AIResponse> {
  await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
  return computeResponse(query, ctx);
}
