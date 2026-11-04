'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { VILLAGE, heightAt } from '@/lib/terrain';
import { getDayFactor } from '@/lib/dayNight';
import { GATE_ANGLE, WALL_R } from '@/lib/layout';
import { POINTER_CURSOR, SELECT_CURSOR } from '@/lib/cursor';
import { useGameStore } from '@/store/gameStore';

const WOOD = '#55351f', PLASTER = '#d9c49a', THATCH = '#c9a44a', TILE = '#7b3a22', STONE = '#8b8b86';
const LAMP_INTENSITY = 22;
const LAMP_DISTANCE = 19;
const ROOFS = ['#8d3828', '#9d4b31', '#65402e', '#a16b3c'];
const GABLE = new THREE.Shape();
GABLE.moveTo(-1.1, 0);
GABLE.lineTo(0, 0.82);
GABLE.lineTo(1.1, 0);
GABLE.closePath();

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
    if (glow.current) glow.current.emissiveIntensity = 0.05 + 1.5 * nightFactor;
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

export function Cottage({ x, z, rot = 0, variant = 0 }: { x: number; z: number; rot?: number; variant?: number }) {
  const roof = ROOFS[variant % ROOFS.length];
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
      <mesh position={[0, 1.63, 0.92]}>
        <shapeGeometry args={[GABLE]} />
        <meshStandardMaterial color={PLASTER} roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 1.63, -0.92]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[GABLE]} />
        <meshStandardMaterial color={PLASTER} roughness={0.96} side={THREE.DoubleSide} />
      </mesh>
      <group position={[0, 2.18, 0]}>
        <mesh position={[0, -0.04, 0.58]} rotation={[0.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.85, 0.17, 1.48]} />
          <meshStandardMaterial color={roof} flatShading roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.04, -0.58]} rotation={[-0.5, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.85, 0.17, 1.48]} />
          <meshStandardMaterial color={roof} flatShading roughness={0.9} />
        </mesh>
        {[-1.2, 1.2].map((side) => (
          <mesh key={side} position={[0, -0.32, side]} castShadow>
            <boxGeometry args={[2.94, 0.15, 0.14]} />
            <meshStandardMaterial color={WOOD} roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 0.33, 0]} castShadow>
          <boxGeometry args={[2.95, 0.13, 0.16]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      </group>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.04, 0.98, 0.96]} castShadow>
          <boxGeometry args={[0.12, 1.5, 0.12]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      ))}
      {[0.34, 1.62].map((y) => (
        <mesh key={y} position={[0, y, 0.97]} castShadow>
          <boxGeometry args={[2.16, 0.12, 0.12]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      ))}
      {[-0.48, 0.48].map((side) => (
        <mesh key={side} position={[side, 0.98, 0.98]} rotation={[0, 0, side > 0 ? -0.68 : 0.68]} castShadow>
          <boxGeometry args={[0.11, 1.13, 0.12]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.72, 0.98]}>
        <boxGeometry args={[0.55, 1.02, 0.08]} />
        <meshStandardMaterial color={WOOD} roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.26, 1.03]} castShadow>
        <boxGeometry args={[0.7, 0.12, 0.18]} />
        <meshStandardMaterial color="#49351f" roughness={0.92} />
      </mesh>
      <mesh position={[0, 0.13, 1.1]} receiveShadow>
        <boxGeometry args={[0.82, 0.12, 0.48]} />
        <meshStandardMaterial color="#b4a58a" roughness={0.96} />
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
      onPointerOver={() => (document.body.style.cursor = POINTER_CURSOR)}
      onPointerOut={() => (document.body.style.cursor = SELECT_CURSOR)}
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
      <mesh position={[0, 2.5, 1.62]}>
        <shapeGeometry args={[GABLE]} />
        <meshStandardMaterial color={PLASTER} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.5, -1.62]} rotation={[0, Math.PI, 0]}>
        <shapeGeometry args={[GABLE]} />
        <meshStandardMaterial color={PLASTER} roughness={0.94} side={THREE.DoubleSide} />
      </mesh>
      <group>
        <mesh position={[0, 3.05, 0.82]} rotation={[0.55, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.2, 2.08]} />
          <meshStandardMaterial color={TILE} flatShading roughness={0.88} />
        </mesh>
        <mesh position={[0, 3.05, -0.82]} rotation={[-0.55, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.8, 0.2, 2.08]} />
          <meshStandardMaterial color={TILE} flatShading roughness={0.88} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} position={[0, 2.55, side * 1.72]} castShadow>
            <boxGeometry args={[4.9, 0.18, 0.18]} />
            <meshStandardMaterial color={WOOD} roughness={0.9} />
          </mesh>
        ))}
        <mesh position={[0, 3.42, 0]} castShadow>
          <boxGeometry args={[4.9, 0.14, 0.16]} />
          <meshStandardMaterial color={WOOD} roughness={0.9} />
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

