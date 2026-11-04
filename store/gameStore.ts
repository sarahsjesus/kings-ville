import { create } from 'zustand';
import { ARMY_UNLOCK_LEVEL, MAX_ARMY_LEVEL, MAX_SOLDIERS, SOLDIERS_PER_TRAINING, SOLDIER_TRAINING_COST, getArmyUpgradeCost } from '@/lib/army';
import { SHOP_ITEMS } from '@/lib/shopCatalog';
import type { Cost, ResourceKey, Role, ShopTab, Traveler } from '@/lib/types';

export type Phase = 'menu' | 'loading' | 'playing';
const SAVE_KEY = 'kingsville-save-v1';

// Se o navegador bloquear o localStorage (iframe, modo privado), cai para a memória da sessão.
let memorySave: string | null = null;
const writeSave = (v: string): 'disk' | 'memory' => {
  try { localStorage.setItem(SAVE_KEY, v); return 'disk'; } catch { memorySave = v; return 'memory'; }
};
const readSave = (): string | null => {
  try { return localStorage.getItem(SAVE_KEY) ?? memorySave; } catch { return memorySave; }
};

const START = {
  resources: { gold: 100, food: 60, wood: 80, stone: 40 } as Record<ResourceKey, number>,
  population: { total: 2, capacity: 8, farmers: 0, miners: 0, builders: 0 },
  kingdomLevel: 0,
  owned: { house: 2 } as Record<string, number>,
  soldiers: 0,
  armyLevel: 0,
};

const TRAVELERS = [
  { name: 'Aldric, o Andarilho', pitch: 'Perdi minha terra para a seca. Aceita um par de mãos fortes, Majestade?', preferred: 'farmer' as Role },
  { name: 'Brunna das Minas', pitch: 'Conheço veios de ferro e ouro que ninguém mais viu. Dê-me uma picareta.', preferred: 'miner' as Role },
  { name: 'Tobias, Mestre de Obras', pitch: 'Já ergui três capelas. Com bons braços, levanto uma capital.', preferred: 'builder' as Role },
];

interface GameState {
  phase: Phase;
  resources: Record<ResourceKey, number>;
  population: { total: number; capacity: number; farmers: number; miners: number; builders: number };
  kingdomLevel: number;
  owned: Record<string, number>;
  soldiers: number;
  armyLevel: number;
  buffs: Partial<Record<ResourceKey, { mult: number; until: number }>>;
  travelers: Traveler[];
  activeTravelerId: string | null;
  shopOpen: boolean;
  shopTab: ShopTab;
  peopleOpen: boolean;

  setPhase: (p: Phase) => void;
  newGame: () => void;
  loadGame: () => boolean;
  saveGame: () => 'disk' | 'memory';
  hasSave: () => boolean;

  canAfford: (cost: Cost) => boolean;
  canBuy: (itemId: string) => boolean;
  buy: (itemId: string) => boolean;
  trainSoldiers: () => boolean;
  upgradeArmy: () => boolean;

  spawnTraveler: () => void;
  openTraveler: (id: string | null) => void;
  recruit: (travelerId: string, role: Role) => boolean;
  dismissTraveler: (id: string) => void;
  idle: () => number;
  builderSpeed: () => number; // multiplicador para construções (Etapa 2)

  openShop: (open: boolean, tab?: ShopTab) => void;
  openPeople: (open: boolean) => void;
  assign: (role: Role) => boolean; // dispensado -> função
  unassign: (role: Role) => void; // função -> dispensado
  rates: () => Record<ResourceKey, number>; // produção líquida por segundo
  tick: (dt: number) => void;
}

function computeRates(s: { population: GameState['population']; owned: Record<string, number>; buffs: GameState['buffs']; kingdomLevel: number }): Record<ResourceKey, number> {
  const now = Date.now();
  const m = (k: ResourceKey) => (s.buffs[k] && s.buffs[k]!.until > now ? s.buffs[k]!.mult : 1);
  const { farmers, miners, builders, total } = s.population;
  const farms = s.owned.farm ?? 0;
  const production: Record<ResourceKey, number> = {
    food: farmers * 0.8 + farms * 0.3,
    gold: miners * 0.5,
    wood: 0.3 + builders * 0.25,
    stone: miners * 0.4,
  };
  for (const item of SHOP_ITEMS) {
    const count = s.owned[item.id] ?? 0;
    if (count === 0 || !item.effect?.production) continue;
    for (const [resource, amount] of Object.entries(item.effect.production) as [ResourceKey, number][]) {
      production[resource] += count * amount;
    }
  }
  const kingdomBonus = (s.kingdomLevel >= 3 ? 0.15 : 0) + (s.kingdomLevel >= 4 ? 0.15 : 0);
  const kingdomMultiplier = 1 + kingdomBonus;
  return {
    food: production.food * m('food') * kingdomMultiplier - total * 0.12,
    gold: production.gold * m('gold') * kingdomMultiplier,
    stone: production.stone * m('stone') * kingdomMultiplier,
    wood: production.wood * m('wood') * kingdomMultiplier,
  };
}

let uid = 0;

