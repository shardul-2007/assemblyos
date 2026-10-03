'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlowButton } from '@/components/ui/GlowButton';
import { Play, ArrowRight } from 'lucide-react';
import dynamic from 'next/dynamic';

const HeroScene = dynamic(
  () => import('./HeroScene').then((m) => ({ default: m.HeroScene })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border border-[rgba(139,233,255,0.3)] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-3 h-3 rounded-full bg-[#8BE9FF]" />
          </div>
          <p className="font-mono text-[11px] text-[rgba(245,247,250,0.38)] uppercase tracking-widest">
            Loading 3D Scene
          </p>
        </div>
      </div>
    ),
  }
);

export function Hero() {
  return (
    <section
      className="relative min-h-[100dvh] flex items-center pt-24 pb-16 overflow-hidden"
      aria-label="Hero section"
    >
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 65% 40%, rgba(139,233,255,0.04) 0%, transparent 70%),
            radial-gradient(ellipse 40% 40% at 20% 60%, rgba(0,100,200,0.05) 0%, transparent 60%)
          `,
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* LEFT — Text */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#8BE9FF] glow-pulse" />
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8BE9FF]">
                AI-Powered 3D Assembly Intelligence
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-[52px] sm:text-[64px] lg:text-[72px] font-bold leading-[1.02] tracking-tight text-[#F5F7FA] mb-6"
            >
              Photograph it.
              <br />
              <span
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, #8BE9FF 0%, rgba(245,247,250,0.9) 60%)',
                }}
              >
                Understand every part.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-[17px] leading-relaxed text-[rgba(245,247,250,0.58)] mb-10 max-w-[480px]"
            >
              AssemblyOS turns physical machines and products into interactive 3D assemblies.
              Explode components, inspect connections, remove parts, and understand how machines work.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Link href="/workspace/demo">
                <GlowButton variant="primary" size="lg" icon={<ArrowRight size={16} />}>
                  Launch Workspace
                </GlowButton>
              </Link>
              <GlowButton
                variant="secondary"
                size="lg"
                icon={<Play size={14} />}
                onClick={() =>
                  document
                    .getElementById('how-it-works')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
              >
                How It Works
              </GlowButton>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="flex gap-8 mt-12 pt-8 border-t border-[rgba(255,255,255,0.06)]"
            >
              {[
                { val: '3D', label: 'Interactive View' },
                { val: 'AI', label: 'Assembly Copilot' },
                { val: '18', label: 'Step Process' },
              ].map(({ val, label }) => (
                <div key={label}>
                  <div className="font-mono text-[22px] font-bold text-[#8BE9FF]">{val}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest text-[rgba(245,247,250,0.38)] mt-0.5">
                    {label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* RIGHT — 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 1, ease: 'easeOut' }}
            className="relative h-[500px] lg:h-[620px] rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="absolute top-3 left-3 flex gap-1.5 z-10">
              {['#FF7F8A', '#FFD36A', '#7DFFB2'].map((c) => (
                <div key={c} className="w-2.5 h-2.5 rounded-full" style={{ background: c, opacity: 0.7 }} />
              ))}
            </div>
            <div className="absolute top-3 right-3 z-10">
              <span className="font-mono text-[10px] text-[#8BE9FF] uppercase tracking-widest">
                DRONE-X1 / 3D ASSEMBLY
              </span>
            </div>
            <div className="absolute inset-0 scanline overflow-hidden z-10 pointer-events-none" />
            <div className="absolute inset-0">
              <HeroScene />
            </div>
            <div
              className="absolute bottom-0 left-0 right-0 h-16 pointer-events-none z-10"
              style={{ background: 'linear-gradient(to top, rgba(5,6,7,0.5), transparent)' }}
            />
            <div className="absolute bottom-3 left-4 z-10">
              <span className="font-mono text-[10px] text-[rgba(245,247,250,0.45)] uppercase tracking-widest">
                13 MECHANICAL PARTS / EXPLODED CAD READY
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
