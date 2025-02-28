<script>
export default {
  name: "Heading",
  props: {
    type: {
      type: [Number, String],
      default: 1,
      validator(value) {
        return [1, 2, 3, 4, 5, 6].includes(Number(value));
      },
    },
  },
  computed: {
    tag() {
      return `h${this.type}`;
    },
    textSize() {
      // Establece tamaños de texto según el tipo de encabezado
      return {
        1: "text-2xl font-semibold ",
        2: "text-4xl mb-3 sm:text-4xl",
        3: "text-2xl mb-2 font-semibold sm:font-medium sm:text-3xl",
        4: "text-xl mb-1 sm:text-lg",
        5: "text-lg mb-0.5 font-bold sm:text-md",
        6: "text-sm",
      }[this.type];
    },
  },
};
</script>
<template>
  <component :is="tag" :class="`${textSize} font-medium text-primary-900 sm:leading-tight`">
    <slot />
  </component>
</template>