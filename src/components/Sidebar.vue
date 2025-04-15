<script setup>
import { useAuthStore, useUserStore } from "../stores";

import Login from "../icons/Login.vue";
import Home from '@icons/Home.vue'
import Search from '@icons/Search.vue'
import Map from '@icons/Map.vue'
import UserIcon from '@icons/UserIcon.vue'
import AlertRented from '@components/organisms/rental/AlertRented.vue'
import QA from '@icons/QA.vue'
import Settings from '@icons/Settings.vue'
import Logout from '@icons/Logout.vue';
import Cars from '@icons/Cars.vue'
import People from '@icons/People.vue'
import IconNavButton from './molecules/IconNavButton.vue'

const authStore = useAuthStore();
const userStore = useUserStore();

const handleLogout = () => {
  authStore.logout();
};
</script>

<template>
  <nav class="bg-secondary-100 flex flex-col justify-between min-h-full m-2.5 py-12 px-4 rounded-full">
    <ul 
      v-if="userStore.profileData.role === 'user'"
      class="flex flex-col gap-2 items-center"
      >
      <li>
        <IconNavButton to="/" title="Home">
          <Home />
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
          <UserIcon />
        </IconNavButton>
      </li>
    </ul>
    <ul 
      v-else-if="userStore.profileData.role === 'admin'"
      class="flex flex-col gap-2 items-center"
      >
      <li>
        <IconNavButton to="/" title="Home">
          <Home />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/search" title="Search">
          <Search />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/cars" title="Admin cars">
          <Cars />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/admin/users" title="Admin users">
          <People />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton :to="'/user/' + authStore?.user.id" title="Profile">
          <UserIcon />
        </IconNavButton>
      </li>
    </ul>
    <ul class="flex flex-col gap-2 items-center">
      <li title="Notifications">
        <AlertRented />
      </li>
      <li v-if="userStore.profileData.role === 'user'">
        <IconNavButton to="/" title="Questions & Answers">
          <QA />
        </IconNavButton>
      </li>
      <li>
        <IconNavButton to="/" title="Settings">
          <Settings />
        </IconNavButton>
      </li>
      <li v-if="authStore.isLoggedIn">
        <button 
          @click="handleLogout"
          title="Logout"
          class=" flex items-center justify-center p-2 rounded-full transition-colors duration-300 cursor-pointer hover:bg-vibrant-light-800"
          active-class="bg-vibrant-light-800hover:cursor-pointer hover:bg-vibrant-light-800"
          >
          <Logout />
          <span class="sr-only">Logout</span>
        </button>
      </li>
      <li v-else>
        <IconNavButton to="/login" title="Log In">
          <Login />
        </IconNavButton>
      </li>
    </ul>
  </nav>
</template>