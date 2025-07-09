<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRentStore } from '@stores';
import { useAuthStore } from '@/stores';
import Heading from '@components/atoms/Heading.vue';

const props = defineProps({
  rentId: {
    type: String,
    required: true,
  },
});

const loading = ref(false);
const rentStore = useRentStore();
const authStore = useAuthStore();

const rentalDetails = computed(() => rentStore.rent);

const isOwner = computed(() => {
  return rentalDetails.value && authStore.user?.id === rentalDetails.value.owner_id;
});

const isDriver = computed(() => {
  return rentalDetails.value && authStore.user?.id === rentalDetails.value.driver_id;
});

const ownerInfo = computed(() => {
  if (!rentalDetails.value) return null;
  
  // Si soy el propietario, usar mis datos del authStore
  if (isOwner.value) {
    return {
      name: authStore.userFirstName,
      lastname: authStore.userLastName,
      photo: authStore.userProfilePhoto
    };
  }
  
  // Si hay ownerDetails en el rental, usarlos
  if (rentalDetails.value.ownerDetails) {
    return {
      name: rentalDetails.value.ownerDetails.name || rentalDetails.value.ownerDetails.firstName || 'Propietario',
      lastname: rentalDetails.value.ownerDetails.lastname || rentalDetails.value.ownerDetails.lastName || '',
      photo: rentalDetails.value.ownerDetails.profilePhoto || rentalDetails.value.ownerDetails.photoURL
    };
  }
  
  return { name: 'Propietario no disponible', lastname: '', photo: null };
});

// Computed para obtener la información del conductor
const driverInfo = computed(() => {
  if (!rentalDetails.value) return null;
  
  // Si soy el conductor, usar mis datos del authStore
  if (isDriver.value) {
    return {
      name: authStore.userFirstName,
      lastname: authStore.userLastName,
      photo: authStore.userProfilePhoto
    };
  }
  
  // Si hay driverDetails en el rental, usarlos
  if (rentalDetails.value.driverDetails) {
    return {
      name: rentalDetails.value.driverDetails.name || rentalDetails.value.driverDetails.firstName || 'Conductor',
      lastname: rentalDetails.value.driverDetails.lastname || rentalDetails.value.driverDetails.lastName || '',
      photo: rentalDetails.value.driverDetails.photoURL || rentalDetails.value.driverDetails.profilePhoto
    };
  }
  
  return { name: 'Conductor no disponible', lastname: '', photo: null };
});

