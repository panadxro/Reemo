<script setup>
import { inject, ref } from "vue";
import { useUserStore } from "../stores";

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
    class="flex bg-vibrant-light-600 flex-col justify-between w-full md:w-fit xs:max-h-3.5 md:min-h-full xs:mx-auto md:m-2.5 p-4 md:py-12 rounded-full fixed md:relative bottom-0 left-0 z-5" 
    :class="{
      'md:!bg-vibrant-light-600': authStore?.user?.role === 'user', 
      'md:!bg-deep-blue-900': authStore?.user?.role === 'admin'
      }">
    <ul 
      v-if="authStore.user?.role !== 'admin'"
      class="flex bg-vibrant-light-600 h-full md:h-auto !p-2.5 md:!p-0 md:flex-col rounded-full justify-center gap-4 md:gap-2 items-center"
    >
      <li class="hidden md:block">
        <router-link to="/">
          <ReemoIcon class="w-10 h-10 text-vibrant-light-600" />
        </router-link>
      </li>
      <li class="relative">
        <IconNavButton to="/dashboard" title="Dashboard">
          <Home />
          <DotNotification class="md:hidden"/>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/search" title="Search">
          <Search />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/maps" title="Map">
          <Map />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton :to="'/user/' + authStore?.user.id" title="Profile">
          <User />
        </IconNavButton>
      </li>
    </ul>

    <ul 
      v-else-if="authStore.user?.role === 'admin'"
      class="flex bg-deep-blue-900 h-full md:h-auto !p-2.5 md:!p-0 md:flex-col rounded-full justify-center gap-4 md:gap-2 items-center"
    >
      <li>
        <router-link to="/">
          <ReemoIcon class="hidden md:block w-10 h-10" color="#FFFFFF" />
        </router-link>
      </li>
      <li class="relative">
        <IconNavButton to="/dashboard" title="Dashboard">
          <Home color="#FFFFFF"/>
          <DotNotification class="md:hidden"/>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/search" title="Search">
          <Search color="#FFFFFF"/>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/cars" title="Admin cars">
          <Cars color="#FFFFFF"/>
      </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/users" title="Admin users">
          <People color="#FFFFFF"/>
        </IconNavButton>
      </li>
      <li>
        <IconNavButton :to="'/user/' + authStore?.user.id" title="Profile">
          <User color="#FFFFFF"/>
        </IconNavButton>
      </li>
    </ul>

    <ul class="hidden md:flex flex-col gap-2 items-center">
      <li title="Notifications" class="relative">
        <IconNavButton to="/notification" title="Notification">
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
          class="flex items-center justify-center p-2 rounded-full transition-colors duration-300 cursor-pointer hover:bg-white/50"
        >
          <Logout :color="authStore?.user?.role === 'admin' ? '#FFFFFF' : '#010440'"/>
          <span class="sr-only">Logout</span>
        </button>
        <Modal
          :isOpen="showCancelModal"
          title="Cerrar Sesión"
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