function TownSquare() {
  const x = VILLAGE.x;
  const z = VILLAGE.z;
  const y = heightAt(x, z);
  const paving = ['#b8ae98', '#c4b99e', '#aba18e', '#cec2a6'];

  return (
    <group position={[x, y, z]}>
      <mesh position={[0, 0.08, 0]} receiveShadow>
        <boxGeometry args={[12, 0.16, 10]} />
        <meshStandardMaterial color="#796b55" roughness={1} />
      </mesh>
      {Array.from({ length: 8 }, (_, row) =>
        Array.from({ length: 7 }, (_, col) => (
          <mesh key={`${row}-${col}`} position={[(col - 3) * 1.58 + (row % 2) * 0.79, 0.19, (row - 3.5) * 1.15]} receiveShadow>
            <boxGeometry args={[1.48, 0.07, 1.04]} />
            <meshStandardMaterial color={paving[(row * 7 + col * 3) % paving.length]} roughness={0.96} />
          </mesh>
        )),
      )}
      <group position={[3.6, 0.25, 0.6]}>
        <mesh position={[0, 0.12, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.55, 1.75, 0.3, 10]} />
          <meshStandardMaterial color="#817b6e" roughness={0.92} flatShading />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[1.25, 1.35, 0.16, 10]} />
          <meshStandardMaterial color="#548f91" emissive="#235353" emissiveIntensity={0.12} roughness={0.24} metalness={0.18} />
        </mesh>
        <mesh position={[0, 0.67, 0]} castShadow>
          <cylinderGeometry args={[0.25, 0.42, 0.62, 8]} />
          <meshStandardMaterial color="#c0b49a" roughness={0.88} />
        </mesh>
        <mesh position={[0, 1.02, 0]} castShadow>
          <sphereGeometry args={[0.26, 10, 8]} />
          <meshStandardMaterial color="#d3c5a5" roughness={0.84} />
        </mesh>
        <mesh position={[0, 1.2, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial color="#a9e3dc" emissive="#64b7ae" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

function ScenicWindmill({ x, z }: { x: number; z: number }) {
  const sails = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (sails.current) sails.current.rotation.z = clock.elapsedTime * 0.22;
  });

  return (
    <group position={[x, heightAt(x, z), z]}>
      <mesh position={[0, 2.15, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.8, 1.25, 4.1, 4]} />
        <meshStandardMaterial color="#c6b28a" flatShading roughness={0.94} />
      </mesh>
      <mesh position={[0, 4.45, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[1.45, 1.1, 4]} />
        <meshStandardMaterial color="#71372a" flatShading roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.3, 0.82]}>
        <boxGeometry args={[0.48, 1.2, 0.08]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.6, 0.88]}>
        <boxGeometry args={[0.14, 3.2, 0.1]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <mesh position={[0.32, 2.6, 0.88]}>
        <boxGeometry args={[0.12, 3.2, 0.1]} />
        <meshStandardMaterial color={WOOD} roughness={0.9} />
      </mesh>
      <group ref={sails} position={[0, 4.25, 1.02]}>
        {[0, 1, 2, 3].map((blade) => (
          <group key={blade} rotation={[0, 0, (blade * Math.PI) / 2]}>
            <mesh position={[0, 1.15, 0]} castShadow>
              <boxGeometry args={[0.14, 2.5, 0.12]} />
              <meshStandardMaterial color={WOOD} roughness={0.9} />
            </mesh>
            <mesh position={[0, 0.92, 0.08]} castShadow>
              <boxGeometry args={[0.78, 1.35, 0.08]} />
              <meshStandardMaterial color="#eadcae" roughness={0.92} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.22, 0.22, 0.42, 8]} />
          <meshStandardMaterial color={WOOD} roughness={0.86} />
        </mesh>
      </group>
    </group>
  );
}

/** "Starting Village": sede real rústica + 2 casas simples + campo. */
export default function Village() {
  return (
    <group>
      <TownSquare />
      <RoyalHall x={VILLAGE.x} z={VILLAGE.z} />
      <ScenicWindmill x={-30} z={13} />
      <Cottage x={-15.5} z={-1.5} rot={0.45} variant={1} />
      <Cottage x={-5.8} z={6.2} rot={-0.55} variant={2} />
      <Cottage x={-24} z={-2} rot={0.2} variant={3} />
      <Cottage x={-20} z={-9} rot={-0.3} variant={0} />
      <Cottage x={-11} z={-13} rot={0.15} variant={1} />
      <Cottage x={-2} z={-11} rot={-0.45} variant={2} />
      <Cottage x={1} z={8} rot={0.5} variant={3} />
      <Field x={-14.5} z={7.5} />
      <StreetLamps />
    </group>
  );
}
