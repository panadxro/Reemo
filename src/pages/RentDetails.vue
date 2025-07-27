<script setup>

import { ref, onMounted, onUnmounted, computed, watch, nextTick  } from 'vue'; 
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@stores';
import { addAlert } from '@/services/alerts';
import { updateRentalStatus, subscribeToRentalDetails, markRentalAsPickedUp } from '@/services/rentedCarService';
import { createRentalRequestNotification } from '@/services/car/notifyRented.js';
import { loadGoogleMaps, initMap } from '@/services/google-maps'; 

import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import Loading from '@icons/Loading.vue';
import Status from '@components/molecules/Status.vue';
import Modal from '@components/molecules/Modal.vue';
import Velocimetre from '@icons/Velocimetre.vue';
import Ubication from '@icons/Ubication.vue';
import Distance from '@icons/Distance.vue';
import Input from '@components/molecules/Input.vue'
import Send from '@icons/Send.vue';

const route = useRoute();
const router = useRouter();
const map = ref(null);
const mapInitialized = ref(false);
const rentalId = ref(route.params.id);
const authStore = useAuthStore();
const rentalDetails = ref(null);
const actionInProgress = ref(false);
const isLoading = ref(true);
const error = ref(null);
const showCancelModal = ref(false);


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

async function confirmCancelRental() {
  if (!canCancelRental.value || !rentalDetails.value) return;
  actionInProgress.value = true;
  try {
    const newStatus = isOwner.value ? 'cancelled_by_owner' : 'cancelled_by_user';
    await updateRentalStatus(rentalId.value, newStatus);
    addAlert('Alquiler cancelado con éxito.', 'success');
    showCancelModal.value = false;
  } catch (err) {
    console.error("Error al cancelar el alquiler:", err);
    addAlert('Error al cancelar el alquiler.', 'error');
  } finally {
    actionInProgress.value = false;
  }
}

