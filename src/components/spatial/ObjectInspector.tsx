'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, AlertTriangle, Image as ImageIcon, Plus, Eye, CheckCircle2 } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { TechnicalLabel } from '@/components/ui/TechnicalLabel';
import { useSpatialStore } from '@/store/spatialStore';
import { CATEGORY_META, STATUS_META } from '@/data/demoSpace';
import type { SpatialObject, Photo } from '@/types/spatial';
import { cn } from '@/lib/utils';

export function ObjectInspector() {
  const { showObjectInspector, inspectorObjectId, closeInspector, objects, photos, openCamera } = useSpatialStore();
  const object = objects.find((o) => o.id === inspectorObjectId);
  const objectPhotos = photos.filter((p) => p.objectId === inspectorObjectId);
  const [activeTab, setActiveTab] = useState<'info' | 'photos' | 'history'>('info');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  if (!showObjectInspector || !object) return null;

  const catMeta = CATEGORY_META[object.category] ?? CATEGORY_META.other;
  const statusMeta = STATUS_META[object.status] ?? STATUS_META.unknown;

  return (
    <AnimatePresence>
      <motion.aside
        key="inspector"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ duration: 0.2 }}
        className="absolute top-0 right-0 bottom-0 w-84 sm:w-96 z-20 flex flex-col border-l border-[rgba(255,255,255,0.08)] bg-[#080b0f]/95 backdrop-blur-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)]">
          <div className="flex-1 min-w-0 pr-3">
            <div className="flex items-center gap-2 mb-1">
              <span style={{ color: catMeta.color }} className="text-base select-none">
                {catMeta.icon}
              </span>
              <TechnicalLabel style={{ color: catMeta.color }}>{catMeta.label}</TechnicalLabel>
              <span className="font-mono text-[10px] text-[rgba(245,247,250,0.35)]">
                {Math.round(object.confidence * 100)}% CONFIDENCE
              </span>
            </div>
            <h2 className="text-[16px] font-bold text-[#F5F7FA] leading-tight truncate">
              {object.name}
            </h2>
            <div className="flex items-center gap-1.5 mt-1.5">
              <div className={cn('w-2 h-2 rounded-full', statusMeta.dot)} />
              <span className="font-mono text-[10px] tracking-wider uppercase font-semibold" style={{ color: statusMeta.color }}>
                {statusMeta.label}
              </span>
            </div>
          </div>
          <button
            onClick={closeInspector}
            className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA] transition-colors"
            aria-label="Close inspector"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
          {(['info', 'photos', 'history'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'flex-1 py-2.5 font-mono text-[10px] uppercase tracking-wider transition-colors',
                activeTab === tab
                  ? 'text-[#8BE9FF] border-b-2 border-[#8BE9FF] font-bold'
                  : 'text-[rgba(245,247,250,0.4)] hover:text-[rgba(245,247,250,0.7)]'
              )}
            >
              {tab === 'info' && 'Overview'}
              {tab === 'photos' && `Photos (${objectPhotos.length})`}
              {tab === 'history' && 'History'}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'info' && <InfoTab object={object} />}
          {activeTab === 'photos' && (
            <PhotosTab
              object={object}
              photos={objectPhotos}
              onCapture={() => openCamera(object.id)}
              onViewPhoto={setSelectedPhoto}
            />
          )}
          {activeTab === 'history' && <HistoryTab object={object} />}
        </div>

        {/* Footer Actions */}
        <div className="p-3.5 border-t border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.01)] flex gap-2">
          <GlowButton
            variant="primary"
            size="sm"
            icon={<Camera size={13} />}
            onClick={() => openCamera(object.id)}
            className="flex-1"
          >
            + Capture Photo
          </GlowButton>
        </div>

        {/* Large Photo Viewer Overlay */}
        <AnimatePresence>
          {selectedPhoto && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-30 flex flex-col bg-[#050607]/98 backdrop-blur"
            >
              <div className="flex items-center justify-between p-3.5 border-b border-[rgba(255,255,255,0.06)]">
                <div>
                  <TechnicalLabel>{selectedPhoto.photoType ?? 'Photo'}</TechnicalLabel>
                  <p className="text-[12px] font-semibold text-[#F5F7FA] mt-0.5">{object.name}</p>
                </div>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="p-1.5 rounded-lg hover:bg-[rgba(255,255,255,0.06)] text-[rgba(245,247,250,0.4)] hover:text-[#F5F7FA]"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedPhoto.url}
                  alt={object.name}
                  className="max-w-full max-h-full object-contain rounded-xl border border-[rgba(255,255,255,0.1)]"
                />
              </div>
              <div className="p-3.5 border-t border-[rgba(255,255,255,0.06)] font-mono text-[10px] text-[rgba(245,247,250,0.4)] uppercase tracking-wider flex justify-between">
                <span>SOURCE: {selectedPhoto.source}</span>
                <span>{selectedPhoto.timestamp.toLocaleString()}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.aside>
    </AnimatePresence>
  );
}

