import { createRouter, createWebHashHistory } from "vue-router";
import { subscribeToAuthState } from "../services/auth";

import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import Profile from "../pages/Profile.vue";
import UserOnboarding from "../pages/UserOnboarding.vue";
import Register from "../pages/Register.vue";
import Publications from "../pages/Publications.vue";
import Publish from "../pages/CarPublish.vue";
import CarDetails from "../pages/CarDetails.vue";
import ProfileOwner from "../pages/ProfileOwner.vue";
import Admin from "../pages/admin/CarsValidation.vue";
import Users from "../pages/admin/Users.vue";
import PrivateChat from "../pages/PrivateChat.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/Login", component: Login },
  { path: "/Profile", component: Profile, meta: { needsAuth: true } },
  { path: "/Register", component: Register },
  { path: "/Publications", component: Publications },
  { path: "/Publish", component: Publish, meta: { needsAuth: true } },
  { path: "/Onboarding", component: UserOnboarding, meta: { needsAuth: true }},
  { path: "/CarDetails/:id", name: "CarDetails", component: CarDetails, props: true, meta: { needsAuth: true } },
  { path: "/ProfileOwner/:id", name: "ProfileOwner", component: ProfileOwner, props: true, meta: { needsAuth: true } },
  { path: "/ProfileOwner/:id/chat", name: "PrivateChat", component: PrivateChat, props: true, meta: { needsAuth: true } },
  { path: "/admin/CarsValidation", name: "CarsValidation", component: Admin, meta: { needsAuth: true, role: "admin" } },
  { path: "/admin/Users", name: "Users", component: Users, meta: { needsAuth: true, role: "admin" } },
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