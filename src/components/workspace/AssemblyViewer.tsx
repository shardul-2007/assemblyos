'use client';
import { useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { useAssemblyStore } from '@/store/assemblyStore';
import { DRONE_COMPONENTS } from '@/data/demoProduct';
import type { Component } from '@/types/assembly';

// ─────────────────────────────────────────────────────────────────────────────
// Geometry helpers
// ─────────────────────────────────────────────────────────────────────────────

function lerp3(a: THREE.Vector3, b: THREE.Vector3, t: number) {
  return new THREE.Vector3(
    a.x + (b.x - a.x) * t,
    a.y + (b.y - a.y) * t,
    a.z + (b.z - a.z) * t,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Component Mesh
// ─────────────────────────────────────────────────────────────────────────────

interface ComponentMeshProps {
  comp: Component;
  explodedProgress: number;
  isSelected: boolean;
  isHighlighted: boolean;
  onClick: (id: string) => void;
  onHover: (id: string | null) => void;
}

function ComponentMesh({ comp, explodedProgress, isSelected, isHighlighted, onClick, onHover }: ComponentMeshProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const basePos = new THREE.Vector3(comp.position.x, comp.position.y, comp.position.z);
  const explPos = new THREE.Vector3(comp.explodedPosition.x, comp.explodedPosition.y, comp.explodedPosition.z);

  useFrame(() => {
    if (!meshRef.current) return;
    const target = lerp3(basePos, explPos, explodedProgress);
    meshRef.current.position.lerp(target, 0.08);

    // Emissive animation for selected/highlighted
    const mat = meshRef.current.material as THREE.MeshStandardMaterial;
    const targetIntensity = isSelected ? 0.8 : isHighlighted ? 0.6 : hovered ? 0.3 : (comp.emissiveColor ? 0.12 : 0);
    mat.emissiveIntensity = THREE.MathUtils.lerp(mat.emissiveIntensity, targetIntensity, 0.1);
  });

  const getGeometry = () => {
    switch (comp.type) {
      case 'frame':    return <boxGeometry args={[1.6, 0.08, 1.2]} />;
      case 'motor':    return <cylinderGeometry args={[0.12, 0.14, 0.22, 16]} />;
      case 'battery':  return <boxGeometry args={[0.8, 0.12, 0.3]} />;
      case 'pcb':      return <boxGeometry args={[0.5, 0.025, 0.5]} />;
      case 'bracket':  return <boxGeometry args={[0.55, 0.06, 0.22]} />;
      case 'propeller':return <cylinderGeometry args={[0.55, 0.55, 0.015, 16]} />;
      case 'screw':    return <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />;
      case 'washer':   return <torusGeometry args={[0.04, 0.01, 6, 16]} />;
      case 'other':    return <boxGeometry args={[0.6, 0.15, 0.4]} />;
      default:         return <boxGeometry args={[0.2, 0.2, 0.2]} />;
    }
  };

  const emissiveCol = comp.emissiveColor ?? comp.color;

  return (
    <mesh
      ref={meshRef}
      position={[comp.position.x, comp.position.y, comp.position.z]}
      castShadow
      receiveShadow
      onClick={(e) => { e.stopPropagation(); onClick(comp.id); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onHover(comp.id); }}
      onPointerOut={() => { setHovered(false); onHover(null); }}
    >
      {getGeometry()}
      <meshStandardMaterial
        color={comp.color}
        emissive={emissiveCol}
        emissiveIntensity={0.12}
        metalness={comp.type === 'screw' || comp.type === 'washer' ? 0.95 : 0.6}
        roughness={comp.type === 'screw' || comp.type === 'washer' ? 0.1 : 0.4}
        transparent={false}
      />

      {/* Selection ring */}
      {isSelected && (
        <mesh>
          <torusGeometry args={[0.35, 0.015, 8, 32]} />
          <meshBasicMaterial color="#8BE9FF" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Hover/highlight label */}
      {(hovered || isHighlighted) && (
        <Html center distanceFactor={10}>
          <div
            style={{
              background: isHighlighted ? 'rgba(0,80,150,0.9)' : 'rgba(5,6,7,0.85)',
              border: `1px solid ${isHighlighted ? 'rgba(139,233,255,0.6)' : 'rgba(255,255,255,0.15)'}`,
              borderRadius: 6,
              padding: '4px 10px',
              fontSize: 10,
              fontFamily: 'monospace',
              color: isHighlighted ? '#8BE9FF' : '#F5F7FA',
              letterSpacing: '0.06em',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              boxShadow: isHighlighted ? '0 0 12px rgba(139,233,255,0.3)' : 'none',
            }}
          >
            {comp.name.toUpperCase()}
          </div>
        </Html>
      )}
    </mesh>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Frame arm extension (visual only)
// ─────────────────────────────────────────────────────────────────────────────
function FrameArms({ explodedProgress }: { explodedProgress: number }) {
  const arms: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [
    { pos: [-0.55, 0, -0.55], rot: [0, Math.PI / 4, 0] },
    { pos: [0.55, 0, -0.55],  rot: [0, -Math.PI / 4, 0] },
    { pos: [-0.55, 0, 0.55],  rot: [0, -Math.PI / 4, 0] },
    { pos: [0.55, 0, 0.55],   rot: [0, Math.PI / 4, 0] },
  ];
  const scale = 1 - explodedProgress * 0.3;
  return (
    <>
      {arms.map((arm, i) => (
        <mesh key={i} position={arm.pos} rotation={arm.rot} scale={[scale, 1, scale]}>
          <boxGeometry args={[0.9, 0.055, 0.18]} />
          <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Show Me Animation — motor moves into bracket
// ─────────────────────────────────────────────────────────────────────────────
function ShowMeAnimation({ active, onDone }: { active: boolean; onDone: () => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const arrowRef = useRef<THREE.Mesh>(null);
  const progress = useRef(0);
  const done = useRef(false);

  useFrame((_, delta) => {
    if (!active || done.current) return;
    progress.current = Math.min(progress.current + delta * 0.4, 1);
    if (meshRef.current) {
      // Motor comes from above and settles into position
      const t = progress.current;
      meshRef.current.position.y = THREE.MathUtils.lerp(2, 0.12, t);
      meshRef.current.position.x = -1.1;
      meshRef.current.position.z = 1.1;
      meshRef.current.rotation.y = t * Math.PI * 2;
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.5 + Math.sin(t * Math.PI) * 0.5;
    }
    if (arrowRef.current) {
      arrowRef.current.position.y = 1.5 - progress.current * 1.2;
      arrowRef.current.visible = progress.current < 0.9;
    }
    if (progress.current >= 1 && !done.current) {
      done.current = true;
      setTimeout(onDone, 600);
    }
  });

  if (!active) return null;

  return (
    <group>
      <mesh ref={meshRef} position={[-1.1, 2, 1.1]} castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.22, 16]} />
        <meshStandardMaterial color="#2A5C8A" metalness={0.85} roughness={0.2} emissive="#0088FF" emissiveIntensity={0.5} />
      </mesh>
      {/* Direction arrow */}
      <mesh ref={arrowRef} position={[-1.1, 1.5, 1.1]}>
        <coneGeometry args={[0.08, 0.3, 8]} />
        <meshBasicMaterial color="#8BE9FF" transparent opacity={0.8} />
      </mesh>
      {/* Target indicator */}
      <mesh position={[-1.1, 0.05, 1.1]}>
        <torusGeometry args={[0.25, 0.015, 8, 32]} />
        <meshBasicMaterial color="#7DFFB2" transparent opacity={0.7} />
      </mesh>
      <pointLight position={[-1.1, 1, 1.1]} color="#0088FF" intensity={2} distance={3} />
    </group>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Camera controller — flies to selected component
// ─────────────────────────────────────────────────────────────────────────────
function CameraController({ selectedId }: { selectedId: string | null }) {
  const { camera } = useThree();
  const targetRef = useRef(new THREE.Vector3(3, 2.5, 3));

  useEffect(() => {
    if (!selectedId) {
      targetRef.current.set(3, 2.5, 3);
      return;
    }
    const comp = DRONE_COMPONENTS.find((c) => c.id === selectedId);
    if (!comp) return;
    const { x, y, z } = comp.position;
    targetRef.current.set(x + 1.5, y + 1.2, z + 1.5);
  }, [selectedId]);

  useFrame(() => {
    camera.position.lerp(targetRef.current, 0.03);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Grid + lighting
// ─────────────────────────────────────────────────────────────────────────────
function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 10, 6]} intensity={1.4} castShadow shadow-mapSize={[2048, 2048]} color="#ffffff" />
      <directionalLight position={[-5, 4, -4]} intensity={0.5} color="#4488FF" />
      <pointLight position={[0, 5, 0]} intensity={0.8} color="#8BE9FF" distance={12} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main AssemblyViewer export
// ─────────────────────────────────────────────────────────────────────────────
interface AssemblyViewerProps {
  showGrid?: boolean;
  wireframe?: boolean;
}

export function AssemblyViewer({ showGrid = true, wireframe = false }: AssemblyViewerProps) {
  const { explodedProgress, selectedComponentId, highlightedComponentId, showMeActive, stopShowMe, selectComponent } = useAssemblyStore();
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleClick = useCallback((id: string) => {
    selectComponent(selectedComponentId === id ? null : id);
  }, [selectComponent, selectedComponentId]);

  return (
    <Canvas
      shadows
      camera={{ position: [3.5, 2.5, 3.5], fov: 45 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent', width: '100%', height: '100%' }}
      onClick={(e) => {
        // Deselect if clicking empty space
        if ((e.target as HTMLElement).tagName === 'CANVAS') selectComponent(null);
      }}
    >
      <SceneLighting />

      {/* Grid */}
      {showGrid && (
        <gridHelper args={[12, 24, 'rgba(255,255,255,0.04)', 'rgba(255,255,255,0.04)']} position={[0, -0.55, 0]} />
      )}

      {/* All components */}
      {DRONE_COMPONENTS.map((comp) => (
        <ComponentMesh
          key={comp.id}
          comp={comp}
          explodedProgress={explodedProgress}
          isSelected={selectedComponentId === comp.id}
          isHighlighted={highlightedComponentId === comp.id}
          onClick={handleClick}
          onHover={setHoveredId}
        />
      ))}

      {/* Frame arms (decorative) */}
      <FrameArms explodedProgress={explodedProgress} />

      {/* Show Me animation */}
      <ShowMeAnimation active={showMeActive} onDone={stopShowMe} />

      {/* Camera fly-to */}
      <CameraController selectedId={selectedComponentId} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableDamping
        dampingFactor={0.05}
        minDistance={1.5}
        maxDistance={12}
      />
    </Canvas>
  );
}
