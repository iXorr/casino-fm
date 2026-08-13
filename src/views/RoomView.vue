<script setup lang="ts">
import { useGameStore } from "../stores/game";
import { ROOM_ITEMS } from "../config/monetization";

const store = useGameStore();
</script>

<template>
  <div class="row">
    <div class="col-lg-8 mx-auto">
      <div class="card">
        <div class="card-header">
          Украшения
        </div>
        <div class="card-body">
          <p class="text-muted mb-3">
            Купи украшения — они появятся на телеке на главной.
          </p>
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
</template>