function InfoTab({ object }: { object: SpatialObject }) {
  return (
    <div className="p-4 space-y-4">
      {/* Estimated Dimensions */}
      {object.dimensions && (
        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <TechnicalLabel className="mb-1 block">DIMENSIONS (ESTIMATED)</TechnicalLabel>
          <p className="font-mono text-[13px] font-semibold text-[#8BE9FF]">
            {object.dimensions.width}m × {object.dimensions.height}m × {object.dimensions.depth}m
          </p>
          <span className="font-mono text-[9px] text-[rgba(245,247,250,0.3)] block mt-0.5">
            Width × Height × Depth
          </span>
        </div>
      )}

      {/* Equipment Identification / Metadata */}
      {(object.metadata.manufacturer || object.metadata.model || object.metadata.serial) && (
        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] space-y-2">
          <TechnicalLabel className="mb-1 block">EQUIPMENT IDENTIFICATION</TechnicalLabel>
          {object.metadata.manufacturer && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] uppercase">Manufacturer</span>
              <span className="font-mono font-semibold text-[#F5F7FA]">{object.metadata.manufacturer}</span>
            </div>
          )}
          {object.metadata.model && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] uppercase">Model</span>
              <span className="font-mono font-semibold text-[#F5F7FA]">{object.metadata.model}</span>
            </div>
          )}
          {object.metadata.serial && (
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-[10px] text-[rgba(245,247,250,0.4)] uppercase">Serial No.</span>
              <span className="font-mono text-[#8BE9FF] font-semibold">{object.metadata.serial}</span>
            </div>
          )}
        </div>
      )}

      {/* Components list */}
      {object.metadata.components && object.metadata.components.length > 0 && (
        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)]">
          <TechnicalLabel className="mb-2 block">IDENTIFIED COMPONENTS</TechnicalLabel>
          <div className="grid grid-cols-2 gap-1.5">
            {object.metadata.components.map((comp) => (
              <div key={comp} className="flex items-center gap-1.5 text-[11px] text-[rgba(245,247,250,0.7)] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8BE9FF]" />
                <span className="truncate">{comp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Observations */}
      {object.observations.length > 0 && (
        <div className="space-y-2">
          <TechnicalLabel className="block">AI OBSERVATIONS</TechnicalLabel>
          {object.observations.map((obs) => (
            <div
              key={obs.id}
              className="p-3 rounded-xl border text-[12px] leading-relaxed"
              style={{
                background: obs.severity === 'warning' ? 'rgba(255,211,106,0.05)' : 'rgba(255,255,255,0.02)',
                borderColor: obs.severity === 'warning' ? 'rgba(255,211,106,0.2)' : 'rgba(255,255,255,0.06)',
              }}
            >
              {obs.severity === 'warning' && (
                <div className="flex items-center gap-1.5 mb-1 text-[#FFD36A]">
                  <AlertTriangle size={12} />
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
                    AI Observation — Verify on Site
                  </span>
                </div>
              )}
              <p className="text-[rgba(245,247,250,0.7)]">{obs.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Location */}
      {object.metadata.location && (
        <div className="p-3 rounded-xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] flex justify-between items-center">
          <TechnicalLabel>Location</TechnicalLabel>
          <span className="font-mono text-xs text-[rgba(245,247,250,0.7)]">{object.metadata.location}</span>
        </div>
      )}
    </div>
  );
}

function PhotosTab({
  object,
  photos,
  onCapture,
  onViewPhoto,
}: {
  object: SpatialObject;
  photos: Photo[];
  onCapture: () => void;
  onViewPhoto: (p: Photo) => void;
}) {
  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <TechnicalLabel>MACHINE PHOTO GALLERY</TechnicalLabel>
          <p className="text-xs text-[rgba(245,247,250,0.5)] mt-0.5">
            {photos.length} photo{photos.length !== 1 ? 's' : ''} attached to this entity
          </p>
        </div>
        <GlowButton variant="secondary" size="sm" icon={<Camera size={12} />} onClick={onCapture}>
          Capture
        </GlowButton>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-dashed border-[rgba(255,255,255,0.1)] text-center">
          <ImageIcon size={28} className="text-[rgba(245,247,250,0.25)] mb-2" />
          <p className="text-xs text-[rgba(245,247,250,0.5)] max-w-xs">
            No photographs attached yet. Capture multiple angles (Front, Left, Nameplate, Control Panel).
          </p>
          <GlowButton variant="primary" size="sm" icon={<Plus size={12} />} onClick={onCapture} className="mt-4">
            Capture First Photo
          </GlowButton>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2.5">
          {photos.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onViewPhoto(photo)}
              className="group relative aspect-square rounded-xl overflow-hidden bg-black border border-[rgba(255,255,255,0.08)] hover:border-[#8BE9FF] transition-all cursor-pointer"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.thumbnailUrl || photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye size={18} className="text-white" />
              </div>
              {photo.photoType && (
                <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 backdrop-blur">
                  <span className="font-mono text-[9px] uppercase tracking-wider text-[rgba(245,247,250,0.8)]">
                    {photo.photoType}
                  </span>
                </div>
              )}
            </div>
          ))}

          {/* Add more button tile */}
          <button
            onClick={onCapture}
            className="aspect-square rounded-xl border-2 border-dashed border-[rgba(255,255,255,0.12)] hover:border-[#8BE9FF] flex flex-col items-center justify-center gap-1 transition-colors text-[rgba(245,247,250,0.4)] hover:text-[#8BE9FF]"
          >
            <Plus size={20} />
            <span className="font-mono text-[9px] uppercase tracking-wider">Add Photo</span>
          </button>
        </div>
      )}
    </div>
  );
}

function HistoryTab({ object }: { object: SpatialObject }) {
  return (
    <div className="p-4 space-y-3">
      <TechnicalLabel className="block">INSPECTION & ACTIVITY TIMELINE</TechnicalLabel>
      {object.inspectionHistory.length === 0 ? (
        <p className="text-xs text-[rgba(245,247,250,0.4)]">No activity recorded yet.</p>
      ) : (
        <div className="relative pl-4 space-y-3 border-l border-[rgba(255,255,255,0.08)] ml-1">
          {[...object.inspectionHistory].reverse().map((evt) => (
            <div key={evt.id} className="relative">
              <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#8BE9FF]" />
              <span className="font-mono text-[9px] text-[rgba(245,247,250,0.35)] uppercase tracking-wider block">
                {evt.timestamp.toLocaleString()}
              </span>
              <p className="text-[12px] text-[rgba(245,247,250,0.7)] mt-0.5">{evt.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
