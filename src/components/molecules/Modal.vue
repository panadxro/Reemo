<script>
import Heading from "@components/atoms/Heading.vue";
import Input from "@components/molecules/Input.vue";

export default {
  name: "GeneralModal",
  components: {
    Heading, Input
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
      type: String,
      default: "¿Estás seguro de realizar esta acción?"
    },
    confirmText: {
      type: String,
      default: "Confirmar"
    },
    cancelText: {
      type: String,
      default: "Cancelar"
    }
  },
  emits: ["close", "confirm"],
  setup(props, { emit }) {
    const onClose = () => {
      emit("close");
    };
    
    const onConfirm = () => {
      emit("confirm");
    };
    
    return {
      onClose,
      onConfirm
    };
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">
    <!--Para poder cerrarlo al tocaer afuera -->
    <div class="absolute inset-0 bg-black/60" @click="onClose"></div>
    
    <div class="relative bg-white rounded-[40px] p-6 w-full max-w-md mx-4 z-10">
      <div class="flex flex-col">
        <div class="flex justify-between items-start mb-4">
          <Heading :type="5" class="text-primary-900 text-center">{{ title }}</Heading>
          <button 
            @click="onClose" 
            class="text-primary-900 hover:text-primary-700 transition-colors hover:cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div class="mb-6">
          <p class="text-primary-700">{{ message }}</p>
        </div>

        <div class="flex gap-3 justify-center">
            <!-- <button 
              @click="onConfirm" 
              class="px-4 py-2 w-full bg-white text-primary-900 rounded-lg hover:bg-white/70 transition-colors hover:cursor-pointer"
            >
              {{ confirmText }}
            </button> -->
            <Input
            @click="onConfirm"
            type="button"
            variant="primary"
            :text="confirmText"
          />
          <!-- <button 
            @click="onClose" 
            class="px-4 py-2 w-full text-white rounded-lg hover:cursor-pointer hover:bg-white/10 transition-colors"
          >
            {{ cancelText }}
          </button> -->
          <Input
            @click="onConfirm"
            type="button"
            variant="secondary"
            outline
            :text="cancelText"
          />
        </div>
      </div>
    </div>
  </div>
</template>