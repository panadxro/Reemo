<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores';

import defaultCarImage from '@/assets/Car-Img.png';
import defaultUserImage from '@/assets/User.png';
import Heading from '@components/atoms/Heading.vue'
import Status from '@components/molecules/Status.vue';
import Popover  from '@components/molecules/Popover.vue';

const props = defineProps({
  rent: {
    type: Object,
    required: true
  },
  rental: {
    type: Object,
    default: null
  },
  index: {
    type: Number,
    required: true
  },
  isSelected: {  
    type: Boolean,
    default: false
  }
});

const router = useRouter();

// Data openPopoverId
const openPopoverId = ref(null);

const car = props.rent;
const authStore = useAuthStore();

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

const isMyCar = computed(() => car.owner_id === authStore.user?.id);

const goToRentDetail = (id) => {
  router.push({ name: 'RentDetail', params: { id: id } });
};

const handleTogglePopover = (popoverId) => {
  openPopoverId.value = openPopoverId.value === popoverId ? null : popoverId;
};

const handleClosePopover = () => {
  openPopoverId.value = null;
};
</script>

<template>
  <li class="flex gap-2 min-h-25 rounded-xl shadow-sm px-2.5 py-2 cursor-pointer hover:shadow-md transition-shadow"
    :class="{
      'bg-vibrant-light-600': isSelected,  
      'bg-white': !isSelected    
    }">
    <div class="relative flex items-center">
      <Status class="absolute top-0 left-1" size="mini" :status="car.vehicleDetails.status.current" />
      <img 
        :src="car.vehicleDetails.photos?.[0] || defaultCarImage" @error="setDefaultImage" 
        :alt="car.vehicleDetails.basicInfo?.brand + ' ' + car.vehicleDetails.basicInfo?.model" 
        class="object-cover rounded-lg w-25 h-15"
      />
      <img 
        v-if="!isMyCar"
        :src="car.ownerDetails?.profilePhoto || defaultUserImage" 
        :alt="car.ownerDetails?.name + ' ' + car.ownerDetails?.lastName"
        class="absolute bottom-0 right-1 w-8 h-8 object-cover rounded-full bg-white"
      />
      <img 
        v-else
        :src="car.driverDetails?.photoURL || defaultUserImage" 
        :alt="car.driverDetails?.name + ' ' + car.driverDetails?.lastName"
        class="absolute bottom-0 right-1 w-8 h-8 object-cover rounded-full bg-white"
      />
    </div>

    <div class="flex flex-col justify-between py-2 text-gray-500 font-medium text-xs">
      <Heading :type="4" class="small">
        {{ car.vehicleDetails.basicInfo?.brand || 'Marca no disponible' }} 
        {{ car.vehicleDetails.basicInfo?.model || 'Modelo no disponible' }}
      </Heading>
      <p>{{ formatDate(car.end_time) }}</p>
      <p>${{ formatPrice(car.payments.amount || 0) }}</p>
      <p v-if="isMyCar">
        Alquilado a {{ car.driverDetails?.name }} {{ car.driverDetails?.lastname || '' }}
      </p>
      <p v-else>
        Alquilado por {{ car.ownerDetails?.name }} {{ car.ownerDetails?.lastname || '' }}
      </p>
    </div>
    <div class="flex flex-1 justify-end items-center md:hidden">
      <Popover 
        :items="[
          { label: 'Ver detalles', action: () => goToRentDetail(car.id) },
        ]"
        :isOpen="openPopoverId === index"
        :popoverId="index"
        @toggle-popover="handleTogglePopover"
        @close-popover="handleClosePopover"
      />
    </div>
  </li>
</template>