'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { LEVEL_NAMES, RES_ICON, RES_NAME } from '@/lib/shopCatalog';
import type { ResourceKey } from '@/lib/types';

export default function Hud() {
  const res = useGameStore((s) => s.resources);
  const pop = useGameStore((s) => s.population);
  const level = useGameStore((s) => s.kingdomLevel);
  const security = useGameStore((s) => s.villageSecurity());
  const waiting = useGameStore((s) => s.travelers.length);
  const tick = useGameStore((s) => s.tick);
  const spawn = useGameStore((s) => s.spawnTraveler);
  const openShop = useGameStore((s) => s.openShop);
  const openPeople = useGameStore((s) => s.openPeople);
  const openTraveler = useGameStore((s) => s.openTraveler);
  const saveGame = useGameStore((s) => s.saveGame);
  const setPhase = useGameStore((s) => s.setPhase);
  const seconds = useRef(0);
  const [toast, setToast] = useState('');
  const [confirmExit, setConfirmExit] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const showToast = (msg: string) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 2500);
  };

  const save = (auto = false) => {
    const where = saveGame();
    if (where === 'disk') showToast(auto ? 'Jogo salvo automaticamente.' : 'Jogo salvo!');
    else showToast('Salvo só nesta sessão: o navegador bloqueou o armazenamento.');
  };

  const exitToMenu = (shouldSave: boolean) => {
    if (shouldSave) saveGame();
    openShop(false);
    openPeople(false);
    openTraveler(null);
    setConfirmExit(false);
    setPhase('menu');
  };

  // Loop do jogo: economia a cada 1 s; viajante aos 5 s e a cada 25 s; autosave a cada 30 s
  useEffect(() => {
    const id = setInterval(() => {
      tick(1);
      seconds.current += 1;
      if (seconds.current === 5 || seconds.current % 25 === 0) spawn();
      if (seconds.current % 30 === 0) save(true);
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, spawn]);

  const keys: ResourceKey[] = ['gold', 'food', 'wood', 'stone'];
  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-2 sm:p-3">
        <div className="kv-panel pointer-events-auto flex flex-wrap items-center justify-center gap-x-5 gap-y-1 px-4 py-2 text-sm font-bold sm:text-base">
          {keys.map((k) => (
            <span key={k} title={RES_NAME[k]} className="tabular-nums">{RES_ICON[k]} {Math.floor(res[k])}</span>
          ))}
          <span title="População" className="tabular-nums">👥 {pop.total}/{pop.capacity}</span>
        </div>
      </header>
      <div className="kv-panel pointer-events-none absolute left-2 top-2 z-10 hidden px-3 py-2 text-xs font-bold sm:left-3 sm:top-3 md:block">
        <p>{LEVEL_NAMES[level]}</p>
        <p className="mt-1 font-normal">Fazendeiros {pop.farmers} · Mineradores {pop.miners} · Construtores {pop.builders} · Guerreiros {pop.warriors}</p>
        <p className="mt-1 font-normal">🛡️ Segurança {security.toFixed(1).replace('.', ',')}</p>
      </div>
      {waiting > 0 && (
        <p className="kv-panel pointer-events-none absolute bottom-3 left-3 z-10 px-3 py-2 text-sm font-bold">
          {waiting === 1 ? 'Um visitante aguarda no portão.' : `${waiting} visitantes aguardam no portão.`} Abra Povo para recebê-los ou clique neles.
        </p>
      )}
      {toast && (
        <p role="status" className="kv-panel pointer-events-none absolute bottom-20 right-3 z-10 px-3 py-2 text-sm font-bold">{toast}</p>
      )}
      <div className="absolute bottom-3 right-3 z-10 flex flex-wrap justify-end gap-2">
        <button className="kv-btn kv-btn-sm" onClick={() => save(false)}>Salvar</button>
        <button className="kv-btn kv-btn-sm" onClick={() => openPeople(true)}>Povo</button>
        <button className="kv-btn kv-btn-sm" onClick={() => openShop(true)}>Loja Real</button>
        <button className="kv-btn kv-btn-sm" onClick={() => setConfirmExit(true)}>Voltar ao início</button>
      </div>
      <AnimatePresence>
        {confirmExit && (
          <motion.div
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              className="kv-panel w-[min(92vw,460px)] p-5 sm:p-6"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="exit-confirmation-title"
            >
              <h2 id="exit-confirmation-title" className="text-center text-xl font-bold sm:text-2xl">
                Tem certeza de que deseja voltar ao início?
              </h2>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button className="kv-btn kv-btn-sm" onClick={() => exitToMenu(true)}>Salvar e sair</button>
                <button className="kv-btn kv-btn-sm" onClick={() => exitToMenu(false)}>Sair sem salvar</button>
                <button className="kv-btn kv-btn-sm" onClick={() => setConfirmExit(false)}>Continuar</button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
