<script setup>
import { onMounted, ref, computed, watch } from 'vue';
import { useUserStore, useCarStore, useAuthStore, useAdminStore } from '@/stores';
import { useNotificationStore } from '@/stores/notification.store';
import { useRouter } from 'vue-router';
import { formatNotificationDate } from '@libraries/date.js';

import Heading from '@/components/atoms/Heading.vue';
import Input from '@/components/molecules/Input.vue';
import SearchIcon from '@/icons/Search.vue';
import CardCar from '../components/organisms/cars/CardCar.vue';
import RentStatusDetails from '@/components/organisms/rental/RentStatusDetails.vue';
import ReemoIcon from '../icons/ReemoIcon.vue';
import Account from '@/components/molecules/Account.vue';
import Cars from '@icons/Cars.vue';
import People from '@icons/People.vue';
import Rents from '../icons/Rents.vue';
import Status from "@/components/molecules/Status.vue";
import Loading from '@/icons/Loading.vue';
import NoNotification from '@/components/atoms/NoNotification.vue';
import NoCarsResult from '../components/atoms/NoCarsResult.vue';

const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

const userStore = useUserStore();
const carStore = useCarStore();
const authStore = useAuthStore();
const adminStore = useAdminStore();
const notificationStore = useNotificationStore();
const router = useRouter();

const loading = ref(false);

const user = computed(() => userStore.profileData);
const availableCars = computed(() => carStore.availableCars);
const userCars = computed(() => carStore.userCars);
const isAdmin = computed(() => authStore?.user?.role === 'admin');
const currentUser = computed(() => authStore.user);

const totalRents = computed(() => {
  return adminStore.users.reduce((total, user) => {
    return total + (user.rentHistory?.length || 0);
  }, 0);
});

const lastRegisteredCars = computed(() => {
  const sortedCars = [...adminStore.cars].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  // console.log('Últimos autos registrados:', sortedCars);
  return sortedCars.slice(0, 3);
});

const lastRegisteredUsers = computed(() => {
  const sortedUsers = [...adminStore.users].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  );
  return sortedUsers.slice(0, 3);
});

// De aca hasta el onmounted es de notis

const latestNotifications = computed(() => {
  return notificationStore.sortedNotifications.slice(0, 3);
});

const formatDate = (timestamp) => {
  if (!timestamp) return "Fecha no disponible";
  return formatNotificationDate(timestamp);
};

const handleNotificationClick = async (notification) => {
  if (!notification.read) {
    await notificationStore.markNotificationAsRead(notification.id);
  }
  if (notification.link) {
    router.push(notification.link);
  }
};

// const getDefaultTitle = (notification) => {
//   if (notification.type === 'rent_request') return 'Nueva solicitud de alquiler';
//   if (notification.type === 'rent_response') return 'Respuesta a tu solicitud';
//   if (notification.type === 'car_validated') return 'Vehículo validado';
//   if (notification.type === 'car_invalidated') return 'Vehículo rechazado';
//   return 'Nueva notificación';
// };

