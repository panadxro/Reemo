<script setup>
import defaultCarImage from '@/assets/Car-Img.png';

const props = defineProps({
  car: {
    type: Object,
    required: true
  },
  rental: {
    type: Object,
    default: null
  }
});

const setDefaultImage = (event) => {
  event.target.src = defaultCarImage.value;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-AR', options).replace(',', '');
};

const formatPrice = (price) => {
  return Math.round(price).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
};
</script>

<template>
  <div class="bg-white flex rounded-xl shadow-sm p-4 mb-4 cursor-pointer hover:shadow-md transition-shadow">
    <div class="relative overflow-hidden ">
        <div class="absolute top-1 left-1 z-10">
          <span class="font-semibold bg-white rounded-lg p-1 text-xs" :class="{
                            'text-blue-600': rental.status === 'completed',
                            'text-indigo-600': rental.status === 'in_progress',
                          }">
                        {{ 
                          rental.status === "completed" ? "Completado" : 
                          rental.status === "in_progress" ? "En progreso" : "N/A" }}
                      </span>
        </div>

        
        <div class="">
          <img :src="car.photos?.[0] || defaultCarImage" @error="setDefaultImage" :alt="car.basicInfo?.brand + ' ' + car.basicInfo?.model" 
          class="object-cover rounded-lg w-35 h-30"/>
        </div>
    </div>

    <div class="ml-2">
        <h3 class="font-bold text-lg text-deep-blue-900">
          {{ car.basicInfo?.model || 'Modelo no disponible' }}, 
          {{ car.basicInfo?.year || 'Año no disponible' }}
        </h3>
        <p class="text-gray-500 text-sm">
          {{ formatDate(rental.end_time) }}
        </p>
        <p class="text-gray-500 mt-1 text-sm">
          ARS${{ formatPrice(rental.payments.amount || 0) }}
        </p>
        <div v-if="car.ownerId !== rental.driver_id" class="flex items-center gap-2 mt-1">
          <img :src="rental.driverDetails?.photoURL" :alt="rental.driverDetails?.name + ' ' + rental.driverDetails?.lastName"
          class="w-4 h-4 object-cover rounded-full"/>
          <p class="text-gray-500 mt-1 text-sm">
        <span>Alquilado a </span>
        <span class="font-medium">
          {{ `${rental.driverDetails?.name} ${rental.driverDetails?.lastname || ''}` }}
        </span>
      </p>
        </div>
        <div v-else class="flex items-center gap-2 mt-1"> 
          <img :src="rental.ownerDetails?.photoURL" :alt="rental.ownerDetails?.name + ' ' + rental.ownerDetails?.lastName"
          class="w-4 h-4 object-cover rounded-full"/>
          <p class="text-gray-500 mt-1 text-sm">
        <span>Alquilado a </span>
        <span class="font-medium">
          {{ `${rental.ownerDetails?.name} ${rental.ownerDetails?.lastname || ''}` }}
        </span>
        </p>
        </div>
      </div>
  </div>
</template>