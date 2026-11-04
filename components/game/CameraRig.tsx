'use client';
import { useRef, type ElementRef } from 'react';
import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { SIZE } from '@/lib/terrain';

/** Câmera isométrica: botão esquerdo = PAN, direito = rotação, roda = zoom. */
export default function CameraRig() {
  const ref = useRef<ElementRef<typeof OrbitControls>>(null);

  const clampTarget = () => {
    const c = ref.current;
    if (!c) return;
    const limit = Math.min(120, SIZE / 2 - Math.max(55, c.getDistance() * 1.15));
    c.target.x = THREE.MathUtils.clamp(c.target.x, -limit, limit);
    c.target.z = THREE.MathUtils.clamp(c.target.z, -limit, limit);
    c.target.y = 0;
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[8, 34, 32]} fov={35} near={0.5} far={600} />
      <OrbitControls
        ref={ref}
        makeDefault
        target={[-10, 0, 2]}
        enableDamping
        dampingFactor={0.08}
        screenSpacePanning={false}
        minDistance={14}
        maxDistance={80}
        minPolarAngle={0.42}
        maxPolarAngle={1.05}
        rotateSpeed={0.6}
        panSpeed={0.9}
        mouseButtons={{ LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
        touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
        onChange={clampTarget}
      />
    </>
  );
}
