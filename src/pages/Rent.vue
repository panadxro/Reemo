<script setup>
import { ref, inject, watch, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { addAlert } from '@/services/alerts';
import { updateRentalStatus, subscribeToRentalDetails, markRentalAsPickedUp } from '@/services/rentedCarService';
import { createRentalRequestNotification } from '@/services/car/notifyRented.js';

import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import Loading from '@icons/Loading.vue';
import UserNav from '@components/user/UserNav.vue';
import History from '@components/user/History.vue';

const route = useRoute();
const rentalId = ref(route.params.id);
const rentalDetails = ref(null);
const userRentals = ref([]);
const actionInProgress = ref(false);
const isLoading = ref(true);
const error = ref(null);

let unsubscribeRental = null;

// Inyectar los datos del padre
const loggedUser = inject('loggedUser');
const authSession = inject('authSession');

const isOwnProfile = computed(() => {
  return loggedUser.value?.id === authSession?.user?.id;
});

const cleanupSubscription = () => {
  if (unsubscribeRental) {
    unsubscribeRental();
    unsubscribeRental = null;
  }
};
async function loadUserRentals() {
  try {
    isLoading.value = true;
    const rentals = await getUserRentals(authSession.user.id);
    userRentals.value = rentals.sort((a, b) => new Date(b.start_time?.seconds || 0) - new Date(a.start_time?.seconds || 0)
    );
    // Si no hay un ID en la ruta, seleccionamos la última renta
    if (!rentalId.value && userRentals.value.length > 0) {
      rentalId.value = userRentals.value[0].id;
    }
  } catch (error) {
    console.error('Error al cargar rental del usuario:', error);
    addAlert('Error al argar historial de rentas', 'error');
  } finally {
    isLoading.value = false;
  }
}
function setupRentalSubscription() {
  cleanupSubscription();

  if(!rentalId.value) {
    console.warn('ID de alquiler no proporcionado')
    isLoading.value = false;
    return;
  }

  isLoading.value = true;
  rentalDetails.value = null;
  error.value = null;

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
    error.value = error;    
    isLoading.value = false;
  }
}

const isOwner = computed(() => rentalDetails.value?.owner_id === loggedUser.value?.id);
const isDriver = computed(() => rentalDetails.value?.driver_id === loggedUser.value?.id);

const canMarkAsPickedUp = computed(() => {
  return isOwner.value && rentalDetails.value?.status === 'confirmed';
});

const canMarkAsReturned_Driver = computed(() => {
  return isDriver.value && rentalDetails.value?.status === 'in_progress';
});

