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
    }
  },
};
</script>
<template>
  <component :is="tag" :class="`font-semibold text-deep-blue-900 sm:leading-tight`">
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