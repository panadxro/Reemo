<script setup>
import { ref } from 'vue';
import Heading from '../atoms/Heading.vue';
import Warning from '@icons/Warning.vue';
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
  <div 
    v-if="isOpen" 
    @click.self="$emit('close')"
    class="fixed inset-0 flex items-center justify-center z-50 bg-primary-500/50">
        <!-- Modal panel -->
        <div 
          class="bg-white rounded-[40px] shadow-xl transform transition-all overflow-hidden py-8 px-5 flex flex-col gap-4 items-center justify-center md:mb-40 mx-2 w-full max-w-120" 
          role="dialog" 
          aria-modal="true" aria-labelledby="modal-headline"
          >
          <div class="bg-vibrant-light-800 p-2 aspect-square w-fit rounded-full">
            <Warning />
          </div>
          <div class="flex flex-col gap-2 w-full">
            <Heading type="2" class="medium">Invalidar vehículo</Heading>
            <p v-if="car">
              Estás a punto de invalidar el <strong>{{ car.basicInfo.brand }} {{ car.basicInfo.model }}</strong>.
            </p>
              <Input
                type="select"
                v-model="selectedReason"
                placeholder="Por favor, selecciona un motivo."
                :options="reasons"
                :label="true"
                variant="secondary"
                :outline="true"
                input-class="w-full"
              />
          </div>
          <div class="flex w-full justify-end gap-2">
            <Input 
              type="button" 
              text="Cancelar" 
              variant="secondary" 
              :outline="true"
              @click="$emit('close')"
              class="md:!w-fit"
            />
            <Input
            type="button"
            text="Confirmar"
            variant="primary"
            :disabled="!selectedReason"
            @click="handleConfirm"
            class="md:!w-fit"
              />
          </div>
        </div>
      </div>
</template>
