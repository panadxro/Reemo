<script setup>
import { inject } from "vue";

import Sidebar from "@/components/Sidebar.vue";
import Offline from "@pages/Offline.vue";

const isOnline = inject('isOnline');

</script>

<template>
  <div class="w-full md:h-screen overflow-auto relative">
    <main class="flex flex-col md:flex-row !min-h-screen md:max-h-screen md:p-2.5 bg-white shadow-2xl 2xl:rounded-[40px] py-20 md:m-0 2xl:max-w-5/6 2xl:m-auto">
      <Sidebar/>
      <slot v-if="isOnline"/>
      <Offline v-else/>
    </main>
  </div>
</template>