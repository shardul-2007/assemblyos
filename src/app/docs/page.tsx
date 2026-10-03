import { Nav } from '@/components/landing/Nav';
import { Footer } from '@/components/landing/Footer';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';

const sections = [
  {
    title: 'Getting Started',
    items: [
      { heading: 'Quick Start', body: 'Visit /workspace/demo to launch the DRONE-X1 interactive assembly immediately — no login, no API key required.' },
      { heading: 'Import a Model', body: 'Navigate to /workspace/import and drag in a .glb or .gltf file. The system will analyze geometry and build an assembly graph.' },
      { heading: 'Keyboard Shortcuts', body: 'N — Next step   P — Previous step   E — Toggle explode   R — Reset   F — Show Me animation   V — Verification   C — Copilot   ESC — Close panels' },
    ],
  },
  {
    title: 'AI Copilot',
    items: [
      { heading: 'Demo Mode', body: 'Without an API key the copilot uses a deterministic keyword-matching assistant. All core features work fully in demo mode.' },
      { heading: 'Enabling Real AI', body: 'Add AI_GATEWAY_API_KEY=<your-openai-key> to your .env.local file and restart the dev server.' },
      { heading: 'Structured Actions', body: 'AI responses can trigger 3D viewer actions: highlightComponent, focusComponent, setExplodedView, setAssemblyStep, showAssemblyAnimation, verifyAssembly. Actions are validated with Zod before execution.' },
    ],
  },
  {
    title: 'Verification System',
    items: [
      { heading: 'Demo Simulation', body: 'The camera verification panel runs a simulated scan. It is clearly labeled DEMO MODE and does not use real computer vision.' },
      { heading: 'Confidence Score', body: 'The percentage is simulated. It does not represent a real engineering certification or safety guarantee.' },
    ],
  },
  {
    title: 'Tech Stack',
    items: [
      { heading: 'Framework', body: 'Next.js 16 App Router · TypeScript · Tailwind CSS v4 · Framer Motion' },
      { heading: '3D Engine', body: 'React Three Fiber · Three.js · @react-three/drei — procedural DRONE-X1 mesh (no external assets required)' },
      { heading: 'State', body: 'Zustand with devtools middleware — all assembly state is client-side' },
      { heading: 'AI', body: 'Vercel AI SDK with provider abstraction. Falls back to local demo assistant when no API key is set.' },
    ],
  },
];

export default function DocsPage() {
  return (
    <main style={{ background: '#050607' }}>
      <Nav />
      <div className="pt-28 pb-20 max-w-[900px] mx-auto px-6">
        <div className="mb-12">
          <TechnicalLabel className="mb-3 block" variant="accent">Documentation</TechnicalLabel>
          <h1 className="text-[40px] font-bold text-[#F5F7FA] tracking-tight">AssemblyOS Docs</h1>
          <p className="text-[16px] text-[rgba(245,247,250,0.5)] mt-3 max-w-[520px]">
            Reference guide for the AssemblyOS platform — workspace, AI copilot, verification, and developer setup.
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
                    <p className="text-[13px] text-[rgba(245,247,250,0.5)] leading-relaxed whitespace-pre-line">{item.body}</p>
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
