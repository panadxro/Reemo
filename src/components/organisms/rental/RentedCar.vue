<script>
import { subscribeToAuthState } from "@services/auth.js";
import { unsubscribeToPublication, toggleAvailability } from '@services/publication.js';
import { addAlert } from "@services/alerts.js";

import Heading from "@components/atoms/Heading.vue";
import Arrow from '@icons/Arrow.vue';
import Chasis from '@icons/Chasis.vue';
import Transmition from '@icons/Transmition.vue';
import defaultCarImage from '@assets/Car-Img.png';

let unsubscribeAuth = () => { };

export default {
    data() {
      return {
        defaultCarImage, 
        loading: false,
        loggedUser: {
          id: null
        },
      };
    },
    name: 'RentedCar',
    components: { Heading, Arrow, Transmition, Chasis },
    props: {
      car: {
        type: Object,
        required: true
      }
    },
    methods: {
      goToCarDetails(id) {
        this.$router.push({ name: 'CarDetails', params: { id: id } });
      },

    // Método que muestra la imagen por defecto si hay error (por si borramos imagenes desde storage)
    setDefaultImage(event) {
      event.target.src = this.defaultCarImage;
    },



  },
  mounted() {
    unsubscribeAuth = subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
    });
  },
  unmounted() {
    unsubscribeAuth();
  },
}
</script>

<template>
  <figure class="flex relative align-center justify-center m-2"> 
    <img
      class="aspect-square w-full max-h-8 object-cover rounded-xl overflow-hidden"
      :src="car.images && car.images.length > 0 ? car.images[0] : defaultCarImage" 
      @error="setDefaultImage"
      :alt="car.marca + ' ' + car.modelo" 
    />
  </figure>
  <div class="flex flex-1 flex-row align-center justify-between gap-8 p-2">
    <article class="flex flex-1 align-end justify-between">
      <Heading :type="4">{{ car.marca }} {{ car.modelo }}</Heading>
    </article>

    <div class="flex flex-row items-center gap-4">
      <button 
        @click="goToCarDetails(car.id)" 
        type="button" 
        class="rounded-xl bg-secondary-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary-800 focus:outline-hidden focus:text-secondary-900 focus:ring-4 focus:ring-secondary-900  focus:bg-white"
      >
        <span class="sr-only">Ver Detalles</span>
        <Arrow direction="right" class="hover:text-secondary-900"/>
      </button>        
    </div>
  </div>
</template>

