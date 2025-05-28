<script setup>

import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@stores';
import { addAlert } from '@/services/alerts';
import { updateRentalStatus, subscribeToRentalDetails, markRentalAsPickedUp } from '@/services/rentedCarService';

import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import Loading from '@icons/Loading.vue';

const route = useRoute();
const rentalId = ref(route.params.id);
const authStore = useAuthStore();

const rentalDetails = ref(null);
const actionInProgress = ref(false);
const isLoading = ref(true);
const error = ref(null);

const loggedUser = computed(() => authStore.user);
let unsubscribeRental = null;


function setupRentalSubscription() {
  if(!rentalId.value) {
    console.warn('ID de alquiler no proporcionado')
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  try {
      unsubscribeRental = subscribeToRentalDetails(rentalId.value, (data, err) =>{
    if(err){
      error.value = err;
      rentalDetails.value = null;
    } else{
      rentalDetails.value = data;
      error.value = null; // Limpiar error si los datos se cargan correctamente
    }
    isLoading.value = false;
  });
  } catch (error) {
    console.error('No se puede cargar los detalles de alquiler', error);
    isLoading.value = false;
    throw error;
  }
}

const isOwner = computed(() => rentalDetails.value?.owner_id === loggedUser.value?.id);
const isDriver = computed(() => rentalDetails.value?.driver_id === loggedUser.value?.id);

const canMarkAsPickedUp = computed(() => {
  return isOwner.value && rentalDetails.value?.status === 'confirmed';
});

async function handleMarkAsPickedUp() {
  if(!canMarkAsPickedUp.value || !rentalDetails.value) return;
  actionInProgress.value = true;
  try {
    await markRentalAsPickedUp(rentalId.value);
    addAlert('Vehículo marcado como retirado.', 'success');
  } catch (error) {
    console.error("Error al marcar como retirado:", error);
  } finally {
    actionInProgress.value = false;
  }
}

const showPickupMessage = computed(() => {
  return rentalDetails.value?.status === 'in_progress';
});

const canCancelRental = computed(() => {
  if (!rentalDetails.value || !loggedUser.value) return false;
  const status = rentalDetails.value.status;
  // Permitir cancelación si está confirmado Y AÚN NO HA SIDO RETIRADO
  if (status === 'confirmed') {
    return isOwner.value || isDriver.value; // O la lógica que prefieras para quién puede cancelar
  }
  return false; // No se puede cancelar si está 'pending', 'in_progress', 'completed', etc. desde esta vista.
});

async function handleCancelRental() {
  if (!canCancelRental.value || !rentalDetails.value) return;
  actionInProgress.value = true;
  try {
    const newStatus = isOwner.value ? 'cancelled_by_owner' : 'cancelled_by_user';
    await updateRentalStatus(rentalId.value, newStatus); // Usamos el servicio existente
    addAlert('Alquiler cancelado con éxito.', 'success');
    // El `onSnapshot` listener actualizará `rentalDetails.value` automáticamente.
  } catch (err) {
    console.error("Error al cancelar el alquiler:", err);
    addAlert('Error al cancelar el alquiler.', 'error');
  } finally {
    actionInProgress.value = false;
  }
}

const formatDate = (timestampInput) => {
  if (!timestampInput) return 'N/A';
  const date = timestampInput.seconds ? new Date(timestampInput.seconds * 1000) : new Date(timestampInput);
  return date.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
};

onMounted(setupRentalSubscription);

onUnmounted(() => {
  if (unsubscribeRental) {
    unsubscribeRental();
  }
});

</script>

<template>

  <div v-if="isLoading && !rentalDetails" class="flex flex-col items-center justify-center py-10">
    <Loading class="h-12 w-12 text-secondary-500" />
    <p class="mt-4">Cargando detalles del alquiler...</p>
  </div>
  
  <!-- bg-[#eaf7f9] -->
  <div v-else-if="rentalDetails" class="min-h-screen flex p-4 gap-4">
    
    <!-- Panel lateral -->
    <div class="w-80 bg-white rounded-3xl p-4 shadow-md flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <BackButton />
        <Heading :type="1" class="medium">Detalles del Alquiler</Heading>
      </div>

      <div class="bg-[#0D0D3C] text-white rounded-2xl p-4 flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span>Orden ID: <strong>#{{ rentalDetails.id.slice(0, 8) }}</strong></span>
          <span class="bg-yellow-400 text-[#0D0D3C] px-2 py-1 rounded-lg text-xs">{{ rentalDetails.status.replace('_', ' ') }}</span>
        </div>
        <div class="border-t border-white/20 my-2"></div>
        <div class="text-sm flex flex-col gap-1">
          <div><strong>Desde:</strong> {{ formatDate(rentalDetails.start_time) }}</div>
          <div><strong>Hasta:</strong> {{ formatDate(rentalDetails.end_time) }}</div>
          <div><strong>Tarifa:</strong> ARS ${{ rentalDetails.total_price?.toFixed(2) || 'N/A' }}</div>
          <div><strong>Pago:</strong> Transferencia</div>
        </div>
      </div>

      <div class="bg-white rounded-2xl p-4 flex flex-col gap-2">
        <h3 class="text-[#0D0D3C] text-sm font-semibold mb-2">Datos del propietario</h3>
        <div class="flex items-center gap-2">
          <!-- <img src="https://i.pravatar.cc/100" alt="owner" class="w-12 h-12 rounded-full" /> -->
          <img :src="rentalDetails.ownerData?.photoURL" :alt="rentalDetails.ownerData?.name" class="w-12 h-12 rounded-full" />
          <div>
            <p class="font-medium">{{ rentalDetails.ownerData?.name || rentalDetails.owner_id }} {{ rentalDetails.ownerData?.lastname}}</p>
            <p class="text-xs text-gray-500">@{{ rentalDetails.ownerData?.username}}</p>
            <!-- <p class="text-xs text-gray-500">Propietario</p> -->
          </div>
        </div>
      </div>

      <div class="flex items-center gap-2 border rounded-xl p-3">
        <img :src="rentalDetails.vehicleData?.images[0]" :alt="rentalDetails.vehicleData?.marca" alt="auto" class="w-12 h-8 object-contain" />
        <div>
          <p class="font-semibold">{{ rentalDetails.vehicleData.marca }} {{ rentalDetails.vehicleData.modelo }}</p>
          <p class="text-sm">{{ rentalDetails.vehicleData.patente }}</p>
        </div>
      </div>

      <!-- Mensaje de vehículo retirado -->
      <div v-if="showPickupMessage" class="bg-green-600 border border-green-700 text-white p-4 rounded-md text-center">
        <p class="font-semibold">¡El vehículo fue retirado!</p>
        <p>Recuerda devolverlo antes del {{ formatDate(rentalDetails.end_time) }}.</p>
      </div>

       <!-- Acciones -->
      <div class="pt-6 border-t border-primary-700 space-y-4">
        <button
          v-if="canMarkAsPickedUp"
          @click="handleMarkAsPickedUp"
          :disabled="actionInProgress"
          class="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center"
        >
          <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
          Marcar como Auto Retirado
        </button>

        <button
          v-if="canCancelRental"
          @click="handleCancelRental"
          :disabled="actionInProgress"
          class="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center"
        >
          <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
          Cancelar Alquiler
        </button>
      </div>

    </div>

    <!-- Panel principal -->
    <div class="flex-1 flex flex-col gap-4 relative">

      <!-- Datos del viaje -->
      <div class="grid grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-md">
          <span class="text-sm font-medium text-gray-500">Ubicación</span>
          <span class="text-[#0D0D3C] font-semibold">{{ rentalDetails.vehicleData.direccion }}</span>
        </div>
        <div class="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-md">
          <span class="text-sm font-medium text-gray-500">Velocidad</span>
          <span class="text-[#0D0D3C] font-semibold">60 km/h</span>
        </div>
        <div class="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-md">
          <span class="text-sm font-medium text-gray-500">Distancia</span>
          <span class="text-[#0D0D3C] font-semibold">0.542 km</span>
        </div>
        <div class="bg-white rounded-2xl p-4 flex flex-col gap-1 shadow-md">
          <span class="text-sm font-medium text-gray-500">Última parada</span>
          <span class="text-[#0D0D3C] font-semibold">Hace 2hs</span>
        </div>
      </div>

      <!-- Mapa (placeholder) -->
      <div class="flex-1 bg-gray-200 rounded-3xl relative overflow-hidden">
        <p class="text-gray-500 text-center pt-40">[ Aca va a ir el mapa ]</p>

        <!-- Chat flotante -->
        <div class="absolute bottom-4 right-4 w-80 bg-[#0D0D3C] text-white rounded-2xl p-3 flex flex-col gap-2 shadow-lg">
          <div class="flex justify-between items-center">
            <div class="flex items-center gap-2">
              <img :src="rentalDetails.driverData?.photoURL" :alt="rentalDetails.driverData?.name" alt="avatar" class="w-8 h-8 rounded-full" />
              <p class="font-semibold">{{rentalDetails.driverData?.name}} {{rentalDetails.driverData?.lastname}}</p>
            </div>
            <button>📞</button>
          </div>

          <div class="bg-[#1B1B52] rounded-xl p-2 text-sm">¡Hola! ¿Podés ayudarme?</div>
          <div class="bg-[#2A3EF4] rounded-xl p-2 text-sm self-end">Sí, ¿Cuál es el problema?</div>

          <div class="flex mt-2">
            <input type="text" class="flex-1 p-2 rounded-l-xl bg-white text-black text-sm" placeholder="Escribir mensaje...">
            <button class="bg-[#2A3EF4] px-4 rounded-r-xl">➤</button>
          </div>
        </div>

        <!-- Botones flotantes -->
        <div class="absolute bottom-4 left-4 flex gap-2">
          <button class="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">🔔</button>
          <button class="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">💬</button>
        </div>

      </div>

    </div>

  </div>

</template>
