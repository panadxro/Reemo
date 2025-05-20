<script>
import { subscribeToAuthState } from "@services/auth.js";
import { updateRentalStatus, fetchRentalRequests } from '@services/rentedCarService.js';

import Notification from '@icons/Notification.vue';

let unsubscribeAuth = () => { };
let unsubscribeRequests = () => { }; 

export default {
  name: "AlertRented",
  components: { Notification },
  data() {
    return {
      loggedUser: {},
      pendingRequests: [],
      isVisible: true,
    };
  },
  methods: {
    async fetchRentalRequests() {
      try {
        unsubscribeRequests = fetchRentalRequests(this.loggedUser.id, (requests) => {
          this.pendingRequests = requests.filter(request => request.status === 'pendiente');
          // console.log('Solicitudes pendientes:', this.pendingRequests);
        });
      } catch (error) {
        console.error("Error al obtener las solicitudes de alquiler:", error);
      }
    },

    async acceptRequest(reqId) {
    try {
      await updateRentalStatus(reqId, 'aceptado');
      this.pendingRequests = this.pendingRequests.filter(request => request.id !== reqId);
      this.closeView();
    } catch (error) {
      console.error("Error al aceptar la solicitud:", error);
    }
  },

  async rejectRequest(reqId) {
    try {
      await updateRentalStatus(reqId, 'rechazado');
      this.pendingRequests = this.pendingRequests.filter(request => request.id !== reqId);
      this.closeView();
    } catch (error) {
      console.error("Error al rechazar la solicitud:", error);
    }
  },

    closeView() {
      this.isVisible = false;
    }
  },
  mounted() {
    unsubscribeAuth = subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      if (this.loggedUser && this.loggedUser.id) {
        this.fetchRentalRequests(); 
      }
    });
  },
  unmounted() {
    unsubscribeAuth();
    if (typeof unsubscribeRequests === 'function') {
      unsubscribeRequests();
    }
  },
};
</script>

<template>
  <!-- Botón de notificaciones -->
  <button 
    type="button" 
    data-dropdown-toggle="notification-dropdown" 
    class="flex items-center justify-center  rounded-full transition-colors duration-300 cursor-pointer "
    active-class="bg-vibrant-light-800 hover:bg-vibrant-light-800" 
    >
    <!-- Icono de campana -->
    <Notification/>
    <!-- Indicador de notificaciones -->
    <div v-if="pendingRequests.length >= 1 && isVisible">
      <div class="absolute inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-white bg-red-500 border-2 rounded-full -top-0 -end--2">{{ pendingRequests.length }}</div>
    </div>
  </button>

  <!-- Dropdown de notificaciones -->
  <div class="hidden z-50 my-4 max-w-sm max-h-80 text-base list-none bg-white rounded-sm divide-y divide-gray-100 shadow-lg" id="notification-dropdown">
    <div class="block py-2 px-4 text-base font-medium text-center text-gray-700 bg-gray-50">
      Notificaciones
    </div>

    <!-- Lista de solicitudes pendientes -->
    <div v-if="pendingRequests.length >= 1 && isVisible" class="overflow-y-scroll max-h-60">
      <div v-for="request in pendingRequests" :key="request.id" class="border p-4 mb-4">
        <div class="inline-flex items-center justify-center shrink-0 w-12 h-12 rounded-lg">
          <img class="w-12 h-12 rounded-full" :src="request.photoURL" alt="Avatar del usuario">
        </div>
        <div class="ms-3 text-sm font-normal">
          <span class="mb-1 text-sm font-semibold text-gray-900">Solicitud de Alquiler</span>
          <div class="mb-2 text-sm font-normal">
            <span class="mb-1 text-sm font-semibold text-blue-900"><router-link :to="`/user/${request.user_id}`">{{ request.name }}</router-link></span> quiere alquilar <router-link :to="`/CarDetails/${request.carId}`">{{ request.carMarca }} {{ request.carModelo }}</router-link> Responde cuanto antes.
          </div>
          <div class="mb-2 text-sm font-normal">Estado de solicitud: 
            <span class="mb-1 text-sm font-semibold text-blue-900">{{ request.status }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <div>
              <a @click="acceptRequest(request.id)"
                class="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-white bg-secondary-900 rounded-lg hover:bg-secondary-500 focus:ring-4 focus:outline-hidden focus:ring-secondary-300">Aceptar</a>
            </div>
            <div>
              <a @click="rejectRequest(request.id)"
                class="cursor-pointer inline-flex justify-center w-full px-2 py-1.5 text-xs font-medium text-center text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 focus:ring-4 focus:outline-hidden focus:ring-gray-200">Rechazar</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Mensaje cuando no hay solicitudes -->
    <div v-else class="ms-3 text-sm font-normal px-5 py-5">  
      <div class="mb-2 text-sm font-normal">Estado de solicitud: 
        <span class="mb-1 text-sm font-semibold text-blue-900">No hay solicitudes...</span>
      </div>
    </div>

    <!-- Enlace para ver todas las notificaciones -->
    <a href="#" class="block py-2 text-base font-medium text-center text-gray-900 bg-gray-50 hover:bg-gray-100">
      <div class="inline-flex items-center">
        <svg aria-hidden="true" class="mr-2 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z"></path>
          <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd"></path>
        </svg>
        Ver todo
      </div>
    </a>
  </div>
</template>