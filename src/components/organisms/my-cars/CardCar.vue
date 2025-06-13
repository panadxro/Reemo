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
    // handleLike(event) {
    //   event.preventDefault();
    //   this.$emit('like', this.car.id);
    // },

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
  <div class="relative flex flex-col overflow-hidden rounded-2xl hover:shadow-custom transition-all duration-300 bg-white">
    <!-- <button
      @click.stop="handleLike"
      class="absolute top-3 right-3 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-300"
      aria-label="Añadir a favoritos"
    >
      <Like />
    </button> -->

    <router-link 
      :to="{ name: 'CarDetails', params: { id: car.id } }" 
      class="flex flex-col h-full"
    >
      <div class="relative w-full overflow-hidden">
        <div class="absolute top-3 left-3 z-10">
          <Status :status="car.isAvailable ? 'validated' : 'not-validated'" />
        </div>

        <div class="absolute bottom-3 right-3 z-10 px-2 py-1 rounded-2xl text-sm font-semibold flex items-center bg-primary-100/80">
          <p>{{ car.transmision }}</p>
        </div>
        
        <div class="w-full aspect-[16/9] overflow-hidden">
          <img
            class="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            :src="car.photos && car.photos.length > 0 ? car.photos[0] : defaultCarImage" 
            @error="setDefaultImage"
            :alt="car.basicInfo?.brand + ' ' + car.basicInfo?.model" 
          />
        </div>
      </div>
      <div class="flex flex-1 flex-row justify-between items-end">
        <article class="flex flex-col align-end justify-between">
          <p class="text-sm text-gray-500">{{ car.basicInfo?.brand }}</p>
          <Heading :type="4">{{ car.basicInfo?.model }}</Heading>
        </article>
        <Heading :type="4">${{ car.pricing?.rates?.daily }}/ día</Heading>
      </div>        
    </router-link>
  </div>
</template>