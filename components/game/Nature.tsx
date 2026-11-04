'use client';
import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { VILLAGE, heightAt, riverX, scatter } from '@/lib/terrain';
import { BRIDGE_SLOTS, CASTLE, ENTRANCE, FARM_SLOTS, GATE, TRAINING_GROUND, distToSeg } from '@/lib/layout';

// Áreas que precisam ficar livres: clareira da vila, campos, castelo, pontes e a estrada de entrada.
const blocked = (x: number, z: number) =>
  Math.hypot(x - VILLAGE.x, z - VILLAGE.z) < 25 ||
  FARM_SLOTS.some(([fx, fz]) => Math.hypot(x - fx, z - fz) < 5) ||
  Math.hypot(x - CASTLE.x, z - CASTLE.z) < 13 ||
  (Math.abs(x - TRAINING_GROUND.x) < 9 && Math.abs(z - TRAINING_GROUND.z) < 8) ||
  BRIDGE_SLOTS.some((b) => Math.abs(z - b.z) < 4.5 && Math.abs(x - b.x) < 9) ||
  distToSeg(x, z, ENTRANCE, [GATE.x, GATE.z]) < 3.4;

function Road() {
  const geometry = useMemo(() => {
    const points = [
      new THREE.Vector3(ENTRANCE[0], 0, ENTRANCE[1]),
      new THREE.Vector3(GATE.x, 0, GATE.z),
      new THREE.Vector3(-20, 0, 7),
      new THREE.Vector3(-16.5, 0, 3),
    ];
    const curve = new THREE.CatmullRomCurve3(points, false, 'centripetal');
    const samples = 180;
    const halfWidth = 1.2;
    const positions = new Float32Array((samples + 1) * 2 * 3);
    const indices: number[] = [];

    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const point = curve.getPointAt(t);
      const tangent = curve.getTangentAt(t);
      const sideX = tangent.z;
      const sideZ = -tangent.x;
      const groundY = heightAt(point.x, point.z) + 0.07;
      const offset = i * 6;
      positions.set([
        point.x + sideX * halfWidth, groundY, point.z + sideZ * halfWidth,
        point.x - sideX * halfWidth, groundY, point.z - sideZ * halfWidth,
      ], offset);
      if (i < samples) {
        const vertex = i * 2;
        indices.push(vertex, vertex + 1, vertex + 2, vertex + 1, vertex + 3, vertex + 2);
      }
    }

    const road = new THREE.BufferGeometry();
    road.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    road.setIndex(indices);
    road.computeVertexNormals();
    return road;
  }, []);

  return (
    <mesh geometry={geometry} receiveShadow>
      <meshStandardMaterial color="#95856b" roughness={1} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function Nature() {
  const trees = useMemo(
    () => scatter(6000, 7, (x, z, y) => y > 0 && y < 7 && Math.abs(x - riverX(z)) > 6 && !blocked(x, z)),
    [],
  );
  const pines = useMemo(() => trees.filter((t) => t.c >= 0.35), [trees]);
  const oaks = useMemo(() => trees.filter((t) => t.c < 0.35), [trees]);
  const rocks = useMemo(
    () => scatter(140, 21, (x, z, y) => y > -0.1 && Math.hypot(x - VILLAGE.x, z - VILLAGE.z) > 9 && !FARM_SLOTS.some(([fx, fz]) => Math.hypot(x - fx, z - fz) < 4)),
    [],
  );
  const trunk = useRef<THREE.InstancedMesh>(null);
  const pine = useRef<THREE.InstancedMesh>(null);
  const pineUpper = useRef<THREE.InstancedMesh>(null);
  const oak = useRef<THREE.InstancedMesh>(null);
  const oakUpper = useRef<THREE.InstancedMesh>(null);
  const stone = useRef<THREE.InstancedMesh>(null);

  useLayoutEffect(() => {
    const d = new THREE.Object3D();
    const col = new THREE.Color();
    let pi = 0, oi = 0;
    trees.forEach((t, i) => {
      d.rotation.set(0, t.rot, 0);
      d.scale.setScalar(t.s);
      d.position.set(t.x, t.y + 0.5 * t.s, t.z);
      d.updateMatrix();
      trunk.current!.setMatrixAt(i, d.matrix);
      if (t.c >= 0.35) {
        d.position.set(t.x, t.y + 1.9 * t.s, t.z);
        d.scale.set(t.s, t.s, t.s);
        d.updateMatrix();
        pine.current!.setMatrixAt(pi, d.matrix);
        pine.current!.setColorAt(pi++, col.setHSL(0.3 + t.c * 0.04, 0.5, 0.2 + t.c * 0.08));
        d.scale.set(t.s * 0.72, t.s * 0.72, t.s * 0.72);
        d.position.set(t.x, t.y + 2.65 * t.s, t.z);
        d.updateMatrix();
        pineUpper.current!.setMatrixAt(pi - 1, d.matrix);
        pineUpper.current!.setColorAt(pi - 1, col.setHSL(0.3 + t.c * 0.04, 0.48, 0.24 + t.c * 0.08));
      } else {
        d.scale.set(t.s * 1.15, t.s * 0.95, t.s * 1.15);
        d.position.set(t.x, t.y + 1.7 * t.s, t.z);
        d.updateMatrix();
        oak.current!.setMatrixAt(oi, d.matrix);
        oak.current!.setColorAt(oi++, col.setHSL(0.2 + t.c * 0.12, 0.5, 0.3 + t.c * 0.1));
        const side = t.rot;
        d.scale.set(t.s * 0.72, t.s * 0.68, t.s * 0.72);
        d.position.set(t.x + Math.cos(side) * 0.55 * t.s, t.y + 1.9 * t.s, t.z + Math.sin(side) * 0.55 * t.s);
        d.updateMatrix();
        oakUpper.current!.setMatrixAt(oi - 1, d.matrix);
        oakUpper.current!.setColorAt(oi - 1, col.setHSL(0.22 + t.c * 0.1, 0.48, 0.34 + t.c * 0.1));
      }
    });
    rocks.forEach((r, i) => {
      d.rotation.set(r.c * 3, r.rot, 0);
      d.scale.set(r.s, r.s * 0.7, r.s * 1.1);
      d.position.set(r.x, r.y + 0.15, r.z);
      d.updateMatrix();
      stone.current!.setMatrixAt(i, d.matrix);
    });
    [trunk, pine, pineUpper, oak, oakUpper, stone].forEach((m) => { m.current!.instanceMatrix.needsUpdate = true; });
    pine.current!.instanceColor!.needsUpdate = true;
    pineUpper.current!.instanceColor!.needsUpdate = true;
    oak.current!.instanceColor!.needsUpdate = true;
    oakUpper.current!.instanceColor!.needsUpdate = true;
  }, [trees, rocks]);

  return (
    <group>
      <Road />
      <instancedMesh ref={trunk} args={[undefined, undefined, trees.length]} castShadow>
        <cylinderGeometry args={[0.12, 0.2, 1, 8]} />
        <meshStandardMaterial color="#5a3b22" roughness={1} />
      </instancedMesh>
      <instancedMesh ref={pine} args={[undefined, undefined, pines.length]} castShadow receiveShadow>
        <coneGeometry args={[0.9, 2.6, 7]} />
        <meshStandardMaterial color="#ffffff" flatShading roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={pineUpper} args={[undefined, undefined, pines.length]} castShadow receiveShadow>
        <coneGeometry args={[0.9, 2.6, 7]} />
        <meshStandardMaterial color="#ffffff" flatShading roughness={0.96} />
      </instancedMesh>
      <instancedMesh ref={oak} args={[undefined, undefined, oaks.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading roughness={0.98} />
      </instancedMesh>
      <instancedMesh ref={oakUpper} args={[undefined, undefined, oaks.length]} castShadow receiveShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#ffffff" flatShading roughness={0.98} />
      </instancedMesh>
      <instancedMesh ref={stone} args={[undefined, undefined, rocks.length]} castShadow receiveShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#8c8c85" flatShading roughness={1} />
      </instancedMesh>
    </group>
  );
}
