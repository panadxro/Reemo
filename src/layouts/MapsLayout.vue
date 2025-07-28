<script setup>
import { inject } from 'vue';

import Sidebar from '@components/Sidebar.vue'
import Offline from "@pages/Offline.vue";

const isOnline = inject('isOnline');
</script>

<template>
  <div class="w-full h-screen overflow-auto">
    <main class="flex md:flex-row relative flex-row min-h-dvh max-h-dvh p-2.5 pb-23 md:pb-2.5 shadow-2xl 2xl:rounded-[40px] mb-0 2xl:max-w-5/6 2xl:m-auto">
      <Sidebar/>
      <slot v-if="isOnline"/>
      <Offline v-else/>
    </main>
  </div>
</template>