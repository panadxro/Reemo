<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';

import { useAuthStore } from '@/stores';
import { useRouter } from 'vue-router';
import { useNotificationStore } from '@/stores/notification.store';

import { fetchRentedCars, fetchLatestActiveOwnedRental, updateRentalStatus } from '@/services/rentedCarService';
import { addAlert } from '@/services/alerts';
import Loading from '@/icons/Loading.vue';
import Heading from '@/components/atoms/Heading.vue';
import Status from '@/components/molecules/Status.vue';
import Input from '@/components/molecules/Input.vue';
import Modal from '@/components/molecules/Modal.vue';

const authStore = useAuthStore(); 
const notificationStore = useNotificationStore(); 
// const rentalApplications = ref([]);
const router = useRouter();
const driverRentalDetail = ref(null);
const ownerRentalDetail = ref(null);
const isLoading = ref(true);
const errorLoading = ref(null);
const showCancelModal = ref(false);
const pendingCancelId = ref(null);

const driverUnsubscribe = ref(null);
const ownerUnsubscribe = ref(null);

const currentUser = computed(() => authStore.user);
const notifications = computed(() => notificationStore.sortedNotifications);

// const loadRentalData = async () => {
  //console.log('[RentStatusDetails] loadRentalData llamado.');
  // if (!currentUser.value || !currentUser.value.id) {
  //   console.warn('[RentStatusDetails] Usuario no encontrado o sin ID. currentUser:', currentUser.value);
  //   errorLoading.value = "Usuario no encontrado";
  //   driverRentalDetail.value = null;
  //   ownerRentalDetail.value = null;
  //   isLoading.value = false;
  //   return;
  // }
  //console.log('[RentStatusDetails] Estableciendo isLoading a true. Usuario ID:', currentUser.value.id);

  // Función para limpiar los listeners y resetear los datos
  const cleanupListeners = () => {
    if (driverUnsubscribe.value) {
      // driverUnsubscribe.value();
      driverUnsubscribe.value = null;
    }
    if (ownerUnsubscribe.value) {
      // ownerUnsubscribe.value();
      ownerUnsubscribe.value = null;
    }
    driverRentalDetail.value = null;
    ownerRentalDetail.value = null;
    isLoading.value = false;
    errorLoading.value = null;
  };
  // Función para configurar los listeners en tiempo real
  const setupListeners = (userId) => {
  cleanupListeners(); // Limpia listeners anteriores antes de crear nuevos

  isLoading.value = true;
  errorLoading.value = null;
  // Listener para alquileres como conductor
  driverUnsubscribe.value = fetchRentedCars(userId, (data, error) => {
    if (error) {
      console.error('[RentStatusDetails] Error en listener de conductor:', error);
      errorLoading.value = 'No se pudo cargar tu solicitud de alquiler.';
      driverRentalDetail.value = null;
    } else {
      driverRentalDetail.value = data;
    }
    // Solo dejamos de cargar cuando ambos listeners han respondido al menos una vez
    if (ownerUnsubscribe.value) isLoading.value = false;
  });

  // Listener para alquileres como propietario
  ownerUnsubscribe.value = fetchLatestActiveOwnedRental(userId, (data, error) => {
    if (error) {
      console.error('[RentStatusDetails] Error en listener de propietario:', error);
      errorLoading.value = 'No se pudo cargar la solicitud de tu vehículo.';
      ownerRentalDetail.value = null;
    } else {
      ownerRentalDetail.value = data;
    }
    // Solo dejamos de cargar cuando ambos listeners han respondido al menos una vez
    if (driverUnsubscribe.value) isLoading.value = false;
  });
};

const handleRentalAction = async (rentId, newStatus, driverId, ownerId) => {
    try {
      // 1. Actualizamos el estado directamente.
      await updateRentalStatus(rentId, newStatus);
      
      // 2. Mantenemos la lógica de notificaciones.
      await notificationStore.handleRentalAction({ rentId, newStatus, senderId: driverId, vehicleOwnerId: ownerId });

      addAlert(`Solicitud ${newStatus === 'confirmed' ? 'aceptada' : 'rechazada'} correctamente.`, 'success');
      // El listener en tiempo real actualizará la UI automáticamente.
    }  catch (error) {
    console.error("Error al procesar la solicitud de alquiler:", error);
    addAlert("Error al procesar la accion", "error");
  }
};

const cancelDriverApplication = (rentalId) => {
  pendingCancelId.value = rentalId;
  showCancelModal.value = true;
};

const confirmCancelDriverApplication = async () => {
  const rentalId = pendingCancelId.value;
  
  try {
    // el auto vuelve a estar disponible si se cancela una solicitud pendiente
    // en updateRentalStatus ya manejamos la lógica de isAvailable: true para 'cancelled_by_user'
    await updateRentalStatus(rentalId, 'cancelled_by_user');
    addAlert("Solicitud de alquiler cancelada correctamente.", "success");

    // if (driverRentalDetail.value && driverRentalDetail.value.id === rentalId) {
    //   driverRentalDetail.value.status = 'cancelled_by_user';
    // }

  } catch (error) {
    console.error('[RentStatusDetails.vue] Error al cancelar la solicitud', error);
    addAlert("Error al cancelar la solicitud", "error");
  } finally {
    showCancelModal.value = false;
    pendingCancelId.value = null;
  }
};

