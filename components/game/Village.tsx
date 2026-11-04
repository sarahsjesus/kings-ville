'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VILLAGE, heightAt } from '@/lib/terrain';
import { getDayFactor } from '@/lib/dayNight';
import { GATE_ANGLE, WALL_R } from '@/lib/layout';
import { useGameStore } from '@/store/gameStore';

const WOOD = '#7a4e2b', PLASTER = '#d9c49a', THATCH = '#c9a44a', TILE = '#7b3a22', STONE = '#8b8b86';
const LAMP_INTENSITY = 45;
const LAMP_DISTANCE = 24;

function Window({ x, y, z, scale = 1 }: { x: number; y: number; z: number; scale?: number }) {
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh position={[0, 0, -0.035]}>
        <boxGeometry args={[0.58, 0.72, 0.12]} />
        <meshStandardMaterial color={WOOD} roughness={0.88} />
      </mesh>
      <mesh position={[0, 0, 0.035]}>
        <boxGeometry args={[0.42, 0.54, 0.035]} />
        <meshStandardMaterial color="#d5a65b" emissive="#a75b22" emissiveIntensity={0.16} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.055, 0.54, 0.035]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.06]}>
        <boxGeometry args={[0.42, 0.055, 0.035]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Flag({ position }: { position: [number, number, number] }) {
  const cloth = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (cloth.current) cloth.current.rotation.y = Math.sin(clock.elapsedTime * 3) * 0.28;
  });
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 6]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <group ref={cloth} position={[0, 1.15, 0]}>
        <mesh position={[0.35, 0, 0]}>
          <planeGeometry args={[0.7, 0.4]} />
          <meshStandardMaterial color="#b3261e" side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
}

function StreetLamp({ x, z }: { x: number; z: number }) {
  const light = useRef<THREE.PointLight>(null);
  const glow = useRef<THREE.MeshStandardMaterial>(null);

  useFrame(({ clock }) => {
    const nightFactor = 1 - getDayFactor(clock.elapsedTime);
    if (light.current) light.current.intensity = LAMP_INTENSITY * nightFactor;
    if (glow.current) glow.current.emissiveIntensity = 0.05 + 2.2 * nightFactor;
  });

  return (
    <group position={[x, heightAt(x, z), z]}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.2, 0.24, 0.2, 8]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.12, 3.3, 8]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
      <mesh position={[0, 3.5, 0]} castShadow>
        <boxGeometry args={[0.46, 0.08, 0.46]} />
        <meshStandardMaterial color="#49351f" />
      </mesh>
      <mesh position={[0, 3.77, 0]}>
        <boxGeometry args={[0.34, 0.48, 0.34]} />
        <meshStandardMaterial
          ref={glow}
          color="#ffc86b"
          emissive="#ffad3d"
          emissiveIntensity={0.05}
          transparent
          opacity={0.78}
        />
      </mesh>
      <mesh position={[0, 4.04, 0]} castShadow>
        <coneGeometry args={[0.32, 0.2, 4]} />
        <meshStandardMaterial color="#49351f" />
      </mesh>
      <mesh position={[0, 4.2, 0]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#49351f" />
      </mesh>
      <pointLight ref={light} position={[0, 3.75, 0]} color="#ffbd62" intensity={0} distance={LAMP_DISTANCE} decay={2} />
    </group>
  );
}

function StreetLamps() {
  const lamps = Array.from({ length: 8 }, (_, i) => {
    const angle = GATE_ANGLE + Math.PI / 8 + (i * Math.PI) / 4;
    const radius = WALL_R + 1.5;
    return {
      x: VILLAGE.x + Math.cos(angle) * radius,
      z: VILLAGE.z + Math.sin(angle) * radius,
    };
  });

  return (
    <>
      {lamps.map((lamp, i) => <StreetLamp key={i} {...lamp} />)}
    </>
  );
}

