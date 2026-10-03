'use client';
import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';

// ── Drone assembly geometry helpers ──────────────────────────────────────────

function Frame() {
  return (
    <group>
      {/* Central body plate */}
      <mesh position={[0, 0, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.6, 0.08, 1.2]} />
        <meshStandardMaterial color="#1a2535" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Arm cross - horizontal */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2.6, 0.06, 0.22]} />
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Arm cross - vertical */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[0.22, 0.06, 2.6]} />
        <meshStandardMaterial color="#111827" metalness={0.9} roughness={0.2} />
      </mesh>
      {/* Center accent ring */}
      <mesh position={[0, 0.05, 0]}>
        <torusGeometry args={[0.3, 0.025, 8, 32]} />
        <meshStandardMaterial color="#8BE9FF" emissive="#8BE9FF" emissiveIntensity={0.4} metalness={0.6} roughness={0.2} />
      </mesh>
    </group>
  );
}

function Motor({ position, isHighlighted = false }: { position: [number, number, number]; isHighlighted?: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((_, delta) => {
    if (meshRef.current && isHighlighted) {
      meshRef.current.rotation.y += delta * 3;
    }
  });
  return (
    <group position={position}>
      <mesh castShadow>
        <cylinderGeometry args={[0.12, 0.14, 0.18, 16]} />
        <meshStandardMaterial
          color={isHighlighted ? '#2A5C8A' : '#1e3048'}
          metalness={0.85}
          roughness={0.2}
          emissive={isHighlighted ? '#0066CC' : '#001A33'}
          emissiveIntensity={isHighlighted ? 0.6 : 0.15}
        />
      </mesh>
      {/* Motor bell */}
      <mesh position={[0, 0.12, 0]} ref={meshRef} castShadow>
        <cylinderGeometry args={[0.13, 0.1, 0.1, 16]} />
        <meshStandardMaterial color="#2A3C55" metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Shaft */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.12, 8]} />
        <meshStandardMaterial color="#9CA3AF" metalness={1} roughness={0.1} />
      </mesh>
      {isHighlighted && (
        <pointLight color="#0088FF" intensity={1.5} distance={1.5} />
      )}
    </group>
  );
}

function Propeller({ position, spin = false }: { position: [number, number, number]; spin?: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (spin ? 12 : 1.5);
    }
  });
  return (
    <group position={position} ref={groupRef}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI * 2) / 3, 0]} castShadow>
          <boxGeometry args={[0.55, 0.012, 0.06]} />
          <meshStandardMaterial
            color="#0d1b2a"
            metalness={0.3}
            roughness={0.7}
            transparent
            opacity={spin ? 0.5 : 0.95}
          />
        </mesh>
      ))}
      {/* Hub */}
      <mesh>
        <cylinderGeometry args={[0.03, 0.03, 0.025, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Battery({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.8, 0.12, 0.3]} />
        <meshStandardMaterial color="#1a2e1a" metalness={0.4} roughness={0.6} />
      </mesh>
      {/* Connector */}
      <mesh position={[0.42, 0, 0]}>
        <boxGeometry args={[0.06, 0.08, 0.12]} />
        <meshStandardMaterial color="#FFD700" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Status LED strip */}
      <mesh position={[0, 0.065, 0]}>
        <boxGeometry args={[0.6, 0.01, 0.04]} />
        <meshStandardMaterial color="#7DFFB2" emissive="#7DFFB2" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}

function PCB({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 0.025, 0.5]} />
        <meshStandardMaterial color="#0a2208" metalness={0.3} roughness={0.8} />
      </mesh>
      {/* Component bumps */}
      {[[-0.1, 0, -0.1], [0.1, 0, 0.1], [-0.15, 0, 0.1], [0.12, 0, -0.15]].map(([x, y, z], i) => (
        <mesh key={i} position={[x, y + 0.02, z]}>
          <boxGeometry args={[0.05, 0.018, 0.04]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1F4E2E' : '#2D1A0E'} />
        </mesh>
      ))}
      {/* Glow accent */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.52, 0.005, 0.52]} />
        <meshStandardMaterial color="#44FF88" emissive="#44FF88" emissiveIntensity={0.3} transparent opacity={0.4} />
      </mesh>
    </group>
  );
}

