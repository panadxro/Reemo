<script setup>
import { useRentStore, useAuthStore } from '@stores';
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { addAlert } from "@services/alerts.js";

import History from '@/components/user/History.vue';
import Heading from '@components/atoms/Heading.vue';
import BackButton from '@components/atoms/BackButton.vue';
import HistoryCar from '@components/organisms/rents/HistoryCar.vue';
import ViewRent from '../components/organisms/rents/ViewRent.vue';
import Loading from '@icons/Loading.vue';
import Input from '@components/molecules/Input.vue';
import VerifyValidation from '@components/user/VerifyValidation.vue';
import NoRent from '@components/atoms/NoRent.vue';

const rentStore = useRentStore();
const authStore = useAuthStore();
const router = useRouter();

const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);
const userRents = computed(() => rentStore.userRents);
const currentUser = computed(() => authStore.user);
const isUserVerified = computed(() => currentUser.value?.status === 'verified');
const isLoading = ref(false);

const selectedRent = ref(null);

const handleRentClick = (rent) => {
  selectedRent.value = rent;
};

const goToSearch = () => {
  if (isUserVerified.value) {
    router.push('/search');
  } else {
    addAlert("Aguardá la validación del perfil para alquilar autos", "warning");
  }
};

onMounted(async () => {
  try {
    isLoading.value = true;
    await rentStore.loadUserRents(authSession.user?.id);

    if (rentStore.userRents.length > 0) {
      selectedRent.value = rentStore.userRents[0];
    }
  } catch (error) {
    console.error('Error cargando rentas:', error);
  } finally {
    isLoading.value = false;
  }
});
</script>

<template>
  <section class="md:m-2.5 w-full md:max-h-vh md:overflow-hidden flex gap-5">
  <div class="flex flex-col gap-4 w-full" 
    :class="userRents?.length > 0 ? 'md:w-auto' : ''">
    <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
      <BackButton />
      <Heading :type="1" class="medium">Historial</Heading>
    </div>
    <div 
      class="md:p-5 md:rounded-[40px] flex flex-col gap-4 w-full h-full overflow-hidden" 
      :class="userRents?.length > 0 ? 'md:bg-deep-blue-900 md:w-85' : 'bg-white items-center justify-center'">
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

      <template v-else>
        <NoRent/>
        <Heading :type="3" class="text-gray-500 mb-2 mt-4">
          No tenés alquileres registrados
        </Heading>
      </template>
      <div class="flex flex-col items-center justify-end flex-grow-0 gap-4 w-full">
        <VerifyValidation
          v-if="!isUserVerified"
          title="Verificación requerida"
          message="Para alquilar un vehículo, primero debés verificar tu cuenta"
          type="brightYellow"
          class="mb-4 w-full max-w-md"
        />
        
        <Input
          type="button"
          text="Alquilar un auto"
          variant="primary"
          class="w-full max-w-md"
          @click="goToSearch"
          :disabled="!isUserVerified"
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