'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlowButton } from '@/components/ui/GlowButton';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 relative" aria-label="Call to action">
      <div className="max-w-[900px] mx-auto px-6 lg:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="glass p-12 lg:p-16 relative overflow-hidden"
        >
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(139,233,255,0.06) 0%, transparent 70%)' }}
          />
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8BE9FF] block mb-6 relative z-10">Get Started</span>
          <h2 className="text-[40px] lg:text-[52px] font-bold text-[#F5F7FA] tracking-tight mb-4 leading-tight relative z-10">
            Assembly shouldn&apos;t<br />require a manual.
          </h2>
          <p className="text-[17px] text-[rgba(245,247,250,0.55)] mb-10 max-w-[480px] mx-auto leading-relaxed relative z-10">
            Give your product a spatial interface. Interactive 3D. AI-guided steps. Intelligent verification.
          </p>
          <div className="flex flex-wrap gap-4 justify-center relative z-10">
            <Link href="/workspace/demo">
              <GlowButton variant="primary" size="lg" icon={<ArrowRight size={16} />}>Launch AssemblyOS</GlowButton>
            </Link>
            <Link href="/workspace/demo">
              <GlowButton variant="secondary" size="lg" icon={<Sparkles size={14} />}>Explore Demo</GlowButton>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
