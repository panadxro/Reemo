<script>
import Arrow from '../../icons/Arrow.vue';
export default {
  name: "BackButton",
  components: { Arrow },
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
    <Arrow direction="left" />
  </button>
</template>