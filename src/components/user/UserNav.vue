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
  <aside class="md:bg-vibrant-light-600 md:m-2.5 md:px-5 flex flex-col md:items-center gap-2 md:rounded-[40px] md:min-w-[250px] md:relative h-full md:h-auto md:justify-center overflow-x-auto">
    <img 
      v-if="profileData.personalInfo.profilePhoto" 
      class="hidden md:block w-20 aspect-square rounded-full bg-vibrant-light-800 object-cover" 
      :src="`${profileData.personalInfo.profilePhoto}`"
      :alt="`Perfil de ${profileData.personalInfo.username}`" 
    />
    <Heading :type="1" class="hidden md:block regular text-center">{{ profileData.personalInfo.firstName }} {{ profileData.personalInfo.lastName }}</Heading>
    <p class="hidden md:block text-sm text-gray-500">
      @{{ profileData.personalInfo.username }}
    </p>

    <ul class="user-nav flex md:flex-col gap-3 md:my-7 !w-full !pb-2.5 md:!pb-0">
      <li class="!min-w-fit">
        <NavButton :to="{ name: 'UserProfile', params: { id: authSession?.user?.id } }" title="Mi perfil">
          <User />
          <span>Mi perfil</span>
        </NavButton>
      </li>
      <li class="!min-w-fit">
        <NavButton :to="{ name: 'Documentation', params: { id: authSession?.user?.id } }" title="Documentos">
          <Credential />
          <span>Documentos</span>
        </NavButton>
      </li>
      <li class="!min-w-fit">
        <NavButton :to="{ name: 'MyCars', params: { id: authSession?.user?.id } }" title="Mis autos">
          <Car />
          <span>Mis autos</span>
        </NavButton>
      </li>
      <li class="!min-w-fit">
        <NavButton :to="{ name: 'Rent', params: { id: authSession?.user?.id } }" title="Historial">
          <History />
          <span>Historial</span>
        </NavButton>
      </li>
    </ul>
  </aside>
</template>

<style scope>
  .user-nav {
  scrollbar-color: deeppink indigo;
  scrollbar-width: thin;
  scrollbar-gutter: auto;
  }
</style>