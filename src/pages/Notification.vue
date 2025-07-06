<script setup>

import Heading from '@/components/atoms/Heading.vue';
import Loading from '@/icons/Loading.vue';
import ReemoIcon from '@/icons/ReemoIcon.vue';
import Input from '../components/molecules/Input.vue';

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

// onMounted(() => {
//   // El listener ya debería estar inicializado por App.vue o un watcher global.
//   // Si por alguna razón no se ha cargado y el usuario está aquí, podemos intentar iniciarlo.
//   if (currentUser.value && currentUser.value.id && !notificationStore.hasLoadedOnce) {
//     console.log("[Notification.vue onMounted] El store no ha cargado, intentando iniciar listener.");
//     notificationStore.initListenerForUser(currentUser.value.id);
//   } else if (!currentUser.value || !currentUser.value.id) {
//      // Si no hay usuario, el store debería estar limpio, pero podemos asegurarlo.
//     if (notificationStore.notifications.length > 0 || notificationStore.isLoading) {
//         notificationStore.clearListenerAndData();
//     }
//     console.warn("[Notification.vue onMounted] No hay usuario autenticado.");
//   }
// });

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

  <div class="w-full mx-auto bg-white rounded-lg shadow p-4 overflow-y-hidden">
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
    <div v-if="!isLoading && notifications.length > 0" class="overflow-y-auto max-h-screen">
      <div v-for="noti in notifications" :key="noti.id"
        class="overflow-y-auto p-6 border-b last:border-b-0 hover:bg-gray-200 rounded-xl cursor-pointer"
        @click="handleNotificationClick(noti)">
        <!-- Contenedor General para una Notificación -->
        <div class="flex items-start space-x-3">
          <img v-if="noti.senderDetails?.photoURL" :src="noti.senderDetails?.photoURL" :alt="noti.senderDetails?.name || 'Reemo Bot' " class="w-10 h-10 rounded-full" />
          <div v-else
          class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
          <!-- <img src="../assets/imagotipo-celeste.png" :alt="noti.senderDetails?.name || 'Reemo Bot' " class="w-10 h-10 rounded-full" /> -->
          <ReemoIcon class="w-15 h-15 rounded-full" />
          <!-- <h3>{{ noti.senderDetails?.name ? noti.senderDetails.name .charAt(0).toUpperCase() : 'R' }}</h3> -->
          <!-- <p> {{ noti.message || 'Ha habido una actualización sobre tu solicitud de alquiler.' }}</p> -->
          </div>
          <div class="flex-1">

            <!-- Emcabezado general -->
            <div class="flex items-center justify-between">
              <p class="text-sm">
                <span v-if="!noti.read" class="inline-block w-2 h-2 mr-2 rounded-full bg-red-500"
                  title="No leído"></span>
                <span class="font-semibold">{{ noti.senderDetails?.name ? noti.senderDetails.name : 'Reemo Bot'
                  }}</span>
                <!-- <span> {{ noti.message }} </span> -->
              </p>
            </div>

            <!-- Contenido específico por tipo de notificación -->
            <!-- Solicitud de Alquiler (para el propietario del vehículo) -->
            <div v-if="noti.type === 'rent_request'">
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div>
              <p class="text-sm text-gray-700">
                {{ noti.message || 'Ha habido una actualización sobre tu solicitud de alquiler.' }}
                <span class="font-medium">{{ noti.vehicleDetails?.basicInfo?.brand || '' }} {{ noti.vehicleDetails?.basicInfo?.model ||
                  'Vehículo no especificado' }}</span>.
              </p>
              <!-- File info -->
              <div v-if="noti.rentDetails" class="mt-3 bg-gray-100 rounded p-3">
                <div class="flex items-center space-x-2 bg-gray-100 rounded px-2 py-1 mt-3">
                  <img v-if="noti.type === 'rent_request' && noti.vehicleDetails?.photos"
                    :src="noti.vehicleDetails.photos[1]" :alt="noti.vehicleDetails.basicInfo?.brand"
                    class="w-12 h-12 rounded-full" />
                  <div v-else
                    class="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center text-white text-xl font-bold">
                    {{ noti.senderDetails?.name ? noti.senderDetails.name.charAt(0).toUpperCase() : 'R' }}
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ noti.vehicleDetails?.basicInfo?.brand || 'N/A' }} {{ noti.vehicleDetails?.basicInfo?.model || 'N/A' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Desde: {{ formatDate(noti.rentDetails?.start_time) }} Hasta: {{
                      formatDate(noti.rentDetails.end_time) }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Precio Total: <span class="text-xs px-2 py-0.5 rounded bg-green-100 border text-green-700">${{
                        noti.rentDetails?.total_price?.toFixed() || 'N/A' }} </span>
                    </p>
                    <p class="text-xs text-gray-500">
                      Estado:
                      <span class="font-semibold" :class="{
                            'text-yellow-600': noti.rentDetails.status === 'pending',
                            'text-green-600': noti.rentDetails.status === 'confirmed',
                            'text-red-600': noti.rentDetails.status === 'rejected' || noti.rentDetails.status === 'cancelled_by_user' || noti.rentDetails.status === 'cancelled_by_owner',
                            'text-blue-600': noti.rentDetails.status === 'completed',
                            'text-indigo-600': noti.rentDetails.status === 'in_progress',
                          }">
                        {{ 
                          noti.rentDetails.status === "pending" ? "Pendiente" : 
                          noti.rentDetails.status === "confirmed" ? "Confirmada" : 
                          noti.rentDetails.status === "rejected" ? "Rechazada" : 
                          noti.rentDetails.status === "cancelled_by_user" ? "Cancelada por el conductor" : 
                          noti.rentDetails.status === "cancelled_by_owner" ? "Cancelada por el propietario" : 
                          noti.rentDetails.status === "completed" ? "Completado" : 
                          noti.rentDetails.status === "in_progress" ? "En progreso" : "N/A" }}
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
                  <img v-if="noti.vehicleDetails?.photos && noti.vehicleDetails.photos.length > 0"
                    :src="noti.vehicleDetails.photos[0]" :alt="`Imagen de ${ noti.vehicleDetails.basicInfo?.brand }`"
                    class="w-12 h-12 rounded-md object-cover" />
                  <div v-else
                    class="w-12 h-12 rounded-md bg-gray-200 flex items-center justify-center text-xs text-gray-400">Sin
                    foto</div>
                  <div>
                    <p class="text-sm font-medium text-gray-800">
                      {{ noti.vehicleDetails?.basicInfo?.brand || 'N/A' }} {{ noti.vehicleDetails?.basicInfo?.model || 'N/A' }}
                    </p>
                    <p class="text-xs text-gray-500">
                      Estado:
                      <span class="font-semibold" :class="{
                            'text-yellow-600': noti.rentDetails.status === 'pending',
                            'text-green-600': noti.rentDetails.status === 'confirmed',
                            'text-red-600': noti.rentDetails.status === 'rejected' || noti.rentDetails.status === 'cancelled_by_user' || noti.rentDetails.status === 'cancelled_by_owner',
                            'text-blue-600': noti.rentDetails.status === 'completed',
                            'text-indigo-600': noti.rentDetails.status === 'in_progress',
                          }">
                        {{ 
                          noti.rentDetails.status === "pending" ? "Pendiente" : 
                          noti.rentDetails.status === "confirmed" ? "Confirmada" : 
                          noti.rentDetails.status === "rejected" ? "Rechazada" : 
                          noti.rentDetails.status === "cancelled_by_user" ? "Cancelada por el conductor" : 
                          noti.rentDetails.status === "cancelled_by_owner" ? "Cancelada por el propietario" : 
                          noti.rentDetails.status === "completed" ? "Completada" : 
                          noti.rentDetails.status === "in_progress" ? "En progreso" : "N/A" }}
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

            <div v-else-if="noti.type === 'car_validated'">
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.createdAt || noti.created_at) }}</div>
              <a :href="noti.link" class="text-sm text-gray-700 block">
                <h3>{{ noti.title || 'Tienes una nueva notificación.' }}</h3>
                <p class="text-sm text-gray-700">
                  {{ noti.message || 'Tienes una nueva notificación.' }}
                </p>
              </a>
            </div>

            <div v-else-if="noti.type === 'car_invalidated'">
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.createdAt || noti.created_at) }}</div>
                <h3>{{ noti.title || 'Tienes una nueva notificación.' }}</h3>
                <p class="text-sm text-gray-700">
                  {{ noti.message || 'Tienes una nueva notificación.' }}
                  <!-- <a :href="noti.link" class="text-sm text-red-700 block">Revisar vehiculo</a> -->
                </p>
                <div class="flex space-x-2 mt-3 w-2xs h-2xs relative">
                <Input
                  type="button"
                  variant="primary"
                  text="Revisar"
                  :href="noti.link"
                  />
                </div>
            </div>

            <div v-else-if="noti.type === 'car_updated_for_review'">
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.createdAt || noti.created_at) }}</div>
              <h3>{{ noti.title || 'Tienes una nueva notificación.' }}</h3>
              <p class="text-sm text-gray-700">
                {{ noti.message || 'Un vehículo ha sido actualizado y requiere tu atención.' }}
              </p>
              <div class="flex space-x-2 mt-3 w-2xs h-2xs relative">
              <Input
                type="button"
                variant="primary"
                text="Verificar"
                :href="noti.link"
                />
              </div>
            </div>
              


            <!-- Caso: Otro tipo de notificación (genérico) -->
            <div v-else>
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(noti.created_at) }}</div>
              <p class="text-sm text-gray-700">{{ noti.message || 'Tienes una nueva notificación.' }}</p>
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


  <!-- <div class="flex h-screen">
    <aside class="w-64 bg-white border-r flex flex-col p-4">
      <h1 class="text-2xl font-bold mb-6">Mails</h1>
      <nav class="flex-1 space-y-2">
        <button class="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-gray-100" v-for="item in items"
          :key="item.label">
          <span>{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-6 border-t pt-4 space-y-2 text-sm">
        <p class="font-medium">Other</p>
        <button v-for="tag in tags" :key="tag" class="text-gray-600 hover:text-primary">
          {{ tag }}
        </button>
      </div>

      <div class="mt-auto pt-6 border-t">
        <div class="text-xs text-gray-500 mb-2">Free Version</div>
        <div class="bg-gray-200 h-2 rounded-full w-full mb-3">
          <div class="bg-primary h-2 rounded-full w-2/3"></div>
        </div>
        <button class="w-full bg-primary text-white py-2 rounded-xl text-sm">Upgrade to PRO 🚀</button>
      </div>
    </aside>
    <div class="flex flex-col flex-1">
      <div class="flex items-center p-4 border-b bg-white gap-3 flex-wrap">
        <div class="flex gap-2">
          <input type="checkbox" />
          <button class="bg-gray-100 p-2 rounded-lg">🏷️</button>
          <button class="bg-gray-100 p-2 rounded-lg">📦</button>
          <button class="bg-gray-100 p-2 rounded-lg">🗑️</button>
        </div>

        <div class="flex-1 flex gap-2 justify-end items-center">
          <input type="text" placeholder="Search" class="border text-sm rounded-lg px-3 py-2" />
          <button class="bg-gray-100 p-2 rounded-lg">⚙️</button>
          <button class="bg-gray-100 p-2 rounded-lg">↻</button>
          <span>1 of 15</span>
          <button class="bg-gray-100 p-2 rounded-lg">←</button>
          <button class="bg-gray-100 p-2 rounded-lg">→</button>
        </div>
      </div>

      <div class="overflow-y-auto flex-1">
        <div class="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer gap-3">
          <input type="checkbox" />
          <span class="text-gray-400">🔖</span>
          <div class="relative">
            <img :src="mails.avatar" class="w-10 h-10 rounded-full" />
            <span v-if="mails.unread" class="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
          </div>
          <div class="flex-1">
            <p class="font-medium text-gray-900">{{ mails.name }}</p>
            <p class="text-gray-500 text-sm truncate">{{ mails.subject }}</p>
          </div>
            <span class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
              {{ mails.label }}
            </span>
          <span class="text-gray-500 text-sm">{{ mails.date }}</span>
        </div>
      </div>

    </div>
  </div> -->

</template>