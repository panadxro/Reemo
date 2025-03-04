<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";

export default {
  name: "Publications",
  components: { Heading, CardCar, AddIcon, Loading },
  data() {
    return {
      cars: [],
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
  },
  mounted() {
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
  <div class="bg-secondary-100 m-2.5 min-w-[368px] rounded-[40px] py-10 px-5">
    <Heading :type="1" class="m-6 text-center">Filtros</Heading>
  </div>
  <section class="m-2.5 flex flex-col w-full gap-3 overflow-hidden">
    <div class="flex justify-between items-center">
      <Heading :type="1" class="m-6 text-center">Autos disponibles</Heading>
    
      <template v-if="loggedUser.id == null">
        <router-link to="/Login"
        class="gap-4 md:flex items-center justify-center text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-full md:rounded-lg text-md px-2 md:px-4 py-2 text-center">
          <span class="hidden md:block">Publicar Vehículo</span>
          <AddIcon />
        </router-link>
      </template>

      <template v-else>
        <router-link to="/Publish"
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
        <div 
          v-for="(car, index) in cars" 
          :key="index"
          class="rounded-2xl flex relative flex-col shadow-xs w-full"
          >
        <CardCar :car="car" />
      </div>
    </div>
  </div>

  </section>
</template>
