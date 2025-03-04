<script>
export default {
  name: "BackButton",
  methods: {
    goBack() {
      this.$router.back(); // Regresa a la página anterior
    },
  },
};
</script>

<template>
  <button
    @click="goBack" 
    class="flex items-center p-2 cursor-pointer rounded-full transition-colors duration-100 hover:bg-background-700" 
    title="Go back">
    <slot></slot>
  </button>
</template>