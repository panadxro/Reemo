<script setup>
import { defineAsyncComponent } from 'vue';

const Navbar = defineAsyncComponent(() => import('@/components/Navbar.vue'));
const FooterLayout = defineAsyncComponent(() => import('@/components/Footer.vue'));
</script>

<template>
  <Navbar class="fixed" />
  <main class="flex flex-col min-h-screen">
    <slot />
  </main>
  <FooterLayout />
</template>