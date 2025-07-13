import { createRouter, createWebHistory } from "vue-router";

import Home from "../pages/Home.vue";

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/login", name: "Login", component: () => import("../pages/Login.vue") },
  { path: "/register", name: "Register", component: () => import("../pages/Register.vue") },
  {
    path: "/:pathMatch(.*)*",
    component: () => import("../pages/NotFound.vue"),
    name: "NotFound",
    beforeEnter: (to) => {
      if (!to.matched.length) {
        return '/404'
      }
    },
   },
  { path: "/dashboard", 
    component: () => import("../pages/Dashboard.vue"),
    name: "Dashboard",
    meta: { needsAuth: true },
  },
  { path: "/search", name: "Search", component: () => import("../pages/Search.vue") },
  { path: '/maps', name: 'maps', component: () => import('../pages/Maps.vue') },
  { 
    path: "/onboarding",
    name: "onboarding",
    component: () => import("../pages/UserOnboarding.vue"),
    meta: { needsAuth: true },
  },
  {
    path: "/car/register",
    name: "CarRegister",
    component: () => import("../pages/CarRegister.vue"),
    meta: { needsAuth: true},
  },
  {
    path: "/car/edit/:id",
    name: 'CarEdit',
    props: true,
    component: () => import("../pages/CarRegister.vue"),
    meta: { requiresAuth: true }
  },
  {
    path: "/car/:id",
    name: "CarDetails",
    props: true,
    component: () => import("../pages/CarDetails.vue"),
    meta: { needsAuth: true },
  },
  {
    path: "/notification",
    name: "Notification",
    props: true,
    component: () => import("../pages/Notification.vue"),
    meta: { needsAuth: true },
  },
  {
    path: "/user/:id",
    name: "UserProfile",
    component: () => import("../pages/UserProfile.vue"),
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needsAuth: true },
    children: [
      {
        path: "chat",
        name: "Chat",
        component: () => import("../pages/Chat.vue"),
        meta: { needsAuth: true },
        // Validcacion para que un usuario no pueda chatear con el mismo. lo redirige a su perfil, capaz se puede crear una página de error
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
          
          return true;
        },
      },
    ],
  },
  {
    path: '/rents/:id',
    name: 'Rent',
    component: () => import('../pages/Rent.vue'),
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needsAuth: true },
  },
  {
    path: '/rent/:id',
    name: 'RentDetail',
    component: () => import('../pages/RentDetails.vue'),
    props: true,
    meta: { needsAuth: true },
  },
  {
    path: '/cars/:id',
    name: 'MyCars',
    component: () => import('../pages/MyCars.vue'),
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needAuth: true },
  },
  {
    path: '/documents/:id',
    name: 'Documentation',
    component: () => import('../pages/Documentation.vue'),
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
        component: () => import("../pages/admin/Cars.vue"),
      },
      {
        path: "users",
        name: "AdminUsers",
        component: () => import("../pages/admin/Users.vue"),
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