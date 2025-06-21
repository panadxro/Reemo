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
  <svg xmlns="http://www.w3.org/2000/svg" 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none">
    <path d="M18 12.5332C18 13.8816 17.4986 15.1824 16.5922 16.1857C15.6858 17.189 14.4384 17.8239 13.0896 17.9685C11.7408 18.113 10.3858 17.757 9.28509 16.9688C8.18438 16.1806 7.41556 15.0158 7.1264 13.6984C6.83724 12.381 7.04814 11.0038 7.71856 9.8315C8.38899 8.65924 9.47163 7.77461 10.7584 7.34763C12.0452 6.92065 13.4454 6.98145 14.6899 7.51833M14.6899 7.51833L12.1562 5M14.6899 7.51833L12.3627 9.8315" 
      :stroke="color" 
      stroke-width="3" 
      stroke-linecap="round" 
      stroke-linejoin="round"/>
  </svg>
</template>
