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
    handleLike() {
      console.log('Like');
    }

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
  <div class="relative flex flex-col border-2 rounded-3xl border-secondary-100 p-4">
    <button
      @click.stop="handleLike"
      class="absolute top-4 right-4 z-10 p-2 rounded-full"
    >
      <Like />
    </button>

    <router-link 
      :to="{ name: 'CarDetails', params: { id: car.id } }" 
      class="flex flex-col"
    >
      <div class="flex flex-row gap-2">
        <Status :status="car.isAvailable ? 'validated' : 'not-validated'" />
      </div>
      <div class="flex justify-end">
        <figure class="aspect-[21/9] h-24 overflow-hidden"> 
          <img
            class="rounded-xl object-center object-cover w-full h-full"
            :src="car.images && car.images.length > 0 ? car.images[0] : defaultCarImage" 
            @error="setDefaultImage"
            :alt="car.marca + ' ' + car.modelo" 
          />
        </figure>
      </div>
      <div class="flex flex-1 flex-row justify-between items-end">
        <article class="flex flex-col align-end justify-between">
          <p class="text-sm text-gray-500">{{ car.marca }}</p>
          <Heading :type="4">{{ car.modelo }}</Heading>
        </article>
        <Heading :type="4">${{ car.precio }}/ hr</Heading>
      </div>
    </router-link>
  </div>
</template>