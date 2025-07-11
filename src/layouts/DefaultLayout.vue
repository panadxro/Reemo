<script setup>
import Navbar from '@/components/Navbar.vue'
import FooterLayout from '@/components/Footer.vue'
</script>

<template>
  <Navbar class="fixed" />
  <main class="flex flex-col min-h-screen">
    <slot />
  </main>
  <FooterLayout />
</template>