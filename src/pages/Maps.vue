<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { updateCars, initAutocomplete, updateMapMarkers, loadGoogleMaps, initMap, getCurrentLocation } from "../services/google-maps.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";

import AddressInput from "@/components/organisms/google-maps/AddressInput.vue";

import comentarioIcon from '@/assets/marcador.png';

export default {
  name: "Maps",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput },
  data() {
    return {
      // activeOverlay: null,
      selectedCar: null,
      cars: [],
      searchQuery: "",
      searchLocation: "",
      filteredCars: [],
      map: null,
      markers: [],
      loggedUser: {
        id: null,
        email: null,
      },
      loading: false,
      showSuggestions: false,
      car : {
        owner: {
         name: 'Jazmín Vega',
         avatar: 'https://i.pravatar.cc/40?img=5'
      }
    }
    };
  },
  methods: {
    async fetchCars() {
      this.loading = true;
      try {
        this.cars = await getAvailableCars(this.loggedUser.id);
        // this.filteredCars = this.cars;
        // Si hay una búsqueda activa (searchLocation está definida),
        // re-aplicar el filtro ahora que los coches están cargados.
        // De lo contrario, simplemente actualiza los marcadores con todos los coches.
        if (this.searchLocation && typeof this.searchLocation.lat === 'number' && typeof this.searchLocation.lng === 'number') {
          console.log('[Maps.vue] fetchCars: Hay una searchLocation activa, re-filtrando coches.');
          await this.filterCars();
        } else {
          console.log('[Maps.vue] fetchCars: No hay searchLocation activa, mostrando todos los coches.');
          this.filteredCars = this.cars; // Mostrar todos
          await this.updateMapMarkers();
        }

        // console.log(`[Maps.vue] fetchCars: ${this.cars.length} coches cargados. Mostrando todos inicialmente.`);
        // await this.updateMapMarkers(); 

      } catch (error) {
        console.error("Error al buscar autos:", error);
        this.cars = []; // Asegurar que cars esté vacío en caso de error
        this.filteredCars = [];
        await this.updateMapMarkers(); // Limpiar marcadores en caso de error
      } finally {
        this.loading = false;
      }
    },


    async addNewCar(newCar) {
      try {
        const addedCar = await addCar(newCar);
        this.cars.push(addedCar);
      } catch (error) {
        console.error("Error al agregar un nuevo auto:", error);
      }
    },

    
    goToCarDetails(carId) {
      this.$router.push({ name: "CarDetails", params: { id: carId } });
    },

    async filterCars() {
      if (this.map && this.searchLocation && typeof this.searchLocation.lat === 'number' && typeof this.searchLocation.lng === 'number') {
        // Centrar el mapa aquí primero si es necesario o si updateCars no lo hace siempre
        this.map.setCenter(this.searchLocation);
        this.map.setZoom(14); // O el zoom deseado
        this.filteredCars = updateCars(this.cars, this.searchLocation, this.map);
        await this.updateMapMarkers();
      } else {
        console.warn('[filterCars] searchLocation no es valido para filtrar o centrar el mapa', this.searchLocation);
        // Opcionalmente, mostrar todos los autos si no hay ubicación de búsqueda
        this.filteredCars = this.cars;
        await this.updateMapMarkers();
      }
    },
    
    async handlePlaceSelected({ formattedAddress, location }) {
      this.searchLocation = location;
      // Centrar el mapa inmediatamente con las nuevas coordenadas
      if(this.map && this.searchLocation && typeof this.searchLocation.lat === 'number' && typeof this.searchLocation.lng === 'number') {
        this.map.setCenter(this.searchLocation);
        this.map.setZoom(14);
      }
      this.searchQuery = formattedAddress;
      await this.filterCars();
      this.showSuggestions = false;
    },

    handleCarSelected(car) {
      this.selectedCar = car;
      console.log('esto contiene selectedCars', this.selectedCar)
      // Centrar el mapa en el coche seleccionado y hacer zoom
      if (this.map && car.coordenadas && typeof car.coordenadas.lat === 'number' && typeof car.coordenadas.lng === 'number') {
        const newCenter = new google.maps.LatLng(car.coordenadas.lat, car.coordenadas.lng);
        console.log('[Maps.vue] handleCarSelected: Centrando mapa en:', newCenter.toJSON(), 'y zoom a 16');
        this.map.panTo(newCenter);
        this.map.setZoom(16);
      } else {
        console.warn('[Maps.vue] handleCarSelected: No se puede centrar el mapa. Verifique las condiciones:');
        console.warn('  - this.map:', this.map);
        console.warn('  - car.coordenadas:', car.coordenadas);
        if(car.coordenadas) console.warn('  - typeof car.coordenadas.lat:', typeof car.coordenadas.lat, 'typeof car.location.lng:', typeof car.location.lng);
      }
    },  

    closeCarDetails() {
      this.selectedCar = null;
      // Opcionalmente, puedes resetear el zoom/centro del mapa aquí si lo deseas
      this.map.setZoom(14);
    },

    async updateMapMarkers() {
      if (this.map) {
        this.markers = await updateMapMarkers(this.map, this.filteredCars, this.markers, comentarioIcon, this.handleCarSelected);
      }
    },

    async useMyLocation() {
      this.showSuggestions = false;
      try {
        // Mostrar un indicador de carga si es necesario
        this.loading = true; // Necesitarías añadir esta data property
        const place = await getCurrentLocation();
        this.loading = false;

        // Ya tenemos 'place.location' y 'place.formattedAddress'
        // handlePlaceSelected se encargará de centrar, actualizar input y filtrar
        await this.handlePlaceSelected(place);
      } catch (error) {
        console.error("Error al usar mi ubicacion:", error);
        addAlert("No se pudo obtener tu ubicación actual.", "error");
        // Aquí podrías usar tu servicio de alertas para notificar al usuario
        // addAlert("No se pudo obtener tu ubicación actual.", "error");
      }
    },

    // useMyLocation() {
    //   this.showSuggestions = false;
    //   getCurrentLocation(this.handlePlaceSelected);
    // },
  },
  async mounted() {
    
    await loadGoogleMaps();
    this.map = await initMap('map')
    initAutocomplete('searchInput', this.handlePlaceSelected);

    try {
      const initialPlace = await getCurrentLocation();
      this.searchLocation = initialPlace.location;
      this.searchQuery = initialPlace.formattedAddress;
      console.log('[Maps.vue] mounted: Ubicación inicial obtenida:', initialPlace.formattedAddress, 'Coords:', initialPlace.location);
      if (this.map && this.searchLocation && typeof this.searchLocation.lat === 'number' && typeof this.searchLocation.lng === 'number') {
        this.map.setCenter(this.searchLocation); // Centrar el mapa con la ubicación inicial
        this.map.setZoom(14); // Un zoom un poco más alejado para el inicio
      }
    } catch (error) {
      console.warn("No se pudo obtener la ubicación inicial:", error);
      // El mapa se centrará en la ubicación por defecto de initMap
    }
    // getCurrentLocation((location) => {
    //   this.searchLocation = location;
    //   if (this.map && this.searchLocation) {
    //     this.map.setCenter(this.searchLocation);
    //     this.map.setZoom(14);
    //   }
    //   // this.applyFilters(); // esto usa searchLocation actual
    // });

    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      if (newUserData && newUserData.id) {
        console.log('[Maps.vue] mounted: Usuario autenticado:', newUserData.email, 'ID:', newUserData.id, '. Buscando coches.');
        this.fetchCars(); // fetchCars ya llama a updateMapMarkers
      } else {
        console.log('[Maps.vue] mounted: Usuario no autenticado o datos de usuario incompletos. Limpiando coches y marcadores.');
        this.cars = [];
        this.filteredCars = [];
        this.selectedCar = null; // También limpia el coche seleccionado si el usuario se desloguea
        this.updateMapMarkers(); // Para limpiar los marcadores del mapa
      }
    });

    subscribeToNewPublication((newCars) => {
      this.cars = newCars;
      this.filterCars();
    });
  },
};
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
      <input type="text" id="searchInput" placeholder="¿Dónde necesitas un coche?"
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
