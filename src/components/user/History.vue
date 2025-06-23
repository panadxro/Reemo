<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores';
import Loading from '@/icons/Loading.vue';

import { fetchUserRentalHistory } from '@/services/rentedCarService';

// const router = useRouter();
const authStore = useAuthStore();

const isLoading = ref(true);
const historyDetails = ref([]);

const currentUser = computed(() => authStore.user);


const loadHistoryData = async () => {
  console.log('[History] loadHistoryData llamado.');
  if (!currentUser.value || !currentUser.value.id) {
    console.warn('[History] Usuario no encontrado o sin ID. currentUser:', currentUser.value);
    // driverRentalDetail.value = null;
    // ownerRentalDetail.value = null;
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  // driverRentalDetail.value = null;
  // ownerRentalDetail.value = null;

  try {
    const userId = currentUser.value.id;
    console.log('[History] id de currentUser:', userId);

    const history = await fetchUserRentalHistory(userId);
    historyDetails.value = history;

    console.log('[History] resultado de los alquileres: ', JSON.parse(JSON.stringify(historyDetails.value)));

    // Cargar ambos conjuntos de datos en paralelo
    // const [driverRentals, ownerRental] = await Promise.all([
    //   fetchRentedCars(userId), 
    //   fetchLatestActiveOwnedRental(userId)
    // ]);

    // driverRentalDetail.value = driverRentals && driverRentals.length > 0 ? driverRentals[0] : null;
    // ownerRentalDetail.value = ownerRental;

    // console.log('[History] fetchRentedCars (driver) completado. Resultado:', JSON.parse(JSON.stringify(driverRentalDetail.value)));
    // console.log('[History] fetchLatestActiveOwnedRental (owner) completado. Resultado:', JSON.parse(JSON.stringify(ownerRentalDetail.value)));
  } catch (error) {
    console.error('[History.vue] Error al cargar solicitudes de alquiler: ', error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() =>{
  loadHistoryData();
})

// watch(currentUser, () =>{

// })


</script>

<template>

  <div class="space-y-4">
    <!-- <div v-for="car in historyDetails.slice(0, 4)"  -->
    <div v-for="car in historyDetails" 
      :key="car.id" 
      class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4" 
      @click="$router.push(`/rental-details/${car.id}`)">
      <div class="flex gap-6">
        <div class="relative flex-shrink-0">
          <img :src="car.vehicleDetails.photos?.[0] || '@/assets/car-placeholder.png'" 
            :alt="car.vehicleDetails.basicInfo.brand + ' ' + car.vehicleDetails.basicInfo.model" 
            class="object-cover rounded-xl w-32 h-28 sm:w-36 sm:h-32" />
        </div>

        <div class="flex-1 space-y-2">
          <div class="flex justify-between items-start">
            <h3 class="font-bold text-primary-900 leading-tight text-lg">
              {{ car.vehicleDetails.basicInfo.brand }} {{ car.vehicleDetails.basicInfo.model }}
            </h3>
            <span class="text-primary-800 font-bold flex-shrink-0 ml-2 text-sm">
              <!-- ${{ car.vehicleDetails.precio }}/día -->
            </span>
          </div>

          <p class="text-background-600 text-sm">
            {{ car.vehicleDetails.basicInfo.year }} • {{ car.vehicleDetails.specifications.fuelType }} • {{ car.vehicleDetails.specifications.transmission }}
          </p>

          <!-- Cambiar info como queiran -->
          <div class="flex gap-2 flex-wrap">
            <span class="bg-vibrant-light-600 text-primary-900 px-2 py-1 rounded-lg text-xs">
              <!-- {{ car.status }} -->
            </span>
          </div>



        </div>
      </div>
    </div>

    <!-- <router-link v-if="isOwnProfile" to="/car/register"
      class="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium">
      <Plus class="w-4 h-4" />
      Registrar auto
    </router-link> -->
  </div>

</template>