async function initializeMap(details) {
  // Cambiar las coordenadas por la nueva coleccion de "cars"
  if (details && details.vehicleData?.status.currentLocation.location && !mapInitialized.value){
    try {
      console.log('[RentDetails] Intentando iniciar el mapa');
      await loadGoogleMaps();
      const mapInstance = await initMap('map');
      if (mapInstance) {
        map.value = mapInstance;
        const vehicleCoords = details.vehicleData?.status.currentLocation.location;
        if (typeof vehicleCoords.lat === 'number' && typeof vehicleCoords.lng === 'number') {
          map.value.setCenter(vehicleCoords);
          map.value.setZoom(15);
          const { Marker } = await google.maps.importLibrary("marker");
          new Marker({ position: vehicleCoords, map: map.value, title: `${details.vehicleData?.basicInfo.brand} ${details.vehicleData?.basicInfo.model}` });
          mapInitialized.value = true;
        } else {
          console.warn('[RentDetails]: Coordenadas del vehículo no disponibles o inválidas para centrar el mapa.');
        }
      }
    } catch (error) {
      console.error('[RentalDetailsView]: Error al inicializar el mapa:', error);
    }
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

// Computada para verificar en que paso estamos y poder informar a los usuarios
// Hay 5 tipos de pasos: action-needed detecta cuando vos mismo trenes que hacer una acción (marcar como entregado por ejemplo),
// waiting(en caso de que el otro usuario tenga que hacer alguna accion, vos vas a ver waiting), info(se usa uno sool y es cuando tenes el auto para manejsr), 
// success (cuando se completo el alquiler y ambos marcaron como devuelto), cancelled (cuando fue canvcelada por cualquiera de los dos usurios o rechazada)
const nextStepInfo = computed(() => {
  if (!rentalDetails.value) return null;
  
  const status = rentalDetails.value.status;
  const ownerName = rentalDetails.value.ownerData?.name || 'el propietario';
  const driverName = rentalDetails.value.driverData?.name || 'el conductor';
  
  switch (status) {
    case 'pending':
      if (isDriver.value) {
        return {
          message: `Esperando que ${ownerName} confirme tu solicitud de alquiler`,
          type: 'waiting',
          icon: '⏳'
        };
      } else if (isOwner.value) {
        return {
          message: 'Tenés una solicitud de alquiler pendiente por revisar',
          type: 'action-needed',
          icon: '🔔'
        };
      }
      break;
      
    case 'confirmed':
      if (isDriver.value) {
        return {
          message: `Esperando que ${ownerName} marque el auto como retirado`,
          type: 'waiting',
          icon: '⏳'
        };
      } else if (isOwner.value) {
        return {
          message: 'Cuando entregues el vehículo, marcalo como retirado',
          type: 'action-needed',
          icon: '🚗'
        };
      }
      break;
      
    case 'in_progress':
      if (isDriver.value) {
        return {
          message: 'Disfrutá tu viaje. Recordá devolver el vehículo a tiempo',
          type: 'info',
          icon: '🚙'
        };
      } else if (isOwner.value) {
        return {
          message: `${driverName} tiene el vehículo. Esperando la devolución`,
          type: 'waiting',
          icon: '⏰'
        };
      }
      break;
      
    case 'returned_by_driver':
      if (isDriver.value) {
        return {
          message: `Esperando que ${ownerName} confirme la devolución del vehículo`,
          type: 'waiting',
          icon: '⏳'
        };
      } else if (isOwner.value) {
        return {
          message: 'Revisá el estado del vehículo y confirmá la devolución',
          type: 'action-needed',
          icon: '✅'
        };
      }
      break;
      
    case 'completed':
      return {
        message: '¡Alquiler completado exitosamente!',
        type: 'success',
        icon: '🎉'
      };
      
    case 'cancelled_by_owner':
      return {
        message: `El alquiler fue cancelado por ${ownerName}`,
        type: 'cancelled',
        icon: '❌'
      };
      
    case 'cancelled_by_user':
      return {
        message: `El alquiler fue cancelado por ${driverName}`,
        type: 'cancelled',
        icon: '❌'
      };
      
    case 'rejected':
      return {
        message: 'La solicitud de alquiler fue rechazada',
        type: 'cancelled',
        icon: '❌'
      };
      
    default:
      return null;
  }
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

// async function handleCancelRental() {
//   if (!canCancelRental.value || !rentalDetails.value) return;
//   actionInProgress.value = true;
//   try {
//     const newStatus = isOwner.value ? 'cancelled_by_owner' : 'cancelled_by_user';
//     await updateRentalStatus(rentalId.value, newStatus); // Usamos el servicio existente
//     addAlert('Alquiler cancelado con éxito.', 'success');
//     // El `onSnapshot` listener actualizará `rentalDetails.value` automáticamente.
//   } catch (err) {
//     console.error("Error al cancelar el alquiler:", err);
//     addAlert('Error al cancelar el alquiler.', 'error');
//   } finally {
//     actionInProgress.value = false;
//   }
// }

function openCancelModal() {
  showCancelModal.value = true;
}

const showCompletedView = computed(() => {
  return rentalDetails.value?.status === 'completed';
});

const formatDate = (timestampInput) => {
  if (!timestampInput) return 'N/A';
  const date = timestampInput.seconds ? new Date(timestampInput.seconds * 1000) : new Date(timestampInput);
  return date.toLocaleString('es-AR', { dateStyle: 'medium', timeStyle: 'short' });
};

watch(rentalDetails, async (newDetails) => {
  if (newDetails && !showCompletedView.value) { // Solo intentar inicializar si hay detalles y no estamos en la vista completada
    // Esperar a que el DOM se actualice si es necesario, especialmente si el div del mapa depende de `v-if`
    await nextTick();
    const mapDiv = document.getElementById('map');
    if (mapDiv) { // Verificar que el div exista en el DOM
      await initializeMap(newDetails);
    }
  }
}, { immediate: true, deep: true });

onUnmounted(() => {
  if (unsubscribeRental) {
    unsubscribeRental();
  }
});

onMounted(() => {
  setupRentalSubscription();
});
</script>

<template>
  <div v-if="isLoading" class="flex flex-col items-center justify-center py-10 w-full">
    <Loading class="h-12 w-12 text-secondary-500" />
  </div>

  <div v-else-if="rentalDetails" class="flex flex-col lg:flex-row md:m-2.5 py-4 lg:py-6 md:px-2 sm:px-4 gap-4 w-full md:bg-vibrant-light-600 rounded-xl lg:rounded-3xl min-h-screen lg:min-h-auto overflow-y-auto ">

    <div class="box-vibrant w-full md:w-3/7 flex flex-col gap-4 overflow-visible lg:overflow-hidden lg:overflow-y-auto md:pr-2 order-1 lg:order-1">
      
      <div class="flex items-center gap-5 fixed top-0 left-0 right-0 z-10 bg-white md:bg-vibrant-light-600 px-2.5 md:px-0 py-3 md:py-0 md:sticky">
        <BackButton />
        <Heading :type="1" class="medium text-lg sm:text-xl lg:text-2xl">Detalles del alquiler</Heading>
      </div>

      <div class="bg-deep-blue-900 text-white rounded-xl lg:rounded-2xl p-3 sm:p-4 flex flex-col gap-2">
        <div class="flex flex-row justify-between items-center gap-2">
          <span class="text-sm sm:text-base">Orden ID: <strong>#{{ rentalDetails.id.slice(0, 8) }}</strong></span>
          <Status :status="rentalDetails.status"/>
        </div>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-white">
          <div>
            <p class="text-xs sm:text-sm">Desde:</p> 
            <p class="text-sm sm:text-base">{{ formatDate(rentalDetails.start_time) }}</p>
          </div>
          <div>
            <p class="text-xs sm:text-sm">Hasta:</p> 
            <p class="text-sm sm:text-base">{{ formatDate(rentalDetails.end_time) }}</p>
          </div>
          <div>
            <p class="text-xs sm:text-sm">Tarifa:</p> 
            <p class="text-sm sm:text-base">${{ rentalDetails.total_price?.toFixed() || 'N/A' }}</p>
          </div>
          <div>
            <p class="text-xs sm:text-sm">Método de pago:</p> 
            <p class="text-sm sm:text-base">Transferencia</p>
          </div>
        </div>
      </div>

      <div v-if="nextStepInfo && !showCompletedView" 
           class="p-3 sm:p-4 rounded-xl lg:rounded-2xl border-2 transition-all duration-300"
           :class="{
             'bg-blue-50 border-blue-300': nextStepInfo.type === 'waiting',
             'bg-orange-50 border-orange-300': nextStepInfo.type === 'action-needed',
             'bg-green-50 border-green-300': nextStepInfo.type === 'info',
             'bg-emerald-50 border-emerald-300': nextStepInfo.type === 'success',
             'bg-red-50 border-red-300': nextStepInfo.type === 'cancelled'
           }">
        <div class="flex items-start gap-3">
          <span class="text-xl sm:text-2xl">{{ nextStepInfo.icon }}</span>
          <div>
            <h3 class="font-semibold text-gray-800 mb-1 text-sm sm:text-base">Próximo paso</h3>
            <p class="text-gray-700 text-xs sm:text-sm leading-relaxed">{{ nextStepInfo.message }}</p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-2" v-if="rentalDetails.driver_id === loggedUser?.id">
        <div class="flex flex-col sm:justify-between gap-2">
          <Heading :type="2" class="medium text-primary-900 text-base sm:text-lg">Datos del propietario</Heading>
          <Input
            v-if="rentalDetails.owner_id !== loggedUser?.id"
            type="button"
            text="Chatear con el propietario"
            variant="primary"
            :outline="false"
            @click="router.push(`/user/${rentalDetails.owner_id}/chat`)"
            icon-position="right"
          >
          <template #icon>
            <Send color="#FFFFFF"/>
          </template>
          </Input>
        </div>
        
        <router-link :to="`/user/${rentalDetails.owner_id}`" class="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-4">
          <img :src="rentalDetails.ownerData?.photoURL" :alt="rentalDetails.ownerData?.name"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-primary-900 text-sm sm:text-base truncate">
              {{ rentalDetails.ownerData?.name }} {{ rentalDetails.ownerData?.lastname }}
            </p>
            <p class="text-sm text-gray-500 truncate">@{{ rentalDetails.ownerData?.username}}</p>
          </div>
        </router-link>
      </div>

      <div class="sm:p-4 flex flex-col gap-2" v-else-if="rentalDetails.owner_id === loggedUser?.id">
        <div class="flex flex-col sm:justify-between gap-2">
          <Heading :type="2" class="medium text-primary-900 text-base sm:text-lg">Datos del conductor</Heading>
          <Input
            type="button"
            text="Chatear con el conductor"
            variant="primary"
            :outline="false"
            @click="router.push(`/user/${rentalDetails.driver_id}/chat`)"
            icon-position="right"
          >
          <template #icon>
            <Send color="#FFFFFF"/>
          </template>
          </Input>
        </div>
        
        <router-link :to="`/user/${rentalDetails.driver_id}`" class="flex items-center gap-3 sm:gap-4 mt-2 sm:mt-4">
          <img :src="rentalDetails.driverData?.photoURL" :alt="rentalDetails.driverData?.name"
            class="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="font-medium text-primary-900 text-sm sm:text-base truncate">
              {{ rentalDetails.driverData?.name }} {{ rentalDetails.driverData?.lastname }}
            </p>
            <p class="text-sm text-gray-500 truncate">@{{ rentalDetails.driverData?.username}}</p>
          </div>
        </router-link>
      </div>

      <router-link :to="`/car/${rentalDetails.vehicleData?.id}`" 
        class="flex items-center gap-2 sm:gap-3 bg-white rounded-xl justify-between p-3 sm:p-4 hover:shadow-md transition-shadow">
        <div class="flex gap-2 sm:gap-3 min-w-0 flex-1">
          <img :src="rentalDetails.vehicleData?.photos[0]" :alt="rentalDetails.vehicleData?.basicInfo.brand"
            class="w-12 sm:w-16 h-12 sm:h-16 object-contain flex-shrink-0" />
          <div class="min-w-0 flex-1">
            <p class="text-xs sm:text-sm font-semibold text-background-600 truncate">
              {{ rentalDetails.vehicleData?.basicInfo.brand }}
            </p>
            <p class="text-sm sm:text-lg font-bold text-primary-900 truncate">
              {{ rentalDetails.vehicleData?.basicInfo.model }}
            </p>
          </div>
        </div>
        <div class="text-primary-900 font-semibold text-sm sm:text-base flex-shrink-0">
          {{ rentalDetails.vehicleData?.basicInfo.licensePlate }}
        </div>
      </router-link>

      <div v-if="showPickupMessage && loggedUser?.id === rentalDetails?.driver_id" 
        class="bg-green-600 border border-green-700 text-white p-3 sm:p-4 rounded-lg text-center">
        <p class="font-semibold text-sm sm:text-base">¡El vehículo fue retirado!</p>
        <p class="text-xs sm:text-sm">Recuerda devolverlo antes del {{ formatDate(rentalDetails?.end_time) }}.</p>
      </div>

      <div v-else-if="showPickupMessage && loggedUser?.id === rentalDetails?.owner_id" 
        class="bg-green-600 border border-green-700 text-white p-3 sm:p-4 rounded-lg text-center">
        <p class="font-semibold text-sm sm:text-base">¡El vehículo fue retirado!</p>
        <p class="text-xs sm:text-sm">{{ rentalDetails?.driverData?.name }} debe devolverlo antes del {{ formatDate(rentalDetails?.end_time) }}.</p>
      </div>

      <div v-if="!showCompletedView" class="pt-4 sm:pt-6 border-t border-gray-200 space-y-3">
        <button v-if="canMarkAsPickedUp" @click="handleMarkAsPickedUp" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center text-sm sm:text-base">
          <Loading v-if="actionInProgress" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Marcar como auto retirado
        </button>

        <button v-if="canMarkAsReturned_Driver" @click="handleMarkAsReturned" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center text-sm sm:text-base">
          <Loading v-if="actionInProgress" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Marcar vehículo como devuelto
        </button>

        <button v-if="canFinalize_Owner" @click="handleFinalizeRental" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center text-sm sm:text-base">
          <Loading v-if="actionInProgress" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Confirmar devolución y finalizar
        </button>

        <button v-if="canCancelRental" @click="openCancelModal" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center text-sm sm:text-base">
          <Loading v-if="actionInProgress" class="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          Cancelar alquiler
        </button>
        <Modal
          :isOpen="showCancelModal"
          title="Cancelar alquiler"
          message="¿Estás seguro de que quieres cancelar este alquiler?"
          confirmText="Si, cancelar"
          cancelText="No, mantener"
          @close="showCancelModal = false"
          @confirm="confirmCancelRental"
        />
      </div>

      

      <div v-else class="pt-4 sm:pt-6 border-t border-gray-200 space-y-4 text-center">
        <p class="text-lg sm:text-xl font-semibold text-green-600">¡Alquiler completado!</p>
        <div class="my-4 p-3 bg-gray-100 rounded-lg">
          <p class="text-xs sm:text-sm text-gray-700">Próximamente podrás calificar esta experiencia.</p>
          <button class="mt-2 text-xs sm:text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            disabled>
            Calificar alquiler (próximamente)
          </button>
        </div>
        <Input
            type="button"
            text="Volver a inicio"
            variant="secondary"
            :outline="false"
            @click="router.push(`/dashboard`)"
          />
      </div>
    </div>

    <div v-if="!showCompletedView" class="flex-1 flex flex-col gap-4 relative order-2 lg:order-2">
      
      <div class="flex-1 bg-gray-200 rounded-xl lg:rounded-3xl relative overflow-hidden">
        <div id="map" class="w-full min-h-100 md:h-[50%] rounded-[40px] relative"></div>

        <div class="absolute left-2 sm:left-4 lg:left-1/2 lg:transform lg:-translate-x-1/2 top-4 sm:top-6 lg:top-8 bg-white rounded-xl lg:rounded-2xl p-3 sm:p-4 shadow-lg z-4 w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] lg:w-[90%] lg:max-w-4xl">
          
          <div class="flex md:grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 lg:gap-4">
            <div class="bg-vibrant-light-600 rounded-lg lg:rounded-2xl p-2 sm:p-3 lg:p-4 flex flex-col gap-1 sm:gap-2 lg:gap-3 shadow-md">
              <div class="flex items-center gap-1 sm:gap-2">
                <Ubication class="size-4 sm:size-5 lg:size-6 text-primary-900" />
                <span class="text-xs sm:text-sm font-medium text-primary-900">Ubicación</span>
              </div>
              <span class="text-background-600 font-semibold text-xs sm:text-sm lg:text-base truncate">
                {{ rentalDetails.vehicleData?.status.currentLocation.address }}
              </span>
            </div>
            
            <div class="bg-vibrant-light-600 rounded-lg lg:rounded-2xl p-2 sm:p-3 lg:p-4 flex flex-col gap-1 sm:gap-2 lg:gap-3 shadow-md">
              <div class="flex items-center gap-1 sm:gap-2">
                <Velocimetre class="size-4 sm:size-5 lg:size-6 text-primary-900" />
                <span class="text-xs sm:text-sm font-medium text-primary-900">Velocidad</span>
              </div>
              <span class="text-background-600 font-semibold text-xs sm:text-sm lg:text-base">60 km/h</span>
            </div>
            
            <div class="bg-vibrant-light-600 rounded-lg lg:rounded-2xl p-2 sm:p-3 lg:p-4 flex flex-col gap-1 sm:gap-2 lg:gap-3 shadow-md">
              <div class="flex items-center gap-1 sm:gap-2">
                <Distance class="size-4 sm:size-5 lg:size-6 text-primary-900" />
                <span class="text-xs sm:text-sm font-medium text-primary-900">Distancia</span>
              </div>
              <span class="text-background-600 font-semibold text-xs sm:text-sm lg:text-base">0.542 km</span>
            </div>
          </div>
        </div>
      </div>
    </div>

      <section v-else class="box-white bg-white border-2 border-vibrant-light-600 rounded-2xl py-6 px-4 pr-2 w-full text-gray-700 max-h-full order-2 overflow-hidden">
        <Heading :type="2" class="text-gray-800 text-lg sm:text-xl lg:text-2xl">📄 Resumen del alquiler</Heading>
        <article class="overflow-y-auto h-full py-2">

          <!-- Vehículo -->
          <div class="flex flex-col gap-2 py-2">
            <h3 class="font-semibold text-base sm:text-lg">🚗 Vehículo</h3>
            <ul class="text-sm sm:text-base flex flex-col gap-1">
              <li><strong>Marca / Modelo:</strong> {{ rentalDetails.vehicleData?.basicInfo.brand }} {{
                rentalDetails.vehicleData?.basicInfo.model }} ({{ rentalDetails.vehicleData?.basicInfo.year }})</li>
              <li><strong>Patente:</strong> {{ rentalDetails.vehicleData?.basicInfo.licensePlate }}</li>
              <li><strong>Transmisión:</strong> {{ rentalDetails.vehicleData?.specifications.transmission }}</li>
              <li><strong>Combustible:</strong> {{ rentalDetails.vehicleData?.specifications.fuelType }}</li>
              <li><strong>Extras:</strong> {{ rentalDetails.vehicleData.extras?.join(', ') || 'Ninguno' }}</li>
            </ul>
          </div>
          <hr/>
          <!-- Participantes -->
          <div class="flex flex-col gap-2 py-2">
            <h3 class="font-semibold text-base sm:text-lg">👥 Participantes</h3>
            <ul class="text-sm sm:text-base flex flex-col gap-1">
              <li><strong>Propietario:</strong> {{ rentalDetails.ownerData.name }} {{ rentalDetails.ownerData.lastname }}</li>
              <li><strong>Conductor:</strong> {{ rentalDetails.driverData.name }} {{ rentalDetails.driverData.lastname }}</li>
            </ul>
          </div>
          <hr/>
  
          <!-- Fechas -->
          <div class="flex flex-col gap-2 py-2">
            <h3 class="font-semibold text-base sm:text-lg">📅 Fechas</h3>
            <ul class="text-sm sm:text-base flex flex-col gap-1">
              <li><strong>Desde:</strong> {{ formatDate(rentalDetails.start_time) }}</li>
              <li><strong>Hasta:</strong> {{ formatDate(rentalDetails.end_time) }}</li>
            </ul>
          </div>
          <hr/>
  
          <!-- Ubicaciones -->
          <div class="flex flex-col gap-2 py-2">
            <h3 class="font-semibold text-base sm:text-lg">📍 Ubicaciones</h3>
            <ul class="text-sm sm:text-base flex flex-col gap-1">
              <li><strong>Retiro:</strong> {{ rentalDetails.vehicleData?.status.currentLocation.address }}</li>
              <li><strong>Devolución:</strong> {{ rentalDetails.vehicleData?.status.currentLocation.address }}</li>
            </ul>
          </div>
          <hr/>
  
          <!-- Pago -->
          <div class="flex flex-col gap-2 py-2">
            <h3 class="font-semibold text-base sm:text-lg">💳 Pago</h3>
            <ul class="text-sm sm:text-base flex flex-col gap-1">
              <ul><strong>Método:</strong> {{ rentalDetails.payments.payment_method }}</ul>
              <ul><strong>ID Transacción:</strong> {{ rentalDetails.payments.transaction_id.toFixed() }}</ul>
              <ul><strong>Estado:</strong> {{ rentalDetails.payments.status === 'pending' ? 'Pendiente' : rentalDetails.payments.status === 'completed' ? 'Completado' : 'N/A'  }}</ul>
              <ul><strong>Total pagado:</strong> ${{ rentalDetails.total_price?.toFixed() }}</ul>
            </ul>
          </div>
          <hr/>
  
          <!-- Estado Final -->
          <div class="flex flex-col gap-2 py-2">
            <h3 class="font-semibold text-base sm:text-lg">📌 Estado Final</h3>
            <ul class="text-sm sm:text-base flex flex-col gap-1">
              <li><strong>Estado:</strong> {{ rentalDetails.status === 'completed' ? 'Completado' : 'N/A'}}</li>
              <!-- <p v-if="rentalDetails.notes"><strong>Notas:</strong> {{ rentalDetails.notes }}</p> -->
            </ul>
          </div>
        </article>
      </section>
  </div>
</template>