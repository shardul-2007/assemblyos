'use client';
import { useAssemblyStore } from '@/store/assemblyStore';
import { DRONE_COMPONENTS } from '@/data/demoProduct';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, ChevronRight } from 'lucide-react';

const typeIcons: Record<string, string> = {
  frame:     '◻',
  motor:     '⚙',
  battery:   '⚡',
  pcb:       '⬛',
  bracket:   '⊏',
  propeller: '◎',
  screw:     '⬤',
  washer:    '◯',
  other:     '▪',
};

const statusColors: Record<string, string> = {
  installed: 'text-[#7DFFB2]',
  active:    'text-[#8BE9FF]',
  pending:   'text-[rgba(245,247,250,0.3)]',
  verified:  'text-[#7DFFB2]',
  error:     'text-[#FF7F8A]',
};

export function ComponentSidebar() {
  const { selectedComponentId, highlightedComponentId, selectComponent, highlightComponent } = useAssemblyStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[rgba(255,255,255,0.06)]">
        <TechnicalLabel>Components</TechnicalLabel>
        <div className="flex items-center gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#7DFFB2]" />
          <span className="font-mono text-[10px] text-[rgba(245,247,250,0.38)] uppercase tracking-widest">
            {DRONE_COMPONENTS.length} PARTS
          </span>
        </div>
      </div>

      {/* Project label */}
      <div className="px-4 py-2 border-b border-[rgba(255,255,255,0.04)]">
        <div className="font-mono text-[10px] text-[rgba(245,247,250,0.28)] uppercase tracking-widest">Project</div>
        <div className="text-[13px] font-semibold text-[#F5F7FA] mt-0.5">DRONE-X1</div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto py-2">
        {DRONE_COMPONENTS.map((comp, i) => {
          const isSelected = selectedComponentId === comp.id;
          const isHighlighted = highlightedComponentId === comp.id;

          return (
            <button
              key={comp.id}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150 group',
                'hover:bg-[rgba(255,255,255,0.04)]',
                isSelected && 'bg-[rgba(139,233,255,0.06)] border-l-2 border-[#8BE9FF]',
                !isSelected && 'border-l-2 border-transparent',
              )}
              onClick={() => selectComponent(isSelected ? null : comp.id)}
              onMouseEnter={() => highlightComponent(comp.id)}
              onMouseLeave={() => highlightComponent(null)}
              aria-label={`Select ${comp.name}`}
              aria-pressed={isSelected}
            >
              {/* Index */}
              <span className="font-mono text-[10px] text-[rgba(245,247,250,0.22)] w-5 flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>

              {/* Type icon */}
              <span className="text-[12px] text-[rgba(245,247,250,0.38)] w-4 flex-shrink-0">
                {typeIcons[comp.type] ?? '▪'}
              </span>

              {/* Name */}
              <span className={cn('flex-1 text-[12px] font-medium truncate', isSelected ? 'text-[#8BE9FF]' : 'text-[rgba(245,247,250,0.75)]')}>
                {comp.name}
              </span>

              {/* Status dot */}
              <span className={cn('w-1.5 h-1.5 rounded-full flex-shrink-0', {
                'bg-[#7DFFB2]': comp.status === 'installed' || comp.status === 'verified',
                'bg-[#8BE9FF] animate-pulse': comp.status === 'active',
                'bg-[rgba(245,247,250,0.2)]': comp.status === 'pending',
                'bg-[#FF7F8A]': comp.status === 'error',
              })} />
            </button>
          );
        })}
      </div>

      {/* Footer status */}
      <div className="px-4 py-3 border-t border-[rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between">
          <TechnicalLabel>Model Status</TechnicalLabel>
          <span className="font-mono text-[10px] text-[#7DFFB2] uppercase tracking-widest">● READY</span>
        </div>
      </div>
    </div>
  );
}
