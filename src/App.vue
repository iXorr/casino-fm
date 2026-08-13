<script setup lang="ts">
import { computed, onMounted, onUnmounted } from "vue";
import { useGameStore } from "./stores/game";
import { STAGES, UPGRADES } from "./config/game";
import { ROOM_ITEMS, VIP_COST } from "./config/monetization";

const store = useGameStore();

const heatPercent = computed(() => {
  const { min, max } = store.effectiveHeat;
  const range = max - min || 1;
  return Math.max(0, Math.min(100, ((store.user.current_heat - min) / range) * 100));
});

const stagePercent = computed(() => {
  const next = store.nextStage;
  if (!next) return 100;
  return Math.min(100, (store.user.balance / next.unlock_balance) * 100);
});

const stageName = (id: number) => STAGES.find((s) => s.id === id)?.name ?? `Этап ${id}`;

const reset = () => {
  if (window.confirm("Сбросить весь прогресс?")) {
    store.resetGame();
  }
};

const fmt = (n: number) => Math.floor(n);

const toastColor = (variant: string) => {
  switch (variant) {
  case "bonus":
    return "success";
  case "crisis":
    return "danger";
  case "penalty":
    return "warning";
  case "twist":
    return "info";
  case "upgrade":
    return "primary";
  case "ad":
    return "info";
  case "vip":
    return "warning";
  case "room":
    return "success";
  default:
    return "secondary";
  }
};

onMounted(() => store.startLoop());
onUnmounted(() => store.stopLoop());
</script>

<template>
  <div class="container py-4">
    <h1 class="mb-1">
      Казино Мелстроя
    </h1>
    <p class="text-muted">
      Этап {{ store.currentStage.id }}: {{ store.currentStage.name }} —
      {{ store.currentStage.description }}
    </p>

    <div class="d-flex gap-2 align-items-center mb-3">
      <button
        type="button"
        class="btn btn-sm btn-outline-danger"
        @click="reset"
      >
        Сбросить прогресс
      </button>
    </div>

    <div
      class="toast-container position-fixed top-0 end-0 p-3"
      style="z-index: 1050"
    >
      <div
        v-for="n in store.notices"
        :key="n.id"
        class="toast show mb-2"
        role="alert"
      >
        <div class="toast-header">
          <span
            class="badge me-auto"
            :class="`text-bg-${toastColor(n.variant)}`"
          >
            {{ n.label }}
          </span>
          <button
            type="button"
            class="btn-close"
            @click="store.dismissNotice(n.id)"
          />
        </div>
        <div class="toast-body">
          {{ n.message }}
        </div>
      </div>
    </div>

    <div
      v-if="store.nextStage"
      class="mb-3"
    >
      <small class="text-muted">
        До этапа «{{ store.nextStage.name }}»: {{ fmt(store.user.balance) }}/{{ store.nextStage.unlock_balance }}
      </small>
      <div
        class="progress"
        style="height: 8px"
      >
        <div
          class="progress-bar bg-warning"
          :style="{ width: stagePercent + '%' }"
        />
      </div>
    </div>

    <div class="row g-3">
      <div class="col-md-6">
        <div class="card">
          <div class="card-body text-center">
            <h2 class="display-4">
              {{ fmt(store.user.balance) }}
            </h2>
            <p class="text-muted mb-2">
              фишек
            </p>

            <div class="mb-3">
              <div
                class="progress"
                style="height: 20px"
              >
                <div
                  class="progress-bar bg-danger"
                  role="progressbar"
                  :style="{ width: heatPercent + '%' }"
                >
                  {{ store.user.current_heat.toFixed(2) }}x
                </div>
              </div>
              <small class="text-muted">
                азарт {{ store.effectiveHeat.min }}–{{ store.effectiveHeat.max }}x
                <span
                  v-if="store.boostMultiplier > 1"
                  class="badge text-bg-success ms-1"
                >
                  x{{ store.boostMultiplier }}
                </span>
              </small>
            </div>

            <button
              type="button"
              class="btn btn-danger btn-lg rounded-circle"
              style="width: 200px; height: 200px; font-size: 2rem"
              :disabled="store.spinBlocked"
              @click="store.spin()"
            >
              {{ store.spinBlocked ? "ЗАБАНЕН" : "КРУТИТЬ" }}
            </button>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Магазин
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="u in UPGRADES"
              :key="u.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div>{{ u.title }}</div>
                <small class="text-muted">{{ u.cost }} фишек</small>
              </div>
              <button
                v-if="u.stage <= store.currentStage.id"
                type="button"
                class="btn btn-sm"
                :class="
                  store.user.owned_upgrades.includes(u.id)
                    ? 'btn-success'
                    : 'btn-outline-primary'
                "
                :disabled="
                  store.user.owned_upgrades.includes(u.id) || store.user.balance < u.cost
                "
                @click="store.buyUpgrade(u.id)"
              >
                {{ store.user.owned_upgrades.includes(u.id) ? "Куплено" : "Купить" }}
              </button>
              <span
                v-else
                class="badge text-bg-secondary"
              >
                {{ stageName(u.stage) }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="row g-3 mt-0">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Монетизация
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <button
                type="button"
                class="btn btn-outline-primary"
                :disabled="store.adCooldown > 0"
                @click="store.watchAd()"
              >
                {{ store.adCooldown > 0 ? `Реклама через ${store.adCooldown}с` : "📺 Посмотреть рекламу" }}
              </button>
              <button
                v-if="!store.isVip"
                type="button"
                class="btn btn-outline-warning"
                :disabled="store.user.balance < VIP_COST"
                @click="store.buyVip()"
              >
                👑 Мелстрой Голд — {{ VIP_COST }} фишек
              </button>
              <span
                v-else
                class="badge text-bg-warning fs-6 py-2"
              >
                👑 Мелстрой Голд активен
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            Комната
          </div>
          <ul class="list-group list-group-flush">
            <li
              v-for="item in ROOM_ITEMS"
              :key="item.id"
              class="list-group-item d-flex justify-content-between align-items-center"
            >
              <div>
                <div>{{ item.emoji }} {{ item.title }}</div>
                <small class="text-muted">{{ item.cost }} фишек</small>
              </div>
              <button
                type="button"
                class="btn btn-sm"
                :class="
                  store.user.owned_room.includes(item.id)
                    ? 'btn-success'
                    : 'btn-outline-primary'
                "
                :disabled="
                  store.user.owned_room.includes(item.id) || store.user.balance < item.cost
                "
                @click="store.buyRoomItem(item.id)"
              >
                {{ store.user.owned_room.includes(item.id) ? "Куплено" : "Купить" }}
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
