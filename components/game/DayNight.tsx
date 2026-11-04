'use client';
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { getDayFactor, getSolarPhase } from '@/lib/dayNight';

const NIGHT = new THREE.Color('#0a1030');
const DAY = new THREE.Color('#9fd0f2');
const DUSK = new THREE.Color('#f2a063');
const SUN_WHITE = new THREE.Color('#fff1d0');
const SUN_LOW = new THREE.Color('#ff9a4d');

export default function DayNight() {
  const sun = useRef<THREE.DirectionalLight>(null);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const scene = useThree((s) => s.scene);
  const tmp = useMemo(() => new THREE.Color(), []);

  useEffect(() => {
    scene.background = new THREE.Color(DAY);
    scene.fog = new THREE.Fog(DAY, 185, 420);
  }, [scene]);

  useFrame(({ clock }) => {
    const p = getSolarPhase(clock.elapsedTime);
    const elev = Math.sin(p);
    const dayF = getDayFactor(clock.elapsedTime);
    const duskF = 1 - Math.min(1, Math.abs(elev) / 0.35);

    tmp.copy(NIGHT).lerp(DAY, dayF).lerp(DUSK, duskF * 0.5);
    (scene.background as THREE.Color).copy(tmp);
    (scene.fog as THREE.Fog).color.copy(tmp);

    if (sun.current) {
      sun.current.position.set(Math.cos(p) * 70, Math.max(elev, 0.05) * 7 + 6, 34);
      sun.current.intensity = 2.6 * dayF + 0.04;
      sun.current.color.copy(SUN_WHITE).lerp(SUN_LOW, duskF);
    }
    if (hemi.current) hemi.current.intensity = 0.25 + 0.7 * dayF;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#bcd6ff', '#4a3b25', 0.9]} />
      <directionalLight
        ref={sun}
        castShadow
        intensity={2.6}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-58}
        shadow-camera-right={58}
        shadow-camera-top={58}
        shadow-camera-bottom={-58}
        shadow-camera-near={1}
        shadow-camera-far={230}
        shadow-bias={-0.0004}
      />
    </>
  );
}
