<script setup>

import Heading from '@/components/atoms/Heading.vue';
import Loading from '@/icons/Loading.vue';
import ReemoIcon from '@/icons/ReemoIcon.vue';
import BackButton from '@/components/atoms/BackButton.vue';
import NoNotification from '../components/atoms/NoNotification.vue';
import Input from '@/components/molecules/Input.vue';

import { useAuthStore } from '@/stores';
import { useNotificationStore } from '@/stores/notification.store';
import { addAlert } from '@/services/alerts';

import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';


const authStore = useAuthStore();
const notificationStore = useNotificationStore(); 
const currentUser = computed(() => authStore.user); 

const router = useRouter();

const items = [
  { label: 'Inbox', icon: '📥' },
  { label: 'Starry', icon: '⭐' },
  { label: 'Drafts', icon: '📝' },
  { label: 'Important', icon: '⚡' },
  { label: 'Sent', icon: '📤' },
  { label: 'Archive', icon: '📦' },
  { label: 'Spam', icon: '🚫' },
  { label: 'Trash', icon: '🗑️' },
]
const tags = ['Security', 'Update', 'Marketing', 'HR'];
const mails = [
  { id: 1, name: 'Brook Simmons', subject: 'Important Account Update', label: 'Security', date: '3:24 PM', avatar: 'https://i.pravatar.cc/40?img=1', unread: true },
  // más mails...
]

// Acceder a los datos del store
const notifications = computed(() => notificationStore.sortedNotifications); // Usar el getter para ordenarlas
const isLoading = computed(() => notificationStore.isLoading);
const errorLoading = computed(() => notificationStore.error);


watch(currentUser, (newUser) => {
  if (newUser && newUser.id) {
    // Si hay un usuario y el listener no se ha iniciado, lo iniciamos.
    // El hasLoadedOnce previene que se inicie múltiples veces si el watcher se dispara de nuevo
    if (!notificationStore.hasLoadedOnce) {
      console.log("[Notification.vue watch] Usuario detectado, iniciando listener de notificaciones.");
      notificationStore.initListenerForUser(newUser.id);
    }
  } else {
    // Si no hay usuario (o se ha deslogueado), limpiamos los datos.
    console.log("[Notification.vue watch] No hay usuario autenticado, limpiando datos de notificaciones.");
    notificationStore.clearListenerAndData();
  }
}, { immediate: true });

const handleRentalAction = async (rentId, newStatus, senderId, vehicleOwnerId) => {
  try {
    await notificationStore.handleRentalAction({ rentId, newStatus, senderId, vehicleOwnerId });
    addAlert(`Solicitud ${newStatus === 'confirmed' ? 'aceptada' : 'rechazada'} correctamente.`, 'success');
    // El store se encarga de la lógica de actualizar el estado y enviar notificaciones de feedback.
  } catch (error) {
    console.error("Error al procesar la solicitud de alquiler:", error);
    addAlert("Error al procesar la accion", "error");
  }
};

const formatDate = (timestamp) => {
  if (timestamp && timestamp.seconds) { 
    return new Date(timestamp.seconds * 1000).toLocaleString();
  } else if (typeof timestamp === 'string') {
    return new Date(timestamp).toLocaleString();
  }
  return 'Fecha no disponible';
};

const handleNotificationClick = async (notification) => {
  if(!notification.read){
    try {
      await notificationStore.markNotificationAsRead(notification.id);
      // No es estrictamente necesario actualizar localmente `notification.read = true` aca,
      // ya que onSnapshot tendria que obtener el cambio y actualizar la lista `notifications`.
      // Si la actualización de onSnapshot es muy rápida, el cambio local es redundante.
    } catch (error) {
      addAlert("Error al marcar la notificación como leída.", "error");
      console.error("Error al marcar la notificación como leída:", error);
    }
  }
  // Lógica de navegación si es necesario (ej. ir a RentalDetailsView)
  // if (notification.type === 'rent_response' && notification.rent_id) {
  //   router.push(`/rent/${notification.rent_id}`);
  // }
  
  // Lógica de navegación
  if (notification.link) {
    router.push(notification.link);
  }

}

