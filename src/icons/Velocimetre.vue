<script>
export default {
  name: "Velocimetre",
  props: {
    color: {
      type: String,
      default: "#010440"
    }
  }
};
</script>

<template>
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
  <path d="M4 15.5C4 13.3783 4.84285 11.3434 6.34315 9.84315C7.84344 8.34285 9.87827 7.5 12 7.5C14.1217 7.5 16.1566 8.34285 17.6569 9.84315C19.1571 11.3434 20 13.3783 20 15.5" :stroke="color" stroke-width="3" stroke-linejoin="round"/>
  <path d="M10 16.5C10 15.9696 10.2107 15.4609 10.5858 15.0858C10.9609 14.7107 11.4696 14.5 12 14.5C12.5304 14.5 13.0391 14.7107 13.4142 15.0858C13.7893 15.4609 14 15.9696 14 16.5" :stroke="color" stroke-width="3" stroke-linejoin="round"/>
  <path d="M11.125 15L9.375 12.5M5 15.8333V16.6667C5 16.8877 5.09219 17.0996 5.25628 17.2559C5.42038 17.4122 5.64294 17.5 5.875 17.5H18.125C18.3571 17.5 18.5796 17.4122 18.7437 17.2559C18.9078 17.0996 19 16.8877 19 16.6667V15.8333" :stroke="color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</template>