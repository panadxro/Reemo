<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import { updateCars, initAutocomplete, loadGoogleMaps } from "../services/google-maps.js";
import { filterByPreferences } from "../services/filterService.js";

import AddressInput from "@/components/organisms/google-maps/AddressInput.vue";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";
import Input from "../components/molecules/Input.vue";
import Arrow from '@icons/Arrow.vue'
import FilterIcon from '@icons/FilterIcon.vue'
import PriceRange from "../components/molecules/PriceRange.vue";
import CheckboxFilter from "../components/atoms/CheckboxFilter.vue";

export default {
  name: "Search",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput, Input, Arrow, PriceRange, CheckboxFilter, FilterIcon },
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
      showFilters: false, 
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
    handlePlaceSelected({ formattedAddress, location }) {
      this.searchQuery = formattedAddress;
      this.searchLocation = location;
      this.applyFilters();
    },
    applyFilters() {
      let carsToFilter = [];

      if (this.searchLocation && this.searchLocation.lat && this.searchLocation.lng) {
        carsToFilter = updateCars(this.cars, this.searchLocation, this.map);
      } else {
        console.warn("⚠️ No se aplicó filtro por ubicación");
        carsToFilter = this.cars;
      }

      // luego filtramos por preferencias
      this.filteredCars = filterByPreferences(carsToFilter, this.filters);
      this.saveFiltersToLocalStorage();
      
      if (window.innerWidth < 1000) {
        this.showFilters = false;
      }
    },
    saveFiltersToLocalStorage() {
      localStorage.setItem('filters', JSON.stringify(this.filters));
    },
    loadFiltersFromLocalStorage() {
      const savedFilters = localStorage.getItem('filters');
      if (savedFilters) {
        this.filters = JSON.parse(savedFilters);
        this.applyFilters();
      }
    },
    resetFilters() {
      this.filters = {
        minPrice: 20000,
        maxPrice: 100000,
        brand: "",
        model: "",
        chassis: [],
        transmission: "",
      };
      this.applyFilters();
      localStorage.removeItem('filters');
    },
    toggleFilters() {
      if (window.innerWidth < 1024) {
        this.showFilters = !this.showFilters;
      }
    },
  },
  async mounted() {
    await loadGoogleMaps();
    initAutocomplete('searchInput', this.handlePlaceSelected);

    const savedFilters = localStorage.getItem("filters");
    if (savedFilters) {
      this.filters = JSON.parse(savedFilters);
    }

    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      this.fetchCars();
    });

    subscribeToNewPublication((newCars) => {
      this.cars = newCars;
    });
    
    this.showFilters = window.innerWidth >= 1024;

    window.addEventListener('resize', () => {
      this.showFilters = window.innerWidth >= 1024;
    });
  },
  watch: {
    'filters.brand'(newBrand, oldBrand) {
      if (newBrand !== oldBrand) {
        this.filters.model = "";
      }
    }
  },
};
</script>

