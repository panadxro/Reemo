<script>
export default {
  name: "Logout",
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
  <path d="M15.9153 15.5L19 12M19 12L15.9153 8.5M19 12H9.9661M12.4449 16.375C12.4449 17.0712 12.2012 17.7389 11.7673 18.2312C11.3334 18.7234 10.745 19 10.1314 19H8.31356C7.69997 19 7.1115 18.7234 6.67763 18.2312C6.24375 17.7389 6 17.0712 6 16.375V7.625C6 6.92881 6.24375 6.26113 6.67763 5.76884C7.1115 5.27656 7.69997 5 8.31356 5H10.1314C10.745 5 11.3334 5.27656 11.7673 5.76884C12.2012 6.26113 12.4449 6.92881 12.4449 7.625" 
    :stroke="color"  
    stroke-width="3" 
    stroke-linecap="round" 
    stroke-linejoin="round"/>
  </svg>
</template>
