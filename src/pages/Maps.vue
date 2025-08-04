<script setup>
import { ref, onMounted, watch, computed  } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "@/stores/auth.store.js";
import { getAvailableCars } from "@/services/car";
import { updateCars, initAutocomplete, updateMapMarkers, loadGoogleMaps, initMap, getCurrentLocation } from "../services/google-maps.js";
import { addAlert } from "@/services/alerts.js";

import Heading from "@components/atoms/Heading.vue";
import comentarioIcon from '@/assets/mark.png';
import Loading from "@icons/Loading.vue";
import Input from "@components/molecules/Input.vue";
import SearchIcon from "@icons/Search.vue";
import Status from "@components/molecules/Status.vue";
import BackButton from "@components/atoms/BackButton.vue";
import Arrow from "@icons/Arrow.vue";

const router = useRouter();
const authStore = useAuthStore();
const loggedUser = ref({ id: null, email: null }); 

const selectedCar = ref(null);
const cars = ref([]); 
const searchQuery = ref("");
const searchLocation = ref(null);
const filteredCars = ref([]); 
const map = ref(null); 
const markers = ref([]); 
const loading = ref(false);
const showSuggestions = ref(false);

const updateMapMarkersService = async () => {
  if (map.value) {
    markers.value = await updateMapMarkers(
      map.value,
      filteredCars.value,
      markers.value,
      comentarioIcon,
      handleCarSelected 
    );
  }
};

const filterCars = async () => {
  // console.log('[Maps.vue filterCars] Iniciando. searchLocation:', searchLocation.value, 'cars.value.length:', cars.value.length);
  if (!cars.value || cars.value.length === 0) {
    filteredCars.value = [];
    await updateMapMarkersService();
    return;
  }

  // Filtrar primero los autos con coordenadas válidas
  const validCars = cars.value.filter(car => {
    return car?.status?.currentLocation?.location &&
           typeof car.status.currentLocation.location.lat === 'number' &&
           typeof car.status.currentLocation.location.lng === 'number';
  });

  if (validCars.length !== cars.value.length) {
    const invalidCount = cars.value.length - validCars.length;
    console.warn(`[Maps.vue filterCars] ${invalidCount} autos omitidos por coordenadas inválidas`);
  }

  if (map.value && searchLocation.value && typeof searchLocation.value.lat === 'number' && typeof searchLocation.value.lng === 'number') {
    filteredCars.value = updateCars(validCars, searchLocation.value);
  } else {
    filteredCars.value = [...validCars];
  }

  await updateMapMarkersService();
};

const fetchCars = async () => {
  loading.value = true;
  try {
    cars.value = await getAvailableCars(loggedUser.value?.id);
    
    // Verificar estructura pero sin mostrar alerta si hay problemas
    const hasInvalidCars = cars.value.some(car => 
      !car?.status?.currentLocation?.location ||
      typeof car.status.currentLocation.location.lat !== 'number' ||
      typeof car.status.currentLocation.location.lng !== 'number'
    );
    
    if (hasInvalidCars) {
      console.warn('[Maps.vue fetchCars] Algunos coches tienen estructura de ubicación inválida');
      // No mostramos alerta al usuario
    }
    
    await filterCars();
  } catch (error) {
    console.error("Error al buscar autos:", error);
    addAlert("Error al cargar los vehículos.", "error");
    filteredCars.value = [];
    await updateMapMarkersService();
  } finally {
    loading.value = false;
  }
};

const goToCarDetails = (carId) => {
  router.push({ name: "CarDetails", params: { id: carId } });
};

const handlePlaceSelected = async ({ formattedAddress, location }) => {
  searchLocation.value = location;
  searchQuery.value = formattedAddress;

  if (map.value && location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    map.value.setCenter(location);
    map.value.setZoom(14);
  }
  await filterCars(); 
  showSuggestions.value = false;
};

const handleCarSelected = (carFromMarker) => {
  selectedCar.value = carFromMarker;
  if (map.value && carFromMarker.status && 
      carFromMarker.status.currentLocation && 
      carFromMarker.status.currentLocation.location && 
      typeof carFromMarker.status.currentLocation.location.lat === 'number' && 
      typeof carFromMarker.status.currentLocation.location.lng === 'number') { 
    const newCenter = new google.maps.LatLng(
      carFromMarker.status.currentLocation.location.lat, 
      carFromMarker.status.currentLocation.location.lng 
    );
    map.value.panTo(newCenter);
    map.value.setZoom(16);
  } else {
    console.warn('[Maps.vue handleCarSelected] Coordenadas inválidas o mapa no listo:', carFromMarker.status.currentLocation.location);  }
};

