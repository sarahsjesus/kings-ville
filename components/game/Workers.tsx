'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Role } from '@/lib/types';
import { FARM_SLOTS, GATE, GATE_ANGLE, QUARRY_SLOTS } from '@/lib/layout';
import { VILLAGE, heightAt } from '@/lib/terrain';
import { useGameStore } from '@/store/gameStore';

const WORKER_LIMIT = 10;
const FARM_FIELDS: [number, number][] = [[-14.5, 7.5], ...FARM_SLOTS];
const BUILD_SITE = { x: VILLAGE.x + 8, z: VILLAGE.z - 10 };
const CLOTH: Record<Role, string> = {
  farmer: '#66833b',
  miner: '#626b73',
  builder: '#aa7138',
  warrior: '#8f342b',
};

function WorkTool({ role }: { role: Role }) {
  return (
    <group position={[0, -0.43, 0]}>
      <mesh rotation={[0, 0, role === 'farmer' ? -0.42 : 0.08]} castShadow>
        <boxGeometry args={[0.08, role === 'warrior' ? 1.12 : 0.82, 0.08]} />
        <meshStandardMaterial color="#704629" roughness={0.92} />
      </mesh>
      {role === 'farmer' && (
        <mesh position={[0.18, -0.38, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.34, 0.1, 0.12]} />
          <meshStandardMaterial color="#827d70" roughness={0.75} metalness={0.35} />
        </mesh>
      )}
      {role === 'miner' && (
        <mesh position={[0.02, -0.31, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.42, 0.13, 0.12]} />
          <meshStandardMaterial color="#8b8b86" roughness={0.65} metalness={0.45} />
        </mesh>
      )}
      {role === 'builder' && (
        <mesh position={[0.03, -0.35, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <boxGeometry args={[0.28, 0.2, 0.16]} />
          <meshStandardMaterial color="#8b5a31" roughness={0.92} />
        </mesh>
      )}
      {role === 'warrior' && (
        <mesh position={[0, -0.84, 0]} castShadow>
          <boxGeometry args={[0.12, 0.36, 0.16]} />
          <meshStandardMaterial color="#c4c6c3" roughness={0.3} metalness={0.68} />
        </mesh>
      )}
    </group>
  );
}

function Worker({ role, index, x, z }: { role: Role; index: number; x: number; z: number }) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const workingArm = useRef<THREE.Group>(null);
  const otherArm = useRef<THREE.Group>(null);
  const leftLeg = useRef<THREE.Group>(null);
  const rightLeg = useRef<THREE.Group>(null);
  const phase = index * 1.73 + (role === 'warrior' ? 1.4 : 0);

  useFrame(({ clock }) => {
    if (!root.current) return;
    const time = clock.elapsedTime;
    const motion = time * (role === 'warrior' ? 1.45 : 1.9) + phase;
    const patrol = role === 'warrior';
    const offsetX = patrol ? Math.cos(motion) * 1.35 : Math.sin(motion * 0.32) * 0.12;
    const offsetZ = patrol ? Math.sin(motion) * 1.35 : Math.cos(motion * 0.32) * 0.12;
    const worldX = x + offsetX;
    const worldZ = z + offsetZ;
    root.current.position.set(worldX, heightAt(worldX, worldZ), worldZ);
    root.current.rotation.y = patrol ? Math.atan2(-Math.sin(motion), Math.cos(motion)) : Math.sin(motion * 0.3) * 0.16;

    const swing = Math.sin(motion * 2.2);
    if (workingArm.current) {
      workingArm.current.rotation.x =
        role === 'miner' ? -0.9 + Math.max(0, swing) * 1.25 :
        role === 'builder' ? -0.7 + Math.max(0, swing) * 1.1 :
        role === 'warrior' ? -0.45 + swing * 0.5 :
        -0.4 + swing * 0.62;
    }
    if (otherArm.current) otherArm.current.rotation.x = 0.12 - swing * (patrol ? 0.32 : 0.12);
    if (body.current) {
      body.current.rotation.x =
        role === 'farmer' || role === 'miner' ? 0.1 + Math.max(0, swing) * 0.12 : Math.sin(motion * 2.2) * 0.035;
    }
    if (leftLeg.current) leftLeg.current.rotation.x = patrol ? swing * 0.38 : Math.sin(motion) * 0.08;
    if (rightLeg.current) rightLeg.current.rotation.x = patrol ? -swing * 0.38 : -Math.sin(motion) * 0.08;
  });

  return (
    <group ref={root} position={[x, heightAt(x, z), z]}>
      <group ref={body}>
        <mesh position={[0, 0.88, 0]} castShadow>
          <boxGeometry args={[0.46, 0.62, 0.34]} />
          <meshStandardMaterial color={CLOTH[role]} roughness={0.92} />
        </mesh>
        <mesh position={[0, 1.42, 0]} castShadow>
          <sphereGeometry args={[0.2, 10, 8]} />
          <meshStandardMaterial color="#d5aa83" roughness={0.88} />
        </mesh>
        {role === 'farmer' && (
          <mesh position={[0, 1.62, 0]} castShadow>
            <coneGeometry args={[0.3, 0.28, 8]} />
            <meshStandardMaterial color="#c9a44a" roughness={0.9} />
          </mesh>
        )}
        {role === 'miner' && (
          <mesh position={[0, 1.59, 0]} castShadow>
            <sphereGeometry args={[0.23, 10, 6]} />
            <meshStandardMaterial color="#4d5358" roughness={0.85} />
          </mesh>
        )}
        {role === 'builder' && (
          <mesh position={[0, 1.62, 0]} castShadow>
            <boxGeometry args={[0.48, 0.13, 0.4]} />
            <meshStandardMaterial color="#c79543" roughness={0.82} />
          </mesh>
        )}
        {role === 'warrior' && (
          <mesh position={[0, 1.6, 0]} castShadow>
            <sphereGeometry args={[0.25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#777d80" metalness={0.25} roughness={0.75} />
          </mesh>
        )}
        <group ref={workingArm} position={[0.29, 1.12, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.16, 0.46, 0.16]} />
            <meshStandardMaterial color="#d5aa83" roughness={0.9} />
          </mesh>
          <WorkTool role={role} />
        </group>
        <group ref={otherArm} position={[-0.29, 1.12, 0]}>
          <mesh position={[0, -0.2, 0]} castShadow>
            <boxGeometry args={[0.16, 0.46, 0.16]} />
            <meshStandardMaterial color="#d5aa83" roughness={0.9} />
          </mesh>
          {role === 'warrior' && (
            <mesh position={[-0.12, -0.48, 0]} rotation={[0, 0, 0.12]} castShadow>
              <cylinderGeometry args={[0.27, 0.3, 0.12, 8]} />
              <meshStandardMaterial color="#a58a55" roughness={0.82} />
            </mesh>
          )}
        </group>
      </group>
      <group ref={leftLeg} position={[-0.13, 0.45, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.17, 0.5, 0.2]} />
          <meshStandardMaterial color="#49351f" roughness={0.95} />
        </mesh>
      </group>
      <group ref={rightLeg} position={[0.13, 0.45, 0]}>
        <mesh position={[0, -0.2, 0]} castShadow>
          <boxGeometry args={[0.17, 0.5, 0.2]} />
          <meshStandardMaterial color="#49351f" roughness={0.95} />
        </mesh>
      </group>
    </group>
  );
}

function MinerRocks() {
  const [x, z] = QUARRY_SLOTS[0];
  return (
    <group position={[x, heightAt(x, z), z]}>
      {[
        [-1.25, 0.42, -0.35],
        [0.95, 0.35, 0.6],
        [0.35, 0.55, -0.7],
      ].map(([px, py, pz], index) => (
        <mesh key={index} position={[px, py, pz]} rotation={[0.15 * index, 0.6 * index, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.58 + (index % 2) * 0.12, 0]} />
          <meshStandardMaterial color={index % 2 ? '#827d70' : '#6f6f6a'} flatShading roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function BuilderScaffold() {
  const { x, z } = BUILD_SITE;
  return (
    <group position={[x, heightAt(x, z), z]}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * 1.1, 0, 0]}>
          <mesh position={[0, 0.95, 0]} castShadow>
            <boxGeometry args={[0.12, 1.9, 0.12]} />
            <meshStandardMaterial color="#704629" roughness={0.92} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[2.4, 0.12, 0.12]} />
        <meshStandardMaterial color="#8b5a31" roughness={0.92} />
      </mesh>
    </group>
  );
}

export default function Workers() {
  const population = useGameStore((state) => state.population);
  const owned = useGameStore((state) => state.owned);
  const farmers = population.farmers;
  const miners = population.miners;
  const builders = population.builders;
  const warriors = population.warriors;

  const farms = FARM_FIELDS.slice(0, 1 + (owned.farm ?? 0));
  const quarries = QUARRY_SLOTS.slice(0, Math.max(1, owned.quarry ?? 0));

  return (
    <group>
      {farmers > 0 && farms.map(([x, z], fieldIndex) => (
        Array.from({ length: Math.min(farmers, WORKER_LIMIT) }, (_, index) => {
          if (index % farms.length !== fieldIndex) return null;
          const localIndex = Math.floor(index / farms.length);
          const offsets = [[-1.6, -0.65], [-0.55, 0.65], [0.55, -0.65], [1.6, 0.65]];
          const [offsetX, offsetZ] = offsets[localIndex % offsets.length];
          return <Worker key={`farmer-${index}`} role="farmer" index={index} x={x + offsetX} z={z + offsetZ} />;
        })
      ))}

      {miners > 0 && (
        <>
          {(owned.quarry ?? 0) === 0 && <MinerRocks />}
          {Array.from({ length: Math.min(miners, WORKER_LIMIT) }, (_, index) => {
            const [x, z] = quarries[index % quarries.length];
            const angle = (index / Math.max(1, miners)) * Math.PI * 2;
            return <Worker key={`miner-${index}`} role="miner" index={index} x={x + Math.cos(angle) * 2.2} z={z + Math.sin(angle) * 1.7} />;
          })}
        </>
      )}

      {builders > 0 && (
        <>
          <BuilderScaffold />
          {Array.from({ length: Math.min(builders, WORKER_LIMIT) }, (_, index) => (
            <Worker
              key={`builder-${index}`}
              role="builder"
              index={index}
              x={BUILD_SITE.x + ((index % 4) - 1.5) * 0.95}
              z={BUILD_SITE.z + Math.floor(index / 4) * 0.9 + 1}
            />
          ))}
        </>
      )}

      {Array.from({ length: Math.min(warriors, WORKER_LIMIT) }, (_, index) => {
        const lateral = (index - (Math.min(warriors, WORKER_LIMIT) - 1) / 2) * 1.05;
        const x = GATE.x - Math.sin(GATE_ANGLE) * lateral;
        const z = GATE.z + Math.cos(GATE_ANGLE) * lateral;
        return <Worker key={`warrior-${index}`} role="warrior" index={index} x={x} z={z} />;
      })}
    </group>
  );
}
