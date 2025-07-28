<script setup>
import { ref, inject } from 'vue';

import Navbar from '@/components/Navbar.vue';
import FooterLayout from '@/components/Footer.vue';
import Offline from "@pages/Offline.vue";

const isOnline = inject('isOnline');

const isNavbarVisible = ref(true);
</script>

<template>
  <Navbar class="fixed" :NavbarVisible="isNavbarVisible"/>
  <main class="flex flex-col min-h-screen">
    <slot v-if="isOnline"/>
    <Offline v-else/>
  </main>
  <FooterLayout />
</template>