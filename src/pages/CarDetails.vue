<script>
import { Loader } from "@googlemaps/js-api-loader";
import { useCarStore } from "@/stores/car.store.js";
import { useAuthStore } from "@/stores/auth.store.js";
import { useRentalStore } from "@/stores/rent.store.js";

import Heading from "../components/atoms/Heading.vue";
import Pill from "../components/atoms/Pill.vue";
import Loading from "@icons/Loading.vue";
import BackButton from "../components/atoms/BackButton.vue";
import Arrow from "../icons/Arrow.vue";
import Like from "../icons/Like.vue";

import RentalProcess from "@/components/organisms/rental/RentalProcess.vue";

export default {
  props: ["id"],
  name: "CarDetails",
  components: {
    Heading,
    Pill,
    Loading,
    BackButton,
    Arrow,
    Like,
    RentalProcess
  },
  data() {
    return {
      mapInitialized: false,
    };
  },
  
  computed: {
    carStore() {
      return useCarStore();
    },
    authStore() {
      return useAuthStore();
    },
    rentalStore() {
      return useRentalStore();
    },
    car() {
      return this.carStore.car;
    },
    currentStep() {
      return this.rentalStore.currentStep;
    },
    loading() {
      return this.carStore.loading;
    },
    error() {
      return this.carStore.error;
    },
    currentImage() {
      return this.carStore.currentImage;
    },
    isRented() {
      return this.carStore.isRented;
    },
    loggedUser() {
      return this.authStore.user;
    }
  },
  
  async created() {
  try {
    this.carStore.loading = true;
    await this.carStore.fetchCarById(this.id);

    if (this.car.coordenadas?.lat && this.car.coordenadas?.lng) {
      await this.loadGoogleMaps();
      this.initMap(this.car.coordenadas);
    }
  } catch (error) {
    console.error("Error loading car details:", error);
  }
},

  mounted() {
    // Cargar datos guardados previamente
    const savedData = localStorage.getItem('rentalData');
    if (savedData) {
      try {
        this.rentalData = JSON.parse(savedData);
      } catch (e) {
        console.error("Error al cargar datos guardados:", e);
      }
    }
  },

  methods: {
    setCurrentImage(image) {
      this.carStore.setCurrentImage(image);
    },
    
    setDefaultImage(event) {
      this.carStore.handleImageError(event);
    },

    async loadGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "geometry"], 
      });

      try {
        await loader.load(); // Esperamos a que la API se cargue completamente
      } catch (error) {
        console.error("Error al cargar Google Maps:", error);
      }
    },

    async initMap(coordenadas){
      if (!coordenadas || !coordenadas.lat || !coordenadas.lng) {
        console.error("Coordenadas no válidas:", coordenadas);
        return;
      }
      try {
        const position = { lat: coordenadas.lat, lng: coordenadas.lng };
        const { Map } = await google.maps.importLibrary("maps");

        const map = new Map(document.getElementById('map'),{
          center: {
            lat: coordenadas.lat,
            lng: coordenadas.lng,
          },
          zoom: 14,
          mapId: "4808da25693c56c8",
          streetViewControl: false,
          mapTypeControl: false,
          disableDefaultUI: true,
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
        });
        
        this.mapInitialized = true;
      } catch (error) {
        console.error("Error al cargar Google Maps: ", error);
      }
    }
  }
};
</script>

