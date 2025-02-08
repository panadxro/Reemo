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

import { Loader } from "@googlemaps/js-api-loader";


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
      // this.initMap(this.car.coordenadas);

      // Una vez que los datos están listos, inicializa el mapa
      if (this.car.coordenadas) {
            await this.loadGoogleMaps();
            this.initMap(this.car.coordenadas);
          }

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

    async loadGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "geometry"], // 
      });

      try {
        await loader.load(); // Esperamos a que la API se cargue completamente
      } catch (error) {
        console.error("Error al cargar Google Maps:", error);
      }
    },

    async initMap(coordenadas){

      try {

        const position = { lat: coordenadas.lat, lng: coordenadas.lng };
        const { Map } = await google.maps.importLibrary("maps");
        // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
        

        const map = new Map(document.getElementById('map'),{
          center: {
            lat: coordenadas.lat,
            lng: coordenadas.lng,
          },
          zoom: 14,
          mapId: "4808da25693c56c8",
          streetViewControl: false, // Desactiva el ícono de Street View
          mapTypeControl: false, // Oculta el botón de "Mapa / Satélite"
          disableDefaultUI: true, // Si lo pones en true desactiva todos los controles (zoom, fullscreen, etc.)
        });

        new google.maps.Circle({
          strokeColor: "#5DADE2",
          strokeOpacity: 0.8, 
          strokeWeight: 2, 
          fillColor: "#A9D6F5", 
          fillOpacity: 0.35, 
          map: map,
          center: position,
          radius: 1000, 
        })

      } catch (error) {
        console.error("Error al cargar Google Maps: ", error) 
      }

    }

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
    <div role="status">
      <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor" />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill" />
      </svg>
      <span class="sr-only">Cargando...</span>
    </div>
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
                v-if="!rented && car.user_id !== loggedUser?.id && car.isAvailable" @click="openModal">
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

            <!-- Perfil del usuario -->
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

            
            <!-- iniciamos el mapa de Google Maps -->
            <p><strong>Direccion:</strong> {{ car.direccion }}</p>
            <div v-if="car.coordenadas" id="map" style="width: 100%; height: 400px; margin-top: 20px;"></div>
            <p v-else>Cargando mapa...</p>

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
