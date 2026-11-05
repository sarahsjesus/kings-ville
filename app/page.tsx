'use client';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import StartScreen from '@/components/ui/StartScreen';
import AmbientAudio from '@/components/ui/AmbientAudio';
import Hud from '@/components/ui/Hud';
import ShopPanel from '@/components/ui/ShopPanel';
import PeoplePanel from '@/components/ui/PeoplePanel';
import TravelerDialog from '@/components/ui/TravelerDialog';
import { useGameStore } from '@/store/gameStore';

// Three.js só roda no cliente
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), { ssr: false });

export default function Page() {
  const phase = useGameStore((s) => s.phase);
  return (
    <main className="fixed inset-0 h-screen w-screen overflow-hidden bg-black">
      <AmbientAudio />
      {/* A cena monta durante o zoom-in para já estar pronta quando a tela inicial sumir */}
      {phase !== 'menu' && <GameCanvas />}
      {phase === 'playing' && (
        <>
          <Hud />
          <ShopPanel />
          <PeoplePanel />
          <TravelerDialog />
        </>
      )}
      <AnimatePresence>{phase !== 'playing' && <StartScreen key="start" />}</AnimatePresence>
    </main>
  );
}
