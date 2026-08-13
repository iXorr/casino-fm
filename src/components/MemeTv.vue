<script setup lang="ts">
import { computed } from "vue";
import { useGameStore } from "../stores/game";
import { ROOM_ITEMS } from "../config/monetization";

const store = useGameStore();

const ownedDecor = computed(() =>
  ROOM_ITEMS.filter((item) => store.user.owned_room.includes(item.id)),
);
</script>

<template>
  <div class="tv">
    <div
      class="tv-screen"
      :class="{ 'tv-on': store.tv }"
    >
      <template v-if="store.tv">
        <p
          v-if="store.tv.kind === 'text'"
          class="tv-text"
        >
          {{ store.tv.text }}
        </p>
        <img
          v-else-if="store.tv.kind === 'image'"
          class="tv-media"
          :src="store.tv.media"
          alt=""
        >
        <video
          v-else-if="store.tv.kind === 'video'"
          class="tv-media"
          :src="store.tv.media"
          autoplay
          loop
          muted
        />
        <span class="tv-title">{{ store.tv.title }}</span>
      </template>
      <template v-else>
        <span class="tv-offline" />
      </template>
    </div>
    <div
      v-if="ownedDecor.length"
      class="tv-decor"
    >
      <span
        v-for="d in ownedDecor"
        :key="d.id"
        class="decor-item"
      >
        {{ d.emoji }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.tv {
  width: 420px;
  max-width: 100%;
  background: #343a40;
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25);
}

.tv-screen {
  aspect-ratio: 16 / 9;
  border-radius: 8px;
  background: #0a0a0a;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  border: 3px solid #212529;
}

.tv-on {
  animation: tv-glow 0.4s ease;
  box-shadow: inset 0 0 24px rgba(255, 60, 60, 0.6);
}

.tv-text {
  color: #fff;
  font-size: 1.3rem;
  font-weight: 800;
  text-align: center;
  padding: 0 12px;
  text-shadow: 0 0 12px rgba(255, 0, 0, 0.8);
  margin: 0;
}

.tv-title {
  position: absolute;
  bottom: 6px;
  color: #ffc107;
  font-size: 0.7rem;
  letter-spacing: 1px;
}

.tv-offline {
  color: #6c757d;
  font-size: 0.9rem;
}

.tv-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tv-decor {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 10px;
}

.decor-item {
  font-size: 1.4rem;
  line-height: 1;
}

@keyframes tv-glow {
  from {
    box-shadow: inset 0 0 0 rgba(255, 60, 60, 0);
  }
  to {
    box-shadow: inset 0 0 24px rgba(255, 60, 60, 0.6);
  }
}
</style>
