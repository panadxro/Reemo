<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { updateCars, initAutocomplete, updateMapMarkers, loadGoogleMaps, initMap } from "../services/google-maps.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";

import AddressInput from "@/components/organisms/google-maps/AddressInput.vue";

// import comentarioIcon from '@/assets/info-maps.png';
// import comentarioIcon from '@/assets/comentario.png';
// import comentarioIcon from '@/assets/coche.png';
// import comentarioIcon from '@/assets/Reemo-icon.png';
// import comentarioIcon from '@/assets/autito.webp';
import comentarioIcon from '@/assets/marcador.png';

export default {
  name: "Maps",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput },
  data() {
    return {
      activeOverlay: null,
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
    };
  },
  methods: {
    async fetchCars() {
      this.loading = true;
      try {
        this.cars = await getAvailableCars(this.loggedUser.id);

        this.filteredCars = this.cars;

      } catch (error) {
        console.error("Error al buscar autos:", error);
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

    filterCars() {
      this.filteredCars = updateCars(this.cars, this.searchLocation, this.map);
      setTimeout(() => this.updateMapMarkers(), 500)
    },

    handlePlaceSelected({ formattedAddress, location }) {
      this.searchQuery = formattedAddress;
      this.searchLocation = location;
      this.filterCars();
    },

    async updateMapMarkers() {
      this.markers = await updateMapMarkers(this.map, this.filteredCars, this.markers, comentarioIcon, this);
    },


  },
  async mounted() {
    
    await loadGoogleMaps();
    this.map = await initMap('map')
    initAutocomplete('searchInput', this.handlePlaceSelected);

    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      this.fetchCars();
    });

    subscribeToNewPublication((newCars) => {
      this.cars = newCars;
    });
  },
};
</script>

<template>
  <section> 

    <Heading :type="1" class="m-6 text-center">Alquilá autos por tu zona</Heading>
    
    <!-- Input de busqueda con places de google Maps -->
    <div class="relative">
      <div class="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
        <svg class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>
      <input type="text" id="searchInput"
        class="block p-4 pl-10 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-primary-300 focus:ring-primary-500 focus:border-primary-500 my-5"
        placeholder="Buscar autos cerca de tu ubicacion" required>
    </div>
    

    <!-- Renderizado del mapa -->
    <div id="map" style="width: 100%; height: 400px;"></div>

    <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div>

    <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <div v-for="car in filteredCars" :key="car.id" class="p-4 border rounded">
    <h2 class="font-bold">{{ car.marca }} {{ car.modelo }}</h2>
    <p><strong>Dirección:</strong> {{ car.direccion }}</p>
    <p><strong>Precio:</strong> ${{ car.precio }}</p>
    <img :src="car.imagen || 'imagen_default.jpg'" alt="Carro" class="w-full h-32 object-cover">
  </div>
</div> -->

    <div
      class="max-w-md mx-auto md:max-w-screen-xl m-4 grid justify-items-center gap-4 md:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="(car, index) in filteredCars" :key="car.id"
        class="rounded-2xl shadow-md relative flex relative flex-col shadow-sm w-full overflow-hidden hover:bg-primary-300">
        <CardCar :car="car" />
      </div>
    </div>

    <template v-if="loggedUser.id == null">
      <router-link to="/Login"
        class="fixed gap-4 md:flex z-50 items-center justify-center bottom-0 right-0 m-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full md:rounded-lg text-md px-2 md:px-4 py-2 text-center">
        <span class="hidden md:block">Publicar Vehículo</span>
        <AddIcon />
      </router-link>
    </template>

    <template v-else>
      <router-link to="/Publish"
        class="fixed gap-4 md:flex z-50 items-center justify-center bottom-0 right-0 m-8 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full md:rounded-lg text-md px-2 md:px-4 py-2 text-center">
        <span class="hidden md:block">Publicar Vehículo</span>
        <AddIcon />
      </router-link>
    </template>


  </section>
</template>

<style>
  .custom-infowindow {
  max-width: 300px;
  background: white;
  border-radius: 12px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  position: relative;
}

.infowindow-container {
  display: flex;
  flex-direction: column;
}

.infowindow-image img {
  padding: 0 !important;
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.infowindow-details {
  padding: 8px;
  text-align: left;
}

.infowindow-btn {
  width: 100%;
  background: #2A3EF4;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.infowindow-btn:hover {
  background: #1d2ecb;
}


/* .gm-ui-hover-effect {
  display: none !important;
}

.gm-style-iw {
  box-shadow: none !important;
  border-radius: 10px;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
  max-width: none !important;
} */

/* Saca el scroll */
/* .gm-style-iw-d {
  min-height: 250px !important;
  max-height: none !important;
  max-width: none !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.gm-style-iw-c {
  height: auto !important;
  max-height: none !important;
} */



.custom-overlay {
  position: absolute;
  background: white;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  text-align: center;
  font-size: 12px;
  transform: translate(-50%, -100%);
}

.custom-overlay img {
  width: 60px;
  height: 60px;
  border-radius: 5px;
}

.custom-overlay p {
  margin: 5px 0;
}

</style>