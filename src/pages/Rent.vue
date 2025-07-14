<script setup>
import { useRentStore } from '@stores';
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';

import History from '@/components/user/History.vue';
import Heading from '@components/atoms/Heading.vue';
import BackButton from '@components/atoms/BackButton.vue';
import HistoryCar from '@components/organisms/rents/HistoryCar.vue';
import ViewRent from '../components/organisms/rents/ViewRent.vue';
import Loading from '@icons/Loading.vue';
import Input from '@components/molecules/Input.vue';

const rentStore = useRentStore();
const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);
const userRents = computed(() => rentStore.userRents);

const selectedRent = ref(null);
const router = useRouter();

const handleRentClick = (rent) => {
  selectedRent.value = rent;
}

const goToSearch = () => {
      router.push('/search');
    };

onMounted(async () => {
  try {
    await rentStore.loadUserRents(authSession.user?.id);

    if (rentStore.userRents.length > 0) {
      selectedRent.value = rentStore.userRents[0];
    }
  } catch (error) {
    console.error('Error cargando rentas:', error);
  }
})
</script>

<template>
  <section class="md:m-2.5 w-full md:max-h-vh md:overflow-hidden flex gap-5">
  <div class="flex flex-col gap-4 w-full md:w-auto">
    <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
      <BackButton />
      <Heading :type="1" class="medium">Historial</Heading>
    </div>
    <div class="md:p-5 md:rounded-[40px] flex flex-col gap-4 w-full md:w-85 h-full overflow-hidden" :class="userRents?.length > 0 ? 'md:bg-deep-blue-900' : 'bg-white'">
      <ul 
        v-if="userRents?.length > 0"
        class="box-deep h-full flex flex-col gap-4 overflow-y-auto !pr-1 w-full"
      >
        <HistoryCar 
          v-for="(rent, index) in userRents" 
          :key="rent.id" 
          :rent="rent" 
          :index="index"
          :isSelected="selectedRent?.id === rent.id"
          @click="handleRentClick(rent)"
        />
      </ul>
      
      <div 
        v-else
        class="flex flex-col gap-4 items-center justify-center h-full py-10 text-center"
      >
        <img src="@/assets/car-history.png" alt="No hay alquileres" class="w-80 mb-4 opacity-70"
        />
        <Heading :type="3" class="text-gray-500 mb-2">
          No tenés alquileres registrados
        </Heading>
        
        <Input
          type="button"
          text="Ver vehículos disponibles"
          variant="primary"
          @click="goToSearch"
          class="max-w-[250px]"
          />

      </div>
    </div>
  </div>
  
  <ViewRent 
    v-if="selectedRent"
    :rentId="selectedRent.id"
    class="hidden md:flex"
  />
</section>
</template>