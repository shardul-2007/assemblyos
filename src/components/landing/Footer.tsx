import Link from 'next/link';
import { AssemblyOSLogo } from '@/components/ui/AssemblyOSLogo';

const footerLinks = {
  Product: [
    { label: 'Workspace', href: '/workspace' },
    { label: 'Demo', href: '/workspace/demo' },
    { label: 'Import Model', href: '/workspace/import' },
    { label: 'Documentation', href: '/docs' },
  ],
  Technology: [
    { label: '3D Engine', href: '/docs' },
    { label: 'AI Copilot', href: '/docs' },
    { label: 'Verification', href: '/docs' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-[rgba(255,255,255,0.05)] py-16" aria-label="Site footer">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-16">
          <div className="lg:col-span-2">
            <AssemblyOSLogo size={28} />
            <p className="mt-4 text-[13px] text-[rgba(245,247,250,0.4)] leading-relaxed max-w-[280px]">
              AI that sees. Understands. Guides.
            </p>
            <p className="mt-3 font-mono text-[11px] text-[rgba(245,247,250,0.22)] tracking-wide">
              Built for interactive spatial workflows.
            </p>
          </div>
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="font-mono text-[11px] uppercase tracking-[0.15em] text-[rgba(245,247,250,0.38)] mb-4">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-[13px] text-[rgba(245,247,250,0.45)] hover:text-[#F5F7FA] transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[rgba(255,255,255,0.04)]">
          <span className="font-mono text-[11px] text-[rgba(245,247,250,0.22)]">
            © {new Date().getFullYear()} AssemblyOS — All rights reserved.
          </span>
          <span className="font-mono text-[11px] text-[rgba(245,247,250,0.22)]">
            Demo mode. No real engineering certification.
          </span>
        </div>
      </div>
    </footer>
  );
}
