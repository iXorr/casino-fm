import type { Heat } from "../entities/Heat";
import type { Upgrade } from "../entities/Upgrade";

export const DEFAULT_HEAT: Heat = {
  click_value: 1,
  min: 1,
  max: 10,
  step_increase: 0.08,
  step_decrease: 1,
  decrease_timeout: 900,
};

export type Stage = {
  id: number;
  name: string;
  description: string;
  unlock_balance: number;
};

export const STAGES: Stage[] = [
  { id: 1, name: "Новичок", description: "Первые шаги в казино", unlock_balance: 0 },
  { id: 2, name: "Завсегдатай", description: "Тебя уже знают в зале", unlock_balance: 250 },
  { id: 3, name: "Хайроллер", description: "Крупные ставки, большие риски", unlock_balance: 1000 },
  { id: 4, name: "Легенда стрима", description: "Мелстрой жмёт тебе руку", unlock_balance: 5000 },
];

export const UPGRADES: Upgrade[] = [
  { id: 1, title: "Повышение ставки", cost: 10, stage: 1, modifier: { click_value: 1 } },
  { id: 2, title: "Быстрый разогрев", cost: 25, stage: 1, modifier: { step_increase: 0.25 } },
  { id: 3, title: "Термос", cost: 50, stage: 1, modifier: { min: 4 } },
  { id: 4, title: "Авто-спин", cost: 100, stage: 1, effect: { kind: "auto_spin", per_second: 2 } },
  {
    id: 5,
    title: "Джекпот",
    cost: 200,
    stage: 1,
    effect: { kind: "jackpot", chance: 0.1, multiplier: 10 },
  },
  { id: 6, title: "VIP-стол", cost: 500, stage: 2, modifier: { click_value: 5 } },
  { id: 7, title: "Мега-спин", cost: 800, stage: 2, effect: { kind: "auto_spin", per_second: 8 } },
  { id: 8, title: "Крупье", cost: 1500, stage: 3, modifier: { step_increase: 1 } },
  { id: 9, title: "Хайроллер", cost: 2000, stage: 3, modifier: { max: 10 } },
  {
    id: 10,
    title: "Бриллиантовые руки",
    cost: 5000,
    stage: 4,
    effect: { kind: "jackpot", chance: 0.2, multiplier: 25 },
  },
];
