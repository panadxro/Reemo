<script setup>
import { ref, onMounted, computed, inject } from 'vue';
import { useRouter } from 'vue-router';
import { addAlert } from "@services/alerts.js";
import { fetchUserRentalHistory, fetchUserRentedOutHistory } from '@/services/rentedCarService';

import Loading from '@/icons/Loading.vue';
import HistoryCar from '@/components/organisms/rents/HistoryCar.vue';
import Input from '@/components/molecules/Input.vue';
import NoRent from '@/components/atoms/NoRent.vue';

const props = defineProps({
  showOnly: {
    type: String,
    default: 'all' // 'all', 'rented', 'rented-out'
  }
});

const router = useRouter();
const authStore = inject('authStore');

const isLoading = ref(true);
const historyData = ref({
  rented: [],    // Vehículos que yo alquilé (como conductor)
  rentedOut: []  // Vehículos míos alquilados por otros
});

const currentUser = computed(() => authStore.user);
const isUserVerified = computed(() => currentUser.value?.status === 'verified');

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

const handleButtonClick = () => {
  if (isUserVerified.value) {
    router.push('/search');
  } else {
    addAlert("Aguardá la validación del perfil para alquilar autos", "warning");
  }
};

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
  
  <ul v-else-if="combinedHistory.length > 0" class="box-deep flex flex-col gap-5 overflow-y-auto h-full !pr-2">
    <HistoryCar 
      v-for="(rent, index) in combinedHistory" 
      :key="rent.id" 
      :rent="rent"
      :index="index"
   />
  </ul>
  
    <div v-else class="flex flex-col items-center justify-center h-full gap-5">
      <NoRent class="max-w-[90px]"/>
      <p class="font-semibold text-white text-center">No tenés alquileres registrados</p>
      <Input
        class="max-w-fit mx-auto"
        type="button"
        text="Alquilar un auto"
        variant="secondary"
        :outline="false"
        @click="handleButtonClick"/>
    </div>
            <!-- :disabled="!isUserVerified" -->
</template>