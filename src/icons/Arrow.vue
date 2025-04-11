<script>
export default {
  name: "Arrow",
  props: {
    color: {
      type: String,
      default: "#010440"
    },
    direction: {
      type: String,
      default: "right",
      validator(value) {
        return ["right", "down", "left", "up"].includes(value);
      },
    },
  },
  computed: {
    rotationClass() {
      const rotations = {
        right: "rotate-0",
        down: "rotate-90",
        left: "rotate-180",
        up: "-rotate-90",
      };
      return rotations[this.direction] || "rotate-0";
    },
  },
};
</script>

<template>
  <svg
    :class="['tranform transition-transform duration-300', rotationClass]"
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none">
    <path d="M9 17L14 12ZM14 12L9 7Z" :fill="color"/>
    <path d="M9 17L14 12L9 7" :stroke="color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
</template>
