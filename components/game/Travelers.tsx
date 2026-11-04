'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { ENTRANCE, GATE_ANGLE, WAIT_SPOT } from '@/lib/layout';
import { VILLAGE, heightAt } from '@/lib/terrain';
import type { Traveler } from '@/lib/types';

const CLOAK = { farmer: '#5f8a3a', miner: '#6b6f78', builder: '#9a6a3a' };

function Wanderer({ t, index }: { t: Traveler; index: number }) {
  const g = useRef<THREE.Group>(null);
  const mark = useRef<THREE.Mesh>(null);
  const pos = useRef(new THREE.Vector3(ENTRANCE[0], 0, ENTRANCE[1]));
  const openTraveler = useGameStore((s) => s.openTraveler);
  const lateral = (index - 1) * 1.8;

  useFrame((st, dt) => {
    if (!g.current || !mark.current) return;
    const tx = WAIT_SPOT.x - Math.sin(GATE_ANGLE) * lateral;
    const tz = WAIT_SPOT.z + Math.cos(GATE_ANGLE) * lateral;
    const dx = tx - pos.current.x;
    const dz = tz - pos.current.z;
    const d = Math.hypot(dx, dz);
    const walking = d > 0.15;
    if (walking) {
      const step = Math.min(d, 3 * dt);
      pos.current.x += (dx / d) * step;
      pos.current.z += (dz / d) * step;
      g.current.rotation.y = Math.atan2(dx, dz);
    } else {
      g.current.rotation.y = Math.atan2(VILLAGE.x - pos.current.x, VILLAGE.z - pos.current.z);
    }
    const bob = walking ? Math.abs(Math.sin(st.clock.elapsedTime * 9)) * 0.12 : 0;
    g.current.position.set(pos.current.x, heightAt(pos.current.x, pos.current.z) + bob, pos.current.z);
    mark.current.position.y = 2.6 + Math.sin(st.clock.elapsedTime * 3) * 0.15;
    mark.current.rotation.y += dt * 2;
  });

  return (
    <group
      ref={g}
      position={[ENTRANCE[0], 0, ENTRANCE[1]]}
      onClick={(e) => { e.stopPropagation(); openTraveler(t.id); }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh position={[0, 0.65, 0]} castShadow>
        <coneGeometry args={[0.42, 1.3, 8]} />
        <meshStandardMaterial color={CLOAK[t.preferred]} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#e2b48a" />
      </mesh>
      <mesh position={[0, 1.78, 0]} castShadow>
        <coneGeometry args={[0.3, 0.3, 8]} />
        <meshStandardMaterial color="#5a3b22" />
      </mesh>
      <mesh ref={mark}>
        <octahedronGeometry args={[0.22]} />
        <meshStandardMaterial color="#f2c24a" emissive="#c98a10" emissiveIntensity={0.8} />
      </mesh>
      {/* área de clique generosa */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 2.6, 8]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
}

export default function Travelers() {
  const travelers = useGameStore((s) => s.travelers);
  return (
    <group>
      {travelers.map((t, i) => (
        <Wanderer key={t.id} t={t} index={i} />
      ))}
    </group>
  );
}
