'use client';
import Link from 'next/link';
import { AssemblyOSLogo } from '@/components/ui/AssemblyOSLogo';
import { StatusDot } from '@/components/ui/StatusDot';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAssemblyStore } from '@/store/assemblyStore';
import { HelpCircle, User, ArrowLeft } from 'lucide-react';

export function TopBar() {
  const { currentStep, totalSteps, completedSteps } = useAssemblyStore();
  const pct = Math.round((completedSteps.length / totalSteps) * 100);

  return (
    <header
      className="flex items-center justify-between px-4 h-14 border-b border-[rgba(255,255,255,0.06)]"
      style={{ background: 'rgba(5,6,7,0.9)', backdropFilter: 'blur(20px)' }}
    >
      {/* Left */}
      <div className="flex items-center gap-4">
        <Link href="/" aria-label="Back to home" className="text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />
        <AssemblyOSLogo size={24} />
        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(245,247,250,0.35)]">Project</span>
          <div className="text-[13px] font-semibold text-[#F5F7FA] leading-none mt-0.5">DRONE-X1</div>
        </div>
      </div>

      {/* Centre — progress */}
      <div className="hidden md:flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div
            className="h-1.5 w-40 rounded-full overflow-hidden"
            style={{ background: 'rgba(255,255,255,0.08)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: 'linear-gradient(90deg,#7DFFB2,#8BE9FF)' }}
            />
          </div>
          <span className="font-mono text-[11px] text-[rgba(245,247,250,0.45)]">{pct}%</span>
        </div>
        <span className="font-mono text-[11px] text-[rgba(245,247,250,0.3)] uppercase tracking-widest">
          STEP {currentStep} / {totalSteps}
        </span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        <StatusDot status="online" label="READY" size="sm" />
        <div className="w-px h-5 bg-[rgba(255,255,255,0.08)]" />
        <button className="p-2 rounded-xl text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] hover:bg-[rgba(255,255,255,0.05)] transition-colors" aria-label="Help">
          <HelpCircle size={16} />
        </button>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.04)] cursor-pointer"
          aria-label="User menu"
        >
          <User size={14} className="text-[rgba(245,247,250,0.5)]" />
        </div>
      </div>
    </header>
  );
}
