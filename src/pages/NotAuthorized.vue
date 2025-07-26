<script setup>
import { useRouter } from 'vue-router'


import NoAuth from '../components/atoms/NoAuth.vue';
import Heading from '../components/atoms/Heading.vue';
import Input from '../components/molecules/Input.vue';

const router = useRouter()
</script>

<template>
  <div class="w-full bg-white min-h-screen flex flex-col items-center justify-center gap-2">
    <NoAuth class="max-w-[300px] m-4"/>
    <Heading type="1" class="text-7xl text-red-500">No tenés autorización</Heading>
    <p class="text-lg font-bold">Lo sentimos, no estás autorizado para acceder a esta página.</p>
    <p class="text-gray-500 text-sm">La dirección que ingresaste pertenece a los administradores.</p>
    <Input
      type="button"
      text="Volver al inicio"
      variant="secondary"
      class="!w-fit"
      @click="router.push('/')"
      />
  </div>
</template>