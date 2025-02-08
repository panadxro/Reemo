<script>
import { getAvailableCars, addCar } from "../services/car-service.js";
import { subscribeToAuthState } from "../services/auth.js";
import { subscribeToNewPublication } from "../services/publication.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/my-cars/CardCar.vue";
import AddIcon from "@icons/AddIcon.vue";
import Loading from "@icons/Loading.vue";

import { Loader } from "@googlemaps/js-api-loader";
import AddressInput from "@/components/google-maps/addressInput.vue";

export default {
  name: "Publications",
  components: { Heading, CardCar, AddIcon, Loading, AddressInput },
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

    initAutocomplete() {
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
    },

    async updateMapMarkers() {
      
      if(!this.map){
        console.error("El mapa no se esta iniciando");
        return;
      }
      
      // const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
      const { Marker } = await google.maps.importLibrary("marker"); 

      // limpia los marcadores anteriores
      this.markers.forEach(marker => marker.setMap(null));
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
           `;

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

        const customInfoWindow = new google.maps.InfoWindow({
          content: infoWindowContent,
          // disableAutoPan: true,
        });

        // cuando clickea afuera del infoWindows se cierra 
        this.map.addListener('click', () =>{
          customInfoWindow.close();
        })
      
        // informacion de los vehiculos al hacer click
        // marker.addListener('click', () => {
        //   infoWindow.open(this.map, marker);
        // })

        marker.addListener('click', () => {
          customInfoWindow.open(this.map, marker);
        })

        // redirecciona a la descripcion de cada vehiculo
        google.maps.event.addListener(customInfoWindow, "domready", () => {
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
        });


        this.markers.push(marker);
        // Expande los límites del mapa
        bounds.extend(position); 
      });
 
      setTimeout(() => {
        if (this.filteredCars.length > 0) {
          this.map.fitBounds(bounds);
        }
      }, 500);

    },



    async loadGoogleMaps() {
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

    },

  },
  mounted() {
    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      this.fetchCars();
      this.loadGoogleMaps();
      this.initMap();
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

    <!-- Input de busqueda con places de google Maps -->
    <div class="relative">
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
    </div>

    <!-- Renderizado del mapa -->
    <div id="map" style="width: 100%; height: 400px;"></div>

    <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
      <Loading role="status" />
      <span class="sr-only">Cargando...</span>
    </div>

    <!-- <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
  <div v-for="car in filteredCars" :key="car.id" class="p-4 border rounded">
    <h2 class="font-bold">{{ car.marca }} {{ car.modelo }}</h2>
    <p><strong>Dirección:</strong> {{ car.direccion }}</p>
    <p><strong>Precio:</strong> ${{ car.precio }}</p>
    <img :src="car.imagen || 'imagen_default.jpg'" alt="Carro" class="w-full h-32 object-cover">
  </div>
</div> -->

    <div
      class="max-w-md mx-auto md:max-w-screen-xl m-4 grid justify-items-center gap-4 md:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
      <div v-for="(car, index) in filteredCars" :key="car.id"
        class="rounded-2xl shadow-md relative flex relative flex-col shadow-sm w-full overflow-hidden hover:bg-primary-300">
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

<style>
  .custom-infowindow {
  max-width: 300px;
  background: white;
  border-radius: 12px 0;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  font-family: Arial, sans-serif;
  position: relative;
}

.infowindow-container {
  display: flex;
  flex-direction: column;
}

.infowindow-image img {
  padding: 0 !important;
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px;
}

.infowindow-details {
  padding: 8px;
  text-align: left;
}

.infowindow-btn {
  width: 100%;
  background: #2A3EF4;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
}

.infowindow-btn:hover {
  background: #1d2ecb;
}


.gm-ui-hover-effect {
  display: none !important;
}

.gm-style-iw {
  box-shadow: none !important;
  border-radius: 10px;
  padding: 0 !important;
  width: auto !important;
  height: auto !important;
  max-width: none !important;
}

/* Saca el scroll */
.gm-style-iw-d {
  min-height: 250px !important;
  max-height: none !important;
  max-width: none !important;
  padding: 0 !important;
  overflow: hidden !important;
}

.gm-style-iw-c {
  height: auto !important;
  max-height: none !important;
}

</style>