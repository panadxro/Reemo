<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";
import { updateCars, initAutocomplete, loadGoogleMaps } from "../services/google-maps.js";

import { filterCars } from "../services/filterService.js";
import {ref, computed, watch} from 'vue';

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
      chassisTypes: ["Sedan", "Van", "SUV", "Pickup"], // Tipos de chasis
      selectedChassis: [], // Tipos de chasis seleccionados
      minPrice: 20000,
      maxPrice: 100000,
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

    // Filtramos por los autos por la ubicacion
    filterCars() {
      try {
        this.filteredCars = updateCars(this.cars, this.searchLocation, this.map);
        
      } catch (error) {
        console.error('Error al filtrar los autos', error)
      }
    },

    updateFilteredCars(){
      this.filteredCars = filterCars(this.cars, {
        searchLocation: this.searchLocation,
        minPrice: this.minPrice,
        maxPrice: this.maxPrice,
        map: this.map,
      })
    },

    handlePlaceSelected({ formattedAddress, location }) {
      this.searchQuery = formattedAddress;
      this.searchLocation = location;
      this.filterCars();
    },

  },
  // computed: {
  //   filterCars() {
  //     return filterCars(this.cars, {
  //       searchLocation: this.searchLocation,
  //       minPrice: this.minPrice,
  //       maxPrice: this.maxPrice,
  //       map: this.map,
  //     });
  //   }
  // },
  // watch: {
  //   // detecta los cambios de los filtros y actualiza la lista automaticamente
  //   searchLocation: "updateFilteredCars",
  //   minPrice: 'updateFilteredCars',
  //   maxPrice: 'updateFilteredCars',
  // },
  async mounted() {

    await loadGoogleMaps();
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
  <section class="parent w-full">
    <div class="filter bg-secondary-100 m-2.5 min-w-[368px] rounded-[40px] py-10 px-5 flex
    flex-col gap-6">

    <!-- Search input -->
    <div class=" bg-white/70 rounded-full flex items-center px-4 py-2 w-80 border border-gray-300 focus-within:ring-2 focus-within:ring-primary-500 z-50">
      <svg class="w-5 h-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
        stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M21 21l-4.35-4.35m1.85-4.65a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
      <input type="text" id="searchInput" placeholder="Buscar un auto..."
        class="bg-transparent outline-none text-gray-700 w-full pl-2 placeholder-gray-400">
    </div>

      <Heading :type="2" class="medium">Filtros</Heading>

      <div class="flex gap-2.5">
        <Input
          type="select"
          name="marca"
          id="marca"
          placeholder="Marca"
          :options="[
            { value: 'Audi', label: 'Audi' },
            { value: 'BMW', label: 'BMW' },
            { value: 'Mercedes', label: 'Mercedes' },
          ]"
          icon-position="right"
          variant="secondary"
          :outline="true"
          class="w-full"
        >
        </Input>
        <Input
          type="select"
          name="modelo"
          id="modelo"
          placeholder="Modelo"
          :options="[
            { value: 'A4', label: 'A4' },
            { value: '3 Series', label: '3 Series' },
            { value: 'C-Class', label: 'C-Class' },
          ]"
          icon-position="right"
          variant="secondary"
          :outline="true"
          class="w-full cursor-pointer"
        >
        </Input>
      </div>
      <div class="flex flex-col gap-2.5">
        <Heading :type="3" class="small">Rango de precio</Heading>
        <!-- <PriceRange :min="0" :max="100000" /> -->
        <PriceRange 
        :min="20000" 
        :max="100000" 
        @update:min="minPrice = $event" 
        @update:max="maxPrice = $event"
        />
      </div>
      <div class="flex flex-col gap-3">
        <Heading :type="3" class="small">Chasis</Heading>
        <div class="flex gap-x-16 gap-y-4 flex-wrap ">
          <!-- <Checkbox
            v-for="chassis in chassisTypes"
            :key="chassis"
            :id="chassis.toLowerCase()" 
            :name="chassis.toLowerCase()" 
            :label="chassis" 
            labelPosition="right" 
            class="text-deep-blue-900"
            v-model="selectedChassis"
            :value="chassis"
          /> -->
        </div>
      </div>

        <!--  <div class="relative">
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
      </div> -->
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
          <router-link to="/publish"
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
        <div  class="grid justify-items-center gap-3 grid-cols-2">
          <div v-for="(car, index) in filteredCars" :key="car.id" class="rounded-2xl flex relative flex-col shadow-xs w-full">
          <!-- <div v-for="(car, index) in cars" :key="car.id" class="rounded-2xl flex relative flex-col shadow-xs w-full"> -->
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