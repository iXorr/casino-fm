export const AD_REWARD_BASE = 50;
export const AD_COOLDOWN = 45;
export const VIP_COST = 500;

export type RoomItem = {
  id: number;
  title: string;
  emoji: string;
  cost: number;
};

export const ROOM_ITEMS: RoomItem[] = [
  { id: 1, title: "Золотая монета", emoji: "🪙", cost: 10000 },
  { id: 2, title: "Бриллиант 5 карат", emoji: "💎", cost: 50000 },
  { id: 3, title: "Бриллиантовое кольцо 15 карат", emoji: "💍", cost: 250000 },
  { id: 4, title: "Золотая корона", emoji: "👑", cost: 1000000 },
  { id: 5, title: "Мистический хрусталь", emoji: "🔮", cost: 5000000 },
];
