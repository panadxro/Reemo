<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore, useUserStore , useCarStore } from '@stores'
import { useRoute } from 'vue-router';
import { Loader } from "@googlemaps/js-api-loader";
import { loadGoogleMaps, initMap } from "../services/google-maps.js";
import { useRentalStore } from '@/stores/rent.store.js';

import Heading from "../components/atoms/Heading.vue";
import Pill from "../components/atoms/Pill.vue";
import Loading from "@icons/Loading.vue";
import BackButton from "../components/atoms/BackButton.vue";
import Status from "../components/molecules/Status.vue";
import Arrow from "../icons/Arrow.vue";
import Like from "../icons/Like.vue";

import RentalProcess from "@/components/organisms/rental/RentalProcess.vue";

// Stores
const carStore = useCarStore();
const authStore = useAuthStore();
const userStore = useUserStore();
const store = useRentalStore();

// Router
const route = useRoute();

const props = defineProps({
  id: {
    type: String,
    required: true
  }
});

const carId = props.id;

// Estado del componente
const loading = ref(false);
const errorMsg = ref("");
const currentImage = ref(null);
const carOwner = ref(null); // Nuevo estado para el dueño del carro
const defaultCarImage = "/src/assets/default-car.jpg";
const defaultUserImage = "/src/assets/User.png"

// Computed
const car = computed(() => carStore.currentCar);
const user = computed(() => userStore.profileData)
const loggedUser = computed(() => authStore.user);

// Computed para obtener los datos del dueño del auto
const ownerData = computed(() => {
  if (!car.value?.ownerId) return null;
  return userStore.getUserDataById(car.value.ownerId) || carOwner.value;
});



const setCurrentImage = (image) => {
  currentImage.value = image;
};

const setDefaultImage = (event) => {
  event.target.src = defaultCarImage;
};



// Lifecycle hooks
onMounted(async () => {
  try {
    loading.value = true;
    
    // Primero cargamos los datos del auto
    await carStore.loadCarById(carId);
    
    // despues los del dueño
    if (car.value?.ownerId) {
      const ownerDataResponse = await userStore.getUserById(car.value.ownerId);
      if (ownerDataResponse) {
        carOwner.value = ownerDataResponse;
      }
    }

    // Configuramos la imagen principal
    if (car.value?.photos?.length > 0) {
      currentImage.value = car.value.photos[0];
    }
    
    // Cargamos Google Maps si hay coordenadas
    if (car.value?.status?.currentLocation?.location) {
      const coordenadas = car.value.status.currentLocation.location;
      console.log("Coordenadas:", coordenadas)
      await loadGoogleMaps(); // Usamos la función del servicio
      
      // Inicializamos el mapa con las coordenadas del auto
      const mapInstance = await initMap('map');
      
      if (mapInstance && car.value.status.currentLocation.location) {
        // Centramos el mapa en la ubicación del auto
        mapInstance.setCenter({
          lat: car.value.status.currentLocation.location.lat,
          lng: car.value.status.currentLocation.location.lng
        });
        
        // Añadimos un círculo para resaltar la zona
        new google.maps.Circle({
          strokeColor: "#5DADE2",
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: "#A9D6F5",
          fillOpacity: 0.35,
          map: mapInstance,
          center: {
            lat: car.value.status.currentLocation.location.lat,
            lng: car.value.status.currentLocation.location.lng
          },
          radius: 1000,
        });
      }
    }
  } catch (error) {
    errorMsg.value = "Hubo un error al obtener los detalles del auto";
    console.error("Error:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="w-full flex flex-col md:flex-row">
    <section v-if="car.id" class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
      <div class="flex items-center gap-5">
        <BackButton />
        <Heading :type="1" class="medium">Alquilar auto</Heading>
      </div>
      <article class="flex flex-col gap-9 bg-background-900 overflow-auto px-5">
        <div class="flex flex-col gap-5">
          <!-- Imagen principal del carrusel -->
          <figure class="my-auto w-full max-h-64 mx-auto overflow-hidden rounded-2xl relative">
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
          <div v-if="car.photos?.length > 1" class="flex justify-between gap-2.5">
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
        <div class="flex items-end justify-between mt-4">
          <Heading :type="2" class="large flex flex-col">
            <span class="text-background-600 text-lg!">
              {{ car.basicInfo?.brand }}
            </span> 
            {{ car.basicInfo?.model }}
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
            <span>{{ car.basicInfo?.year }}</span>
          </li>
          <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
            <p>Tipo:</p>
            <span>{{ car.basicInfo?.type }}</span>
          </li>
          <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700 ">
            <p>Motor:</p>
            <span>{{ car.specifications?.engine }}</span>
          </li>
          <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
            <p>Transmisión:</p>
            <span>{{ car.specifications?.transmission }}</span>
          </li>
          <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
            <p>Combustible:</p>
            <span>{{ car.specifications?.fuelType }}</span>
          </li>
        </ul>
        <div class="flex flex-col gap-4">
          <Heading :type="2" class="medium">Descripción</Heading>
          <p class="break-words">
            {{ car.status?.description }}
          </p>
        </div>
        <div class="flex flex-col gap-4">
          <Heading :type="2" class="medium">Accesorios</Heading>
          <div  class="flex flex-wrap gap-2 text-gray-700">
            <Pill v-for="(accessory, index) in car.features?.accessories" :key="index" :accessory="accessory" :name="accessory" />
  
          </div>
        </div>
      </article>
    </section>
  
    <section v-else-if="loading" class="w-full h-full flex items-center justify-center">
      <Loading />
      <div v-if="carStore.loading" class="flex justify-center items-center h-64">
        <Loading role="status" class="h-6 w-6 text-blue-500" />
      </div>
  </section>

  <section v-else-if="loading" class="w-full h-full flex items-center justify-center">
    <div v-if="carStore.loading" class="flex justify-center items-center h-64">
      <Loading role="status" class="h-6 w-6 text-blue-500" />
    </div>
  </section>
  
  <section v-else class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
    <p>{{ carStore.errorMessage }}</p>
  </section>

  <section v-else class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
    <p v-if="errorMsg">{{ errorMsg || 'No se encontró el vehículo' }}</p>
  </section>
  
  <div class="m-2.5 w-full flex flex-col gap-3">
    <div class="map-container">
      <div 
        id="map"
        style="width: 100%; height: 300px; border-radius: 40px;"
        v-show="store.currentStep === 1"
      ></div>
    </div>
  
    <div v-if="authStore.user?.id !== carStore.car.ownerId" class="bg-deep-blue-900 w-full rounded-[40px] p-8 max-h-full overflow-y-scroll">
      
      <RentalProcess 
        v-if="!loading && !errorMsg && carStore.car && authStore.user?.id "
        :car-id="carStore.car.id"
        :user-id="authStore.user.id"
        :is-car-rented="store.isRented"
      />  
    </div>

    <span v-if="store.isRented && !carStore.isUserOwner"
      class="bg-red-100 text-red-800 text-base font-medium me-2 px-2.5 py-0.5 rounded-sm border border-red-400">
      {{ carStore.isUserOwner ? 'Tu auto ya está alquilado' : 'Este auto ya está alquilado' }}
    </span>
  </div>
  </div>

</template>