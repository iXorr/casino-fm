import type { Heat } from "./Heat";

export type User = {
  balance: number;
  heat: Heat;
  current_heat: number;
  owned_upgrades: number[];
  vip: boolean;
  owned_room: number[];
};
