<script>
export default {
  name: "Mail",
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
    <path fill-rule="evenodd" 
      clip-rule="evenodd" 
      d="M20 4C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4H20ZM18.8 6.75L12 11L5.2 6.75H18.8ZM4.8 8.5L12 13L19.2 8.5V17.25H4.8V8.5Z" 
      :fill="color"/>
  </svg>
</template>
