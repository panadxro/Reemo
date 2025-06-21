<script>
import { subscribeToAuthState } from "@services/auth.js";
import { unsubscribeToPublication, toggleAvailability } from '@services/publication.js';
import { addAlert } from "@services/alerts.js";

import Heading from "@components/atoms/Heading.vue";
import Arrow from '@icons/Arrow.vue';
import Chasis from '@icons/Chasis.vue';
import Transmition from '@icons/Transmition.vue';
import defaultCarImage from '@assets/Car-Img.png';
import PopoverPublication from './PopoverPublication.vue';
import Like from '@icons/Like.vue';
import Status from '@components/molecules/Status.vue'

export default {
    data() {
      return {
        defaultCarImage, 
        loading: false,
        loggedUser: {
          id: null
        },
        currentPhotoIndex: 0,
        photoInterval: null
      };
    },
    name: 'CardCar',
    components: { Heading, Arrow, Transmition, Chasis, PopoverPublication, Like, Status },
    props: {
      car: {
        type: Object,
        required: true
      }
    },
    methods: {
      startPhotoRotation() {
        // Si hay mas de una foto, iniciamos la rotación
        if (this.car.photos && this.car.photos.length > 1) {
          this.photoInterval = setInterval(() => {
            this.currentPhotoIndex = (this.currentPhotoIndex + 1) % this.car.photos.length;
          }, 1000); // Cambia cada 1000 ms (1 segundo)
        }
      },
      stopPhotoRotation() {
        if (this.photoInterval) {
          clearInterval(this.photoInterval);
          this.photoInterval = null;
          this.currentPhotoIndex = 0; // Reinicia el índice de la foto actual
        }
      },

      goToCarDetails(id) {
        this.$router.push({ name: 'CarDetails', params: { id: id } });
      },

      // Método que muestra la imagen por defecto si hay error (por si borramos imagenes desde storage)
      setDefaultImage(event) {
        event.target.src = this.defaultCarImage;
      },
    }
}
</script>

<template>
  <div 
    @mouseenter="startPhotoRotation"
    @mouseleave="stopPhotoRotation"
    class="relative flex flex-col overflow-hidden rounded-2xl hover:shadow-custom transition-all duration-300 bg-white border-2 border-vibrant-light-600 hover:border-vibrant-light-700">
    <router-link 
      :to="{ name: 'CarDetails', params: { id: car.id } }" 
      class="flex flex-col h-full"
    >
      <div class="relative w-full overflow-hidden">
        <div class="absolute top-3 left-3 z-10">
          <Status :status="car.isAvailable ? 'validated' : 'not-validated'" />
        </div>

        
        <div class="w-full aspect-[16/9] overflow-hidden">
          <img
            class="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            :src="car.photos && car.photos.length > currentPhotoIndex ? car.photos[currentPhotoIndex] : defaultCarImage" 
            @error="setDefaultImage"
            :alt="car.basicInfo?.brand + ' ' + car.basicInfo?.model" 
          />
        </div>
      </div>
      <div class="flex flex-1 flex-row justify-between items-end px-3.5 pb-3.5 pt-1.5">
        <article class="flex flex-col align-end justify-between">
          <p class="text-sm text-gray-500">{{ car.basicInfo?.brand }}</p>
          <Heading :type="4">{{ car.basicInfo?.model }}</Heading>
        </article>
        <Heading :type="4">${{ car.pricing?.rates?.daily }}/ día</Heading>
      </div>        
    </router-link>
  </div>
</template>