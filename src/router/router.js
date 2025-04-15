import { createRouter, createWebHistory } from "vue-router"; 
import { subscribeToAuthState } from "../services/auth";

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
import RentalStep1 from '../components/organisms/rental/RentalStep1.vue';
import RentalStep2 from '../components/organisms/rental/RentalStep2.vue';
import RentalStep3 from '../components/organisms/rental/RentalStep3.vue';

const routes = [
  { path: "/", component: Home, name: "Home" },
  { path: "/login", component: Login, name: "Login" },
  { path: "/register", component: Register, name: "Register" },
  { path: "/search", component: Search, name: "Search" },
  { path: "/maps", component: Maps },
  {
    path: "/onboarding",
    component: UserOnboarding,
    name: "Onboarding",
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
    meta: { needsAuth: true },
    children: [
      {
        path: '',
        name: 'car-details',
        component: RentalStep1 ,
      },
      {
        path: 'information',
        name: 'rent-information',
        component: RentalStep2 ,
      },
      {
        path: 'confirmation',
        name: 'car-confirmation',
        component: RentalStep3 ,
      }
    ]
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
      path: "/login",
    };
  }

  if (to.meta.role && loggedUser.role !== to.meta.role) {
    return {
      path: "/",
    };
  }
});

export default router;