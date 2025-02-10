<script>
export default {
  name: "PopoverPublication",
  props: {
    isOwner: Boolean,
    isAvailable: Boolean,
    loading: Boolean,
    onDelete: Function,
    onToggleAvailability: Function
  },
  data() {
    return {
      isVisible: false,
    };
  },
  methods: {
    togglePopover() {
      this.isVisible = !this.isVisible;
    },
    handleClickOutside(event) {
      if (this.$refs.popover && !this.$refs.popover.contains(event.target) && !this.$el.contains(event.target)) {
        this.isVisible = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  unmounted() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<template>
  <div v-if="isOwner" class="flex items-end flex-col z-5 relative">
    <button @click="togglePopover" type="button" class="flex w-fit justify-end rounded-full p-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256"><path fill="currentColor" d="M112 60a16 16 0 1 1 16 16a16 16 0 0 1-16-16m16 52a16 16 0 1 0 16 16a16 16 0 0 0-16-16m0 68a16 16 0 1 0 16 16a16 16 0 0 0-16-16"/></svg>
    </button>
    <div
      v-if="isVisible"
      ref="popover"
      class="absolute z-50 top-full -right-0 w-64 text-sm bg-white border border-gray-200 rounded-lg shadow-lg"
    >
      <div class="px-3 py-2">
        <!-- Le podemos agregar @click="togglePopover" para que se cierre cuando se toca, pero si toca fuera de algun boton se cierra igual.
          Tenemos que agregar avisos antes de borrar por ejemplo -->
        <div 
          v-if="loading"
          class="flex items-center justify-center w-fit mx-auto"
        >
          <div role="status">
            <svg
              aria-hidden="true"
              class="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
          </div>
        </div>

        <div 
          v-if="isOwner" 
          @click="onDelete" 
          class="flex items-center justify-between space-x-2 cursor-pointer mb-5 hover:text-red-400"
        >
          <p>Eliminar Vehículo</p>
          <button>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M9 3v1H4v2h1v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6h1V4h-5V3zM7 6h10v13H7zm2 2v9h2V8zm4 0v9h2V8z"/></svg>
          </button>
        </div>

        <div 
          v-if="isOwner" 
          @click="onToggleAvailability" 
          class="flex items-center justify-between space-x-2 cursor-pointer" 
          :class="isAvailable ? 'hover:text-yellow-400' : 'hover:text-green-400'"
        >
          <p>{{ isAvailable ? 'Marcar como No Disponible' : 'Marcar como Disponible' }}</p>
          <button>
            <svg v-if="isAvailable" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
              <path fill="currentColor" fill-rule="evenodd" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10m-4.906-3.68L18.32 7.094A8 8 0 0 1 7.094 18.32M5.68 16.906A8 8 0 0 1 16.906 5.68z"/>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 16 16">
              <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="m2.75 8.75l3.5 3.5l7-7.5" />
            </svg>
          </button>
        </div>
        
      </div>
    </div>
  </div>
</template>
  

  