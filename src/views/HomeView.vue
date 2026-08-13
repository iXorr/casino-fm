<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { useGameStore } from "../stores/game";
import MemeTv from "../components/MemeTv.vue";

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

const fmt = (n: number) => Math.floor(n);

const rotation = ref(0);
const pulsing = ref(false);

let currentAngle = 0;
let targetAngle = 0;
let rafId: number | null = null;

const animate = () => {
  const delta = targetAngle - currentAngle;
  if (Math.abs(delta) < 0.5) {
    currentAngle = targetAngle;
    rotation.value = currentAngle;
    rafId = null;
    return;
  }
  currentAngle += delta * 0.12;
  rotation.value = currentAngle;
  rafId = requestAnimationFrame(animate);
};

const onSpin = () => {
  targetAngle += 360;
  store.spin();
  if (rafId === null) {
    animate();
  }
};

const onBoost = () => {
  pulsing.value = false;
  requestAnimationFrame(() => {
    pulsing.value = true;
  });
  window.setTimeout(() => {
    pulsing.value = false;
  }, 600);
  store.boostHeat();
};

onUnmounted(() => {
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
});
</script>

<template>
  <div class="flex-grow-1 d-flex flex-column justify-content-center">
    <p class="text-muted text-center mb-4">
      Этап {{ store.currentStage.id }}: {{ store.currentStage.name }} —
      {{ store.currentStage.description }}
    </p>

    <div class="game-area">
      <div class="d-flex flex-wrap justify-content-center align-items-center gap-4">
        <MemeTv />
        <div class="d-flex justify-content-center align-items-center gap-4">
          <div class="d-flex flex-column align-items-center">
            <div class="mb-2 fw-bold fs-4">
              🎰 {{ fmt(store.user.balance) }}
            </div>
            <div class="wheel-wrap position-relative">
              <div
                class="wheel-spin"
                :style="{ transform: `rotate(${rotation}deg)` }"
              >
                <div
                  class="wheel-pulse"
                  :class="{ pulsing }"
                >
                  <div class="wheel-glow" />
                  <img
                    class="wheel"
                    src="/roulette.png"
                    alt="Рулетка"
                    @click="onSpin"
                    @dblclick.prevent="onBoost"
                  >
                </div>
              </div>
            </div>
          </div>

          <div class="thermo">
            <div class="thermo-tube">
              <div
                class="thermo-fill"
                :style="{ height: heatPercent + '%' }"
              />
            </div>
            <div class="thermo-bulb" />
            <div class="thermo-value fw-bold mt-1">
              {{ store.user.current_heat.toFixed(1) }}x
            </div>
          </div>
        </div>
      </div>

      <div
        v-if="store.nextStage"
        class="mt-3"
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
    </div>
  </div>
</template>

<style scoped>
.game-area {
  width: fit-content;
  max-width: 100%;
  margin: 0 auto;
}

.thermo {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.thermo-tube {
  position: relative;
  width: 22px;
  height: 180px;
  border-radius: 11px;
  background: #f1f1f1;
  border: 2px solid #ced4da;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.thermo-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  background: linear-gradient(180deg, #ff7a7a, #dc3545);
  transition: height 0.3s ease;
}

.thermo-bulb {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: #dc3545;
  border: 2px solid #ced4da;
  margin-top: -3px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.thermo-value {
  font-size: 0.9rem;
  min-width: 3.5rem;
  text-align: center;
}

.wheel-wrap {
  width: 260px;
  height: 260px;
}

.wheel-spin {
  width: 100%;
  height: 100%;
}

.wheel-pulse {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
}

.wheel-glow {
  position: absolute;
  inset: -6px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 193, 7, 0.6) 0%, rgba(255, 193, 7, 0) 70%);
  opacity: 0;
  z-index: 0;
}

.wheel-pulse.pulsing .wheel-glow {
  animation: glow 0.6s ease;
}

.wheel {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  user-select: none;
  cursor: pointer;
  -webkit-user-drag: none;
  -webkit-tap-highlight-color: transparent;
  -webkit-touch-callout: none;
  touch-action: manipulation;
}

@keyframes glow {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
