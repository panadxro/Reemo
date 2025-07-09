<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useCarStore, useUserStore } from '@stores';
import { addAlert } from '../../../services/alerts';

import Heading from '@components/atoms/Heading.vue';
import Status from '@components/molecules/Status.vue';
import Pill from '@components/atoms/Pill.vue';

const props = defineProps({
  carId: {
    type: String,
    required: true,
  },
});

const carId = props.carId;
const currentImage = ref(null);
const loading = ref(false);
const errorMsg = ref(null);
const carOwner = ref(null);
const defaultCarImage = ref('/src/assets/default-car.jpg');
const defaultUserImage = ref('/src/assets/User.png');

const carStore = useCarStore();
const userStore = useUserStore();

const car = computed(() => carStore.currentCar);
const ownerData = computed(() => carOwner.value);

const setCurrentImage = (image) => {
  currentImage.value = image;
};

const setDefaultImage = (event) => {
  event.target.src = defaultCarImage;
};

onMounted(async () => {
  try {
    loading.value = true;

    await carStore.loadCarById(carId);

    if (car.value?.ownerId) {
      const ownerDataResponse = await userStore.getUserById(car.value.ownerId);
      if (ownerDataResponse) {
        carOwner.value = ownerDataResponse;
      }
    }

    if (car.value?.photos?.length > 0) {
      currentImage.value = car.value.photos[0];
    }
  } catch (error) {
    errorMsg.value = 'Hubo un error al obtener los detalles del auto';
    console.error('Error:', error);
  } finally {
    loading.value = false;
  }
})

watch(() => props.carId, async (newId) => {
  if (newId) {
    try {
      loading.value = true;
      currentImage.value = null;
      await carStore.loadCarById(newId);

      // Establecer la primera imagen después de cargar los datos
      if (car.value?.photos?.length > 0) {
        currentImage.value = car.value.photos[0];
      } else {
        currentImage.value = defaultCarImage.value;
      }
    } catch (error) {
      addAlert('Hubo un error al obtener los detalles del auto', 'error');
    } finally {
      loading.value = false;
    }
  }
}, { immediate: true });
</script>

<template>
  <article class="flex flex-col gap-9 bg-background-900 md:border-vibrant-light-900 overflow-y-auto w-full h-full px-5">
    <template v-if="loading">
      <!-- Skeleton Loading -->
      <div class="animate-pulse h-full">
        <div class="h-64 bg-gray-300 rounded-2xl"></div>
        <!-- Más placeholders -->
      </div>
    </template>

    <template v-else>
      <div class="flex flex-col gap-5">
        <!-- Imagen principal del carrusel -->
        <figure class="my-auto max-h-64 mx-auto overflow-hidden rounded-2xl relative">
          <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
            <Status :status="car.status?.current"/>
          </div>
          <img 
            class="object-center w-full h-full object-cover"
            :src="currentImage || defaultCarImage" 
            @error="setDefaultImage" 
            alt="Imagen del vehículo"
          />
        </figure>
  
        <!-- Miniaturas debajo de la imagen principal -->
        <div v-if="car.photos?.length > 1" class="flex justify-between gap-2.5 overflow-x-auto pb-2">
          <img 
            v-for="(image, index) in car.photos" 
            :key="index" 
            :src="image" 
            @click="setCurrentImage(image)"
            @error="setDefaultImage" 
            :class="{ active: image === currentImage }" 
            class="max-h-20 object-center w-full flex-1 h-full border-2 object-cover cursor-pointer rounded-2xl hover:opacity-90 focus:border-vibrant-light-900" 
            alt="Miniatura del vehículo"
            />
        </div>
      </div>
      <div class="flex items-end justify-between">
        <Heading :type="2" class="large flex flex-col">
          <span class="text-background-600 text-lg!">
            {{ car.basicInfo?.brand || 'No especificado' }}
          </span> 
          {{ car.basicInfo?.model || 'No especificado' }}
        </Heading>
        <div class="flex flex-col items-end gap-2">
          <Heading :type="3" class="medium text-background-600">
            ${{ car.pricing?.rates?.daily }} /día
          </Heading>
        </div>
      </div>
      
      <div v-if="ownerData">
        <router-link :to="`/user/${car.ownerId}`" class="flex items-center gap-2 hover:cursor-pointer">
          <img 
            :src="ownerData.personalInfo?.profilePhoto || defaultUserImage" 
            :alt="`${ownerData.personalInfo?.firstName} ${ownerData.personalInfo?.lastName}`" 
            :title="`${ownerData.personalInfo?.firstName} ${ownerData.personalInfo?.lastName}`"
            class="w-8 h-8 object-cover rounded-full" 
          />
          <p class="font-semibold hover:underline">
            {{ ownerData.personalInfo?.firstName || 'Usuario' }} {{ ownerData.personalInfo?.lastName || '' }}
          </p>
        </router-link>
      </div>
  
      <ul class="font-semibold">
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Año:</p>
          <span>{{ car.basicInfo?.year || 'No especificado' }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Tipo:</p>
          <span>{{ car.basicInfo?.type || 'No especificado' }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700 ">
          <p>Motor:</p>
          <span>{{ car.specifications?.engine || 'No especificado' }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Transmisión:</p>
          <span>{{ car.specifications?.transmission || 'No especificado' }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Combustible:</p>
          <span>{{ car.specifications?.fuelType || 'No especificado' }}</span>
        </li>
      </ul>
      <div class="flex flex-col gap-4">
        <Heading :type="2" class="medium">Descripción</Heading>
        <p class="break-words">
          {{ car.status?.description || 'No especificado' }}
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <Heading :type="2" class="medium">Accesorios</Heading>
        <div  class="flex flex-wrap gap-2 text-gray-700">
          <Pill v-for="(accessory, index) in car.features?.accessories" :key="index" :accessory="accessory" :name="accessory" />
  
        </div>
      </div>
    </template>
  </article>
</template>