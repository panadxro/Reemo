<script>
export default {
  name: "CheckIcon",
  props: {
    color: {
      type: String,
      default: "#010440"
    }
  }
};
</script>

<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none">
    <path 
      d="M7 13L10 16L18 8" 
      :stroke="color" 
      stroke-width="3" 
      stroke-linecap="round" 
      stroke-linejoin="round"/>
  </svg>
</template>
