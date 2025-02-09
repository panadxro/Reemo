<script>
import { subscribeToAuthState } from "@services/auth.js";
import { unsubscribeToPublication, toggleAvailability } from '@services/publication.js';
import { addAlert } from "@services/alerts.js";

import Heading from "../atoms/Heading.vue";
import Arrow from '@icons/Arrow.vue';
import Chasis from '@icons/Chasis.vue';
import Transmition from '@icons/Transmition.vue';
import defaultCarImage from '@assets/Car-Img.png';
import PopoverPublication from './PopoverPublication.vue';

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
    components: { Heading, Arrow, Transmition, Chasis, PopoverPublication },
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

    async handleDelete(id) {
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
},

async handleToggleAvailability(carId) {
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
  <div class="flex flex-row border-2 border-secondary-100 px-3 py-4">
    <figure class="aspect-2/3 w-25 m-2 h-16 overflow-hidden "> 
      <img
        class="rounded-xl object-center object-cover w-full h-full"
        :src="car.images && car.images.length > 0 ? car.images[0] : defaultCarImage" 
        @error="setDefaultImage"
        :alt="car.marca + ' ' + car.modelo" 
      />
    </figure>
    <div class="flex flex-1 flex-row justify-between items-center">
      <article class="flex flex-col align-end justify-between">
        <p class="text-sm text-gray-500">{{ car.marca }}</p>
        <Heading :type="3">{{ car.modelo }}</Heading>
      </article>
      <PopoverPublication
        :isOwner="car.user_id === loggedUser.id"
        :isAvailable="car.isAvailable"
        :loading="loading"
        :onDelete="() => handleDelete(car.id)"
        :onToggleAvailability="() => handleToggleAvailability(car.id)"
      />
    </div>
  </div>
</template>

<!--       <div class="mt-4 flex flex-col items-center gap-4">
        <button 
          @click="goToCarDetails(car.id)" 
          type="button" 
          class="w-full flex justify-between items-center rounded-xl bg-secondary-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-secondary-800 focus:outline-hidden focus:text-secondary-900 focus:ring-4 focus:ring-secondary-900  focus:bg-white"
        >
          <span>Ver Detalles</span>
          <Arrow direction="right" class="hover:text-secondary-900"/>
        </button>        
      </div> -->
