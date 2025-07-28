import { createRouter, createWebHistory } from "vue-router";
import { useUserStore } from "@/stores";

import Home from "../pages/Home.vue";

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/login", name: "Login", component: () => import("../pages/Login.vue") },
  { path: "/register", name: "Register", component: () => import("../pages/Register.vue") },
  { 
    path: "/dashboard", 
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
    meta: { needsAuth: true, requiresVerified: true },
  },
  {
    path: "/car/edit/:id",
    name: 'CarEdit',
    props: true,
    component: () => import("../pages/CarRegister.vue"),
    meta: { needsAuth: true, requiresVerified: true },
  },
  {
    path: "/car/:id",
    name: "CarDetails",
    props: true,
    component: () => import("../pages/CarDetails.vue"),
    meta: { needsAuth: true },
  },
  {
    path: "/notifications",
    name: "Notification",
    props: true,
    component: () => import("../pages/Notifications.vue"),
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
    async beforeEnter(to) {
      const userStore = useUserStore();
      
      try {
        const user = await userStore.getUserById(to.params.id);
        
        if (!user) {
          return { name: 'NotFound' };
        }
        
        return true;
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        return { name: 'NotFound' };
      }
    },
    children: [
      {
        path: "chat",
        name: "Chat",
        component: () => import("../pages/Chat.vue"),
        meta: { needsAuth: true, requiresVerified: true },
        beforeEnter: (to) => {
          const authSessionHistory = sessionStorage.getItem('auth_session_history');
          const authSession = JSON.parse(authSessionHistory);
          
          const targetUserId = to.params.id;
          const currentUserId = authSession.user?.id || authSession.userId;
          
          if (targetUserId === currentUserId || targetUserId === String(currentUserId)) {
            return { path: `/user/${targetUserId}` };
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
    async beforeEnter(to) {
      const userStore = useUserStore();
      
      try {
        const user = await userStore.getUserById(to.params.id);
        
        if (!user) {
          return { name: 'NotFound' };
        }
        
        return true;
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        return { name: 'NotFound' };
      }
    },
  },
  {
    path: '/rent/:id',
    name: 'RentDetail',
    component: () => import('../pages/RentDetails.vue'),
    props: true,
    meta: { needsAuth: true, requiresVerified: true },
  },
  {
    path: '/cars/:id',
    name: 'MyCars',
    component: () => import('../pages/MyCars.vue'),
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needsAuth: true, requiresVerified: true },
    async beforeEnter(to) {
      const userStore = useUserStore();
      
      try {
        const user = await userStore.getUserById(to.params.id);
        
        if (!user) {
          return { name: 'NotFound' };
        }
        
        return true;
      } catch (error) {
        console.error("Error al verificar el usuario:", error);
        return { name: 'NotFound' };
      }
    },
  },
  {
    path: '/documents/:id',
    name: 'Documentation',
    component: () => import('../pages/Documentation.vue'),
    props: (route) => ({
      id: route.params.id,
    }),
    meta: { needsAuth: true },
  },
  {
    path: "/admin",
    name: "Admin",
    meta: { needsAuth: true, role: "admin", requiresVerified: true },
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
  { path: '/not-authorized', name: 'NotAuthorized', component: () => import('../pages/NotAuthorized.vue') },
  { path: '/not-found', name: 'NotFound', component: () => import('../pages/NotFound.vue') },
  { path: '/not-verified', name: 'NotVerified', component: () => import('../pages/NotVerified.vue') },
  { path: '/offline', name: 'Offline', component: () => import('../pages/Offline.vue') }
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
  let authSession = { isLoggedIn: false, user: { status: null, role: null } };
  
  try {
    const authSessionHistory = sessionStorage.getItem('auth_session_history');
    if (authSessionHistory && authSessionHistory.trim() !== '') {
      authSession = JSON.parse(authSessionHistory);
    }
  } catch (e) {
    console.error("Error parsing auth session:", e);
    sessionStorage.removeItem('auth_session_history');
  }

  // Rutas públicas que no requieren autenticación
  const publicRoutes = ['Login', 'Register', 'Home'];
  if (publicRoutes.includes(to.name)) {
    return true;
  }

  // Si requiere autenticación y no está logueado
  if (to.meta.needsAuth && !authSession.isLoggedIn) {
    return { path: "/login", query: { redirect: to.fullPath } };
  }

  // Verificación para usuarios no verificados
  if (authSession.isLoggedIn && authSession.user?.status === 'not-verified' && to.meta.requiresVerified) {
    return { path: '/not-verified' };
  }

  // Verificación de roles de administrador
  if (to.meta.role && authSession.isLoggedIn) {
    const userRole = authSession.user?.role;
    
    if (to.meta.role !== userRole) {
      return { path: '/not-authorized' };
    }
  }

  // Verificación de ruta no encontrada
  if (!to.matched.length) {
    return { path: '/not-found' };
  }

  return true;
});

export default router;