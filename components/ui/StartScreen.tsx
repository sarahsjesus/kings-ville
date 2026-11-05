'use client';
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';

type Panel = null | 'options' | 'credits';
interface Particle { id: number; left: number; size: number; dur: number; delay: number; drift: number; kind: 'pollen' | 'mist' | 'spark' }

// Posições em % da arte da capa (1376x768). Ajuste fino aqui se trocar a imagem.
const SMOKE = [{ x: 84, y: 56 }, { x: 8.2, y: 67 }, { x: 31.6, y: 60 }];
const FLAGS = [{ x: 82.7, y: 27 }, { x: 84.6, y: 64.5 }];
const CLOUDS = [
  { top: '6vh', dur: 80, delay: -10, scale: 1.3 },
  { top: '20vh', dur: 110, delay: -60, scale: 1 },
  { top: '12vh', dur: 95, delay: -75, scale: .8 },
];
const MENU_DELAY = 0.9;

export default function StartScreen() {
  const phase = useGameStore((s) => s.phase);
  const newGame = useGameStore((s) => s.newGame);
  const loadGame = useGameStore((s) => s.loadGame);
  const setPhase = useGameStore((s) => s.setPhase);
  const musicVolume = useGameStore((s) => s.musicVolume);
  const setMusicVolume = useGameStore((s) => s.setMusicVolume);

  const [panel, setPanel] = useState<Panel>(null);
  const [hasSave, setHasSave] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const diving = phase === 'loading';

  const startAmbientAudio = useCallback(() => {
    const audio = document.getElementById('ambient-audio');
    if (!(audio instanceof HTMLAudioElement)) return;
    if (!audio.paused || audio.volume === 0) return;

    void audio.play().catch((error: unknown) => {
      if (error instanceof DOMException) {
        if (error.name === 'AbortError') return;
        if (error.name === 'NotAllowedError') return;
      }
      console.error('Não foi possível reproduzir o áudio ambiente da tela inicial.', error);
    });
  }, []);

  const changeMusicVolume = (value: number) => {
    setMusicVolume(value);
  };

  // Parallax suavizado pelo mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const artX = useTransform(sx, (v) => v * -18);
  const artY = useTransform(sy, (v) => v * -12);
  const cloudX = useTransform(sx, (v) => v * -36);
  const partX = useTransform(sx, (v) => v * -64);
  const partY = useTransform(sy, (v) => v * -40);

  useEffect(() => {
    setHasSave(useGameStore.getState().hasSave());
    const kinds: Particle['kind'][] = ['pollen', 'pollen', 'mist', 'spark'];
    setParticles(
      Array.from({ length: 40 }, (_, i) => {
        const kind = kinds[i % kinds.length];
        return {
          id: i, kind, left: Math.random() * 100,
          size: kind === 'mist' ? 40 + Math.random() * 70 : 3 + Math.random() * 5,
          dur: 14 + Math.random() * 18, delay: -Math.random() * 30, drift: (Math.random() - 0.5) * 160,
        };
      }),
    );
  }, []);

  useEffect(() => {
    if (!diving) return;
    const t = setTimeout(() => setPhase('playing'), 2300);
    return () => clearTimeout(t);
  }, [diving, setPhase]);

  const items = [
    { label: 'Jogar / Novo Reino', act: () => newGame() },
    { label: 'Carregar Jogo', act: () => loadGame(), disabled: !hasSave },
    { label: 'Opções', act: () => setPanel('options') },
    { label: 'Créditos', act: () => setPanel('credits') },
  ];

  return (
    <motion.div
      className="fixed inset-0 z-50 overflow-hidden bg-black"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.9 }}
      onPointerDownCapture={startAmbientAudio}
      onMouseMove={(e) => {
        mx.set(e.clientX / window.innerWidth - 0.5);
        my.set(e.clientY / window.innerHeight - 0.5);
      }}
    >
      {/* Tudo que dá zoom no mergulho */}
      <motion.div
        className="absolute inset-0"
        style={{ transformOrigin: '80% 66%' }}
        animate={{ scale: diving ? 3 : 1 }}
        transition={{ duration: 2.1, ease: [0.65, 0, 0.35, 1] }}
      >
        {/* Camada 1: arte (fundo) */}
        <motion.div className="absolute inset-0" style={{ x: artX, y: artY, scale: 1.07 }}>
          <div className="kv-art">
            <img src="/images/capa.jpg" alt="King’s Ville" draggable={false} />
            <div className="kv-logoshine" />
            {SMOKE.map((p, i) =>
              [0, 1, 2].map((j) => (
                <span key={`${i}-${j}`} className="kv-smoke" style={{ left: `${p.x}%`, top: `${p.y}%`, animationDelay: `${j * 1.7 + i * 0.6}s` }} />
              )),
            )}
            {FLAGS.map((f, i) => (
              <span key={i} className="kv-flag" style={{ left: `${f.x}%`, top: `${f.y}%`, animationDelay: `${i * 0.4}s` }} />
            ))}
          </div>
          <div className="kv-sun" />
        </motion.div>

        {/* Camada 2: nuvens */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ x: cloudX }}>
          {CLOUDS.map((c, i) => (
            <span key={i} className="kv-cloud" style={{ top: c.top, transform: `scale(${c.scale})`, animationDuration: `${c.dur}s`, animationDelay: `${c.delay}s` }} />
          ))}
        </motion.div>

        {/* Camada 3: partículas */}
        <motion.div className="pointer-events-none absolute inset-0" style={{ x: partX, y: partY }}>
          {particles.map((p) => (
            <span
              key={p.id}
              className={`kv-particle ${p.kind}`}
              style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, ['--drift' as string]: `${p.drift}px` } as CSSProperties}
            />
          ))}
        </motion.div>
        <div className="kv-vignette" />
      </motion.div>

      {/* Menu */}
      <motion.div
        className="absolute inset-x-0 bottom-0 z-10 flex flex-col items-center bg-gradient-to-t from-black/70 via-black/30 to-transparent px-4 pb-[4vh] pt-16"
        animate={{ opacity: diving ? 0 : 1, y: diving ? 24 : 0 }}
        transition={{ duration: 0.6 }}
      >
        <nav className="flex flex-wrap items-center justify-center gap-3" aria-label="Menu principal">
          {items.map((it, i) => (
            <motion.button
              key={it.label}
              className="kv-btn"
              style={{ width: 'min(44vw, 230px)' }}
              disabled={it.disabled || diving}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: MENU_DELAY + i * 0.12, duration: 0.5 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={it.act}
            >
              {it.label}
            </motion.button>
          ))}
        </nav>
      </motion.div>

      {/* Painéis */}
      <AnimatePresence>
        {panel && (
          <motion.div className="absolute inset-0 z-20 flex items-center justify-center bg-black/55 p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPanel(null)}>
            <motion.div className="kv-panel w-[min(92vw,420px)] p-6" initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()} role="dialog" aria-modal>
              {panel === 'options' ? (
                <>
                  <h2 className="mb-4 text-center text-2xl font-bold">Opções</h2>
                  <label className="mb-3 block text-sm font-semibold">
                    Música <span className="float-right">{musicVolume}%</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      aria-label="Volume da música"
                      onChange={(event) => changeMusicVolume(Number(event.currentTarget.value))}
                      className="mt-1 w-full accent-amber-700"
                    />
                  </label>
                  <label className="mb-3 block text-sm font-semibold opacity-60">
                    Efeitos sonoros
                    <input type="range" min="0" max="100" value="70" disabled className="mt-1 w-full accent-amber-700" />
                  </label>
                  <p className="text-xs opacity-70">Arraste para a esquerda para diminuir ou silenciar a música.</p>
                </>
              ) : (
                <>
                  <h2 className="mb-4 text-center text-2xl font-bold">Créditos</h2>
                  <p className="text-center leading-relaxed">King’s Ville<br />Desenvolvido por Sarah<br /><span className="text-sm opacity-70">Construindo uma cidade medieval</span></p>
                </>
              )}
              <div className="mt-5 flex justify-center">
                <button className="kv-btn kv-btn-sm" onClick={() => setPanel(null)}>Voltar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Vinheta final do mergulho */}
      <motion.div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black"
        initial={{ opacity: 0 }} animate={{ opacity: diving ? 1 : 0 }} transition={{ delay: diving ? 1.3 : 0, duration: 0.8 }}>
        <p className="text-xl tracking-widest text-amber-200/80">Reunindo o seu povo…</p>
      </motion.div>
    </motion.div>
  );
}
