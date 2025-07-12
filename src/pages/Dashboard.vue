<script setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore, useCarStore } from '@/stores';

import Heading from '@/components/atoms/Heading.vue';
import Input from '@/components/molecules/Input.vue';
import SearchIcon from '@/icons/Search.vue';
import CardCar from '../components/organisms/cars/CardCar.vue';
import RentStatusDetails from '@/components/organisms/rental/RentStatusDetails.vue';
import ReemoIcon from '@/icons/ReemoIcon.vue';

const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

const userStore = useUserStore();
const carStore = useCarStore();

const loading = ref(false);

const user = computed(() => userStore.profileData);
const availableCars = computed(() => carStore.availableCars);
const userCars = computed(() => carStore.userCars);

onMounted(async () => {
  try {
    loading.value = true;

    await userStore.loadUserProfile(authSession.user.id);
    //console.log('User data fetched successfully:', userStore.profileData);

    // Cargar autos para disponibles para alquilar
    await carStore.loadAvailableCars(authSession.user.id);
    //console.log('Available cars fetched successfully:', carStore.availableCars);

    // Cargar autos del usuario
    await carStore.loadUserCars(authSession.user.id);
    //console.log('Autos del usuario', carStore.userCars)
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    loading.value = false;
  }
})
</script>

<template>
  <div class="parent w-full md:max-h-vh md:min-h-vh p-2.5">
    <div class="dash flex flex-col gap-5 ">
      <div class="flex md:items-end justify-between flex-col md:flex-row gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
        <div class="flex md:hidden items-center justify-between">
          <img 
            v-if="user.personalInfo.profilePhoto" 
            :src="user.personalInfo.profilePhoto" 
            alt="User Profile Picture" 
            class="w-8 h-8 rounded-full object-cover flex"
          >
          <img 
            v-else 
            src="../../assets/images/default-profile.png" 
            alt="Default Profile Picture" 
            class="w-8 h-8 rounded-full object-cover"
          >

          <div class="flex items-center justify-between gap-4">
            <ReemoIcon class="w-10 h-10" color="#4FD8DF" />
            <Input
              type="button"
              text="Descargar app"
              icon-position="left"
              variant="secondary"
              :outline="false"
              class="!w-fit"
              input-class="w-fit md:w-auto"
              />
          </div>
        </div>
        <Heading type="1" class="large">Dashboard</Heading>
        <router-link 
          class="hidden md:flex"
          to="/maps?focusSearch=true"
          >
          <Input
            type="text"
            id="searchInput"
            name="searchInput"
            placeholder="Buscar por ubicación..."
            input-class="w-full"
            icon-position="left"
            variant="secondary"
            :outline="false"
            >
            <template #icon>
              <SearchIcon />
            </template>
          </Input>
        </router-link>   
      </div>
      <router-link 
        class="flex md:hidden mt-10"
        to="/maps?focusSearch=true"
        >
        <Input
          type="text"
          id="searchInput"
          name="searchInput"
          placeholder="Buscar por ubicación..."
          input-class="w-full"
          icon-position="left"
          variant="secondary"
          :outline="false"
          >
          <template #icon>
            <SearchIcon />
          </template>
        </Input>
      </router-link>
      <div v-if="userCars.length > 0" class="bg-vibrant-light-600 rounded-[40px] w-full py-10 px-6 flex flex-col justify-between gap-5 h-full">
          <Heading type="2" class="medium">Resumen de actividad</Heading>
          <div class="flex justify-between text-center h-full flex-wrap">
            <div class="flex-1">
              <p class="text-2xl font-bold">12</p>
              <p class="text-sm text-gray-500">Alquileres</p>
            </div>
            <div class="flex-1">
              <p class="text-2xl font-bold">5</p>
              <p class="text-sm text-gray-500">Solicitudes</p>
            </div>
            <div class="flex-1">
              <p class="text-2xl font-bold">3</p>
              <p class="text-sm text-gray-500">Vehículos activos</p>
            </div>
            <div class="flex-1">
              <p class="text-2xl font-bold">$250k</p>
              <p class="text-sm text-gray-500">Ganancias</p>
            </div>
          </div>
        </div>
        <div v-else class="bg-deep-blue-900 text-white p-6 w-full rounded-[40px] py-10 px-6 flex flex-col gap-12">
          <Heading type="2" class="medium text-white">¡Bienvenido a <strong>Reemo</strong>, {{ user.personalInfo.firstName }}👋!</Heading>
          <p class="text-white">Aquí podés gestionar tus autos y solicitudes de alquiler.🚗✨</p>
        </div>
    </div>
    
    <div class="cars flex flex-col gap-6 overflow-hidden">
      <div class="flex justify-between items-end">
        <Heading type="2" class="medium">Autos más cercanos a tu zona</Heading>
        <router-link to="/search" class="text-vibrant-light-900 font-semibold cursor-pointer">Ver más
        </router-link>
      </div>
      <div class="box-white flex flex-col gap-2 h-full overflow-y-auto pr-2">
        <CardCar 
          v-for="(car, index) in availableCars" 
          :key="car.id" 
          :car="car"
          :index="index"
          layout="rectangle"
        />
      </div>
    </div>
    <div class="bg-vibrant-light-800 rounded-[40px] p-6 flex flex-col justify-between tracking">
      <h3 class="text-xl font-bold mb-2">¡Tu viaje comienza acá!</h3>
      <p class="text-gray-700">Alquilá con <strong>Reemo</strong> fácil, rápido y seguro.</p>
      <button class="mt-6 bg-[#0a0a3c] text-white font-medium py-3 rounded-lg">Buscar autos</button>
    </div>
    <div class="my-profile w-full bg-deep-blue-900 rounded-[40px] p-6 flex flex-col gap-4 overflow-hidden">
      <Heading type="2" class="medium text-white">Solicitudes pendientes</Heading>
      <RentStatusDetails />
    </div>
  </div>
</template>

<style scoped>
  @media (width >= 768px) {
  .parent {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    .dash { grid-area: 1 / 1 / 2 / 8; }
    .my-profile { grid-area: 1 / 8 / 2 / 13; }
    .cars { grid-area: 2 / 1 / 3  / 8; }
    .tracking { grid-area: 2 / 8 / 3 / 13; }
  }
}

@media (width < 768px) {
  .parent {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .dash { order: 1; }
    .my-profile { order: 2; }
    .cars { order: 3; }
    .tracking { order: 4; }
  }
}
</style>