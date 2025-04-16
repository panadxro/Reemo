<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";
import { Loader } from "@googlemaps/js-api-loader";

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

      const searchLatLng = new google.maps.LatLng(this.searchLocation.lat, this.searchLocation.lng);
      const searchRadius = 5000;

      this.filteredCars = this.cars.filter(car => {
        if (!car.coordenadas) return false;

        const carLatLng = new google.maps.LatLng(car.coordenadas.lat, car.coordenadas.lng);
        const distance = google.maps.geometry.spherical.computeDistanceBetween(searchLatLng, carLatLng);

        return distance <= searchRadius; // muestra autos que solo estan dentro del radio
      });


      if (this.map && this.searchLocation) {
        console.log("📍 Centrando el mapa en la búsqueda:", this.searchLocation);
        this.map.setCenter(this.searchLocation);
        this.map.setZoom(14);
      }

      // 📌 Mostrar mensaje si no hay autos
      if (this.filteredCars.length === 0) {
        console.warn("⚠️ No hay autos cercanos en esta zona.");
        // alert("No hay autos disponibles en un radio de 5 km.");
      }

      console.log("🔄 Llamando a updateMapMarkers()...");
      // this.updateMapMarkers();
      setTimeout(() => this.updateMapMarkers(), 500);
    },

/*     initAutocomplete() {
      const input = document.getElementById("searchInput");

      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["geocode"],
        componentRestrictions: { country: "AR" },
        fields: ["formatted_address", "geometry"],
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (!place.geometry || !place.geometry.location) {
          console.error("No se pudo obtener la direccion o coordenadas")
          return;
        }

        this.searchQuery = place.formatted_address;
        this.searchLocation = place.geometry.location.toJSON();

        // console.log("direccion seleccionada:", this.searchQuery);
        // console.log("coordenadas:", this.searchLocation);

        this.filterCars();
      })
    }, */

/*     async updateMapMarkers() {
      
      if(!this.map){
        console.error("El mapa no se esta iniciando");
        return;
      } */
      
      // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      // const { Marker } = await google.maps.importLibrary("marker"); 

      // limpia los marcadores anteriores
/*       this.markers.forEach(marker => marker.setMap(null));
      this.markers = [];

      if (this.filteredCars.length === 0) {
        console.warn("No hay autos para mostrar en el mapa.");
        return;
      }

      const bounds = new google.maps.LatLngBounds();

      this.filteredCars.forEach(car => {
        if (!car.coordenadas || !car.coordenadas.lat || !car.coordenadas.lng) {
          console.warn(`El auto con ID ${car.id} no tiene coordenadas.`);
          return;
        }

        const position = {
          lat: car.coordenadas.lat,
          lng: car.coordenadas.lng
        };

        // const marker = new AdvancedMarkerElement({
        const marker = new google.maps.Marker({
          map: this.map,
          position: position,
          title: car.direccion,
        });

        const imageUrl = car.images && car.images.length > 0 ? car.images[0] : defaultCarImage;
        
        const infoWindowContent = document.createElement('div');
        infoWindowContent.classList.add('custom-infoWindow');

        infoWindowContent.innerHTML = `
          <div class="infowindow-container">
            <figure class="infowindow-image">
              <img src="${imageUrl}" alt="${car.marca} ${car.modelo}" />
            </figure>
            <div class="infowindow-details">
              <h3>${car.marca} ${car.modelo}</h3>
              <p>⭐ 5.0 - 6 valoraciones</p>
              <p><strong>${car.precio} € / día</strong></p>
              <p>28040 Buenos Aires • Servicio de entrega disponible</p>
              <button class="infowindow-btn" id="btn-${car.id}">Ver Detalles</button>
            </div>
          </div>
           `; */

        // const infoWindow = new google.maps.InfoWindow({
        //   content: `
        //     <div style="
        //       max-width: 300px; 
        //       max-height: 300px; 
        //       background: white; 
        //       border-radius: 12px; 
        //       overflow: hidden;
        //       box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        //       padding: 10px;
        //       font-family: Arial, sans-serif;
        //     ">
        //       <figure style="position: relative; margin: 0;">
        //         <img 
        //           src="${imageUrl}"
        //           alt="${car.marca} ${car.modelo}" 
        //           style="width: 100%; height: 140px; object-fit: cover; border-radius: 8px;"
        //         />
        //       </figure>

        //       <div style="padding: 8px;">
        //         <h3 style="margin: 0; font-size: 16px; font-weight: bold;">${car.marca} ${car.modelo}</h3>
        //         <p style="color: #666; font-size: 14px; margin: 4px 0;">⭐ 5.0 - 6 valoraciones</p>
        //         <p style="color: #333; font-weight: bold; font-size: 18px;">${car.precio} € / día</p>
        //         <p style="font-size: 12px; color: #555;"> 28040 Buenos Aires • Servicio de entrega disponible</p>

        //         <button 
        //           id="btn-${car.id}"
        //           type="button" 
        //           class="w-full flex justify-between items-center rounded-xl bg-secondary-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary-800 focus:outline-none focus:text-secondary-900 focus:ring-4 focus:ring-secondary-900  focus:bg-white"
        //         >
        //           <span>Ver Detalles</span>
        //         </button> 

        //       </div>
        //     </div>
        //   `,
        // });

