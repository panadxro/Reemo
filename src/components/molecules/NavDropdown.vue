<script>
import Arrow from '../../icons/Arrow.vue';

export default {
  name: "NavDropdown",
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
      isOpen: window.innerWidth > 768, // Inicializa abierto en pantallas grandes
      contentHeight: 0, // Altura del contenido, calculada dinámicamente
    };
  },
  methods: {
    toggleDropdown() {
      if (window.innerWidth <= 768) { 
        this.isOpen = !this.isOpen;
        // Forzar actualización del DOM antes de calcular la altura.
        // Porque sin esto, no se listan todos los elementos (por lo menos el footer)
        // ya que tienen varios li
        this.$nextTick(() => {
          this.updateHeight();
        });
      }
    },
    handleResize() {
      // Actualizar estado en función del tamaño de la pantalla
      this.isOpen = window.innerWidth > 768;
    },
    updateHeight() {
      // Calcular la altura del contenido dinámicamente
      const content = this.$refs.content;
      this.contentHeight = content ? content.scrollHeight : 0;
    },
  },
  mounted() {
    // Escuchar el evento de cambio de tamaño de la ventana
    window.addEventListener("resize", this.handleResize);
    this.updateHeight();
  },
  beforeDestroy() {
    // Limpiar eventos
    window.removeEventListener("resize", this.handleResize);
  },
  watch: {
    isOpen() {
      // Actualizar altura cuando cambia el estado
      this.updateHeight();
    },
  },
};
</script>

<template>
  <component :is="tag" class="dropdown">
    <button
      type="button"
      class="flex items-center justify-between w-full text-left font-bold sm:cursor-default outline-hidden"
      @click="toggleDropdown"
    >
      <slot name="title"></slot>
      <Arrow class="sm:hidden" :direction="isOpen ? 'up' : 'down'" />
    </button>
    <div
      ref="content"
      :style="{
        maxHeight: isOpen ? contentHeight + 'px' : '0px',
        opacity: isOpen ? 1 : 0,
        overflow: 'hidden',
        transition: 'max-height 0.3s ease-in-out, opacity 0.3s ease-in-out',
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
