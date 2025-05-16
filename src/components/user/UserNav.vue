<script setup>
import {useUserStore, useAuthStore } from '@stores'
import { computed } from "vue";

import Heading from "@components/atoms/Heading.vue";
import UserIcon from "@icons/UserIcon.vue";
import Credential from "../../icons/Credential.vue";
import Car from "../../icons/Car.vue";
import History from "../../icons/History.vue";
import NavButton from "../molecules/NavButton.vue";

const userStore = useUserStore();
const authStore = useAuthStore();

const profileData = computed(() => userStore.profileData)
</script>

<template>
  <aside class="bg-vibrant-light-600 m-2.5 py-6 md:py-12 px-5 flex flex-col items-center gap-2 rounded-[40px] w-full md:min-w-[250px]">
    <!-- Profile info -->
    <div class="w-full flex flex-row md:flex-col items-center gap-4 md:gap-2">
      <img 
        v-if="profileData.personalInfo.profilePhoto" 
        class="w-16 md:w-20 aspect-square rounded-full bg-vibrant-light-800 md:mx-auto" 
        :src="`${profileData.personalInfo.profilePhoto}`"
        :alt="`Perfil de ${profileData.personalInfo.username}`" 
      />
      <div class="md:text-center">
        <Heading :type="2" class="regular">{{ profileData.personalInfo.firstName }} {{ profileData.personalInfo.lastName }}</Heading>
        <p class="text-sm text-gray-500">
          @{{ profileData.personalInfo.username }}
        </p>
      </div>
    </div>
    
    <!-- Navigation -->
    <ul class="flex flex-row md:flex-col flex-wrap justify-center gap-3 my-4 md:my-7 w-full">
      <li class="flex-1 min-w-[120px]">
        <NavButton to="/profile" title="Mi perfil">
          <UserIcon />
          <span>Mi perfil</span>
        </NavButton>
      </li>
      <li class="flex-1 min-w-[120px]">
        <NavButton to="/profile" title="Documentación">
          <Credential />
          <span>Documentación</span>
        </NavButton>
      </li>
      <li class="flex-1 min-w-[120px]">
        <NavButton to="/profile" title="Mis autos">
          <Car />
          <span>Mis autos</span>
        </NavButton>
      </li>
      <li class="flex-1 min-w-[120px]">
        <NavButton to="/profile" title="Historial">
          <History />
          <span>Historial</span>
        </NavButton>
      </li>
    </ul>
  </aside>
  <!-- <UserEdit ref="UserEdit" />  -->
</template>