<script>
import Arrow from '../../icons/Arrow.vue';

export default {
  name: "Dropdown",
  components: {
    Arrow,
  },
  props: {
    tag: {
      type: String,
      default: "div",
    },
  },
  data() {
    return {
      isOpen: false,
      contentHeight: 0, // Para almacenar la altura del contenido
    };
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.calculateContentHeight(); // Calcula la altura cuando se abre
      }
    },
    calculateContentHeight() {
      // Obtiene la altura del contenido dinámicamente
      const content = this.$refs.content;
      if (content) {
        this.contentHeight = content.scrollHeight; // Altura total del contenido
      }
    },
  },
};
</script>

<template>
  <component :is="tag" class="dropdown">
    <button
      type="button"
      class="flex items-center justify-between w-full text-left font-bold outline-hidden"
      @click="toggleDropdown"
    >
      <slot name="title"></slot>
      <Arrow :direction="isOpen ? 'up' : 'down'" />
    </button>
    <div
      ref="content"
      :style="{
        maxHeight: isOpen ? contentHeight + 'px' : '0px',
        opacity: isOpen ? 1 : 0,
        overflow: 'none',
      }"
      class="dropdown-content"
    >
      <slot></slot>
    </div>
  </component>
</template>

<style scoped>
/* Estilo base para el contenido */
.dropdown-content {
  opacity: 0;
  max-height: 0;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}
</style>
