export type EventKind = "bonus" | "crisis" | "penalty" | "twist";

export type GameEvent = {
  id: string;
  kind: EventKind;
  title: string;
  description: string;
  duration_ms?: number;
  multiplier?: number;
  balance_loss?: number;
  gift?: { min: number; max: number };
};

export const EVENTS: GameEvent[] = [
  {
    id: "bonus_jackpot",
    kind: "bonus",
    title: "Джекпот",
    description: "x3 ко всем выигрышам",
    duration_ms: 30000,
    multiplier: 3,
  },
  {
    id: "crisis_luda",
    kind: "crisis",
    title: "Луда",
    description: "Азарт сгорел, часть фишек потеряна",
    balance_loss: 0.3,
  },
  {
    id: "penalty_ban",
    kind: "penalty",
    title: "Бан за шулерство",
    description: "Спины заблокированы",
    duration_ms: 10000,
  },
  {
    id: "twist_gift",
    kind: "twist",
    title: "Мелстрой кинул бабла",
    description: "Случайный донат фишек",
    gift: { min: 50, max: 200 },
  },
];

export const EVENT_INTERVAL = { min: 7500, max: 15000 };
