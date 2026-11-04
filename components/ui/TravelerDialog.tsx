'use client';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import type { Role } from '@/lib/types';

const ROLES: { id: Role; label: string; hint: string }[] = [
  { id: 'farmer', label: 'Fazendeiro', hint: 'Gera comida' },
  { id: 'miner', label: 'Minerador', hint: 'Gera ouro e pedra' },
  { id: 'builder', label: 'Construtor', hint: 'Acelera obras e traz madeira' },
  { id: 'warrior', label: 'Guerreiro', hint: 'Aumenta a segurança da vila' },
];
const ROLE_NAME: Record<Role, string> = { farmer: 'fazendeiro', miner: 'minerador', builder: 'construtor', warrior: 'guerreiro' };

export default function TravelerDialog() {
  const travelers = useGameStore((s) => s.travelers);
  const activeId = useGameStore((s) => s.activeTravelerId);
  const pop = useGameStore((s) => s.population);
  const open = useGameStore((s) => s.openTraveler);
  const recruit = useGameStore((s) => s.recruit);
  const dismiss = useGameStore((s) => s.dismissTraveler);
  const [msg, setMsg] = useState('');
  const t = travelers.find((x) => x.id === activeId);
  const full = pop.total >= pop.capacity;

  const close = () => { setMsg(''); open(null); };

  return (
    <AnimatePresence>
      {t && (
        <motion.div className="absolute inset-0 z-20 flex items-end justify-center bg-black/40 p-3 sm:items-center"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close}>
          <motion.section className="kv-panel w-[min(96vw,520px)] p-5" role="dialog" aria-label={`Viajante: ${t.name}`}
            initial={{ y: 40, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 40, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold">{t.name}</h2>
            <p className="my-3 leading-relaxed italic">“{t.pitch}”</p>
            <p className="mb-3 text-sm opacity-80">
              Moradias: {pop.total}/{pop.capacity}. Sugestão: {ROLE_NAME[t.preferred]}.
            </p>
            <div className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <button key={r.id} className="kv-btn !w-full" disabled={full}
                  onClick={() => { if (!recruit(t.id, r.id)) setMsg('Sem moradia livre. Compre casas na Loja Real.'); else setMsg(''); }}>
                  {r.label} <span className="text-xs font-normal opacity-75">({r.hint})</span>
                </button>
              ))}
            </div>
            {(full || msg) && <p className="mt-3 text-center text-sm font-bold text-red-900">{msg || 'Sem moradia livre. Compre casas na Loja Real.'}</p>}
            <div className="mt-4 flex justify-center gap-3">
              <button className="kv-btn kv-btn-sm" onClick={() => { dismiss(t.id); setMsg(''); }}>Dispensar</button>
              <button className="kv-btn kv-btn-sm" onClick={close}>Pensar melhor</button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
