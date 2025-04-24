<script>
import { getAvailableCarsForAdmin } from "../../services/car-service.js";
import { subscribeToAuthState } from "../../services/auth.js";
import { updateCarValidation } from "../../services/car-service.js";
import { addAlert } from "../../services/alerts";
import { formatDate } from '../../libraries/date.js';
import { getUserById } from '../../services/users.js';

import Heading from "@components/atoms/Heading.vue";
import Loading from "@icons/Loading.vue";
import Status from "../../components/molecules/Status.vue";
import Input from "../../components/molecules/Input.vue";
import Popover from "../../components/molecules/Popover.vue";

export default {
  components: { Heading, Loading, Status, Input, Popover },
  data() {
    return {
      cars: [],
      loggedUser: {
        id: null,
        email: null,
      },
      loading: false,
      openPopoverId: null,
      filtroActual: "todos",
    };
  },
  methods: {
    async fetchCars() {
      this.loading = true;
      try {
        const cars = await getAvailableCarsForAdmin();
        const carsWithUser = await Promise.all(
          cars.map(async (car) => {
            const user = await getUserById(car.user_id);
            return { ...car, user: user || {} };
          })
        );
        // console.log("Datos de carsWithUser:", carsWithUser);
        this.cars = carsWithUser;
      } catch (error) {
        console.error("Error al buscar autos:", error);
      } finally {
        this.loading = false;
      }
    },
    toggleFiltro(filtro) {
      this.filtroActual = filtro;
    },
    formatDate(timestamp) {
      if (!timestamp) return "Fecha no disponible";
      return formatDate(timestamp);
    },
    goToCarDetails(id) {
      this.$router.push({ name: 'CarDetails', params: { id: id } });
    },
    // Manejar la apertura/cierre del popover
    handleTogglePopover(popoverId) {
      this.openPopoverId = this.openPopoverId === popoverId ? null : popoverId;
    },
    // Cerrar el popover cuando se hace scroll o clic fuera
    handleClosePopover() {
      this.openPopoverId = null;
    },
    async updateValidation(carId, isValidated) {
      try {
        const response = await updateCarValidation(carId, isValidated);
        if (response.success) {
          const car = this.cars.find((car) => car.id === carId);
          if (car) {
            car.isValidated = isValidated; // Actualiza isValidated
            car.status = isValidated ? "validated" : "not-validated"; // Actualiza status
          }
          addAlert(response.message, "success");
        } else {
          addAlert(response.message, "error");
        }
      } catch (error) {
        console.error("Error al actualizar la validación del auto:", error);
        addAlert("Error al actualizar la validación del auto", "error");
      }
    }
  },
  computed: {
    carsFiltrados() {
      if (this.filtroActual === "habilitados") {
        return this.cars.filter((car) => car.status === "validated");
      } else if (this.filtroActual === "deshabilitados") {
        return this.cars.filter((car) => car.status === "not-validated");
      }
      return this.cars;
    },
  },
  mounted() {
    subscribeToAuthState((newUserData) => {
      this.loggedUser = newUserData;
      this.fetchCars();
    });
  },
};
</script>

<template>
  <section class="w-full p-2.5 flex flex-col gap-6 overflow-hidden">
    <Heading :type="1" class="medium">Administrar Vehículos</Heading>
    <div class="flex flex-row gap-4">
      <Input 
        type="button"
        text="Todos"
        variant="secondary"
        class="cursor-pointer"
        :class="filtroActual === 'todos' ? ' bg-vibrant-light-900' : ''"
        @click="toggleFiltro('todos')"
      />
      <Input 
        type="button"
        text="Validados"
        variant="secondary"
        class="cursor-pointer"
        :class="filtroActual === 'habilitados' ? ' bg-vibrant-light-900' : ''"
        @click="toggleFiltro('habilitados')"
      />
      <Input 
        type="button"
        text="Invalidados"
        variant="secondary"
        class="cursor-pointer"
        :class="filtroActual === 'deshabilitados' ? ' bg-vibrant-light-900' : ''"
        @click="toggleFiltro('deshabilitados')"
      />
    </div>
    <table class="min-w-full bg-white h-full overflow-hidden flex flex-col gap-5">
      <thead class="mr-4">
        <tr class="flex w-full border-2 border-secondary-100 rounded-xl">
          <th class="py-2.5 px-5 flex flex-1">Vehículo</th>
          <th class="py-2.5 px-5 flex flex-1">Usuarios</th>
          <th class="py-2.5 px-5 flex w-20">Año</th>
          <th class="py-2.5 px-5 flex flex-1">Tipo</th>
          <th class="py-2.5 px-5 flex flex-1">Estado</th>
          <th class="py-2.5 px-5 flex w-32">Fecha</th>
          <th class="py-2.5 px-5 flex-none w-24">Accion</th>
        </tr>
      </thead>
      <tbody class="flex flex-col gap-5 h-full overflow-y-scroll">
        <tr 
          v-for="(car, index) in carsFiltrados" 
          :key="car.id" 
          class="flex w-full max-h-16 border-2 border-secondary-100 rounded-xl font-semibold">
          <td class="py-2.5 px-5 flex flex-1 items-center gap-2.5">
            <figure>
              <img :src="car.personalInfo.profilePhoto" alt="Imagen del auto" class="w-14 h-8 object-cover rounded-sm" />
            </figure>
            <div>
              <p class="text-sm font-semibold ">{{ car.marca }}</p>
              <p class="text-xl">{{ car.modelo }}</p>
            </div>
          </td>
          <td class="py-2.5 px-5 flex flex-1">
            <router-link :to="`/user/${car.user_id}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="car.user.photoURL" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
              <p class="hover:underline">{{ car.user.name }} {{ car.user.lastName }}</p>
            </router-link>
          </td>
          <td class="py-2.5 px-5 flex w-20 items-center">{{ car.año }}</td>
          <td class="py-2.5 px-5 flex flex-1 items-center">{{ car.chasis }}</td>
          <td class="py-2.5 px-5 flex flex-1"><Status status="registrado" /></td>
          <td class="py-2.5 px-5 flex items-center w-32 font-">{{ formatDate(car.created_at) }}</td>
          <td class="py-2.5 px-5 flex justify-center relative w-24 items-center">
            <Popover
              :items="[
                { label: 'Ver auto', to: `/car/${car.id}` },
                { label: 'Chat', to: `/user/${car.user_id}/chat` },
                { label: car.isValidated ? 'Invalidar' : 'Validar', action: () => updateValidation(car.id, !car.isValidated), class: `car.isValidated ? 'text-red-500' : ''` },
              ]"
              :isOpen="openPopoverId === index"
              :popoverId="index"
              @toggle-popover="handleTogglePopover"
              @close-popover="handleClosePopover"
            />
          </td>
        </tr>        
      </tbody>
    </table>
  </section>
</template>