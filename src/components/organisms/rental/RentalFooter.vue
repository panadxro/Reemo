<script>
import Input from "@/components/molecules/Input.vue";
import VerifyValidation from "@/components/user/VerifyValidation.vue";

export default {
  name: "RentalFooter",
  components: {
    VerifyValidation,
    Input
  },
  props: {
    totalAmount: {
      type: Number,
      required: true,
      default: 0
    },
    buttonText: {
      type: String,
      default: 'Continuar'
    },
    isDisabled: {
      type: Boolean,
      default: false
    },
    isConfirmation: {
      type: Boolean,
      default: false
    },
    isVerified: {
      type: Boolean,
      default: true
    },
    showVerificationWarning: {
      type: Boolean,
      default: false
    },
    isAvailable: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    shouldDisableButton() {
      return this.isDisabled || 
             (!this.isVerified && this.showVerificationWarning) || 
             !this.isAvailable;
    },
    buttonClasses() {
      const baseClasses = "rounded-xl px-5 py-3 font-bold transition-all duration-300";
      
      if (this.shouldDisableButton) {
        return `${baseClasses} bg-gray-400 text-gray-600 cursor-not-allowed opacity-50`;
      }
      
      if (!this.isVerified && this.showVerificationWarning) {
        return `${baseClasses} bg-amber-500 text-white hover:bg-amber-600`;
      }
      
      return `${baseClasses} bg-white text-[#010440] hover:bg-[#c0e8ea] hover:cursor-pointer`;
    },
    displayButtonText() {
      if (!this.isAvailable) {
        return 'Auto no disponible';
      }
      
      if (!this.isVerified && this.showVerificationWarning) {
        return 'Verificación requerida';
      }
      
      return this.buttonText;
    },
    tooltipText() {
      if (!this.isAvailable) {
        return 'El auto no está disponible para reservar';
      }
      
      if (!this.isVerified && this.showVerificationWarning) {
        return 'Necesitas verificar tu cuenta';
      }
      
      return '';
    }
  },
  methods: {
    handleClick() {
      if (!this.isAvailable) {
        this.$emit('car-not-available');
        return;
      }
      
      if (!this.isVerified && this.showVerificationWarning) {
        this.$emit('verification-required');
        return;
      }
      
      if (this.shouldDisableButton) {
        return;
      }
      
      this.$emit(this.isConfirmation ? 'confirm' : 'continue');
    }
  }
};
</script>

<template>
  <div class="sticky bottom-0 left-0 right-0 z-4">
    <VerifyValidation
          v-if="!isVerified"
          title="Verificación requerida"
          message="Necesitas verificar tu cuenta para continuar con la reserva. El proceso de verificación puede tomar algunos días."
          :show="!isVerified"
          type="brightYellow"
          />

    <VerifyValidation
          v-if="!isAvailable"
          title="Auto no disponible"
          message="Este auto no está disponible para reservar en este momento. Por favor, selecciona otro auto."
          :show="!isAvailable"
          type="normalYellow"
          />

    <div v-if="isAvailable && isVerified" class="flex justify-between items-center mt-8 p-4 bg-deep-blue-900  backdrop-blur-xl">
      <div class="text-white font-bold text-2xl w-full">
        Total: ${{ Math.round(totalAmount).toLocaleString('es-AR') }}
      </div>
      <Input
        type="button"
        id="confirm"
        name="confirm"
        class="items-end"
        input-class="w-fit"
        :text="buttonText"
        :title="tooltipText"
        :disabled="shouldDisableButton"
        @click="handleClick"
      />
    </div>
  </div>
</template>