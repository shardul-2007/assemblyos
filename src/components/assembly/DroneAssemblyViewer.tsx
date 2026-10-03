'use client';
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useProductAssemblyStore } from '@/store/productAssemblyStore';
import type { Part } from '@/types/productAssembly';

function lerp3(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return new THREE.Vector3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Part 3D Mesh
// ─────────────────────────────────────────────────────────────────────────────

interface PartMeshProps {
  part: Part;
  explodedProgress: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isIsolated: boolean;
  evidenceMode: boolean;
  onSelect: (id: string) => void;
}

function PartMesh({
  part,
  explodedProgress,
  isSelected,
  isHighlighted,
  isIsolated,
  evidenceMode,
  onSelect,
}: PartMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const basePos = useMemo(() => new THREE.Vector3(part.position.x, part.position.y, part.position.z), [part.position]);
  const explPos = useMemo(() => new THREE.Vector3(part.explodedPosition.x, part.explodedPosition.y, part.explodedPosition.z), [part.explodedPosition]);

  useFrame(() => {
    if (!meshRef.current) return;

    // If part was removed, animate it dropping/moving away
    if (part.status === 'removed') {
      meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, -4, 0.05);
      return;
    }

    // Explode interpolation
    const target = lerp3(basePos, explPos, explodedProgress);
    meshRef.current.position.lerp(target, 0.08);

    // Emissive animation
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    if (mat) {
      const targetIntensity = isSelected
        ? 0.85
        : isHighlighted
        ? 0.65
        : hovered
        ? 0.4
        : evidenceMode && part.visibility === 'inferred'
        ? 0.5
        : part.emissiveColor
        ? 0.15
        : 0;
      mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, 0.1);
    }
  });

  if (part.status === 'hidden') return null;

  // Geometry selector per part type
  const getGeometry = () => {
    switch (part.category) {
      case 'frame':
        return <boxGeometry args={[1.8, 0.08, 1.4]} />;
      case 'motor':
        return <cylinderGeometry args={[0.16, 0.18, 0.25, 16]} />;
      case 'propeller':
        return <cylinderGeometry args={[0.65, 0.65, 0.015, 16]} />;
      case 'battery':
        return <boxGeometry args={[0.9, 0.22, 0.4]} />;
      case 'electronics':
        return <boxGeometry args={[0.55, 0.03, 0.55]} />;
      case 'camera':
        return <boxGeometry args={[0.25, 0.22, 0.3]} />;
      default:
        return <boxGeometry args={[0.2, 0.2, 0.2]} />;
    }
  };

  const isDimmed = isIsolated && !isSelected;
  const isInferred = part.visibility === 'inferred';

  // Material color adjustments in evidence mode
  const displayColor = evidenceMode
    ? isInferred
      ? '#D97706' // amber for inferred
      : '#059669' // emerald for visible
    : isDimmed
    ? '#334155'
    : part.color;

  const displayEmissive = evidenceMode
    ? isInferred
      ? '#FFD36A'
      : '#7DFFB2'
    : part.emissiveColor ?? part.color;

  return (
    <group>
      <mesh
        ref={meshRef}
        position={[part.position.x, part.position.y, part.position.z]}
        castShadow
        receiveShadow
        onClick={(e) => {
          e.stopPropagation();
          onSelect(part.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        {getGeometry()}
        <meshStandardMaterial
          color={displayColor}
          emissive={displayEmissive}
          emissiveIntensity={0.15}
          metalness={evidenceMode ? 0.3 : part.category === 'motor' ? 0.8 : 0.4}
          roughness={part.category === 'motor' ? 0.2 : 0.5}
          transparent={isDimmed || (evidenceMode && isInferred)}
          opacity={isDimmed ? 0.25 : evidenceMode && isInferred ? 0.7 : 1}
          wireframe={evidenceMode && isInferred}
        />

        {/* Selection ring */}
        {isSelected && (
          <mesh>
            <torusGeometry args={[0.4, 0.015, 8, 32]} />
            <meshBasicMaterial color="#8BE9FF" />
          </mesh>
        )}

        {/* Evidence Indicator Halo when in Evidence Mode */}
        {evidenceMode && !isDimmed && (
          <mesh position={[0, 0.2, 0]}>
            <torusGeometry args={[0.3, 0.008, 6, 24]} />
            <meshBasicMaterial color={isInferred ? '#FFD36A' : '#7DFFB2'} transparent opacity={0.6} />
          </mesh>
        )}

        {/* Hover / Selection Label Overlay */}
        {(hovered || isHighlighted || isSelected) && (
          <Html center distanceFactor={10}>
            <div
              style={{
                background: isSelected
                  ? 'rgba(139,233,255,0.95)'
                  : isHighlighted
                  ? 'rgba(0,140,255,0.9)'
                  : 'rgba(5,6,7,0.85)',
                color: isSelected ? '#050607' : '#F5F7FA',
                border: isSelected
                  ? '1px solid #8BE9FF'
                  : isInferred
                  ? '1px dashed #FFD36A'
                  : '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <span>{part.name.toUpperCase()}</span>
              <span
                style={{
                  fontSize: 8,
                  padding: '1px 4px',
                  borderRadius: 3,
                  background: isInferred ? 'rgba(255,211,106,0.3)' : 'rgba(125,255,178,0.3)',
                  color: isInferred ? '#FFD36A' : '#7DFFB2',
                }}
              >
                {isInferred ? 'INFERRED' : 'VISIBLE'}
              </span>
              {part.status === 'removed' && (
                <span style={{ color: '#FF7F8A', fontWeight: 'bold' }}>✕ DETACHED</span>
              )}
            </div>
          </Html>
        )}
      </mesh>
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Functional Flow Rays ("How It Works" Mode)
// ─────────────────────────────────────────────────────────────────────────────
function FunctionalFlowLines({ active }: { active: boolean }) {
  if (!active) return null;

  return (
    <group>
      {/* Battery to Electronics power pulses */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.4, 8]} />
        <meshBasicMaterial color="#FFD36A" />
      </mesh>
      {/* Central electronics to motors */}
      {[-1.2, 1.2].map((x) =>
        [-1.2, 1.2].map((z) => (
          <line key={`${x}-${z}`}>
            <bufferGeometry
              attach="geometry"
              onUpdate={(self) => {
                const points = [new THREE.Vector3(0, 0.15, 0), new THREE.Vector3(x, 0.1, z)];
                self.setFromPoints(points);
              }}
            />
            <lineBasicMaterial attach="material" color="#00E5FF" linewidth={2} />
          </line>
        ))
      )}
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main 3D Drone Assembly Viewer
// ─────────────────────────────────────────────────────────────────────────────

export function DroneAssemblyViewer() {
  const {
    parts,
    selectedPartId,
    highlightedPartIds,
    isolatedPartId,
    explodedProgress,
    mode,
    evidenceMode,
    selectPart,
  } = useProductAssemblyStore();

  const detachedCount = parts.filter((p) => p.status === 'removed').length;

  return (
    <div className="relative w-full h-full bg-[#050607] select-none">
      <Canvas
        camera={{ position: [0, 4, 6], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        onPointerDown={(e) => {
          if (e.target === e.currentTarget) {
            selectPart(null);
          }
        }}
      >
        <color attach="background" args={['#050607']} />

        {/* Ambient & Key Studio Lighting */}
        <ambientLight intensity={0.7} />
        <directionalLight position={[8, 15, 10]} intensity={1.4} castShadow />
        <pointLight position={[-8, 6, -8]} intensity={0.8} color="#8BE9FF" />
        <pointLight position={[0, -5, 0]} intensity={0.4} color="#0055AA" />

        {/* Ground grid */}
        <Grid
          position={[0, -1.8, 0]}
          args={[12, 12]}
          cellSize={0.4}
          cellThickness={0.6}
          cellColor="#1a2333"
          sectionSize={1.6}
          sectionThickness={1.2}
          sectionColor="#2d3d59"
          fadeDistance={18}
        />

        {/* 3D Parts */}
        {parts.map((part) => (
          <PartMesh
            key={part.id}
            part={part}
            explodedProgress={explodedProgress}
            isSelected={selectedPartId === part.id}
            isHighlighted={highlightedPartIds.includes(part.id)}
            isIsolated={isolatedPartId !== null && isolatedPartId !== part.id}
            evidenceMode={evidenceMode}
            onSelect={selectPart}
          />
        ))}

        {/* Functional power/signal flow rays */}
        <FunctionalFlowLines active={mode === 'how-it-works'} />

        {/* Camera Orbit Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.06}
          maxDistance={18}
          minDistance={1.5}
        />
      </Canvas>

      {/* Floating Status Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-1.5">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#080b0f]/80 border border-[rgba(255,255,255,0.08)] backdrop-blur shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#8BE9FF] animate-pulse" />
          <span className="font-mono text-[10px] text-[#F5F7FA] font-bold uppercase tracking-wider">
            DRONE-X1 ASSEMBLY
          </span>
          <span className="font-mono text-[10px] text-[rgba(245,247,250,0.4)]">
            · {parts.filter((p) => p.status === 'installed').length}/{parts.length} INSTALLED
          </span>
        </div>

        {evidenceMode && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 backdrop-blur font-mono text-[9px] text-[#FFD36A]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FFD36A] animate-ping" />
            <span>EVIDENCE MODE: Solid Green = Visible / Wireframe Amber = Inferred</span>
          </div>
        )}

        {detachedCount > 0 && (
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/30 backdrop-blur font-mono text-[9px] text-red-400">
            <span>{detachedCount} PART{detachedCount > 1 ? 'S' : ''} DETACHED (USE REASSEMBLE TO RESTORE)</span>
          </div>
        )}
      </div>
    </div>
  );
}
