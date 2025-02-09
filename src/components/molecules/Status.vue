<template>
    <span :class="statusClass" class="px-3 py-1 rounded-full text-sm font-semibold">
      {{ statusText }}
    </span>
  </template>
  
  <script>
  export default {
    props: {
      isValidated: {
        type: Boolean,
        required: true,
      },
    },
    computed: {
      statusText() {
        return this.isValidated ? "Validado" : "No Validado";
      },
      statusClass() {
        return this.isValidated ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
      },
    },
  };
  </script>