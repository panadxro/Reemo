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
    name: 'CardCar',
    components: { Heading, Arrow, Transmition, Chasis, PopoverPublication, Like, Status },
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
    handleLike(event) {
      event.preventDefault();
      this.$emit('like', this.car.id);
    },

/*     async handleDelete(id) {
  this.loading = true;
  try {
    const result = await unsubscribeToPublication(id);
    if (result.success) {
      console.log('Publicación eliminada');
      addAlert(`${this.car.marca} ${this.car.modelo} eliminado`, 'success');
    } else {
      console.error(result.message);
      addAlert('Error al eliminar la publicación', 'error');
    }
  } catch (error) {
    addAlert('Error al eliminar la publicación', 'error');
    console.error('Error al eliminar la publicación:', error);
  } finally {
    this.loading = false;
  }
}, */

/* async handleToggleAvailability(carId) {
  this.loading = true;
  try {
    const result = await toggleAvailability(carId);
    if (result.success) {
      this.car.isAvailable = result.newAvailability;
      if (result.newAvailability) {
        addAlert(`${this.car.marca} ${this.car.modelo} Disponible`, 'success');
      } else {
        addAlert(`${this.car.marca} ${this.car.modelo} No Disponible`, 'error');
      }
    } else {
      console.error(result.message);
      addAlert('Error al cambiar la disponibilidad', 'error');
    }
  } catch (error) {
    addAlert('Error al cambiar la disponibilidad:', 'error');
  } finally {
    this.loading = false;
  }
}, */
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
  <div class="relative flex flex-col overflow-hidden border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 bg-white">
    <button
      @click.stop="handleLike"
      class="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-300"
      aria-label="Añadir a favoritos"
    >
      <Like />
    </button>

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
            :src="car.images && car.images.length > 0 ? car.images[0] : defaultCarImage" 
            @error="setDefaultImage"
            :alt="car.marca + ' ' + car.modelo" 
          />
        </div>
      </div>

      <div class="flex flex-col p-4 flex-1">
        <div class="mb-2">
          <p class="text-sm font-medium text-primary-500">{{ car.marca }}</p>
          <Heading :type="4" class="text-gray-900 font-bold line-clamp-1">{{ car.modelo }}</Heading>
        </div>
        
        <div class="flex gap-3 mt-1 mb-3">
          <div class="flex items-center text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {{ car.transmision || "Automático" }}
          </div>
          <div class="flex items-center text-xs text-gray-500">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {{ car.year || "2023" }}
          </div>
        </div>
        
        <div class="flex justify-between items-center mt-auto pt-2 border-t border-gray-100">
          <div class="flex items-center">
            <Heading :type="4" class="text-primary-600 font-bold">${{ car.precio }}<span class="text-xs font-normal">/hr</span></Heading>
          </div>
        </div>
      </div>
    </router-link>
  </div>
</template>