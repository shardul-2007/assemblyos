import type { Part } from '@/types/productAssembly';

export interface AssistantAction {
  type:
    | 'selectPart'
    | 'focusPart'
    | 'hidePart'
    | 'showPart'
    | 'removePart'
    | 'reattachPart'
    | 'explodeAssembly'
    | 'collapseAssembly'
    | 'isolatePart'
    | 'showDependencies'
    | 'setMode'
    | 'resetAssembly';
  partId?: string;
  partIds?: string[];
  mode?: 'inspect' | 'how-it-works' | 'dependencies';
}

export interface AssistantResponse {
  message: string;
  actions: AssistantAction[];
}

export async function processAssemblyAssistantQuery(
  query: string,
  parts: Part[]
): Promise<AssistantResponse> {
  const lower = query.toLowerCase().trim();
  await new Promise((r) => setTimeout(r, 300));

  // 1. Motors
  if (lower.includes('motor') || lower.includes('motors') || lower.includes('show motors')) {
    const motorIds = parts.filter((p) => p.category === 'motor').map((p) => p.id);
    return {
      message: `Found **4 Brushless Motors** (Front-Left, Front-Right, Rear-Left, Rear-Right). Each motor is a 2306/2400KV unit secured to the arm via four M3 screws.\n\nHighlighting all motors in the 3D assembly.`,
      actions: [{ type: 'selectPart', partId: 'motor-fl' }],
    };
  }

  // 2. Propellers
  if (lower.includes('propeller') || lower.includes('prop') || lower.includes('props')) {
    if (lower.includes('hide')) {
      return {
        message: 'Hiding all 4 propellers to allow clear inspection of the motor bells and shaft bearings.',
        actions: [
          { type: 'hidePart', partId: 'prop-fl' },
          { type: 'hidePart', partId: 'prop-fr' },
          { type: 'hidePart', partId: 'prop-rl' },
          { type: 'hidePart', partId: 'prop-rr' },
        ],
      };
    }
    return {
      message: 'Showing 5-inch tri-blade polycarbonate propellers (2× CW and 2× CCW pairs for counter-torque equilibrium).',
      actions: [{ type: 'selectPart', partId: 'prop-fl' }],
    };
  }

  // 3. Explode / Collapse
  if (lower.includes('explode') || lower.includes('separate')) {
    return {
      message: 'Exploding Drone-X1 along structural assembly axes. Components have physically separated by hierarchy.',
      actions: [{ type: 'explodeAssembly' }],
    };
  }
  if (lower.includes('collapse') || lower.includes('reassemble') || lower.includes('assemble')) {
    return {
      message: 'Collapsing assembly back to rigid operational state. All components locked into position.',
      actions: [{ type: 'collapseAssembly' }],
    };
  }

  // 4. Battery / Power
  if (lower.includes('battery') || lower.includes('power')) {
    if (lower.includes('remove') || lower.includes('what happens if i remove')) {
      return {
        message: `**Removing Battery (BAT-4S-1500)**:\n• Immediate loss of nominal 14.8V rail.\n• **Affected systems:** 4-in-1 ESC, F7 Flight Controller, FPV Camera, and all 4 motors.\n• Drone is de-energized.`,
        actions: [{ type: 'removePart', partId: 'battery' }],
      };
    }
    return {
      message: `**4S 1500mAh 120C LiPo Battery** is mounted along the bottom carbon plate. Connected to the 4-in-1 ESC via an XT60 plug. It directly powers the entire propulsion and compute stack.`,
      actions: [{ type: 'selectPart', partId: 'battery' }],
    };
  }

  // 5. Flight controller
  if (lower.includes('flight controller') || lower.includes('fc') || lower.includes('controller') || lower.includes('gyro')) {
    return {
      message: `**F7 Flight Controller & IMU**:\n• Central flight computer with STM32F722 processor.\n• Directly governs PID loops and throttle commands sent to the ESC.\n• Inferred internal stack position isolated with soft vibration gummies.`,
      actions: [{ type: 'selectPart', partId: 'fc' }],
    };
  }

  // 6. Remove front left motor
  if (lower.includes('remove front left motor') || (lower.includes('remove') && lower.includes('fl'))) {
    return {
      message: `Detached **Front-Left Motor (FL)** and disconnected its 3-phase motor leads. The front-left propeller cannot generate thrust until reattached.`,
      actions: [{ type: 'removePart', partId: 'motor-fl' }],
    };
  }

  // 7. How it works
  if (lower.includes('how it works') || lower.includes('how does it work') || lower.includes('functional')) {
    return {
      message: `Switching to **How It Works** mode.\n\n**Signal & Power Flow**:\n1. **Battery (14.8V DC)** $\\rightarrow$ **ESC**.\n2. **ESC (5V BEC)** $\\rightarrow$ **Flight Controller**.\n3. **FC Gyro** senses orientation $\\rightarrow$ sends **DShot600 pulses** $\\rightarrow$ **ESC**.\n4. **ESC** commutates 3-phase AC $\\rightarrow$ **Motors** $\\rightarrow$ **Propellers** generate lift.`,
      actions: [{ type: 'setMode', mode: 'how-it-works' }],
    };
  }

  // Default fallback
  return {
    message: `Assembly Copilot is ready. I understand the complete mechanical and electrical hierarchy of **Drone-X1** (${parts.length} parts).\n\nTry asking:\n• *"Show me the motors"*\n• *"Explode the drone"*\n• *"What happens if I remove the battery?"*\n• *"Show how it works"*`,
    actions: [],
  };
}
