<script>
export default {
  name: "NavButton",
  props: {
    to: {
      type: Object,
      required: true, // La ruta a la que redirige el botón
    },
  }
};
</script>

<template>
  <router-link
    :to="to" 
    class="flex flex-row gap-3 px-3 py-3 md:px-5 md:py-2 w-full bg-vibrant-light-600 items-center transition-colors duration-100 rounded-2xl cursor-pointer font-semibold text-deep-blue-900
    hover:bg-vibrant-light-800"
  >
    <slot></slot>
  </router-link>
</template>