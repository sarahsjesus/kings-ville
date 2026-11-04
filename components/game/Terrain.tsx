'use client';
import { useMemo } from 'react';
import * as THREE from 'three';
import { riverX, SIZE, WATER_Y, heightAt } from '@/lib/terrain';

const GRASS_A = new THREE.Color('#568044');
const GRASS_B = new THREE.Color('#91ae67');
const ROCK = new THREE.Color('#8a8a7a');
const BANK = new THREE.Color('#a89a62');
const BED = new THREE.Color('#8a7a55');
const SNOW = new THREE.Color('#f2f5f8');

export default function Terrain() {
  const geo = useMemo(() => {
    const segments = Math.round(SIZE * 1.5);
    const g = new THREE.PlaneGeometry(SIZE, SIZE, segments, segments);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y = heightAt(x, z);
      pos.setY(i, y);
      if (y < -0.45) c.copy(BED);
      else if (y < -0.1) c.copy(BANK);
      else {
        const broad = Math.sin(x * 0.11 + Math.sin(z * 0.08)) * Math.cos(z * 0.09);
        const detail = Math.sin(x * 0.63 + z * 0.37) * Math.cos(z * 0.54 - x * 0.22);
        const n = THREE.MathUtils.clamp(0.48 + broad * 0.2 + detail * 0.08, 0, 1);
        c.copy(GRASS_A).lerp(GRASS_B, n);
        if (y > 5.5) c.lerp(ROCK, Math.min(1, (y - 5.5) / 3));
        if (y > 12) c.lerp(SNOW, Math.min(1, (y - 12) / 3));
      }
      col.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  const river = useMemo(() => {
    const segments = Math.ceil(SIZE * 2);
    const positions = new Float32Array((segments + 1) * 2 * 3);
    const indices: number[] = [];
    for (let i = 0; i <= segments; i++) {
      const z = -SIZE / 2 + (SIZE * i) / segments;
      const centerX = riverX(z);
      const offset = i * 6;
      positions.set([centerX - 2, WATER_Y, z, centerX + 2, WATER_Y, z], offset);
      if (i < segments) {
        const vertex = i * 2;
        indices.push(vertex, vertex + 2, vertex + 1, vertex + 1, vertex + 2, vertex + 3);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, []);

  return (
    <group>
      <mesh geometry={geo} receiveShadow castShadow>
        <meshStandardMaterial vertexColors roughness={1} />
      </mesh>
      <mesh geometry={river}>
        <meshStandardMaterial color="#4d9cba" transparent opacity={0.76} roughness={0.28} metalness={0.04} />
      </mesh>
    </group>
  );
}
