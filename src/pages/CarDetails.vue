<script>
import { getCarById, checkIfCarIsRented } from "../services/car-service.js";
import { Loader } from "@googlemaps/js-api-loader";
import { subscribeToAuthState } from "../services/auth.js";

import Heading from "../components/atoms/Heading.vue";
import Pill from "../components/atoms/Pill.vue";
import Loading from "@icons/Loading.vue";
import BackButton from "../components/atoms/BackButton.vue";
import Arrow from "../icons/Arrow.vue";
import Like from "../icons/Like.vue"

export default {
  props: ["id"],
  name: "CarDetails",
  components: {
    Heading,
    Pill,
    Loading,
    BackButton,
    Arrow,
    Like
  },
  data() {
    return {
      rented: false,
      car: {
        user: {},
      },
      loading: false,
      errorMsg: "",
      loggedUser: {
        id: null,
        email: null,
        role: null
      },
      currentImage: null,
      defaultUserImage: "/src/assets/User.png",
      defaultCarImage: "/src/assets/Car-Img.png",
      hideMap: false,
      mapInitialized: false,
      selectedDates: {
        startDate: null,
        endDate: null
      },
      mapInstance: null,
    };
  },
  async created() {
    this.errorMsg = "";
    this.loading = true;
    try {
      const carId = this.id;
      this.car = await getCarById(carId);

      if (!this.car.user) {
        this.car.user = {};
      }

      this.currentImage = this.car.images && this.car.images.length > 0 ? this.car.images[0] : this.defaultCarImage;
      this.rented = await checkIfCarIsRented(this.car.id);
    } catch (error) {
      this.errorMsg = "Hubo un error al obtener los detalles del auto. Volvé a intentar";
      console.error("Error al obtener los detalles del auto:", error);
    }
    this.loading = false;
  },

  async mounted() {
    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
    });

    try {
      await this.loadGoogleMaps();
      this.checkAndInitMap();
    } catch (err) {
      console.error("Error al cargar Google Maps:", err);
    }

    this.handleRouteChange();
  },

  methods: {
    setCurrentImage(image) {
      this.currentImage = image;
    },
    setDefaultImage(event) {
      event.target.src = this.defaultCarImage;
    },

    async loadGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "geometry"],
      });

      try {
        return await loader.load();
      } catch (error) {
        console.error("Error al cargar Google Maps:", error);
        throw error;
      }
    },

    checkAndInitMap() {
      // Solo inicializar el mapa si debe mostrarse y aún no ha sido inicializado
      if (this.showMap && !this.mapInitialized && 
          this.car?.coordenadas?.lat && this.car?.coordenadas?.lng) {
        this.initMap(this.car.coordenadas);
      }
    },

    async initMap(coordenadas) {
      if (!coordenadas || !coordenadas.lat || !coordenadas.lng) {
        console.error("Coordenadas no válidas:", coordenadas);
        return;
      }

      try {
        // Limpiar mapa existente si hay uno
        if (this.mapInstance) {
          google.maps.event.clearInstanceListeners(this.mapInstance);
          const mapContainer = document.getElementById('map');
          if (mapContainer) mapContainer.innerHTML = '';
        }

        const position = { lat: coordenadas.lat, lng: coordenadas.lng };
        const { Map } = await google.maps.importLibrary("maps");

        const mapContainer = document.getElementById('map');
        if (!mapContainer) {
          console.error("Elemento del mapa no encontrado");
          return;
        }

        this.mapInstance = new Map(mapContainer, {
          center: position,
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
          map: this.mapInstance,
          center: position,
          radius: 1000,
        });
      } catch (error) {
        console.error("Error al inicializar el mapa:", error);
      }
    },

    handleRouteChange() {
      this.$nextTick(() => {
        if (this.showMap && this.car?.coordenadas) {
          this.initMap(this.car.coordenadas);
        }
      });
    }
  },
  watch: {
    startDate(newVal) {
      this.$emit('update:dates', { startDate: newVal, endDate: this.endDate });
    },
    endDate(newVal) {
      this.$emit('update:dates', { startDate: this.startDate, endDate: newVal });
    },
    '$route'(to, from) {
      this.handleRouteChange();
    },
    showMap(newVal) {
      if (newVal && this.car?.coordenadas) {
        this.initMap(this.car.coordenadas);
      }
    },
    // Observar cambios en showMap para reinicializar el mapa cuando sea necesario
    showMap(newVal) {
      if (newVal) {
        this.$nextTick(() => {
          this.checkAndInitMap();
        });
      }
    },
    // Observar cambios en las coordenadas del auto para reinicializar el mapa
    'car.coordenadas': {
      handler(newCoords) {
        if (newCoords && this.showMap) {
          this.$nextTick(() => {
            this.checkAndInitMap();
          });
        }
      },
      deep: true
    }
  },
  computed: {
    shouldShowMap() {
      return !this.$route.path.includes('/information') && 
             !this.$route.path.includes('/confirmation');
    },
    // Nueva propiedad computada que combina todas las condiciones
    showMap() {
      return this.car && 
             this.car.coordenadas && 
             this.car.coordenadas.lat && 
             this.car.coordenadas.lng && 
             this.shouldShowMap && 
             !this.hideMap;
    }
  }
};
</script>


<template>
  <section v-if="car" class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
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
          <img v-for="(image, index) in car.images" :key="index" :src="image" @click="setCurrentImage(image)"
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
            ${{ car.precio }} /día
          </Heading>
        </div>
      </div>
      <div v-if="car.user_id !== loggedUser?.id">
        <router-link :to="`/user/${car.user_id}`" class="flex items-center gap-2 hover:cursor-pointer">
          <img :src="car.user?.photoURL || defaultUserImage" :alt="car.user.userName" :title="car.user.userName"
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
  <section v-else class="w-full m-2.5 flex flex-col gap-3 overflow-hidden">
    <p v-if="errorMsg">{{ errorMsg }}</p>
    <p v-else>Cargando...</p>
  </section>
  <div class="m-2.5 w-full flex flex-col gap-3">
    <div v-if="shouldShowMap" class="map-container">
      <div 
        id="map"
        v-show="showMap" 
        style="width: 100%; height: 300px; border-radius: 40px;"
      ></div>
      
      <div 
        v-show="!showMap"
        class="bg-background-800 w-full h-[300px] rounded-[40px] flex items-center justify-center font-semibold text-background-600"
      >
        <p>Mapa no disponible</p>
      </div>
    </div>
  
    <div class="bg-deep-blue-900 w-full rounded-[40px] p-8 h-fit">
      <router-view v-if="car && car.precio !== undefined && loggedUser" 
        :car="car" 
        :logged-user="loggedUser"
        :rented="rented" 
        @hide-map="hideMap = true" 
        @show-map="hideMap = false" />
    </div>

    <span v-if="rented && car.user_id !== loggedUser?.id"
      class="bg-red-100 text-red-800 text-base font-medium me-2 px-2.5 py-0.5 rounded-sm border border-red-400">
      Este auto ya esta alquilado
    </span>
    <span v-if="rented && car.user_id == loggedUser?.id"
      class="bg-red-100 text-red-800 text-base font-medium me-2 px-2.5 py-0.5 rounded-sm border border-red-400">
      Tu auto ya esta alquilado
    </span>
  </div>
</template>