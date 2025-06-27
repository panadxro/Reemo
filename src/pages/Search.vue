<script>
import { getAvailableCars } from "../services/car";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import { updateCars, initAutocomplete, loadGoogleMaps,getCurrentLocation } from "../services/google-maps.js";
import { filterByPreferences } from "../services/filterService.js";

import AddressInput from "@/components/organisms/google-maps/AddressInput.vue";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";
import Input from "../components/molecules/Input.vue";
import Arrow from '@icons/Arrow.vue'
import FilterIcon from '@icons/FilterIcon.vue'
import PriceRange from "../components/molecules/PriceRange.vue";
import CheckboxFilter from "../components/atoms/CheckboxFilter.vue";
import Repeat from "@icons/Repeat.vue";
import SearchIcon from "@icons/Search.vue";

export default {
  name: "Search",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput, Input, Arrow, PriceRange, CheckboxFilter, FilterIcon, Repeat, SearchIcon },
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
    goToCarDetails(carId) {
      this.$router.push({ name: "CarDetails", params: { id: carId } });
    },
    handlePlaceSelected({ formattedAddress, location }) {
      this.searchQuery = formattedAddress;
      this.searchLocation = location;
      this.applyFilters();
    },

    useMyLocation(){
      getCurrentLocation(this.handlePlaceSelected);
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

    // getCurrentLocation((location) => {
    //   this.searchLocation = location;
    //   this.applyFilters()
    // })

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
  <section class="w-full md:min-h-full relative flex p-2.5 gap-5">
    <button 
      @click="toggleFilters" 
      class="lg:hidden fixed bottom-5 right-5 bg-primary-500 text-white p-3 rounded-full shadow-lg z-40"
    >
      <FilterIcon/>
    </button>

    <div 
      class="bg-vibrant-light-700 rounded-[40px] md:px-5 pr-2! pb-4! md:py-9 h-full transition-all duration-300 lg:w-1/4 xl:w-1/5 lg:min-w-[320px] overflow-hidden flex flex-col gap-5"
      :class=" showFilters ? 'fixed lg:relative inset-0 z-39' : 'hidden lg:block'"
    >
      <div class="flex items-center justify-between">
        <Heading :type="2" class="regular mt-2">Filtrar vehículo</Heading>
        <button @click="resetFilters" class="cursor-pointer hover:bg-vibrant-light-800 rounded-full p-1 transition-colors duration-300" title="Limpiar filtros">
          <Repeat/>
        </button>
      </div>
      <div class="h-full overflow-y-auto pr-3 flex flex-col gap-5 relative">
        <!-- marca -->
        <div class="flex flex-col gap-2">
          <Heading :type="3" class="small hidden">Marca del vehículo</Heading>
          <div class="flex flex-col sm:flex-row gap-2 text-sm">
            <!-- Marca -->
            <Input
              type="select"
              v-model="filters.brand"
              name="brand"
              id="brand"
              placeholder="Marca"
              :options="[
                { value: 'Honda', label: 'Honda' },
                { value: 'Toyota', label: 'Toyota' },
                { value: 'Ford', label: 'Ford' },
                { value: 'Chevrolet', label: 'Chevrolet' },
                { value: 'Volkswagen', label: 'Volkswagen' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="flex-1"
              />
  
            <!-- Modelo -->
            <Input
              type="select"
              v-model="filters.model"
              :disabled="!filters.brand"
              name="model"
              id="model"
              placeholder="Modelo"
              :options="[
                { value: 'Civic', label: 'Civic' },
                { value: 'CR-V', label: 'CR-V' },
                { value: 'Corolla', label: 'Corolla' },
                { value: 'Yaris', label: 'Yaris' },
                { value: 'Focus', label: 'Focus' },
                { value: 'Fiesta', label: 'Fiesta' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="flex-1"
              />
          </div>
        </div>
  
        <!-- rango de precio -->
        <div>
          <Heading :type="3" class="small">Rango de precio</Heading>
          <div class="px-1 lg:mx-4">
            <PriceRange :min="20000" :max="100000" v-model="filters" />
          </div>
        </div>
  
        <!-- chasis -->
        <div class="flex flex-col gap-2">
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
  
        <!-- transmisión -->
        <div class="flex flex-col gap-2">
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
  
        <div class="flex gap-2 sticky bottom-0">
          <Input
            type="button"
            @click="applyFilters"
            text="Aplicar filtros"
            variant="primary"
            class="text-sm"
            :outline="false"
            />
        </div>
      </div>
    </div>


      <div class="w-full lg:w-3/4 xl:w-4/5 overflow-hidden flex flex-col h-full">
        
        <div class="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-4">

          <Heading :type="1" class="text-xl lg:text-2xl text-start flex-1 lg:mt-0">Autos disponibles</Heading>     
          <router-link 
            to="/maps?focusSearch=true"
            >
            <Input
              type="text"
              id="searchInput"
              name="searchInput"
              placeholder="Buscar por ubicación..."
              class="lg:w-1/2 mb-2 lg:mb-0 w-fit!"
              icon-position="left"
              variant="secondary"
              :outline="false"
              >
              <template #icon>
                <SearchIcon />
              </template>
            </Input>
          </router-link>     
          
          </div>
  
        <p v-if="filteredCars.length == 0 && !loading" class="text-lg text-red-700 font-bold pt-4">
          No se encontraron autos con esas características
        </p>
        
        <div v-if="loading" class="flex items-center justify-center w-full py-8">
          <Loading role="status" />
          <span class="sr-only">Cargando...</span>
        </div>

        <div v-else class="flex-1 overflow-y-auto pr-2">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
            <CardCar v-for="(car, index) in filteredCars" :key="car.id" :car="car" />
          </div>
        </div>
      </div>
  </section>
</template>