'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { ARMY_UNLOCK_LEVEL, MAX_ARMY_LEVEL, MAX_SOLDIERS, SOLDIERS_PER_TRAINING, SOLDIER_TRAINING_COST, getArmyUpgradeCost } from '@/lib/army';
import { LEVEL_NAMES, RES_ICON } from '@/lib/shopCatalog';
import type { ResourceKey, Role } from '@/lib/types';

const ROLES: { id: Role; key: 'farmers' | 'miners' | 'builders' | 'warriors'; label: string; icon: string; desc: string }[] = [
  { id: 'farmer', key: 'farmers', label: 'Fazendeiros', icon: '🌾', desc: '+0,8 comida/s cada' },
  { id: 'miner', key: 'miners', label: 'Mineradores', icon: '⛏️', desc: '+0,5 ouro e +0,4 pedra/s cada' },
  { id: 'builder', key: 'builders', label: 'Construtores', icon: '🔨', desc: '+0,25 madeira/s e obras 15% mais rápidas' },
  { id: 'warrior', key: 'warriors', label: 'Guerreiros', icon: '⚔️', desc: 'Aumentam a segurança da vila' },
];
const fmt = (n: number) => `${n >= 0 ? '+' : ''}${n.toFixed(2).replace('.', ',')}`;

