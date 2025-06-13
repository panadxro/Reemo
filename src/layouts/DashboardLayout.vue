<script setup>
import Sidebar from '@/components/Sidebar.vue'
</script>

<template>
  <div class="snap-y snap-mandatory relative w-full h-screen overflow-auto">
    <main class="flex flex-row min-h-screen max-h-screen p-2.5 snap-start relative bg-white 2xl:rounded-[40px]">
      <Sidebar />
      <slot />
    </main>
  </div>
</template>