<script setup>
import { ref, onMounted, computed, watch } from 'vue';

import { useAuthStore } from '@/stores';
import { useRouter } from 'vue-router';
import { fetchRentedCars, fetchLatestActiveOwnedRental, updateRentalStatus } from '@/services/rentedCarService';
import { addAlert } from '@/services/alerts';
import Loading from '@/icons/Loading.vue';

const authStore = useAuthStore();
// const rentalApplications = ref([]);
const router = useRouter();
const driverRentalDetail = ref(null);
const ownerRentalDetail = ref(null);
const isLoading = ref(true);
const errorLoading = ref(null);

const currentUser = computed(() => authStore.user);

const loadRentalData = async () => {
  console.log('[RentStatusDetails] loadRentalData llamado.');
  if (!currentUser.value || !currentUser.value.id) {
    console.warn('[RentStatusDetails] Usuario no encontrado o sin ID. currentUser:', currentUser.value);
    errorLoading.value = "Usuario no encontrado";
    driverRentalDetail.value = null;
    ownerRentalDetail.value = null;
    isLoading.value = false;
    return;
  }
  console.log('[RentStatusDetails] Estableciendo isLoading a true. Usuario ID:', currentUser.value.id);
  isLoading.value = true;
  errorLoading.value = null;
  driverRentalDetail.value = null;
  ownerRentalDetail.value = null;

  try {
    const userId = currentUser.value.id;
    console.log('[RentStatusDetails] id de currentUser:', userId);

    // Cargar ambos conjuntos de datos en paralelo
    const [driverRentals, ownerRental] = await Promise.all([
      fetchRentedCars(userId), // Devuelve un array, tomamos el primero si existe
      fetchLatestActiveOwnedRental(userId) // Devuelve un objeto o null
    ]);

    driverRentalDetail.value = driverRentals && driverRentals.length > 0 ? driverRentals[0] : null;
    ownerRentalDetail.value = ownerRental;
    console.log('[RentStatusDetails] fetchRentedCars (driver) completado. Resultado:', JSON.parse(JSON.stringify(driverRentalDetail.value)));
    console.log('[RentStatusDetails] fetchLatestActiveOwnedRental (owner) completado. Resultado:', JSON.parse(JSON.stringify(ownerRentalDetail.value)));
  } catch (error) {
    console.error('[RentStatusDetails.vue] Error al cargar solicitudes de alquiler: ', error);
    errorLoading.value = 'No se pudieron cargar las solicitudes de alquiler';
  } finally {
    isLoading.value = false;
  }
};


const cancelDriverApplication = async (rentalId) => {
  if (!confirm("¿Estás seguro de que quieres cancelar esta solicitud?")) {
    return;
  }

  try {
    // el auto vuelve a estar disponible si se cancela una solicitud pendiente
    // en updateRentalStatus ya manejamos la lógica de isAvailable: true para 'cancelled_by_user'
    await updateRentalStatus(rentalId, 'cancelled_by_user');
    addAlert("Solicitud de alquiler cancelada correctamente.", "success");

    if (driverRentalDetail.value && driverRentalDetail.value.id === rentalId) {
      driverRentalDetail.value.status = 'cancelled_by_user';
    }
    // podriamos notificar al propietario sobre la cancelación.
    // Esto requeriría una función similar a createRentalRequestNotification
  } catch (error) {
    console.error('[RentStatusDetails.vue] Error al cancelar la solicitud', error);
    addAlert("Error al cancelar la solicitud", "error");
  }
};

const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  // Asume que timestamp es un string como "YYYY-MM-DDTHH:MM:SS" o un objeto Timestamp de Firestore
  let date;
  if (timestamp.seconds) { // Es un Timestamp de Firestore
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return 'Fecha inválida';
  }
  return date.toLocaleString(); // O un formato más específico
};

const getStatusClass = (status) => {
  switch (status) {
    case 'pending': return 'text-yellow-600 bg-yellow-100';
    case 'confirmed': return 'text-green-600 bg-green-100';
    case 'rejected': return 'text-red-600 bg-red-100';
    case 'cancelled_by_user': return 'text-red-600 bg-red-100';
    case 'in_progress': return 'text-indigo-600 bg-indigo-100';
    case 'completed': return 'text-blue-600 bg-blue-100';
    default: return 'text-gray-500 bg-gray-50';
  }
}
function navigateToRentalDetails(rentalId){
  if (rentalId) {
    router.push(`/rental-details/${rentalId}`);
  }
}

onMounted (() => {
  // Es importante que authStore.init() se llame en un lugar central de tu aplicación
  if(!authStore.isInitialized){
    console.warn("[RentStatusDetails] authStore no está inicializado. Asegúrate de llamar a authStore.init() al inicio de la aplicación.");
  }
});

