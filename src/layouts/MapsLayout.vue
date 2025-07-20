<script setup>
import { defineAsyncComponent } from 'vue';

const Sidebar = defineAsyncComponent(() => import('@/components/Sidebar.vue'));
</script>

<template>
  <div class="w-full h-screen overflow-auto">
    <main class="flex md:flex-row-reverse  relative flex-row min-h-screen max-h-screen p-2.5 pb-23 md:pb-2.5 bg-black mb-0 2xl:max-w-5/6 2xl:m-auto">
      <slot />
      <Sidebar/>
    </main>
  </div>
</template>