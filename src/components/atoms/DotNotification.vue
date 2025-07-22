<script setup>
import { inject } from 'vue'

const authStore = inject('authStore')

</script>

<template>
  <span
    v-if="authStore.unreadNotifications"
    class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-secondary-100"
    aria-hidden="true"
  ></span>
</template>