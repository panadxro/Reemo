<script setup>
import { useRouter } from 'vue-router'


import NoValidation from '../components/atoms/NoValidation.vue';
import Heading from '../components/atoms/Heading.vue';
import Input from '../components/molecules/Input.vue';

const router = useRouter()
</script>

<template>
  <div class="w-full bg-white min-h-screen flex flex-col items-center justify-center gap-2">
    <NoValidation class="max-w-[300px] m-4"/>
    <Heading type="1" class="text-7xl text-red-500">No estás verificado</Heading>
    <p class="text-lg font-bold">Lo sentimos, tu usuario no está validado.</p>
    <p class="text-gray-500 text-sm">Serás notificado sobre el estado de tu cuenta en pocos días.</p>
    <Input
      type="button"
      text="Volver al inicio"
      variant="secondary"
      class="!w-fit"
      @click="router.push('/')"
      />
  </div>
</template>