const canFinalize_Owner = computed(() => {
  return isOwner.value && rentalDetails.value?.status === 'returned_by_driver';
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

async function handleMarkAsReturned() {
  if (!canMarkAsReturned_Driver.value || !rentalDetails.value) return;
  actionInProgress.value = true;
  try {
    await updateRentalStatus(rentalId.value, 'returned_by_driver');
    // Notificar al propietario
    if (rentalDetails.value.owner_id && rentalDetails.value.driver_id) {
      await createRentalRequestNotification(
        rentalId.value,
        rentalDetails.value.driver_id,
        rentalDetails.value.owner_id,
        `El conductor ${rentalDetails.value.driverData?.name || 'el conductor'} ha marcado el vehículo ${rentalDetails.value.vehicleData?.marca || ''} ${rentalDetails.value.vehicleData?.modelo || ''} como devuelto. Por favor, confirma la devolución.`,
        'rental_update' // Tipo de notificación para actualizaciones generales del alquiler
      );
    }
    addAlert('Vehículo marcado como devuelto. El propietario debe confirmar.', 'success');
  } catch (error) {
    console.error('Error al marcar como devuelto:', error);
    addAlert('Error al marcar como devuelto.', 'error');
  } finally {
    actionInProgress.value = false;
  }
}

async function handleFinalizeRental() {
  if (!canFinalize_Owner.value || !rentalDetails.value) return;
  actionInProgress.value = true;
  try {
    await updateRentalStatus(rentalId.value, 'completed');
    // Notificar al conductor
    if (rentalDetails.value.driver_id && rentalDetails.value.owner_id) {
      await createRentalRequestNotification(
        rentalId.value,
        rentalDetails.value.owner_id,
        rentalDetails.value.driver_id,
        `El propietario ${rentalDetails.value.ownerData?.name || 'el propietario'} ha confirmado la devolución del vehículo ${rentalDetails.value.vehicleData?.marca || ''} ${rentalDetails.value.vehicleData?.modelo || ''}. El alquiler ha finalizado.`,
        'rental_completed'
      );
    }
    addAlert('Alquiler finalizado con éxito.', 'success');
  } catch (error) {
    console.error('Error al finalizar el alquiler:', error);  
    addAlert('Error al finalizar el alquiler.', 'error');
  } finally {
    actionInProgress.value = false;
  }
}

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

const showCompletedView = computed(() => {
  return rentalDetails.value?.status === 'completed';
});

const formatDate = (timestampInput) => {
  if (!timestampInput) return 'N/A';
  const date = timestampInput.seconds ? new Date(timestampInput.seconds * 1000) : new Date(timestampInput);
  return date.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
};

watch(() => route.params.id, (newId) => {
  if (newId !== rentalId.value) {
    rentalId.value = newId;
    setupRentalSubscription();
  }
})

onMounted(async () => {
  await loadUserRentals();
  setupRentalSubscription();
});

onUnmounted(() => {
  cleanupSubscription();
});

</script>

<template>

  <div v-if="isLoading && !rentalDetails" class="flex md:flex-1 xs:flex-row-reverse md:flex-row max-h-vh overflow-auto mb-20 md:mb-0">
    <Loading class="h-12 w-12 text-secondary-500" />
    <p class="mt-4">Cargando detalles del alquiler...</p>
  </div>

  <!-- bg-[#eaf7f9] -->
  <div v-else-if="rentalDetails" class="flex md:flex-1 xs:flex-row-reverse md:flex-row max-h-vh overflow-auto mb-20 md:mb-0">
    <UserNav v-if="isOwnProfile"/>
    <section class="parent m-2.5 w-full flex md:max-h-vh md:overflow-hidden gap-4">

      <div v-if="isOwnProfile" class="my-history flex flex-col gap-4">
        <div class="flex items-center gap-2">
          <BackButton />
          <Heading :type="1" class="medium">Historial</Heading>
        </div>
        <div class="bg-primary-900 flex flex-1 rounded-[40px] px-5 py-7 gap-6">
          <History :rentalDetails="rentalDetails" />
        </div>
      </div>
      <div class="lat-panel overflow-auto">
        <div>
          <span>Orden ID: <strong>#{{ rentalDetails.id.slice(0, 8) }}</strong></span>
            <span class="px-2 py-1 rounded-lg text-xs font-semibold capitalize" :class="{
                'bg-yellow-400 text-[#0D0D3C]': rentalDetails.status === 'pending' || rentalDetails.status === 'returned_by_driver',
                'bg-blue-500 text-white': rentalDetails.status === 'confirmed' || rentalDetails.status === 'in_progress',
                'bg-green-500 text-white': rentalDetails.status === 'completed',
                'bg-red-500 text-white': rentalDetails.status === 'cancelled_by_user' || rentalDetails.status === 'cancelled_by_owner' || rentalDetails.status === 'rejected' || rentalDetails.status === 'expired',
              }">{{ rentalDetails.status.replace(/_/g, ' ') }}</span>
        </div>
        <div>
            <p><strong>Desde:</strong> {{ formatDate(rentalDetails.start_time) }}</p>
            <p><strong>Hasta:</strong> {{ formatDate(rentalDetails.end_time) }}</p>
            <p><strong>Tarifa:</strong> ARS ${{ rentalDetails.total_price?.toFixed(2) || 'N/A' }}</p>
            <p><strong>Pago:</strong> Transferencia</p>
        </div>
        <div>
          <h3 class="text-[#0D0D3C] text-sm font-semibold mb-2">Datos del propietario</h3>
          <div class="flex items-center gap-2">

            <img :src="rentalDetails.ownerData?.photoURL" :alt="rentalDetails.ownerData?.name"
              class="w-12 h-12 rounded-full" />
            <div>
              <p class="font-medium">{{ rentalDetails.ownerData?.name || rentalDetails.owner_id }} {{
                rentalDetails.ownerData?.lastname}}</p>
              <p class="text-xs text-gray-500">@{{ rentalDetails.ownerData?.username}}</p>
            </div>
          </div>          
        </div>
        <div class="flex items-center gap-2 border rounded-xl p-3">
          <img :src="rentalDetails.vehicleData?.images[0]" :alt="rentalDetails.vehicleData?.marca" alt="auto"
            class="w-12 h-8 object-contain" />
          <div>
            <p class="font-semibold">{{ rentalDetails.vehicleData.marca }} {{ rentalDetails.vehicleData.modelo }}</p>
            <p class="text-sm">{{ rentalDetails.vehicleData.patente }}</p>
          </div>
        </div>
        <div v-if="showPickupMessage" class="bg-green-600 border border-green-700 text-white p-4 rounded-md text-center">
          <p class="font-semibold">¡El vehículo fue retirado!</p>
          <p>Recuerda devolverlo antes del {{ formatDate(rentalDetails.end_time) }}.</p>
        </div>
  
        <div v-if="!showCompletedView" class="pt-6 border-t border-gray-200 space-y-3">
          <button v-if="canMarkAsPickedUp" @click="handleMarkAsPickedUp" :disabled="actionInProgress"
            class="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
            <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
            Marcar como Auto Retirado
          </button>
  
          <button v-if="canMarkAsReturned_Driver" @click="handleMarkAsReturned" :disabled="actionInProgress"
            class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
            <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
            Marcar Vehículo como Devuelto
          </button>
  
          <button v-if="canFinalize_Owner" @click="handleFinalizeRental" :disabled="actionInProgress"
            class="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
            <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
            Confirmar Devolución y Finalizar
          </button>
  
          <button v-if="canCancelRental" @click="handleCancelRental" :disabled="actionInProgress"
            class="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
            <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
            Cancelar Alquiler
          </button>
        </div>
        <div v-if="!showCompletedView && isMainPanelOpen" class="main-panel flex-1 flex flex-col gap-4 relative">
          <button @click="toggleMainPanel"
            class="absolute top-4 right-4 bg-white text-[#0D0D3C] rounded-full p-2 shadow-lg hover:bg-gray-100 transition duration-150 ease-in-out">
            <span>Ocultar Detalles</span>
          </button>
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
     
           <div class="flex-1 bg-gray-200 rounded-3xl relative overflow-hidden">
             <p class="text-gray-500 text-center pt-40">[ Aca va a ir el mapa ]</p>
     
             <div
               class="absolute bottom-4 right-4 w-80 bg-[#0D0D3C] text-white rounded-2xl p-3 flex flex-col gap-2 shadow-lg">
               <div class="flex justify-between items-center">
                 <div class="flex items-center gap-2">
                   <img :src="rentalDetails.driverData?.photoURL" :alt="rentalDetails.driverData?.name" alt="avatar"
                     class="w-8 h-8 rounded-full" />
                   <p class="font-semibold">{{rentalDetails.driverData?.name}} {{rentalDetails.driverData?.lastname}}</p>
                 </div>
                 <button>📞</button>
               </div>
     
               <div class="bg-[#1B1B52] rounded-xl p-2 text-sm">¡Hola! ¿Podés ayudarme?</div>
               <div class="bg-[#2A3EF4] rounded-xl p-2 text-sm self-end">Sí, ¿Cuál es el problema?</div>
     
               <div class="flex mt-2">
                 <input type="text" class="flex-1 p-2 rounded-l-xl bg-white text-black text-sm"
                   placeholder="Escribir mensaje...">
                 <button class="bg-[#2A3EF4] px-4 rounded-r-xl">➤</button>
               </div>
             </div>
     
             <div class="absolute bottom-4 left-4 flex gap-2">
               <button class="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">🔔</button>
               <button class="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">💬</button>
             </div>
     
           </div>
         </div>
         <div v-else class="main-panel flex-1 flex flex-col justify-center p-8 ">
     
             <Heading :type="2" class="text-gray-800">📄 Resumen del Alquiler</Heading>
     
             <div class="border-b pb-4">
               <h3 class="font-semibold text-lg">🚗 Vehículo</h3>
               <p><strong>Marca / Modelo:</strong> {{ rentalDetails.vehicleData?.marca }} {{
                 rentalDetails.vehicleData?.modelo }} ({{ rentalDetails.vehicleData.año }})</p>
               <p><strong>Patente:</strong> {{ rentalDetails.vehicleData?.patente }}</p>
               <p><strong>Transmisión:</strong> {{ rentalDetails.vehicleData?.transmision }}</p>
               <p><strong>Combustible:</strong> {{ rentalDetails.vehicleData?.combustible }}</p>
               <p><strong>Extras:</strong> {{ rentalDetails.vehicleData.extras?.join(', ') || 'Ninguno' }}</p>
             </div>
     
             <div class="border-b pb-4">
               <h3 class="font-semibold text-lg">👥 Participantes</h3>
               <p><strong>Propietario:</strong> {{ rentalDetails.ownerData.name }} {{ rentalDetails.ownerData.lastname }}</p>
               <p><strong>Conductor:</strong> {{ rentalDetails.driverData.name }} {{ rentalDetails.driverData.lastname }}</p>
             </div>
     
             <div class="border-b pb-4">
               <h3 class="font-semibold text-lg">📅 Fechas</h3>
               <p><strong>Desde:</strong> {{ formatDate(rentalDetails.start_time) }}</p>
               <p><strong>Hasta:</strong> {{ formatDate(rentalDetails.end_time) }}</p>
             </div>
     
             <div class="border-b pb-4">
               <h3 class="font-semibold text-lg">📍 Ubicaciones</h3>
               <p><strong>Retiro:</strong> {{ rentalDetails.vehicleData.direccion }}</p>
               <p><strong>Devolución:</strong> {{ rentalDetails.vehicleData.direccion }}</p>
             </div>
     
             <div class="border-b pb-4">
               <h3 class="font-semibold text-lg">💳 Pago</h3>
               <p><strong>Método:</strong> {{ rentalDetails.payments.payment_method }}</p>
               <p><strong>ID Transacción:</strong> {{ rentalDetails.payments.transaction_id }}</p>
               <p><strong>Estado:</strong> {{ rentalDetails.payments.status }}</p>
               <p><strong>Total pagado:</strong> ARS ${{ rentalDetails.total_price?.toFixed(2) }}</p>
             </div>
     
             <div>
               <h3 class="font-semibold text-lg">📌 Estado Final</h3>
               <p><strong>Estado:</strong> {{ rentalDetails.status }}</p>
               <p v-if="rentalDetails.notes"><strong>Notas:</strong> {{ rentalDetails.notes }}</p>
             </div>
            </div>
      </div>
    </section>
  </div>

</template>

<style scoped>
@media (width < 768px) {
  .parent {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .profile { order: 1; }
    .main-panel { order: 2; }
    .lat-panel {
      width: 320px;
      height: calc(100vh - 40px);
      overflow-y: auto;
    }
    
    .main-panel {
      height: calc(100vh - 40px);
    }
  }
}

@media (max-width: 768px) {
  .main-panel {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: white;
    z-index: 100;
    padding: 1rem;
    height: 100vh;
  }
  
  .lat-panel {
    width: 100%;
    height: auto;
  }
}
</style>