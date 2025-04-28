<script setup>
import {useUserStore, useAuthStore } from '@stores'
import { computed } from "vue";

import Heading from "@components/atoms/Heading.vue";
import User from "@icons/User.vue";
import Credential from "../../icons/Credential.vue";
import Car from "../../icons/Car.vue";
import History from "../../icons/History.vue";
import NavButton from "../molecules/NavButton.vue";

const userStore = useUserStore();
const authStore = useAuthStore();

const profileData = computed(() => userStore.profileData)
</script>

<template>
  <aside class="bg-vibrant-light-600 m-2.5 py-12 px-5 flex flex-col items-center gap-2 rounded-[40px] min-w-[250px]">
    <img 
      v-if="profileData.personalInfo.profilePhoto" 
      class="w-20 aspect-square rounded-full bg-vibrant-light-800" 
      :src="`${profileData.personalInfo.profilePhoto}`"
      :alt="`Perfil de ${profileData.personalInfo.username}`" 
    />
    <Heading :type="1" class="regular text-center">{{ profileData.personalInfo.firstName }} {{ profileData.personalInfo.lastName }}</Heading>
    <p class="text-sm text-gray-500">
      @{{ profileData.personalInfo.username }}
    </p>
    <!-- <button type="button" @click="openUserEdit">Editar</button> -->
    <ul class="flex flex-col gap-3 my-7 w-full">
      <li>
        <NavButton to="/profile" title="Mi perfil">
          <User />
          <span>Mi perfil</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Documentación">
          <Credential />
          <span>Documentación</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Mis autos">
          <Car />
          <span>Mis autos</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Historial">
          <History />
          <span>Historial</span>
        </NavButton>
      </li>
    </ul>
  </aside>
  <!-- <UserEdit ref="UserEdit" />  -->
</template>
