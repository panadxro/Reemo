<script setup>
import { inject } from 'vue';
import DotNotification from '../atoms/DotNotification.vue';

const authStore = inject('authStore');

const props = defineProps({
  user: { type: Object, required: true },
  authSession: { type: Object, required: true }
});

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <details class="relative">
    <summary class="flex items-center gap-2">
      <img :src="user.personalInfo.profilePhoto" :alt="user.personalInfo.firstName" class="w-10 h-10 rounded-full object-cover"/>
      <DotNotification />
    </summary>
    <ul class="absolute top-10 left-0 bg-white border-2 border-vibrant-light-800 rounded-xl overflow-hidden">
      <li>
        <router-link class="router-link" :to="{ name: 'UserProfile', params: { id: authSession.user.id } }">Perfil</router-link>
      </li>
      <li class="relative">
        <router-link class="router-link" to="/notification">Notificaciones</router-link>
        <DotNotification />
      </li>
      <!-- <li class="px-4 py-2">Configuración</li> -->
      <!-- <li class="px-4 py-2">Ayuda</li> -->
      <li class="router-link" @click="handleLogout">Cerrar sesión</li>
    </ul>
  </details>
</template>

<style scoped>
  .router-link {
    display: block;
    padding-inline: 1rem;
    padding-block: .5rem;
    font-weight: 600;
    color: #010440;
  }
  .router-link:hover {
    background-color: #CAF3F5;
    cursor: pointer;
  }

  .router-link:focus {
    background-color: #A7EBEF;
  }

  details img {
    border: 2px solid #FFFFFF ;
  }

  details:open img {
    border: 2px solid #A7EBEF ;
  }
</style>