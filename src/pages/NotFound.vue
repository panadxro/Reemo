<script setup>
import { useRouter } from 'vue-router'


import NoPageFound from '../components/atoms/NoPageFound.vue';
import Heading from '../components/atoms/Heading.vue';
import Input from '../components/molecules/Input.vue';

const router = useRouter()
</script>

<template>
  <div class="w-full bg-white min-h-screen flex flex-col items-center justify-center gap-2">
    <NoPageFound class="max-w-[300px] m-4"/>
    <Heading type="1" class="text-7xl text-red-500">404</Heading>
    <p class="text-lg font-bold">Lo siento, la página que estás buscando no existe.</p>
    <p class="text-gray-500 text-sm">La dirección que ingresaste es incorrecta o fue eliminada.</p>
    <Input
      type="button"
      text="Volver al inicio"
      variant="secondary"
      class="!w-fit"
      @click="router.push('/')"
      />
  </div>
</template>