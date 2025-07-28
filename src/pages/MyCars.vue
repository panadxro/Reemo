<script setup>
import { useCarStore, useAuthStore } from '@stores'
import { onMounted, computed, ref, inject } from 'vue';
import { addAlert } from "@services/alerts.js";
import { useRoute, useRouter } from 'vue-router';

import CardCar from "@components/organisms/cars/CardCar.vue";
import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import ViewCar from '../components/organisms/cars/ViewCar.vue';
import Input from '../components/molecules/Input.vue';
import VerifyValidation from '../components/user/VerifyValidation.vue';
import Loading from '@icons/Loading.vue';
import NoCarsRegister from '../components/atoms/NoCarsRegister.vue';


const carStore = useCarStore();
const authSession = inject('authStore');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const userIdFromRoute = computed(() => route.params.id);

const selectedCar = ref(null);
const isLoading = ref(true);

const userCars = computed(() => carStore.userCars);
const isUserVerified = computed(() => authStore.userStatus === 'verified');

const handleCarClick = (car) => {
  selectedCar.value = car;
};

const handleRegisterClick = () => {
  if (!isUserVerified.value) {
    addAlert("Aguardá la validación del perfil para registrar un vehículo", "warning");
    return;
  }
  router.push({ name: 'CarRegister' });
};

onMounted(async () => {
  try {
    if (authSession?.user?.id) {
    await carStore.loadUserCars(authSession?.user?.id);
    } else {
      await carStore.loadUserCars(userIdFromRoute.value);
    }
    
    if (carStore.userCars.length > 0) {
      selectedCar.value = carStore.userCars[0];
    }
  } catch (error) {
    console.error("Error cargando autos del usuario:", error);
    addAlert("Error al cargar tus vehículos", "error");
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="md:m-2.5 w-full min-h-auto flex-1 md:min-h-auto md:max-h-dvh md:overflow-hidden flex gap-5">
    <div class="flex flex-col gap-4 w-full min-h-full" 
      :class="userCars?.length > 0 ? 'md:w-100' : ''">
      <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-4 bg-white px-2.5 md:px-0 py-3 md:py-0">
        <BackButton />
        <Heading :type="1" class="medium">Mis autos</Heading>
      </div>
      
      <div 
        class="md:p-5 md:rounded-[40px] flex flex-col gap-4 w-full h-full overflow-hidden relative" 
        :class="userCars?.length > 0 ? 'md:bg-deep-blue-900 md:w-96' : 'bg-white items-center'"
        >
          <ul 
            v-if="userCars?.length > 0"
            class="box-deep min-h-full flex-1 md:min-h-auto flex flex-col gap-4 overflow-y-auto md:!pr-2 mb-15 md:mb-0"
          >
            <CardCar 
              v-for="(car, index) in userCars" 
              :key="car.id" 
              :car="car" 
              :index="index"
              :isSelected="selectedCar?.id === car.id"
              layout="rectangle"
              @click="handleCarClick(car)"
            />
          </ul>
          
          <template v-else>
            <NoCarsRegister />
            <Heading :type="3" class="text-gray-500 mb-2 mt-4">
              No tenés autos registrados
            </Heading>
          </template>
          <div class="flex flex-col items-center justify-end flex-grow-0 gap-2 w-full fixed md:static bottom-22 left-0 ">
            <VerifyValidation
              v-if="!isUserVerified"
              title="Verificación requerida"
              message="Para registrar un vehículo, primero debés verificar tu cuenta"
              type="brightYellow"
              class="mb-4 w-full max-w-md"
            />
            
            <Input
              type="button"
              text="Registrar auto"
              variant="primary"
              class="w-full max-w-md px-2.5"
              @click="handleRegisterClick"
              :disabled="!isUserVerified"
              />
          </div>
      </div>
    </div>
    
    <!-- Vista detalle del auto seleccionado -->
    <ViewCar 
      v-if="selectedCar"
      :carId="selectedCar.id"
      class="hidden md:flex"
    />
  </section>
</template>