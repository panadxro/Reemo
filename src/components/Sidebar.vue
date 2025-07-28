<script setup>
import { inject, ref } from "vue";

import ReemoIcon from '@icons/ReemoIcon.vue'
import Home from '@icons/Home.vue'
import Search from '@icons/Search.vue'
import Map from '@icons/Map.vue'
import User from '@icons/User.vue'
import Notification from '@icons/Notification.vue'
import QA from '@icons/QA.vue'
import Settings from '@icons/Settings.vue'
import Logout from '@icons/Logout.vue';
import Cars from '@icons/Cars.vue';
import People from '@icons/People.vue';
import Login from "@/icons/Login.vue";
import IconNavButton from './molecules/IconNavButton.vue';
import DotNotification from "./atoms/DotNotification.vue";
import Modal from '@/components/molecules/Modal.vue';

const authStore = inject('authStore');

const showCancelModal = ref(false);

function openCancelModal() {
  showCancelModal.value = true;
}

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <nav 
    class="flex md:bg-vibrant-light-600 flex-col justify-between w-full md:w-fit xs:max-h-3.5 md:min-h-full xs:mx-auto md:m-2.5 p-4 md:py-12 rounded-full fixed md:relative bottom-0 left-0 z-5 overflow-y-auto box-invisible" 
    :class="{
      'md:!bg-vibrant-light-600': authStore?.user?.role === 'user', 
      'md:!bg-deep-blue-900': authStore?.user?.role === 'admin'
      }">
    <ul 
      class="flex bg-transparent h-full md:h-auto !p-2.5 md:!p-0 md:flex-col rounded-full justify-center gap-4 md:gap-2 items-center"
      :class="{
        '!bg-deep-blue-900': authStore?.user?.role === 'admin',
        '!bg-vibrant-light-600': authStore?.user?.role !== 'admin'
      }"
    >
      <li class="hidden md:block">
        <router-link title="Ir a página principal" to="/">
          <ReemoIcon class="w-10 h-10" :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
        </router-link>
      </li>
      <li class="relative">
        <IconNavButton to="/dashboard" title="Dashboard">
          <Home :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
          <DotNotification class="md:hidden"/>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/search" title="Search">
          <Search :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/maps" title="Map">
          <Map :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
        </IconNavButton>
      </li>
      <li v-if="authStore.user?.role === 'admin'">
        <IconNavButton to="/admin/cars" title="Admin cars">
          <Cars :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
      </IconNavButton>
      </li>
      <li v-if="authStore.user?.role === 'admin'">
        <IconNavButton to="/admin/users" title="Admin users">
          <People :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
        </IconNavButton>
      </li>      
      <li>
        <IconNavButton :to="'/user/' + authStore?.user.id" title="Profile">
          <User :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
        </IconNavButton>
      </li>
    </ul>

    <ul class="hidden md:flex flex-col gap-2 items-center">
      <li title="Notifications" class="relative">
        <IconNavButton to="/notifications" title="Notification">
          <Notification 
            :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"
          />
        </IconNavButton>
        <DotNotification />
      </li>
<!--       <li v-if="authStore?.user?.role === 'user'">
        <IconNavButton to="/" title="Questions & Answers">
          <QA />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/" title="Settings">
          <Settings />
        </IconNavButton>
      </li> -->
      <li v-if="authStore.isLoggedIn">
        <button 
          @click="openCancelModal"
          title="Logout"
          class="flex items-center justify-center p-2 rounded-full transition-colors duration-300 cursor-pointer"
          :class="{
            ' hover:bg-vibrant-light-700': authStore?.user?.role === 'user',
            ' hover:bg-deep-blue-700': authStore?.user?.role === 'admin'
          }"
        >
          <Logout :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
          <span class="sr-only">Logout</span>
        </button>
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
      </li>
      <li v-else>
        <IconNavButton to="/login" title="Log In">
          <Login />
        </IconNavButton>
      </li>
    </ul>
  </nav>
</template>