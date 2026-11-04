import { VILLAGE, riverX } from './terrain';

export const WALL_R = 12.5;
export const ENTRANCE: [number, number] = [-34, 28]; // por onde os viajantes entram no reino
export const GATE_ANGLE = Math.atan2(ENTRANCE[1] - VILLAGE.z, ENTRANCE[0] - VILLAGE.x);

/** Distância de um ponto a um segmento (usada para manter árvores fora da estrada). */
export function distToSeg(px: number, pz: number, a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0], dz = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (pz - a[1]) * dz) / (dx * dx + dz * dz)));
  return Math.hypot(px - (a[0] + t * dx), pz - (a[1] + t * dz));
}

const pol = (a: number, r = WALL_R) => ({ x: VILLAGE.x + Math.cos(a) * r, z: VILLAGE.z + Math.sin(a) * r });
const angDiff = (a: number, b: number) => {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
};

export const GATE = pol(GATE_ANGLE);
export const WAIT_SPOT = pol(GATE_ANGLE, WALL_R + 3.5);

// Muralha: anel de 30 segmentos com vão no portão; os primeiros comprados ficam perto do portão.
export const WALL_SLOTS = Array.from({ length: 30 }, (_, i) => {
  const a = (i / 30) * Math.PI * 2;
  return { ...pol(a), a };
})
  .filter((s) => Math.abs(angDiff(s.a, GATE_ANGLE)) > 0.25)
  .sort((p, q) => Math.abs(angDiff(p.a, GATE_ANGLE)) - Math.abs(angDiff(q.a, GATE_ANGLE)));

export const TOWER_SLOTS = Array.from({ length: 8 }, (_, i) => {
  const a = GATE_ANGLE + Math.PI / 8 + (i * Math.PI) / 4;
  return { ...pol(a), a };
});

// Casas extras: grade dentro da muralha, evitando sede, casas e campo iniciais.
const EXISTING: [number, number, number][] = [[-15.5, -1.5, 3.6], [-5.8, 6.2, 3.6], [-14.5, 7.5, 4.2]];
export const HOUSE_SLOTS = (() => {
  const out: { x: number; z: number; rot: number }[] = [];
  const sp = 3.4;
  for (let j = -4; j <= 4; j++)
    for (let i = -4; i <= 4; i++) {
      const x = VILLAGE.x + i * sp + (j % 2 ? sp / 2 : 0);
      const z = VILLAGE.z + j * sp;
      const d = Math.hypot(x - VILLAGE.x, z - VILLAGE.z);
      if (d < 5.8 || d > 11.2) continue;
      if (EXISTING.some(([ex, ez, r]) => Math.hypot(x - ex, z - ez) < r)) continue;
      out.push({ x, z, rot: Math.atan2(VILLAGE.x - x, VILLAGE.z - z) });
    }
  return out;
})();

export const FARM_SLOTS: [number, number][] = [
  [-13, 18], [-19, 17], [-7, 18], [-1, 17], [-13, -22], [-7, -14], [-25, -14], [-1, -21], [-25, 6], [-31, -2],
];

export const WINDMILL_SLOTS: [number, number][] = [[-25, 14], [-26, 8], [-25, 1], [-23, -6]];
export const SAWMILL_SLOTS: [number, number][] = [[17, 18], [20, 13], [22, 8], [18, 3]];
export const QUARRY_SLOTS: [number, number][] = [[27, -10], [29, -3], [27, 5]];

export const BRIDGE_SLOTS = [4, -12, 18].map((z) => ({ x: riverX(z), z, rot: Math.atan(0.56 * Math.cos(z * 0.14)) }));

export const CASTLE = { x: 21, z: -14 }; // colina a leste, como o castelo distante da capa
export const TRAINING_GROUND = { x: 2, z: -4 };
