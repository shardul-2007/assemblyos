'use client';
import { motion } from 'framer-motion';

const stages = [
  { id: '01', label: 'CAPTURE', title: 'Photograph product', description: 'Point your camera at a real drone, device, or machine. Capture high-resolution visual input.', color: '#8BE9FF' },
  { id: '02', label: 'IDENTIFY', title: 'AI product recognition', description: 'AI identifies the machine category, detects visible parts, and infers internal avionics & power units.', color: '#7DFFB2' },
  { id: '03', label: 'MATCH', title: '3D assembly match', description: 'Matches visual evidence against reference CAD assemblies and structures components into a hierarchy.', color: '#FFD36A' },
  { id: '04', label: 'EXPLODE', title: 'Explore & disassemble', description: 'Physically explode the product in 3D along assembly axes. Remove components and trace dependencies.', color: '#8BE9FF' },
  { id: '05', label: 'UNDERSTAND', title: 'How it works mode', description: 'Inspect mechanical joints, trace power distribution & control loops, and ask the Assembly Copilot.', color: '#7DFFB2' },
];

export function ProcessSection() {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden" aria-label="How it works">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(139,233,255,0.025) 0%, transparent 70%)' }}
      />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8BE9FF] mb-4 block">Process</span>
          <h2 className="text-[40px] font-bold text-[#F5F7FA] tracking-tight">From real photo to 3D assembly</h2>
        </motion.div>

        <div className="relative">
          <div
            className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(139,233,255,0.2), transparent)' }}
          />
          <div className="grid lg:grid-cols-5 gap-6">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{ background: `${stage.color}10`, border: `1px solid ${stage.color}30` }}
                >
                  <span className="font-mono text-[13px] font-bold" style={{ color: stage.color }}>{stage.id}</span>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] mb-2" style={{ color: stage.color }}>{stage.label}</span>
                <h3 className="text-[14px] font-semibold text-[#F5F7FA] mb-2">{stage.title}</h3>
                <p className="text-[12px] leading-relaxed text-[rgba(245,247,250,0.45)]">{stage.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
