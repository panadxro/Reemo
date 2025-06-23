import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";
import Login from "../pages/Login.vue";
import UserOnboarding from "../pages/UserOnboarding.vue";
import CarRegister from "../pages/CarRegister.vue";
import Register from "../pages/Register.vue";
import Maps from "../pages/Maps.vue";
import Dashboard from "../pages/Dashboard.vue";
import Search from "../pages/Search.vue";
import CarDetails from "../pages/CarDetails.vue";
import AdminCars from "../pages/admin/Cars.vue";
import AdminUsers from "../pages/admin/Users.vue";
import PrivateChat from "../pages/PrivateChat.vue";
import UserProfile from "../pages/UserProfile.vue";
import NotFound from "../pages/NotFound.vue";
import Notification from "../pages/Notification.vue";
import Rent from '../pages/Rent.vue';
 
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
  { path: "/dashboard", 
    component: Dashboard, 
    name: "Dashboard",
    meta: { needsAuth: true },
  },
  { path: "/search", component: Search, name: "Search" },
  { 
    path: '/maps',
    component: Maps,
    name: 'maps', 
  },
  {
    path: "/onboarding",
    component: UserOnboarding,
    name: "onboarding",
    meta: { needsAuth: true },
  },
  {
    path: "/car/register",
    component: CarRegister,
    name: "CarRegister",
    meta: { needsAuth: true},
  },
  {
    path: "/car/:id",
    name: "CarDetails",
    component: CarDetails,
    props: true,
    meta: { needsAuth: true },
  },
  {
    path: "/notification",
    name: "Notification",
    component: Notification,
    props: true,
    meta: { needsAuth: true },
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
    path: '/rent/:id?',
    name: 'Rent',
    component: Rent,
    props: true,
    meta: { needsAuth: true },
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

router.beforeEach(async (to) => {
  const authSessionHistory = sessionStorage.getItem('auth_session_history');
  const authSession = JSON.parse(authSessionHistory);

  // Si el usuario está logueado, permite la navegación
  if (authSession.isLoggedIn === true) {
    return true;
  }
  // Si no esta logueado pero el authstore esta inicializado
  else {
    // Si no requiere auth
    if (!to.meta.needsAuth) {
      return true;
    }
    // Si la ruta requiere autenticación, y el store esta inicializado, redirige a /login
    if (to.meta.needsAuth && authSession.isLoggedIn === false) {
      return { path: "/login", query: { redirect: to.fullPath } };
    }
  }
})

export default router;