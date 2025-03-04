import { createRouter, createWebHashHistory } from "vue-router";
import { subscribeToAuthState } from "../services/auth";

import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Profile from "../pages/Profile.vue";
import UserOnboarding from "../pages/UserOnboarding.vue";
import Register from "../pages/Register.vue";
import Search from "../pages/Search.vue";
import Publish from "../pages/CarPublish.vue";
import CarDetails from "../pages/CarDetails.vue";
import ProfileOwner from "../pages/ProfileOwner.vue";
import AdminCars from "../pages/admin/Cars.vue";
import AdminUsers from "../pages/admin/Users.vue";
import PrivateChat from "../pages/PrivateChat.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/Login", component: Login },
  { path: "/Profile", component: Profile, meta: { needsAuth: true } },
  { path: "/Register", component: Register },
  { path: "/Search", component: Search },
  { path: "/Publish", component: Publish, meta: { needsAuth: true } },
  { path: "/Onboarding", component: UserOnboarding, meta: { needsAuth: true }},
  { path: "/CarDetails/:id", name: "CarDetails", component: CarDetails, props: true, meta: { needsAuth: true } },
  { path: "/ProfileOwner/:id", name: "ProfileOwner", component: ProfileOwner, props: true, meta: { needsAuth: true } },
  { path: "/ProfileOwner/:id/chat", name: "PrivateChat", component: PrivateChat, props: true, meta: { needsAuth: true } },
  { path: "/admin/Cars", name: "Cars", component: AdminCars, meta: { needsAuth: true, role: "admin" } },
  { path: "/admin/Users", name: "Users", component: AdminUsers, meta: { needsAuth: true, role: "admin" } },
];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

let loggedUser = {
  id: null,
  email: null,
  userName: null,
  name: null,
  lastName: null,
  role: null,
};

// Subscribe to auth state changes
subscribeToAuthState((newUserData) => (loggedUser = newUserData));

router.beforeEach((to) => {
  if (to.meta.needsAuth && loggedUser.id == null) {
    return {
      path: "/Login",
    };
  }

  if (to.meta.role && loggedUser.role !== to.meta.role) {
    return {
      path: "/",
    };
  }
});

export default router;