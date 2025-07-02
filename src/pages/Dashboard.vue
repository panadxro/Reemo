<script setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore, useCarStore } from '@/stores';

import Heading from '@/components/atoms/Heading.vue';
import Input from '@/components/molecules/Input.vue';
import SearchIcon from '@/icons/Search.vue';
import Status from '@/components/molecules/Status.vue';
import CardCar from '../components/organisms/cars/CardCar.vue';
import RentStatusDetails from '@/components/organisms/rental/RentStatusDetails.vue';


const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

const userStore = useUserStore();
const carStore = useCarStore();

const loading = ref(false);

const user = computed(() => userStore.profileData);
const availableCars = computed(() => carStore.availableCars);
const userCars = computed(() => carStore.userCars);

const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

const isOwnDashboard = computed(() => {
  return authSession.value?.id === props.id;
});

onMounted(async () => {
  try {
    loading.value = true;

    await userStore.loadUserProfile(authSession.user.id);
    console.log('User data fetched successfully:', userStore.profileData);

    // Cargar autos para disponibles para alquilar
    await carStore.loadAvailableCars(authSession.user.id);
    console.log('Available cars fetched successfully:', carStore.availableCars);

    // Cargar autos del usuario
    await carStore.loadUserCars(authSession.user.id);
    console.log('Autos del usuario', carStore.userCars)
  } catch (error) {
    console.error('Error fetching user data:', error);
  } finally {
    loading.value = false;
  }
})
</script>

<template>
  <div class="parent w-full md:max-h-vh md:min-h-vh md:overflow-y-auto p-2.5">
    <div class="dash flex flex-col gap-5">
      <div class="flex items-end justify-between">
        <Heading type="1" class="large">Dashboard</Heading>
        <router-link 
          to="/maps?focusSearch=true"
          >
          <Input
            type="text"
            id="searchInput"
            name="searchInput"
            placeholder="Buscar por ubicación..."
            class="lg:w-1/2 mb-2 lg:mb-0 w-fit!"
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
      <div class="flex gap-5 h-full">
        <div v-if="userCars.length > 0" class="bg-vibrant-light-600 rounded-[40px] w-full py-10 px-6 flex flex-col justify-between">
          <Heading type="2" class="medium">Resumen de actividad</Heading>
          <div class="flex justify-between text-center h-full items-center">
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
        <div class="bg-vibrant-light-800 rounded-[40px] p-6 flex flex-col justify-between">
          <h3 class="text-xl font-bold mb-2">¡Tu viaje comienza acá!</h3>
          <p class="text-gray-700">Alquilá con <strong>Reemo</strong> fácil, rápido y seguro.</p>
          <button class="mt-6 bg-[#0a0a3c] text-white font-medium py-3 rounded-lg">Buscar autos</button>
        </div>
      </div>
    </div>
    <div class="my-profile bg-white border-3 border-vibrant-light-600 rounded-[40px] p-6 items-center flex flex-col justify-between">
      <!-- <img :src="user.personalInfo.profilePhoto" :alt="user.personalInfo.firstName" class="w-28 h-28 rounded-full" />
      <Heading type="2" class="medium">{{ user.personalInfo.firstName }} {{ user.personalInfo.lastName }}</Heading>
      <p class="font-bold">@{{ user.personalInfo.username }}</p>
      <router-link :to="`/user/${authSession.user.id}`" class="flex items-center px-5 py-2.5 bg-vibrant-light-900 text-white w-fit rounded-2xl hover:bg-vibrant-light-800 transition-colors duration-300">
        Ver perfil
      </router-link> -->
        <div v-if="isOwnDashboard" class="">
          <RentStatusDetails />
        </div>
    </div>
    <div class="cars flex flex-col gap-6 overflow-hidden">
      <div class="flex justify-between items-end">
        <Heading type="2" class="medium">Autos más cercanos a tu zona</Heading>
        <a href="#" class="text-vibrant-light-900 font-semibold">Ver más</a>
      </div>
      <div class="flex flex-col gap-2 h-full overflow-y-auto pr-2">
        <CardCar 
          v-for="car in availableCars" 
          :key="car.id" 
          :car="car"
          layout="rectangle"
        />
      </div>
    </div>
    <div class="tracking bg-[#0d0d0d] rounded-[40px] text-white py-6 px-8 h-full">
      <div class="flex justify-between items-center">
        <Heading type="2" class="medium text-white">Tracking</Heading>
        <a href="#" class="text-vibrant-light-900 font-semibold">Ver más</a>
      </div>
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

    .dash { grid-area: 1 / 1 / 2 / 9; }
    .my-profile { grid-area: 1 / 9 / 2 / 13; }
    .cars { grid-area: 2 / 1 / 3  / 8; }
    .tracking { grid-area: 2 / 8 / 3 / 13; }
  }
}
.tracking {
  background-image: url('/src/assets/Traking.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
</style>