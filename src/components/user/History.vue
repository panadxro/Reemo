<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';

import { fetchUserRentalHistory, fetchUserRentedOutHistory } from '@/services/rentedCarService';
import Loading from '@/icons/Loading.vue';
import HistoryCar from '@/components/organisms/rents/HistoryCar.vue';

const props = defineProps({
  showOnly: {
    type: String,
    default: 'all' // 'all', 'rented', 'rented-out'
  }
});

const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const historyData = ref({
  rented: [],    // Vehículos que yo alquilé (como conductor)
  rentedOut: []  // Vehículos míos alquilados por otros
});

const currentUser = computed(() => authStore.user);

const combinedHistory = computed(() => {
  switch(props.showOnly) {
    case 'rented': 
      return historyData.value.rented;
    case 'rented-out':
      return historyData.value.rentedOut;
    default:
      return [...historyData.value.rented, ...historyData.value.rentedOut];
  }
});

const loadHistoryData = async () => {
  if (!currentUser.value?.id) {
    isLoading.value = false;
    return;
  }

  isLoading.value = true;

  try {
    // Llamar a ambas funciones por separado
    const [rentedHistory, rentedOutHistory] = await Promise.all([
      fetchUserRentalHistory(currentUser.value.id),   // Vehículos que yo alquilé
      fetchUserRentedOutHistory(currentUser.value.id) // Mis vehículos alquilados por otros
    ]);
    
    historyData.value = {
      rented: rentedHistory || [],
      rentedOut: rentedOutHistory || []
    };

    console.log('Historial cargado:', historyData.value);

  } catch (error) {
    console.error('Error loading rental history:', error);
    historyData.value = { rented: [], rentedOut: [] };
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadHistoryData();
});
</script>

<template>
  <template v-if="isLoading">
    <div class="flex justify-center py-10">
      <Loading class="w-8 h-8 text-primary-900" />
    </div>
  </template>
  
  <ul v-else-if="combinedHistory.length > 0" class="flex flex-col gap-5 overflow-y-auto h-full !pr-2">
    <HistoryCar 
      v-for="rent in combinedHistory" 
      :key="rent.id" 
      :car="rent.vehicleDetails || rent"
      :rent="rent"
      @click="router.push(`/rents/${rent.id}`)" />
  </ul>
  
  <template v-else>
    <div class="text-center py-10 text-background-600">
      No hay historial de alquileres disponible
    </div>
  </template>
</template>