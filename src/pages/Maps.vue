<script>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { getAvailableCars, addCar } from "../services/car-service.js";
import { updateCars, initAutocomplete, updateMapMarkers, loadGoogleMaps, initMap, getCurrentLocation } from "../services/google-maps.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";
import Input from "@components/molecules/Input.vue";
import SearchIcon from "@icons/Search.vue";

import AddressInput from "@/components/organisms/google-maps/AddressInput.vue";
import comentarioIcon from '@/assets/marcador.png';

export default {
  name: "Maps",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput, Input, SearchIcon },
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
      showSuggestions: false,
    };
  },
  setup() {
    const router = useRouter();
    const searchInputRef = ref(null);

  onMounted(() => {
    if (router.currentRoute.value.query.focusSearch === 'true') {
      searchInputRef.value?.focus();
      // Eliminar el query param
      router.replace({ query: {} });
    }
  });
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

    useMyLocation() {
      this.showSuggestions = false;
      getCurrentLocation(this.handlePlaceSelected);
    },
  },
  async mounted() {
    
    await loadGoogleMaps();
    this.map = await initMap('map')
    initAutocomplete('searchInput', this.handlePlaceSelected);

    getCurrentLocation((location) => {
      this.searchLocation = location;
      if (this.map && this.searchLocation) {
        this.map.setCenter(this.searchLocation);
        this.map.setZoom(14);
      }
      // this.applyFilters(); // esto usa searchLocation actual
    });

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
  <section class="w-full d:min-h-full overflow-hidden m-2.5">

    <Input
      ref="searchInputRef"
      type="text"
      id="searchInput"
      name="searchInput"
      placeholder="Buscar un auto..."
      class="absolute top-20 left-1/2 transform -translate-x-1/3 w-80 border focus-within:ring-primary-500 z-48"
      icon-position="left"
      variant="secondary"
      :outline="false"
      >
      <template #icon>
        <SearchIcon />
      </template>
    </Input>

    <div
      class="absolute top-10 left-1/2 transform -translate-x-1/3 w-80 z-50"
      @click.away="showSuggestions = false"
    >

  <!-- Dropdown de sugerencias -->
  <div
    v-if="showSuggestions"
    class="bg-white mt-2 rounded-lg shadow-lg border border-gray-200 overflow-hidden"
  >
    <button
      @click="useMyLocation"
      class="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
    >
      📍 Utilizar mi ubicación
    </button>
  </div>
</div>
    <!-- Mapa -->
    <div class="flex-1 relative h-full overflow-hidden rounded-3xl">
      <div id="map" class="absolute top-0 left-0 w-full h-full"></div>
    </div>

    <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div>

    <template v-if="loggedUser.id == null">
      <router-link to="/Login"
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


