<script>
export default {
  name: "NavButton",
  props: {
    to: {
      type: String,
      required: true, // La ruta a la que redirige el botón
    },
  },
  methods: {
    navigate() {
      this.$router.push(this.to); // Redirige usando Vue Router
    },
  },
};
</script>

<template>
  <button 
    @click="navigate"
    class="flex flex-row gap-3 px-5 py-2 w-full bg-vibrant-light-600 items-center transition-colors duration-100 rounded-2xl cursor-pointer font-semibold text-deep-blue-900
    hover:bg-vibrant-light-800"
  >
    <slot></slot>
  </button>
</template>