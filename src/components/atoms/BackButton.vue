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
  props: {
    color: {
      type: String,
      default: "#010440",
    },
  },
};
</script>

<template>
  <button
    type="button"
    @click="goBack" 
    class="flex items-center p-2 cursor-pointer rounded-full transition-colors duration-100 hover:bg-background-700/30" 
    title="Ir a la página anterior">
    <Arrow direction="left" :color="color"/>
  </button>
</template>