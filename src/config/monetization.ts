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
  { id: 1, title: "Неоновая вывеска", emoji: "💡", cost: 100 },
  { id: 2, title: "Бар", emoji: "🍸", cost: 250 },
  { id: 3, title: "Диван", emoji: "🛋️", cost: 500 },
  { id: 4, title: "Пальма", emoji: "🌴", cost: 800 },
  { id: 5, title: "Портрет Мелстроя", emoji: "🖼️", cost: 1500 },
  { id: 6, title: "Золотая статуя", emoji: "🗿", cost: 3000 },
];