<template>
  <section v-if="car.id" class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
    <div class="flex items-center gap-5">
      <BackButton />
      <Heading :type="1" class="medium">Alquilar auto</Heading>
    </div>
    <article class="flex flex-col gap-9 bg-background-900 overflow-auto px-5">
      <div class="flex flex-col gap-5">
        <!-- Imagen principal del carrusel -->
        <figure class="my-auto w-full max-h-64 mx-auto overflow-hidden rounded-2xl relative">
          <div class="absolute top-4 left-4 right-4 flex justify-between items-center">
            <!-- Pill "Nueva" -->
            <div class="bg-blue-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
              Nueva
            </div>
            <!-- Botón de "Me gusta" -->
            <Like />
          </div>
          <img class="object-center w-full h-full object-cover" :src="currentImage" @error="setDefaultImage"
            alt="Auto" />
        </figure>

        <!-- Miniaturas debajo de la imagen principal -->
        <div class="flex justify-between gap-2.5">
          <img v-for="(image, index) in carStore.car.images" :key="index" :src="image" @click="setCurrentImage(image)"
            @error="setDefaultImage" :class="{ active: image === currentImage }"
            class="max-h-20 object-center w-full flex-1 h-full border-2 object-cover cursor-pointer rounded-2xl hover:opacity-90 focus:border-vibrant-light-900"
            alt="" />
        </div>
      </div>
      <div class="flex items-center justify-between mt-4">
        <Heading :type="2" class="large flex flex-col">
          <span class="text-background-600 text-lg!">
            {{ car.marca }}
          </span>
          {{ car.modelo }}
        </Heading>
        <div class="flex flex-col items-end gap-2">
          <p>4 estrellas</p>
          <Heading :type="3" class="medium text-background-600">
            {{ carStore.formattedPrice }} /día
          </Heading>
        </div>
      </div>
      <div v-if="car.user_id !== loggedUser?.id">
        <router-link :to="`/user/${car.user_id}`" class="flex items-center gap-2 hover:cursor-pointer">
          <img :src="car.user?.photoURL || carStore.defaultUserImage" :alt="car.user.userName" :title="car.user.userName"
            class="w-8 h-8 object-cover rounded-full" />
          <p class="font-semibold hover:underline">
            {{ car.user.name }} {{ car.user.lastName }}
          </p>
        </router-link>
      </div>
      <div v-else>
        <img :src="car.user.photoURL" :alt="car.user.userName" class="w-8 h-8 object-cover rounded-full" />
        <p class="py-6">{{ car.user.name }} {{ car.user.lastName }}</p>
      </div>
      <ul class="font-semibold">
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Año:</p>
          <span>{{ car.año }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Tipo:</p>
          <span>{{ car.chasis }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700 ">
          <p>Motor:</p>
          <span>{{ car.motor }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Transmisión:</p>
          <span>{{ car.transmision }}</span>
        </li>
        <li class="flex items-center py-4 justify-between border-b-2 border-vibrant-light-700">
          <p>Combustible:</p>
          <span>{{ car.combustible }}</span>
        </li>
      </ul>
      <div class="flex flex-col gap-4">
        <Heading :type="2" class="medium">Descripción</Heading>
        <p class="break-words">
          {{ car.description }}
        </p>
      </div>
      <div class="flex flex-col gap-4">
        <Heading :type="2" class="medium">Accesorios</Heading>
        <div class="flex flex-wrap gap-2 text-gray-700">
          <Pill v-for="(accessory, index) in car.accessories" :key="index" :accessory="accessory.id"
            :name="accessory.name" />
        </div>
      </div>
    </article>
  </section>
  <div v-else-if="carStore.loading" class="flex justify-center items-center h-64">
    <Loading role="status" class="h-6 w-6 text-blue-500" />
  </div>
  <section v-else class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
    <p>{{ carStore.errorMessage }}</p>
  </section>
  <div class="m-2.5 w-full flex flex-col gap-3">
    <div class="map-container">
      <div 
        id="map"
        style="width: 100%; height: 300px; border-radius: 40px;"
        v-show="currentStep === 1"
      ></div>
    </div>
  
    <div class="bg-deep-blue-900 w-full rounded-[40px] p-8 max-h-full overflow-y-scroll">
      
      <RentalProcess 
        v-if="!loading && !error"
        :car-id="car.id"
        :user-id="loggedUser?.id"
        :is-car-rented="isRented"
      />  
      
    </div>

    <span v-if="isRented && !carStore.isUserOwner"
  class="bg-red-100 text-red-800 text-base font-medium me-2 px-2.5 py-0.5 rounded-sm border border-red-400">
  {{ carStore.isUserOwner ? 'Tu auto ya está alquilado' : 'Este auto ya está alquilado' }}
</span>
  </div>
</template>