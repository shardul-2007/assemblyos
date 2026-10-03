'use client';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Box, MessageSquare, Layers, Eye, ShieldCheck, Clock } from 'lucide-react';

const features = [
  {
    icon: Box,
    number: '01',
    title: 'Interactive 3D Assembly',
    description: 'Inspect physical products and machinery from every angle. Explode, collapse, isolate, and orbit components in real time.',
    color: '#8BE9FF',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'AI Assembly Copilot',
    description: 'Ask questions about part dependencies, propulsion mechanics, and power routing. The copilot controls the 3D scene directly.',
    color: '#7DFFB2',
  },
  {
    icon: Layers,
    number: '03',
    title: 'Camera Product Capture',
    description: 'Photograph real devices or machinery with your device camera. AI identifies the product and matches reference 3D assemblies.',
    color: '#8BE9FF',
  },
  {
    icon: Eye,
    number: '04',
    title: 'Mechanical Part Operations',
    description: 'Remove components to analyze downstream failures, swap compatible motors or batteries, and reassemble with full undo/redo.',
    color: '#FFD36A',
  },
  {
    icon: ShieldCheck,
    number: '05',
    title: 'How It Works Mode',
    description: 'Visualize functional relationships: battery to ESC power distribution, flight controller PID loops, and motor thrust.',
    color: '#7DFFB2',
  },
  {
    icon: Clock,
    number: '06',
    title: 'BOM & Assembly Reports',
    description: 'Generate structured bill-of-materials, part numbers, mechanical joint definitions, and comprehensive JSON assembly reports.',
    color: '#8BE9FF',
  },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-24 relative" aria-label="Features">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8BE9FF] mb-4 block">
            Platform Capabilities
          </span>
          <h2 className="text-[40px] font-bold text-[#F5F7FA] tracking-tight">
            Turn physical machines into interactive 3D assemblies
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              <GlassPanel className="p-6 h-full hover:border-[rgba(255,255,255,0.14)] transition-all duration-300 cursor-default">
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
                  >
                    <feature.icon size={18} style={{ color: feature.color }} strokeWidth={1.5} />
                  </div>
                  <span className="font-mono text-[11px] text-[rgba(245,247,250,0.22)] mt-2.5 tracking-widest">
                    {feature.number}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-[#F5F7FA] mb-2">{feature.title}</h3>
                <p className="text-[13px] leading-relaxed text-[rgba(245,247,250,0.5)]">{feature.description}</p>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
