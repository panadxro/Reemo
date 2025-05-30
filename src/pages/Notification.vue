<script setup>

import Heading from '@/components/atoms/Heading.vue';
import Loading from '@/icons/Loading.vue';


import { useAuthStore } from '@/stores';
import { fetchUserNotification } from '@/services/rentedCarService';
import { updateRentalStatus } from '@/services/rentedCarService';
import { createRentalRequestNotification, readNotification, markNotificationAsRead } from '@/services/car/notifyRented';
import { addAlert } from '@/services/alerts';

import { ref, computed, onMounted, onUnmounted  } from 'vue';

const notifications = ref([]);
const isLoading = ref(true);
const errorLoading = ref(null);

let unsubscribeNotifications = null;
const authStore = useAuthStore();
const currentUser = computed(() => authStore.user); 

const loadNotifications = async () => {
  console.log("[Notification.vue] Intentando cargar notificaciones para currentUser:", JSON.parse(JSON.stringify(currentUser.value)));
  console.log("[Notification.vue] Notificaciones antes de cargar:", notifications.value); // Para depurar
  if (!currentUser.value || !currentUser.value.id) {
    errorLoading.value = "Usuario no autenticado. No se pueden cargar notificaciones.";
    isLoading.value = false;
    console.warn("[Notification.vue] Usuario no autenticado o sin ID:", currentUser.value);
    return;
  }

  isLoading.value = true; // Asegurarse de que isLoading se establece antes de la llamada
  errorLoading.value = null; // Limpiar errores previos

  // Detener cualquier listener anterior si existe
  if (unsubscribeNotifications) {
    unsubscribeNotifications();
    unsubscribeNotifications = null;
  }

  try {
    unsubscribeNotifications = fetchUserNotification(
      currentUser.value.id,
      (updatedNotifications, err) => { // El callback ahora puede recibir un error
        if (err) {
          console.error('Error en el listener de notificaciones (desde el componente): ', err);
          errorLoading.value = 'Error al recibir actualizaciones de notificaciones.';
          // notifications.value = []; // Opcional: limpiar notificaciones en error
          isLoading.value = false;
          addAlert(errorLoading.value, "error");
          return;
        }

        notifications.value = updatedNotifications;
        isLoading.value = false; 
        errorLoading.value = null; 
      }
    );
  } catch (error) {
    console.error("[Notification.vue] Error al llamar a fetchUserNotification:", error);
    errorLoading.value = "No se pudo iniciar la escucha de notificaciones.";
    isLoading.value = false;
  }
};

const handleRentalAction = async (rentId, newStatus, senderId, vehicleOwnerId) => {
  try {
    await updateRentalStatus(rentId, newStatus);
    addAlert(`Solicitud ${newStatus === 'confirmed' ? 'aceptada' : 'rechazada'} correctamente.`, 'success');

    const notifIndex = notifications.value.findIndex(noti => noti.rent_id === rentId);
    if (notifIndex !== -1 && notifications.value[notifIndex].rentDetails) { 
      notifications.value[notifIndex].rentDetails.status = newStatus;
    }

    const feedbackMessage = newStatus === 'confirmed'
      ? `Tu solicitud de alquiler para el vehiculo ha sido aceptada.`
      : `Tu solicitud de alquiler para el vehiculo ha sido rechazada.`;

    await createRentalRequestNotification(
      rentId,
      vehicleOwnerId,
      senderId,
      feedbackMessage,
      "rent_response"
    );

  } catch (error) {
    console.error("Error al procesar la solicitud de alquiler:", error);
    addAlert("Error al procesar la accion", "error");
  }
};

const formatDate = (timestamp) => {
  if (timestamp && timestamp.seconds) { // Para Timestamps de Firestore
    return new Date(timestamp.seconds * 1000).toLocaleString();
  } else if (typeof timestamp === 'string') { // Para fechas que ya son strings ISO
    return new Date(timestamp).toLocaleString();
  }
  return 'Fecha no disponible';
};

const handleNotificationClick = async (notification) => {
  if(!notification.read){
    try {
      await markNotificationAsRead(notification.id)
      // No es estrictamente necesario actualizar localmente `notification.read = true` aquí,
      // ya que onSnapshot debería recoger el cambio y actualizar la lista `notifications`.
      // Si la actualización de onSnapshot es muy rápida, el cambio local es redundante.
      // Si quieres una respuesta visual *inmediata* antes de que onSnapshot actualice, podrías hacerlo:
      // const notifToUpdate = notifications.value.find(n => n.id === notification.id);
      // if (notifToUpdate) notifToUpdate.read = true;
    } catch (error) {
      addAlert("Error al marcar la notificación como leída.", "error");
      console.error("Error al marcar la notificación como leída:", error);
    }
  }
  // Aquí podrías añadir lógica adicional si hacer clic en una notificación debe llevar a algún sitio,
  // por ejemplo, a los detalles de un alquiler.
}

