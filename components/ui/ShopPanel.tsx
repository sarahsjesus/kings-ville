'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { RES_ICON, RES_NAME, SHOP_ITEMS, SHOP_TABS } from '@/lib/shopCatalog';
import type { ResourceKey } from '@/lib/types';

export default function ShopPanel() {
  const s = useGameStore(); // painel só re-renderiza quando aberto/atualizado
  const items = SHOP_ITEMS.filter((i) => i.tab === s.shopTab);
  const activeBlessings = (Object.entries(s.buffs) as [ResourceKey, { mult: number; until: number }][])
    .filter(([, buff]) => buff.until > Date.now());

  return (
    <AnimatePresence>
      {s.shopOpen && (
        <motion.div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50 p-3"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => s.openShop(false)}>
          <motion.section className="kv-panel flex max-h-[calc(100dvh-1.5rem)] w-[min(96vw,640px)] flex-col p-3 sm:p-4"
            initial={{ y: 30, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 30, opacity: 0 }}
            onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Loja Real">
            <h2 className="mb-3 text-center text-2xl font-bold">Loja Real</h2>
            <div className="mb-3 flex flex-wrap justify-center gap-2" role="tablist">
              {SHOP_TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={s.shopTab === t.id}
                  className={`kv-btn kv-btn-sm ${s.shopTab === t.id ? 'brightness-110 ring-2 ring-amber-700' : 'opacity-80'}`}
                  onClick={() => s.openShop(true, t.id)}>{t.label}</button>
              ))}
            </div>
            {s.shopTab === 'buffs' && activeBlessings.length > 0 && (
              <div className="mb-3 rounded-md border border-amber-900/40 bg-amber-100/40 p-3 text-center text-sm">
                <p className="font-bold">Bênçãos ativas</p>
                <p>
                  {activeBlessings.map(([resource, buff]) => (
                    <span key={resource} className="mr-3">
                      {RES_NAME[resource]} +{Math.round((buff.mult - 1) * 100)}% · {Math.ceil((buff.until - Date.now()) / 1000)} s
                    </span>
                  ))}
                </p>
              </div>
            )}
            <ul className="flex flex-col gap-2 overflow-y-auto pr-1">
              {items.map((item) => {
                const locked = (item.requiresLevel ?? 0) > s.kingdomLevel;
                const owned = s.owned[item.id] ?? 0;
                return (
                  <li key={item.id} className="flex items-center justify-between gap-3 rounded-md border border-amber-900/40 bg-amber-100/30 p-3">
                    <div className="min-w-0">
                      <p className="font-bold">{item.name}{item.tab === 'buildings' && owned > 0 ? ` (${owned})` : ''}</p>
                      <p className="text-sm opacity-80">{locked ? 'Evolua o reino para desbloquear.' : item.desc}</p>
                      <p className="mt-1 text-sm font-semibold">
                        {(Object.entries(item.cost) as [ResourceKey, number][]).map(([k, v]) => (
                          <span key={k} className={`mr-3 ${s.resources[k] < v ? 'text-red-800' : ''}`}>{RES_ICON[k]} {v}</span>
                        ))}
                      </p>
                    </div>
                    <button className="kv-btn kv-btn-sm shrink-0" disabled={!s.canBuy(item.id)} onClick={() => s.buy(item.id)}>Comprar</button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex justify-center">
              <button className="kv-btn kv-btn-sm" onClick={() => s.openShop(false)}>Fechar</button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
