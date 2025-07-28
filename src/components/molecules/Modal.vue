<script>
import Heading from "@components/atoms/Heading.vue";
import Input from "@components/molecules/Input.vue";
import Cross from "@icons/Cross.vue";

export default {
  name: "Modal",
  components: {
    Heading, Input, Cross
  },
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    title: {
      type: String,
      default: "Confirmar acción"
    },
    message: {
      type: [String, Object],
      default: "¿Estás seguro de realizar esta acción?"
    },
    confirmText: {
      type: String,
      default: "Confirmar"
    },
    cancelText: {
      type: String,
      default: "Cancelar"
    },
    image: {
      type: String,
      default: null
    },
    showTwoButtons: {
      type: Boolean,
      default: true
    },
    primaryButtonText: {
      type: String,
      default: null
    },
    secondaryButtonText: {
      type: String,
      default: null
    }
  },
  emits: ["close", "confirm", "primary-action", "secondary-action"],
  setup(props, { emit }) {
    const onClose = () => {
      emit("close");
    };
    
    const onConfirm = () => {
      emit("confirm");
    };

    const onPrimaryAction = () => {
      emit("primary-action");
    };

    const onSecondaryAction = () => {
      emit("secondary-action");
    };
    
    return {
      onClose,
      onConfirm,
      onPrimaryAction,
      onSecondaryAction
    };
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!--Para poder cerrarlo al tocar afuera -->
    <div class="absolute inset-0 bg-black/60" @click="onClose"></div>
    
    <div class="relative bg-white rounded-[40px] p-6 w-full max-w-md mx-4 z-10 max-h-auto ">
      <div class="flex flex-col">
        <div class="flex justify-between items-start mb-4">
          <Heading :type="5" class="text-primary-900 text-center">{{ title }}</Heading>
          <button 
            @click="onClose" 
            class="text-primary-900 hover:text-primary-700 transition-colors hover:cursor-pointer"
          >
            <Cross />
          </button>
        </div>

        <!-- Imagen condicional -->
        <div v-if="image" class="text-center mb-6">
          <img :src="image" alt="Modal image" class="w-24 h-24 mx-auto rounded-full object-cover">
        </div>

        <div class="mb-6 overflow-y-auto max-h-80 box-white pr-4">
          <p class="text-primary-700" v-html="message"></p>
        </div>

        <!-- Botones condicionales -->
        <div v-if="showTwoButtons && !primaryButtonText" class="flex gap-3 justify-center">
          <Input
            @click="onConfirm"
            type="button"
            variant="primary"
            :text="confirmText"
          />
          <Input
            @click="onClose"
            type="button"
            variant="secondary"
            :outline="true"
            :text="cancelText"
          />
        </div>

        <div v-else-if="primaryButtonText" class="space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
          <Input
            @click="onPrimaryAction"
            type="button"
            variant="primary"
            :text="primaryButtonText"
            class="w-full sm:w-auto flex-1"
          />
          <Input
            @click="onSecondaryAction"
            type="button"
            variant="secondary"
            outline
            :text="secondaryButtonText || 'Cerrar'"
            class="w-full sm:w-auto flex-1"
          />
        </div>

        <!-- Botón único -->
        <div v-else class="flex justify-center">
          <Input
            @click="onClose"
            type="button"
            variant="primary"
            :text="confirmText"
          />
        </div>
      </div>
    </div>
  </div>
</template>