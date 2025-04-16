<script>
export default {
  name: "LongArrow",
  props: {
    color: {
      type: String,
      default: "#010440"
    },
    direction: {
      type: String,
      default: "up",
      validator(value) {
        return ["right", "down", "left", "up"].includes(value);
      },
    },
  },
  computed: {
    rotationClass() {
      const rotations = {
        up: "rotate-0",
        right: "rotate-90",
        down: "rotate-180",
        left: "-rotate-90",
      };
      return rotations[this.direction] || "rotate-0";
    },
  },
};
</script>

<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none"
    :class="rotationClass">
    >
  <path 
    d="M12 18V6M12 6L16.5 10.5M12 6L7.5 10.5" 
    :stroke="color" 
    stroke-width="3" 
    stroke-linecap="round" 
    stroke-linejoin="round"/>
  </svg>
</template>
