'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssemblyStore } from '@/store/assemblyStore';
import { DRONE_COMPONENTS } from '@/data/demoProduct';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { GlowButton } from '@/components/ui/GlowButton';
import { X, Focus, Zap, MapPin } from 'lucide-react';

export function ComponentInspector() {
  const { selectedComponentId, selectComponent, highlightComponent, triggerShowMe } = useAssemblyStore();
  const comp = DRONE_COMPONENTS.find((c) => c.id === selectedComponentId);

  return (
    <AnimatePresence>
      {comp && (
        <motion.div
          key={comp.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={{ duration: 0.25 }}
          className="absolute bottom-20 left-4 right-4 md:left-auto md:right-4 md:w-72 z-20"
        >
          <GlassPanel className="p-4">
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div>
                <TechnicalLabel>Component {String(DRONE_COMPONENTS.findIndex(c => c.id === comp.id) + 1).padStart(2,'0')}</TechnicalLabel>
                <h3 className="text-[15px] font-bold text-[#F5F7FA] mt-1">{comp.name.toUpperCase()}</h3>
              </div>
              <button
                onClick={() => selectComponent(null)}
                className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.07)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] transition-colors"
                aria-label="Close inspector"
              >
                <X size={14} />
              </button>
            </div>

            {/* Divider */}
            <div className="h-px bg-[rgba(255,255,255,0.06)] mb-3" />

            {/* Fields */}
            <div className="space-y-2 mb-4">
              {[
                { label: 'Type', value: comp.type.charAt(0).toUpperCase() + comp.type.slice(1) },
                { label: 'Material', value: comp.material },
                { label: 'Quantity', value: String(comp.quantity) },
                { label: 'Part No.', value: comp.partNumber ?? '—' },
                ...(comp.weight ? [{ label: 'Weight', value: comp.weight }] : []),
                ...(comp.requiredTool ? [{ label: 'Tool', value: comp.requiredTool }] : []),
                { label: 'Introduced', value: `Step ${comp.stepIntroduced}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-start gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(245,247,250,0.35)] flex-shrink-0">{label}</span>
                  <span className="text-[11px] text-[rgba(245,247,250,0.7)] text-right">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] uppercase tracking-widest text-[rgba(245,247,250,0.35)]">Status</span>
                <span className={`font-mono text-[10px] uppercase tracking-widest ${
                  comp.status === 'installed' || comp.status === 'verified' ? 'text-[#7DFFB2]' :
                  comp.status === 'active' ? 'text-[#8BE9FF]' : 'text-[rgba(245,247,250,0.3)]'
                }`}>
                  {comp.status === 'installed' ? '✓ Installed' :
                   comp.status === 'active' ? '● Active' :
                   comp.status === 'verified' ? '✓ Verified' : '○ Pending'}
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-[11px] text-[rgba(245,247,250,0.45)] leading-relaxed mb-4">{comp.description}</p>

            {/* Actions */}
            <div className="flex gap-2">
              <GlowButton
                variant="ghost"
                size="sm"
                icon={<Focus size={12} />}
                onClick={() => highlightComponent(comp.id)}
                title="Focus component"
              >
                Focus
              </GlowButton>
              <GlowButton
                variant="ghost"
                size="sm"
                icon={<Zap size={12} />}
                onClick={() => triggerShowMe()}
                title="Show animation"
              >
                Show Me
              </GlowButton>
              <GlowButton
                variant="ghost"
                size="sm"
                icon={<MapPin size={12} />}
                title="Locate in assembly"
              >
                Locate
              </GlowButton>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
