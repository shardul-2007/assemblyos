import Link from 'next/link';
import { GlowButton } from '@/components/ui/GlowButton';
import { ArrowRight, Upload } from 'lucide-react';

export default function WorkspacePage() {
  return (
    <main
      className="min-h-[100dvh] flex items-center justify-center"
      style={{ background: '#050607' }}
    >
      <div className="text-center px-6">
        <div className="w-16 h-16 rounded-2xl border border-[rgba(139,233,255,0.3)] bg-[rgba(139,233,255,0.05)] flex items-center justify-center mx-auto mb-6">
          <span className="text-[#8BE9FF] text-2xl">⬛</span>
        </div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#8BE9FF] mb-3">Assembly Workspace</p>
        <h1 className="text-[32px] font-bold text-[#F5F7FA] mb-2">Your workspace is ready.</h1>
        <p className="text-[15px] text-[rgba(245,247,250,0.5)] mb-8 max-w-[380px] mx-auto">
          Load the interactive DRONE-X1 demo or import your own 3D model.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/workspace/demo">
            <GlowButton variant="primary" size="lg" icon={<ArrowRight size={15} />}>Load Demo Product</GlowButton>
          </Link>
          <Link href="/workspace/import">
            <GlowButton variant="secondary" size="lg" icon={<Upload size={14} />}>Import Model</GlowButton>
          </Link>
        </div>
      </div>
    </main>
  );
}
