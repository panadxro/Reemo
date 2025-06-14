<script setup>
import { ref, onMounted, watch, computed  } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from "@/stores/auth.store.js";

import { getAvailableCars } from "../services/car-service.js";
import { updateCars, initAutocomplete, updateMapMarkers, loadGoogleMaps, initMap, getCurrentLocation } from "../services/google-maps.js";

import { addAlert } from "@/services/alerts.js";
import Heading from "@components/atoms/Heading.vue";
import comentarioIcon from '@/assets/marcador.png';
import Loading from "@icons/Loading.vue";


// const props = defineProps({
//   id: {
//     type: String,
//     required: true,
//   }
// });

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

// This 'car' object was used in the original template for static owner info
// when a car is selected. It's kept for template compatibility.
// Ideally, selectedCar would contain all necessary owner details.
const car = {
  owner: {
    name: 'Jazmín Vega',
    avatar: 'https://i.pravatar.cc/40?img=5'
  }
};


const updateMapMarkersService = async () => {
  if (map.value) {
    markers.value = await updateMapMarkers(
      map.value,
      filteredCars.value,
      markers.value, // Pass current markers to be updated/cleared
      comentarioIcon,
      handleCarSelected // Callback for when a marker is clicked
    );
  }
};

const filterCars = async () => {
  if (map.value && searchLocation.value && typeof searchLocation.value.lat === 'number' && typeof searchLocation.value.lng === 'number') {
    // Center map on search location
    map.value.setCenter(searchLocation.value);
    map.value.setZoom(14); // Adjust zoom as needed
    // Filter cars based on the current searchLocation
    filteredCars.value = updateCars(cars.value, searchLocation.value, map.value);
  } else {
    // If no valid search location, show all cars (or handle as per requirements)
    console.warn('[Maps.vue filterCars] searchLocation no es valido para filtrar o centrar el mapa.', searchLocation.value);
    filteredCars.value = [...cars.value]; // Display all fetched cars
  }
  await updateMapMarkersService(); // Update markers with the new filtered list
};

const fetchCars = async () => {
  loading.value = true;
  try {
    // Fetch cars, potentially based on logged-in user
    cars.value = await getAvailableCars(loggedUser.value?.id);
    // After fetching, apply current filters (which might be based on searchLocation)
    await filterCars();
  } catch (error) {
    console.error("Error al buscar autos:", error);
    addAlert("Error al cargar los vehículos.", "error");
    cars.value = [];
    filteredCars.value = [];
    await updateMapMarkersService(); // Clear markers on error
  } finally {
    loading.value = false;
  }
};

const goToCarDetails = (carId) => {
  router.push({ name: "CarDetails", params: { id: carId } });
};

const handlePlaceSelected = async ({ formattedAddress, location }) => {
  searchLocation.value = location;
  searchQuery.value = formattedAddress; // Update the input field display

  if (map.value && location && typeof location.lat === 'number' && typeof location.lng === 'number') {
    map.value.setCenter(location);
    map.value.setZoom(14);
  }
  await filterCars(); // Filter cars based on new location
  showSuggestions.value = false;
};

const handleCarSelected = (carFromMarker) => {
  selectedCar.value = carFromMarker;
  if (map.value && carFromMarker.coordenadas && typeof carFromMarker.coordenadas.lat === 'number' && typeof carFromMarker.coordenadas.lng === 'number') {
    const newCenter = new google.maps.LatLng(carFromMarker.coordenadas.lat, carFromMarker.coordenadas.lng);
    map.value.panTo(newCenter);
    map.value.setZoom(16);
  } else {
    console.warn('[Maps.vue handleCarSelected] Coordenadas inválidas o mapa no listo:', carFromMarker.coordenadas);
  }
};

