<script>
import { getUserCars } from "@services/car-service.js";
import { subscribeToAuthState } from "@services/auth.js";
import { fetchRentedCars } from "@services/rentedCarService.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/my-cars/CardCar.vue";
import UserNav from "@components/user/UserNav.vue";
import RentedCar from "@components/rental/RentedCar.vue";
import Loading from "@icons/Loading.vue";
import MyCars from "@components/my-cars/MyCars.vue";
import Arrow from "../icons/Arrow.vue";
import BackButton from "@components/atoms/BackButton.vue";

let unsubscribeAuth = () => { };

export default {
  name: "MyProfile",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, MyCars, Arrow, BackButton },
  data() {
    return {
      cars: [],
      loading: false,
      loggedUser: {
        id: null,
        email: null,
        userName: null,
        name: null,
        lastName: null,
      },
      rentedCars: [],
      left: "left",
    };
  },
  methods: {
    async loadRentedCars() {
      try {
        this.loading = true;

        this.rentedCars = await fetchRentedCars(this.loggedUser.id)
        console.log("Autos alquilados: ", this.rentedCars);

      } catch (error) {
        console.error("Error al obtener los autos alquilados:", error)
      } finally {
        this.loading = false;
      }
    },
    addCar(newCar) {
      this.cars.push(newCar);
    },
    goToCarDetails(carId) {
      this.$router.push({ name: "CarDetails", params: { id: carId } });
    },
  },
  mounted() {
    unsubscribeAuth = subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      if (this.loggedUser.id) {
        this.loading = true;
        // Llamamos a la función del servicio para obtener los autos
        this.unsubscribeCars = getUserCars(this.loggedUser.id, (cars) => {
          this.cars = cars;
          this.loading = false;
        });
      }
      if (newUserData && newUserData.id) {
        if (newUserData && newUserData.id && this.internalUserId !== newUserData.id) {
          this.internalUserId = newUserData.id;
          this.loadRentedCars();
        }
      } else {
        this.internalUserId = null;
      }
    });
  },
  unmounted() {
    unsubscribeAuth();
    if (this.unsubscribeCars) {
      this.unsubscribeCars(); // Desuscribimos al componente de la consulta de autos
    }
  },
};
</script>


<template>
  <UserNav :user="loggedUser" />
  <section class="parent m-2.5 w-full max-h-vh">
    <div class="flex profile flex-col grow gap-3">
      <div class="flex items-center gap-5">
        <BackButton>
          <Arrow direction="left" />
        </BackButton>
        <Heading :type="1" class="medium">Mi perfil</Heading>
      </div>
      <article class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5">
        <img 
          v-if="loggedUser.photoURL" 
          class="w-32 aspect-square rounded-full bg-vibrant-light-800" 
          :src="`${loggedUser.photoURL}`"
          :alt="`Perfil de ${loggedUser.userName}`" 
        />
        <div>
          <Heading :type="2" class="medium">{{ loggedUser.name }} {{ loggedUser.lastName }}</Heading>
          <p>{{ loggedUser.email }}</p>
        </div>
      </article>
    </div>

    <div class="history bg-primary-900 rounded-[40px] px-5 py-7">
      <div class="flex items-center justify-between">
        <Heading :type="1" class="text-white">Historial</Heading>
        <a href="" class="text-white">Ver más</a>
      </div>
      <div v-for="rental in rentedCars" :key="rental.id">
        <RentedCar :car="rental.car" />
      </div>
    </div>
    <div class="div1 bg-gray-100 rounded-[40px]">

    </div>
    <div class="mycars overflow-hidden">
      <div class="flex items-center justify-between">
        <Heading :type="1">Mis autos</Heading>
        <a href="" class="text-primary-900">Ver más</a>
      </div>
      <div class="flex flex-col gap-5 h-full overflow-auto">
        <MyCars 
          v-for="car in cars" 
          :key="car.id" 
          :car="car" 
          />
      </div>
    </div>
  </section>
</template>

<style scoped>
  .parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;
  }

  .profile { grid-area: 1 / 1 / 2 / 4; }
  .history { grid-area: 1 / 4 / 2 / 6; }
  .div1 { grid-area: 2 / 1 / 3 / 3; }
  .mycars { grid-area: 2 / 3 / 3 / 6; }
</style>