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
  onSelect: (id: string) => void;
}

function PartMesh({
  part,
  explodedProgress,
  isSelected,
  isHighlighted,
  isIsolated,
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
        ? 0.8
        : isHighlighted
        ? 0.6
        : hovered
        ? 0.35
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
          color={isDimmed ? '#334155' : part.color}
          emissive={part.emissiveColor ?? part.color}
          emissiveIntensity={0.15}
          metalness={part.category === 'motor' ? 0.8 : 0.4}
          roughness={part.category === 'motor' ? 0.2 : 0.5}
          transparent={isDimmed}
          opacity={isDimmed ? 0.25 : 1}
        />

        {/* Selection ring */}
        {isSelected && (
          <mesh>
            <torusGeometry args={[0.4, 0.015, 8, 32]} />
            <meshBasicMaterial color="#8BE9FF" />
          </mesh>
        )}

        {/* Hover / Label Overlay */}
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
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 6,
                padding: '4px 10px',
                fontSize: 10,
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: '0.06em',
                whiteSpace: 'nowrap',
                pointerEvents: 'none',
                boxShadow: '0 0 15px rgba(0,0,0,0.5)',
              }}
            >
              {part.name.toUpperCase()} {part.status === 'removed' ? '(REMOVED)' : ''}
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
    selectPart,
  } = useProductAssemblyStore();

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
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#080b0f]/80 border border-[rgba(255,255,255,0.08)] backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-[#8BE9FF] animate-pulse" />
          <span className="font-mono text-[10px] text-[#F5F7FA] font-bold uppercase tracking-wider">
            DRONE-X1 ASSEMBLY
          </span>
          <span className="font-mono text-[10px] text-[rgba(245,247,250,0.4)]">
            · {parts.filter((p) => p.status === 'installed').length}/{parts.length} INSTALLED
          </span>
        </div>
      </div>
    </div>
  );
}
