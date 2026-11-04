'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ARMY_UNLOCK_LEVEL, MAX_SOLDIERS } from '@/lib/army';
import { TRAINING_GROUND } from '@/lib/layout';
import { heightAt } from '@/lib/terrain';
import { useGameStore } from '@/store/gameStore';

const WOOD = '#704629';
const STONE = '#827d70';
const CLOTH = '#8f342b';

function TrainingSoldier({ index, level }: { index: number; level: number }) {
  const swordArm = useRef<THREE.Group>(null);
  const phase = index * 0.72;
  const x = ((index % 6) - 2.5) * 1.15;
  const z = Math.floor(index / 6) * 1.25 - 2.5;
  const armor = level >= 3 ? '#777d80' : level >= 1 ? '#8b6343' : '#80613d';

  useFrame(({ clock }) => {
    if (swordArm.current) swordArm.current.rotation.z = -0.65 + Math.sin(clock.elapsedTime * 2.8 + phase) * 0.48;
  });

  return (
    <group position={[TRAINING_GROUND.x + x, heightAt(TRAINING_GROUND.x + x, TRAINING_GROUND.z + z) + 0.08, TRAINING_GROUND.z + z]}>
      <mesh position={[0, 0.14, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.22, 0.38]} />
        <meshStandardMaterial color={STONE} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.83, 0]} castShadow>
        <boxGeometry args={[0.52, 0.72, 0.34]} />
        <meshStandardMaterial color={armor} roughness={0.82} metalness={level >= 3 ? 0.28 : 0.05} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.22, 12, 10]} />
        <meshStandardMaterial color="#c7956d" roughness={0.86} />
      </mesh>
      <mesh position={[0, 1.57, 0]} castShadow>
        <sphereGeometry args={[0.25, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={level >= 2 ? '#777d80' : WOOD} roughness={0.72} metalness={level >= 2 ? 0.3 : 0.05} />
      </mesh>
      <group ref={swordArm} position={[0.32, 1.08, 0]}>
        <mesh position={[0.12, -0.17, 0]} rotation={[0, 0, -0.4]} castShadow>
          <boxGeometry args={[0.16, 0.42, 0.16]} />
          <meshStandardMaterial color="#bd956c" roughness={0.9} />
        </mesh>
        <mesh position={[0.28, 0.12, 0]} rotation={[0, 0, -0.48]} castShadow>
          <boxGeometry args={[0.09, 0.62, 0.045]} />
          <meshStandardMaterial color="#c4c6c3" roughness={0.3} metalness={0.68} />
        </mesh>
        <mesh position={[0.29, -0.17, 0]} rotation={[0, 0, -0.48]}>
          <boxGeometry args={[0.28, 0.08, 0.08]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      </group>
      <mesh position={[-0.34, 0.88, 0.08]} rotation={[Math.PI / 2, 0.12, -0.12]} castShadow>
        <cylinderGeometry args={[0.24, 0.28, 0.12, 8]} />
        <meshStandardMaterial color={index % 2 ? '#8f342b' : '#a58a55'} roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.33, 0.08]} castShadow>
        <boxGeometry args={[0.18, 0.46, 0.2]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
    </group>
  );
}

function TrainingDummy({ x, z }: { x: number; z: number }) {
  const worldX = TRAINING_GROUND.x + x;
  const worldZ = TRAINING_GROUND.z + z;
  return (
    <group position={[worldX, heightAt(worldX, worldZ), worldZ]}>
      <mesh position={[0, 0.55, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.14, 1.1, 8]} />
        <meshStandardMaterial color={WOOD} roughness={0.96} />
      </mesh>
      <mesh position={[0, 1.12, 0]} castShadow>
        <sphereGeometry args={[0.24, 10, 8]} />
        <meshStandardMaterial color="#b79569" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.86, 0]} castShadow>
        <boxGeometry args={[0.75, 0.12, 0.12]} />
        <meshStandardMaterial color={WOOD} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.15, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.8, 0.2, 0.65]} />
        <meshStandardMaterial color={STONE} roughness={0.96} />
      </mesh>
    </group>
  );
}

function TrainingYard() {
  const x = TRAINING_GROUND.x;
  const z = TRAINING_GROUND.z;
  const y = heightAt(x, z);
  const posts = [
    [-7, -5], [-2.4, -5], [2.4, -5], [7, -5],
    [-7, 5], [-2.4, 5], [2.4, 5], [7, 5],
    [-7, 0], [7, 0],
  ];

  return (
    <group>
      <mesh position={[x, y + 0.025, z]} receiveShadow>
        <boxGeometry args={[15, 0.08, 11]} />
        <meshStandardMaterial color="#83734e" roughness={1} />
      </mesh>
      {posts.map(([px, pz], i) => (
        <group key={i} position={[x + px, heightAt(x + px, z + pz), z + pz]}>
          <mesh position={[0, 0.65, 0]} castShadow>
            <boxGeometry args={[0.18, 1.3, 0.18]} />
            <meshStandardMaterial color={WOOD} roughness={0.94} />
          </mesh>
        </group>
      ))}
      {[-4.7, 0, 4.7].flatMap((offset) => [-5, 5].map((side) => (
        <group key={`fence-x-${offset}-${side}`} position={[x + offset, heightAt(x + offset, z + side), z + side]}>
          {[0.42, 0.94].map((rail) => (
            <mesh key={rail} position={[0, rail, 0]} castShadow>
              <boxGeometry args={[4.6, 0.12, 0.12]} />
              <meshStandardMaterial color={WOOD} roughness={0.94} />
            </mesh>
          ))}
        </group>
      )))}
      {[-2.5, 2.5].flatMap((offset) => [-7, 7].map((side) => (
        <group key={`fence-z-${offset}-${side}`} position={[x + side, heightAt(x + side, z + offset), z + offset]}>
          {[0.42, 0.94].map((rail) => (
            <mesh key={rail} position={[0, rail, 0]} castShadow>
              <boxGeometry args={[0.12, 0.12, 4.8]} />
              <meshStandardMaterial color={WOOD} roughness={0.94} />
            </mesh>
          ))}
        </group>
      )))}
      <group position={[x - 5.2, y, z - 7.3]}>
        <mesh position={[0, 1.35, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.2, 2.7, 2.6]} />
          <meshStandardMaterial color="#9d8058" roughness={0.96} />
        </mesh>
        <mesh position={[0, 2.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[3.1, 1.2, 4]} />
          <meshStandardMaterial color="#743c2e" flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.92, 1.34]}>
          <boxGeometry args={[0.9, 1.8, 0.08]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
        <mesh position={[0, 2.05, 1.4]}>
          <boxGeometry args={[0.8, 0.5, 0.08]} />
          <meshStandardMaterial color={CLOTH} roughness={0.85} />
        </mesh>
      </group>
      <TrainingDummy x={5.3} z={-3.1} />
      <TrainingDummy x={5.3} z={0} />
      <TrainingDummy x={5.3} z={3.1} />
    </group>
  );
}

export default function TrainingGround() {
  const level = useGameStore((state) => state.kingdomLevel);
  const soldiers = useGameStore((state) => state.soldiers);
  const armyLevel = useGameStore((state) => state.armyLevel);
  if (level < ARMY_UNLOCK_LEVEL) return null;

  return (
    <group>
      <TrainingYard />
      {Array.from({ length: Math.min(soldiers, MAX_SOLDIERS) }, (_, index) => (
        <TrainingSoldier key={index} index={index} level={armyLevel} />
      ))}
    </group>
  );
}
