import { ImportModel } from '@/components/workspace/ImportModel';
import { AssemblyOSLogo } from '@/components/ui/AssemblyOSLogo';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ImportPage() {
  return (
    <main className="min-h-[100dvh] py-8 px-4" style={{ background: '#050607' }}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/workspace" className="text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] transition-colors">
            <ArrowLeft size={18} />
          </Link>
          <AssemblyOSLogo size={26} />
        </div>
        <ImportModel />
      </div>
    </main>
  );
}
