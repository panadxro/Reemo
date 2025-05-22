<script setup>
import { ref, onMounted, computed, watch } from 'vue';

import { useAuthStore } from '@/stores';
import { fetchRentedCars, updateRentalStatus } from '@/services/rentedCarService';
import { addAlert } from '@/services/alerts';
import Loading from '@/icons/Loading.vue';

const authStore = useAuthStore();
const rentalApplications = ref([]);
const isLoading = ref(true);
const errorLoading = ref(null);

const currentUser = computed(() => authStore.user);

const loadRentalApplications = async () => {
  console.log('[RentStatusDetails] loadRentalApplications llamado.');
  if (!currentUser.value || !currentUser.value.id) {
    console.warn('[RentStatusDetails] Usuario no encontrado o sin ID. currentUser:', currentUser.value);
    errorLoading.value = "Usuario no encontrado";
    isLoading.value = false;
    return;
  }
  console.log('[RentStatusDetails] Estableciendo isLoading a true. Usuario ID:', currentUser.value.id);
  isLoading.value = true;
  errorLoading.value = null;

  try {
    console.log('[RentStatusDetails] id de currentUser:', currentUser.value.id);
    rentalApplications.value = await fetchRentedCars(currentUser.value.id);
    console.log('[RentStatusDetails] fetchRentedCars completado. Resultado:', JSON.parse(JSON.stringify(rentalApplications.value)));
  } catch (error) {
    console.error('[RentStatusDetails.vue] Error al cargar solicitudes de alquiler: ', error);
    errorLoading.value = 'No se pudieron cargar las solicitudes de alquiler';
  } finally {
    isLoading.value = false;
  }
};

