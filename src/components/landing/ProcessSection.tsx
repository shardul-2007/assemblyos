'use client';
import { motion } from 'framer-motion';

const stages = [
  { id: '01', label: 'SCAN', title: 'Import your product', description: 'Upload a GLB, GLTF, OBJ or STL model. AssemblyOS parses geometry, identifies components, and builds the assembly graph.', color: '#8BE9FF' },
  { id: '02', label: 'UNDERSTAND', title: 'AI maps every part', description: 'Component detection assigns names, types, materials, and relationships. The AI builds a spatial model of the assembly.', color: '#7DFFB2' },
  { id: '03', label: 'EXPLODE', title: 'Visualize the structure', description: 'Components separate into an exploded view. Every part, connector, and screw — laid out in spatial order.', color: '#FFD36A' },
  { id: '04', label: 'GUIDE', title: 'Step-by-step instructions', description: 'Follow AI-generated assembly steps. The copilot highlights the next component, shows animations, and answers questions.', color: '#8BE9FF' },
  { id: '05', label: 'VERIFY', title: 'Confirm and complete', description: 'Simulated verification checks component placement and orientation. Generate a full assembly report.', color: '#7DFFB2' },
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
          <h2 className="text-[40px] font-bold text-[#F5F7FA] tracking-tight">From parts to progress</h2>
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