const closeCarDetails = () => {
  selectedCar.value = null;
  if (map.value && searchLocation.value) {
    // map.value.setZoom(14);
    // map.value.panTo(searchLocation.value); // Optionally re-center to the search location
    map.value.setZoom(14); // Default zoom when closing details
    if (searchLocation.value && typeof searchLocation.value.lat === 'number' && typeof searchLocation.value.lng === 'number') {
      // map.value.panTo(searchLocation.value); // Optionally re-center to the last search location
    }
  } else if (map.value) {
     map.value.setZoom(14);
  }
};

const useMyLocation = async () => {
  showSuggestions.value = false;
  loading.value = true;
  try {
    const place = await getCurrentLocation();
    // handlePlaceSelected will update searchLocation, searchQuery, map center, and filter cars
    await handlePlaceSelected(place);
  } catch (error) {
    console.error("Error al usar mi ubicacion:", error);
    addAlert("No se pudo obtener tu ubicación actual.", "error");
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  await loadGoogleMaps();
  map.value = await initMap('map');
  initAutocomplete('searchInput', handlePlaceSelected);
  // console.log('[Maps.vue onMounted] Montado. La geolocalización se activará manualmente por el usuario.');
});

watch([() => authStore.user, () => authStore.isInitialized], async ([currentUser, initialized]) => {
  if (!initialized) {
    // Opcional: puedes mostrar un estado de carga aquí si el store aún no está listo.
    // loading.value = true; // Por ejemplo, si quieres mostrar un spinner global.
    console.log('[Maps.vue authStore watch] authStore no inicializado todavía. Esperando...');
    return; // No hacer nada hasta que el store esté inicializado.
  }
  // loading.value = false; // Quitar el loading si se puso arriba
  loggedUser.value = currentUser ? { id: currentUser.id, email: currentUser.email } : { id: null, email: null };

  if (loggedUser.value && loggedUser.value.id) {
    // console.log('[Maps.vue authStore.user watch] Usuario autenticado. Buscando coches.');
    await fetchCars();
    // En este punto, filterCars() dentro de fetchCars() usará el searchLocation.value actual.
    // Si getCurrentLocation() aún no ha terminado, searchLocation.value será null, y se mostrarán todos los coches.
  } else {
    // console.log('[Maps.vue authStore.user watch] Usuario no autenticado. Limpiando datos.');
    cars.value = [];
    filteredCars.value = [];
    selectedCar.value = null;
    await updateMapMarkersService();
  }
}, { immediate: true });
// }, { immediate: true, deep: true });
</script>

