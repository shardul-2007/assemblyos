'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, CheckCircle2, AlertTriangle, X, Shield, Box, Sparkles } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useSpatialStore } from '@/store/spatialStore';

interface SpatialReportProps {
  onClose: () => void;
}

export function SpatialReport({ onClose }: SpatialReportProps) {
  const { space, objects, photos, scans } = useSpatialStore();

  const machines = objects.filter((o) => o.category === 'machine');
  const electrical = objects.filter((o) => o.category === 'electrical');
  const safety = objects.filter((o) => o.category === 'safety');
  const inspectionNeeded = objects.filter((o) => o.status === 'inspection_required' || o.status === 'maintenance_due');

  const handleDownload = () => {
    const reportData = {
      spaceName: space.name,
      spaceDimensions: space.dimensions,
      totalObjects: objects.length,
      categories: {
        machines: machines.length,
        electrical: electrical.length,
        safety: safety.length,
      },
      objectsRequiringInspection: inspectionNeeded.map((o) => ({
        id: o.id,
        name: o.name,
        category: o.category,
        status: o.status,
        observations: o.observations.map((obs) => obs.content),
      })),
      completeInventory: objects.map((o) => ({
        id: o.id,
        name: o.name,
        category: o.category,
        confidence: o.confidence,
        status: o.status,
        photoCount: o.photos.length,
        manufacturer: o.metadata.manufacturer,
        model: o.metadata.model,
        serial: o.metadata.serial,
      })),
      generatedAt: new Date().toISOString(),
      disclaimer: 'AI observation report — verify on site. Not an engineering certification.',
    };

    const text = JSON.stringify(reportData, null, 2);
    const blob = new Blob([text], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spatial-twin-report-${space.name.toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <GlassPanel className="p-6 border border-[rgba(255,255,255,0.1)] overflow-hidden">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-[rgba(255,255,255,0.06)]">
            <div>
              <TechnicalLabel variant="accent">SPATIAL DIGITAL TWIN REPORT</TechnicalLabel>
              <h2 className="text-[20px] font-bold text-[#F5F7FA] mt-1">{space.name}</h2>
              <p className="text-xs text-[rgba(245,247,250,0.45)] mt-0.5">
                Physical Space Intelligence & Inspection Inventory
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          {/* Stats Metrics */}
          <div className="grid grid-cols-4 gap-2.5 my-5">
            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)] block">
                Total Entities
              </span>
              <span className="font-mono text-xl font-bold text-[#8BE9FF] mt-1 block">
                {objects.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)] block">
                Machines
              </span>
              <span className="font-mono text-xl font-bold text-[#FFD36A] mt-1 block">
                {machines.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(255,255,255,0.35)] block">
                Safety Items
              </span>
              <span className="font-mono text-xl font-bold text-[#7DFFB2] mt-1 block">
                {safety.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)] block">
                Needs Attention
              </span>
              <span className="font-mono text-xl font-bold text-[#FF7F8A] mt-1 block">
                {inspectionNeeded.length}
              </span>
            </div>
          </div>

          {/* Attention items */}
          {inspectionNeeded.length > 0 && (
            <div className="mb-5 space-y-2">
              <TechnicalLabel variant="warning">ACTION ITEMS & OBSERVATIONS</TechnicalLabel>
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {inspectionNeeded.map((item) => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-xl bg-[rgba(255,211,106,0.05)] border border-[rgba(255,211,106,0.2)] flex items-start gap-2.5 text-xs"
                  >
                    <AlertTriangle size={14} className="text-[#FFD36A] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-[#F5F7FA]">{item.name}: </span>
                      <span className="text-[rgba(245,247,250,0.7)]">
                        {item.observations[0]?.content || 'Inspection flagged by visual observation.'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inventory overview preview */}
          <div className="mb-6">
            <TechnicalLabel className="mb-2 block">ENTITY INVENTORY SAMPLE</TechnicalLabel>
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1 font-mono text-[11px]">
              {objects.slice(0, 6).map((obj) => (
                <div
                  key={obj.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.04)]"
                >
                  <span className="text-[#F5F7FA] font-medium">{obj.name}</span>
                  <div className="flex items-center gap-3 text-[rgba(245,247,250,0.45)]">
                    <span>{obj.category}</span>
                    <span>{Math.round(obj.confidence * 100)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <p className="font-mono text-[10px] text-[rgba(245,247,250,0.35)] leading-relaxed mb-5">
            ⚠ AI OBSERVATION DISCLAIMER — This report is synthesized from computer vision detections and spatial inferences. It does not replace physical on-site human verification.
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <GlowButton
              variant="primary"
              size="md"
              icon={<Download size={14} />}
              onClick={handleDownload}
              className="flex-1"
            >
              Export Structured Report (JSON)
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
