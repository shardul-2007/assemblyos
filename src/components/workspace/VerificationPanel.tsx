'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { StatusDot } from '@/components/ui/StatusDot';
import { useAssemblyStore } from '@/store/assemblyStore';
import { ShieldCheck, AlertTriangle, Camera, CheckCircle, XCircle, Loader } from 'lucide-react';

interface Check {
  id: string;
  label: string;
  passed: boolean;
}

interface Issue {
  id: string;
  description: string;
  severity: 'warning' | 'error';
  componentId?: string;
}

interface VerificationResult {
  status: 'verified' | 'failed';
  confidence: number;
  checks: Check[];
  issues: Issue[];
}

export function VerificationPanel() {
  const { currentStep, startVerification, completeVerification, highlightComponent } = useAssemblyStore();
  const [phase, setPhase] = useState<'idle' | 'scanning' | 'done'>('idle');
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [scanProgress, setScanProgress] = useState(0);

  const runVerification = useCallback(async () => {
    setPhase('scanning');
    setScanProgress(0);
    startVerification();

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((p) => {
        if (p >= 95) { clearInterval(interval); return 95; }
        return p + Math.random() * 15;
      });
    }, 200);

    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: 'drone-x1',
          currentStep,
          expectedComponents: ['motor-rl', 'bracket-rl', 'screw-m3'],
          detectedState: { step: currentStep },
        }),
      });
      const data = await res.json();
      setScanProgress(100);
      setTimeout(() => {
        setPhase('done');
        setResult(data);
        completeVerification({
          status: data.status,
          confidence: data.confidence,
          checks: data.checks ?? [],
          issues: data.issues ?? [],
          isSimulated: true,
        });
      }, 400);
    } catch {
      clearInterval(interval);
      setScanProgress(100);
      setPhase('done');
      setResult({
        status: 'verified',
        confidence: 0.94,
        checks: [
          { id: 'frame', label: 'Frame Alignment', passed: true },
          { id: 'motor', label: 'Motor Orientation', passed: true },
          { id: 'screw', label: 'Screw Placement', passed: true },
          { id: 'battery', label: 'Battery Position', passed: true },
        ],
        issues: [],
      });
    }
  }, [currentStep, startVerification, completeVerification]);

  return (
    <GlassPanel className="p-4">
      {/* Demo mode badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Camera size={14} className="text-[#8BE9FF]" />
          <TechnicalLabel>Camera Verification</TechnicalLabel>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-widest bg-[rgba(255,211,106,0.12)] text-[#FFD36A] border border-[rgba(255,211,106,0.25)] px-2 py-0.5 rounded-md">
          DEMO MODE
        </span>
      </div>

      <p className="text-[11px] text-[rgba(245,247,250,0.4)] mb-4 leading-relaxed">
        Simulated vision analysis checks component placement, orientation and fastener positions.
        <span className="text-[#FFD36A]"> Not real computer vision.</span>
      </p>

      {/* Idle */}
      {phase === 'idle' && (
        <GlowButton variant="secondary" size="md" onClick={runVerification} className="w-full" icon={<ShieldCheck size={14} />}>
          Start Camera Check
        </GlowButton>
      )}

      {/* Scanning */}
      {phase === 'scanning' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Loader size={13} className="text-[#8BE9FF] animate-spin" />
            <span className="font-mono text-[11px] text-[#8BE9FF] uppercase tracking-widest">Scanning Assembly...</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[rgba(255,255,255,0.06)] rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#8BE9FF] rounded-full"
              style={{ width: `${scanProgress}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="space-y-2">
            {['Frame Alignment', 'Motor Orientation', 'Screw Placement', 'Battery Position'].map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${scanProgress > i * 25 + 15 ? 'bg-[#7DFFB2]' : 'bg-[rgba(255,255,255,0.15)] animate-pulse'}`} />
                <span className="font-mono text-[10px] text-[rgba(245,247,250,0.5)] uppercase tracking-widest">{label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {phase === 'done' && result && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {/* Overall status */}
            <div className={`flex items-center justify-between p-3 rounded-xl border ${
              result.status === 'verified'
                ? 'bg-[rgba(125,255,178,0.06)] border-[rgba(125,255,178,0.2)]'
                : 'bg-[rgba(255,127,138,0.06)] border-[rgba(255,127,138,0.2)]'
            }`}>
              <div className="flex items-center gap-2">
                {result.status === 'verified'
                  ? <CheckCircle size={14} className="text-[#7DFFB2]" />
                  : <XCircle size={14} className="text-[#FF7F8A]" />}
                <span className={`font-mono text-[11px] font-bold uppercase tracking-widest ${
                  result.status === 'verified' ? 'text-[#7DFFB2]' : 'text-[#FF7F8A]'
                }`}>
                  {result.status === 'verified' ? 'Assembly Verified' : 'Issues Detected'}
                </span>
              </div>
              <span className="font-mono text-[12px] font-bold text-[#F5F7FA]">
                {Math.round(result.confidence * 100)}%
              </span>
            </div>

            {/* Checks */}
            <div className="space-y-1.5">
              {result.checks.map((check) => (
                <div key={check.id} className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(245,247,250,0.45)]">{check.label}</span>
                  <span className={`font-mono text-[10px] uppercase tracking-widest ${check.passed ? 'text-[#7DFFB2]' : 'text-[#FF7F8A]'}`}>
                    {check.passed ? '✓ PASS' : '✗ FAIL'}
                  </span>
                </div>
              ))}
            </div>

            {/* Issues */}
            {result.issues.length > 0 && (
              <div className="bg-[rgba(255,211,106,0.08)] border border-[rgba(255,211,106,0.2)] rounded-xl p-3 space-y-2">
                <div className="flex items-center gap-1.5">
                  <AlertTriangle size={12} className="text-[#FFD36A]" />
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[#FFD36A]">Potential Issues</span>
                </div>
                {result.issues.map((issue) => (
                  <div key={issue.id} className="text-[11px] text-[rgba(245,247,250,0.6)] leading-relaxed">
                    {issue.description}
                  </div>
                ))}
                <GlowButton variant="secondary" size="sm" className="w-full mt-1" onClick={() => {
                  if (result.issues[0]?.componentId) highlightComponent(result.issues[0].componentId);
                }}>
                  Show Correct Orientation
                </GlowButton>
              </div>
            )}

            <GlowButton variant="ghost" size="sm" className="w-full" onClick={() => { setPhase('idle'); setResult(null); }}>
              Run Again
            </GlowButton>
          </motion.div>
        </AnimatePresence>
      )}
    </GlassPanel>
  );
}