watch(currentUser, (newUser, oldUser) => {
  console.log('[RentStatusDetails] Watch currentUser. Nuevo ID:', newUser?.id, 'Antiguo ID:', oldUser?.id);
  if(newUser?.id) {
    loadRentalData();
  } else if(oldUser?.id && !newUser?.id) {
    // El usuario se ha deslogueado o el ID ha desaparecido (por ejemplo, al finalizar la inicialización y no hay usuario)
    console.log('[RentStatusDetails] currentUser ya no tiene ID (o nunca tuvo). Limpiando solicitudes.');
    driverRentalDetail.value = null;
    ownerRentalDetail.value = null;
    isLoading.value = false; 
    errorLoading.value = null;
  } else if (!newUser?.id && authStore.isInitialized && !isLoading.value && !errorLoading.value) {
    // Si el store está inicializado, no hay usuario, y no estamos ya cargando/con error, significa que no hay datos que cargar.
    isLoading.value = false;
  }
}, { immediate: true });

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
    <p>No tienes alquileres activos o pendientes en este momento.</p>
  </div>

    <div v-else class="space-y-6">
    <!-- Sección: Alquileres como Conductor -->
    <div v-if="driverRentalDetail" class="bg-white text-black w-full max-w-md flex flex-col rounded-xl shadow-lg p-4 mx-auto">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="rounded-full w-4 h-4 border border-purple-500"></div>
          <div class="text-md font-bold">
            <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize" :class="getStatusClass(driverRentalDetail.status)">
              {{ driverRentalDetail.status.replace('_', ' ') }}
            </span>
          </div>
        </div>
      </div>
      <div class="mt-4 text-gray-500 font-bold text-sm">
        <div class="grid grid-cols-6 items-center">
          <div class="flex-shrink-0">
            <img v-if="driverRentalDetail.vehicleDetails?.images && driverRentalDetail.vehicleDetails.images.length > 0"
              :src="driverRentalDetail.vehicleDetails.images[0]"
              :alt="`Imagen de ${driverRentalDetail.vehicleDetails?.marca} ${driverRentalDetail.vehicleDetails?.modelo}`"
              class="h-14 w-14 rounded-full object-cover" />
            <div v-else class="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
          </div>
          <div class="col-span-3 px-3 flex flex-col">
            <p v-if="driverRentalDetail.vehicleDetails"><strong>Vehículo:</strong> {{ driverRentalDetail.vehicleDetails.marca }} {{ driverRentalDetail.vehicleDetails.modelo }}</p>
            <p><strong>Propietario:</strong> {{ driverRentalDetail.ownerDetails?.name || 'No disponible' }}</p>
            <p><strong>Inicia:</strong> {{ formatDate(driverRentalDetail.start_time) }}</p>
            <p><strong>Total:</strong> ${{ driverRentalDetail.total_price?.toFixed(2) || 'N/A' }}</p>
          </div>
          <div class="col-span-2 py-2 justify-self-end flex flex-col items-end space-y-2">
            <button v-if="driverRentalDetail.status === 'pending'"
              @click="cancelDriverApplication(driverRentalDetail.id)"
              class="bg-gray-200 text-gray-900 font-bold text-xs rounded-full py-1 px-3">
              Cancelar
            </button>
            <p v-if="driverRentalDetail.status === 'confirmed'" class="text-xs text-green-600 text-right">¡Solicitud aceptada! Contacta al propietario.</p>
          </div>
        </div>
        <button
          v-if="driverRentalDetail.status === 'confirmed' || driverRentalDetail.status === 'in_progress' || driverRentalDetail.status === 'completed'"
          @click="navigateToRentalDetails(driverRentalDetail.id)"
          class="mt-4 w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Ver Detalles del Alquiler
        </button>
      </div>
    </div>

        <!-- Sección: Vehículos Propios Alquilados -->
    <div v-if="ownerRentalDetail" class="bg-white text-black w-full max-w-md flex flex-col rounded-xl shadow-lg p-4 mx-auto mt-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="rounded-full w-4 h-4 border border-teal-500"></div>
          <div class="text-md font-bold">
            <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize" :class="getStatusClass(ownerRentalDetail.status)">
              {{ ownerRentalDetail.status.replace('_', ' ') }}
            </span>
          </div>
        </div>
      </div>
      <div class="mt-4 text-gray-500 font-bold text-sm">
        <div class="grid grid-cols-6 items-center">
          <div class="flex-shrink-0">
            <img v-if="ownerRentalDetail.vehicleDetails?.images && ownerRentalDetail.vehicleDetails.images.length > 0"
              :src="ownerRentalDetail.vehicleDetails.images[0]"
              :alt="`Imagen de ${ownerRentalDetail.vehicleDetails?.marca} ${ownerRentalDetail.vehicleDetails?.modelo}`"
              class="h-14 w-14 rounded-full object-cover" />
            <div v-else class="h-14 w-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xs">No img</div>
          </div>
          <div class="col-span-3 px-3 flex flex-col">
            <p v-if="ownerRentalDetail.vehicleDetails"><strong>Vehículo:</strong> {{ ownerRentalDetail.vehicleDetails.marca }} {{ ownerRentalDetail.vehicleDetails.modelo }}</p>
            <p><strong>Inquilino:</strong> {{ ownerRentalDetail.driverDetails?.name || 'No disponible' }}</p>
            <p><strong>Inicia:</strong> {{ formatDate(ownerRentalDetail.start_time) }}</p>
            <p><strong>Total:</strong> ${{ ownerRentalDetail.total_price?.toFixed(2) || 'N/A' }}</p>
          </div>
           <div class="col-span-2 py-2 justify-self-end flex flex-col items-end space-y-2">
            <p v-if="ownerRentalDetail.status === 'pending'" class="text-xs text-yellow-600 text-right">Solicitud pendiente para tu vehículo.</p>
            <!-- Aquí podrías añadir botones para Aceptar/Rechazar si la gestión se hace desde UserProfile -->
          </div>
        </div>
        <button
          v-if="ownerRentalDetail.status === 'confirmed' || ownerRentalDetail.status === 'in_progress' || ownerRentalDetail.status === 'completed'"
          @click="navigateToRentalDetails(ownerRentalDetail.id)"
          class="mt-4 w-full bg-secondary-500 hover:bg-secondary-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out"
        >
          Ver Detalles del Alquiler
        </button>
      </div>
    </div>
  </div>

</template>