export function Cottage({ x, z, rot = 0 }: { x: number; z: number; rot?: number }) {
  return (
    <group position={[x, heightAt(x, z), z]} rotation={[0, rot, 0]}>
      <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.35, 0.25, 1.95]} />
        <meshStandardMaterial color={STONE} roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 1.8]} />
        <meshStandardMaterial color={PLASTER} roughness={0.96} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.96, 0.95, 0.94]} castShadow>
          <boxGeometry args={[0.12, 1.45, 0.1]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      ))}
      <group position={[0, 1.65, 0]} scale={[1.08, 1, 0.88]}>
        <mesh position={[0, 0.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[1.65, 1.1, 4]} />
          <meshStandardMaterial color={THATCH} flatShading roughness={1} />
        </mesh>
      </group>
      <mesh position={[0, 0.75, 0.91]}>
        <boxGeometry args={[0.5, 1, 0.06]} />
        <meshStandardMaterial color={WOOD} roughness={0.88} />
      </mesh>
      <Window x={-0.65} y={1.05} z={0.96} scale={0.72} />
      <Window x={0.65} y={1.05} z={0.96} scale={0.72} />
      <mesh position={[0.72, 2.18, -0.38]} castShadow receiveShadow>
        <boxGeometry args={[0.34, 1, 0.34]} />
        <meshStandardMaterial color={STONE} roughness={0.96} />
      </mesh>
      <mesh position={[0.72, 2.76, -0.38]} castShadow>
        <boxGeometry args={[0.46, 0.16, 0.46]} />
        <meshStandardMaterial color={STONE} roughness={0.96} />
      </mesh>
    </group>
  );
}

function RoyalHall({ x, z }: { x: number; z: number }) {
  const openShop = useGameStore((s) => s.openShop);
  return (
    <group
      position={[x, heightAt(x, z), z]}
      onClick={(e) => { e.stopPropagation(); openShop(true); }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.6, 1, 3.6]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 1.5, 3.2]} />
        <meshStandardMaterial color={PLASTER} roughness={0.94} />
      </mesh>
      {[-0.75, 0.75].map((x) => (
        <Window key={`window-${x}`} x={x} y={1.82} z={1.64} scale={0.85} />
      ))}
      {[-1.4, 0, 1.4].map((bx) => (
        <mesh key={bx} position={[bx, 1.75, 1.62]}>
          <boxGeometry args={[0.16, 1.5, 0.06]} />
          <meshStandardMaterial color={WOOD} roughness={0.88} />
        </mesh>
      ))}
      <group position={[0, 2.5, 0]} scale={[1.1, 1, 0.85]}>
        <mesh position={[0, 0.9, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.4, 1.8, 4]} />
          <meshStandardMaterial color={TILE} flatShading roughness={0.88} />
        </mesh>
      </group>
      <mesh position={[0, 0.6, 1.81]}>
        <boxGeometry args={[0.95, 1.2, 0.06]} />
        <meshStandardMaterial color="#4a2d17" roughness={0.9} />
      </mesh>
      <mesh position={[-1.9, 1.7, -1.1]} castShadow>
        <cylinderGeometry args={[0.8, 0.9, 3.4, 10]} />
        <meshStandardMaterial color={STONE} roughness={0.92} />
      </mesh>
      <mesh position={[-1.9, 4.1, -1.1]} castShadow>
        <coneGeometry args={[1.05, 1.4, 10]} />
        <meshStandardMaterial color={TILE} flatShading roughness={0.88} />
      </mesh>
      <Flag position={[-1.9, 4.6, -1.1]} />
    </group>
  );
}

export function Field({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, heightAt(x, z) + 0.04, z]}>
      <mesh receiveShadow>
        <boxGeometry args={[5, 0.08, 3]} />
        <meshStandardMaterial color="#806335" roughness={1} />
      </mesh>
      {[-1.8, -1, -0.2, 0.6, 1.4, 2].map((rx) => (
        <mesh key={rx} position={[rx * 0.9 - 0.2, 0.08, 0]}>
          <boxGeometry args={[0.12, 0.16, 2.6]} />
          <meshStandardMaterial color={rx % 2 ? '#a58b3e' : '#c4a84e'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

/** "Starting Village": sede real rústica + 2 casas simples + campo. */
export default function Village() {
  return (
    <group>
      <RoyalHall x={VILLAGE.x} z={VILLAGE.z} />
      <Cottage x={-15.5} z={-1.5} rot={0.45} />
      <Cottage x={-5.8} z={6.2} rot={-0.55} />
      <Field x={-14.5} z={7.5} />
      <StreetLamps />
    </group>
  );
}
