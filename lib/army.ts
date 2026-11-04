import type { Cost } from './types';

export const ARMY_UNLOCK_LEVEL = 2;
export const SOLDIERS_PER_TRAINING = 3;
export const MAX_SOLDIERS = 30;
export const MAX_ARMY_LEVEL = 5;

export const SOLDIER_TRAINING_COST: Cost = {
  gold: 300,
  food: 180,
  wood: 220,
  stone: 180,
};

export function getArmyUpgradeCost(level: number): Cost {
  const multiplier = level + 1;
  return {
    gold: 650 * multiplier,
    food: 350 * multiplier,
    wood: 450 * multiplier,
    stone: 500 * multiplier,
  };
}
