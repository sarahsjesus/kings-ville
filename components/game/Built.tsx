'use client';
import * as THREE from 'three';
import { useGameStore } from '@/store/gameStore';
import { heightAt } from '@/lib/terrain';
import { BRIDGE_SLOTS, CASTLE, FARM_SLOTS, GATE_ANGLE, HOUSE_SLOTS, QUARRY_SLOTS, SAWMILL_SLOTS, TOWER_SLOTS, WALL_R, WALL_SLOTS, WINDMILL_SLOTS } from '@/lib/layout';
import { VILLAGE } from '@/lib/terrain';
import { Cottage, Field } from './Village';

const STONE = '#8b8b86', STONE_D = '#6f6f6a', TILE = '#b5502c', WOOD = '#7a4e2b';
const tangent = (a: number) => -(a + Math.PI / 2); // gira uma caixa para ficar tangente ao anel

function Wall({ x, z, a }: { x: number; z: number; a: number }) {
  const y = heightAt(x, z);
  return (
    <group position={[x, y, z]} rotation={[0, tangent(a), 0]}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.05, 2.6, 0.8]} />
        <meshStandardMaterial color={STONE} flatShading />
      </mesh>
      {[-1, 0, 1].map((i) => (
        <mesh key={i} position={[i, 1.6, 0]} castShadow>
          <boxGeometry args={[0.5, 0.4, 0.9]} />
          <meshStandardMaterial color={STONE_D} />
        </mesh>
      ))}
    </group>
  );
}

function Tower({ x, z, h = 4.2, r = 1.1 }: { x: number; z: number; h?: number; r?: number }) {
  const y = heightAt(x, z);
  return (
    <group position={[x, y, z]}>
      <mesh position={[0, h / 2 - 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 1.1, h, 10]} />
        <meshStandardMaterial color={STONE} flatShading />
      </mesh>
      <mesh position={[0, h - 1.2 + 0.7, 0]} castShadow>
        <coneGeometry args={[r * 1.3, 1.4, 10]} />
        <meshStandardMaterial color={TILE} flatShading />
      </mesh>
    </group>
  );
}

function Bridge({ x, z, rot }: { x: number; z: number; rot: number }) {
  return (
    <group position={[x, 0.45, z]} rotation={[0, rot, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[14, 0.35, 2.6]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      {[-1.25, 1.25].map((rz) => (
        <mesh key={rz} position={[0, 0.45, rz]} castShadow>
          <boxGeometry args={[14, 0.5, 0.2]} />
          <meshStandardMaterial color={STONE_D} />
        </mesh>
      ))}
      {[-4.6, 4.6].map((px) => (
        <mesh key={px} position={[px, -1.1, 0]} castShadow>
          <boxGeometry args={[1, 2.4, 2.6]} />
          <meshStandardMaterial color={STONE_D} />
        </mesh>
      ))}
    </group>
  );
}

function Gatehouse() {
  const a1 = GATE_ANGLE - 0.25, a2 = GATE_ANGLE + 0.25;
  const p = (a: number) => ({ x: VILLAGE.x + Math.cos(a) * WALL_R, z: VILLAGE.z + Math.sin(a) * WALL_R });
  const g = { x: VILLAGE.x + Math.cos(GATE_ANGLE) * WALL_R, z: VILLAGE.z + Math.sin(GATE_ANGLE) * WALL_R };
  const t1 = p(a1), t2 = p(a2);
  return (
    <group>
      <Tower x={t1.x} z={t1.z} h={5.4} r={1.2} />
      <Tower x={t2.x} z={t2.z} h={5.4} r={1.2} />
      <mesh position={[g.x, heightAt(g.x, g.z) + 3.4, g.z]} rotation={[0, tangent(GATE_ANGLE), 0]} castShadow>
        <boxGeometry args={[5.2, 0.9, 1]} />
        <meshStandardMaterial color={STONE_D} />
      </mesh>
    </group>
  );
}

function Castle({ level }: { level: number }) {
  const { x, z } = CASTLE;
  const y = heightAt(x, z);
  const scale = 1 + (level - 2) * 0.08;
  const corners: [number, number][] = [[-6.5, -6.5], [6.5, -6.5], [-6.5, 6.5], [6.5, 6.5]];
  return (
    <group position={[x, y, z]} scale={scale}>
      <mesh position={[0, -0.6, 0]} receiveShadow castShadow>
        <boxGeometry args={[15, 2.4, 15]} />
        <meshStandardMaterial color={STONE_D} flatShading />
      </mesh>
      {[[0, -6.5, 13, 0.9], [0, 6.5, 13, 0.9]].map(([px, pz, w, d], i) => (
        <mesh key={`h${i}`} position={[px, 1.9, pz]} castShadow>
          <boxGeometry args={[w, 3, d]} />
          <meshStandardMaterial color={STONE} flatShading />
        </mesh>
      ))}
      {[-6.5, 6.5].map((px) => (
        <mesh key={px} position={[px, 1.9, 0]} castShadow>
          <boxGeometry args={[0.9, 3, 13]} />
          <meshStandardMaterial color={STONE} flatShading />
        </mesh>
      ))}
      {corners.map(([cx, cz], i) => (
        <group key={i} position={[cx, 0, cz]}>
          <mesh position={[0, 2.8, 0]} castShadow>
            <cylinderGeometry args={[1.5, 1.7, 5.6, 10]} />
            <meshStandardMaterial color={STONE} flatShading />
          </mesh>
          <mesh position={[0, 6.4, 0]} castShadow>
            <coneGeometry args={[1.9, 2, 10]} />
            <meshStandardMaterial color={TILE} flatShading />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 4, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 6, 5]} />
        <meshStandardMaterial color={STONE} flatShading />
      </mesh>
      <mesh position={[0, 8.3, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[4.2, 2.6, 4]} />
        <meshStandardMaterial color={TILE} flatShading />
      </mesh>
      <mesh position={[0, 1.1, 6.55]}>
        <boxGeometry args={[1.8, 2.2, 0.2]} />
        <meshStandardMaterial color={WOOD} />
      </mesh>
    </group>
  );
}

function Windmill({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, heightAt(x, z), z]}>
      <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.72, 0.95, 1.6, 8]} />
        <meshStandardMaterial color="#d9c49a" />
      </mesh>
      <mesh position={[0, 1.75, 0]} castShadow>
        <coneGeometry args={[0.9, 0.55, 8]} />
        <meshStandardMaterial color={TILE} />
      </mesh>
      <group position={[0, 1.75, 0.78]}>
        {[0, 1, 2, 3].map((blade) => (
          <mesh key={blade} position={[0, 0.75, 0]} rotation={[0, 0, (blade * Math.PI) / 2]} castShadow>
            <boxGeometry args={[0.18, 1.45, 0.1]} />
            <meshStandardMaterial color={WOOD} />
          </mesh>
        ))}
        <mesh castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      </group>
    </group>
  );
}

