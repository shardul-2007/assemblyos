'use client';
import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useSpatialStore } from '@/store/spatialStore';
import type { SpatialObject } from '@/types/spatial';
import { CATEGORY_META } from '@/data/demoSpace';

// ─── 3D Object Mesh inside Digital Twin ───────────────────────────────────────

function SpatialObjectMesh({
  object,
  isSemantic,
  isSelected,
  isHighlighted,
  onSelect,
}: {
  object: SpatialObject;
  isSemantic: boolean;
  isSelected: boolean;
  isHighlighted: boolean;
  onSelect: () => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  const dims = object.dimensions ?? { width: 1, height: 1, depth: 1 };
  const catMeta = CATEGORY_META[object.category] ?? CATEGORY_META.other;

  // Visual styling based on state
  const baseColor = useMemo(() => new THREE.Color(catMeta.color), [catMeta.color]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    if (!material) return;

    // Pulse highlight if selected or AI highlighted
    if (isSelected || isHighlighted) {
      const pulse = Math.sin(Date.now() * 0.005) * 0.3 + 0.7;
      material.emissive.copy(baseColor).multiplyScalar(pulse * 0.6);
    } else if (hovered) {
      material.emissive.copy(baseColor).multiplyScalar(0.3);
    } else {
      material.emissive.set(0x000000);
    }
  });

  return (
    <group position={[object.position.x, object.position.y, object.position.z]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect();
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
        }}
        onPointerOut={() => setHovered(false)}
      >
        <boxGeometry args={[dims.width, dims.height, dims.depth]} />
        <meshStandardMaterial
          color={baseColor}
          roughness={0.4}
          metalness={object.category === 'machine' || object.category === 'electrical' ? 0.7 : 0.2}
          transparent
          opacity={isSemantic ? 0.85 : 0.7}
          wireframe={false}
        />
      </mesh>

      {/* Selection bounding box wireframe */}
      {(isSelected || isHighlighted || hovered) && (
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(dims.width * 1.05, dims.height * 1.05, dims.depth * 1.05)]} />
          <lineBasicMaterial color={isSelected ? '#8BE9FF' : '#7DFFB2'} linewidth={2} />
        </lineSegments>
      )}

      {/* Semantic Twin floating label & marker */}
      {isSemantic && (
        <group position={[0, dims.height / 2 + 0.35, 0]}>
          {/* Spatial Node Marker */}
          <mesh>
            <sphereGeometry args={[0.08, 16, 16]} />
            <meshBasicMaterial color={isSelected ? '#8BE9FF' : catMeta.color} />
          </mesh>

          {/* Text billboard */}
          <Text
            position={[0, 0.25, 0]}
            fontSize={0.22}
            color="#F5F7FA"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.02}
            outlineColor="#050607"
          >
            {object.name}
          </Text>

          {/* Category subtitle */}
          <Text
            position={[0, 0.05, 0]}
            fontSize={0.12}
            color={catMeta.color}
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.015}
            outlineColor="#050607"
          >
            {`${catMeta.label.toUpperCase()} · ${Math.round(object.confidence * 100)}%`}
          </Text>
        </group>
      )}
    </group>
  );
}

// ─── Room Bounds and Floor Mesh (Photo Café Lounge) ──────────────────────────

function RoomEnvironment() {
  // Dimensions 12.4m x 3.2m x 8.6m
  return (
    <group>
      {/* Floor with subtle grid */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#0a0e14" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* Subtle Room Perimeter Frame */}
      <lineSegments position={[0, 1.6, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(12.4, 3.2, 8.6)]} />
        <lineBasicMaterial color="rgba(255,255,255,0.06)" />
      </lineSegments>
    </group>
  );
}

// ─── Main SpatialViewer3D Component ───────────────────────────────────────────

export function SpatialViewer3D() {
  const { objects, scene, selectObject, openInspector } = useSpatialStore();
  const isSemantic = scene.mode === 'semantic' || scene.mode === 'inspection';

  return (
    <div className="relative w-full h-full bg-[#050607] select-none">
      <Canvas
        camera={{ position: [0, 8, 12], fov: 45 }}
        gl={{ antialias: true, alpha: false }}
        onPointerDown={(e) => {
          // If clicking empty canvas background, deselect
          if (e.target === e.currentTarget) {
            selectObject(null);
          }
        }}
      >
        <color attach="background" args={['#050607']} />

        {/* Lighting */}
        <ambientLight intensity={0.8} />
        <directionalLight position={[10, 20, 10]} intensity={1.2} />
        <pointLight position={[-10, 10, -10]} intensity={0.5} color="#8BE9FF" />

        {/* Room architecture */}
        <RoomEnvironment />

        {/* Grid floor */}
        {scene.showGrid && (
          <Grid
            position={[0, 0.01, 0]}
            args={[14, 10]}
            cellSize={0.5}
            cellThickness={0.6}
            cellColor="#1a2333"
            sectionSize={2.0}
            sectionThickness={1.2}
            sectionColor="#2d3d59"
            fadeDistance={25}
          />
        )}

        {/* Spatial Object Meshes */}
        {objects
          .filter((o) => !o.isHidden)
          .map((obj) => (
            <SpatialObjectMesh
              key={obj.id}
              object={obj}
              isSemantic={isSemantic}
              isSelected={scene.selectedObjectId === obj.id}
              isHighlighted={scene.highlightedObjectIds.includes(obj.id)}
              onSelect={() => {
                selectObject(obj.id);
                openInspector(obj.id);
              }}
            />
          ))}

        {/* Camera Controls */}
        <OrbitControls
          makeDefault
          enableDamping
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={2}
          maxDistance={30}
        />
      </Canvas>

      {/* Floating HUD status indicator */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080b0f]/80 border border-[rgba(255,255,255,0.06)] backdrop-blur">
          <span className="w-2 h-2 rounded-full bg-[#7DFFB2] animate-pulse" />
          <span className="font-mono text-[10px] text-[#F5F7FA] uppercase tracking-wider font-semibold">
            {isSemantic ? 'SEMANTIC DIGITAL TWIN' : 'SPATIAL 3D MODEL'}
          </span>
          <span className="font-mono text-[10px] text-[rgba(245,247,250,0.4)]">
            · {objects.length} ENTITIES
          </span>
        </div>
      </div>
    </div>
  );
}
