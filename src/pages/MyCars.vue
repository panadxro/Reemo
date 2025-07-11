<script setup>
import { useCarStore } from '@stores'
import { onMounted, computed, ref, inject } from 'vue';
import { addAlert } from "@services/alerts.js";

import CardCar from "@components/organisms/cars/CardCar.vue";
import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import ViewCar from '../components/organisms/cars/ViewCar.vue';
import Input from '../components/molecules/Input.vue';
import { useAuthStore } from '../stores/auth.store';
import VerifyValidation from '../components/user/VerifyValidation.vue';

const carStore = useCarStore();
const authSession = inject('authSession');
const authStore = useAuthStore();

const selectedCar = ref(null);

const userCars = computed(() => carStore.userCars);
const isVerified = computed(() => authStore.userStatus === 'verified');

const handleCarClick = (car) => {
  selectedCar.value = car;
};

const handleRegisterClick = () => {
  if (!isVerified.value) {
    addAlert("El usuario no esta verificado. Aguardá la verificación", "error");
    return;
  }
};

onMounted(async () => {
  try {
    await carStore.loadUserCars(authSession?.user?.id);

    console.log("Datos del usurtaio authStore:", authStore?.user);

    // Seleccionar el primer auto al cargar la página
    if (carStore.userCars.length > 0) {
      selectedCar.value = carStore.userCars[0];
    }
  } catch (error) {
    console.error("Error cargando autos del usuario:", error);
  }
});
</script>

<template>
  <section class="m-2.5 w-full md:max-h-vh md:overflow-hidden flex">
    <div class="flex flex-col gap-4 w-100">
      <div class="flex items-center gap-5">
        <BackButton />
        <Heading :type="1" class="medium">Mis autos</Heading>
      </div>
      <div class="p-5 rounded-[40px] bg-deep-blue-900 flex flex-col gap-4 w-96 h-full overflow-hidden">
        <ul class="h-full flex flex-col gap-4 overflow-y-auto !pr-2">
          <CardCar 
            v-if="userCars"
            v-for="(car, index) in userCars" 
            :key="car.id" 
            :car="car" 
            :index="index"
            :isSelected="selectedCar?.id === car.id"
            layout="rectangle"
            @click="handleCarClick(car)"
          />
        </ul>
        
        <VerifyValidation
          v-if="!isVerified"
          title="Verificación requerida"
          message="Para registrar un nuevo vehículo, debés verificar tu cuenta."
          :show="!isVerified"
          type="normalYellow"
          />

        <div class="w-full">
          <router-link 
            v-if="isVerified" 
            :to="{name: 'CarRegister'}"
            class="block w-full"
          >
            <Input
              type="button"
              variant="primary"
              text="Registrar nuevo vehículo"
              class="w-full"
              :outline="false"
            />
          </router-link>

          <!-- Botón deshabilitado para usuarios no verificados -->
          <div v-else class="w-full">
            <Input
              type="button"
              variant="secondary"
              text="Registrar nuevo vehículo"
              class="w-full opacity-50 !hover:cursor-not-allowed"
              :outline="true"
              :disabled="true"
              @click="handleRegisterClick"
            />
          </div>
        </div>
      </div>
    </div>
    <ViewCar 
      v-if="selectedCar"
      :carId="selectedCar.id"
    />
    <div v-else>
      <p>Selecciona un auto para ver los detalles</p>
    </div>
  </section>
</template>