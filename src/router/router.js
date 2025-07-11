import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores";

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
import Chat from "../pages/Chat.vue";
import UserProfile from "../pages/UserProfile.vue";
import NotFound from "../pages/NotFound.vue";
import Notification from "../pages/Notification.vue";
import RentDetail from '../pages/RentDetails.vue';
import Rent from '../pages/Rent.vue'
import MyCars from '../pages/MyCars.vue';
import Documentation from "../pages/Documentation.vue";

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
    beforeEnter: (to, from, next) => {
    const authStore = useAuthStore();
    if (authStore.userStatus !== 'verified') {
      next({ name: 'Profile' });
    } else {
      next();
    }
  }
  },
  {
    path: "/car/edit/:id",
    name: 'CarEdit',
    component: CarRegister,
    props: true,
    meta: { requiresAuth: true }
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
        name: "Chat",
        component: Chat,
        meta: { needsAuth: true },
        // Validcacion para que un usuario noi pueda chatear con el mismo. lo redirige a su perfil, capaz se puede crear una página deerror
        beforeEnter: (to) => {

          // Obtener la sesión del usuario actual
          const authSessionHistory = sessionStorage.getItem('auth_session_history');
          const authSession = JSON.parse(authSessionHistory);
          
          // Obtener el ID del usuario desde la URL
          const targetUserId = to.params.id;
          
          // Obtener el ID del usuario actual (asumiendo que está en la sesión)
          const currentUserId = authSession.user?.id || authSession.userId;
          
          // Verificar si está intentando chatear consigo mismo
          if (targetUserId === currentUserId || targetUserId === String(currentUserId)) {
            // Redireccion
            return { 
              path: `/user/${targetUserId}`,
            };
          }
          
          // Si no es consigo mismo, permitir el acceso (retorna true implícitamente)
          return true;
        },
      },
    ],
  },
  {
    path: '/rents/:id',
    name: 'Rent',
    component: Rent,
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needsAuth: true },
  },
  {
    path: '/rent/:id',
    name: 'RentDetail',
    component: RentDetail,
    props: true,
    meta: { needsAuth: true },
  },
  {
    path: '/cars/:id',
    name: 'MyCars',
    component: MyCars,
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needAuth: true },
  },
  {
    path: '/documents/:id',
    name: 'Documentation',
    component: Documentation,
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needAuth: true },
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