'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Cpu,
  RotateCw,
  GitCommit,
  AlertTriangle,
  X,
  Filter,
  CheckCircle,
  HelpCircle,
  Activity,
} from 'lucide-react';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import { cn } from '@/lib/utils';
import type { Part } from '@/types/productAssembly';

interface EdgeDef {
  id: string;
  source: string;
  target: string;
  type: 'powers' | 'controls' | 'drives' | 'mounts';
  label: string;
}

const GRAPH_EDGES: EdgeDef[] = [
  { id: 'e1', source: 'battery', target: 'esc', type: 'powers', label: '14.8V DC Main' },
  { id: 'e2', source: 'esc', target: 'fc', type: 'powers', label: '5V Regulated BEC' },
  { id: 'e3', source: 'fc', target: 'esc', type: 'controls', label: 'DShot600 8kHz' },
  { id: 'e4', source: 'esc', target: 'motor-fl', type: 'powers', label: '3-Phase AC FL' },
  { id: 'e5', source: 'esc', target: 'motor-fr', type: 'powers', label: '3-Phase AC FR' },
  { id: 'e6', source: 'esc', target: 'motor-rl', type: 'powers', label: '3-Phase AC RL' },
  { id: 'e7', source: 'esc', target: 'motor-rr', type: 'powers', label: '3-Phase AC RR' },
  { id: 'e8', source: 'motor-fl', target: 'prop-fl', type: 'drives', label: 'CCW Torque' },
  { id: 'e9', source: 'motor-fr', target: 'prop-fr', type: 'drives', label: 'CW Torque' },
  { id: 'e10', source: 'motor-rl', target: 'prop-rl', type: 'drives', label: 'CW Torque' },
  { id: 'e11', source: 'motor-rr', target: 'prop-rr', type: 'drives', label: 'CCW Torque' },
  { id: 'e12', source: 'fc', target: 'camera', type: 'controls', label: 'OSD HUD Video' },
];

interface NodePosition {
  id: string;
  col: number; // 0, 1, 2, 3
  row: number; // vertical index
}

// Logical layout for drone components
const NODE_POSITIONS: Record<string, { col: number; row: number }> = {
  battery: { col: 0, row: 2 },
  esc: { col: 1, row: 2 },
  fc: { col: 1, row: 0.5 },
  camera: { col: 2, row: 0.5 },
  'motor-fl': { col: 2, row: 1.5 },
  'motor-fr': { col: 2, row: 2.3 },
  'motor-rl': { col: 2, row: 3.1 },
  'motor-rr': { col: 2, row: 3.9 },
  'prop-fl': { col: 3, row: 1.5 },
  'prop-fr': { col: 3, row: 2.3 },
  'prop-rl': { col: 3, row: 3.1 },
  'prop-rr': { col: 3, row: 3.9 },
  frame: { col: 0, row: 0.5 },
};

interface MachineGraphVisualizerProps {
  onClose?: () => void;
  className?: string;
}

