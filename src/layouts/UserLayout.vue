<script setup>
import { inject, computed } from 'vue';
import { useRoute } from 'vue-router';

import Sidebar from '../components/Sidebar.vue';
import UserNav from '../components/user/UserNav.vue';
import Offline from '../pages/Offline.vue';

const authStore = inject('authStore');
const isOnline = inject('isOnline');
const route = useRoute();

// Verificar si el ID de la ruta coincide con el usuario logueado
const showUserNav = computed(() => {
  return route.params.id === authStore.user?.id;
});
</script>

<template>
  <div class="w-full md:h-screen overflow-auto relative">
    <main class="flex flex-col relative md:flex-row !min-h-screen md:max-h-screen md:p-2.5 bg-white 2xl:rounded-[40px] shadow-2xl 2xl:max-w-5/6 2xl:m-auto">
      <Sidebar/>
      <div 
        v-if="isOnline"
        class="flex md:flex-1 flex-col md:flex-row overflow-auto mb-20 md:mb-0 mt-15 md:mt-0 gap-5 md:gap-0 p-2.5 md:p-0 flex-1">
        <UserNav v-if="showUserNav"/>
        <slot />
      </div>
      <Offline v-else/>
    </main>
  </div>
</template>