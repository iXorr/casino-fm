<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { useGameStore } from "./stores/game";

const store = useGameStore();
const menuOpen = ref(false);

const reset = () => {
  if (window.confirm("Сбросить весь прогресс?")) {
    store.resetGame();
  }
};

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
  <div class="d-flex flex-column min-vh-100">
    <nav class="navbar navbar-light bg-light border-bottom">
      <div class="container d-flex align-items-center">
        <div class="nav-side">
          <button
            class="navbar-toggler"
            type="button"
            aria-label="Меню"
            @click="menuOpen = true"
          >
            <span class="navbar-toggler-icon" />
          </button>
        </div>
        <RouterLink
          class="navbar-brand mx-auto text-center"
          to="/"
        >
          Бурмалда FM
        </RouterLink>
        <div class="nav-side d-flex justify-content-end">
          <span class="navbar-text text-dark fw-bold text-nowrap">
            🎰 {{ Math.floor(store.user.balance) }}
          </span>
        </div>
      </div>
    </nav>

    <div
      class="offcanvas offcanvas-start"
      tabindex="-1"
      :class="{ show: menuOpen }"
    >
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">
          Меню
        </h5>
        <button
          type="button"
          class="btn-close"
          aria-label="Закрыть"
          @click="menuOpen = false"
        />
      </div>
      <div class="offcanvas-body">
        <ul class="navbar-nav gap-2">
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              exact-active-class="active"
              to="/"
              @click="menuOpen = false"
            >
              Игра
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              active-class="active"
              to="/shop"
              @click="menuOpen = false"
            >
              Магазин
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              active-class="active"
              to="/monetization"
              @click="menuOpen = false"
            >
              Монетизация
            </RouterLink>
          </li>
          <li class="nav-item">
            <RouterLink
              class="nav-link"
              active-class="active"
              to="/room"
              @click="menuOpen = false"
            >
              Украшения
            </RouterLink>
          </li>
        </ul>
        <button
          type="button"
          class="btn btn-outline-danger mt-3"
          @click="reset"
        >
          Сбросить прогресс
        </button>
      </div>
    </div>

    <div
      v-if="menuOpen"
      class="offcanvas-backdrop fade show"
      @click="menuOpen = false"
    />

    <div class="container py-4 d-flex flex-column flex-grow-1">
      <RouterView v-slot="{ Component }">
        <Transition
          name="fade"
          mode="out-in"
        >
          <component :is="Component" />
        </Transition>
      </RouterView>
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
  </div>
</template>

<style scoped>
.nav-side {
  flex: 1 1 0;
  min-width: 0;
}

.offcanvas .nav-link.active {
  color: var(--bs-primary);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