onMounted(() => {
  loadNotifications();
});

onUnmounted(() => {
  if (unsubscribeNotifications) {
    console.log("[Notification.vue] Desuscribiéndose de las notificaciones.");
    unsubscribeNotifications();
  }
});

</script> 


<template>
  <!-- <div class="layout-content-container flex flex-col max-w-[960px] flex-1">
    <div class="flex flex-wrap justify-between gap-3 p-4">
      <Heading :type="1" class="text-start px-4 pb-2 pt-4">Notificaciones</Heading>
    </div>
    <div class="flex gap-4 bg-white px-4 py-3 justify-between">
      <div class="flex items-start gap-4">
        <div class="text-[#111418] flex items-center justify-center rounded-lg bg-[#f0f2f4] shrink-0 size-12"
          data-icon="Bell" data-size="24px" data-weight="regular">
          <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" fill="currentColor" viewBox="0 0 256 256">
            <path
              d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z">
            </path>
          </svg>
        </div>
        <div class="flex flex-1 flex-col justify-center">
          <p class="text-[#111418] text-base font-medium leading-normal">Aún no tienes notificaciones</p>
          <p class="text-[#637588] text-sm font-normal leading-normal">Cuando alguien te siga en Reemo, lo verás aquí.
          </p>
        </div>
      </div>
      <div class="shrink-0">
        <button
          class="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#f0f2f4] text-[#111418] text-sm font-medium leading-normal w-fit">
          <span class="truncate">Edite su configuración de notificaciones</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center p-10">
      <Loading class="h-12 w-12 text-secondary-500" />
      <p class="ml-4 text-gray-600">Cargando notificaciones...</p>
    </div>

    <div v-if="!isLoading && errorLoading" class="text-center p-10 text-red-500">
      {{ errorLoading }}
    </div>

    <div v-if="!isLoading && !notifications.length && !errorLoading" class="text-center p-10 text-gray-500">
      Aún no tienes notificaciones.
    </div>

    <div v-if="!isLoading && notifications.length > 0" class="space-y-4 p-4">
      <h3 class="text-[#111418] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">Más reciente</h3>
      <div v-for="notification in notifications" :key="notification.id"
        class="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow">
        <div class="flex items-start gap-4">
          <img v-if="notification.senderDetails?.photoURL"
            :src="notification.senderDetails.photoURL" alt="Avatar solicitante"
            class="h-12 w-12 rounded-full object-cover">
          <div v-else
            class="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
            {{ notification.senderDetails?.name ? notification.senderDetails.name.charAt(0).toUpperCase() : 'R' }}
          </div>

          <div class="flex-1">
            <p class="text-gray-800 font-semibold">
              {{ notification.type === 'rent_request' && notification.senderDetails?.name ?
              notification.senderDetails.name : 'Reemo Bot' }}
            </p>
            <p class="text-sm text-gray-600">{{ notification.message }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ formatDate(notification.created_at) }}</p>

            <div v-if="notification.type === 'rent_request' && notification.rentDetails"
              class="mt-3 bg-gray-50 p-3 rounded">
              <p class="text-sm font-medium text-gray-700">
                Vehículo: {{ notification.vehicleDetails?.marca || 'N/A' }} {{ notification.vehicleDetails?.modelo ||
                'N/A' }}
              </p>
              <p class="text-xs text-gray-500">
                Desde: {{ formatDate(notification.rentDetails.start_time) }}
              </p>
              <p class="text-xs text-gray-500">
                Hasta: {{ formatDate(notification.rentDetails.end_time) }}
              </p>
              <p class="text-xs text-gray-500">
                Precio Total: ${{ notification.rentDetails.total_price?.toFixed(2) || 'N/A' }}
              </p>
              <p class="text-xs font-semibold"
                :class="notification.rentDetails.status === 'pending' ? 'text-yellow-600' : notification.rentDetails.status === 'confirmed' ? 'text-green-600' : 'text-red-600'">
                Estado: {{ notification.rentDetails.status }}
              </p>

              <div v-if="notification.rentDetails.status === 'pending'" class="mt-3 space-x-2">
                <button
                  @click="handleRentalAction(notification.rent_id, 'confirmed', notification.sender_id, notification.receiver_id, notification.rentDetails.vehicle_id)"
                  class="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600">Aceptar</button>
                <button
                  @click="handleRentalAction(notification.rent_id, 'rejected', notification.sender_id, notification.receiver_id, notification.rentDetails.vehicle_id)"
                  class="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600">Rechazar</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div> -->





  <div class="w-full mx-auto bg-white rounded-lg shadow p-4">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <Heading :type="1" class="text-start pb-2 pt-4">Notificaciones</Heading>
    </div>

    <!-- Tabs -->
    <div class="flex border-b mb-4 space-x-4">
      <button class="relative pb-2 border-b-2 border-black font-semibold">
        Inbox <span class="ml-1 bg-red-500 text-white text-xs rounded-full px-1">4</span>
      </button>
      <button class="relative pb-2 text-gray-500">Team
        <span class="ml-1 bg-gray-300 text-xs rounded-full px-1">2</span>
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center p-10">
      <Loading class="h-12 w-12 text-secondary-500" />
      <p class="ml-4 text-gray-600">Cargando notificaciones...</p>
    </div>

    <div v-if="!isLoading && !notifications.length" class="text-center p-10 text-gray-500">
      Aún no tienes notificaciones.
    </div>

    <!-- Notifications -->
    <div v-if="!isLoading && notifications.length > 0" class=""> 
      <div v-for="noti in notifications" :key="noti.id" 
        class="overflow-y-auto p-6 border-b last:border-b-0 hover:bg-gray-200 rounded-xl"
        @click="handleNotificationClick(noti)">
        <!-- Contenedor General para una Notificación -->
        <div class="flex items-start space-x-3">
          <img v-if="noti.senderDetails?.photoURL"
            :src="noti.senderDetails?.photoURL" class="w-10 h-10 rounded-full" />
          <div v-else class="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
            <h3>{{ noti.senderDetails?.name  ? noti.senderDetails.name .charAt(0).toUpperCase() : 'R' }}</h3>
            <p> {{ noti.message || 'Ha habido una actualización sobre tu solicitud de alquiler.' }}</p>
          </div>
          <div class="flex-1">

            <!-- Emcabezado general -->
            <div class="flex items-center justify-between">
              <p class="text-sm">
                <span v-if="!noti.read" class="inline-block w-2 h-2 mr-2 rounded-full bg-red-500" title="No leído"></span>
                <span class="font-semibold">{{ noti.senderDetails?.name ? noti.senderDetails.name : 'Reemo Bot' }}</span>
                <!-- <span> {{ noti.message }} </span> -->
              </p>
            </div>

            <!-- Contenido específico por tipo de notificación -->
            <!-- Solicitud de Alquiler (para el propietario del vehículo) -->
            <div v-if="noti.type === 'rent_request'">
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div>
              <p class="text-sm text-gray-700">
                {{ noti.message || 'Ha habido una actualización sobre tu solicitud de alquiler.' }}
                <span class="font-medium">{{ noti.vehicleDetails?.marca || '' }} {{ noti.vehicleDetails?.modelo ||
                  'Vehículo no especificado' }}</span>.
              </p>
              <!-- File info -->
              <div v-if="noti.rentDetails" class="mt-3 bg-gray-100 rounded p-3">
                <div class="flex items-center space-x-2 bg-gray-100 rounded px-2 py-1 mt-3">
                  <img v-if="noti.type === 'rent_request' && noti.vehicleDetails?.images"
                    :src="noti.vehicleDetails.images[1]" :alt="noti.vehicleDetails.marca"
                    class="w-12 h-12 rounded-full" />
                  <div v-else
                    class="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
                    {{ noti.senderDetails?.name ? noti.senderDetails.name.charAt(0).toUpperCase() : 'R' }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ noti.vehicleDetails?.marca || 'N/A' }} {{ noti.vehicleDetails?.modelo || 'N/A' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Desde: {{ formatDate(noti.rentDetails?.start_time) }} Hasta: {{ formatDate(noti.rentDetails.end_time) }}
                    </p>
                    <p class="text-xs text-gray-500">
                    Precio Total: <span class="text-xs px-2 py-0.5 rounded bg-green-100 border text-green-700">${{ noti.rentDetails?.total_price?.toFixed(2) || 'N/A' }} </span>
                    </p>
                    <p class="text-xs text-gray-500">
                      Estado:
                      <span class="font-semibold"
                        :class="noti.rentDetails.status === 'pending' ? 'text-yellow-600' : noti.rentDetails.status === 'confirmed' ? 'text-green-600' : 'text-red-600'">
                        {{ noti.rentDetails.status.replace('_', ' ') }}
                      </span>
                    </p>
                  </div>
                  <!-- <span class="text-xs text-gray-400 ml-auto">Edited {{ noti.archivo.edicion }}</span> -->
                  <span class="text-xs text-gray-400 ml-auto">Edited 12 mins ago</span>
                </div>
                <!-- <p class="text-xs text-gray-600">
                  Desde: {{ formatDate(noti.rentDetails.start_time) }}
                </p>
                <p class="text-xs text-gray-600">
                  Hasta: {{ formatDate(noti.rentDetails.end_time) }}
                </p>
                <p class="text-xs text-gray-600">
                  Precio Total: ${{ noti.rentDetails.total_price?.toFixed(2) || 'N/A' }}
                </p> -->
                <div v-if="noti.type === 'rent_request' && noti.rentDetails" class="flex space-x-2 mt-3">
                  <div v-if="noti.rentDetails.status === 'pending'" class="flex space-x-2 mt-3">
                    <button
                      @click="handleRentalAction(noti.rent_id, 'confirmed', noti.sender_id, noti.receiver_id, noti.rentDetails.vehicle_id)"
                      class="text-sm px-3 py-1 rounded border text-gray-700 cursor-pointer">Aceptar</button>
                    <button
                      @click="handleRentalAction(noti.rent_id, 'rejected', noti.sender_id, noti.receiver_id, noti.rentDetails.vehicle_id)"
                      class="text-sm px-3 py-1 rounded bg-black text-white cursor-pointer">Rechazar</button>
                  </div>
                </div>
              </div>
              
            </div>

            <!-- Caso: Respuesta a Solicitud de Alquiler (para el conductor que solicitó) -->
          <div v-else-if="noti.type === 'rent_response'">
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div>
            <p class="text-sm text-gray-700">
              {{ noti.message || 'Ha habido una actualización sobre tu solicitud de alquiler.' }}
            </p>
            <div v-if="noti.rentDetails" class="mt-3 bg-gray-100 rounded p-3">
              <div class="flex items-center space-x-2 mb-2">
                 <img v-if="noti.vehicleDetails?.images && noti.vehicleDetails.images.length > 0"
                  :src="noti.vehicleDetails.images[0]"
                  :alt="`Imagen de ${noti.vehicleDetails.marca}`" 
                  class="w-12 h-12 rounded-md object-cover" />
                <div v-else class="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sin foto</div>
                <div>
                  <p class="text-sm font-medium text-gray-800">
                    {{ noti.vehicleDetails?.marca || 'N/A' }} {{ noti.vehicleDetails?.modelo || 'N/A' }}
                  </p>
                  <p class="text-xs text-gray-500">
                    Estado: 
                    <span class="font-semibold" 
                          :class="{
                            'text-yellow-600': noti.rentDetails.status === 'pending',
                            'text-green-600': noti.rentDetails.status === 'confirmed',
                            'text-red-600': noti.rentDetails.status === 'rejected' || noti.rentDetails.status === 'cancelled_by_user' || noti.rentDetails.status === 'cancelled_by_owner',
                            'text-blue-600': noti.rentDetails.status === 'completed',
                            'text-indigo-600': noti.rentDetails.status === 'in_progress',
                          }">
                      {{ noti.rentDetails.status.replace('_', ' ') }}
                    </span>
                  </p>
                </div>
              </div>
               <p class="text-xs text-gray-600">
                Desde: {{ formatDate(noti.rentDetails.start_time) }}
              </p>
              <p class="text-xs text-gray-600">
                Hasta: {{ formatDate(noti.rentDetails.end_time) }}
              </p>
            </div>
          </div>
          
          <!-- Caso: Otro tipo de notificación (genérico) -->
          <div v-else>
            <p class="text-sm text-gray-700">{{ noti.message || 'Tienes una nueva notificación.' }}</p>
            <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div>
          </div>


            <!-- Mensaje comentado -->
            <!-- <div v-if="noti.mensajeExtra" class="bg-gray-50 border rounded p-2 mt-3 text-sm text-gray-600">
              {{ noti.mensajeExtra }}
            </div> -->

            <!-- Acciones -->
            <!-- <div v-if="noti.acciones" class="flex space-x-2 mt-3"> -->
            <!-- <div v-if="noti.acciones" class="flex space-x-2 mt-3">
            <button class="text-sm px-3 py-1 rounded border text-gray-700">Decline</button>
            <button class="text-sm px-3 py-1 rounded bg-black text-white">Accept</button>
            </div> -->

             <!-- <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div> -->
            <!-- <div class="text-xs text-gray-400 mt-1">1 min ago • Easy 2023 Project</div> -->

            <!-- Tags -->
            <!-- <div v-if="noti.tags.length > 0" class="flex flex-wrap mt-2 gap-1">
            <span v-for="tag in noti.tags" :key="tag"
              class="text-xs px-2 py-0.5 rounded bg-gray-100 border text-gray-700">{{ tag }}</span>
            </div> -->

            <!-- Responder -->
            <button v-if="noti.responder" class="text-sm text-gray-600 mt-2">Reply</button>
          </div>
        </div>
      </div>
    </div>
  </div>


</template>