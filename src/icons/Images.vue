<script>
export default {
  name: "Images",
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
  <path d="M14.4737 9.44737H14.4816M12.5 19.7105H7.36842C6.74028 19.7105 6.13786 19.461 5.69369 19.0168C5.24953 18.5727 5 17.9703 5 17.3421V7.86842C5 7.24028 5.24953 6.63786 5.69369 6.19369C6.13786 5.74953 6.74028 5.5 7.36842 5.5H16.8421C17.4703 5.5 18.0727 5.74953 18.5168 6.19369C18.961 6.63786 19.2105 7.24028 19.2105 7.86842V13" :stroke="color" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5 15.7631L8.94737 11.8157C9.68 11.1107 10.5832 11.1107 11.3158 11.8157L14.4737 14.9736" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M13.6836 14.1842L14.4731 13.3947C15.002 12.8863 15.6178 12.7442 16.1957 12.9684M15.2625 18.1316H19.9994M17.631 15.7631V20.5" :stroke="color" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>
</template>