<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

import { fetchUserRentalHistory } from '@/services/rentedCarService';
import Loading from '@/icons/Loading.vue';

const props = defineProps({
  rentalDetails: {
    type: Object,
    default: null
  }
});

// const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const historyDetails = ref([]);

const currentUser = computed(() => authStore.user);


const loadHistoryData = async () => {
  console.log('[History] loadHistoryData llamado.');
  if (!currentUser.value || !currentUser.value.id) {
    console.warn('[History] Usuario no encontrado o sin ID. currentUser:', currentUser.value);
    isLoading.value = false;
    return;
  }
  isLoading.value = true;

  try {
    const userId = currentUser.value.id;
    console.log('[History] id de currentUser:', userId);

    const history = await fetchUserRentalHistory(userId);
    historyDetails.value = history;

    console.log('[History] resultado de los alquileres: ', JSON.parse(JSON.stringify(historyDetails.value)));
  } catch (error) {
    console.error('[History.vue] Error al cargar solicitudes de alquiler: ', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() =>{
  loadHistoryData();
})

</script>

<template #default="rentalDetails">

  <div class="flex flex-col gap-5">
    <div v-for="car in historyDetails" 
      :key="car.id" 
      class="bg-white flex rounded-2xl cursor-pointer px-2.5 py-2 justify-between" 
      @click="$router.push(`/rent/${car.id}`)">
      <div class="flex items-center gap-6">
        <img :src="car.vehicleDetails.images?.[0] || '@/assets/car-placeholder.png'" 
          :alt="car.vehicleDetails.marca + ' ' + car.vehicleDetails.modelo" 
          class="object-cover rounded-xl w-18 h-14" 
        />
        <div class="flex flex-col justify-between items-start">
          <h3 class="font-bold text-primary-900 leading-tight text-lg">
           {{ car.vehicleDetails.modelo }} {{ car.vehicleDetails.año }}</h3>
          <p class="text-background-600 text-sm">
            Fecha - Hora
          </p>
          <p class="text-background-600 text-sm">
            ${{ car.vehicleDetails.precio }}
          </p>
        </div>
      </div>
      <div v-if="!rentalDetails" class="flex items-center">
        <span class="bg-vibrant-light-600 text-primary-900 px-2 py-1 rounded-lg text-xs">
          {{ car.status }}
        </span>
      </div>
    </div>
  </div>

</template>