const cancelApplication = async (rentalId) => {
  if (!confirm("¿Estás seguro de que quieres cancelar esta solicitud?")) {
    return;
  }

  try {
    // el auto vuelve a estar disponible si se cancela una solicitud pendiente
    // en updateRentalStatus ya manejamos la lógica de isAvailable: true para 'cancelled_by_user'
    await updateRentalStatus(rentalId, 'cancelled_by_user');
    addAlert("Solicitud de alquiler cancelada correctamente.", "success");
    // Actualizar la lista localmente o recargar
    const index = rentalApplications.value.findIndex(app => app.id === rentalId);
    if (index !== -1){
      rentalApplications.value[index].status = 'cancelled_by_user';
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

onMounted (() => {
  // Es importante que authStore.init() se llame en un lugar central de tu aplicación
  if(!authStore.isInitialized){
    console.warn("[RentStatusDetails] authStore no está inicializado. Asegúrate de llamar a authStore.init() al inicio de la aplicación.");
  }
});

watch(currentUser, (newUser, oldUser) => {
  console.log('[RentStatusDetails] Watch currentUser. Nuevo ID:', newUser?.id, 'Antiguo ID:', oldUser?.id);
  if(newUser?.id) {
    loadRentalApplications();
  } else if(oldUser?.id && !newUser?.id) {
    // El usuario se ha deslogueado o el ID ha desaparecido (por ejemplo, al finalizar la inicialización y no hay usuario)
    console.log('[RentStatusDetails] currentUser ya no tiene ID (o nunca tuvo). Limpiando solicitudes.');
    rentalApplications.value = [];
    isLoading.value = false; 
    errorLoading.value = null;
  } else if (!newUser?.id && authStore.isInitialized && !isLoading.value && !errorLoading.value) {
    // Si el store está inicializado, no hay usuario, y no estamos ya cargando/con error, significa que no hay datos que cargar.
    isLoading.value = false;
  }
}, { immediate: true });

</script>

<template>
<!-- 
  <div class="p-4 md:p-6">
    <h2 class="text-2xl font-semibold text-gray-800 mb-6">Mis Solicitudes de Alquiler</h2>

    <div v-if="isLoading" class="flex justify-center items-center p-10">
      <Loading class="h-12 w-12 text-secondary-500" />
      <p class="ml-4 text-gray-600">Cargando tus solicitudes...</p>
    </div>

    <div v-if="!isLoading && errorLoading" class="text-center p-10 text-red-500">
      {{ errorLoading }}
    </div>

    <div v-if="!isLoading && !rentalApplications.length && !errorLoading" class="text-center p-10 text-gray-500">
      Aún no has realizado ninguna solicitud de alquiler.
    </div>

    <div v-if="!isLoading && rentalApplications.length > 0 && !errorLoading" class="space-y-6">
      <div v-for="app in rentalApplications" :key="app.id"
        class="bg-white p-5 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="sm:w-1/3">
            <img v-if="app.vehicleDetails?.images && app.vehicleDetails.images.length > 0"
              :src="app.vehicleDetails.images[0]"
              :alt="`Imagen de ${app.vehicleDetails?.marca} ${app.vehicleDetails?.modelo}`"
              class="w-full h-40 object-cover rounded-md" />
            <div v-else class="w-full h-40 bg-gray-200 rounded-md flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          </div>

          <div class="sm:w-2/3 space-y-2">
            <h3 class="text-xl font-semibold text-primary-700">
              {{ app.vehicleDetails?.marca || 'Vehículo' }} {{ app.vehicleDetails?.modelo || 'Desconocido' }}
            </h3>
            <p v-if="app.ownerDetails" class="text-sm text-gray-500">
              Propietario: {{ app.ownerDetails.name || 'No disponible' }}
            </p>
            <div class="text-sm text-gray-600">
              <p><strong>Desde:</strong> {{ formatDate(app.start_time) }}</p>
              <p><strong>Hasta:</strong> {{ formatDate(app.end_time) }}</p>
              <p><strong>Precio Total:</strong> ${{ app.total_price?.toFixed(2) || 'N/A' }}</p>
            </div>
            <div class="mt-2">
              <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize" :class="getStatusClass(app.status)">
                {{ app.status.replace('_', ' ') }}
              </span>
            </div>

            <div v-if="app.status === 'pending'" class="mt-4">
              <button @click="cancelApplication(app.id)"
                class="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                Cancelar Solicitud
              </button>
            </div>
            <div v-if="app.status === 'confirmed'" class="mt-4">
              <p class="text-sm text-green-600">¡Tu solicitud fue aceptada! Contacta al propietario para coordinar la
                entrega.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div> -->



  <div v-if="isLoading" class="flex justify-center items-center p-10">
    <Loading class="h-12 w-12 text-secondary-500" />
    <p class="ml-4 text-gray-600">Cargando tus solicitudes...</p>
  </div>

  <div v-for="app in rentalApplications" :key="app.id">
    <div class=" flex flex-col justify-center items-center p-4">

      <div class="bg-white text-black w-full max-w-md flex flex-col rounded-xl shadow-lg p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="rounded-full w-4 h-4 border border-purple-500"></div>
            <div class="text-md font-bold">
              <span class="px-3 py-1 text-xs font-semibold rounded-full capitalize" :class="getStatusClass(app.status)">
                {{ app.status.replace('_', ' ') }}
              </span>
            </div>
          </div>
          <!-- <div class="flex items-center space-x-4">
            <div class="cursor-pointer">
              <img class="w-5 h-5 rounded-lg" src="https://i.pravatar.cc/300" />
            </div>
            <div class="text-gray-500 hover:text-gray-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div class="text-gray-500 hover:text-gray-300 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div> -->
        </div>
        <div class="mt-4 text-gray-500 font-bold text-sm">

          <div class="grid grid-cols-6">
            <div class="">
              <img v-if="app.vehicleDetails?.images && app.vehicleDetails.images.length > 0" 
                :src="app.vehicleDetails.images[0]"
                :alt="`Imagen de ${app.vehicleDetails?.marca} ${app.vehicleDetails?.modelo}`" 
                class="h-14 w-14 rounded-full" />
            </div>

            <div class="col-span-3 px-3 flex flex-col">
              <p><strong>Propietario:</strong> {{ app.ownerDetails.name || 'No disponible' }}</p>
              <p><strong>Inicia:</strong> {{ formatDate(app.start_time) }}</p>
              <p><strong>Total:</strong> ${{ app.total_price?.toFixed(2) || 'N/A' }}</p>
            </div>

            <div v-if="app.status === 'pending'" class="col-span-2 py-2 justify-self-end">
              <!-- <button @click="cancelApplication(app.id)"
                class="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors">
                Cancelar Solicitud
              </button> -->
              <button @click="cancelApplication(app.id)"  
                class="bg-gray-200 text-gray-900 font-bold text-md rounded-full py-1 px-4">
                Cancelar
              </button>
            </div>
            <div v-if="app.status === 'confirmed'" class="col-span-2 py-2 justify-self-end">
              <p class="text-sm text-green-600">¡Tu solicitud fue aceptada! Contacta al propietario para coordinar la
                entrega.</p>
            </div>
            
          </div>

        </div>
      </div>

    </div>
  </div>

</template>