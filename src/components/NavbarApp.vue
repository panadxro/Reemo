<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useAuthStore, useUserStore } from "../stores";
import MenuIcon from '@icons/Menu.vue';
import Cross from '@icons/Cross.vue';
import Reemo from '@icons/Reemo.vue';
import Home from '@icons/Home.vue';
import Search from '@icons/Search.vue';
import Notification from '@icons/Notification.vue';
import Map from '@icons/Map.vue';
import UserIcon from '@icons/UserIcon.vue';
import QA from '@icons/QA.vue';
import Settings from '@icons/Settings.vue';
import Logout from '@icons/Logout.vue';
import Cars from '@icons/Cars.vue';
import People from '@icons/People.vue';
import Login from "../icons/Login.vue";
import IconNavButton from './molecules/IconNavButton.vue';

const authStore = useAuthStore();
const userStore = useUserStore();

const isMobileMenuOpen = ref(false);
const isMobile = ref(false);

const handleLogout = () => {
  authStore.logout();
  if (isMobile.value) isMobileMenuOpen.value = false;
};

const checkScreenSize = () => {
  isMobile.value = window.innerWidth < 768; 
  if (!isMobile.value) {
    isMobileMenuOpen.value = false;
  }
};

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

onMounted(() => {
  checkScreenSize();
  window.addEventListener('resize', checkScreenSize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize);
});
</script>

<template>
    <nav class="fixed top-0 left-0 right-0 z-40 py-3 bg-white shadow-sm md:hidden">
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
          <router-link to="/" class="flex items-center space-x-3 rtl:space-x-reverse">
            <Reemo/>
          </router-link>
        </div>
    </nav>
    <button 
    @click="toggleMobileMenu"
    class="focus:outline-none absolute top-6 right-6 z-51 md:hidden"
    >
    <MenuIcon v-if="!isMobileMenuOpen" class="h-6 w-6" />
    <Cross v-else class="h-6 w-6" />
  </button>

  <transition
      enter-active-class="transition-opacity duration-300 ease-in-out"
      leave-active-class="transition-opacity duration-300 ease-in-out"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div 
        v-if="isMobileMenuOpen && isMobile"
        class="fixed inset-0 z-49 bg-black/60 md:hidden"
        @click="toggleMobileMenu"
      ></div>
    </transition>

    <transition
      enter-active-class="transition-transform duration-300 ease-in-out"
      leave-active-class="transition-transform duration-300 ease-in-out"
      enter-from-class="translate-x-full"
      leave-to-class="translate-x-full"
    >
  <nav 
    v-if="isMobileMenuOpen && isMobile"
    class="fixed z-50 top-0 right-0 h-full w-64 bg-secondary-100 flex flex-col justify-between py-10 px-4 md:hidden"
  >
    <ul 
      v-if="userStore.profileData.role === 'user'"
      class="flex flex-col gap-4 text-start"
    >
      <li>
        <IconNavButton to="/" title="Home" @click="toggleMobileMenu">
          <Home class="mr-2" />
          <span class="font-semibold">Inicio</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/search" title="Search" @click="toggleMobileMenu">
          <Search class="mr-2" />
          <span class="font-semibold">Buscar</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/maps" title="Map" @click="toggleMobileMenu">
          <Map class="mr-2" />
          <span class="font-semibold">Mapa</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton :to="'/user/' + authStore?.user.id" title="Profile" @click="toggleMobileMenu">
          <UserIcon class="mr-2" />
          <span class="font-semibold">Perfil</span>
        </IconNavButton>
      </li>
    </ul>
    
    <ul 
      v-else-if="userStore.profileData.role === 'admin'"
      class="flex flex-col gap-4"
    >
      <li>
        <IconNavButton to="/" title="Home" @click="toggleMobileMenu">
          <Home class="mr-2" />
          <span class="font-semibold">Inicio</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/search" title="Search" @click="toggleMobileMenu">
          <Search class="mr-2" />
          <span class="font-semibold">Buscar</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/cars" title="Admin cars" @click="toggleMobileMenu">
          <Cars class="mr-2" />
          <span class="font-semibold">Administrar autos</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/users" title="Admin users" @click="toggleMobileMenu">
          <People class="mr-2" />
          <span class="font-semibold">Administrar usuarios</span>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton :to="'/user/' + authStore?.user.id" title="Profile" @click="toggleMobileMenu">
          <UserIcon class="mr-2" />
          <span class="font-semibold">Perfil</span>
        </IconNavButton>
      </li>
    </ul>
    
    <ul class="flex flex-col gap-4">
      <li class="w-full">
        <IconNavButton to="/" title="Notifications" @click="toggleMobileMenu">
          <Notification />
          <span class="font-semibold">Notificaciones</span>
        </IconNavButton>
      </li>
      <li v-if="userStore.profileData.role === 'user'" class="w-full">
        <IconNavButton to="/" title="Questions & Answers" @click="toggleMobileMenu">
          <QA class="mr-2" />
          <span class="font-semibold">Preguntas Frecuentes</span>
        </IconNavButton>
      </li>
      <li class="w-full">
        <IconNavButton to="/" title="Settings" @click="toggleMobileMenu">
          <Settings class="mr-2" />
          <span class="font-semibold">Ajustes</span>
        </IconNavButton>
      </li>
      <li v-if="authStore.isLoggedIn" class="w-full">
        <button 
          @click="handleLogout"
          title="Logout"
          class="flex items-center justify-start p-2 rounded-full transition-colors duration-300 cursor-pointer w-full"
        >
          <Logout class="mr-2" />
          <span class="font-semibold">Cerrar Sesión</span>
        </button>
      </li>
      <li v-else class="w-full">
        <IconNavButton to="/login" title="Log In" @click="toggleMobileMenu">
          <Login class="mr-2" />
          <span class="font-semibold">Iniciar Sesión</span>
        </IconNavButton>
      </li>
    </ul>
  </nav>
</transition>
</template>