export function MachineGraphVisualizer({ onClose, className }: MachineGraphVisualizerProps) {
  const { parts, selectedPartId, selectPart, highlightParts } = useProductAssemblyStore();
  const [filterType, setFilterType] = useState<'all' | 'powers' | 'controls' | 'drives'>('all');
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Check which parts are unpowered or disabled due to removed upstream parts
  const disabledPartIds = useMemo(() => {
    const disabled = new Set<string>();
    const battery = parts.find((p) => p.id === 'battery');
    const esc = parts.find((p) => p.id === 'esc');
    const fc = parts.find((p) => p.id === 'fc');

    if (battery?.status === 'removed') {
      ['esc', 'fc', 'motor-fl', 'motor-fr', 'motor-rl', 'motor-rr', 'prop-fl', 'prop-fr', 'prop-rl', 'prop-rr', 'camera'].forEach(
        (id) => disabled.add(id)
      );
    } else if (esc?.status === 'removed') {
      ['motor-fl', 'motor-fr', 'motor-rl', 'motor-rr', 'prop-fl', 'prop-fr', 'prop-rl', 'prop-rr'].forEach((id) =>
        disabled.add(id)
      );
    }

    if (fc?.status === 'removed') {
      ['camera'].forEach((id) => disabled.add(id));
    }

    return disabled;
  }, [parts]);

  // Edges filtered
  const filteredEdges = useMemo(() => {
    if (filterType === 'all') return GRAPH_EDGES;
    return GRAPH_EDGES.filter((e) => e.type === filterType);
  }, [filterType]);

  // Map parts to node list
  const activeNodes = useMemo(() => {
    return parts.map((part) => {
      const pos = NODE_POSITIONS[part.id] ?? { col: 1, row: 0 };
      return {
        ...part,
        col: pos.col,
        row: pos.row,
        isDisabled: disabledPartIds.has(part.id) && part.status !== 'removed',
      };
    });
  }, [parts, disabledPartIds]);

  const getEdgeColor = (type: EdgeDef['type']) => {
    switch (type) {
      case 'powers':
        return '#FFD36A'; // yellow
      case 'controls':
        return '#8BE9FF'; // cyan
      case 'drives':
        return '#7DFFB2'; // green
      default:
        return '#94A3B8';
    }
  };

  return (
    <div
      className={cn(
        'relative flex flex-col h-full bg-[#080b0f] border border-[rgba(255,255,255,0.08)] rounded-xl overflow-hidden shadow-2xl select-none',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[#0c1017]/90 backdrop-blur z-20">
        <div className="flex items-center gap-2">
          <Activity size={13} className="text-[#8BE9FF]" />
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#F5F7FA]">
            Machine Dependency &amp; Functional Topology
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Edge Filter */}
          <div className="flex items-center bg-[rgba(255,255,255,0.04)] rounded-lg p-0.5 border border-[rgba(255,255,255,0.06)] text-[9px] font-mono">
            <button
              onClick={() => setFilterType('all')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterType === 'all'
                  ? 'bg-[#8BE9FF] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#F5F7FA]'
              )}
            >
              ALL
            </button>
            <button
              onClick={() => setFilterType('powers')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterType === 'powers'
                  ? 'bg-[#FFD36A] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#FFD36A]'
              )}
            >
              POWER
            </button>
            <button
              onClick={() => setFilterType('controls')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterType === 'controls'
                  ? 'bg-[#8BE9FF] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#8BE9FF]'
              )}
            >
              CONTROL
            </button>
            <button
              onClick={() => setFilterType('drives')}
              className={cn(
                'px-2 py-0.5 rounded transition-colors',
                filterType === 'drives'
                  ? 'bg-[#7DFFB2] text-[#050607] font-bold'
                  : 'text-[rgba(245,247,250,0.5)] hover:text-[#7DFFB2]'
              )}
            >
              DRIVE
            </button>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Main Node-Link Graph Area */}
      <div className="relative flex-1 p-4 overflow-auto bg-gradient-to-b from-[#090d14] to-[#040609]">
        {/* Subtle dot matrix */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.2) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />

        {/* 4-Stage Pipeline Column Labels */}
        <div className="grid grid-cols-4 gap-2 mb-3 pb-2 border-b border-[rgba(255,255,255,0.05)] text-center font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)]">
          <div>1. Power &amp; Airframe</div>
          <div>2. Power Dist / Compute</div>
          <div>3. Actuation Motors</div>
          <div>4. Aerodynamic Load</div>
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-4 gap-3 relative min-h-[360px]">
          {[0, 1, 2, 3].map((colIndex) => {
            const colNodes = activeNodes.filter((n) => n.col === colIndex);
            return (
              <div key={colIndex} className="flex flex-col gap-2.5">
                {colNodes.map((node) => {
                  const isSelected = selectedPartId === node.id;
                  const isHovered = hoveredNodeId === node.id;
                  const isRemoved = node.status === 'removed';
                  const isDisabled = node.isDisabled;
                  const isVisible = node.visibility === 'visible';

                  return (
                    <motion.div
                      key={node.id}
                      onClick={() => selectPart(node.id)}
                      onMouseEnter={() => {
                        setHoveredNodeId(node.id);
                        highlightParts([node.id]);
                      }}
                      onMouseLeave={() => {
                        setHoveredNodeId(null);
                        highlightParts([]);
                      }}
                      className={cn(
                        'relative p-2 rounded-xl border text-left cursor-pointer transition-all duration-200 select-none backdrop-blur-sm',
                        isRemoved
                          ? 'border-red-500/50 bg-red-950/20 text-red-200 opacity-60'
                          : isDisabled
                          ? 'border-amber-500/40 bg-amber-950/20 text-amber-200 opacity-75'
                          : isSelected
                          ? 'border-[#8BE9FF] bg-[#8BE9FF]/15 shadow-[0_0_15px_rgba(139,233,255,0.3)] scale-[1.02]'
                          : isHovered
                          ? 'border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.05)]'
                          : 'border-[rgba(255,255,255,0.06)] bg-[#0d131f]/80 hover:border-[rgba(255,255,255,0.18)]'
                      )}
                    >
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <span
                          className={cn(
                            'font-mono text-[9px] uppercase px-1 rounded',
                            isVisible
                              ? 'bg-emerald-500/15 text-[#7DFFB2]'
                              : 'bg-amber-500/15 text-[#FFD36A]'
                          )}
                        >
                          {isVisible ? 'VIS' : 'INF'}
                        </span>

                        {isRemoved && (
                          <span className="font-mono text-[8px] bg-red-500/20 text-red-300 px-1 rounded uppercase font-bold">
                            DETACHED
                          </span>
                        )}
                        {isDisabled && !isRemoved && (
                          <span className="font-mono text-[8px] bg-amber-500/20 text-amber-300 px-1 rounded uppercase font-bold flex items-center gap-0.5">
                            <AlertTriangle size={8} /> NO PWR
                          </span>
                        )}
                      </div>

                      <div className="font-semibold text-[11px] text-[#F5F7FA] leading-tight truncate">
                        {node.name}
                      </div>

                      <div className="flex items-center justify-between mt-1 text-[9px] font-mono text-[rgba(245,247,250,0.4)]">
                        <span>{node.category.toUpperCase()}</span>
                        <span className="text-[#8BE9FF]">{node.partNumber ?? node.id}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Functional Edge Legend & Flow List */}
        <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.06)]">
          <div className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.4)] mb-2">
            Active Relationship Busses ({filteredEdges.length})
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 font-mono text-[9px]">
            {filteredEdges.map((edge) => {
              const srcPart = parts.find((p) => p.id === edge.source);
              const tgtPart = parts.find((p) => p.id === edge.target);
              const isAffected =
                srcPart?.status === 'removed' ||
                tgtPart?.status === 'removed' ||
                disabledPartIds.has(edge.source) ||
                disabledPartIds.has(edge.target);

              return (
                <div
                  key={edge.id}
                  className={cn(
                    'flex items-center justify-between px-2 py-1 rounded border',
                    isAffected
                      ? 'border-red-500/20 bg-red-950/10 text-red-400 line-through opacity-50'
                      : 'border-[rgba(255,255,255,0.04)] bg-[rgba(255,255,255,0.01)] text-[rgba(245,247,250,0.7)]'
                  )}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: getEdgeColor(edge.type) }}
                    />
                    <span className="truncate">{edge.label}</span>
                  </div>
                  <span className="text-[8px] uppercase text-[rgba(245,247,250,0.3)]">
                    {edge.type}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Status Readout */}
      <div className="flex items-center justify-between px-3 py-2 border-t border-[rgba(255,255,255,0.06)] bg-[#080b0f] text-[10px] font-mono text-[rgba(245,247,250,0.5)] z-20">
        <div className="flex items-center gap-1.5">
          <GitCommit size={12} className="text-[#8BE9FF]" />
          <span>Interactive topology updates live on component detachment</span>
        </div>

        {disabledPartIds.size > 0 && (
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <AlertTriangle size={11} /> {disabledPartIds.size} downstream dependencies offline
          </span>
        )}
      </div>
    </div>
  );
}
