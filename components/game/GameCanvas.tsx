'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import DayNight from './DayNight';
import CameraRig from './CameraRig';
import Terrain from './Terrain';
import Nature from './Nature';
import Village from './Village';
import Built from './Built';
import Travelers from './Travelers';
import TrainingGround from './TrainingGround';
import Workers from './Workers';

// O <Canvas> já observa o tamanho do pai (100vw x 100vh) e redimensiona renderer/câmera sozinho.
export default function GameCanvas() {
  return (
    <div className="absolute inset-0 h-screen w-screen">
      <Canvas shadows="soft" dpr={[1, 1.75]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <Suspense fallback={null}>
          <DayNight />
          <CameraRig />
          <Terrain />
          <Nature />
          <Village />
          <Built />
          <TrainingGround />
          <Workers />
          <Travelers />
        </Suspense>
      </Canvas>
    </div>
  );
}
