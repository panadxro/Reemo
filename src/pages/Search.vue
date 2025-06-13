<script>
import { getAvailableCars } from "../services/car";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import { updateCars, initAutocomplete, loadGoogleMaps } from "../services/google-maps.js";
import { filterByPreferences } from "../services/filterService.js";
import {reactive} from 'vue';

import AddressInput from "@/components/organisms/google-maps/AddressInput.vue";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";
import Input from "../components/molecules/Input.vue";
import Arrow from '@icons/Arrow.vue'
import PriceRange from "../components/molecules/PriceRange.vue";
import Checkbox from "../components/atoms/Checkbox.vue";


export default {
  name: "Search",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput, Input, Arrow, PriceRange, Checkbox },
  data() {
    return {
      loggedUser: {
        id: null,
        email: null,
      },
      cars: [],
      searchQuery: "",
      searchLocation: "",
      filteredCars: [],
      map: null,
      markers: [],
      loading: false,
      chassisTypes: ["Sedan", "Van", "SUV", "Pickup", "Minivan", "Coupe"], 
      selectedChassis: [], 
      savedFilters: null, 
      optionsTransmission: ["Ambos", "Manual", "Automatico"],
      selectedTransmission: [],
      filters: {
        transmission: '', 
        brand: '',
        model: '',
        minPrice: 20000,
        maxPrice: 100000,
        chassis: [],
      }
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
    // async addNewCar(newCar) {
    //   try {
    //     const addedCar = await addCar(newCar);
    //     this.cars.push(addedCar);
    //   } catch (error) {
    //     console.error("Error al agregar un nuevo auto:", error);
    //   }
    // },
    goToCarDetails(carId) {
      this.$router.push({ name: "CarDetails", params: { id: carId } });
    },

    handlePlaceSelected({ formattedAddress, location }) {
      this.searchQuery = formattedAddress;
      this.searchLocation = location;
      this.applyFilters();
    },

    applyFilters() {
      let carsToFilter = [];

      if ( this.searchLocation && this.searchLocation.lat && this.searchLocation.lng) {
        carsToFilter = updateCars(this.cars, this.searchLocation, this.map);
      } else {
        console.warn("⚠️ No se aplicó filtro por ubicación");
        // usamos todos los autos disponibles
        carsToFilter = this.cars; 
      }

      // luego filtramos por preferencias
      this.filteredCars = filterByPreferences(carsToFilter, this.filters);

      this.saveFiltersToLocalStorage();

      // console.log("filtros aplicados:", this.filters);
      // console.log("autos filtrados:", this.filteredCars);
    },

    saveFiltersToLocalStorage(){
      localStorage.setItem('filters', JSON.stringify(this.filters));
    },

    loadFiltersFromLocalStorage(){
      const savedFilters = localStorage.getItem('filters');
      if(savedFilters){
        this.filters = JSON.parse(savedFilters);
        this.applyFilters();
      } 
    },


    // resetar los filtros
    resetFilters(){
      this.filters = {
        minPrice : 20000,
        maxPrice : 100000,
        brand : "",
        model : "",
        chassis : [],
        transmission : "",
      };
      this.applyFilters();
      localStorage.removeItem('filters')
    },
    
  },
  async mounted() {
    
    await loadGoogleMaps();
    initAutocomplete('searchInput', this.handlePlaceSelected);

    const savedFilters = localStorage.getItem("filters");
    if(savedFilters){
      this.filters = JSON.parse(savedFilters)
    }

    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      this.fetchCars();
    });

    subscribeToNewPublication((newCars) => {
      this.cars = newCars;
      // this.applyFilters();
    });
  },
  watch: {
    'filters.brand'(newBrand, oldBrand) {
      if (newBrand !== oldBrand) {
        this.filters.model = ""; // Reset
      }
    }
  },
};
</script>

