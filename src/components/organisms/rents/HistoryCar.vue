<script setup>
import defaultCarImage from '@/assets/Car-Img.png';
import defaultUserImage from '@/assets/User.png';
import Heading from '@components/atoms/Heading.vue'
import Status from '@components/molecules/Status.vue';

const props = defineProps({
  rent: {
    type: Object,
    required: true
  },
  rental: {
    type: Object,
    default: null
  }
});

const car = props.rent;

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
  <li class="bg-white flex gap-2 min-h-25 rounded-xl shadow-sm px-2.5 py-2 cursor-pointer hover:shadow-md transition-shadow">
    <div class="relative flex items-center">
      <Status class="absolute top-0 left-1" size="mini" :status="car.vehicleDetails.status.current" />
      <img 
        :src="car.vehicleDetails.photos?.[0] || defaultCarImage" @error="setDefaultImage" 
        :alt="car.vehicleDetails.basicInfo?.brand + ' ' + car.vehicleDetails.basicInfo?.model" 
        class="object-cover rounded-lg w-25 h-15"
      />
      <img 
        v-if="car.ownerId !== car.driver_id"
        :src="car.ownerDetails?.profilePhoto || defaultUserImage" 
        :alt="car.ownerDetails?.name + ' ' + car.ownerDetails?.lastName"
        class="absolute bottom-0 right-1 w-8 h-8 object-cover rounded-full bg-white"
      />
    </div>

    <div class="flex flex-col justify-between py-2 text-gray-500 font-medium text-xs">
      <Heading :type="4" class="small">
        {{ car.vehicleDetails.basicInfo?.brand || 'Marca no disponible' }} 
        {{ car.vehicleDetails.basicInfo?.year || 'Año no disponible' }}
      </Heading>
      <p>{{ formatDate(car.end_time) }}</p>
      <p>ARS${{ formatPrice(car.payments.amount || 0) }}</p>
<!--       <p v-if="car.ownerId !== car.driver_id">
        Alquilado a {{ car.driverDetails?.name }} {{car.driverDetails?.lastname || '' }}</p> -->
      <p>Alquilado por {{ car.ownerDetails?.name }}</p>
    </div>
  </li>
</template>