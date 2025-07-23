<script>
import { useUserStore } from "@/stores";

export default {
  name: "IconNavButton",
  props: {
    to: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    const userStore = useUserStore();
    return { userStore };
  },
};
</script>

<template>
  <router-link
    :to="to"
    :title="title"
    class="flex items-center p-2 rounded-full transition-colors duration-300 hover:bg-white/50"
    :active-class="
      userStore.profileData?.role === 'user'
        ? 'bg-vibrant-light-800'
        : userStore.profileData?.role === 'admin'
        ? 'bg-deep-blue-700'
        : ''
    "
  >
    <slot />
    <span class="sr-only">{{ title }}</span>
  </router-link>
</template>