export default function PeoplePanel() {
  const s = useGameStore(); // re-renderiza a cada tick para manter as taxas atualizadas
  const idle = s.idle();
  const rates = s.rates();
  const keys: ResourceKey[] = ['gold', 'food', 'wood', 'stone'];
  const full = s.population.total >= s.population.capacity;
  const upgradeCost = getArmyUpgradeCost(s.armyLevel);
  const formatCost = (cost: Partial<Record<ResourceKey, number>>) =>
    (Object.entries(cost) as [ResourceKey, number][]).map(([key, amount]) => `${RES_ICON[key]} ${amount}`).join(' · ');

  return (
    <AnimatePresence>
      {s.peopleOpen && (
        <motion.div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => s.openPeople(false)}>
          <motion.section className="kv-panel flex max-h-[88vh] w-[min(96vw,560px)] flex-col overflow-y-auto p-4"
            initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Povo do reino">
            <h2 className="text-center text-2xl font-bold">Povo do Reino</h2>
            <p className="mb-3 text-center text-sm">
              Habitantes {s.population.total}/{s.population.capacity} · Sem função: <strong>{idle}</strong>
            </p>

            {s.travelers.length > 0 && (
              <section className="mb-3 rounded-md border border-amber-900/40 bg-amber-100/30 p-3" aria-labelledby="visitors-title">
                <h3 id="visitors-title" className="mb-2 font-bold">
                  Visitantes aguardando ({s.travelers.length})
                </h3>
                <ul className="flex flex-col gap-2">
                  {s.travelers.map((traveler) => (
                    <li key={traveler.id} className="rounded-md border border-amber-900/30 bg-amber-100/30 p-3">
                      <p className="font-bold">{traveler.name}</p>
                      <p className="my-1 text-sm italic opacity-80">“{traveler.pitch}”</p>
                      <p className="mb-2 text-xs">Sugestão: {ROLES.find((role) => role.id === traveler.preferred)?.label}.</p>
                      <div className="flex flex-wrap gap-2">
                        {ROLES.map((role) => (
                          <button
                            key={role.id}
                            className="kv-btn kv-btn-sm"
                            disabled={full}
                            onClick={() => s.recruit(traveler.id, role.id)}
                          >
                            {role.icon} {role.label}
                          </button>
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
                {full && (
                  <p className="mt-2 text-sm font-bold text-red-900">
                    Não há moradia livre. Construa uma casa na Loja Real para receber visitantes.
                  </p>
                )}
              </section>
            )}

            <section className="my-3 rounded-md border border-amber-900/40 bg-amber-100/30 p-3" aria-labelledby="army-title">
              <h3 id="army-title" className="font-bold">Treinamento militar</h3>
              {s.kingdomLevel < ARMY_UNLOCK_LEVEL ? (
                <p className="mt-1 text-sm">
                  Disponível a partir de {LEVEL_NAMES[ARMY_UNLOCK_LEVEL]}. Evolua o reino na Loja Real.
                </p>
              ) : (
                <>
                  <p className="mt-1 text-sm">
                    Soldados: <strong>{s.soldiers}/{MAX_SOLDIERS}</strong> · Treinamento: <strong>nível {s.armyLevel + 1}</strong>
                  </p>
                  <p className="text-sm">Força militar: <strong>{(s.soldiers * (1 + s.armyLevel * 0.5)).toFixed(1).replace('.', ',')}</strong></p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="kv-btn kv-btn-sm"
                      disabled={s.soldiers + SOLDIERS_PER_TRAINING > MAX_SOLDIERS || !s.canAfford(SOLDIER_TRAINING_COST)}
                      onClick={() => s.trainSoldiers()}
                    >
                      Treinar {SOLDIERS_PER_TRAINING} soldados
                    </button>
                    <button
                      className="kv-btn kv-btn-sm"
                      disabled={s.soldiers === 0 || s.armyLevel >= MAX_ARMY_LEVEL || !s.canAfford(upgradeCost)}
                      onClick={() => s.upgradeArmy()}
                    >
                      Evoluir treinamento
                    </button>
                  </div>
                  <p className="mt-2 text-xs">
                    Treino: {formatCost(SOLDIER_TRAINING_COST)}
                  </p>
                  {s.armyLevel < MAX_ARMY_LEVEL ? (
                    <p className="text-xs">Próxima evolução: {formatCost(upgradeCost)}. Aumenta a força de cada soldado em 50%.</p>
                  ) : (
                    <p className="text-xs">Treinamento no nível máximo.</p>
                  )}
                  {s.soldiers === 0 && <p className="mt-1 text-xs">Treine soldados para liberar as evoluções militares.</p>}
                </>
              )}
            </section>

            <ul className="flex flex-col gap-2">
              {ROLES.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-md border border-amber-900/40 bg-amber-100/30 p-3">
                  <div className="min-w-0">
                    <p className="font-bold">{r.icon} {r.label}</p>
                    <p className="text-sm opacity-80">{r.desc}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button className="kv-btn kv-btn-sm" aria-label={`Remover ${r.label}`} disabled={s.population[r.key] === 0} onClick={() => s.unassign(r.id)}>−</button>
                    <span className="w-8 text-center text-lg font-bold tabular-nums">{s.population[r.key]}</span>
                    <button className="kv-btn kv-btn-sm" aria-label={`Adicionar ${r.label}`} disabled={idle <= 0} onClick={() => s.assign(r.id)}>+</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-3 rounded-md border border-amber-900/40 bg-amber-100/30 p-3">
              <p className="mb-1 text-sm font-bold">Produção por segundo</p>
              <p className="flex flex-wrap gap-x-5 text-sm font-semibold tabular-nums">
                {keys.map((k) => (
                  <span key={k} className={rates[k] < 0 ? 'text-red-800' : ''}>{RES_ICON[k]} {fmt(rates[k])}</span>
                ))}
                <span title="Segurança: guerreiros designados + força dos soldados treinados">🛡️ {fmt(s.villageSecurity())} segurança</span>
              </p>
              {rates.food < 0 && <p className="mt-1 text-sm font-bold text-red-800">O povo está consumindo mais comida do que produz. Coloque mais fazendeiros.</p>}
              {idle > 0 && <p className="mt-1 text-sm">Habitantes sem função não produzem nada. Use o botão + para dar um ofício a eles.</p>}
            </div>

            <div className="mt-4 flex justify-center">
              <button className="kv-btn kv-btn-sm" onClick={() => s.openPeople(false)}>Fechar</button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
