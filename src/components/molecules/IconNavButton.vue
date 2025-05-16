<script>
export default {
  name: "IconNavButton",
  props: {
    to: {
      type: String,
      required: true, // Ruta de navegación
    },
    title: {
      type: String,
      required: true, // Texto accesible
    },
  },
};
</script>

<template>
  <router-link 
    :to="to"
    :title="title"
    class="flex items-center p-2 rounded-full transition-colors duration-300 hover:bg-white/40"
    active-class="bg-vibrant-light-800"
  >
    <slot></slot>
    <span class="sr-only">{{ title }}</span> 
  </router-link>
</template>