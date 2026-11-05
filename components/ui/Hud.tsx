'use client';
import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { RES_ICON, RES_NAME } from '@/lib/shopCatalog';
import type { ResourceKey } from '@/lib/types';

export default function Hud() {
  const res = useGameStore((s) => s.resources);
  const pop = useGameStore((s) => s.population);
  const waiting = useGameStore((s) => s.travelers.length);
  const tick = useGameStore((s) => s.tick);
  const spawn = useGameStore((s) => s.spawnTraveler);
  const openShop = useGameStore((s) => s.openShop);
  const openPeople = useGameStore((s) => s.openPeople);
  const openTraveler = useGameStore((s) => s.openTraveler);
  const saveGame = useGameStore((s) => s.saveGame);
  const setPhase = useGameStore((s) => s.setPhase);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);
  const seconds = useRef(0);
  const [toast, setToast] = useState('');
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showVisitorNotice, setShowVisitorNotice] = useState(false);
  const previousWaiting = useRef(waiting);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const visitorTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

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

  useEffect(() => {
    const previousWaitingCount = previousWaiting.current;
    previousWaiting.current = waiting;

    if (waiting > previousWaitingCount) {
      setShowVisitorNotice(true);
      clearTimeout(visitorTimer.current);
      visitorTimer.current = setTimeout(() => setShowVisitorNotice(false), 7000);
    } else if (waiting === 0) {
      setShowVisitorNotice(false);
      clearTimeout(visitorTimer.current);
    }
  }, [waiting]);

  useEffect(() => () => clearTimeout(visitorTimer.current), []);

  const keys: ResourceKey[] = ['gold', 'food', 'wood', 'stone'];
  return (
    <>
      <header className="pointer-events-none absolute inset-x-0 top-0 z-10 flex justify-center p-2 sm:p-3">
        <div className="kv-panel pointer-events-auto flex max-w-[calc(100vw-1rem)] flex-wrap items-center justify-center gap-x-2 gap-y-1 px-2 py-2 text-xs font-bold sm:gap-x-5 sm:px-4 sm:text-base">
          {keys.map((k) => (
            <span key={k} title={RES_NAME[k]} className="tabular-nums">{RES_ICON[k]} {Math.floor(res[k])}</span>
          ))}
          <span title="População" className="tabular-nums">👥 {pop.total}/{pop.capacity}</span>
        </div>
      </header>
      <AnimatePresence>
        {showVisitorNotice && waiting > 0 && (
          <motion.button
            type="button"
            className="kv-panel absolute left-2 right-2 top-16 z-20 mx-auto w-fit max-w-[calc(100vw-1rem)] px-3 py-2 text-center text-xs font-bold sm:text-sm"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            onClick={() => openPeople(true)}
            aria-live="polite"
          >
            {waiting === 1 ? 'Um visitante aguarda no portão.' : `${waiting} visitantes aguardam no portão.`} Toque para ver.
          </motion.button>
        )}
      </AnimatePresence>
      {toast && (
        <p role="status" className="kv-panel pointer-events-none absolute bottom-20 right-3 z-10 px-3 py-2 text-sm font-bold">{toast}</p>
      )}
      <div className="absolute bottom-3 right-3 z-10 hidden flex-wrap justify-end gap-2 sm:flex">
        <button className="kv-btn kv-btn-sm" onClick={() => save(false)}>Salvar</button>
        <button className="kv-btn kv-btn-sm" onClick={() => openPeople(true)}>Povo</button>
        <button className="kv-btn kv-btn-sm" onClick={() => openShop(true)}>Loja Real</button>
        <button className="kv-btn kv-btn-sm" onClick={() => setOptionsOpen(true)}>Opções</button>
      </div>
      <div className="absolute bottom-3 right-3 z-10 sm:hidden">
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              className="kv-panel absolute bottom-full right-0 mb-2 flex min-w-40 flex-col gap-2 p-2"
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              aria-label="Ações do jogo"
            >
              <button className="kv-btn kv-btn-sm" onClick={() => { save(false); setMobileMenuOpen(false); }}>Salvar</button>
              <button className="kv-btn kv-btn-sm" onClick={() => { openPeople(true); setMobileMenuOpen(false); }}>Povo</button>
              <button className="kv-btn kv-btn-sm" onClick={() => { openShop(true); setMobileMenuOpen(false); }}>Loja Real</button>
              <button className="kv-btn kv-btn-sm" onClick={() => { setOptionsOpen(true); setMobileMenuOpen(false); }}>Opções</button>
            </motion.nav>
          )}
        </AnimatePresence>
        <button
          type="button"
          className="kv-btn kv-btn-sm min-h-11 min-w-11"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? 'Fechar menu de ações' : 'Abrir menu de ações'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? '×' : '☰'}
        </button>
      </div>
      <AnimatePresence>
        {optionsOpen && (
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
              aria-labelledby="options-title"
            >
              <h2 id="options-title" className="mb-4 text-center text-xl font-bold sm:text-2xl">Opções</h2>
              <label className="mb-3 block text-sm font-semibold opacity-60">
                Efeitos sonoros
                <input type="range" min="0" max="100" value="70" disabled className="mt-1 w-full accent-amber-700" />
              </label>
              <p className="text-xs opacity-70">Arraste para a esquerda para diminuir ou silenciar a música.</p>
              <label className="mt-3 block text-sm font-semibold">
                Música <span className="float-right">{musicVolume}%</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={musicVolume}
                  aria-label="Volume da música"
                  onChange={(event) => setMusicVolume(Number(event.currentTarget.value))}
                  className="mt-1 w-full accent-amber-700"
                />
              </label>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button className="kv-btn kv-btn-sm" onClick={() => exitToMenu(false)}>Voltar ao início sem salvar</button>
                <button className="kv-btn kv-btn-sm" onClick={() => exitToMenu(true)}>Voltar e salvar</button>
                <button className="kv-btn kv-btn-sm" onClick={() => setOptionsOpen(false)}>Continuar</button>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
