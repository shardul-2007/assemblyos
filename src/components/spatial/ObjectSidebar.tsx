'use client';
import { useState, useMemo } from 'react';
import { Search, Filter, Layers, CheckCircle2, ChevronRight, AlertCircle, Wrench, Shield, Box } from 'lucide-react';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useSpatialStore } from '@/store/spatialStore';
import { CATEGORY_META, STATUS_META } from '@/data/demoSpace';
import type { ObjectCategory } from '@/types/spatial';
import { cn } from '@/lib/utils';

export function ObjectSidebar() {
  const { objects, space, scene, selectObject, openInspector, highlightCategory } = useSpatialStore();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Filtered objects
  const filteredObjects = useMemo(() => {
    return objects.filter((obj) => {
      const matchSearch =
        obj.name.toLowerCase().includes(search.toLowerCase()) ||
        obj.category.toLowerCase().includes(search.toLowerCase()) ||
        (obj.metadata.manufacturer && obj.metadata.manufacturer.toLowerCase().includes(search.toLowerCase()));

      const matchCat = selectedCategory ? obj.category === selectedCategory : true;
      return matchSearch && matchCat;
    });
  }, [objects, search, selectedCategory]);

  // Unique categories in space
  const categories = useMemo(() => {
    const set = new Set(objects.map((o) => o.category));
    return Array.from(set);
  }, [objects]);

  const handleCategoryClick = (cat: string | null) => {
    setSelectedCategory(cat);
    highlightCategory(cat);
  };

  return (
    <div className="flex flex-col h-full bg-[#080b0f]/85 backdrop-blur-xl border-r border-[rgba(255,255,255,0.06)] select-none">
      {/* Space Specs Header */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
        <TechnicalLabel variant="accent">SPATIAL DIGITAL TWIN</TechnicalLabel>
        <h2 className="text-[15px] font-bold text-[#F5F7FA] mt-0.5 truncate">{space.name}</h2>
        <div className="flex items-center gap-3 mt-2 text-[10px] font-mono text-[rgba(245,247,250,0.45)]">
          {space.dimensions && (
            <span>
              {space.dimensions.width}m × {space.dimensions.depth}m ({Math.round(space.dimensions.width * space.dimensions.depth)}m²)
            </span>
          )}
          <span>·</span>
          <span>{objects.length} Objects</span>
        </div>
      </div>

      {/* Search Input */}
      <div className="px-3 pt-3 pb-2 border-b border-[rgba(255,255,255,0.04)]">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)]">
          <Search size={13} className="text-[rgba(245,247,250,0.35)]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search machines or items..."
            className="flex-1 bg-transparent text-xs text-[#F5F7FA] placeholder-[rgba(245,247,250,0.3)] outline-none"
          />
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="px-3 py-2 border-b border-[rgba(255,255,255,0.04)] overflow-x-auto whitespace-nowrap scrollbar-none flex gap-1">
        <button
          onClick={() => handleCategoryClick(null)}
          className={cn(
            'font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded transition-colors',
            selectedCategory === null
              ? 'bg-[#8BE9FF] text-[#050607] font-semibold'
              : 'text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] bg-[rgba(255,255,255,0.03)]'
          )}
        >
          All ({objects.length})
        </button>
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat] ?? CATEGORY_META.other;
          const count = objects.filter((o) => o.category === cat).length;
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(isSelected ? null : cat)}
              className={cn(
                'font-mono text-[9px] uppercase tracking-wider px-2 py-1 rounded transition-colors flex items-center gap-1',
                isSelected
                  ? 'bg-[rgba(139,233,255,0.2)] text-[#8BE9FF] border border-[rgba(139,233,255,0.4)]'
                  : 'text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] bg-[rgba(255,255,255,0.03)]'
              )}
            >
              <span>{meta.icon}</span>
              <span>{meta.label}</span>
              <span className="opacity-50">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Objects list */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {filteredObjects.length === 0 ? (
          <div className="p-6 text-center text-xs text-[rgba(245,247,250,0.35)] font-mono">
            No matching entities found.
          </div>
        ) : (
          filteredObjects.map((obj) => {
            const catMeta = CATEGORY_META[obj.category] ?? CATEGORY_META.other;
            const statusMeta = STATUS_META[obj.status] ?? STATUS_META.unknown;
            const isSelected = scene.selectedObjectId === obj.id;
            const isHighlighted = scene.highlightedObjectIds.includes(obj.id);

            return (
              <div
                key={obj.id}
                onClick={() => {
                  selectObject(obj.id);
                  openInspector(obj.id);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer border',
                  isSelected
                    ? 'bg-[rgba(139,233,255,0.12)] border-[#8BE9FF] text-[#F5F7FA]'
                    : isHighlighted
                    ? 'bg-[rgba(125,255,178,0.08)] border-[#7DFFB2] text-[#F5F7FA]'
                    : 'bg-transparent border-transparent hover:bg-[rgba(255,255,255,0.03)] text-[rgba(245,247,250,0.7)]'
                )}
              >
                <span className="text-base select-none" style={{ color: catMeta.color }}>
                  {catMeta.icon}
                </span>

                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold truncate leading-tight">
                    {obj.name}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.35)]">
                      {catMeta.label}
                    </span>
                    {obj.photos.length > 0 && (
                      <span className="font-mono text-[9px] text-[#8BE9FF]">
                        📷 {obj.photos.length}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <div className={cn('w-1.5 h-1.5 rounded-full mb-1', statusMeta.dot)} />
                  <span className="font-mono text-[9px] text-[rgba(245,247,250,0.35)]">
                    {Math.round(obj.confidence * 100)}%
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer stats summary */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] text-[10px] font-mono text-[rgba(245,247,250,0.35)] flex justify-between">
        <span>STATUS: READY</span>
        <span>SEMANTIC NODES: {objects.length}</span>
      </div>
    </div>
  );
}
