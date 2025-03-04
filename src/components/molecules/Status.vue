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
        return this.isValidated ? "bg-vibrant-light-700 text-deep-blue-900" : "bg-red-100 text-red-800";
      },
    },
  };
</script>

<template>
  <span :class="statusClass" class="px-4 py-2 rounded-2xl text-sm font-semibold flex items-center">
    {{ statusText }}
  </span>
</template>
  