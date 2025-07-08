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

  <!-- <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="absolute inset-0 bg-black bg-opacity-50" @click="$emit('close')"></div>
    <div class="relative bg-white rounded-2xl p-6 w-full max-w-md flex flex-col gap-4">

    </div>
  </div> -->

    <div v-if="isOpen" @click.self="$emit('close')"
      class="fixed inset-0 flex items-center justify-center z-50 bg-primary-500/50">
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
      </div>
      <!-- Modal -->
      <div x-transition:enter="transition ease-out duration-300 transform" x-transition:enter-start="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" x-transition:enter-end="opacity-100 translate-y-0 sm:scale-100" x-transition:leave="transition ease-in duration-200 transform" x-transition:leave-start="opacity-100 translate-y-0 sm:scale-100" x-transition:leave-end="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" class="fixed z-10 inset-0 overflow-y-auto" x-cloak>
        <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Modal panel -->
          <div class="w-full inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <!-- Modal content -->
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg width="64px" height="64px" viewBox="0 0 24 24" class="h-6 w-6 text-blue-600" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 16H12.01M12 8V12M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </div>
                <div class="w-full mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-headline"> Invalidar vehículo </h3>
                  <div class="mt-2">
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
                        class="mt-3 w-full inline-flex justify-center"
                      />
                  </div>
                </div>
              </div>
            </div>
            <div class="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <Input
              type="button"
              text="Confirmar"
              variant="primary"
              :disabled="!selectedReason"
              @click="handleConfirm"
              class="mt-3 w-full inline-flex justify-center cursor-pointer rounded-md sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />
              
              <Input type="button" text="Cancelar" variant="secondary" @click="$emit('close')" class="mt-3 w-full inline-flex justify-center cursor-pointer rounded-md sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm" />

              <!-- <button @click="subscribeToNewsletter" type="button" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-500 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"> Subscribe </button> -->
              <!-- <button @click="showModal = false" type="button" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"> Cancel </button> -->

            </div>
          </div>
        </div>
      </div>
    </div>

  <!-- <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center z-50 bg-primary-500/50" @click.self="$emit('close')">
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
  </div> -->

</template>
