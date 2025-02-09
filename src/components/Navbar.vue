<script>
import Logout from "../icons/Logout.vue";
import Login from "../icons/Login.vue";
import Reemo from '@icons/Reemo.vue';
import AlertRented from './rental/AlertRented.vue'

export default {
  name: "Navbar",
  components: { Logout, Login, Reemo, AlertRented },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  data(){
    return{
      rentalRequest: null,
    }
  },
  methods: {
    handleLogout() {
      this.$emit("logout");
    },
  },
};


</script>

<template>
  <!-- ESTE ES EL DE LOS USUARIOS NORMALES -->
  <nav v-if="user.role !== 'admin'" class="fixed top-0 z-10 left-0 right-0 shadow-lg bg-white border-gray-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <span class="self-center text-white text-2xl font-semibold whitespace-nowrap"><Reemo /></span>
      </router-link>

      <!-- Botones de inicio/cierre de sesión -->
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">

        <AlertRented v-if="user && user.id"/>

        <template v-if="!user.id">
          <router-link
            to="/Login"
            class="flex gap-2 items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
          >
            <span>Iniciar sesión</span>
            <Login />
          </router-link>
        </template>
        <template v-else>
          <form @submit.prevent="handleLogout">
            <button
              type="submit"
              class="flex gap-2 items-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
            >
              <span>Cerrar sesión</span>
              <Logout />
            </button>
          </form>
        </template>
      </div>

      <!-- Links de navegación para usuarios normales -->
      <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 text-white rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
          <li>
            <router-link
              to="/"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-blue-700"
            >
              Inicio
            </router-link>
          </li>
          <li>
            <router-link
              to="/Publications"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-blue-700"
            >
              Encontrar un auto
            </router-link>
          </li>
          <li v-if="user.id">
            <router-link
              to="/Profile"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-blue-700"
            >
              Mi perfil
            </router-link>
          </li>
        </ul>
      </div>
    </div>
  </nav>

    <!-- ESTE ES EL DE LOS ADMINS -->
  <nav v-else-if="user.role === 'admin'" class="fixed top-0 z-10 left-0 right-0 shadow-lg bg-secondary-300 border-gray-200">
    <div class="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
      <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <span class="self-center text-white text-2xl font-semibold whitespace-nowrap"><Reemo /></span>
      </router-link>

      <!-- Botones de inicio/cierre de sesión -->
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <form @submit.prevent="handleLogout">
          <button
            type="submit"
            class="flex gap-2 items-center text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center"
          >
            <span>Cerrar sesión</span>
            <Logout />
          </button>
        </form>
      </div>

      <!-- Links de navegación para administradores -->
      <div class="items-center justify-between hidden w-full md:flex md:w-auto md:order-1" id="navbar-cta">
        <ul class="flex flex-col font-medium p-4 md:p-0 mt-4 text-white rounded-lg md:space-x-8 rtl:space-x-reverse md:flex-row md:mt-0 md:border-0 md:bg-transparent">
          <li>
            <router-link
              to="/"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-red-700"
            >
              Inicio
            </router-link>
          </li>
          <li>
            <router-link
              to="/Publications"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-blue-700"
            >
              Vehículos Publicados
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/CarsValidation"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-red-700"
            >
              Vehículos
            </router-link>
          </li>
          <li>
            <router-link
              to="/admin/Users"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-red-700"
            >
              Usuarios
            </router-link>
          </li>
          <li>
            <router-link
              to="/Profile"
              class="block py-2 px-3 md:p-0 rounded md:bg-transparent md:text-gray-500 hover:gray-700"
              aria-current="page"
              active-class="!text-secondary-900 bg-red-700"
            >
              Perfil
            </router-link>
          </li>
          
        </ul>
      </div>
    </div>
  </nav>
</template>