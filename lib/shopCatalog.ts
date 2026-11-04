import type { ResourceKey, ShopItem, ShopTab } from './types';

export const RES_ICON: Record<ResourceKey, string> = { gold: '🪙', food: '🌾', wood: '🪵', stone: '🪨' };
export const RES_NAME: Record<ResourceKey, string> = { gold: 'Ouro', food: 'Comida', wood: 'Madeira', stone: 'Pedra' };
export const LEVEL_NAMES = ['Vila Inicial', 'Vila Próspera', 'Capital Florescente', 'Ducado Unido', 'Reino Dourado'];
export const SHOP_TABS: { id: ShopTab; label: string }[] = [
  { id: 'buildings', label: 'Construções' },
  { id: 'upgrades', label: 'Melhorias' },
  { id: 'buffs', label: 'Bênçãos do Rei' },
];

export const SHOP_ITEMS: ShopItem[] = [
  // Construções
  { id: 'house', tab: 'buildings', name: 'Casa Simples', desc: 'Abriga 4 habitantes.', cost: { wood: 30, stone: 5 }, max: 14, effect: { capacity: 4 } },
  { id: 'farm', tab: 'buildings', name: 'Campo de Cultivo', desc: 'Produz comida continuamente.', cost: { wood: 25, gold: 10 }, max: 10 },
  { id: 'tower', tab: 'buildings', name: 'Torre de Vigia', desc: 'Defende o reino e impõe respeito.', cost: { stone: 60, wood: 20, gold: 30 }, requiresLevel: 1, max: 8 },
  { id: 'wall', tab: 'buildings', name: 'Muralha de Pedra', desc: 'Um trecho de muralha fortificada.', cost: { stone: 80, gold: 20 }, requiresLevel: 1, max: 26 },
  { id: 'bridge', tab: 'buildings', name: 'Ponte de Pedra', desc: 'Liga as margens do rio.', cost: { stone: 120, wood: 60, gold: 50 }, requiresLevel: 2, max: 3 },
  { id: 'windmill', tab: 'buildings', name: 'Moinho de Vento', desc: 'Produz +0,45 comida por segundo.', cost: { wood: 90, stone: 35, gold: 40 }, requiresLevel: 1, max: 4, effect: { production: { food: 0.45 } } },
  { id: 'sawmill', tab: 'buildings', name: 'Serraria', desc: 'Produz +0,35 madeira por segundo.', cost: { wood: 110, stone: 30, gold: 55 }, requiresLevel: 1, max: 4, effect: { production: { wood: 0.35 } } },
  { id: 'quarry', tab: 'buildings', name: 'Pedreira', desc: 'Produz +0,25 pedra por segundo.', cost: { wood: 100, stone: 70, gold: 75 }, requiresLevel: 2, max: 3, effect: { production: { stone: 0.25 } } },
  // Melhorias
  { id: 'lvl1', tab: 'upgrades', name: 'Vila Próspera', desc: 'Libera torres e muralhas.', cost: { gold: 150, wood: 120, stone: 80 }, effect: { setLevel: 1 }, max: 1 },
  { id: 'lvl2', tab: 'upgrades', name: 'Capital Florescente', desc: 'Libera pontes e castelos de pedra.', cost: { gold: 600, wood: 400, stone: 400, food: 200 }, requiresLevel: 1, effect: { setLevel: 2 }, max: 1 },
  { id: 'lvl3', tab: 'upgrades', name: 'Ducado Unido', desc: 'Une as províncias e aumenta toda a produção em 15%.', cost: { gold: 1400, wood: 900, stone: 850, food: 600 }, requiresLevel: 2, effect: { setLevel: 3 }, max: 1 },
  { id: 'lvl4', tab: 'upgrades', name: 'Reino Dourado', desc: 'Consolida o reino e aumenta toda a produção em mais 15%.', cost: { gold: 3200, wood: 1800, stone: 1700, food: 1200 }, requiresLevel: 3, effect: { setLevel: 4 }, max: 1 },
  // Buffs
  { id: 'buff_food', tab: 'buffs', name: 'Bênção da Colheita', desc: '+50% de comida por 90 s.', cost: { gold: 80 }, effect: { buff: { resource: 'food', mult: 1.5, seconds: 90 } } },
  { id: 'buff_gold', tab: 'buffs', name: 'Decreto de Impostos', desc: '+50% de ouro por 90 s.', cost: { food: 60 }, effect: { buff: { resource: 'gold', mult: 1.5, seconds: 90 } } },
  { id: 'buff_wood', tab: 'buffs', name: 'Corveia Real', desc: '+50% de madeira por 90 s.', cost: { gold: 60 }, effect: { buff: { resource: 'wood', mult: 1.5, seconds: 90 } } },
  { id: 'buff_stone', tab: 'buffs', name: 'Favor dos Mineiros', desc: '+50% de pedra por 90 s.', cost: { gold: 75, food: 40 }, effect: { buff: { resource: 'stone', mult: 1.5, seconds: 90 } } },
  { id: 'buff_abundance', tab: 'buffs', name: 'Banquete da Colheita', desc: '+100% de comida por 60 s.', cost: { gold: 140, wood: 40 }, requiresLevel: 1, effect: { buff: { resource: 'food', mult: 2, seconds: 60 } } },
  { id: 'buff_prosperity', tab: 'buffs', name: 'Prosperidade Real', desc: '+100% de ouro por 60 s.', cost: { food: 120, stone: 30 }, requiresLevel: 2, effect: { buff: { resource: 'gold', mult: 2, seconds: 60 } } },
];