// Función para formatear fechas
const formatDate = (dateString) => {
  if (!dateString) return 'No disponible';
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Función para formatear precio
const formatPrice = (price) => {
  if (!price) return '0';
  return Math.round(price).toLocaleString('es-AR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

// Función para obtener el estado en español
const getStatusText = (status) => {
  const statusMap = {
    'completed': 'Completado',
    'pending': 'Pendiente',
    // Algunos autos tienen el valor pendiente en español pero ya quedó viejo
    'pendiente': 'Pendiente',
    'in_progress': 'En progreso',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status || 'N/A';
};

// Función para cargar los datos del rent
const loadRentData = async (rentId) => {
  if (!rentId) return;
  
  loading.value = true;
  try {
    await rentStore.loadRent(rentId);
  } catch (error) {
    console.error('Error cargando detalles del alquiler:', error);
  } finally {
    loading.value = false;
  }
};

// Watch para reaccionar a cambios en rentId
watch(() => props.rentId, (newRentId) => {
  loadRentData(newRentId);
}, { immediate: true });

onMounted(() => {
  // console.log('driverDetails', rentalDetails.value?.driverDetails);
  // console.log('ownerDetails:', rentalDetails.value?.ownerDetails);
  // console.log('authStore user:', authStore.user);
  loadRentData(props.rentId);
});
</script>

<template>
  <div class="flex-1 flex flex-col rounded-[40px] px-6 py-5 gap-5 overflow-hidden w-full border-vibrant-light-600 border-2">
    <template v-if="loading">
      <p>Cargando detalles del alquiler...</p>
    </template>
    
    <template v-else-if="rentalDetails">
      <Heading :type="2" class="regular">📄 Resumen del Alquiler</Heading>
      <div class="w-full overflow-y-auto">

        <!-- Vehículo -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">🚗 Vehículo</h3>
          <p><strong>Marca / Modelo:</strong> {{ rentalDetails.vehicleDetails?.basicInfo?.brand }} {{
            rentalDetails.vehicleDetails?.basicInfo?.model }} ({{ rentalDetails.vehicleDetails?.basicInfo?.year }})</p>
          <p><strong>Patente:</strong> {{ rentalDetails.vehicleDetails?.basicInfo?.licensePlate }}</p>
          <p><strong>Transmisión:</strong> {{ rentalDetails.vehicleDetails?.specifications?.transmission }}</p>
          <p><strong>Combustible:</strong> {{ rentalDetails.vehicleDetails?.specifications?.fuelType }}</p>
          <p><strong>Extras:</strong> {{ rentalDetails.vehicleDetails?.extras?.join(', ') || 'Ninguno' }}</p>
        </div>

        <!-- Participantes -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">👥 Participantes</h3>
          <div class="flex items-center space-x-2">
            <strong>Propietario:</strong>
            
            <!-- Si es mi perfil, no es clickeable -->
            <div v-if="isOwner" class="flex items-center space-x-2">
              <img v-if="ownerInfo.photo" :src="ownerInfo.photo" :alt="ownerInfo.name" 
                   class="w-6 h-6 rounded-full object-cover">
              <span class="text-gray-700">{{ ownerInfo.name }} {{ ownerInfo.lastname }}</span>
              <span class="font-medium">(Tú)</span>
            </div>
            
            <!-- Si no es mi perfil, es clickeable -->
            <router-link v-else
              :to="`/user/${rentalDetails.owner_id}`"
              class="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-1 transition-colors duration-200"
            >
              <img v-if="ownerInfo.photo" :src="ownerInfo.photo" :alt="ownerInfo.name" 
                   class="w-6 h-6 rounded-full object-cover">
              <span class="hover:text-primary-800 font-medium">
                {{ ownerInfo.name }} {{ ownerInfo.lastname }}
              </span>
            </router-link>
          </div>
          
          <div class="flex items-center space-x-2 mt-2">
            <strong>Conductor:</strong>
            
            <!-- Si es mi perfil, no es clickeable -->
            <div v-if="isDriver" class="flex items-center space-x-2">
              <img v-if="driverInfo.photo" :src="driverInfo.photo" :alt="driverInfo.name" 
                   class="w-6 h-6 rounded-full object-cover">
              <span class="text-gray-700">{{ driverInfo.name }} {{ driverInfo.lastname }}</span>
              <span class="font-medium">(Tú)</span>
            </div>
            
            <!-- Si no es mi perfil, es clickeable -->
            <router-link v-else
              :to="`/user/${rentalDetails.driver_id}`"
              class="flex items-center space-x-2 hover:bg-gray-100 rounded-lg p-1 transition-colors duration-200"
            >
              <img v-if="driverInfo.photo" :src="driverInfo.photo" :alt="driverInfo.name" 
                   class="w-6 h-6 rounded-full object-cover">
              <span class="hover:text-primary-800 font-medium">
                {{ driverInfo.name }} {{ driverInfo.lastname }}
              </span>
            </router-link>
          </div>
        </div>

        <!-- Fechas -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">📅 Fechas</h3>
          <p><strong>Desde:</strong> {{ formatDate(rentalDetails.start_time) }}</p>
          <p><strong>Hasta:</strong> {{ formatDate(rentalDetails.end_time) }}</p>
        </div>

        <!-- Ubicaciones -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">📍 Ubicaciones</h3>
          <p><strong>Retiro:</strong> {{ rentalDetails.vehicleDetails?.status?.currentLocation?.address || 'No especificada' }}</p>
          <p><strong>Devolución:</strong> {{ rentalDetails.vehicleDetails?.status?.currentLocation?.address || 'No especificada' }}</p>
        </div>

        <!-- Pago -->
        <div class="border-b pb-4">
          <h3 class="font-semibold text-lg">💳 Pago</h3>
          <p><strong>Método:</strong> {{ rentalDetails.payments?.payment_method || 'No especificado' }}</p>
          <p><strong>ID Transacción:</strong> {{ rentalDetails.payments?.transaction_id?.toFixed() || 'N/A' }}</p>
          <p><strong>Estado:</strong> {{ getStatusText(rentalDetails.payments?.status) }}</p>
          <p><strong>Total pagado:</strong> ${{ formatPrice(rentalDetails.total_price || rentalDetails.payments?.amount) }}</p>
        </div>

        <!-- Estado Final -->
        <div>
          <h3 class="font-semibold text-lg">📌 Estado Final</h3>
          <p><strong>Estado:</strong> {{ getStatusText(rentalDetails.status) }}</p>
        </div>
      </div>
    </template>
    
    <template v-else>
      <p>No se pudieron cargar los detalles del alquiler</p>
    </template>
  </div>
</template>