<template>
  <section class="w-full h-full relative">
    <button 
      @click="toggleFilters" 
      class="lg:hidden fixed bottom-5 right-5 bg-primary-500 text-white p-3 rounded-full shadow-lg z-40"
    >
      <FilterIcon/>
    </button>

    <div class="flex flex-col md:flex-row w-full h-full">
      <div 
        :class="[
          'transition-all duration-300 overflow-y-auto',
          showFilters ? 'fixed lg:relative inset-0 z-39 bg-white/95 lg:bg-transparent' : 'hidden lg:block',
          'lg:w-1/4 xl:w-1/5 lg:min-w-[300px] p-4'
        ]"
      >
        <div class="bg-white border-secondary-100 border-2 rounded-2xl p-4 w-full h-auto">
            <h2 class="text-xl font-bold">Filtrar vehículo</h2>

          <!-- rango de precio -->
          <div class="my-4">
            <Heading :type="3" class="small">Rango de precio</Heading>
            <div class="mt-2 lg:ms-2 lg:me-1">
              <PriceRange :min="20000" :max="100000" v-model="filters" />
            </div>
          </div>

          <!-- chasis -->
          <div class="flex flex-col gap-2 mt-5">
            <Heading :type="3" class="small">Chasis</Heading>
            <div class="flex flex-wrap 2 gap-2 mt-2 text-sm">
              <CheckboxFilter 
                v-for="chassis in chassisTypes" 
                :key="chassis" 
                :id="chassis.toLowerCase()"
                :name="chassis.toLowerCase()" 
                :label="chassis" 
                labelPosition="right" 
                class="text-deep-blue-900"
                v-model="filters.chassis" 
                :value="chassis" 
              />
            </div>
          </div>

          <!-- marca -->
          <div class="flex flex-col gap-2 mt-5">
            <Heading :type="3" class="small">Marca del vehículo</Heading>
            <div class="flex flex-col sm:flex-row gap-2 mt-2 text-sm">
              <!-- Marca -->
              <select class="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2 focus:ring-sky-400" v-model="filters.brand">
                <option value="">Marca</option>
                <option value="Honda">Honda</option>
                <option value="Toyota">Toyota</option>
                <option value="Ford">Ford</option>
                <option value="Chevrolet">Chevrolet</option>
                <option value="Volkswagen">Volkswagen</option>
              </select>

              <!-- Modelo -->
              <select 
                class="w-full sm:w-1/2 rounded-xl border border-gray-300 p-2" 
                v-model="filters.model"
                :disabled="!filters.brand" 
                :class="{ 'text-gray-400': !filters.brand }"
              >
                <option value="">Modelo</option>
                <option v-if="filters.brand === 'Honda'">Civic</option>
                <option v-if="filters.brand === 'Honda'">CR-V</option>
                <option v-if="filters.brand === 'Toyota'">Corolla</option>
                <option v-if="filters.brand === 'Toyota'">Yaris</option>
                <option v-if="filters.brand === 'Ford'">Focus</option>
                <option v-if="filters.brand === 'Ford'">Fiesta</option>
              </select>
            </div>
          </div>

          <!-- transmisión -->
          <div class="flex flex-col gap-2 mt-5">
            <Heading :type="3" class="small">Transmisión</Heading>
            <div class="flex flex-wrap gap-2 mt-2">
              <button 
                v-for="option in optionsTransmission" 
                :key="option" 
                @click="filters.transmission = option === 'Ambos' ? '' : option" 
                :class="[
                  'cursor-pointer px-3 py-[6px] text-sm rounded-xl border font-medium transition-all duration-200',
                  filters.transmission === (option === 'Ambos' ? '' : option)
                    ? 'bg-[#e6faff] border-[#0ba5ec] text-[#0ba5ec]'
                    : 'bg-white border-gray-300 text-black'
                ]"
              >
                {{ option }}
              </button>
            </div>
          </div>

          <!-- Mostrar disponibles -->
          <!-- <div class="flex items-center justify-between mt-5">
            <span class="font-medium">Mostrar sólo disponibles</span>
            <label class="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" value="" class="sr-only peer">
              <div class="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600"></div>
              <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition peer-checked:translate-x-5"></div>
            </label>
          </div> -->
          <div class="flex gap-2 mt-4">
            <button class="text-sm bg-[#0ba5ec] text-white px-4 py-1.5 rounded-lg shadow-sm hover:bg-[#0998d2] transition-all cursor-pointer" @click="applyFilters">
              Guardar
            </button>
            <button class="text-sm text-[#0ba5ec] hover:underline cursor-pointer" @click="resetFilters">Limpiar Filtros</button>
          </div>
        </div>

      </div>

      <div class="w-full lg:w-3/4 xl:w-4/5 p-4 overflow-hidden flex flex-col h-full">
        
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">
          
          <div class="bg-white/70 rounded-full flex items-center px-4 py-2 border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 w-full lg:w-2/4 lg:order-1 mb-4 lg:mb-0">
            <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
              stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" id="searchInput" placeholder="Buscar un auto..."
              class="bg-transparent outline-none text-gray-700 w-full pl-2 placeholder-gray-400">
          </div>
          <Heading :type="1" class="text-xl lg:text-2xl text-start lg:mt-0">Autos disponibles</Heading>
          
          </div>
  
        <p v-if="filteredCars.length == 0 && !loading" class="text-lg text-red-700 font-bold pt-4">
          No se encontraron autos con esas características
        </p>
        
        <div v-if="loading" class="flex items-center justify-center w-full py-8">
          <Loading role="status" />
          <span class="sr-only">Cargando...</span>
        </div>

        <div v-else class="flex-1 overflow-y-auto">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <div 
              v-for="(car, index) in filteredCars" 
              :key="car.id"
              class="rounded-2xl flex relative flex-col shadow-xs w-full"
            >
              <CardCar :car="car" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>