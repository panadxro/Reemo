<script setup>
import { onMounted, ref, computed } from 'vue';
import { useUserStore, useCarStore } from '@/stores';

import Heading from '@/components/atoms/Heading.vue';
import Input from '@/components/molecules/Input.vue';
import SearchIcon from '@/icons/Search.vue';
import CardCar from '../components/organisms/cars/CardCar.vue';
import RentStatusDetails from '@/components/organisms/rental/RentStatusDetails.vue';
import ReemoIcon from '../icons/ReemoIcon.vue';
import Account from '@/components/molecules/Account.vue';

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
    <div class="dash flex flex-col flex-1 gap-5 ">
      <div class="flex md:items-end justify-between flex-col md:flex-row gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
        <div class="flex md:hidden items-center justify-between">
          <Account :user="user" :authSession="authSession"/>
          <div class="flex items-center justify-center gap-4 flex-1 mr-10">
            <ReemoIcon class="w-10 h-10"/>
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
        <div class="bg-deep-blue-900 text-white p-6 w-full h-full rounded-[40px] py-10 px-6 flex flex-col gap-12">
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

selectedcontent {
  content: url("/src/icons/Dropdown.png");
  max-width: 1.5rem;
  max-height: 1.5rem;
}
</style>