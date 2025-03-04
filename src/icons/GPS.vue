<script>
export default {
  name: "GPS",
};
</script>

<template>
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    x-bind:width="size" 
    x-bind:height="size" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    x-bind:stroke-width="stroke" 
    stroke-linecap="round" 
    stroke-linejoin="round" 
    width="16" 
    height="16" 
    stroke-width="2">
    <path d="M11 18l-2 -1l-6 3v-13l6 -3l6 3l6 -3v7.5"></path>
    <path d="M9 4v13"></path>
    <path d="M15 7v5"></path>
    <path d="M18 18m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0"></path>
    <path d="M20.2 20.2l1.8 1.8"></path>
  </svg>
</template>