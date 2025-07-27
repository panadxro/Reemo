<script>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@stores";
import { addAlert } from "../../services/alerts";
import { formatDate } from '../../libraries/date.js';
import { createCarValidationNotification } from "../../services/car/notifyRented.js";

import Heading from "@components/atoms/Heading.vue";
import Loading from "@icons/Loading.vue";
import Status from "../../components/molecules/Status.vue";
import Input from "../../components/molecules/Input.vue";
import Popover from "../../components/molecules/Popover.vue";
import SearchIcon from "@icons/Search.vue";
import BackButton from "@components/atoms/BackButton.vue";
import NoCarsRegister from "../../components/atoms/NoCarsRegister.vue";
import InvalidationModal from '@components/Admin/InvalidationModal.vue';

export default {
  name: "AdminCars",
  components: { Heading, Loading, Status, Input, Popover, SearchIcon, InvalidationModal, BackButton, NoCarsRegister },
  data() {
    return {
      openPopoverId: null,
      filter: 'all',
      searchQuery: '',
      isModalOpen: false,
      selectedCarForInvalidation: null,
    };
  },
  setup() {
    const adminStore = useAdminStore();
    const loading = ref(false);

    const cars = computed(() => {
      return adminStore.cars.map(car => {
        const owner = adminStore.users.find(user => user.id === car.ownerId);
        return { ...car, owner: owner || {} };
      });
    });

    onMounted(async () => {
      try {
        loading.value = true;
        const cars = await adminStore.fetchCars();
      } catch (error) {
        console.error("Error al obtener los autos:", error);
      } finally {
        loading.value = false;
      }
    });

    return {
      adminStore,
      cars
    };
  },
  methods: {
    toggleFiltro(filtro) {
      this.filter = filtro;
      this.searchQuery = '';
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
    // async updateValidation(car) {
    //   try {
    //     const newStatus = car.status.current === 'not-validated' ? 'validated' : 'not-validated';

    //     await this.adminStore.changeCarValidation(car.id, newStatus);
    //     await createCarValidationNotification(car, newStatus);

    //     car.status = newStatus;
    //     addAlert("Estado del vehículo actualizado con éxito", "success");
    //   } catch (error) {
    //     addAlert("Error al actualizar el estado del vehículo", "error");
    //   }
    // },
    openInvalidationModal(car) {
      this.selectedCarForInvalidation = car;
      this.isModalOpen = true;
      this.handleClosePopover(); // Cerrar el popover al abrir el modal
    },
    closeInvalidationModal() {
      this.isModalOpen = false;
      this.selectedCarForInvalidation = null;
    },
    async confirmInvalidation(reason) {
      const car = this.selectedCarForInvalidation;
      if (!car) return;

      try {
        // Llamar al store para cambiar el estado a 'not-validated'
        await this.adminStore.changeCarValidation(car.id, 'not-validated');
        // Enviar la notificación con el motivo
        await createCarValidationNotification(car, 'not-validated', reason);

        // Actualizar la UI (asumiendo que el store es reactivo)
        addAlert("Estado del vehículo actualizado con éxito", "success");
      } catch (error) {
        addAlert("Error al actualizar el estado del vehículo", "error");
      } finally {
        this.closeInvalidationModal();
      }
    },
    async validateCar(car) {
      try {
        await this.adminStore.changeCarValidation(car.id, 'available');
        await createCarValidationNotification(car, 'available');
        addAlert("Vehículo validado con éxito", "success");
      } catch (error) {
        addAlert("Error al validar el vehículo", "error");
      }
    }
  },
  computed: {
    carsFilter() {
      let filteredCars = this.cars; 

      if (this.filter === 'validados') {
        filteredCars = filteredCars.filter((cars) => cars.status.current !== 'not-validated');
      } else if (this.filter === 'no-validados') {
        filteredCars = filteredCars.filter((cars) => cars.status.current === 'not-validated');
      } 

      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filteredCars = filteredCars.filter(car => {
          const ownerName = `${car.owner.personalInfo?.firstName || ''} ${car.owner.personalInfo?.lastName || ''}`.toLowerCase();
          const carName = `${car.basicInfo.brand || ''} ${car.basicInfo.model || ''}`.toLowerCase();
          return ownerName.includes(query) || carName.includes(query);
        });
      }
      return filteredCars;
    }
  }
};
</script>

