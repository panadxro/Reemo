<script setup>
import { provide, computed, ref, defineAsyncComponent } from 'vue';
import { useAuthStore } from '@stores';

const Sidebar = defineAsyncComponent(() => import('@/components/Sidebar.vue'));
const Navbar = defineAsyncComponent(() => import('@/components/Navbar.vue'));

const authStore = useAuthStore();
const isNavbarVisible = ref(false);

// Proveer datos de autenticación y usuario
const loggedUser = computed(() => authStore.user);
const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

provide('isNavbarVisible', isNavbarVisible);
provide('loggedUser', loggedUser);
provide('authSession', authSession);
</script>

<template>
  <div class="w-full md:h-screen overflow-auto relative">
    <main class="flex flex-col md:flex-row !min-h-screen md:max-h-screen md:p-2.5 bg-white 2xl:rounded-[40px] py-20 md:m-0 2xl:max-w-5/6 2xl:m-auto">
      <Sidebar class="sidebar"/>
      <slot/>
    </main>
  </div>
</template>