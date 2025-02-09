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

export default {
  components: { Heading, Loading, Status },
  data() {
    return {
      cars: [],
      loggedUser: {
        id: null,
        email: null,
      },
      loading: false,
      popoverIndex: null,
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
            return { ...car, user };
          })
        );
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
    togglePopover(index) {
      this.popoverIndex = this.popoverIndex === index ? null : index;
    },
    async updateValidation(carId, isValidated) {
      try {
        const response = await updateCarValidation(carId, isValidated);
        if (response.success) {
          const car = this.cars.find((car) => car.id === carId);
          if (car) car.isValidated = isValidated;
          addAlert(response.message, "success");
        } else {
          addAlert(response.message, "error");
        }
      } catch (error) {
        console.error("Error al actualizar la validación del auto:", error);
        addAlert("Error al actualizar la validación del auto", "error");
      }
    },
  },
  computed: {
    carsFiltrados() {
      if (this.filtroActual === "habilitados") {
        return this.cars.filter((car) => car.isValidated);
      } else if (this.filtroActual === "deshabilitados") {
        return this.cars.filter((car) => !car.isValidated);
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
  <Heading :type="2" class="m-6 text-center">Administrar Vehículos</Heading>
  <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
    <Loading role="status" />
  </div>

  <div class="flex justify-center space-x-4 my-4">
    <button
      @click="toggleFiltro('todos')"
      :class="['px-4 py-2 rounded-full', filtroActual === 'todos' ? 'bg-cyan-500 text-white' : 'bg-cyan-100 text-gray-700']"
    >
      Todos
    </button>
    <button
      @click="toggleFiltro('habilitados')"
      :class="['px-4 py-2 rounded-full', filtroActual === 'habilitados' ? 'bg-cyan-500 text-white' : 'bg-cyan-100 text-gray-700']"
    >
      Validados
    </button>
    <button
      @click="toggleFiltro('deshabilitados')"
      :class="['px-4 py-2 rounded-full', filtroActual === 'deshabilitados' ? 'bg-cyan-500 text-white' : 'bg-cyan-100 text-gray-700']"
    >
      Invalidados
    </button>
  </div>

  <div class="max-w-md mx-auto md:max-w-(--breakpoint-xl) m-4">
    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th class="py-3 px-4">Vehículo</th>
          <th class="py-3 px-4">Usuarios</th>
          <th class="py-3 px-4">Año</th>
          <th class="py-3 px-4">Tipo</th>
          <th class="py-3 px-4">Estado</th>
          <th class="py-3 px-4">Fecha</th>
          <th class="py-3 px-4">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(car, index) in carsFiltrados" :key="index" class="text-center">
          <td class="py-3 px-4 flex gap-4">
            <div>
              <img :src="car.images[0]" alt="Imagen del auto" class="w-16 h-16 object-cover rounded-sm" />
            </div>
            <div>
              <p class="text-lg font-semibold">{{ car.marca }}</p>
              <p>{{ car.modelo }}</p>
            </div>
          </td>
          <td class="py-3 px-4">
            <router-link :to="`/ProfileOwner/${car.user_id}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="car.user.photoURL" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
              <p class="hover:underline">{{ car.user.name }} {{ car.user.lastName }}</p>
            </router-link>
          </td>
          <td class="py-3 px-4">{{ car.año }}</td>
          <td class="py-3 px-4">{{ car.chasis }}</td>
          <td class="py-3 px-4"><Status :isValidated="car.isValidated" /></td>
          <td class="py-3 px-4">{{ formatDate(car.created_at) }}</td>
          <td class="py-3 px-4 relative">
            <div class="relative inline-block">
              <button @click="togglePopover(index)" class="text-gray-500 hover:text-gray-700">&#8942;</button>
              <div
                v-if="popoverIndex === index"
                class="absolute right-0 mt-2 w-40 bg-white border border-secondary-300 rounded-lg shadow-xl z-10"
              >
                <ul class="py-2">
                  <li>
                    <button @click="goToCarDetails(car.id)" class="block w-full text-left px-4 py-2 text-sm text-primary-900 font-semibold hover:bg-gray-100">
                      Ver detalle
                    </button>
                  </li>
                  <li>
                    <router-link :to="`/ProfileOwner/${car.user_id}/chat`" class="block w-full text-left px-4 py-2 text-sm text-primary-900 font-semibold hover:bg-gray-100">Enviar Mensaje</router-link>
                  </li>
                  <li v-if="!car.isValidated">
                    <button @click="updateValidation(car.id, true)" class="block w-full text-left px-4 py-2 text-sm text-green-600 font-semibold hover:bg-gray-100">
                      Validar
                    </button>
                  </li>
                  <li v-else>
                    <button @click="updateValidation(car.id, false)" class="block w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-gray-100">
                      Invalidar
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>