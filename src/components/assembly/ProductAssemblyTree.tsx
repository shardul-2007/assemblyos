'use client';
import { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronRight, Layers, Eye, Trash2, PlusCircle, Maximize2 } from 'lucide-react';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import type { Part } from '@/types/productAssembly';

export function ProductAssemblyTree() {
  const {
    currentAssembly,
    parts,
    selectedPartId,
    selectPart,
  } = useProductAssemblyStore();

  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  // Group parts by category
  const categories = useMemo(() => {
    const map: Record<string, Part[]> = {};
    parts.forEach((p) => {
      const cat = p.category;
      if (!map[cat]) map[cat] = [];
      map[cat].push(p);
    });
    return map;
  }, [parts]);

  // Search filter
  const filteredParts = useMemo(() => {
    if (!search.trim()) return null;
    return parts.filter(
      (p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        (p.partNumber && p.partNumber.toLowerCase().includes(search.toLowerCase()))
    );
  }, [parts, search]);

  return (
    <div className="flex flex-col h-full bg-[#080b0f]/85 backdrop-blur-xl border-r border-[rgba(255,255,255,0.06)] select-none">
      {/* Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
        <TechnicalLabel variant="accent">3D ASSEMBLY TREE</TechnicalLabel>
        <h2 className="text-[15px] font-bold text-[#F5F7FA] mt-0.5 truncate">{currentAssembly.name}</h2>
        <div className="flex items-center gap-3 mt-1.5 text-[10px] font-mono text-[rgba(245,247,250,0.4)]">
          <span>{currentAssembly.category}</span>
          <span>·</span>
          <span>{parts.length} COMPONENTS</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-3 py-2.5 border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
          <Search size={13} className="text-[rgba(245,247,250,0.35)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assembly (motor, prop, battery)..."
            className="flex-1 bg-transparent text-xs text-[#F5F7FA] placeholder-[rgba(245,247,250,0.3)] outline-none"
          />
        </div>
      </div>

      {/* Assembly Tree View */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredParts ? (
          // Search Results Flat List
          <div className="space-y-1">
            <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.4)] px-2 py-1 block">
              SEARCH RESULTS ({filteredParts.length})
            </span>
            {filteredParts.map((part) => (
              <PartRow key={part.id} part={part} isSelected={selectedPartId === part.id} onSelect={selectPart} />
            ))}
          </div>
        ) : (
          // Categorized Hierarchy Tree
          Object.entries(categories).map(([cat, catParts]) => {
            const isCollapsed = collapsedCategories[cat];
            return (
              <div key={cat} className="space-y-0.5">
                <button
                  onClick={() => toggleCategory(cat)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.03)] text-left font-mono text-[10px] uppercase tracking-wider text-[rgba(245,247,250,0.5)] transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    {isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                    <span className="text-[#8BE9FF] font-semibold">{cat}</span>
                  </div>
                  <span className="text-[rgba(245,247,250,0.3)]">({catParts.length})</span>
                </button>

                {!isCollapsed && (
                  <div className="pl-3 space-y-0.5">
                    {catParts.map((part) => (
                      <PartRow
                        key={part.id}
                        part={part}
                        isSelected={selectedPartId === part.id}
                        onSelect={selectPart}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Status Bar */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] text-[10px] font-mono text-[rgba(245,247,250,0.4)] flex justify-between">
        <span>ASSEMBLY VALID</span>
        <span>{parts.filter((p) => p.status === 'installed').length}/{parts.length} ACTIVE</span>
      </div>
    </div>
  );
}

function PartRow({
  part,
  isSelected,
  onSelect,
}: {
  part: Part;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const isRemoved = part.status === 'removed';
  const isHidden = part.status === 'hidden';

  return (
    <div
      onClick={() => onSelect(part.id)}
      className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-all duration-150 cursor-pointer border ${
        isSelected
          ? 'bg-[rgba(139,233,255,0.12)] border-[#8BE9FF] text-[#F5F7FA]'
          : 'bg-transparent border-transparent hover:bg-[rgba(255,255,255,0.03)] text-[rgba(245,247,250,0.7)]'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: isRemoved ? '#FF7F8A' : isHidden ? '#64748B' : '#7DFFB2' }}
        />
        <span className={`truncate text-[12px] font-medium ${isRemoved ? 'line-through opacity-50' : ''}`}>
          {part.name}
        </span>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[9px] text-[rgba(245,247,250,0.35)]">
        {part.photos.length > 0 && <span className="text-[#8BE9FF]">📷</span>}
        <span>{part.partNumber ?? ''}</span>
      </div>
    </div>
  );
}
