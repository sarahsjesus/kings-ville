export const SIZE = 440; // campo amplo, com a borda visual fora da área explorável
export const WATER_Y = -0.35;
export const VILLAGE = { x: -10, z: 2 };

export const riverX = (z: number) => 9 + 4 * Math.sin(z * 0.14);

// smoothstep que aceita a > b (curva invertida)
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

/** Altura em (x, z): relevo suave, rio saindo por um vale e platô da vila. */
export function heightAt(x: number, z: number): number {
  const dR = Math.abs(x - riverX(z));

  let h =
    0.7 * Math.sin(x * 0.13 + 1) * Math.cos(z * 0.11) +
    0.35 * Math.sin(x * 0.37 + z * 0.29) +
    0.25 * Math.cos(z * 0.45 - x * 0.2) +
    1.1 * Math.sin(x * 0.045 + 2) * Math.cos(z * 0.05) +
    0.5 * Math.sin(x * 0.08 + z * 0.06 + 1);

  const river = 1 - smooth(2.2, 5.5, dR);
  h = h * (1 - river * 0.8) - river * 1.2;

  const flat = 1 - smooth(8, 15, Math.hypot(x - VILLAGE.x, z - VILLAGE.z));
  return h * (1 - flat) + 0.25 * flat;
}

export function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Spot { x: number; y: number; z: number; s: number; rot: number; c: number }
export function scatter(n: number, seed: number, ok: (x: number, z: number, y: number) => boolean): Spot[] {
  const r = rng(seed);
  const out: Spot[] = [];
  for (let i = 0; i < 30000 && out.length < n; i++) {
    const x = (r() - 0.5) * (SIZE - 4);
    const z = (r() - 0.5) * (SIZE - 4);
    const y = heightAt(x, z);
    if (ok(x, z, y)) out.push({ x, y, z, s: 0.7 + r() * 0.8, rot: r() * Math.PI * 2, c: r() });
  }
  return out;
}
