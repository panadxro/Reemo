<script setup>
import { ref, onMounted, onBeforeUnmount, inject } from 'vue';
import { useRouter } from "vue-router";

import Reemo from "@icons/Reemo.vue";
import Input from "./molecules/Input.vue";

const router = useRouter();
const authStore = inject('authStore');

const props = defineProps({
  NavbarVisible: {
    type: Boolean,
    required: true,
  }
});

const emit = defineEmits('handleScroll')

const isNavbarVisible = ref(props.NavbarVisible);
const lastScrollPosition = ref(0);

const handleScroll = () => {
  const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  
  // Siempre mostrar navbar cuando esté en la parte superior
  if (currentScrollPosition <= 0) {
    isNavbarVisible.value = true;
    lastScrollPosition.value = currentScrollPosition;
    return;
  }
  
  // Mostrar navbar solo cuando se hace scroll hacia arriba
  if (currentScrollPosition < lastScrollPosition.value) {
    isNavbarVisible.value = true;
  } else {
    isNavbarVisible.value = false;
  }
  
  lastScrollPosition.value = currentScrollPosition;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
  <header 
    class="navbar top-0 z-10 left-0 right-0 shadow-lg bg-white border-gray-200"
    :class="{ 'navbar--visible': isNavbarVisible, 'navbar--hidden': !isNavbarVisible }"
    >
    <nav class="max-w-(--breakpoint-xl) flex flex-wrap items-center justify-between mx-auto p-4">
      <a href="/" class="flex items-center space-x-3 rtl:space-x-reverse">
        <Reemo/>
      </a>

      <!-- Botones de inicio/cierre de sesión -->
      <div class="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse">
        <a href="/dashboard">
          <Input
          type="button"
          text="Ingresar a la app"
          variant="primary"
          class="!w-fit"
          />
        </a>
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
    </nav>
  </header>
</template>

<style>
.navbar {
  transition: transform 0.3s ease-in-out;
}

.navbar--hidden {
  transform: translateY(-100%);
}

.navbar--visible {
  transform: translateY(0);
}
</style>