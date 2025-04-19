<script setup>
import { useAuthStore } from "@/stores/auth.store";

import Logout from "../icons/Logout.vue";
import Login from "../icons/Login.vue";
import Reemo from "@icons/Reemo.vue";

const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <nav class="top-0 z-10 left-0 right-0 shadow-lg bg-white border-gray-200">
    <div class="max-w-(--breakpoint-xl) flex flex-wrap items-center justify-between mx-auto p-4">
      <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <Reemo/>
      </router-link>

      <!-- Botones de inicio/cierre de sesión -->
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <template v-if="!authStore.isLoggedIn">
          <router-link
            to="/login"
            class="flex gap-2 items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
          >
            <span>Iniciar sesión</span>
            <Login />
          </router-link>
        </template>
        <template v-else>
          <button
            @click="handleLogout"
            class="flex gap-2 items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
          >
            <span>Cerrar sesión</span>
            <Logout />
          </button>
        </template>
      </div>

      <!-- Links de navegación para usuarios normales -->
      <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 text-white rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
          <li>
            <router-link
              to="/"
              class="block py-2 px-3 md:p-0 rounded-sm md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="text-secondary-900! bg-blue-700"
            >
              Inicio
            </router-link>
          </li>
          <li>
            <router-link
              to="/search"
              class="block py-2 px-3 md:p-0 rounded-sm md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="text-secondary-900! bg-blue-700"
            >
              Encontrar un auto
            </router-link>
          </li>
          <li v-if="authStore.isLoggedIn">
            <router-link
              :to="'/user/' + authStore.user.id"
              class="block py-2 px-3 md:p-0 rounded-sm md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="text-secondary-900! bg-blue-700"
            >
              Mi perfil
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>