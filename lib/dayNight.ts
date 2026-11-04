import * as THREE from 'three';

export const DAY_SECONDS = 150;
const DAY_FRACTION = 0.7;

export function getSolarPhase(elapsedTime: number): number {
  const cycle = (elapsedTime / DAY_SECONDS + (DAY_FRACTION * 0.9) / Math.PI) % 1;
  if (cycle < DAY_FRACTION) return (cycle / DAY_FRACTION) * Math.PI;
  return Math.PI + ((cycle - DAY_FRACTION) / (1 - DAY_FRACTION)) * Math.PI;
}

export function getDayFactor(elapsedTime: number): number {
  const p = getSolarPhase(elapsedTime);
  return THREE.MathUtils.smoothstep(Math.sin(p), -0.1, 0.4);
}
