<script setup>
import Sidebar from '@/components/Sidebar.vue';
import NavbarApp from '@/components/NavbarApp.vue';
</script>

<template>
  <div class="snap-y snap-mandatory relative w-full h-screen overflow-auto">
    <main class="flex flex-row min-h-screen max-h-screen p-2.5 snap-start relative bg-white 2xl:rounded-[40px]">
      <Sidebar />      
      <NavbarApp />
      <div class="mt-16 md:mt-0 w-full">
        <slot />
      </div>
    </main>
  </div>
</template>