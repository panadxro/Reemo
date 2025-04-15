<script setup>
import Navbar from '@/components/Navbar.vue'
import FooterLayout from '@/components/Footer.vue'
</script>

<template>
  <Navbar class="fixed" />
  <main class="flex flex-col min-h-screen mt-20 mx-auto">
    <slot />
  </main>
  <FooterLayout />
</template>