export const useGameStore = create<GameState>((set, get) => ({
  phase: 'menu',
  ...structuredClone(START),
  buffs: {},
  travelers: [],
  activeTravelerId: null,
  shopOpen: false,
  shopTab: 'buildings',
  peopleOpen: false,

  setPhase: (phase) => set({ phase }),
  newGame: () => set({ ...structuredClone(START), buffs: {}, travelers: [], phase: 'loading' }),
  hasSave: () => typeof window !== 'undefined' && readSave() !== null,
  saveGame: () => {
    const { resources, population, kingdomLevel, owned, soldiers, armyLevel } = get();
    return writeSave(JSON.stringify({ resources, population, kingdomLevel, owned, soldiers, armyLevel }));
  },
  loadGame: () => {
    try {
      const raw = readSave();
      if (!raw) return false;
      const saved = JSON.parse(raw);
      set({
        ...saved,
        population: { ...saved.population, capacity: (saved.owned.house ?? 0) * 4 },
        soldiers: saved.soldiers ?? 0,
        armyLevel: saved.armyLevel ?? 0,
        buffs: {},
        travelers: [],
        phase: 'loading',
      });
      return true;
    } catch {
      return false;
    }
  },

  canAfford: (cost) => (Object.entries(cost) as [ResourceKey, number][]).every(([k, v]) => get().resources[k] >= v),
  canBuy: (id) => {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item) return false;
    const s = get();
    if ((item.requiresLevel ?? 0) > s.kingdomLevel) return false;
    if (item.max && (s.owned[id] ?? 0) >= item.max) return false;
    if (item.effect?.setLevel !== undefined && s.kingdomLevel >= item.effect.setLevel) return false;
    return s.canAfford(item.cost);
  },
  buy: (id) => {
    const item = SHOP_ITEMS.find((i) => i.id === id);
    if (!item || !get().canBuy(id)) return false;
    set((s) => {
      const resources = { ...s.resources };
      (Object.entries(item.cost) as [ResourceKey, number][]).forEach(([k, v]) => (resources[k] -= v));
      const fx = item.effect;
      const buffs = { ...s.buffs };
      if (fx?.buff) buffs[fx.buff.resource] = { mult: fx.buff.mult, until: Date.now() + fx.buff.seconds * 1000 };
      return {
        resources,
        buffs,
        owned: item.tab === 'buffs' ? s.owned : { ...s.owned, [id]: (s.owned[id] ?? 0) + 1 },
        kingdomLevel: fx?.setLevel ?? s.kingdomLevel,
        population: { ...s.population, capacity: s.population.capacity + (fx?.capacity ?? 0) },
      };
    });
    return true;
  },
  trainSoldiers: () => {
    const s = get();
    if (
      s.kingdomLevel < ARMY_UNLOCK_LEVEL ||
      s.soldiers + SOLDIERS_PER_TRAINING > MAX_SOLDIERS ||
      !s.canAfford(SOLDIER_TRAINING_COST)
    ) return false;
    set((state) => {
      const resources = { ...state.resources };
      (Object.entries(SOLDIER_TRAINING_COST) as [ResourceKey, number][]).forEach(([key, amount]) => {
        resources[key] -= amount;
      });
      return { resources, soldiers: state.soldiers + SOLDIERS_PER_TRAINING };
    });
    return true;
  },
  upgradeArmy: () => {
    const s = get();
    if (s.kingdomLevel < ARMY_UNLOCK_LEVEL || s.soldiers === 0 || s.armyLevel >= MAX_ARMY_LEVEL) return false;
    const cost = getArmyUpgradeCost(s.armyLevel);
    if (!s.canAfford(cost)) return false;
    set((state) => {
      const resources = { ...state.resources };
      (Object.entries(cost) as [ResourceKey, number][]).forEach(([key, amount]) => {
        resources[key] -= amount;
      });
      return { resources, armyLevel: state.armyLevel + 1 };
    });
    return true;
  },

  spawnTraveler: () =>
    set((s) => {
      if (s.travelers.length >= 3) return s;
      const t = TRAVELERS[Math.floor(Math.random() * TRAVELERS.length)];
      return { travelers: [...s.travelers, { id: `t${++uid}`, ...t }] };
    }),
  openTraveler: (id) => set({ activeTravelerId: id }),
  recruit: (id, role) => {
    const s = get();
    if (s.population.total >= s.population.capacity) return false;
    const key = (role + 's') as 'farmers' | 'miners' | 'builders';
    set({
      population: { ...s.population, total: s.population.total + 1, [key]: s.population[key] + 1 },
      travelers: s.travelers.filter((t) => t.id !== id),
      activeTravelerId: null,
    });
    return true;
  },
  dismissTraveler: (id) => set((s) => ({ travelers: s.travelers.filter((t) => t.id !== id), activeTravelerId: null })),
  idle: () => {
    const p = get().population;
    return p.total - p.farmers - p.miners - p.builders;
  },
  builderSpeed: () => 1 + 0.15 * get().population.builders,

  openShop: (open, tab) => set((s) => ({ shopOpen: open, shopTab: tab ?? s.shopTab })),
  openPeople: (open) => set({ peopleOpen: open }),
  assign: (role) => {
    if (get().idle() <= 0) return false;
    const key = (role + 's') as 'farmers' | 'miners' | 'builders';
    set((s) => ({ population: { ...s.population, [key]: s.population[key] + 1 } }));
    return true;
  },
  unassign: (role) => {
    const key = (role + 's') as 'farmers' | 'miners' | 'builders';
    set((s) => (s.population[key] > 0 ? { population: { ...s.population, [key]: s.population[key] - 1 } } : s));
  },
  rates: () => computeRates(get()),

  tick: (dt) =>
    set((s) => {
      const rt = computeRates(s);
      const r = s.resources;
      return {
        resources: {
          food: Math.max(0, r.food + rt.food * dt),
          gold: r.gold + rt.gold * dt,
          stone: r.stone + rt.stone * dt,
          wood: r.wood + rt.wood * dt,
        },
      };
    }),
}));
