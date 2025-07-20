<script setup>
import { defineAsyncComponent, ref } from 'vue';

const Navbar = defineAsyncComponent(() => import('@/components/Navbar.vue'));
const FooterLayout = defineAsyncComponent(() => import('@/components/Footer.vue'));

const isNavbarVisible = ref(true);
</script>

<template>
  <Navbar class="fixed" :NavbarVisible="isNavbarVisible"/>
  <main class="flex flex-col min-h-screen">
    <slot />
  </main>
  <FooterLayout />
</template>