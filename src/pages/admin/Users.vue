<script>
import { computed, onMounted } from "vue";
import { useAdminStore } from "../../stores/admin.store";
import { addAlert } from "../../services/alerts";
import { formatDate } from "../../libraries/date";

import Heading from "@components/atoms/Heading.vue";
import Input from "../../components/molecules/Input.vue";
import Popover from "../../components/molecules/Popover.vue";
import Status from "../../components/molecules/Status.vue";
import SearchIcon from "@icons/Search.vue";

export default {
  name: "AdminUsers",
  components: { Heading, Input, Popover, Status, SearchIcon },
  setup() {
    const adminStore = useAdminStore();

    const users = computed(() => {
      return adminStore.users;
    });

    onMounted(async () => {
      await adminStore.fetchUsers();
    });

    return {
      adminStore,
      users,
    };
  },
  data() {
    return {
      openPopoverId: null,
      filter: 'all',
      searchQuery: ''
    };
  },
  methods: {
    async updateRole(user) {
      try {
        const newRole = user.role === 'user' ? 'admin' : 'user';
        await this.adminStore.changeUserRole(user.id, newRole);
        // user.role = newRole;
        addAlert("Rol actualizado con éxito", "success");
      } catch (error) {
          addAlert("Error al actualizar el rol", "error");
      }
    },
    // Cambiar estado de verificacion del usuario
    async updateVerification(user) {
      try {
        const newStatus = user.status === 'not-verified' ? 'verified' : 'not-verified';
        await this.adminStore.changeUserVerification(user.id, newStatus);
        // user.status = newStatus;
        addAlert("Estado de verificación actualizado con éxito", "success");
      } catch (error) {
          addAlert("Error al actualizar el estado de verificación", "error");
      }
    },
    toggleFiltro(filtro) {
      this.filter = filtro;
      this.searchQuery = '';
    },
    formatDate,
    // Manejar la apertura/cierre del popover
    handleTogglePopover(popoverId) {
      this.openPopoverId = this.openPopoverId === popoverId ? null : popoverId;
    },
    // Cerrar el popover cuando se hace scroll o clic fuera
    handleClosePopover() {
      this.openPopoverId = null;
    },
  },
  computed: {
    userFilter() {
      let filteredUsers = this.users; 

      if (this.filter === 'verificados') {
        filteredUsers = filteredUsers.filter((user) => user.status !== 'not-verified');
      } else if (this.filter === 'no-verificados') {
        filteredUsers = filteredUsers.filter((user) => user.status === 'not-verified');
      }

      // Aplicar búsqueda por nombre o apellido
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        filteredUsers = filteredUsers.filter((user) => {
          const fullName = `${user.personalInfo.firstName} ${user.personalInfo.lastName}`.toLowerCase();
          return fullName.includes(query);
        });
      }

      return filteredUsers;
    }
  },
};
</script>

<template>
    <section class="w-full p-2.5 flex flex-col gap-6 overflow-hidden">
    <Heading :type="1" class="medium">Administrar Usuarios</Heading>
    <div class="flex justify-between items-center">
      <div class="flex flex-row gap-4">
        <Input 
          type="button"
          text="Todos"
          variant="secondary"
          class="cursor-pointer flex-0!"
          :input-class="filter === 'all' ? ' bg-vibrant-light-900' : ''"
          @click="toggleFiltro('all')"
        />
        <Input 
          type="button"
          text="Verificados"
          variant="secondary"
          class="cursor-pointer flex-0!"
          :input-class="filter === 'verificados' ? ' bg-vibrant-light-900' : ''"
          @click="toggleFiltro('verificados')"
        />
        <Input 
          type="button"
          text="No verificados"
          variant="secondary"
          class="cursor-pointer flex-0! min-w-[150px]!"
          :input-class="filter === 'no-verificados' ? ' bg-vibrant-light-900' : ''"
          @click="toggleFiltro('no-verificados')"
        />
      </div>
      <Input
        type="text"
        id="searchInput"
        name="searchInput"
        placeholder="Buscar usuario"
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
          <th class="py-2.5 px-5 flex flex-1">Usuarios</th>
          <th class="py-2.5 px-5 flex flex-1">Rol</th>
          <th class="py-2.5 px-5 flex flex-1">Estado</th>
          <th class="py-2.5 px-5 flex w-32">Fecha</th>
          <th class="py-2.5 px-5 flex-none w-24">Accion</th>
        </tr>
      </thead>
      <tbody class="flex flex-col gap-5 h-full overflow-y-scroll pr-2">
        <tr 
          v-for="(user, index) in userFilter" :key="user.id"
          class="flex w-full max-h-16 border-2 border-secondary-100 rounded-xl font-semibold"
          >
          <td class="py-2.5 px-5 flex flex-1">
            <router-link :to="`/user/${user.id}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="user.personalInfo.profilePhoto" :alt="user.personalInfo.username" class="w-8 h-8 object-cover rounded-full" />
              <p class="hover:underline">{{ user.personalInfo.firstName }} {{ user.personalInfo.lastName }}</p>
            </router-link>
          </td>
          <td class="py-2.5 px-5 flex flex-1 items-center">{{ user.role == 'admin' ? 'Administrador' : 'Usuario'}}</td>
          <td class="py-2.5 px-5 flex flex-1 items-center"><Status :status="user.status" /></td>
          <td class="py-2.5 px-5 flex items-center w-32 font-">{{ formatDate(user.createdAt) }}</td>
          <td class="py-2.5 px-5 flex justify-center relative w-24 items-center">
            <Popover
              :items="[
                { label: 'Ver perfil', to: `/user/${user.id}` },
                { label: 'Chat', to: `/user/${user.id}/chat` },
                { label: user.role == 'user' ? 'Otorgar admin' : 'Quitar admin', action: () => updateRole(user), class: `car.isValidated ? 'text-red-500' : ''` },
                { label: user.status == 'not-verified' ? 'Verificar' : 'Desverificar', action: () => updateVerification(user), class: `car.isValidated ? 'text-red-500' : ''` },
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
