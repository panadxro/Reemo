<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRentStore } from '@stores';

const props = defineProps({
  rentId: {
    type: String,
    required: true,
  },
});

const rentId = props.rentId;
const loading = ref(false);

const rentStore = useRentStore();

const rent = computed(() => rentStore.rent);

onMounted(async () => {
  try {
    await rentStore.loadRent(rentId);
  } catch (error) {
    console.error('Error cargando detalles del alquiler:', error);
  } finally {
    loading.value = false;
  }
})
</script>

<template>
<div class="flex-1 flex flex-col bg-gray-50 rounded-3xl p-8 shadow-inner overflow-hidden ">

      <Heading :type="2" class="text-gray-800">📄 Resumen del Alquiler</Heading>
      <div class="bg-white shadow-2xl rounded-2xl p-6 w-full text-gray-700 space-y-5 overflow-y-auto">

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
          <p><strong>Total pagado:</strong> ARS ${{ rentalDetails.total_price?.toFixed(2) }}</p>
        </div>

        <!-- Estado Final -->
        <div>
          <h3 class="font-semibold text-lg">📌 Estado Final</h3>
          <p><strong>Estado:</strong> {{ rentalDetails.status }}</p>
          <p v-if="rentalDetails.notes"><strong>Notas:</strong> {{ rentalDetails.notes }}</p>
        </div>
  </div>
</div>

</template>