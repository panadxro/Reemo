<script>
import Input from "@/components/molecules/Input.vue";

export default {
  components: {
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
  <div class="flex justify-between items-center mt-8 p-4 rounded-xl sticky bottom-0 left-0 right-0 bg-deep-blue-800/30 shadow-sm shadow-primary-800 z-1 backdrop-blur-xl">
    <div class="text-white font-bold text-2xl w-full">
      Total: ${{ Math.round(totalAmount).toLocaleString('es-AR') }}
    </div>
    <Input
      type="button"
      id="confirm"
      name="confirm"
      class="items-end !w-fit"
      input-class="w-fit"
      :text="buttonText"
      :disabled="isDisabled"
      @click="handleClick"
    />
  </div>
</template>

<style scoped>


.btn-next:hover:disabled {
  background-color: #ff0000;
  cursor: not-allowed;
}
</style>