function Sawmill({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, heightAt(x, z), z]}>
      <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 1.8]} />
        <meshStandardMaterial color="#9b7042" />
      </mesh>
      <mesh position={[0, 1.55, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.65, 0.9, 4]} />
        <meshStandardMaterial color={TILE} />
      </mesh>
      <mesh position={[1.18, 0.65, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.48, 0.48, 0.12, 12]} />
        <meshStandardMaterial color={STONE} />
      </mesh>
      {[-0.55, 0, 0.55].map((offset) => (
        <mesh key={offset} position={[0, 0.18, offset]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <cylinderGeometry args={[0.16, 0.16, 1.5, 8]} />
          <meshStandardMaterial color={WOOD} />
        </mesh>
      ))}
    </group>
  );
}

function Quarry({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, heightAt(x, z), z]}>
      <mesh position={[0, 0.12, 0]} receiveShadow>
        <cylinderGeometry args={[1.8, 2, 0.24, 8]} />
        <meshStandardMaterial color="#6f6f6a" />
      </mesh>
      {[
        [-0.7, 0.7, 0],
        [0.45, 0.55, 0.45],
        [0.7, 0.9, -0.5],
        [-0.25, 1.15, -0.5],
      ].map(([px, py, pz], i) => (
        <mesh key={i} position={[px, py, pz]} rotation={[0.2 * i, 0.4 * i, 0]} castShadow receiveShadow>
          <dodecahedronGeometry args={[0.65 + (i % 2) * 0.15, 0]} />
          <meshStandardMaterial color={i % 2 ? STONE : STONE_D} flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** Renderiza no mapa tudo o que o jogador comprou + a evolução visual do reino. */
export default function Built() {
  const owned = useGameStore((s) => s.owned);
  const level = useGameStore((s) => s.kingdomLevel);
  const count = (id: string, extra = 0, slots = 99) => Math.min(Math.max((owned[id] ?? 0) - extra, 0), slots);

  return (
    <group>
      {HOUSE_SLOTS.slice(0, count('house', 2, HOUSE_SLOTS.length)).map((s, i) => <Cottage key={`h${i}`} x={s.x} z={s.z} rot={s.rot} />)}
      {FARM_SLOTS.slice(0, count('farm', 0, FARM_SLOTS.length)).map(([x, z], i) => <Field key={`f${i}`} x={x} z={z} />)}
      {WINDMILL_SLOTS.slice(0, count('windmill', 0, WINDMILL_SLOTS.length)).map(([x, z], i) => <Windmill key={`m${i}`} x={x} z={z} />)}
      {SAWMILL_SLOTS.slice(0, count('sawmill', 0, SAWMILL_SLOTS.length)).map(([x, z], i) => <Sawmill key={`s${i}`} x={x} z={z} />)}
      {QUARRY_SLOTS.slice(0, count('quarry', 0, QUARRY_SLOTS.length)).map(([x, z], i) => <Quarry key={`q${i}`} x={x} z={z} />)}
      {WALL_SLOTS.slice(0, count('wall', 0, WALL_SLOTS.length)).map((s, i) => <Wall key={`w${i}`} {...s} />)}
      {TOWER_SLOTS.slice(0, count('tower', 0, TOWER_SLOTS.length)).map((s, i) => <Tower key={`t${i}`} x={s.x} z={s.z} />)}
      {BRIDGE_SLOTS.slice(0, count('bridge', 0, BRIDGE_SLOTS.length)).map((s, i) => <Bridge key={`b${i}`} {...s} />)}
      {level >= 1 && <Gatehouse />}
      {level >= 2 && <Castle level={level} />}
    </group>
  );
}
