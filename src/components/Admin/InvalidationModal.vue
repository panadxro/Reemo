<script setup>
import { ref } from 'vue';
import Heading from '../atoms/Heading.vue';
import Input from '../molecules/Input.vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  car: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['close', 'confirm']);

const selectedReason = ref('');

const reasons = [
  { value: 'fotos_baja_calidad', label: 'Fotos de baja calidad o insuficientes' },
  { value: 'descripcion_incompleta', label: 'Descripción del vehículo incompleta o confusa' },
  { value: 'datos_incorrectos', label: 'Datos del vehículo (año, modelo, etc.) incorrectos' },
  { value: 'documentacion_invalida', label: 'Documentación del seguro o vehículo inválida' },
  { value: 'otro', label: 'Otro motivo (se contactará por chat)' },
];

const handleConfirm = () => {
  if (selectedReason.value) {
    const reasonText = reasons.find(r => r.value === selectedReason.value)?.label;
    emit('confirm', reasonText);
  }
};
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-primary-500/50" @click.self="$emit('close')">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-4">
      <Heading type="3">Invalidar vehículo</Heading>
      <p v-if="car">
        Estás a punto de invalidar el <strong>{{ car.basicInfo.brand }} {{ car.basicInfo.model }}</strong>. Por favor, selecciona un motivo.
      </p>
      <Input
        type="select"
        v-model="selectedReason"
        placeholder="Selecciona un motivo..."
        :options="reasons"
        variant="secondary"
        :outline="true"
      />
      <div class="flex justify-end gap-4 mt-4">
        <Input type="button" text="Cancelar" variant="secondary" @click="$emit('close')" class="cursor-pointer" />
        <Input
          type="button"
          text="Confirmar"
          variant="primary"
          :disabled="!selectedReason"
          @click="handleConfirm"
          class="cursor-pointer bg-secondary-700" />
      </div>
    </div>
  </div>
</template>
