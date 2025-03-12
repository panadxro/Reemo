<script>
import Heading from "../atoms/Heading.vue";

export default {
  name: "ConfirmModal",
  components: { Heading },
  props: {
    isVisible: {
      type: Boolean,
      default: false
    }
  },
  emits: ["discard", "cancel"],
  methods: {
    discard() {
      this.$emit("discard");
    },
    cancel() {
      this.$emit("cancel");
    }
  }
};
</script>

<template>
  <div class="modal-overlay" v-if="isVisible" @click.self="cancel">
    <div class="modal-content">
      <Heading :type="5" class="text-align-center mb-4">¿Seguro que quieres descartar los cambios?</Heading>
      <p class="mb-4 text-sm text-gray-600">Los cambios no guardados se perderán.</p>
      <div class="flex justify-center space-x-4">
        <button @click="discard" class="bg-red-500 text-white px-4 py-2 rounded-sm">Descartar</button>
        <button @click="cancel" class="bg-gray-300 px-4 py-2 rounded-sm">Cancelar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 300px;
  text-align: center;
}
</style>