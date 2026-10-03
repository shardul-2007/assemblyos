'use client';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Box, MessageSquare, Layers, Eye, ShieldCheck, Clock } from 'lucide-react';

const features = [
  {
    icon: Box,
    number: '01',
    title: 'Interactive 3D Assembly',
    description: 'Inspect every component from every angle. Orbit, zoom, and explore the complete assembly in real time.',
    color: '#8BE9FF',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'AI Assembly Copilot',
    description: 'Ask questions naturally while you build. The copilot understands context, highlights parts, and guides every step.',
    color: '#7DFFB2',
  },
  {
    icon: Layers,
    number: '03',
    title: 'Exploded View',
    description: 'Understand how every component fits together. Animate between assembled and exploded states fluidly.',
    color: '#8BE9FF',
  },
  {
    icon: Eye,
    number: '04',
    title: 'Visual Guidance',
    description: 'See exactly where the next part belongs. Animated arrows, glowing highlights, and directional cues remove guesswork.',
    color: '#FFD36A',
  },
  {
    icon: ShieldCheck,
    number: '05',
    title: 'Assembly Verification',
    description: 'Detect potential mistakes before they become problems. Simulated vision checks confirm placement and orientation.',
    color: '#7DFFB2',
  },
  {
    icon: Clock,
    number: '06',
    title: 'Assembly Memory',
    description: 'Replay and analyze the complete assembly process. Track time, corrections, and generate a full report.',
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
            Everything you need to assemble with confidence
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
