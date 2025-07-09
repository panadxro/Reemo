<script setup>
import { useRentStore } from '@stores';
import { onMounted, computed, ref } from 'vue';

import History from '@/components/user/History.vue';
import Heading from '@components/atoms/Heading.vue';
import BackButton from '@components/atoms/BackButton.vue';
import HistoryCar from '@components/organisms/rents/HistoryCar.vue';
import ViewRent from '../components/organisms/rents/ViewRent.vue';
import Loading from '@icons/Loading.vue';

const rentStore = useRentStore();
const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);
const userRents = computed(() => rentStore.userRents);

const selectedRent = ref(null);

const handleRentClick = (rent) => {
  selectedRent.value = rent;
}

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
  <!-- <History /> -->
  <section class="md:m-2.5 w-full md:max-h-vh md:overflow-hidden flex gap-5">
    <div class="flex flex-col gap-4 w-full md:w-auto">
      <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
        <BackButton />
        <Heading :type="1" class="medium">Historial</Heading>
      </div>
      <div class="md:p-5 md:rounded-[40px] md:bg-deep-blue-900 flex flex-col gap-4 w-full md:w-85 h-full overflow-hidden">
        <ul class="h-full flex flex-col gap-4 overflow-y-auto !pr-2 w-full">
          <HistoryCar 
            v-if="userRents"
            v-for="(rent, index) in userRents" 
            :key="rent.id" 
            :rent="rent" 
            :index="index"
            @click="handleRentClick(rent)"
          />
        </ul>
      </div>
    </div>
    <ViewRent 
      v-if="selectedRent"
      :rentId="selectedRent.id"
      class="hidden md:flex"
    />
    <div v-else>
     <div class="hidden md:flex items-center">
        <Loading role="status" class="h-6 w-6" />
      </div>
    </div>
  </section>
</template>