<script setup>
import { useRouter } from 'vue-router'


import NoPageFound from '../components/atoms/NoPageFound.vue';
import Heading from '../components/atoms/Heading.vue';
import Input from '../components/molecules/Input.vue';

const router = useRouter()
</script>

<template>
  <div class="w-full bg-white min-h-screen flex flex-col items-center justify-center gap-2 text-center">
    <NoPageFound class="w-[200px] 2xl:w-[300px]"/>
    <Heading type="1" class="large 2xl:!text-6xl text-red-500">404</Heading>
    <p class="text-lg 2xl:text-2xl font-bold">Lo sentimos, la página que estás buscando no existe.</p>
    <p class="text-gray-500 text-sm 2xl:text-base">La dirección que ingresaste es incorrecta o fue eliminada.</p>
    <Input
      type="button"
      text="Volver al inicio"
      variant="secondary"
      class="!w-fit"
      @click="router.push('/')"
      />
  </div>
</template>