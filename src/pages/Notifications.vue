<script setup>
import { useAuthStore } from '@/stores';
import { useNotificationStore } from '@/stores/notification.store';
import { addAlert } from '@/services/alerts';
import { useRouter } from 'vue-router';
import { computed, watch, onMounted } from 'vue';
import { formatDateTime } from '@libraries/date.js';

import Heading from '@/components/atoms/Heading.vue';
import Loading from '@/icons/Loading.vue';
import ReemoIcon from '@/icons/ReemoIcon.vue';
import BackButton from '@/components/atoms/BackButton.vue';
import NoNotification from '../components/atoms/NoNotification.vue';
import Input from '@/components/molecules/Input.vue';



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
  if (!timestamp) return "Fecha no disponible";
  return formatDateTime(timestamp);
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

// onMounted(async () => {
//   console.log(notifications.value)
// });

</script> 


<template>

  <div class="w-full md:bg-vibrant-light-600 rounded-[40px] md:m-2.5 px-2 md:px-4 md:py-6 overflow-y-hidden flex flex-col gap-4">
    <!-- Header -->
    <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-4 bg-white md:bg-vibrant-light-600 px-2.5 md:px-0 py-3 md:py-0">
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
    <ul v-if="!isLoading && notifications.length > 0" class="box-vibrant overflow-y-auto h-full md:!pr-2 flex flex-col gap-2 md:gap-4">
      <li v-for="noti in notifications" :key="noti.id"
        class="flex items-center justify-between p-4 rounded-3xl md:rounded-4xl md:gap-6 cursor-pointer hover:bg-vibrant-light-800 focus:bg-vibrant-light-800 active:bg-vibrant-light-900 transition-all duration-200 ease-in-out"
        :class="[
          { 'bg-vibrant-light-700': noti.read},
          { 'bg-vibrant-light-900': !noti.read}
        ]"
        @click="handleNotificationClick(noti)">
        <div class="flex items-center gap-5">
          <figure class="h-12 md:h-18 aspect-square relative">
            <template v-if="noti.type === 'car_invalidated' || noti.type === 'car_validated'">
                <img :src="noti.photo || '../assets/Reemo1x1.png'" 
                     :alt="noti.title || 'Reemo Bot'" 
                     class="bg-white h-full rounded-full object-cover" />

              <span class="absolute bg-vibrant-light-600 bottom-0 right-0 h-6 md:h-8 aspect-square rounded-full overflow-hidden">
              <img src="../assets/Reemo1x1.png"
              :alt="noti.vehicleDetails?.name || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover">
            </span>
            </template>

            <template v-if="noti.type === 'car_updated_for_review' || noti.type === 'new_car_for_review'">
                <img :src="noti.photos[0] || '../assets/Reemo1x1.png'" 
                     :alt="noti.title || 'Reemo Bot'" 
                     class="bg-white h-full rounded-full object-cover" />

              <span class="absolute bg-vibrant-light-600 bottom-0 right-0 h-6 md:h-8 aspect-square rounded-full overflow-hidden">
              <img :src="noti.photoURL"
              :alt="noti.vehicleDetails?.name || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover">
            </span>
            </template>

            <template v-if="noti.type === 'rent_request' || noti.type === 'rent_response'">
                <img :src="noti.vehicleDetails?.photos[0] || '../assets/Reemo1x1.png'" 
                     :alt="noti.vehicleDetails?.basicInfo?.brand || 'Reemo Bot'" 
                     class="bg-white h-full rounded-full object-cover" />

              <span class="absolute bg-vibrant-light-600 bottom-0 right-0 h-6 md:h-8 aspect-square rounded-full overflow-hidden">
              <img :src="noti.senderDetails.photoURL"
              :alt="noti.title || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover">
            </span>
            </template>

            <!-- <img v-if="noti.vehicleDetails?.photos?.length > 0"
              :src="noti.vehicleDetails?.photos[0]"
              :alt="noti.vehicleDetails?.name || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover" />

              <img v-else-if="noti.photos"
              :src="noti.photos[0]"
              :alt="noti.vehicleDetails?.name || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover" />

            <img v-else
              src="../assets/Reemo1x1.png"
              :alt="noti.vehicleDetails?.name || 'Reemo Bot' " 
              class="bg-white h-full rounded-full object-cover" />
           
              <span class="absolute bg-vibrant-light-600 bottom-0 right-0 h-6 md:h-8 aspect-square rounded-full overflow-hidden">
              <img v-if="noti.senderDetails?.photoURL" :src="noti.senderDetails?.photoURL || noti.vehicleDetails?.photos[0]" :alt="noti.senderDetails?.name">
              <img v-else :src="noti.photoURL"
                          :alt="noti.vehicleDetails?.name">
            </span> -->
          </figure>
          <div class="flex flex-col gap-2.5">
            <Heading :type="2" class="text-base md:text-lg">{{ noti.title || 'Tienes una nueva notificación.' }}</Heading>
            <p class="hidden md:block">{{ noti.message || 'Tienes una nueva notificación.' }}</p>
          </div>
        </div>
        <span class="text-background-600 text-xs">{{ formatDate(noti.created_at) }}</span>
      </li>
    </ul>
  </div>
</template>