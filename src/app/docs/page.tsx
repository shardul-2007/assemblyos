import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';

const sections = [
  {
    title: 'Machine Understanding & Spatial Intelligence',
    items: [
      {
        heading: 'Physical Product Recognition',
        body: 'Click "Capture Product" to photograph physical machines (drones, phones, cameras, motors, tools). AssemblyOS analyzes visible components and infers internal architectures.',
      },
      {
        heading: 'Bi-Directional 2D ↔ 3D Correspondence',
        body: 'Toggle "2D Perception" to open the split workbench. Clicking any 2D bounding box on the source photo focuses that component in 3D and opens the Part Inspector. Clicking a 3D component highlights its 2D bounding box.',
      },
      {
        heading: 'Machine Topology & Dependency Graph',
        body: 'Click "Graph" in the top bar to inspect the 4-stage DAG. Detaching parts (e.g. Battery) dynamically propagates failures ([NO PWR], [OFFLINE]) down to affected systems.',
      },
      {
        heading: '3D Evidence Grounding',
        body: 'Toggle "Evidence" to highlight visible components in solid metallic green and inferred internal electronics (Flight Controller, ESC) in amber wireframe with holographic HUD badges.',
      },
    ],
  },
  {
    title: 'Interactive 3D Assembly Operations',
    items: [
      {
        heading: 'Mechanical Operations',
        body: '• Explode / Collapse: Separate parts along assembly axes.\n• Detach / Reattach: Disassemble components to inspect mounting joints.\n• Isolate: Focus on a single component while dimming the rest.\n• Swap / Replace: Test compatible alternative modules.\n• Attach Photos: Photograph physical component serials and labels directly into the part card.',
      },
      {
        heading: 'Keyboard Shortcuts',
        body: '• E — Toggle Exploded View\n• Ctrl + Z — Undo assembly modification\n• Ctrl + Shift + Z — Redo assembly modification\n• ESC — Deselect active component',
      },
    ],
  },
  {
    title: 'AI Assembly Copilot',
    items: [
      {
        heading: 'Context-Aware Assistance',
        body: 'Ask natural language queries like "Show me the motors", "Where is the FPV Camera?", "What happens if I remove the battery?", or "Show how it works". The Copilot answers with engineering specifications and executes 3D actions in real time.',
      },
      {
        heading: 'AI Provider Integration',
        body: 'Works fully client-side with deterministic engineering knowledge. Add OPENAI_API_KEY or AI_GATEWAY_API_KEY to .env.local to enable real-time Vercel AI SDK inference.',
      },
    ],
  },
  {
    title: 'Architecture & Tech Stack',
    items: [
      {
        heading: 'Frontend & 3D Engine',
        body: 'Next.js 16 (App Router) · React 19 · React Three Fiber · Three.js · Framer Motion · Tailwind CSS v4',
      },
      {
        heading: 'State & Canonical Data',
        body: 'Zustand state store with MachineGraph canonical ground truth schemas and undo/redo history stacks.',
      },
    ],
  },
];

export default function DocsPage() {
  return (
    <main style={{ background: '#050607' }}>
      <Nav />
      <div className="pt-28 pb-20 max-w-[900px] mx-auto px-6">
        <div className="mb-12">
          <TechnicalLabel className="mb-3 block" variant="accent">
            Documentation &amp; Architecture
          </TechnicalLabel>
          <h1 className="text-[40px] font-bold text-[#F5F7FA] tracking-tight">AssemblyOS Reference</h1>
          <p className="text-[16px] text-[rgba(245,247,250,0.5)] mt-3 max-w-[560px]">
            Comprehensive guide to AssemblyOS — machine understanding, 2D perception overlay, 3D digital assemblies, and AI copilot.
          </p>
        </div>

        <div className="space-y-10">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-[20px] font-bold text-[#F5F7FA] mb-4 pb-2 border-b border-[rgba(255,255,255,0.06)]">
                {section.title}
              </h2>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <GlassPanel key={item.heading} className="p-4">
                    <h3 className="text-[14px] font-semibold text-[#F5F7FA] mb-1.5">{item.heading}</h3>
                    <p className="text-[13px] text-[rgba(245,247,250,0.5)] leading-relaxed whitespace-pre-line">
                      {item.body}
                    </p>
                  </GlassPanel>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
