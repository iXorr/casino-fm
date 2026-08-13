import { computed, ref } from "vue";
import { defineStore } from "pinia";
import type { Heat } from "../entities/Heat";
import type { Upgrade } from "../entities/Upgrade";
import type { User } from "../entities/User";
import { DEFAULT_HEAT, STAGES, UPGRADES } from "../config/game";
import { EVENTS, EVENT_INTERVAL, type EventKind } from "../config/events";
import { AD_COOLDOWN, AD_REWARD_BASE, ROOM_ITEMS, VIP_COST } from "../config/monetization";
import { MEMES, type Meme } from "../config/memes";

function createDefaultUser(): User {
  return {
    balance: 0,
    heat: { ...DEFAULT_HEAT },
    current_heat: DEFAULT_HEAT.min,
    owned_upgrades: [],
    vip: false,
    owned_room: [],
  };
}

function applyModifiers(base: Heat, mods: Partial<Heat>[]): Heat {
  const result: Heat = { ...base };

  for (const mod of mods) {
    (Object.keys(mod) as (keyof Heat)[]).forEach((key) => {
      const value = mod[key];
      if (value !== undefined) {
        result[key] = (result[key] as number) + value;
      }
    });
  }

  return result;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type NoticeVariant = EventKind | "upgrade" | "ad" | "vip" | "room";

type Notice = {
  id: number;
  label: string;
  message: string;
  variant: NoticeVariant;
};

const EVENT_LABELS: Record<EventKind, string> = {
  bonus: "БОНУС",
  crisis: "КРИЗИС",
  penalty: "ШТРАФ",
  twist: "МЕМ",
};

const HEAT_LABELS: Record<keyof Heat, string> = {
  click_value: "ставка",
  min: "мин. азарт",
  max: "макс. азарт",
  step_increase: "разогрев",
  step_decrease: "остывание",
  decrease_timeout: "таймаут остывания",
};

function describeUpgrade(upgrade: Upgrade): string {
  if (upgrade.modifier) {
    const parts = (Object.entries(upgrade.modifier) as [keyof Heat, number][])
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${HEAT_LABELS[key] ?? key} +${value}`);
    if (parts.length) {
      return parts.join(", ");
    }
  }

  if (upgrade.effect?.kind === "auto_spin") {
    return `+${upgrade.effect.per_second} фишек/сек`;
  }

  if (upgrade.effect?.kind === "jackpot") {
    return `шанс ${upgrade.effect.chance * 100}% на x${upgrade.effect.multiplier}`;
  }

  return "";
}

export const useGameStore = defineStore(
  "game",
  () => {
    const user = ref<User>(createDefaultUser());
    const lastSpinAt = ref(0);

    const boostMultiplier = ref(1);
    const boostUntil = ref(0);

    const spinBlocked = ref(false);
    const blockedUntil = ref(0);

    const adCooldown = ref(0);

    const tv = ref<Meme | null>(null);
    let broadcastTimeout: ReturnType<typeof setTimeout> | null = null;

    const notices = ref<Notice[]>([]);
    const nextEventAt = ref(Date.now() + randomInt(EVENT_INTERVAL.min, EVENT_INTERVAL.max));

    let noticeSeq = 0;

    const dismissNotice = (id: number) => {
      notices.value = notices.value.filter((n) => n.id !== id);
    };

    const showNotice = (
      label: string,
      message: string,
      variant: NoticeVariant,
      duration: number,
    ) => {
      const id = ++noticeSeq;
      notices.value.push({ id, label, message, variant });
      setTimeout(() => dismissNotice(id), duration);
    };

    const endBroadcast = () => {
      tv.value = null;
      if (broadcastTimeout !== null) {
        clearTimeout(broadcastTimeout);
        broadcastTimeout = null;
      }
    };

    const broadcast = (memeId: string, duration = 4000) => {
      const meme = MEMES[memeId];
      if (!meme) return;

      endBroadcast();
      tv.value = meme;

      if (meme.kind !== "video") {
        broadcastTimeout = setTimeout(endBroadcast, meme.duration ?? duration);
      }
    };

    let loopId: ReturnType<typeof setInterval> | null = null;

    const ownedUpgrades = computed(() =>
      UPGRADES.filter((u) => user.value.owned_upgrades.includes(u.id)),
    );

    const effectiveHeat = computed<Heat>(() =>
      applyModifiers(
        user.value.heat,
        ownedUpgrades.value.map((u) => u.modifier ?? {}),
      ),
    );

    const jackpot = computed(() => {
      const effect = ownedUpgrades.value.find((u) => u.effect?.kind === "jackpot")?.effect;
      return effect?.kind === "jackpot" ? effect : null;
    });

    const passivePerSecond = computed(() => {
      const base = ownedUpgrades.value.reduce((sum, u) => {
        if (u.effect?.kind === "auto_spin") {
          return sum + u.effect.per_second;
        }
        return sum;
      }, 0);

      return isVip.value ? base * 2 : base;
    });

    const isVip = computed(() => user.value.vip);

    const currentStage = computed(() => {
      const reached = STAGES.filter((s) => user.value.balance >= s.unlock_balance);
      return reached[reached.length - 1] ?? STAGES[0];
    });

    const nextStage = computed(() => {
      const next = STAGES.find((s) => s.id === currentStage.value.id + 1);
      return next ?? null;
    });

    const availableUpgrades = computed(() =>
      UPGRADES.filter((u) => u.stage <= currentStage.value.id),
    );

    const applyGain = (baseGain: number): number => {
      if (spinBlocked.value) return 0;

      const heat = effectiveHeat.value;
      let gain = baseGain * user.value.current_heat;

      const jp = jackpot.value;
      if (jp && Math.random() < jp.chance) {
        gain *= jp.multiplier;
        broadcast("strong_effect");
      }

      gain *= boostMultiplier.value;

      const prevHeat = user.value.current_heat;
      user.value.balance += gain;
      const nextHeat = Math.min(user.value.current_heat + heat.step_increase, heat.max);
      user.value.current_heat = nextHeat;
      if (prevHeat < heat.max && nextHeat >= heat.max) {
        broadcast("max_heat");
      }
      lastSpinAt.value = Date.now();

      return gain;
    };

    const spin = () => {
      applyGain(effectiveHeat.value.click_value);
    };

    const boostHeat = () => {
      if (spinBlocked.value) return;

      const heat = effectiveHeat.value;
      const prevHeat = user.value.current_heat;
      const nextHeat = Math.min(prevHeat + heat.step_increase * 2, heat.max);
      user.value.current_heat = nextHeat;
      if (prevHeat < heat.max && nextHeat >= heat.max) {
        broadcast("max_heat");
      }
      lastSpinAt.value = Date.now();
    };

    const buyUpgrade = (id: number) => {
      const upgrade = UPGRADES.find((u) => u.id === id);
      if (!upgrade) return;
      if (user.value.owned_upgrades.includes(id)) return;
      if (user.value.balance < upgrade.cost) return;

      user.value.balance -= upgrade.cost;
      user.value.owned_upgrades.push(id);

      const effect = describeUpgrade(upgrade);
      const message = effect
        ? `Куплено «${upgrade.title}» — ${effect}`
        : `Куплено «${upgrade.title}»`;
      showNotice("УЛУЧШЕНИЕ", message, "upgrade", 4000);
    };

    const watchAd = () => {
      if (adCooldown.value > 0) return;

      const reward = AD_REWARD_BASE * currentStage.value.id;
      user.value.balance += reward;
      adCooldown.value = AD_COOLDOWN;
      showNotice("РЕКЛАМА", `Просмотр рекламы: +${reward} фишек`, "ad", 4000);
    };

    const buyVip = () => {
      if (isVip.value) return;
      if (user.value.balance < VIP_COST) return;

      user.value.balance -= VIP_COST;
      user.value.vip = true;
      showNotice(
        "ПРЕМИУМ",
        "Мелстрой Голд активирован: пассивный доход x2, защита от бана",
        "vip",
        5000,
      );
    };

    const buyRoomItem = (id: number) => {
      const item = ROOM_ITEMS.find((i) => i.id === id);
      if (!item) return;
      if (user.value.owned_room.includes(id)) return;
      if (user.value.balance < item.cost) return;

      user.value.balance -= item.cost;
      user.value.owned_room.push(id);
      showNotice("УКРАШЕНИЕ", `Куплено «${item.title}»`, "room", 4000);
    };

    const fireEvent = () => {
      const event = EVENTS[Math.floor(Math.random() * EVENTS.length)];
      const now = Date.now();

      switch (event.kind) {
      case "bonus":
        boostMultiplier.value = event.multiplier ?? 2;
        boostUntil.value = now + (event.duration_ms ?? 30000);
        showNotice(
          EVENT_LABELS[event.kind],
          `${event.title} — ${event.description}`,
          event.kind,
          5000,
        );
        broadcast("strong_effect");
        break;

      case "penalty":
        if (isVip.value) {
          showNotice("ПРЕМИУМ", "Бан отменён подпиской «Мелстрой Голд»", "vip", 4000);
          break;
        }
        spinBlocked.value = true;
        blockedUntil.value = now + (event.duration_ms ?? 10000);
        showNotice(
          EVENT_LABELS[event.kind],
          `${event.title} — ${event.description}`,
          event.kind,
          5000,
        );
        broadcast("debuff");
        break;

      case "crisis":
        user.value.current_heat = effectiveHeat.value.min;
        user.value.balance = Math.max(
          0,
          Math.floor(user.value.balance * (1 - (event.balance_loss ?? 0.3))),
        );
        showNotice(
          EVENT_LABELS[event.kind],
          `${event.title} — ${event.description}`,
          event.kind,
          4000,
        );
        broadcast("debuff");
        break;

      case "twist": {
        const amount = randomInt(event.gift?.min ?? 50, event.gift?.max ?? 200);
        user.value.balance += amount;
        showNotice(
          EVENT_LABELS[event.kind],
          `${event.title} — ${event.description}: +${amount} фишек`,
          event.kind,
          4000,
        );
        broadcast("mem");
        break;
      }
      }
    };

    const tick = () => {
      const now = Date.now();
      const heat = effectiveHeat.value;

      if (lastSpinAt.value > 0 && now - lastSpinAt.value >= heat.decrease_timeout) {
        user.value.current_heat = Math.max(user.value.current_heat - heat.step_decrease, heat.min);
      }

      const pps = passivePerSecond.value;
      if (pps > 0) {
        user.value.balance += pps;
      }

      if (adCooldown.value > 0) {
        adCooldown.value -= 1;
      }

      if (boostMultiplier.value > 1 && now >= boostUntil.value) {
        boostMultiplier.value = 1;
      }

      if (spinBlocked.value && now >= blockedUntil.value) {
        spinBlocked.value = false;
      }

      if (now >= nextEventAt.value) {
        fireEvent();
        nextEventAt.value = now + randomInt(EVENT_INTERVAL.min, EVENT_INTERVAL.max);
      }
    };

    const normalizeUser = () => {
      user.value = {
        ...createDefaultUser(),
        ...user.value,
        vip: user.value.vip ?? false,
        owned_room: user.value.owned_room ?? [],
      };
    };

    const startLoop = () => {
      normalizeUser();
      if (loopId !== null) return;
      loopId = setInterval(tick, 1000);
    };

    const stopLoop = () => {
      if (loopId !== null) {
        clearInterval(loopId);
        loopId = null;
      }
    };

    const resetGame = () => {
      user.value = createDefaultUser();
      lastSpinAt.value = 0;
      boostMultiplier.value = 1;
      boostUntil.value = 0;
      spinBlocked.value = false;
      blockedUntil.value = 0;
      adCooldown.value = 0;
      notices.value = [];
      endBroadcast();
      nextEventAt.value = Date.now() + randomInt(EVENT_INTERVAL.min, EVENT_INTERVAL.max);
      localStorage.removeItem("game");
    };

    return {
      user,
      lastSpinAt,
      boostMultiplier,
      spinBlocked,
      notices,
      dismissNotice,
      tv,
      broadcast,
      endBroadcast,
      ownedUpgrades,
      effectiveHeat,
      jackpot,
      passivePerSecond,
      isVip,
      adCooldown,
      currentStage,
      nextStage,
      availableUpgrades,
      spin,
      buyUpgrade,
      watchAd,
      buyVip,
      buyRoomItem,
      boostHeat,
      fireEvent,
      tick,
      startLoop,
      stopLoop,
      resetGame,
    };
  },
  {
    persist: {
      key: "game",
      pick: ["user"],
    },
  },
);
