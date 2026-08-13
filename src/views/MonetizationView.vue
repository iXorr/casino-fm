<script setup lang="ts">
import { useGameStore } from "../stores/game";
import { VIP_COST } from "../config/monetization";

const store = useGameStore();
</script>

<template>
  <div class="row">
    <div class="col-lg-6 mx-auto">
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
              class="btn btn-outline-primary"
              :disabled="store.user.balance < VIP_COST"
              @click="store.buyVip()"
            >
              👑 Мелстрой Голд — {{ VIP_COST }} фишек
            </button>
            <span
              v-else
              class="badge text-bg-primary fs-6 py-2"
            >
              👑 Мелстрой Голд активен
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
