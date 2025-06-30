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
import Velocimetre from '@icons/Velocimetre.vue';
import Ubication from '@icons/Ubication.vue';
import Distance from '@icons/Distance.vue';

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
async function initializeMap(details) {
  // Cambiar las coordenadas por la nueva coleccion de "cars"
  if (details && details.vehicleData?.status.currentLocation.location && !mapInitialized.value){
    try {
      console.log('[RentalDetailsView] Intentando iniciar el mapa');
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
          console.warn('[RentalDetailsView]: Coordenadas del vehículo no disponibles o inválidas para centrar el mapa.');
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

  <!-- bg-[#eaf7f9] -->
  <div v-else-if="rentalDetails" class="flex py-6 px-4 gap-4 w-full bg-secondary-100 rounded-3xl">

    <!-- Panel lateral -->
    <div class="w-96 h-full flex flex-col gap-4 overflow-hidden overflow-y-auto">
      <div class="flex items-center gap-2">
        <BackButton />
        <Heading :type="1" class="medium">Detalles del alquiler</Heading>
      </div>

      <div class="bg-[#0D0D3C] text-white rounded-2xl p-4 flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span>Orden ID: <strong>#{{ rentalDetails.id.slice(0, 8) }}</strong></span>
          <!-- <span class="px-2 py-1 rounded-lg text-xs font-semibold capitalize" :class="{
              'bg-yellow-400 text-[#0D0D3C]': rentalDetails.status === 'pending' || rentalDetails.status === 'returned_by_driver',
              'bg-blue-500 text-white': rentalDetails.status === 'confirmed' || rentalDetails.status === 'in_progress',
              'bg-green-500 text-white': rentalDetails.status === 'completed',
              'bg-red-500 text-white': rentalDetails.status === 'cancelled_by_user' || rentalDetails.status === 'cancelled_by_owner' || rentalDetails.status === 'rejected' || rentalDetails.status === 'expired',
            }">
            {{ 
              rentalDetails.status === "pending" ? "Pendiente" : 
              rentalDetails.status === "confirmed" ? "Confirmada" : 
              rentalDetails.status === "rejected" ? "Rechazada" : 
              rentalDetails.status === "cancelled_by_user" ? "Cancelada por el conductor" : 
              rentalDetails.status === "cancelled_by_owner" ? "Cancelada por el propietario" : 
              rentalDetails.status === "returned_by_driver" ? "Devuelta por el conductor" : 
              rentalDetails.status === "completed" ? "Completado" : 
              rentalDetails.status === "in_progress" ? "En progreso" : "N/A" }}
            </span> -->
            <Status :status="rentalDetails.status"/>

        </div>
        <div class="grid grid-cols-2 gap-2">
          <div><p class="text-background-800 text-sm">Desde:</p> <p class="text-white text-sm">{{ formatDate(rentalDetails.start_time) }}</p></div>
          <div><p class="text-background-800 text-sm">Hasta:</p> <p class="text-white text-sm">{{ formatDate(rentalDetails.end_time) }}</p></div>
          <div><p class="text-background-800 text-sm">Tarifa:</p> <p class="text-white text-sm">${{ rentalDetails.total_price?.toFixed() || 'N/A' }}</p></div>
          <div><p class="text-background-800 text-sm">Método de pago:</p> <p class="text-white text-sm">Transferencia</p></div>
        </div>
      </div>


      <!-- Cuadro para indicar cual es el proxim que debe seguir determinado usuario para que se etienda mas -->
      <div v-if="nextStepInfo && !showCompletedView" 
           class="p-4 rounded-2xl border-2 transition-all duration-300"
           :class="{
             'bg-blue-50 border-blue-300': nextStepInfo.type === 'waiting',
             'bg-orange-50 border-orange-300': nextStepInfo.type === 'action-needed',
             'bg-green-50 border-green-300': nextStepInfo.type === 'info',
             'bg-emerald-50 border-emerald-300': nextStepInfo.type === 'success',
             'bg-red-50 border-red-300': nextStepInfo.type === 'cancelled'
           }">
        <div class="flex items-start gap-3">
          <span class="text-2xl">{{ nextStepInfo.icon }}</span>
          <div>
            <h3 class="font-semibold text-gray-800 mb-1">Próximo paso</h3>
            <p class="text-gray-700 text-sm leading-relaxed">{{ nextStepInfo.message }}</p>
          </div>
        </div>
      </div>


      <div class="p-4 flex flex-col gap-2" v-if="rentalDetails.driver_id === loggedUser?.id">
        <div class="flex items-center justify-between">
        <Heading :type="2" class="medium text-primary-900">Datos del propietario</Heading>
        <router-link
                v-if="rentalDetails.owner_id !== loggedUser?.id"
                :to="`/user/${rentalDetails.owner_id}/chat`"
                class="cursor-pointer"
                >
                <button class="px-3 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-700 hover:cursor-pointer transition-colors duration-200">
                  Chat
                </button>
              <!-- <Input 
                type="button"
                text="Chat"
                variant="primary"
                :outline="false"
                class="cursor-pointer"
              /> -->
              </router-link>
        </div>
        <router-link :to="`/user/${rentalDetails.owner_id}`" class="flex items-center gap-4 mt-4">
          <img :src="rentalDetails.ownerData?.photoURL" :alt="rentalDetails.ownerData?.name"
            class="w-14 h-14 rounded-full" />
          <div>
            <p class="font-medium text-primary-900">{{ rentalDetails.ownerData?.name }} {{
              rentalDetails.ownerData?.lastname}}</p>
              <p class="text-md text-gray-500">@{{ rentalDetails.ownerData?.username}}</p>
          </div>
        </router-link>
      </div>

        <div class="p-4 flex flex-col gap-2" v-else-if="rentalDetails.owner_id === loggedUser?.id">
        <div class="flex items-center justify-between">
        <Heading :type="2" class="medium text-primary-900">Datos del conductor</Heading>
        <router-link
                v-if="rentalDetails.driver_id !== loggedUser?.id"
                :to="`/user/${rentalDetails.driver_id}/chat`"
                class="cursor-pointer"
                >
                <button class="px-3 py-2 bg-primary-900 text-white rounded-lg hover:bg-primary-700 hover:cursor-pointer transition-colors duration-200">
                  Chat
                </button>
              <!-- <Input 
                type="button"
                text="Chat"
                variant="primary"
                :outline="false"
                class="cursor-pointer"
              /> -->
              </router-link>
        </div>
        <router-link :to="`/user/${rentalDetails.driver_id}`" class="flex items-center gap-4 mt-4">
          <img :src="rentalDetails.driverData?.photoURL" :alt="rentalDetails.driverData?.name"
            class="w-14 h-14 rounded-full" />
          <div>
            <p class="font-medium text-primary-900">{{ rentalDetails.driverData?.name }} {{
              rentalDetails.driverData?.lastname}}</p>
              <p class="text-md text-gray-500">@{{ rentalDetails.driverData?.username}}</p>
          </div>
        </router-link>
      </div>

      <router-link :to="`/car/${rentalDetails.vehicleData?.id}`" class="flex items-center gap-2 bg-white rounded-xl justify-between p-4">
        <div class="flex gap-2">
          <img :src="rentalDetails.vehicleData?.photos[0]" :alt="rentalDetails.vehicleData?.basicInfo.brand"
          class="w-16 object-contain" />
        <div>
          <p class="text-sm font-semibold text-background-600">{{ rentalDetails.vehicleData?.basicInfo.brand }}</p>
          <p class="text-lg font-bold text-primary-900">{{ rentalDetails.vehicleData?.basicInfo.model }}</p>
        </div>
        </div>

        <div class="text-primary-900 font-semibold text-md">
          {{ rentalDetails.vehicleData?.basicInfo.licensePlate  }}
        </div>
        
      </router-link>

      <!-- Mensaje de vehículo retirado -->
      <div v-if="showPickupMessage && loggedUser?.id === rentalDetails?.driver_id" class="bg-green-600 border border-green-700 text-white p-4 rounded-md text-center">
        <p class="font-semibold">¡El vehículo fue retirado!</p>
        <p>Recuerda devolverlo antes del {{ formatDate(rentalDetails?.end_time) }}.</p>
      </div>

      <div v-else-if="showPickupMessage && loggedUser?.id === rentalDetails?.owner_id" class="bg-green-600 border border-green-700 text-white p-4 rounded-md text-center">
        <p class="font-semibold">¡El vehículo fue retirado!</p>
        <p>{{ rentalDetails?.driverData?.name }} debe devolverlo antes del {{ formatDate(rentalDetails?.end_time) }}.</p>
      </div>

      <!-- Acciones -->
      <div v-if="!showCompletedView" class="pt-6 border-t border-gray-200 space-y-3">
        <button v-if="canMarkAsPickedUp" @click="handleMarkAsPickedUp" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
          <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
          Marcar como auto retirado
        </button>

        <button v-if="canMarkAsReturned_Driver" @click="handleMarkAsReturned" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
          <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
          Marcar vehículo como devuelto
        </button>

        <button v-if="canFinalize_Owner" @click="handleFinalizeRental" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
          <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
          Confirmar devolución y finalizar
        </button>

        <button v-if="canCancelRental" @click="handleCancelRental" :disabled="actionInProgress"
          class="hover:cursor-pointer w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 px-4 rounded-lg transition duration-150 ease-in-out disabled:opacity-50 flex items-center justify-center">
          <Loading v-if="actionInProgress" class="h-5 w-5 mr-2" />
          Cancelar alquiler
        </button>
      </div>
      <div v-else class="pt-6 border-t border-gray-200 space-y-4 text-center">
        <p class="text-xl font-semibold text-green-600">¡Alquiler completado!</p>
        <div class="my-4 p-3 bg-gray-100 rounded-lg">
          <p class="text-sm text-gray-700">Próximamente podrás calificar esta experiencia.</p>
          <button class="mt-2 text-sm text-blue-600 hover:underline disabled:text-gray-400 disabled:no-underline"
            disabled>
            Calificar alquiler (próximamente)
          </button>
        </div>
        <button @click="router.push(`/dashboard`)"
          class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out">
          Volver a inicio
        </button>
        <button @click="router.push(`/user/${loggedUser?.id}`)"
          class="mt-2 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition duration-150 ease-in-out">
          Ver mi perfil
        </button>
      </div>

    </div>

    <!-- Panel principal -->
    <div v-if="!showCompletedView" class="flex-1 flex flex-col gap-4 relative">

      <!-- Mapa (placeholder) -->
      <div class="flex-1 bg-gray-200 rounded-3xl relative overflow-hidden">
        <div id="map" class="absolute inset-0 z-0"></div>

        <!-- Datos del viaje -->
      <div class="absolute left-1/2 transform -translate-x-1/2 top-8 bg-white rounded-2xl p-4 shadow-lg z-10 w-[90%] max-w-4xl mx-auto">
        <div class="grid grid-cols-3 gap-4">
        <div class="bg-vibrant-light-600 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
          <div class="flex items-center gap-2">
          <Ubication class="size-6 text-primary-900" />
          <span class="text-sm font-medium text-primary-900">Ubicación</span>
          </div>
          <span class="text-background-600 font-semibold">{{ rentalDetails.vehicleData?.status.currentLocation.address }}</span>
        </div>
        <div class="bg-vibrant-light-600 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
          <div class="flex items-center gap-2">
          <Velocimetre class="size-6 text-primary-900" />
          <span class="text-sm font-medium text-primary-900">Velocidad</span>
          </div>
          <span class="text-background-600 font-semibold">60 km/h</span>
        </div>
        <div class="bg-vibrant-light-600 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
          <div class="flex items-center gap-2">
          <Distance class="size-6 text-primary-900" />
          <span class="text-sm font-medium text-primary-900">Distancia</span>
          </div>
          <span class="text-background-600 font-semibold">0.542 km</span>
        </div>
        <!-- <div class="bg-vibrant-light-600 rounded-2xl p-4 flex flex-col gap-1 shadow-md">
          <span class="text-sm font-medium text-primary-900">Última parada</span>
          <span class="text-background-600 font-semibold">Hace 2hs</span>
        </div> -->
        </div>
      </div>
        
        <!-- Chat flotante -->
        <!-- <div
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
        </div> -->

        <!-- Botones flotantes -->
        <!-- <div class="absolute bottom-4 left-4 flex gap-2">
          <button class="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">🔔</button>
          <button class="bg-white w-12 h-12 rounded-full flex items-center justify-center shadow-lg">💬</button>
        </div> -->

      </div>
    </div>




    <div v-else class="flex-1 flex flex-col items-center justify-center bg-gray-50 rounded-3xl p-8 shadow-inner overflow-hidden">

      <div class="bg-white shadow-2xl rounded-2xl p-6 max-w-2xl w-full text-gray-700 space-y-5 mx-auto">
        <Heading :type="2" class="text-gray-800">📄 Resumen del alquiler</Heading>

        <!-- Vehículo -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">🚗 Vehículo</h3>
          <p><strong>Marca / Modelo:</strong> {{ rentalDetails.vehicleData?.basicInfo.brand }} {{
            rentalDetails.vehicleData?.basicInfo.model }} ({{ rentalDetails.vehicleData?.basicInfo.year }})</p>
          <p><strong>Patente:</strong> {{ rentalDetails.vehicleData?.basicInfo.licensePlate }}</p>
          <p><strong>Transmisión:</strong> {{ rentalDetails.vehicleData?.specifications.transmission }}</p>
          <p><strong>Combustible:</strong> {{ rentalDetails.vehicleData?.specifications.fuelType }}</p>
          <p><strong>Extras:</strong> {{ rentalDetails.vehicleData.extras?.join(', ') || 'Ninguno' }}</p>
        </div>

        <!-- Participantes -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">👥 Participantes</h3>
          <p><strong>Propietario:</strong> {{ rentalDetails.ownerData.name }} {{ rentalDetails.ownerData.lastname }}</p>
          <p><strong>Conductor:</strong> {{ rentalDetails.driverData.name }} {{ rentalDetails.driverData.lastname }}</p>
        </div>

        <!-- Fechas -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">📅 Fechas</h3>
          <p><strong>Desde:</strong> {{ formatDate(rentalDetails.start_time) }}</p>
          <p><strong>Hasta:</strong> {{ formatDate(rentalDetails.end_time) }}</p>
          <!-- <p><strong>Duración:</strong> {{ rentalDetails.duration }}</p> -->
        </div>

        <!-- Ubicaciones -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">📍 Ubicaciones</h3>
          <p><strong>Retiro:</strong> {{ rentalDetails.vehicleData?.status.currentLocation.address }}</p>
          <p><strong>Devolución:</strong> {{ rentalDetails.vehicleData?.status.currentLocation.address }}</p>
        </div>

        <!-- Pago -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">💳 Pago</h3>
          <p><strong>Método:</strong> {{ rentalDetails.payments.payment_method }}</p>
          <p><strong>ID Transacción:</strong> {{ rentalDetails.payments.transaction_id }}</p>
          <p><strong>Estado:</strong> {{ rentalDetails.payments.status }}</p>
          <p><strong>Total pagado:</strong> ${{ rentalDetails.total_price?.toFixed() }}</p>
        </div>

        <!-- Estado Final -->
        <div>
          <h3 class="font-semibold text-lg">📌 Estado Final</h3>
          <p><strong>Estado:</strong> {{ rentalDetails.status }}</p>
          <p v-if="rentalDetails.notes"><strong>Notas:</strong> {{ rentalDetails.notes }}</p>
        </div>

      </div>
    </div>
    
  </div>

</template>
