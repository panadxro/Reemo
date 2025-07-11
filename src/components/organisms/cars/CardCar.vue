<script>
import { addAlert } from "@services/alerts.js";
import { useCarStore } from "@stores";

import Heading from "@components/atoms/Heading.vue";
import Arrow from '@icons/Arrow.vue';
import Chasis from '@icons/Chasis.vue';
import Transmition from '@icons/Transmition.vue';
import defaultCarImage from '@assets/Car-Img.png';
import Popover from '@components/molecules/Popover.vue';
import Like from '@icons/Like.vue';
import Status from '@components/molecules/Status.vue'

export default {
    name: 'CardCar',
    components: { Heading, Arrow, Transmition, Chasis, Popover, Like, Status },
    props: {
      car: {
        type: Object,
        required: true
      },
      index: {
        type: Number,
        required: true
      },
      layout: {
        type: String,
        default: 'square', // 'square' o 'rectangle'
        validator: value => ['square', 'rectangle'].includes(value)
      }
    },
    setup() {
      const carStore = useCarStore();

      return {
        carStore,
      }
    },
    data() {
      return {
        defaultCarImage, 
        loading: false,
        loggedUser: {
          id: null
        },
        currentPhotoIndex: 0,
        photoInterval: null,
        openPopoverId: null
      };
    },
    methods: {
      handleTogglePopover(popoverId) {
        this.openPopoverId = this.openPopoverId === popoverId ? null : popoverId;
      },
      // Cerrar el popover cuando se hace scroll o clic fuera
      handleClosePopover() {
        this.openPopoverId = null;
      },
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
      async updateAvailability(car) {
        console.log(car)
        try {
          const newStatus = car.status.current === 'not-available' ? 'available' : 'not-available';
          await this.carStore.changeCarAvailability(car.id, newStatus, car.ownerId);

          // Actualizar el estado local del auto en la lista
          const updatedCar = { ...car };
          updatedCar.status.current = newStatus;

          // Actualizar en el store
          this.carStore.userCars = this.carStore.userCars.map(c => 
            c.id === car.id ? updatedCar : c
          );

          addAlert("Estado de disponibilidad actualizado con éxito", "success");
        } catch (error) {
            addAlert("Error al actualizar el estado de disponibilidad", "error");
            console.log(error)
        }
      }
    }
}
</script>

<template>
  <div 
    v-if="layout === 'square'"
    @mouseenter="startPhotoRotation"
    @mouseleave="stopPhotoRotation"
    class="relative flex flex-col overflow-hidden rounded-2xl hover:shadow-custom transition-all duration-300 bg-white border-2 border-vibrant-light-600 hover:border-vibrant-light-700">
    <router-link 
      :to="{ name: 'CarDetails', params: { id: car.id } }" 
      class="flex flex-col h-full"
    >
      <div class="relative w-full overflow-hidden">
        <div class="absolute top-3 left-3 z-1">
          <Status :status="car.status.current" />
        </div>

        
        <div class="w-full aspect-video overflow-hidden">
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

  <li
    v-else
    class="flex items-center bg-white px-5 py-4 rounded-3xl justify-between border-2 border-vibrant-light-600 w-full cursor-pointer"
  >
    <template v-if="$route.matched.some(route => route.name === 'MyCars')">
      <div  class="flex items-center flex-1 gap-2">
        <img 
          :src="car.photos[0] || defaultCarImage"
          @error="setDefaultImage"
          :alt="car.basicInfo?.brand + ' ' + car.basicInfo?.model"
          class="w-16 h-16 object-cover rounded-lg"
        />
        <div class="flex flex-col justify-between">
          <p class="small font-medium text-gray-500">{{ car.basicInfo?.brand }}</p>
          <Heading type="4" class="regular">{{ car.basicInfo?.model }}, {{ car.basicInfo?.year }}</Heading>
        </div>
      </div>
      <Popover 
        :items="[
          { label: 'Ver detalles', action: () => goToCarDetails(car.id) },
          { label: car.status.current == 'not-available' ? 'Habilitar' : 'Deshabilitar', action: () => updateAvailability(car), class: car.status.current !== 'not-available' ? 'text-red-500' : '' },
        ]"
        :isOpen="openPopoverId === index"
        :popoverId="index"
        @toggle-popover="handleTogglePopover"
        @close-popover="handleClosePopover"
      />
    </template>
    <template v-else>
      <router-link
        :to="{ name: 'CarDetails', params: { id: car.id } }"
        class="flex items-center flex-1 gap-2">
        <img 
          :src="car.photos[0] || defaultCarImage"
          @error="setDefaultImage"
          :alt="car.basicInfo?.brand + ' ' + car.basicInfo?.model"
          class="w-16 h-16 object-cover rounded-lg"
        />
        <div class="flex flex-col justify-between">
          <p class="small font-medium text-gray-500">{{ car.basicInfo?.brand }}</p>
          <Heading type="4" class="regular">{{ car.basicInfo?.model }}, {{ car.basicInfo?.year }}</Heading>
        </div>
      </router-link>
      <div class="flex items-end flex-col justify-between">
        <Status :status="car.status.current" size="small"/>
        <p class="text-deep-blue-900 text-lg font-bold">${{ car.pricing?.rates?.daily }}/día</p>
      </div>
    </template>
  </li>
</template>