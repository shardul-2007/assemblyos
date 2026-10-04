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
  await new Promise((r) => setTimeout(r, 250));

  // 1. Reassemble / Reset All
  if (
    lower.includes('reassemble') ||
    lower.includes('reset') ||
    lower.includes('put back') ||
    lower.includes('restore')
  ) {
    return {
      message:
        'Reassembling all components back to installed positions. Power buses, signal traces, and mechanical fasteners restored.',
      actions: [{ type: 'collapseAssembly' }, { type: 'resetAssembly' }],
    };
  }

  // 2. Explode / Separate
  if (lower.includes('explode') || lower.includes('separate') || lower.includes('disassemble')) {
    return {
      message:
        'Exploding Drone-X1 along structural assembly axes. 13 components separated by functional hierarchy.',
      actions: [{ type: 'explodeAssembly' }],
    };
  }
  if (lower.includes('collapse') || lower.includes('assemble')) {
    return {
      message: 'Collapsing assembly back to rigid operational state. All components locked into position.',
      actions: [{ type: 'collapseAssembly' }],
    };
  }

  // 3. Motors
  if (lower.includes('motor') || lower.includes('motors')) {
    if (lower.includes('remove') && (lower.includes('fl') || lower.includes('front left'))) {
      return {
        message:
          'Detached **Front-Left Motor (FL)** and disconnected its 3-phase motor leads. The front-left propeller cannot generate thrust until reattached.',
        actions: [{ type: 'removePart', partId: 'motor-fl' }],
      };
    }
    return {
      message: `Found **4 Brushless DC Motors** (2306 / 2400KV). Each motor delivers up to 1.8kg thrust using counter-opposing pairs for torque balance.\n\nSelecting Front-Left Motor in 3D.`,
      actions: [{ type: 'selectPart', partId: 'motor-fl' }],
    };
  }

  // 4. Propellers
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
      message:
        'Displaying 5-inch tri-blade polycarbonate airfoils. 2× CW (Clockwise) and 2× CCW (Counter-Clockwise) generate balanced vertical lift.',
      actions: [{ type: 'selectPart', partId: 'prop-fl' }],
    };
  }

  // 5. Battery / Power
  if (lower.includes('battery') || lower.includes('power') || lower.includes('lipo')) {
    if (lower.includes('remove') || lower.includes('what happens if i remove')) {
      return {
        message: `**Removing Battery (BAT-4S-1500)**:\n• Immediate loss of nominal 14.8V rail.\n• **Downstream impact:** 4-in-1 ESC, F7 Flight Controller, Camera, and all 4 motors are de-energized.\n• Flagged with **[NO PWR]** in topology graph.`,
        actions: [{ type: 'removePart', partId: 'battery' }],
      };
    }
    return {
      message: `**4S 1500mAh 120C LiPo Battery**:\n• Supplies 14.8V nominal voltage (up to 180A burst current).\n• Strapped securely to the carbon bottom plate and connects directly to ESC via XT60 connector.`,
      actions: [{ type: 'selectPart', partId: 'battery' }],
    };
  }

  // 6. Flight Controller & IMU
  if (
    lower.includes('flight controller') ||
    lower.includes('fc') ||
    lower.includes('controller') ||
    lower.includes('gyro')
  ) {
    return {
      message: `**F7 Flight Controller & IMU (FC-STM32F7-V2)**:\n• High-performance STM32F722 microcontroller running PID loops at 8kHz.\n• Dual BMI270 gyroscopes provide spatial angular velocity tracking.\n• Inferred internal stack position isolated with silicone vibration gummies.`,
      actions: [{ type: 'selectPart', partId: 'fc' }],
    };
  }

  // 7. Electronic Speed Controller (ESC)
  if (lower.includes('esc') || lower.includes('speed controller')) {
    return {
      message: `**4-in-1 55A BLHeli_32 ESC (ESC-55A-4IN1)**:\n• Converts 14.8V DC battery power into 3-phase AC commutation for 4 motors.\n• Features hardware current sensor and regenerative braking.\n• Mounted directly beneath flight controller in the 30×30 central stack.`,
      actions: [{ type: 'selectPart', partId: 'esc' }],
    };
  }

  // 8. FPV Camera
  if (lower.includes('camera') || lower.includes('fpv') || lower.includes('lens') || lower.includes('video')) {
    return {
      message: `**1200TVL FPV Low-Latency Camera (CAM-FPV-1200)**:\n• Micro analog sensor with 2.1mm wide-angle lens (160° FOV).\n• Protected by a flexible TPU nose cage with tilt adjustment (20° - 55°).\n• Wired directly to FC for On-Screen Display (OSD) telemetry overlay.`,
      actions: [{ type: 'selectPart', partId: 'camera' }],
    };
  }

  // 9. Frame / Airframe
  if (lower.includes('frame') || lower.includes('chassis') || lower.includes('carbon')) {
    return {
      message: `**Main Carbon-Fibre Frame (DX1-FRM-001)**:\n• Precision CNC-cut 3K twill matte carbon-fibre plate (4mm arm thickness).\n• Provides rigid structural backbone for arms, avionics stack, and battery mount.\n• High mechanical tensile strength with low weight (120g).`,
      actions: [{ type: 'selectPart', partId: 'frame' }],
    };
  }

  // 10. How it works
  if (
    lower.includes('how it works') ||
    lower.includes('how does it work') ||
    lower.includes('flow') ||
    lower.includes('working')
  ) {
    return {
      message: `Switching to **How It Works** mode.\n\n**Signal & Power Flow**:\n1. **Battery (14.8V DC)** $\\rightarrow$ **ESC** via XT60.\n2. **ESC (5V BEC)** $\\rightarrow$ **Flight Controller** for compute.\n3. **FC IMU Gyro** tracks attitude $\\rightarrow$ sends **DShot600 pulses** $\\rightarrow$ **ESC**.\n4. **ESC** commutates 3-phase AC $\\rightarrow$ **4 Motors** $\\rightarrow$ **Propellers** generate lift.\n5. **Camera** feeds video to FC OSD for real-time pilot telemetry.`,
      actions: [{ type: 'setMode', mode: 'how-it-works' }],
    };
  }

  // 11. Dynamic match across any part
  const matchedPart = parts.find(
    (p) =>
      lower.includes(p.name.toLowerCase()) ||
      lower.includes(p.id.toLowerCase()) ||
      (p.partNumber && lower.includes(p.partNumber.toLowerCase()))
  );
  if (matchedPart) {
    return {
      message: `Inspecting **${matchedPart.name}**:\n• **Category:** ${matchedPart.category.toUpperCase()}\n• **Part ID:** ${matchedPart.partNumber ?? matchedPart.id}\n• **Material:** ${matchedPart.material || 'Standard composite'}\n• **Status:** ${matchedPart.status === 'installed' ? 'Installed ✓' : 'Detached ✕'}\n• **Detection:** ${matchedPart.visibility.toUpperCase()} (${Math.round(matchedPart.detectionConfidence * 100)}% confidence)\n\nFocused in 3D viewport.`,
      actions: [{ type: 'selectPart', partId: matchedPart.id }],
    };
  }

  // Default fallback
  return {
    message: `Assembly Copilot is ready. I understand the complete mechanical and electrical hierarchy of **Drone-X1** (${parts.length} parts).\n\nTry asking:\n• *"Show me the motors"*\n• *"Where is the FPV Camera?"*\n• *"Explode the drone"*\n• *"What happens if I remove the battery?"*\n• *"Inspect the 4-in-1 ESC"*\n• *"Show how it works"*`,
    actions: [],
  };
}