</script> 


<template>

  <div class="w-full bg-vibrant-light-600 rounded-[40px] m-2.5 p-4 overflow-y-hidden flex flex-col gap-6">
    <!-- Header -->
    <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white md:bg-vibrant-light-600 px-2.5 md:px-0 py-3 md:py-0">
      <BackButton />
      <Heading :type="1" class="medium">Notificaciones</Heading>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center p-10">
      <Loading class="h-12 w-12 text-secondary-500" />
      <p class="ml-4 text-gray-600">Cargando notificaciones...</p>
    </div>

    <div v-if="!isLoading && !notifications.length" class="flex flex-col items-center justify-center h-full text-center gap-2">
      <NoNotification class="max-w-[150px] m-4"/>
      <p class="text-gray-400 font-bold">No hay notificaciones aún.</p>
      <Input
        type="button"
        text="Ir al inicio"
        variant="primary"
        class="!w-fit"
        @click="router.push('/dashboard')"
        />
    </div>

    <!-- Notifications -->
    <ul v-if="!isLoading && notifications.length > 0" class="box-vibrant overflow-y-auto h-full !pr-2">
      <!-- Nueva notificación -->
      <li class="flex items-center justify-between p-4 rounded-4xl bg-vibrant-light-800">
        <div class="flex items-center gap-5">
          <figure class="h-18 aspect-square relative">
            <img src="../assets/Reemo1x1.png" class="bg-white h-full rounded-full object-cover" alt="Reemo Bot"/>
            <span class="absolute bottom-0 right-0"><img src="../assets/User1x1.png" class="bg-vibrant-light-800 h-8 aspect-square rounded-full object-cover" alt=""></span>
          </figure>
          <div class="flex flex-col gap-2.5">
            <Heading :type="2" class="regular">🚗 Nuevo vehículo pendiente de revisión</Heading>
            <p>Enzo Rodríguez se registró el 14/07.<br/><span>Revisá sus datos para aprobar la cuenta.</span></p>
          </div>
        </div>
        <span>
          1hr
        </span>
      </li>
      <li v-for="noti in notifications" :key="noti.id"
        class="flex items-center justify-between p-4 rounded-4xl bg-vibrant-light-800"
        @click="handleNotificationClick(noti)">
        <div class="flex items-center gap-5 bg-alert-success-900">
          <figure class="h-18 aspect-square relative">
            <img 
              v-if="noti.senderDetails?.photoURL" 
              :src="noti.senderDetails?.photoURL"
              :alt="noti.senderDetails?.name || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover" />
            <div v-else
              class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
              <!-- <img src="../assets/imagotipo-celeste.png" :alt="noti.senderDetails?.name || 'Reemo Bot' " class="w-10 h-10 rounded-full" /> -->
              <ReemoIcon class="w-15 h-15 rounded-full" />
              <!-- <h3>{{ noti.senderDetails?.name ? noti.senderDetails.name .charAt(0).toUpperCase() : 'R' }}</h3> -->
              <!-- <p> {{ noti.message || 'Ha habido una actualización sobre tu solicitud de alquiler.' }}</p> -->
            </div>
            <span class="absolute bottom-0 right-0">Imagen de usuario</span>
          </figure>
          <div class="flex flex-col gap-2.5">
            <Heading :type="2" class="regular">{{ noti.title || 'Tienes una nueva notificación.' }}</Heading>
            <p>{{ noti.message || 'Tienes una nueva notificación.' }}</p>

          </div>

        </div>
        <!-- Contenedor General para una Notificación -->
          <div class="flex-1 bg-alert-error-700">

            <!-- Emcabezado general -->
            <div class="flex items-center justify-start">
              <p class="text-sm">
                <span v-if="!noti.read" class="inline-block w-2 h-2 mr-2 rounded-full bg-red-500"
                  title="No leído"></span>
                <span class="font-semibold">{{ noti.senderDetails?.name ? noti.senderDetails.name : 'Reemo Bot'
                  }}</span>
                <!-- <span> {{ noti.message }} </span> -->
              </p>
              <span class="text-xs text-gray-400 px-3.5">{{ formatDate(noti.created_at) }}</span>
            </div>

            <!-- Contenido específico por tipo de notificación -->
            <!-- Solicitud de Alquiler (para el propietario del vehículo) -->
            <router-link to="/dashboard" v-if="noti.type === 'rent_request'" class="bg-white rounded-xl shadow p-4 flex flex-col gap-3 mt-2">

              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img v-if="noti.vehicleDetails?.photos" :src="noti.vehicleDetails.photos[1]"
                    :alt="noti.vehicleDetails.basicInfo?.brand" class="w-12 h-12 rounded-full object-cover" />
                  <div v-else
                    class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold">
                    {{ noti.senderDetails?.name ? noti.senderDetails.name.charAt(0).toUpperCase() : 'R' }}
                  </div>

                  <div>
                    <p class="font-semibold text-gray-800">
                      {{ noti.vehicleDetails?.basicInfo?.brand }} {{ noti.vehicleDetails?.basicInfo?.model }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Desde: {{ formatDate(noti.rentDetails?.start_time) }} <br>
                      Hasta: {{ formatDate(noti.rentDetails?.end_time) }}
                    </p>
                  </div>
                </div>

              </div>

              <!-- Precio y estado -->
              <div class="flex items-center justify-between text-sm mt-1">
                <p>
                  <span class="font-medium text-gray-600">Precio:</span>
                  <span class="px-2 py-0.5 text-green-700 ml-1">
                    ${{ noti.rentDetails?.total_price?.toFixed() }}
                  </span>
                </p>
                <p>
                  <span class="font-medium text-gray-600">Estado:</span>
                  <span :class="{
                    'text-yellow-600': noti.rentDetails.status === 'pending',
                    'text-green-600': noti.rentDetails.status === 'confirmed',
                    'text-red-600': ['rejected', 'cancelled_by_user', 'cancelled_by_owner'].includes(noti.rentDetails.status),
                    'text-blue-600': noti.rentDetails.status === 'completed',
                    'text-indigo-600': noti.rentDetails.status === 'in_progress',
                  }" class="font-semibold ml-1">
                    {{
                    noti.rentDetails.status === 'pending' ? 'Pendiente' :
                    noti.rentDetails.status === 'confirmed' ? 'Confirmada' :
                    noti.rentDetails.status === 'rejected' ? 'Rechazada' :
                    noti.rentDetails.status === 'cancelled_by_user' ? 'Cancelada por conductor' :
                    noti.rentDetails.status === 'cancelled_by_owner' ? 'Cancelada por propietario' :
                    noti.rentDetails.status === 'completed' ? 'Completada' :
                    noti.rentDetails.status === 'in_progress' ? 'En progreso' : 'N/A'
                    }}
                  </span>
                </p>
              </div>

            </router-link>


            <!-- Caso: Respuesta a Solicitud de Alquiler (para el conductor que solicitó) -->
            <router-link to="/dashboard" v-else-if="noti.type === 'rent_response'" class="bg-white rounded-xl shadow p-4 flex flex-col gap-3 mt-2">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img v-if="noti.vehicleDetails?.photos && noti.vehicleDetails.photos.length > 0"
                    :src="noti.vehicleDetails.photos[0]" :alt="`Imagen de ${noti.vehicleDetails.basicInfo?.brand}`"
                    class="w-12 h-12 rounded-full object-cover" />
                  <div v-else
                    class="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-white text-lg font-bold">
                    🚗
                  </div>

                  <div>
                    <p class="font-semibold text-gray-800">
                      {{ noti.vehicleDetails?.basicInfo?.brand || 'N/A' }} {{ noti.vehicleDetails?.basicInfo?.model ||
                      'N/A' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Estado:
                      <span :class="{
                        'text-yellow-600': noti.rentDetails.status === 'pending',
                        'text-green-600': noti.rentDetails.status === 'confirmed',
                        'text-red-600': ['rejected', 'cancelled_by_user', 'cancelled_by_owner'].includes(noti.rentDetails.status),
                        'text-blue-600': noti.rentDetails.status === 'completed',
                        'text-indigo-600': noti.rentDetails.status === 'in_progress',
                      }" class="font-semibold ml-1">
                        {{
                          noti.rentDetails.status === 'pending' ? 'Pendiente' :
                          noti.rentDetails.status === 'confirmed' ? 'Confirmada' :
                          noti.rentDetails.status === 'rejected' ? 'Rechazada' :
                          noti.rentDetails.status === 'cancelled_by_user' ? 'Cancelada por el conductor' :
                          noti.rentDetails.status === 'cancelled_by_owner' ? 'Cancelada por el propietario' :
                          noti.rentDetails.status === 'completed' ? 'Completada' :
                          noti.rentDetails.status === 'in_progress' ? 'En progreso' : 'N/A'
                        }}
                      </span>
                    </p>
                  </div>
                </div>

              </div>

              <!-- Fechas -->
              <div class="flex justify-between text-sm mt-1">
                <p class="text-xs text-gray-600">
                  Desde: {{ formatDate(noti.rentDetails.start_time) }}
                </p>
                <p class="text-xs text-gray-600">
                  Hasta: {{ formatDate(noti.rentDetails.end_time) }}
                </p>
              </div>
            </router-link>

            <!-- Caso: Validacion de vehiculo (para el conductor cargo un vehiculo) -->
            <div v-else-if="noti.type === 'car_validated'" class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-800">
                  {{ noti.title || 'Tienes una nueva notificación.' }}
                </h3>
                <p class="text-sm text-gray-700">
                  {{ noti.message || 'Tienes una nueva notificación.' }}
                </p>
              </div>

              <router-link :to="noti.link"
                class="ml-3 bg-secondary-700 hover:bg-primary-900 text-white p-2 rounded-full transition"
                title="Revisar vehículo">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>

            <!-- Caso: invalidacion de vehiculo (para el conductor cargo un vehiculo) -->
            <div v-else-if="noti.type === 'car_invalidated'" class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-800">
                  {{ noti.title || 'Tienes una nueva notificación.' }}
                </h3>
                <p class="text-sm text-gray-700">
                  {{ noti.message || 'Tienes una nueva notificación.' }}
                </p>
              </div>

              <router-link :to="noti.link"
                class="ml-3 bg-secondary-700 hover:bg-primary-900 text-white p-2 rounded-full transition"
                title="Revisar vehículo">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>

            <!-- Caso: Revision de vehiculo por un admin (para el propietario del vehiculo) -->
            <div v-else-if="noti.type === 'car_updated_for_review'" class="flex items-center justify-between">
              <div>
                <h3 class="font-semibold text-gray-800">
                  {{ noti.title || 'Tienes una nueva notificación.' }}
                </h3>
                <p class="text-sm text-gray-700">
                  {{ noti.message || 'Tienes una nueva notificación.' }}
                </p>
              </div>

              <router-link :to="noti.link"
                class="ml-3 bg-secondary-700 hover:bg-primary-900 text-white p-2 rounded-full transition"
                title="Ver detalles">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </router-link>
            </div>

            <div v-else>
              <!-- <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div> -->
              <p class="text-sm text-gray-700">{{ noti.message || 'Tienes una nueva notificación.' }}</p>
            </div>

            <button v-if="noti.responder" class="text-sm text-gray-600 mt-2">Reply</button>
          </div>
      </li>
    </ul>
  </div>
</template>