<template>
  <section class="w-full overflow-hidden m-2.5 flex gap-5">

    <div 
      v-if="selectedCar"
      class="box-white fixed overflow-y-hidden inset-0 md:static z-60 bg-white px-2.5 py-5 pb-23 md:pb-2.5 md:backdrop-blur-0 md:shadow-none transition-all duration-300 ease-in-out transform md:translate-x-0 md:opacity-100 flex flex-col md:w-1/3 h-full gap-4 md:rounded-3xl"
      :class="{
        'translate-x-0 opacity-100': selectedCar,
        'translate-x-full opacity-0': !selectedCar
      }">

        <!-- Estado y editar -->
      <div class="flex justify-between items-start">
        <div  class="flex gap-4 items-end">
          <Heading :type="1" class="medium">{{ selectedCar.basicInfo.brand }} {{ selectedCar.basicInfo.model }} {{ selectedCar.basicInfo.year }}</Heading>
          <p class="text-lg font-semibold text-gray-800">{{ selectedCar.pricing.rates.daily }}/día</p>
        </div>
          <!-- Botón de cerrar -->
          <button @click="closeCarDetails" class=" hover:bg-vibrant-light-700 focus:bg-vibrant-light-800 rounded-full p-2 z-1 cursor-pointer">
            <Arrow direction="right"/>
          </button>
        </div>
        <div class="flex-1 overflow-hidden overflow-y-auto flex flex-col pr-2 gap-5">

          <!-- Imagen principal -->
          <div class="relative">
            <div class="flex gap-2 absolute top-2 right-2 z-50">
              <Status :status="selectedCar.status.current" size="small" />
            </div>
            <img
              :src="selectedCar.photos && selectedCar.photos.length > 0 ? selectedCar.photos[0] : '/src/assets/Car-Img.png'"
              alt="Auto"
              class="rounded-xl w-full max-w-[500px] h-[280px] object-cover mx-auto transition-transform duration-500 ease-in-out image-fade"
            />
          </div>
  
          <!-- Galería -->
          <div class="md:flex flex-1 justify-between gap-2 w-full h-24 hidden">
            <img v-for="(image, index) in selectedCar.photos"
              :key="index"
              :src="image"
              class="aspect-square w-fit object-cover rounded-xl border border-gray-300 cursor-pointer transition duration-300 ease-in-out flex-1" />
          </div>
  
          <!-- Datos adicionales -->
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular">Especificaciones</Heading>
            <ul class="flex flex-col gap-2">
              <li class="flex justify-between items-center">
                <div class="font-medium">Año</div>
                <div>{{ selectedCar.basicInfo.year }}</div>
              </li>
              <li class="flex justify-between items-center">
                <div class="font-medium">Chasis</div>
                <div>{{ selectedCar.basicInfo.type }}</div>
              </li>
              <li class="flex justify-between items-center">
                <div class="font-medium">Kilometraje</div>
                <div>{{ selectedCar.basicInfo.kilometers }} km</div>
              </li>
              <li class="flex justify-between items-center">
                <div class="font-medium">Transmisión</div>
                <div>{{ selectedCar.specifications.transmission }}</div>
              </li>
              <li class="flex justify-between items-center">
                <div class="font-medium">Asientos</div>
                <div>{{ selectedCar.specifications.seats }}</div>
              </li>
            </ul>
          </div>
        </div>
      
      <!-- Botón de Alquilar -->
        <Input
          type="button"
          @click="goToCarDetails(selectedCar.id)"
          text="Ver detalles"
          variant="primary"
          :outline="false"
          class="cursor-pointer w-full flex-0! min-w-fit! sticky bottom-0"
        />
      
    </div>
    
    <div class="flex-1 relative h-full overflow-hidden rounded-3xl md:p-5">
      <!-- Mapa -->
      <div id="map" class="absolute inset-0 w-full h-full z-3" @click.away="showSuggestions = false"></div>
      <BackButton class="absolute z-5 top-5 left-5" color="#FFFFFF"/>
      <!-- Buscador dentro del mapa -->
      <div 
        class="absolute top-20 md:top-10 w-full flex z-4 justify-center flex-row-reverse h-0.5"
        >
        <Input
          ref="searchInputRef"
          v-model="searchQuery"
          type="text"
          id="searchInput"
          name="searchInput"
          placeholder="Buscar un auto..."
          icon-position="left"
          variant="secondary"
          class="!w-fit"
          :outline="false"
          :autofocus="true"
          @focusin="showSuggestions = true" @click.stop
          >
          <template #icon>
            <SearchIcon />
          </template>
        </Input>
        <div 
          v-if="showSuggestions"
          class="relative">
          <Input
            type="button"
            @click="useMyLocation"
            text="📍Utilizar mi ubicación"
            variant="secondary"
            :outline="true"
            input-class="w-fit !min-w-[290px]"
            class="cursor-pointer absolute top-8 z-20 left-0"
          />
        </div>
      </div>
    </div>

    <div v-if="loading && !selectedCar"
      class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div>
  </section>
</template>

<style>
.image-fade {
  opacity: 0;
  animation: fadeIn 0.8s ease forwards;
}

.fade-zoom-enter-active, .fade-zoom-leave-active {
  transition: all 0.4s ease;
}
.fade-zoom-enter-from, .fade-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
.fade-zoom-enter-to, .fade-zoom-leave-from {
  opacity: 1;
  transform: scale(1);
}

/* Mobile First Layout */
@media (min-width: 768px) {
  .translate-x-full {
    transform: translateX(100%);
  }
  .translate-x-0 {
    transform: translateX(0);
  }
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}
</style>
