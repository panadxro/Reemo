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
        1: "text-2xl",
        2: "text-4xl mb-3 sm:text-4xl",
        3: "text-2xl mb-2 sm:text-3xl",
        4: "text-xl mb-1 sm:text-lg",
        5: "text-lg mb-0.5 sm:text-md",
        6: "text-sm",
      }[this.type];
    },
  },
};
</script>
<template>
  <component :is="tag" :class="`${textSize} font-semibold text-deep-blue-900 sm:leading-tight`">
    <slot />
  </component>
</template>

<style scoped>
 .large {
    font-size: 2rem;
    letter-spacing: -0.5px;
    line-height: 2.375rem;
  }
  .medium {
    font-size: 1.5rem;
    letter-spacing: -0.5px;
    line-height: 1.75rem;
  }
  .regular {
    font-size: 1.25rem;
    letter-spacing: -0.5px;
    line-height: 1.5rem;
  }
  .small {
    font-size: 1rem;
    letter-spacing: -0.5px;
    line-height: 1.125rem;
 }
</style>