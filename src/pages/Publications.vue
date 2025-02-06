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
  <section>
    <Heading :type="1" class="m-6 text-center">Alquilá autos por tu zona</Heading>

    <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div>

    <div
      class="max-w-md mx-auto md:max-w-screen-xl m-4 grid justify-items-center gap-4 md:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="(car, index) in cars" :key="index"
        class="rounded-2xl flex relative flex-col shadow-sm w-full overflow-hidden hover:bg-primary-300">
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
