<script>
import { useRegisterSW } from 'virtual:pwa-register/vue'
import { useRouter } from 'vue-router'

import Heading from '@components/atoms/Heading.vue'
import Input from '@components/molecules/Input.vue'
import NoConection from '@components/atoms/NoConection.vue'


export default {
  components: { NoConection, Heading },
  setup() {
    const { offlineReady, updateServiceWorker, needRefresh } = useRegisterSW()
    const router = useRouter()
    return { router, offlineReady, updateServiceWorker, needRefresh }
  }
}
</script>

<template>
  <div class="w-full min-h-full flex-1 bg-white flex flex-col items-center justify-center gap-2 text-center">
    <NoConection class="w-[200px] 2xl:w-[300px]"/>
    <Heading type="1" class="large 2xl:!text-6xl text-red-500">No tenés conexión</Heading>
    <p class="text-lg 2xl:text-2xl font-bold">Parece que estás offline. Revisá tu conexión a internet o probá en un lugar con mejor señal.</p>
    <p class="text-gray-500 text-sm 2xl:text-base">Mientras tanto, podés revisar contenido disponible offline o volver a la página anterior.</p>
    <Input
      v-if="needRefresh"
      type="button"
      text="Actualizar"
      variant="secondary"
      class="!w-fit"
      @click="updateServiceWorker()"
      />
  </div>
</template>