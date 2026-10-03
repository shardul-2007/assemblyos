'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AssemblyOSLogo } from '@/components/ui/AssemblyOSLogo';
import { GlowButton } from '@/components/ui/GlowButton';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Explore', href: '/#features' },
  { label: 'Workspace', href: '/workspace' },
  { label: 'How It Works', href: '/#how-it-works' },
  { label: 'Documentation', href: '/docs' },
];

export function Nav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div
        className="mx-4 mt-4 rounded-2xl"
        style={{
          background: 'rgba(5,6,7,0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div className="flex items-center justify-between px-5 h-14">
          <Link href="/" aria-label="AssemblyOS home">
            <AssemblyOSLogo size={28} />
          </Link>

          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[13px] text-[rgba(245,247,250,0.58)] hover:text-[#F5F7FA] transition-colors duration-200 tracking-wide"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/workspace/demo" className="hidden md:block">
              <GlowButton variant="primary" size="sm">
                Launch Workspace
              </GlowButton>
            </Link>

            <button
              className="md:hidden p-2 rounded-lg text-[rgba(245,247,250,0.58)] hover:text-[#F5F7FA]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="md:hidden border-t border-[rgba(255,255,255,0.06)] px-5 py-4 flex flex-col gap-3"
          >
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-[14px] text-[rgba(245,247,250,0.58)] hover:text-[#F5F7FA] py-1"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/workspace/demo" onClick={() => setMobileOpen(false)}>
              <GlowButton variant="primary" size="sm" className="w-full mt-1">
                Launch Workspace
              </GlowButton>
            </Link>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
