import { createRouter, createWebHashHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import ShopView from "../views/ShopView.vue";
import MonetizationView from "../views/MonetizationView.vue";
import RoomView from "../views/RoomView.vue";

export const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView },
    { path: "/shop", name: "shop", component: ShopView },
    { path: "/monetization", name: "monetization", component: MonetizationView },
    { path: "/room", name: "room", component: RoomView },
  ],
});
