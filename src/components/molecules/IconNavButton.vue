<script setup>
import { inject } from 'vue';

const props = defineProps({
  to: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
})

const authStore = inject('authStore');
</script>

<template>
  <router-link
    :to="to"
    :title="title"
    class="flex items-center p-2 rounded-full transition-colors duration-300"
    :class="{
      ' hover:bg-vibrant-light-700': authStore.user?.role === 'user',
      ' hover:bg-deep-blue-700': authStore.user?.role === 'admin'
    }"
    :active-class="
      authStore.user?.role === 'user'
        ? '!bg-vibrant-light-800'
        : authStore.user?.role === 'admin'
        ? '!bg-white/25'
        : ''
    "
  >
    <slot />
    <span class="sr-only">{{ title }}</span>
  </router-link>
</template>