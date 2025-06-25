<script>
export default {
  name: "Cross",
  props: {
    color: {
      type: String,
      default: "#010440"
    },
    size: {
      type: [Number, String],
      default: 16,
      validator(value) {
        return !isNaN(value) && value > 0;
      }
    }
  }
};
</script>

<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :width="size"
    :height="size"
    viewBox="0 0 16 16"
  >
    <path
      fill="none"
      :stroke="color"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2.5"
      d="m11.25 4.75l-6.5 6.5m0-6.5l6.5 6.5"
    />
  </svg>
</template>
