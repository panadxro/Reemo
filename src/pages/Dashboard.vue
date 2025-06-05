<script setup>
import { onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores';

import RentStatusDetails from '@/components/organisms/rental/RentStatusDetails.vue';


const props = defineProps({
  id: {
    type: String,
    required: true,
  }
});

const authStore = useAuthStore();

const currentUser = computed(() => authStore.user);
const isOwnDashboard = computed(() => {
  return currentUser.value?.id === props.id;
});
 

</script>

<template>
  <div class="p-6 space-y-6 bg-gray-50 min-h-screen">

    <!-- Bienvenida -->
    <div class="bg-[#0a0a3c] text-white rounded-2xl p-6">
      <h1 class="text-2xl font-bold mb-2">¡Bienvenido a Reemo! 🚘✨</h1>
      <p class="mb-4">Gestioná tus autos disponibles y respondé las solicitudes de alquiler desde este panel centralizado.</p>
      <p class="text-blue-300">Recordá mantener actualizada la disponibilidad de tus vehículos para no perder viajes.</p>
    </div>

    <!-- Solicitudes y CTA -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
      <!-- Solicitudes -->
      <div class="bg-white rounded-2xl p-4 shadow">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold mb-4">Solicitudes de alquiler</h3>
          <a href="#" class="text-blue-600 text-sm">Ver más</a>
        </div>
        <!-- <div class="flex items-center gap-4 border-b pb-4 mb-4">
          <img src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e" alt="Car" class="w-16 h-16 object-cover rounded-lg" />
          <div>
            <p><span class="font-semibold">Vehículo:</span> Focus 2018</p>
            <p><span class="font-semibold">Inquilino:</span> Yow</p>
            <p class="text-sm text-gray-500">Inicia: 26/5/2025, 08:00</p>
            <p class="text-sm font-semibold mt-1">Total: $53.233,33</p>
          </div>
        </div> -->
        <!-- Botón -->
        <!-- <button class="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded-lg">Ver todas</button> -->

        <div v-if="isOwnDashboard" class="">
          <RentStatusDetails />
        </div>
        <!-- <div v-else class="history bg-primary-900 rounded-[40px] px-5 py-7"
          v-if="!$route.matched.some(route => route.name === 'PrivateChat')">
          <div class="flex items-center justify-between">
            <h1 class="text-white">Historial</h1>
            <a href="" class="text-white">Ver más</a>
          </div>
          <div class="flex flex-col justify-center items-center h-full text-white">
            <p class=" text-pretty font-semibold opacity-50">Historial no disponible</p>
          </div>
        </div> -->
        
      </div>

      <!-- CTA Buscar autos -->
      <div class="bg-cyan-100 rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold mb-2">¡Tu viaje comienza acá!</h3>
          <p class="text-gray-700">Alquilá con Reemo fácil, rápido y seguro.</p>
        </div>
        <button class="mt-6 bg-[#0a0a3c] text-white font-medium py-3 rounded-lg">Buscar autos</button>
      </div>
      
    </div>

    <!-- Autos más cercanos y Tracking -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      
    <!-- Autos más cercanos -->
    <div>
      <div class="flex justify-between items-center mb-2">
        <h2 class="text-lg font-semibold">Autos más cercanos a tu zona</h2>
        <a href="#" class="text-blue-600 text-sm">Ver más</a>
      </div>
      <div class="space-y-3">
        <div class="flex items-center bg-white p-4 rounded-2xl justify-between">
          <div class="flex items-center space-x-4">
            <img 
              src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e"
              alt="Auto"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p class="text-sm text-gray-500">Ford</p>
              <p class="font-semibold">Focus, 2018</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Nuevo</span>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Disponible</span>
          </div>
          <p class="text-blue-700 font-bold">$50k/hr</p>
        </div>

        <!-- Auto extra -->
        <div class="flex items-center bg-white p-4 rounded-2xl justify-between">
          <div class="flex items-center space-x-4">
            <img 
              src="https://images.unsplash.com/photo-1563729784474-d77dbb933a9e"
              alt="Auto"
              class="w-16 h-16 object-cover rounded-lg"
            />
            <div>
              <p class="text-sm text-gray-500">Audi</p>
              <p class="font-semibold">A3, 2021</p>
            </div>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Disponible</span>
          </div>
          <p class="text-blue-700 font-bold">$80k/hr</p>
        </div>

      </div>
    </div>

      <!-- Tracking -->
       <div class="bg-black text-white p-4 rounded-2xl shadow overflow-hidden">
        <div class="flex justify-between items-center mb-2">
          <h2 class="text-lg font-semibold">Tracking</h2>
          <a href="#" class="text-blue-400 text-sm">Ver más</a>
        </div>
        <img 
          src="" 
          alt="Mapa"
          class="rounded-lg contain-content"
        />
      </div>

    </div>

    <!-- Resumen -->
    <div class="bg-white rounded-2xl p-6 shadow">
      <h3 class="text-lg font-bold mb-4">Resumen de actividad</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
        <div>
          <p class="text-2xl font-bold">12</p>
          <p class="text-sm text-gray-500">Alquileres</p>
        </div>
        <div>
          <p class="text-2xl font-bold">5</p>
          <p class="text-sm text-gray-500">Solicitudes</p>
        </div>
        <div>
          <p class="text-2xl font-bold">3</p>
          <p class="text-sm text-gray-500">Vehículos activos</p>
        </div>
        <div>
          <p class="text-2xl font-bold">$250k</p>
          <p class="text-sm text-gray-500">Ganancias</p>
        </div>
      </div>
    </div>

  </div>
</template>



