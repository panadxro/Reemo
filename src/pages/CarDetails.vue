<script>
import { getCarById, checkIfCarIsRented } from "../services/car-service.js";

import { subscribeToAuthState } from "../services/auth.js";
import ModalRent from "../components/ModalRent.vue";
import Heading from "../components/atoms/Heading.vue";
import Comment from "../components/molecules/Comment.vue";
import Pill from "../components/atoms/Pill.vue";
import Transmition from "../icons/Transmition.vue";
import Chasis from "../icons/Chasis.vue";
import Engine from "../icons/Engine.vue";
import GasStation from "../icons/GasStation.vue";
import Accelerometer from "../icons/Accelerometer.vue";
import Check from "../icons/Check.vue";
import Cross from "../icons/Cross.vue";
import defaultCarImage from '../assets/Car-Img.png';
import Loading from "@icons/Loading.vue";
// import * as icons from '@icons'

export default {
  props: ["id"],
  name: "CarDetails",
  components: {
    Heading,
    Comment,
    Transmition,
    Chasis,
    Engine,
    GasStation,
    Accelerometer,
    Check,
    Cross,
    ModalRent,
    Pill,
    Loading
  },
  data() {
    return {
      rented: false,
      car: null,
      loading: false,
      errorMsg: "",
      loggedUser: {
        id: null,
        email: null,
        role: null
      },
      currentImage: null,
    };
  },
  async created() {
    this.errorMsg = "";
    this.loading = true;
    try {
      const carId = this.id;
      this.car = await getCarById(carId);
      this.currentImage = this.car.images && this.car.images.length > 0 ? this.car.images[0] : defaultCarImage;
      this.rented = await checkIfCarIsRented(this.car.id);
    } catch (error) {
      this.errorMsg = "Hubo un error al obtener los detalles del auto. Volvé a intentar";
      console.error("Error al obtener los detalles del auto:", error);
    }
    this.loading = false;
  },
  methods: {
    openModal() {
      this.$refs.ModalRent.open();
    },
    setCurrentImage(image) {
      this.currentImage = image;
    },
    setDefaultImage(event) {
      event.target.src = defaultCarImage;
    },
  },
  mounted() {
    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
    });
  },
};
</script>


<template>
  <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
    <Loading role="status" />
  </div>
  <div v-if="car">
    <section class="py-8 bg-white md:py-16 antialiased">
      <div class="max-w-screen-xl px-4 mx-auto 2xl:px-0">
        <div class="lg:grid lg:grid-cols-2 lg:gap-8 xl:gap-16">
          <div class="car-details">
            <!-- Imagen principal del carrusel -->
            <div class="main-image-container">
              <img class="my-auto h-16 mx-auto md:h-full" :src="currentImage" @error="setDefaultImage" alt="Auto" />
            </div>

            <!-- Miniaturas debajo de la imagen principal -->
            <div class="thumbnail-container">
              <img v-for="(image, index) in car.images" :key="index" :src="image" @click="setCurrentImage(image)"
                @error="setDefaultImage" :class="{ active: image === currentImage }" alt="Miniatura de auto"
                class="thumbnail" />
            </div>
          </div>
          <div class="mt-6 sm:mt-8 lg:mt-0">
            <Heading :type="1">{{ car.marca }} {{ car.modelo }}, {{ car.año }}</Heading>
            <div class="mt-4 sm:items-center sm:gap-4 sm:flex">
              <Heading :type="2">${{ car.precio }} /día</Heading>
              <button type="button"
              class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm mb-3 px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              v-if="!rented && car.user_id !== loggedUser?.id && car.isAvailable && loggedUser.role == 'user'" @click="openModal">
              <span>Alquilar</span>
              <svg class="rtl:rotate-180 w-3.5 h-3.5 ms-2" aria-hidden="true" xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 14 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M1 5h12m0 0L9 1m4 4L9 9" />
            </svg>
          </button>
          
          
          <span
          class="bg-yellow-100 text-yellow-800 text-base font-medium me-2 px-2.5 py-0.5 rounded border border-yellow-400"
          v-if="!car.isAvailable">El auto fue deshabilitado temporalmente</span>
        </div>
                
        <div v-if="car.user_id !== loggedUser?.id" class="flex items-center gap-2">
          <router-link :to="`/ProfileOwner/${car.user_id}`" class="flex items-center gap-2 hover:cursor-pointer">
            <img :src="car.user.photoURL" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
            <p class="py-6 hover:underline">{{ car.user.name }} {{ car.user.lastName }}</p>
          </router-link>
        </div>

        <div v-else class="flex items-center gap-2">
          <img :src="car.user.photoURL" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
            <p class="py-6">{{ car.user.name }} {{ car.user.lastName }}</p>
        </div>




            <p class="mb-3 text-gray-500 break-words">
              {{ car.description }}
            </p>

            <ul class="flex flex-col gap-2 text-gray-600 my-5">
              <li class="flex items-center gap-2 w-fit py-1.5 rounded-full">
                <Engine />
                <p class="text-md font-medium text-gray-500">
                  <strong class="hidden md:inline">Motor:</strong>
                  {{ car.motor }}
                </p>
              </li>

              <li class="flex items-center gap-2 w-fit py-1.5 rounded-full">
                <Chasis />
                <p class="text-md font-medium text-gray-500">
                  <strong class="hidden md:inline">Chasis:</strong>
                  {{ car.chasis }}
                </p>
              </li>

              <li class="flex items-center gap-2 w-fit py-1.5 rounded-full">
                <Transmition />
                <p class="text-md font-medium text-gray-500">
                  <strong class="hidden md:inline">Transmisión:</strong>
                  {{ car.transmision }}
                </p>
              </li>

              <li class="flex items-center gap-2 w-fit py-1.5 rounded-full">
                <GasStation />
                <p class="text-md font-medium text-gray-500">
                  <strong class="hidden md:inline">Combustible:</strong>
                  {{ car.combustible }}
                </p>
              </li>
            </ul>

            <hr class="my-3 md:my-4 border-gray-200" />
            <Heading :type="2">Accesorios</Heading>
            <div class="flex flex-wrap gap-2 text-gray-800">
              <div v-for="(accessory, index) in car.accessories" :key="index">
                <Pill :accessory="accessory.id" :name="accessory.name" />
              </div>
            </div>

            <ModalRent ref="ModalRent" :car="car" :loggedUser="loggedUser" :rented="car.rented" />

            <span v-if="rented && car.user_id !== loggedUser?.id"
              class="bg-red-100 text-red-800 text-base font-medium me-2 px-2.5 py-0.5 rounded border border-red-400">Este
              auto ya esta alquilado</span>
            <span v-if="rented && car.user_id == loggedUser?.id"
              class="bg-red-100 text-red-800 text-base font-medium me-2 px-2.5 py-0.5 rounded border border-red-400">Tu
              auto ya esta alquilado</span>
          </div>
        </div>
      </div>
      <Comment :carId="car.id" />
    </section>
  </div>
  <div v-else>
    <p class="text-center">Cargando...</p>
  </div>
</template>

<style scoped>
.main-image-container {
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.main-image-container img {
  border-radius: 5px;
}

.thumbnail-container {
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 8px;
}

.thumbnail {
  cursor: pointer;
  width: 50px;
  height: 50px;
  object-fit: cover;
  border: 2px solid transparent;
  transition: border-color 0.2s ease;
}

.thumbnail:hover,
.thumbnail.active {
  border: solid 3px #3490dc;
  border-radius: 5px;
}
</style>
