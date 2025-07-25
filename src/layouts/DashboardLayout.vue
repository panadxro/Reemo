<script setup>
import { onMounted, ref } from "vue";

import Sidebar from "@/components/Sidebar.vue";
/* 
onMounted(() => {
  try {
    const sessionData = sessionStorage.getItem('auth_session_history');
    authSession.value = sessionData ? JSON.parse(sessionData) : null;
  } catch (error) {
    console.error("Error parsing auth session:", error);
    authSession.value = null;
  }
}); */
</script>

<template>
  <div class="w-full md:h-screen overflow-auto relative">
    <main class="flex flex-col md:flex-row !min-h-screen md:max-h-screen md:p-2.5 bg-white shadow-2xl 2xl:rounded-[40px] py-20 md:m-0 2xl:max-w-5/6 2xl:m-auto">
      <Sidebar/>
      <slot/>
    </main>
  </div>
</template>