const closeCarDetails = () => {
  selectedCar.value = null;
  if (map.value && searchLocation.value) {
     map.value.setZoom(14);
     // map.value.panTo(searchLocation.value); // Optionally re-center to the search location
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
  map.value = await initMap('map'); // initMap should return the map instance
  initAutocomplete('searchInput', handlePlaceSelected); // Initialize autocomplete on the input

  // Attempt to get initial location
  try {
    const initialPlace = await getCurrentLocation();
    // Set initial search location and query. handlePlaceSelected will then filter cars.
    searchLocation.value = initialPlace.location;
    searchQuery.value = initialPlace.formattedAddress;
    if (map.value && searchLocation.value) {
        map.value.setCenter(searchLocation.value);
        map.value.setZoom(14); // Initial zoom level
    }
    console.log('[Maps.vue onMounted] Ubicación inicial obtenida y mapa centrado.');
    // Cars will be fetched based on auth state or if explicitly called after this.
  } catch (error) {
    console.warn("[Maps.vue onMounted] No se pudo obtener la ubicación inicial:", error);
    // Proceed without initial location; map will use its default center.
    // Cars will be fetched by auth state change, potentially showing all if no searchLocation.
  }

});

// Watch for changes in authentication state
watch([() => authStore.user, () => authStore.isInitialized], async ([currentUser, initialized]) => {
  if (!initialized) {
    // Opcional: puedes mostrar un estado de carga aquí si el store aún no está listo.
    // loading.value = true; // Por ejemplo, si quieres mostrar un spinner global.
    console.log('[Maps.vue authStore watch] authStore no inicializado todavía. Esperando...');
    return; // No hacer nada hasta que el store esté inicializado.
  }
  // Si llegamos aquí, el store está inicializado.
  // loading.value = false; // Quitar el loading si se puso arriba
  loggedUser.value = currentUser ? { id: currentUser.id, email: currentUser.email } : { id: null, email: null };

  if (loggedUser.value && loggedUser.value.id) {
    console.log('[Maps.vue authStore.user watch] Usuario autenticado. Buscando coches.');
    await fetchCars(); // Fetch cars for the logged-in user
  } else {
    console.log('[Maps.vue authStore.user watch] Usuario no autenticado. Limpiando datos.');
    cars.value = [];
    filteredCars.value = [];
    selectedCar.value = null;
    await updateMapMarkersService();
  }
}, { immediate: true, deep: true });

// All declared constants and functions (refs, router, local functions, imported functions/components)
// are automatically available to the template when using <script setup>.
// No explicit `return` statement is needed from setup().

</script>

