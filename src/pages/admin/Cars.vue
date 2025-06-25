<script>
import { ref, computed, onMounted } from "vue";
import { useAdminStore } from "@stores";
import { addAlert } from "../../services/alerts";
import { formatDate } from '../../libraries/date.js';

import Heading from "@components/atoms/Heading.vue";
import Loading from "@icons/Loading.vue";
import Status from "../../components/molecules/Status.vue";
import Input from "../../components/molecules/Input.vue";
import Popover from "../../components/molecules/Popover.vue";
import SearchIcon from "@icons/Search.vue";

export default {
  name: "AdminCars",
  components: { Heading, Loading, Status, Input, Popover, SearchIcon },
  data() {
    return {
      openPopoverId: null,
      filter: 'all',
      searchQuery: ''
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
    async updateValidation(car) {
      try {
        const newStatus = car.status.current === 'not-validated' ? 'validated' : 'not-validated';
        await this.adminStore.changeCarValidation(car.id, newStatus);
        car.status = newStatus;
        addAlert("Estado del vehículo actualizado con éxito", "success");
      } catch (error) {
        addAlert("Error al actualizar el estado del vehículo", "error");
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
          return ownerName.includes(query);
        });
      }
      return filteredCars;
    }
  }
};
</script>

<template>
  <section class="w-full p-2.5 flex flex-col gap-6 overflow-hidden">
    <Heading :type="1" class="medium">Administrar Vehículos</Heading>
    <div class="flex justify-between items-center">
      <div class="flex flex-row gap-4">
        <Input 
          type="button"
          text="Todos"
          variant="secondary"
          class="cursor-pointer flex-0!"
          :class="filter === 'all' ? ' bg-vibrant-light-900' : ''"
          @click="toggleFiltro('all')"
        />
        <Input 
          type="button"
          text="Validados"
          variant="secondary"
          class="cursor-pointer flex-0!"
          :class="filter === 'validados' ? ' bg-vibrant-light-900' : ''"
          @click="toggleFiltro('validados')"
        />
        <Input 
          type="button"
          text="Invalidados"
          variant="secondary"
          class="cursor-pointer flex-0!"
          :class="filter === 'no-validados' ? ' bg-vibrant-light-900' : ''"
          @click="toggleFiltro('no-validados')"
        />
      </div>
      <Input
        type="text"
        id="searchInput"
        name="searchInput"
        placeholder="Buscar autos de dueño"
        class="mb-2 lg:mb-0 flex-0! min-w-fit!"
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
    <table class="min-w-full bg-white h-full overflow-hidden flex flex-col gap-5">
      <thead class="mr-4">
        <tr class="flex w-full border-2 border-secondary-100 rounded-xl">
          <th class="py-2.5 px-5 flex flex-1">Vehículo</th>
          <th class="py-2.5 px-5 flex flex-1">Dueño</th>
          <th class="py-2.5 px-5 flex w-20">Año</th>
          <th class="py-2.5 px-5 flex flex-1">Tipo</th>
          <th class="py-2.5 px-5 flex flex-1">Estado</th>
          <th class="py-2.5 px-5 flex w-32">Fecha</th>
          <th class="py-2.5 px-5 flex-none w-24">Accion</th>
        </tr>
      </thead>
      <tbody class="flex flex-col gap-5 h-full overflow-y-scroll pr-2">
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
          <td class="py-2.5 px-5 flex flex-1">
            <router-link :to="`/user/${car.ownerId}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="car.owner.personalInfo?.profilePhoto" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
              <p class="hover:underline">{{ car.owner.personalInfo?.firstName }} {{ car.owner.personalInfo?.lastName }}</p>
            </router-link>
          </td>
          <td class="py-2.5 px-5 flex w-20 items-center">{{ car.basicInfo.year }}</td>
          <td class="py-2.5 px-5 flex flex-1 items-center">{{ car.basicInfo.type }}</td>
          <td class="py-2.5 px-5 flex flex-1"><Status :status="car.status.current" /></td>
          <td class="py-2.5 px-5 flex items-center w-32 font-">{{ formatDate(car.createdAt) }}</td>
          <td class="py-2.5 px-5 flex justify-center relative w-24 items-center">
            <Popover
              :items="[
                { label: 'Ver auto', to: `/car/${car.id}` },
                { label: 'Chat', to: `/user/${car.ownerId}/chat` },
                { label: car.status.current !== 'not-validated' ? 'Invalidar' : 'Validar', action: () => updateValidation(car), class: `car.isValidated ? 'text-red-500' : ''` },
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