onMounted(async () => {
  try {
    loading.value = true;

    if (adminStore.cars.length === 0) {
      await adminStore.fetchCars();
    }

    if (adminStore.users.length === 0) {
      await adminStore.fetchUsers();
    }

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

watch(currentUser, (newUser) => {
  if (newUser && newUser.id) {
    if (!notificationStore.hasLoadedOnce) {
      notificationStore.initListenerForUser(newUser.id);
      // console.log(latestNotifications.value, 'latestNotifications');
    }
  } else {
    notificationStore.clearListenerAndData();
  }
}, { immediate: true });
</script>

<template>
  <div class="parent w-full md:max-h-vh md:min-h-vh p-2.5">
    <div class="dash flex flex-col flex-1 gap-5 ">
      <div class="flex md:items-end justify-between flex-col md:flex-row gap-5 fixed md:static top-0 left-0 right-0 z-4 bg-white px-2.5 md:px-0 py-3 md:py-0">
        <div class="flex md:hidden items-center justify-between">
          <Account :user="user" :authSession="authSession"/>
          <div class="flex items-center justify-center gap-4 flex-1 mr-10">
            <router-link to="/">
              <ReemoIcon class="w-10 h-10"/>
            </router-link>
          </div>
        </div>
        <Heading v-if="isAdmin" type="1" class="large">Dashboard</Heading>
        <Heading v-else type="1" class="large">Panel de control</Heading>
        <router-link 
          class="hidden md:flex"
          to="/maps?focusSearch=true"
          >
          <Input
            v-if="!isAdmin"
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
        <div class="bg-deep-blue-900 text-white p-6 w-full h-full rounded-[40px] py-10 px-6 flex flex-col  gap-4 overflow-hidden ">
          <Heading type="2" class="medium text-white">¡Bienvenido a <strong class="font-extrabold!">Reemo</strong>, {{ user.personalInfo.firstName }}👋!</Heading>
          <!-- <p v-if="isAdmin" class="text-white">Acá podés gestionar los usuarios y vehículos registrados.🚗✨</p> -->
          <ul v-if="isAdmin" class="flex flex-col md:flex-row gap-4 justify-center items-center h-full lg:my-[1/2]">
            <li class="text-center bg-vibrant-light-600 rounded-2xl p-4 text-deep-blue-900 flex justify-between items-center w-full lg:h-full">
              <Cars class="size-10"/>
              <div class="text-end">
                <Heading type="4" class="medium">{{ adminStore.cars.length }}</Heading>
                <Heading type="3" class="small">Autos totales</Heading>
              </div>
            </li>

            <li class="text-center bg-vibrant-light-600 rounded-2xl p-4 text-deep-blue-900 flex justify-between items-center w-full lg:h-full">
              <People class="size-10"/>
              <div class="text-end">
                <Heading type="4" class="medium">{{ adminStore.users.length }}</Heading>
                <Heading type="3" class="small">Usuarios totales</Heading>
              </div>
            </li>

            <li class="text-center bg-vibrant-light-600 rounded-2xl p-4 text-deep-blue-900 flex justify-between items-center w-full lg:h-full">
              <Rents class="size-10"/>
              <div class="text-end">
                <Heading type="4" class="medium">{{ totalRents  }}</Heading>
                <Heading type="3" class="small">Rentas totales</Heading>
              </div>
            </li>

          </ul>
          <p v-else class="text-white">Acá podés gestionar tus autos y solicitudes de alquiler.🚗✨</p>
        </div>
    </div>
    
    <div class="cars flex flex-col gap-6 overflow-hidden">
      <div class="flex justify-between items-end">
        <Heading v-if="isAdmin" type="2" class="medium">Últimos autos registrados</Heading>
        <Heading v-else type="2" class="medium">Autos más cercanos a tu zona</Heading>
        <router-link v-if="isAdmin" to="/admin/cars" class="text-deep-blue-900 font-semibold cursor-pointer">Ver más
        </router-link>
        <router-link v-else to="/search" class="font-semibold cursor-pointer">Ver más</router-link>
      </div>
      <div class="box-white flex flex-col gap-2 h-full overflow-y-auto pr-2">
        <CardCar 
          v-if="availableCars.length > 0"
          v-for="(car, index) in isAdmin ? lastRegisteredCars : availableCars" 
          :key="car.id" 
          :car="car"
          :index="index"
          layout="rectangle"
        />
        <div v-else class="flex flex-col justify-center items-center gap-5 h-full">
          <NoCarsResult class="max-w-[90px]"/>
          <p class="font-semibold">No se encontraron autos disponibles cercanos a tu ubicación.</p>
        </div>
      </div>
    </div>
    <div class="bg-vibrant-light-600 rounded-[40px] p-6 flex flex-col gap-4 tracking overflow-hidden">
      <div class="flex justify-between items-center">
        <Heading type="2" class="medium">Últimas notificaciones</Heading>
        <router-link 
          to="/notifications" 
          class="text-deep-blue-900 font-semibold cursor-pointer"
        >Ver más</router-link>
      </div>

      <div class="box-vibrant flex flex-col gap-3 overflow-y-auto h-full pr-2">
        <div v-if="notificationStore.isLoading" class="flex justify-center items-center py-4">
          <Loading class="h-6 w-6 text-secondary-500" />
        </div>
        
        <div 
          v-else-if="!notificationStore.isLoading && latestNotifications.length === 0"
          class="flex flex-col items-center justify-center py-4 text-center gap-2"
        >
          <NoNotification class="max-w-[100px]"/>
          <p class="text-gray-500 font-bold text-sm">No hay notificaciones aún.</p>
        </div>
        
        <div 
            v-for="noti in latestNotifications" 
            :key="noti.id"
            @click="handleNotificationClick(noti)"
            class="flex items-start gap-3 p-3 bg-white rounded-xl cursor-pointer hover:bg-white/70 transition "
          >
          <div class="flex-shrink-0">
            <div class="relative">
              <img 
                v-if="noti.senderDetails?.photoURL" 
                :src="noti.senderDetails.photoURL" 
                class="w-10 h-10 rounded-full object-cover"
              />
              <div 
                v-else
                class="w-10 h-10 rounded-full bg-vibrant-light-900 flex items-center justify-center"
              >
                <ReemoIcon class="w-6 h-6 text-white" />
              </div>
              <span 
                v-if="!noti.read"
                class="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"
              ></span>
            </div>
          </div>
          
          <div class="flex-1 min-w-0">
    <div class="flex justify-between items-start">
      <p class="font-medium text-sm text-deep-blue-900 line-clamp-1">
        {{ noti.title }}
      </p>
      <span class="text-xs text-secondary-500 whitespace-nowrap ml-2">
        {{ formatDate(noti.created_at) }} 
      </span>
    </div>
    <p class="text-xs text-secondary-500 line-clamp-2">
      {{ noti.message || 'Tienes una nueva notificación de' }} de {{ noti.senderDetails?.name || 'Desconocido' }} {{ noti.senderDetails?.lastName || '' }}
    </p>
  </div>
        </div>
      </div>
    </div>
    <div class="my-profile w-full bg-deep-blue-900 rounded-[40px] p-6 flex flex-col gap-4 overflow-hidden">
      <div class="flex justify-between items-end">
        <Heading v-if="isAdmin" type="2" class="medium text-white">Últimos usuarios registrados</Heading>
        <Heading v-else type="2" class="medium text-white">Solicitudes pendientes</Heading>
        <router-link 
          v-if="isAdmin" 
          to="/admin/users" 
          class="text-vibrant-light-900 font-semibold cursor-pointer"
        >
          Ver más
        </router-link>
      </div>

      <div v-if="isAdmin" class="box-deep flex flex-col gap-1 h-full overflow-y-auto">
        <div 
          v-for="user in lastRegisteredUsers" 
          :key="user.id" 
          class="flex items-center gap-3 p-3"
        >
          <img 
            :src="user.personalInfo.profilePhoto" 
            :alt="user.personalInfo.firstName" 
            class="w-10 h-10 rounded-full object-cover"
          />
          <div class="flex-1 min-w-0">
            <p class="font-medium text-secondary-200 truncate">{{ user.personalInfo.firstName }} {{ user.personalInfo.lastName }}</p>
            <p class="text-sm text-white/70 truncate">{{ user.email }}</p>
          </div>
          <Status :status="user.status" size="small" />
        </div>
      </div>
      
      <RentStatusDetails v-else />
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