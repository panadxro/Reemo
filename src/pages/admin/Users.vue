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
import BackButton from "@components/atoms/BackButton.vue";

export default {
  name: "AdminUsers",
  components: { Heading, Input, Popover, Status, SearchIcon, BackButton },
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
        addAlert("Rol actualizado con éxito", "success");
      } catch (error) {
          addAlert("Error al actualizar el rol", "error");
      }
    },
    async updateVerification(user) {
      try {
        const newStatus = user.status === 'not-verified' ? 'verified' : 'not-verified';
        await this.adminStore.changeUserVerification(user.id, newStatus);
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
    handleTogglePopover(popoverId) {
      this.openPopoverId = this.openPopoverId === popoverId ? null : popoverId;
    },
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
  <section class="w-full md:p-2.5 px-2.5 flex flex-col gap-6 overflow-hidden min-h-screen md:min-h-auto md:h-auto">
    <div class="flex items-center gap-5 gap-y-1.5 fixed md:static top-0 left-0 right-0 z-3 bg-white px-2.5 md:px-0 py-3 md:py-0 flex-wrap">
      <BackButton />
      <Heading :type="1" class="medium">Administrar usuarios</Heading>
    </div>
    <div class="flex flex-col md:flex-row justify-between md:items-center gap-4">
      <div class="box-white box-thin flex flex-row gap-4 overflow-x-auto pb-2 md:pb-0">
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
          text="Verificados"
          variant="secondary"
          :outline="true"
          class="!w-fit"

          :input-class="filter === 'verificados' ? ' !bg-vibrant-light-800' : ''"
          @click="toggleFiltro('verificados')"
        />
        <Input 
          type="button"
          text="No verificados"
          variant="secondary"
          :outline="true"
          class="!w-fit min-w-fit"
          :input-class="filter === 'no-verificados' ? ' !bg-vibrant-light-800' : ''"
          @click="toggleFiltro('no-verificados')"
        />
      </div>
      <Input
        type="text"
        id="searchInput"
        name="searchInput"
        placeholder="Buscar usuario"
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
          <th class="py-2.5 px-5 flex flex-1">Usuarios</th>
          <th class="py-2.5 px-5 hidden md:flex flex-1">Rol</th>
          <th class="py-2.5 px-5 flex flex-1">Estado</th>
          <th class="py-2.5 px-5 hidden lg:flex w-32">Fecha</th>
          <th class="py-2.5 md:px-5 flex-none w-20 md:w-24">Acción</th>
        </tr>
      </thead>
      <tbody class="box-white flex flex-col gap-5 md:h-full md:overflow-y-scroll md:pr-2">
        <tr 
          v-for="(user, index) in userFilter" :key="user.id"
          class="flex w-full max-h-16 border-2 border-secondary-100 rounded-xl font-semibold"
          >
          <td class="py-2.5 px-5 flex flex-1 overflow-hidden">
            <router-link :to="`/user/${user.id}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="user.personalInfo.profilePhoto" :alt="user.personalInfo.username" class="h-8 aspect-square object-cover rounded-full" />
              <p class="hover:underline">{{ user.personalInfo.firstName }} {{ user.personalInfo.lastName }}</p>
            </router-link>
          </td>
          <td class="py-2.5 px-5 hidden md:flex flex-1 items-center">{{ user.role == 'admin' ? 'Administrador' : 'Usuario'}}</td>
          <td class="py-2.5 px-5 flex flex-1 items-center"><Status :status="user.status" size="small" /></td>
          <td class="py-2.5 px-5 hidden lg:flex items-center w-32 font-">{{ formatDate(user.createdAt) }}</td>
          <td class="py-2.5 px-5 flex justify-center relative w-20 md:w-24 items-center">
            <Popover
              :items="[
                { label: 'Ver perfil', to: `/user/${user.id}` },
                { label: 'Chat', to: `/user/${user.id}/chat` },
                { label: user.role == 'user' ? 'Otorgar admin' : 'Quitar admin', action: () => updateRole(user), class: user.role === 'admin' ? 'text-red-500' : '' },
                { label: user.status == 'not-verified' ? 'Verificar' : 'Desverificar', action: () => updateVerification(user), class: user.status === 'verified' ? 'text-red-500' : '' },
              ]"
              :isOpen="openPopoverId === index"
              :popoverId="index"
              @toggle-popover="handleTogglePopover"
              @close-popover="handleClosePopover"
            />
          </td>
        </tr>  
        <div v-if="userFilter.length === 0" class="flex flex-col justify-center items-center gap-5 h-full">
          <Heading :type="3" class="text-gray-500 mb-2 mt-4 text-center">
            No hay usuarios registrados aún.<br/>
            Regresa más tarde.
          </Heading>
        </div>      
      </tbody>
    </table>
  </section>
</template>