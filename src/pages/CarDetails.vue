<script>
import { getCarById, checkIfCarIsRented } from "../services/car-service.js";
import { Loader } from "@googlemaps/js-api-loader";
import { subscribeToAuthState } from "../services/auth.js";

import Heading from "../components/atoms/Heading.vue";
import Pill from "../components/atoms/Pill.vue";
import Loading from "@icons/Loading.vue";
import BackButton from "../components/atoms/BackButton.vue";
import Arrow from "../icons/Arrow.vue";
import Like from "../icons/Like.vue";

import RentalStep1 from "@components/organisms/rental/RentalStep1.vue";
import RentalStep2 from "@components/organisms/rental/RentalStep2.vue";
import RentalStep3 from "@components/organisms/rental/RentalStep3.vue";

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
    RentalStep1,
    RentalStep2,
    RentalStep3,
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
      mapInitialized: false,
      rentalData: {
        rentedFromDate: "",
        rentedUntilDate: "",
        selectedTime: "",
        selectedUntilTime: "",
        currentTotalPrice: 0
      },
      currentStep: 0,
      sections: [
        { title: "Selecciona las fechas" },
        { title: "Información" },
        { title: "Método de pago" },
        { title: "Enviar solicitud" },
      ],
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
      if (this.car.coordenadas && this.car.coordenadas.lat && this.car.coordenadas.lng) {
        await this.loadGoogleMaps();
        this.initMap(this.car.coordenadas);
      }
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
      this.currentImage = image;
    },
    setDefaultImage(event) {
      event.target.src = this.defaultCarImage;
    },

    nextStep() {
      if (this.currentStep < this.sections.length - 1) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },

    handleRentalDataUpdate(data) {
      // Actualizar datos de alquiler
      this.rentalData = { ...this.rentalData, ...data };
      
      // Guardar en localStorage
      localStorage.setItem('rentalData', JSON.stringify(this.rentalData));
      // console.log("Datos de alquiler actualizados:", this.rentalData);
    },

    handleTotalUpdate(price) {
    this.handleRentalDataUpdate({ currentTotalPrice: price });
   },

    submitRentalRequest() {
      // Aquí iría la lógica para enviar la solicitud de alquiler
      console.log("Enviando solicitud de alquiler:", this.rentalData);
      // Implementar la lógica de envío al backend
      alert("¡Solicitud enviada con éxito!");
      
      // Limpiar el almacenamiento
      localStorage.removeItem('rentalData');
      
      // Redirigir al usuario
      // this.$router.push('/rental-confirmation');
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
  watch: {
    'car.coordenadas': {
      handler(newCoords) {
        if (newCoords && this.showMap) {
          this.$nextTick(() => {
            this.checkAndInitMap();
          });
        }
      },
      deep: true
    },
    currentStep(newStep, oldStep) {
    // Si volvemos al paso 0, reinicializamos el mapa
    if (newStep === 0 && oldStep !== 0) {
      this.$nextTick(() => {
        this.checkAndInitMap();
      });
    }
  }
  },
  computed: {
    isDisabled() {
      // Lógica para deshabilitar el botón según el paso
      if (this.currentStep === 0) {
        return !this.rentalData.rentedFromDate || !this.rentalData.rentedUntilDate || !this.rentalData.selectedTime || !this.rentalData.selectedUntilTime || this.rented;
      }
      return false;
    },
    
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
    <div class="map-container">
      <div 
        id="map"
        style="width: 100%; height: 300px; border-radius: 40px;"
        v-show="currentStep === 0"
      ></div>
    </div>
  
    <!-- Proceso de renta por pasos -->
    <div class="bg-deep-blue-900 w-full rounded-[40px] p-8 h-fit">
       <!-- Paso 1: Selección de fechas -->
  <RentalStep1 
  v-if="currentStep === 0"
  :car="car" 
  :logged-user="loggedUser"
  :rented="rented"
  :current-step="currentStep"
  :sections="sections"
  @update-dates="handleRentalDataUpdate"
  @total-updated="handleTotalUpdate"
  @continue="nextStep"
  :prev-step="prevStep"
/>

<!-- Paso 2: Información -->
<RentalStep2 
  v-if="currentStep === 1"
  :car="car"
  :logged-user="loggedUser"
  :rented="rented"
  :current-step="currentStep"
  :sections="sections"
  @continue="nextStep"
  :prev-step="prevStep"
/>

<!-- Paso 3: Confirmación -->
<RentalStep3 
  v-if="currentStep === 2"
  :car="car"
  :loggedUser="loggedUser"
  :rented="rented"
  :current-step="currentStep"
  :sections="sections"
  @continue="nextStep"
  :prev-step="prevStep"
/>
      
      
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