/*         const customInfoWindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          disableAutoPan: true,
        }); */

        // cuando clickea afuera del infoWindows se cierra 
/*         this.map.addListener('click', () =>{
          customInfoWindow.close();
        }) */
      
        // informacion de los vehiculos al hacer click
        // marker.addListener('click', () => {
        //   infoWindow.open(this.map, marker);
        // })

/*         marker.addListener('click', () => {
          customInfoWindow.open(this.map, marker);
        }) */

        // redirecciona a la descripcion de cada vehiculo
/*         google.maps.event.addListener(customInfoWindow, "domready", () => {
          const waitForButton = () => {
            const btn = document.getElementById(`btn-${car.id}`);
            if (btn) {
              btn.addEventListener("click", () => {
                this.goToCarDetails(car.id);
              });
            } else {
              console.warn(`intentando encontrar btn-${car.id}...`);
              // reintenta cada 100ms hasta que aparezca
              setTimeout(waitForButton, 100); 
            }
          };
          // inicia el proceso de espera
          waitForButton(); 
        }); */


/*         this.markers.push(marker);
        // Expande los límites del mapa
        bounds.extend(position); 
      }); */
 
/*       setTimeout(() => {
        if (this.filteredCars.length > 0) {
          this.map.fitBounds(bounds);
        }
      }, 500); */

    // },



/*     async loadGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "geometry"], // 
      });

      try {
        await loader.load();
      } catch (error) {
        console.error("Error al cargar Google Maps:", error);
      }
    },

    async initMap() {

      const { Map } = await google.maps.importLibrary("maps");

      this.map = new Map(document.getElementById('map'), {
        center: { lat: -34.603722, lng: -58.381592 },
        zoom: 10,
        mapId: "4808da25693c56c8",
        streetViewControl: false,
        mapTypeControl: false,
        icon: {
          url: "https://cdn-icons-png.flaticon.com/512/6723/6723155.png",
          scaledSize: new google.maps.Size(40, 40),
        }
      })

      this.initAutocomplete();

    }, */
  },
  mounted() {
    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      this.fetchCars();
      // this.loadGoogleMaps();
      // this.initMap();
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
        />
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
        />
      </div>
      <div class="flex flex-col gap-2.5">
        <Heading :type="3" class="small">Rango de precio</Heading>
        <PriceRange :min="0" :max="100" />
      </div>
      <div class="flex flex-col gap-3">
        <Heading :type="3" class="small">Chasis</Heading>
        <div class="flex gap-x-16 gap-y-4 flex-wrap ">
          <Checkbox
            v-for="chassis in chassisTypes"
            :key="chassis"
            :id="chassis.toLowerCase()" 
            :name="chassis.toLowerCase()" 
            :label="chassis" 
            labelPosition="right" 
            class="text-deep-blue-900"
            v-model="selectedChassis"
            :value="chassis"
          />
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

      <!-- Renderizado del mapa -->
  <!--     <div id="map" style="width: 100%; height: 400px;"></div>
  -->
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
          <div 
            v-for="(car, index) in cars" :key="car.id"
            class="rounded-2xl flex relative flex-col shadow-xs w-full"
            >
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