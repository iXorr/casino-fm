import type { Heat } from "./Heat";

export type UpgradeEffect =
  | { kind: "auto_spin"; per_second: number }
  | { kind: "jackpot"; chance: number; multiplier: number };

export type Upgrade = {
  id: number;
  title: string;
  cost: number;
  stage: number;
  modifier?: Partial<Heat>;
  effect?: UpgradeEffect;
};
