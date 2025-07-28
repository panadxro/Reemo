<script setup>
import { inject, ref, defineProps } from 'vue';

import DotNotification from '../atoms/DotNotification.vue';
import Modal from '@/components/molecules/Modal.vue';

const authStore = inject('authStore');

const showCancelModal = ref(false);

const props = defineProps({
  authSession: { type: Object, required: true }
});

const authSession = ref(props.authSession);

function openCancelModal() {
  // console.log('Hola', authStore?.user?.profilePhoto);
  showCancelModal.value = true;
}

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <details class="relative">
    <summary class="flex items-center gap-2">
      <img v-if="authSession.user.profilePhoto" :src="authSession.user.profilePhoto" :alt="authSession.user.firstName" class="w-10 h-10 rounded-full object-cover"/>
      <img v-else src="/src/assets/User.png" alt="User" class="w-10 h-10 rounded-full object-cover"/>
      <DotNotification />
    </summary>
    <ul class="absolute top-10 left-0 bg-white border-2 border-vibrant-light-800 rounded-xl overflow-hidden">
      <li>
        <router-link class="router-link" :to="{ name: 'UserProfile', params: { id: authSession.user.id } }">Perfil</router-link>
      </li>
      <li class="relative">
        <router-link class="router-link" to="/notifications">Notificaciones</router-link>
        <DotNotification />
      </li>
      <!-- <li class="px-4 py-2">Configuración</li> -->
      <!-- <li class="px-4 py-2">Ayuda</li> -->
      <li class="router-link" @click="openCancelModal">Cerrar sesión</li>
    </ul>
    <Modal
      :isOpen="showCancelModal"
      title="Cerrar sesión"
      message="¿Estás seguro que querés cerrar sesión?"
      confirmText="Si, cerrar"
      cancelText="No, mantener"
      :image="authStore?.user?.profilePhoto"
      @close="showCancelModal = false"
      @confirm="handleLogout"
    />
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