function LandingGear() {
  const positions: [number, number, number, number, number][] = [
    [-0.5, -0.2, -0.4, 0.5, -0.15],
    [0.5, -0.2, -0.4, -0.5, -0.15],
    [-0.5, -0.2, 0.4, 0.5, -0.15],
    [0.5, -0.2, 0.4, -0.5, -0.15],
  ];
  return (
    <group>
      {/* Struts */}
      {[
        [-0.5, -0.22, -0.4] as [number,number,number],
        [0.5, -0.22, -0.4] as [number,number,number],
        [-0.5, -0.22, 0.4] as [number,number,number],
        [0.5, -0.22, 0.4] as [number,number,number],
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0.15, 0, 0.15 * (i % 2 === 0 ? -1 : 1)]}>
          <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
          <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.4} />
        </mesh>
      ))}
      {/* Feet */}
      {[
        [-0.5, -0.34, -0.4] as [number,number,number],
        [0.5, -0.34, -0.4] as [number,number,number],
        [-0.5, -0.34, 0.4] as [number,number,number],
        [0.5, -0.34, 0.4] as [number,number,number],
      ].map((pos, i) => (
        <mesh key={i} position={pos}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshStandardMaterial color="#374151" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// Guide line between two points
function GuideLine({ from, to, color = '#8BE9FF' }: { from: [number,number,number]; to: [number,number,number]; color?: string }) {
  const points = [new THREE.Vector3(...from), new THREE.Vector3(...to)];
  const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
  return (
    <primitive object={new THREE.Line(lineGeo, new THREE.LineBasicMaterial({ color, opacity: 0.3, transparent: true }))} />
  );
}

// Floating label HTML overlay
function ComponentLabel({ position, text, active }: { position: [number,number,number]; text: string; active: boolean }) {
  if (!active) return null;
  return (
    <Html position={position} center distanceFactor={8}>
      <div
        style={{
          background: 'rgba(5,6,7,0.85)',
          border: '1px solid rgba(139,233,255,0.4)',
          borderRadius: 6,
          padding: '3px 8px',
          fontSize: 10,
          fontFamily: 'monospace',
          color: '#8BE9FF',
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
        }}
      >
        {text}
      </div>
    </Html>
  );
}

// Slow scene rotation
function SceneRotator({ children }: { children: React.ReactNode }) {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18;
    }
  });
  return <group ref={groupRef}>{children}</group>;
}

function DroneModel({ showLabels }: { showLabels: boolean }) {
  const motorPositions: [number,number,number][] = [
    [-1.1, 0.12, -1.1],
    [1.1, 0.12, -1.1],
    [-1.1, 0.12, 1.1],
    [1.1, 0.12, 1.1],
  ];
  const propPositions: [number,number,number][] = [
    [-1.1, 0.32, -1.1],
    [1.1, 0.32, -1.1],
    [-1.1, 0.32, 1.1],
    [1.1, 0.32, 1.1],
  ];

  return (
    <group>
      <Frame />
      {motorPositions.map((pos, i) => (
        <Motor key={i} position={pos} />
      ))}
      {propPositions.map((pos, i) => (
        <Propeller key={i} position={pos} spin />
      ))}
      <Battery position={[0, -0.14, 0]} />
      <PCB position={[0, 0.16, 0]} />
      <LandingGear />

      {/* Guide lines */}
      <GuideLine from={[-1.1, 0.12, -1.1]} to={[0, 0.04, 0]} />
      <GuideLine from={[1.1, 0.12, -1.1]} to={[0, 0.04, 0]} />
      <GuideLine from={[-1.1, 0.12, 1.1]} to={[0, 0.04, 0]} />
      <GuideLine from={[1.1, 0.12, 1.1]} to={[0, 0.04, 0]} />

      {/* Labels */}
      <ComponentLabel position={[0, 0.6, 0]} text="FLIGHT CONTROLLER" active={showLabels} />
      <ComponentLabel position={[-1.3, 0.5, -1.3]} text="MOTOR FL" active={showLabels} />
      <ComponentLabel position={[1.3, 0.5, -1.3]} text="MOTOR FR" active={showLabels} />
      <ComponentLabel position={[-1.3, 0.5, 1.3]} text="MOTOR RL" active={showLabels} />
      <ComponentLabel position={[1.3, 0.5, 1.3]} text="MOTOR RR" active={showLabels} />
      <ComponentLabel position={[0, -0.5, 0]} text="4S LIPO BATTERY" active={showLabels} />
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#4488FF" />
      <pointLight position={[0, 4, 0]} intensity={0.6} color="#8BE9FF" distance={10} />
      <pointLight position={[0, -2, 0]} intensity={0.3} color="#004488" distance={6} />
    </>
  );
}

export function HeroScene() {
  const [showLabels, setShowLabels] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowLabels(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [3.5, 2.5, 3.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ background: 'transparent' }}
    >
      <SceneLighting />
      <SceneRotator>
        <DroneModel showLabels={showLabels} />
      </SceneRotator>
      {/* Grid */}
      <gridHelper args={[8, 20, 'rgba(255,255,255,0.03)', 'rgba(255,255,255,0.03)']} position={[0, -0.5, 0]} />
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={2}
        maxDistance={8}
        autoRotate={false}
        enableDamping
        dampingFactor={0.05}
      />
    </Canvas>
  );
}
