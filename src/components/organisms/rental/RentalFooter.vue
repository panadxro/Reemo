<script>
export default {
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
    }
  },
  methods: {
    handleClick() {
      this.$emit(this.isConfirmation ? 'confirm' : 'continue');
    }
  }
};
</script>

<template>
  <div class="flex justify-between items-center mt-8 p-4 rounded-xl sticky bottom-0 left-0 right-0 bg-deep-blue-800/30 shadow-sm shadow-primary-800 z-10 backdrop-blur-xl">
    <div class="text-white font-bold text-2xl">
      Total: ARS ${{ Math.round(totalAmount).toLocaleString('es-AR') }}
    </div>

    <button
      class="bg-white text-[#010440] rounded-xl px-5 py-3 font-bold transition-all duration-300  hover:bg-[#c0e8ea] hover:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      :disabled="isDisabled"
      @click="handleClick"
    >
      {{ buttonText }}
    </button>
  </div>
</template>

<style scoped>


.btn-next:hover:disabled {
  background-color: #ff0000;
  cursor: not-allowed;
}
</style>