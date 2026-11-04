export type ResourceKey = 'gold' | 'food' | 'wood' | 'stone';
export type Role = 'farmer' | 'miner' | 'builder' | 'warrior';
export type Cost = Partial<Record<ResourceKey, number>>;
export type ShopTab = 'buildings' | 'upgrades' | 'buffs';

export interface ShopItem {
  id: string;
  tab: ShopTab;
  name: string;
  desc: string;
  cost: Cost;
  max?: number;
  requiresLevel?: number; // nível do reino necessário
  effect?: {
    capacity?: number; // + habitantes
    setLevel?: number; // evolui o reino
    production?: Partial<Record<ResourceKey, number>>;
    buff?: { resource: ResourceKey; mult: number; seconds: number };
  };
}

export interface Traveler {
  id: string;
  name: string;
  pitch: string; // fala do diálogo de recrutamento
  preferred: Role;
}