<template>
  <section class="w-full md:p-2.5 px-2.5 flex flex-col gap-6 overflow-hidden min-h-screen md:min-h-auto md:h-auto">
    <div class="flex items-center gap-5 gap-y-1.5 fixed md:static top-0 left-0 right-0 z-3 bg-white px-2.5 md:px-0 py-3 md:py-0 flex-wrap">
      <BackButton />
      <Heading :type="1" class="medium">Administrar vehículos</Heading>
    </div>
    <div class="flex flex-col md:flex-row justify-between items-center gap-4">
      <div class="flex flex-row gap-4 overflow-x-auto">
        <Input 
          type="button"
          text="Todos"
          variant="secondary"
          :outline="true"
          class="!w-fit"
          :input-class="filter === 'all' ? ' !bg-vibrant-light-800' : ''"
          @click="toggleFiltro('all')"
        />
        <Input 
          type="button"
          text="Validados"
          variant="secondary"
          :outline="true"
          class="!w-fit"
          :input-class="filter === 'validados' ? ' !bg-vibrant-light-800' : ''"
          @click="toggleFiltro('validados')"
        />
        <Input 
          type="button"
          text="Invalidados"
          variant="secondary"
          :outline="true"
          class="!w-fit"
          :input-class="filter === 'no-validados' ? ' !bg-vibrant-light-800' : ''"
          @click="toggleFiltro('no-validados')"
        />
      </div>
      <Input
        type="text"
        id="searchInput"
        name="searchInput"
        placeholder="Buscar autos de dueño"
        class="md:flex-0! md:min-w-fit!"
        icon-position="left"
        variant="secondary"
        :outline="false"
        v-model="searchQuery"
        >
        <template #icon>
          <SearchIcon />
        </template>
      </Input>
    </div>
    <table class="min-w-full bg-white h-full md:overflow-hidden flex flex-col gap-5">
      <thead class="md:mr-6">
        <tr class="flex w-full border-2 border-secondary-100 rounded-xl">
          <th class="py-2.5 px-5 flex flex-1">Vehículo</th>
          <th class="py-2.5 px-5 hidden md:flex flex-1">Dueño</th>
          <th class="py-2.5 px-5 w-20 hidden lg:flex">Año</th>
          <th class="py-2.5 px-5 flex-1 hidden lg:flex">Tipo</th>
          <th class="py-2.5 px-5 hidden sm:flex flex-1">Estado</th>
          <th class="py-2.5 px-5 w-32 hidden lg:flex">Fecha</th>
          <th class="py-2.5 px-5 flex-none w-24">Acción</th>
        </tr>
      </thead>
      <tbody class="box-white flex flex-col gap-5 md:h-full md:overflow-y-scroll md:pr-2">
        <tr 
          v-for="(car, index) in carsFilter" 
          :key="car.id" 
          class="flex w-full max-h-16 border-2 border-secondary-100 rounded-xl font-semibold">
          <td class="py-2.5 px-5 flex flex-1 items-center gap-2.5">
            <figure>
              <img :src="car.photos[0]" alt="Imagen del auto" class="w-14 h-8 object-cover rounded-sm" />
            </figure>
            <div>
              <p class="text-sm font-semibold ">{{ car.basicInfo.brand }}</p>
              <p class="text-xl">{{ car.basicInfo.model }}</p>
            </div>
          </td>
          <td class="py-2.5 px-5 hidden md:flex flex-1">
            <router-link :to="`/user/${car.ownerId}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="car.owner.personalInfo?.profilePhoto" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
              <p class="hover:underline">{{ car.owner.personalInfo?.firstName }} {{ car.owner.personalInfo?.lastName }}</p>
            </router-link>
          </td>
          <td class="py-2.5 px-5 w-20 items-center hidden lg:flex">{{ car.basicInfo.year }}</td>
          <td class="py-2.5 px-5 flex-1 items-center hidden lg:flex">{{ car.basicInfo.type }}</td>
          <td class="py-2.5 px-5 hidden sm:flex flex-1"><Status :status="car.status.current" /></td>
          <td class="py-2.5 px-5 items-center w-32  hidden lg:flex">{{ formatDate(car.createdAt) }}</td>
          <td class="py-2.5 px-5 flex justify-center relative w-24 items-center">
            <Popover
              :items="[
                { label: 'Ver auto', to: `/car/${car.id}` },
                { label: 'Chat', to: `/user/${car.ownerId}/chat` },
                car.status.current !== 'not-validated'
                  ? { label: 'Invalidar', action: () => openInvalidationModal(car), class: 'text-red-500' }
                  : { label: 'Validar', action: () => validateCar(car) }
              ]"
              :isOpen="openPopoverId === index"
              :popoverId="index"
              @toggle-popover="handleTogglePopover"
              @close-popover="handleClosePopover"
            />
          </td>
        </tr>
        <div v-if="carsFilter.length === 0" class="flex flex-col justify-center items-center gap-5 h-full">
          <NoCarsRegister class="max-w-[150px]"/>
          <Heading :type="3" class="text-gray-500 mb-2 mt-4 text-center">
            No hay autos registrados aún.<br/>
            Regresa más tarde.
          </Heading>
        </div>
      </tbody>
    </table>
    <InvalidationModal
      :isOpen="isModalOpen"
      :car="selectedCarForInvalidation"
      @close="closeInvalidationModal"
      @confirm="confirmInvalidation"
    />
  </section>
</template>