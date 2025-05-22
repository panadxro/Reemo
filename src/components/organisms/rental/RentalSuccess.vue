<script>
  
  export default {
    props: {
      rentalId: {
        type: String,
        default: null,
      }
    },
    emits: ['close-modal', 'view-profile'],
    methods: {
      closeModal(){
        this.$emit('close-modal');
      },
      goToProfile(){
        this.$emit('view-profile');
      }
    },
  }
  
</script>

<template>
  <div class="bg-primary-500/50 fixed inset-0 flex items-center justify-center z-50 p-4 ">
    <div class="bg-primary-800 p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-md text-white text-center">
      <div class="mb-6">
        <svg class="w-16 h-16 mx-auto text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      </div>
      <h2 class="text-2xl sm:text-3xl font-bold mb-3">¡Solicitud Enviada!</h2>
      <p class="text-gray-300 mb-6 sm:mb-8">
        Tu solicitud de alquiler ha sido enviada correctamente. El propietario será notificado y se pondrá en contacto contigo pronto.
      </p>
      <div class="space-y-3 sm:space-y-0 sm:flex sm:space-x-4">
        <button
          @click="goToProfile"
          class="w-full sm:w-auto flex-1 bg-secondary-500 hover:bg-secondary-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
        >
          Ver mis alquileres
        </button>
        <button
          @click="closeModal"
          class="w-full sm:w-auto flex-1 bg-primary-700 hover:bg-primary-600 text-gray-300 font-semibold py-3 px-6 rounded-lg transition duration-150 ease-in-out"
        >
          Cerrar
        </button>
      </div>
    </div>
  </div>
</template>