<template>
  <section class="parent w-full">

    <div class="filter w-full m-2.5 min-w-[368px] rounded-[40px] px-5 flex flex-col gap-6">
      <!-- Buscador -->
      <div
        class=" bg-white/70 rounded-full flex items-center px-4 py-2 w-full border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 z-50">
        <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
          stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input type="text" id="searchInput" placeholder="Buscar un auto..."
          class="bg-transparent outline-none text-gray-700 w-full pl-2 placeholder-gray-400">
      </div>
     


      <div class="bg-white border-secondary-100 border-2 rounded-2xl p-4 w-full h-full overflow-hidden">
        <!-- <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Filtros</h2>
          <button class="text-[#0ba5ec] text-sm cursor-pointer">Reset</button>
        </div> -->

        <div class="flex items-center justify-between mb-4">
          <h2 class="text-xl font-bold">Filtros</h2>
          <div class="flex gap-2">
            <button class="text-sm text-[#0ba5ec] hover:underline cursor-pointer" @click="resetFilters">Reset</button>

            <button class="text-sm bg-[#0ba5ec] text-white px-4 py-1.5 rounded-full shadow-sm hover:bg-[#0998d2] transition-all cursor-pointer" @click="applyFilters">
              Guardar
            </button>
          </div>
        </div>


        <!-- rango de precio -->
        <div class="mb-4">
          <Heading :type="3" class="small">Rango de precio</Heading>
          <div class="mt-2">
            <PriceRange :min="20000" :max="100000" v-model="filters"/>
          </div>
        </div>

        <!-- chasis -->
        <div class="flex flex-col gap-2 mt-5">
          <Heading :type="3" class="small">Chasis</Heading>
          <div class="grid grid-cols-3 gap-2 mt-2 text-sm">
            <Checkbox v-for="chassis in chassisTypes" :key="chassis" :id="chassis.toLowerCase()"
              :name="chassis.toLowerCase()" :label="chassis" labelPosition="right" class="text-deep-blue-900 "
              v-model="filters.chassis" :value="chassis" />
          </div>
        </div>

        <!-- marca -->
        <div class="flex flex-col gap-2 mt-5">
          <Heading :type="3" class="small">Marca del vehículo</Heading>
          <div class="flex gap-2 mt-2 text-sm">

            <!-- Marca -->
            <select class="w-1/2 rounded-xl border border-gray-300 p-2 focus:ring-sky-400" v-model="filters.brand">
              <option value="">Marca</option>
              <option value="Honda">Honda</option>
              <option value="Toyota">Toyota</option>
              <option value="Ford">Ford</option>
              <option value="Chevrolet">Chevrolet</option>
              <option value="Volkswagen">Volkswagen</option>
            </select>

            <!-- Modelo -->
            <select class="w-1/2 rounded-xl border border-gray-300 p-2" v-model="filters.model"
              :disabled="!filters.brand" :class="{ 'text-gray-400': !filters.brand }">
              <option value="">Modelo</option>
              <option v-if="filters.brand === 'Honda'">Civic</option>
              <option v-if="filters.brand === 'Honda'">CR-V</option>
              <option v-if="filters.brand === 'Toyota'">Corolla</option>
              <option v-if="filters.brand === 'Toyota'">Yaris</option>
              <option v-if="filters.brand === 'Ford'">Focus</option>
              <option v-if="filters.brand === 'Ford'">Fiesta</option>

            </select>

          </div>

          <!-- <div class="text-xs text-[#0ba5ec] mt-1 cursor-pointer">Más Vehículos ↓</div> -->
        </div>

        <!-- transmisión -->
        <div class="flex flex-col gap-2 mt-5">
          <label class="text-sm font-medium">Transmisión</label>
          <div class="flex gap-2 mt-2">

            <button v-for="option in optionsTransmission" :key="option" @click="filters.transmission = option === 'Ambos' ? '' : option" :class="[
              'cursor-pointer px-3 py-1 text-sm rounded-full border',
              filters.transmission === (option === 'Ambos' ? '' : option)
                ? 'bg-[#e6faff] border-[#0ba5ec] text-[#0ba5ec]'
                : 'bg-white border-gray-300 text-black'
            ]">
              {{ option }}
            </button>
          </div>
        </div>

        <!-- Mostrar disponibles -->
        <div class="flex items-center justify-between">
          <span class="font-medium">Mostrar sólo disponibles</span>
          <label class="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" value="" class="sr-only peer">
            <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
            <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5">
            </div>
          </label>
        </div>

      </div>
    </div>



    <section class="explore m-2.5 flex flex-col w-full gap-3 overflow-hidden">
      <div class="flex justify-between items-center">
        <Heading :type="1" class="m-6 text-center">Autos disponibles</Heading>

        <template v-if="loggedUser.id == null">
          <router-link to="/login"
            class="gap-4 md:flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-full md:rounded-lg text-md px-2 md:px-4 py-2 text-center">
            <span class="hidden md:block">Publicar Vehículo</span>
            <AddIcon />
          </router-link>
        </template>

        <template v-else>
          <router-link to="/car/register"
            class="gap-4 md:flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-full md:rounded-lg text-md px-2 md:px-4 py-2 text-center">
            <span class="hidden md:block">Publicar Vehículo</span>
            <AddIcon />
          </router-link>
        </template>
      </div>
      <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
        <Loading role="status" />
        <span class="sr-only">Cargando...</span>
      </div>

      <div v-else class="h-full overflow-auto">
        <div class="grid justify-items-center gap-3 grid-cols-2">
          <div v-for="(car, index) in filteredCars" :key="car.id"
            class="rounded-2xl flex relative flex-col shadow-xs w-full">
            <CardCar :car="car" />
          </div>
        </div>
      </div>




    </section>
  </section>
</template>

<style>
  .parent {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .filter { grid-area: 1 / 1 / 3 / 2; }
  .explore { grid-area: 1 / 2 / 3 / 4; }
</style>



