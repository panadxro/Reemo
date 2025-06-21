<script setup>
import { useUserStore } from '@stores'
import { computed, inject } from "vue";

import Heading from "@components/atoms/Heading.vue";
import User from "@icons/User.vue";
import Credential from "../../icons/Credential.vue";
import Car from "../../icons/Car.vue";
import History from "../../icons/History.vue";
import NavButton from "../molecules/NavButton.vue";

const userStore = useUserStore();

const profileData = computed(() => userStore.profileData)

// Inyectar los datos del padre
const loggedUser = inject('loggedUser');
const authSession = inject('authSession');
</script>

<template>
  <aside class="md:bg-vibrant-light-600 m-2.5 md:py-12 md:px-5 flex flex-col items-center gap-2 rounded-[40px] md:min-w-[250px] fixed md:relative right-0  h-full md:h-auto justify-center">
    <img 
      v-if="profileData.personalInfo.profilePhoto" 
      class="hidden md:block w-20 aspect-square rounded-full bg-vibrant-light-800" 
      :src="`${profileData.personalInfo.profilePhoto}`"
      :alt="`Perfil de ${profileData.personalInfo.username}`" 
    />
    <Heading :type="1" class="hidden md:block regular text-center">{{ profileData.personalInfo.firstName }} {{ profileData.personalInfo.lastName }}</Heading>
    <p class="hidden md:block text-sm text-gray-500">
      @{{ profileData.personalInfo.username }}
    </p>
    <!-- <button type="button" @click="openUserEdit">Editar</button> -->
    <ul class="flex flex-col gap-3 my-7 md:w-full">
      <li>
        <NavButton :to="`/user/${authSession?.user?.id}`" title="Mi perfil">
          <User />
          <span class="hidden md:block">Mi perfil</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Documentos">
          <Credential />
          <span class="hidden md:block">Documentos</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Mis autos">
          <Car />
          <span class="hidden md:block">Mis autos</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Historial">
          <History />
          <span class="hidden md:block">Historial</span>
        </NavButton>
      </li>
    </ul>
  </aside>
  <!-- <UserEdit ref="UserEdit" />  -->
</template>