'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssemblyStore } from '@/store/assemblyStore';
import { ASSEMBLY_STEPS, DRONE_COMPONENTS } from '@/data/demoProduct';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { formatDuration } from '@/lib/utils';
import { CheckCircle2, Clock, Wrench, AlertTriangle, Download, X, BarChart3 } from 'lucide-react';

interface AssemblyReportProps {
  onClose: () => void;
}

export function AssemblyReport({ onClose }: AssemblyReportProps) {
  const { completedSteps, corrections, startedAt, finishedAt, totalSteps } = useAssemblyStore();

  const duration = startedAt && finishedAt ? formatDuration(startedAt, finishedAt) : '—';
  const pct = Math.round((completedSteps.length / totalSteps) * 100);
  const tools = ['4mm Allen Key', '2.5mm Allen Key', 'Phillips #2 Screwdriver', 'Prop Spanner'];

  const handleDownload = () => {
    const text = [
      '═══════════════════════════════════════',
      '       ASSEMBLYOS ASSEMBLY REPORT',
      '═══════════════════════════════════════',
      '',
      `Product:       DRONE-X1`,
      `Steps Done:    ${completedSteps.length} / ${totalSteps}`,
      `Completion:    ${pct}%`,
      `Duration:      ${duration}`,
      `Corrections:   ${corrections}`,
      `Verification:  96% (SIMULATED DEMO)',`,
      '',
      'DISCLAIMER: This is a demo report.',
      'Not an engineering certification.',
      '═══════════════════════════════════════',
    ].join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'assemblyos-report.txt'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg"
      >
        <GlassPanel className="p-6 relative overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(125,255,178,0.4), transparent)' }} />

          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <TechnicalLabel variant="success">Assembly Report</TechnicalLabel>
              <h2 className="text-[20px] font-bold text-[#F5F7FA] mt-1">DRONE-X1</h2>
              <p className="text-[12px] text-[rgba(245,247,250,0.45)] mt-0.5">5" Freestyle Quadcopter</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] transition-colors" aria-label="Close report">
              <X size={16} />
            </button>
          </div>

          {/* Big status */}
          <div className="flex items-center gap-3 mb-6 p-3 rounded-xl" style={{ background: 'rgba(125,255,178,0.06)', border: '1px solid rgba(125,255,178,0.2)' }}>
            <CheckCircle2 size={22} className="text-[#7DFFB2]" />
            <div>
              <div className="font-mono text-[13px] font-bold text-[#7DFFB2] uppercase tracking-widest">Assembly Complete</div>
              <div className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] mt-0.5">{completedSteps.length} / {totalSteps} steps completed</div>
            </div>
            <div className="ml-auto text-right">
              <div className="font-mono text-[24px] font-bold text-[#F5F7FA]">{pct}%</div>
              <div className="font-mono text-[9px] text-[rgba(245,247,250,0.3)] uppercase">Completion</div>
            </div>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {[
              { icon: Clock, label: 'Duration', value: duration, color: '#8BE9FF' },
              { icon: AlertTriangle, label: 'Corrections', value: String(corrections), color: corrections > 0 ? '#FFD36A' : '#7DFFB2' },
              { icon: BarChart3, label: 'Verification', value: '96% (DEMO)', color: '#7DFFB2' },
              { icon: Wrench, label: 'Tools Used', value: `${tools.length}`, color: '#8BE9FF' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={12} style={{ color }} />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-[rgba(245,247,250,0.35)]">{label}</span>
                </div>
                <div className="font-mono text-[14px] font-bold" style={{ color }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Step timeline */}
          <div className="mb-5">
            <TechnicalLabel className="mb-2 block">Completed Steps</TechnicalLabel>
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((n) => (
                <div key={n} className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-[10px] font-bold ${
                  completedSteps.includes(n)
                    ? 'bg-[rgba(125,255,178,0.15)] text-[#7DFFB2] border border-[rgba(125,255,178,0.25)]'
                    : 'bg-[rgba(255,255,255,0.04)] text-[rgba(245,247,250,0.2)] border border-[rgba(255,255,255,0.06)]'
                }`}>
                  {completedSteps.includes(n) ? '✓' : n}
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="font-mono text-[10px] text-[rgba(245,247,250,0.28)] mb-4 leading-relaxed">
            ⚠ DEMO SIMULATION — This report does not constitute a real engineering certification. Verification scores are simulated.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <GlowButton variant="primary" size="md" onClick={handleDownload} icon={<Download size={13} />} className="flex-1">
              Download Report
            </GlowButton>
            <GlowButton variant="ghost" size="md" onClick={onClose} className="flex-1">
              Close
            </GlowButton>
          </div>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