function navigateToRentalDetails(rentalId){
  if (rentalId) {
    router.push(`/rent/${rentalId}`);
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('es-AR', options).replace(',', '');
};

const formatPrice = (price) => {
  return Math.round(price).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
};

// Observa cambios en el usuario (login/logout) para iniciar o detener los listeners
watch(currentUser, (newUser, oldUser) => {
  if (newUser && newUser.id) {
    // Si hay un nuevo usuario (o es el mismo pero se recarga), configuramos los listeners
    if (newUser.id !== oldUser?.id) {
      setupListeners(newUser.id);
    }
  } else {
    // Si no hay usuario (logout), limpiamos todo
    cleanupListeners();
  }
}, { immediate: true });

// Limpiar los listeners cuando el componente se desmonte para evitar fugas de memoria
onUnmounted(() => {
  cleanupListeners();
});

</script>

<template>

  <div v-if="isLoading" class="flex justify-center items-center p-10">
    <Loading class="h-12 w-12 text-secondary-500" />
    <p class="ml-4 text-gray-600">Cargando tus solicitudes...</p>
  </div>
  <div v-else-if="errorLoading" class="text-center text-red-400 p-4">
    {{ errorLoading }}
  </div>
  <div v-else-if="!driverRentalDetail && !ownerRentalDetail" class="text-center text-gray-500 p-4">
    <div class="text-white flex flex-col items-center justify-center">
      <img src="@/assets/car-history.png" alt="History Car" class="max-w-[150px] mx-auto mb-4" />
      <Heading :type="3" class="text-center">No hay registros de solicitudes.</Heading>
      <router-link to="/search" class="mt-4 px-4 py-2 rounded-lg text-primary-900 bg-secondary-300 hover:bg-primary-700 hover:text-white transition-all duration-300 w-fit font-black">
        <span class="font-bold">Alquilá un auto</span>
      </router-link>
    </div>
  </div>

  <ul v-else class="flex flex-col gap-4 overflow-y-auto !pr-2">
  <!-- Driver Rental Detail -->
  <li v-if="driverRentalDetail" class="bg-white flex gap-2 min-h-25 rounded-2xl px-2.5 py-2">
    <div class="relative flex items-center">
      <Status class="absolute top-0 left-1" size="mini" :status="driverRentalDetail.status" />
      <img 
        v-if="driverRentalDetail.vehicleDetails?.photos && driverRentalDetail.vehicleDetails.photos.length > 0"
        :src="driverRentalDetail.vehicleDetails.photos[0]"
        :alt="`Imagen de ${driverRentalDetail.vehicleDetails?.basicInfo.brand} ${driverRentalDetail.vehicleDetails?.basicInfo.model}`"
        class="object-cover rounded-lg w-25 h-15"
      />
      <div v-else class="w-25 h-15 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
      
      <img 
        :src="driverRentalDetail.ownerDetails?.photoURL" 
        :alt="driverRentalDetail.ownerDetails?.name"
        class="absolute bottom-0 right-1 w-8 h-8 object-cover rounded-full bg-white"
      />
    </div>

    <div class="flex justify-between py-2 text-gray-500 font-medium text-xs flex-1">
      <div>
        <Heading :type="4" class="small">
        {{ driverRentalDetail.vehicleDetails?.basicInfo.brand || 'Marca no disponible' }} 
        {{ driverRentalDetail.vehicleDetails?.basicInfo.model || 'Modelo no disponible' }}
      </Heading>
      <p>{{ formatDate(driverRentalDetail.start_time) }}</p>
      <p>${{ formatPrice(driverRentalDetail.total_price || 0) }}</p>
      <p>Propietario: {{ driverRentalDetail.ownerDetails?.name || 'No disponible' }}</p>
      </div>
      
      <div class="flex items-center justify-between mt-2">
        <div class="flex gap-2">
          <!-- <button v-if="driverRentalDetail.status === 'pending'"
            @click="cancelDriverApplication(driverRentalDetail.id)"
            class="bg-gray-200 text-gray-900 font-bold text-xs rounded-full py-1 px-3">
            Cancelar
          </button> -->
          <Input
            v-if="driverRentalDetail.status === 'pending'"
            type="button"
            variant="secondary"
            outline
            text="Cancelar solicitud"
            @click.stop="cancelDriverApplication(driverRentalDetail.id)"
          />
          <Modal
            :isOpen="showCancelModal"
            title="Cancelar solicitud"
            message="¿Estás seguro de que quieres cancelar esta solicitud?"
            confirmText="Si, cancelar"
            cancelText="No, mantener"
            @close="showCancelModal = false"
            @confirm="confirmCancelDriverApplication"
          />
          <!-- <p v-if="driverRentalDetail.status === 'confirmed'" class="text-xs text-green-600">¡Solicitud aceptada!</p> -->
        </div>
        
        <!-- <button
          v-if="driverRentalDetail.status === 'confirmed' || driverRentalDetail.status === 'in_progress' || driverRentalDetail.status === 'completed'"
          @click="navigateToRentalDetails(driverRentalDetail.id)"
          class="bg-[#0a0a3c] hover:bg-secondary-800 text-white font-bold py-1 px-3 rounded-lg transition duration-150 ease-in-out cursor-pointer text-xs"
        >
          Ver detalles
        </button> -->
        <Input
            v-if="driverRentalDetail.status === 'confirmed' || driverRentalDetail.status === 'in_progress' || driverRentalDetail.status === 'completed'"
            type="button"
            variant="primary"
            text="Ver Detalles"
            @click="navigateToRentalDetails(driverRentalDetail.id)"
          />
      </div>
    </div>
  </li>

  <!-- Owner Rental Detail -->
  <li v-if="ownerRentalDetail" class="bg-white flex gap-2 min-h-25 rounded-2xl px-2.5 py-2 cursor-pointer">
    <div class="relative flex items-center">
      <Status class="absolute top-0 left-1" size="mini" :status="ownerRentalDetail.status" />
      <img 
        v-if="ownerRentalDetail.vehicleDetails?.photos && ownerRentalDetail.vehicleDetails.photos.length > 0"
        :src="ownerRentalDetail.vehicleDetails.photos[0]"
        :alt="`Imagen de ${ownerRentalDetail.vehicleDetails?.basicInfo.brand} ${ownerRentalDetail.vehicleDetails?.basicInfo.model}`"
        class="object-cover rounded-lg w-25 h-15"
      />
      <div v-else class="w-25 h-15 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
      
      <img 
        :src="ownerRentalDetail.driverDetails?.photoURL || defaultUserImage" 
        :alt="ownerRentalDetail.driverDetails?.name"
        class="absolute bottom-0 right-1 w-8 h-8 object-cover rounded-full bg-white"
      />
    </div>

    <div class="flex justify-between py-2 text-gray-500 font-medium text-xs flex-1">
      <div>
        <Heading :type="4" class="small">
        {{ ownerRentalDetail.vehicleDetails?.basicInfo.brand || 'Marca no disponible' }} 
        {{ ownerRentalDetail.vehicleDetails?.basicInfo.model || 'Modelo no disponible' }}
      </Heading>
      <p>{{ formatDate(ownerRentalDetail.start_time) }}</p>
      <p>${{ formatPrice(ownerRentalDetail.total_price || 0) }}</p>
      <p>Inquilino: {{ ownerRentalDetail.driverDetails?.name || 'No disponible' }}</p>
      </div>
      
      <div class="flex items-center justify-between mt-2">
        <div class="flex gap-2">
          <div class="flex space-x-2" v-if="ownerRentalDetail.status === 'pending' && currentUser?.id === ownerRentalDetail.owner_id">
            <!-- <button
              @click="handleRentalAction(ownerRentalDetail.id, 'confirmed', ownerRentalDetail.driverDetails.id, ownerRentalDetail.owner_id)"
              class="text-xs px-2 py-1 rounded border text-gray-700 cursor-pointer">Aceptar</button>
            <button
              @click="handleRentalAction(ownerRentalDetail.id, 'rejected', ownerRentalDetail.driverDetails.id, ownerRentalDetail.owner_id)"
              class="text-xs px-2 py-1 rounded bg-black text-white cursor-pointer">Rechazar</button> -->
              <Input
                type="button"
                variant="primary"
                text="Aceptar"
                @click="handleRentalAction(ownerRentalDetail.id, 'confirmed', ownerRentalDetail.driverDetails.id, ownerRentalDetail.owner_id)"/>
                <Input
                type="button"
                variant="secondary"
                outline
                text="Cancelar"
                @click="handleRentalAction(ownerRentalDetail.id, 'rejected', ownerRentalDetail.driverDetails.id, ownerRentalDetail.owner_id)"/>
          </div>
        </div>
        
        <!-- <button
          v-if="ownerRentalDetail.status === 'confirmed' || ownerRentalDetail.status === 'in_progress' || ownerRentalDetail.status === 'completed'"
          @click="navigateToRentalDetails(ownerRentalDetail.id)"
          class="bg-[#0a0a3c] hover:bg-secondary-800 text-white font-bold py-1 px-3 rounded-lg transition duration-150 ease-in-out cursor-pointer text-xs"
        >
          Ver detalles
        </button> -->
        <Input
            v-if="ownerRentalDetail.status === 'confirmed' || ownerRentalDetail.status === 'in_progress' || ownerRentalDetail.status === 'completed'"
            type="button"
            variant="primary"
            text="Ver Detalles"
            @click="navigateToRentalDetails(ownerRentalDetail.id)"
          />
      </div>
    </div>
  </li>
</ul>

</template>