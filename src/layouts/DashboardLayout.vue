<script setup>
import { provide, ref, computed } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import { useAuthStore } from '@stores';

const authStore = useAuthStore();

// Proveer datos de autenticación y usuario
const loggedUser = computed(() => authStore.user);
const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

provide('loggedUser', loggedUser);
provide('authSession', authSession);
</script>

<template>
  <div class="w-full md:h-screen overflow-auto">
    <main class="flex flex-col relative md:flex-row-reverse md:min-h-screen md:max-h-screen md:p-2.5 bg-white 2xl:rounded-[40px]">
      <slot />
      <Sidebar/>
    </main>
  </div>
</template>