<template>
  <section class="h-screen flex flex-col md:flex-row p-4 gap-4 relative overflow-hidden ">

    <!-- Panel de Detalles del Vehículo Seleccionado -->
    <!-- class="relative w-full md:w-1/3 h-full bg-white rounded-3xl shadow-xl p-6 flex flex-col gap-4 transition-all duration-300 ease-in-out transform space-y-4 border border-gray-200" -->
    <div v-if="selectedCar"
    class="fixed overflow-y-hidden inset-0 md:static z-60 p-6 bg-white md:bg-transparent md:backdrop-blur-0 md:shadow-none transition-all duration-300 ease-in-out transform md:translate-x-0 md:opacity-100 flex flex-col md:w-1/3 h-full rounded-3xl shadow-xl border border-gray-200"
      :class="{
        'translate-x-0 opacity-100': selectedCar,
        'translate-x-full opacity-0': !selectedCar
      }">

      <div class="bg-white flex-1 overflow-y-auto space-y-4">
        <!-- Estado y editar -->
        <div class="flex justify-between items-center">
          <div class="space-x-2">
            <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Nuevo</span>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Disponible</span>
          </div>
          <!-- Botón de cerrar -->
          <button @click="closeCarDetails" class=" text-gray-500 hover:text-gray-700 z-20 cursor-pointer">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Imagen principal -->
        <img
          :src="selectedCar.images && selectedCar.images.length > 0 ? selectedCar.images[0] : '/src/assets/Car-Img.png'"
          alt="Auto"
          class="rounded-xl w-full max-w-[500px] h-[280px] object-cover mx-auto transition-transform duration-500 ease-in-out image-fade"
        />

        <!-- Galería -->
        <div class="flex gap-2 overflow-x-auto">
          <img v-for="(image, index) in selectedCar.images"
            :key="index"
            :src="image"
            class="w-16 h-16 object-cover rounded-xl border border-gray-300 cursor-pointer transition duration-300 ease-in-out" />
        </div>

        <!-- Datos principales -->
        <div>
          <p class="text-gray-500 text-sm">{{ selectedCar.marca }}</p>
          <h2 class="text-xl font-bold text-gray-800">{{ selectedCar.modelo }}</h2>
        </div>

        <!-- Dueño, precio y rating -->
        <div class="flex justify-between items-center">
          <div class="flex items-center gap-2">
            <img :src="car.owner.avatar" class="w-8 h-8 rounded-full" />
            <span class="text-sm text-gray-700">{{ car.owner.name }}</span>
          </div>
          <div class="text-right">
            <p class="text-lg font-semibold text-gray-800">{{ selectedCar.precio }}k <span class="text-sm text-gray-500">/hora</span></p>
            <p class="text-sm text-yellow-500 flex items-center gap-1">⭐ {{ selectedCar.rating || '4.0' }}</p>
          </div>
        </div>

        <!-- Datos adicionales -->
        <div class="grid grid-cols-2 text-sm text-gray-600 border-t pt-2 gap-y-1">
          <div class="font-medium">Año</div><div>{{ selectedCar.año }}</div>
          <div class="font-medium">Chasis</div><div>{{ selectedCar.chasis }}</div>
          <div class="font-medium">Transmisión</div><div>{{ selectedCar.transmision }}</div>
          <div class="font-medium">Kilometraje</div><div>{{ selectedCar.kilometraje }} km</div>
          <div class="font-medium">Asientos</div><div>{{ selectedCar.asientos }}</div>
          <!-- <div class="font-medium">Seguro</div><div>{{ selectedCar.seguro ? 'Sí' : 'No' }}</div> -->
        </div>

        <div>
          <Heading :type="4" class="text-primary-900 mb-1">descripcion</Heading>
          <p>{{ selectedCar.description }}</p>
        </div>

        
      </div>
      
      <!-- Botón de Alquilar -->
      <div class="sticky bottom-0">
        <button @click="goToCarDetails(selectedCar.id)"
          class="mt-auto w-full bg-[#0a0a3c] hover:bg-primary-700 text-white font-semibold py-3 px-4 rounded-lg cursor-pointer transition duration-150 ease-in-out">
          Ver Detalles y Alquilar
        </button>
      </div>
      
    </div>

    <!-- <div
      class="absolute top-20 left-1/2 transform -translate-x-1/3 bg-white/70 backdrop-blur-md shadow-md rounded-full flex items-center px-4 py-2 w-80 border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 z-48">
      <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" id="searchInput" placeholder="Buscar un auto..."
        class="bg-transparent outline-none text-gray-700 w-full pl-2 placeholder-gray-400">
    </div> -->

<!-- Aca se renderiza mi mapa -->
<div class="flex-1 relative rounded-3xl w-full h-full overflow-hidden">
  <div id="map" class="absolute inset-0 w-full h-full z-10"></div>

  <!-- Buscador dentro del mapa -->
  <div class="absolute top-4 left-1/2 transform -translate-x-1/2 w-11/12 sm:w-80 z-20"
       @click.away="showSuggestions = false">

    <div
      class="bg-white/70 backdrop-blur-md shadow-md rounded-full flex items-center px-4 py-2 border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500"
      @focusin="showSuggestions = true" @click.stop>
      <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" id="searchInput" v-model="searchQuery" placeholder="¿Dónde necesitas un coche?"
        class="bg-transparent outline-none text-gray-700 w-full pl-2 placeholder-gray-400" />
    </div>

    <div v-if="showSuggestions"
      class="bg-white mt-2 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      <button @click="useMyLocation"
        class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm">📍 Utilizar mi ubicación</button>
    </div>

  </div>
</div>

    <div v-if="loading && !selectedCar"
      class="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-20">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div>

    <!-- <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50" :class="{'w-2/3': selectedCar, 'w-full': !selectedCar}">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div> -->

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
