<script setup>
import { useCarStore } from '@stores'
import { onMounted, computed, ref, inject } from 'vue';

import CardCar from "@components/organisms/cars/CardCar.vue";
import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import ViewCar from '../components/organisms/cars/ViewCar.vue';
import Input from '../components/molecules/Input.vue';

const carStore = useCarStore();
const authSession = inject('authSession');

const selectedCar = ref(null);

const userCars = computed(() => carStore.userCars);

const handleCarClick = (car) => {
  selectedCar.value = car;
};

onMounted(async () => {
  try {
    await carStore.loadUserCars(authSession.user?.id);

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
  <section class="md:m-2.5 w-full md:max-h-vh md:overflow-hidden flex gap-5">
    <div class="flex flex-col gap-4 w-full md:w-100">
      <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
        <BackButton />
        <Heading :type="1" class="medium">Mis autos</Heading>
      </div>
      <div class="md:p-5 md:rounded-[40px] md:bg-deep-blue-900 flex flex-col gap-4 w-full md:w-96 h-full overflow-hidden relative">
        <ul class="box-deep min-h-full md:min-h-auto h-full flex flex-col gap-4 overflow-y-auto !pr-2 mb-15 md:mb-0">
          <CardCar 
            v-if="userCars"
            v-for="(car, index) in userCars" 
            :key="car.id" 
            :car="car" 
            :index="index"
            layout="rectangle"
            @click="handleCarClick(car)"
          />
        </ul>
        <router-link to="/car/register">
          <Input
            type="button"
            variant="primary"
            text="Registrar nuevo vehículo"
            input-class="fixed md:static bottom-25 left-0 right-0 z-10 w-[calc(100%-2.5rem)] md:w-full mx-auto md:mx-0"
            :outline="false"
          />
        </router-link>
      </div>
    </div>
    <ViewCar 
      v-if="selectedCar"
      :carId="selectedCar.id"
      class="hidden md:flex"
    />
    <div v-else class="hidden md:flex items-center justify-center w-full h-full">
      <p>Selecciona un auto para ver los detalles</p>
    </div>
  </section>
</template>