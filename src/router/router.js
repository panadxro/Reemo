import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore, useUserStore } from '@stores'

import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import UserOnboarding from "../pages/UserOnboarding.vue";
import Register from "../pages/Register.vue";
import Maps from "../pages/Maps.vue";
import Search from "../pages/Search.vue";
import Publish from "../pages/CarPublish.vue";
import CarDetails from "../pages/CarDetails.vue";
import AdminCars from "../pages/admin/Cars.vue";
import AdminUsers from "../pages/admin/Users.vue";
import PrivateChat from "../pages/PrivateChat.vue";
import UserProfile from "../pages/UserProfile.vue";
import NotFound from "../pages/NotFound.vue"
 
const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/login", component: Login, name: "Login" },
  { path: "/register", component: Register, name: "Register" },
  {
    path: "/:pathMatch(.*)*",
    component: NotFound,
    name: "NotFound",
    beforeEnter: (to) => {
      if (!to.matched.length) {
        return '/404'
      }
    },
   },
  { path: "/search", component: Search, name: "Search" },
  { path: "/maps", component: Maps },
  {
    path: "/onboarding",
    component: UserOnboarding,
    name: "onboarding",
    meta: { needsAuth: true },
  },
  {
    path: "/publish",
    component: Publish,
    name: "Publish",
    meta: { needsAuth: true },
  },
  {
    path: "/car/:id",
    name: "CarDetails",
    component: CarDetails,
    props: true,
  },
  {
    path: "/user/:id",
    name: "UserProfile",
    component: UserProfile,
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needsAuth: true },
    children: [
      {
        path: "chat",
        name: "PrivateChat",
        component: PrivateChat,
        meta: { needsAuth: true },
      },
    ],
  },
  {
    path: "/admin",
    name: "Admin",
    meta: { needsAuth: true, role: "admin" },
    children: [
      {
        path: "cars",
        name: "AdminCars",
        component: AdminCars,
      },
      {
        path: "users",
        name: "AdminUsers",
        component: AdminUsers,
      }
    ],
  },
];

const router = createRouter({
  routes,
  history: createWebHistory(),
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

/* router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  // Esperar que se resuelva el estado de autenticacion del usuario
  if (!authStore.isInitialiazed) {
    await new Promise((resolve) => {
      const unsubscribe = authStore.$subscribe((mutation, state) => {
        if (state.isInitialiazed) {
          unsubscribe();
          resolve();
        }
      });
    });
  }
  // Si el usuario está logueado
  if (authStore.isLoggedIn) {
    // if (to.meta.isLogin) return "/" // Esto es dudoso "isLogin"
    console.log("Hola" + to.meta.isLogin)
    return true;
  }
  // Si no requiere auth, sigue adelante
  if (!to.meta.needsAuth) return true;
  // Si el usuario no esta logueado y requiere auth
  if (to.meta.needsAdmin) {
    const userStore = useUserStore();
    await userStore.loadUserProfile(authStore.user.id);
    if (to.meta.role && userStore.profileData.role !== to.meta.role) {
      return {
        path: "/",
      };
    }
  }
  return "/login";
}); */

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Si el usuario está logueado, permite la navegación
  if (authStore.isLoggedIn) {
      return true;
  }
  // Si no esta logueado pero el authstore esta inicializado
  else {
      // Si no requiere auth, continúa con getCurrentUser
      if (!to.meta.needsAuth) {
          return true;
      }
      // Si la ruta requiere autenticación, y el store esta inicializado, redirige a /login
      if (to.meta.needsAuth && !authStore.isInitialiazed) {
        
          return { path: "/login", query: { redirect: to.fullPath } };
      }
  }
if (to.meta.needsAdmin) {
  const userStore = useUserStore();
  await userStore.loadUserProfile(authStore.user.id);
  if (to.meta.role && userStore.profileData.role !== to.meta.role) {
    return {
      path: "/",
    };
  }
}
})

export default router;