<script setup lang="ts">
import { useGameStore } from "../stores/game";
import { STAGES, UPGRADES } from "../config/game";

const store = useGameStore();

const stageName = (id: number) => STAGES.find((s) => s.id === id)?.name ?? `Этап ${id}`;
</script>

<template>
  <div class="row">
    <div class="col-lg-8 mx-auto">
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
</template>
