
<script>
import { getUsers, updateUserRole } from "../../services/users.js";
import { addAlert } from "../../services/alerts";


import Heading from "@components/atoms/Heading.vue";
import Input from "../../components/molecules/Input.vue";
import Popover from "../../components/molecules/Popover.vue";

export default {
  components: { Heading, Input, Popover },
  data() {
    return {
      users: [],
      openPopoverId: null,
    };
  },
  async created() {
    this.users = await getUsers();
  },
  methods: {
    async updateRole(user) {
      try {
        const newRole = user.role;
        const response = await updateUserRole(user.id, newRole);

        if (response.success) {
          const updatedUser = this.users.find((u) => u.id === user.id);
          if (updatedUser) {
            updatedUser.role = newRole;
          }
          addAlert(response.message, "success");
        } else {
          addAlert(response.message, "error");
        }
      } catch (error) {
        console.error("Error al actualizar el rol:", error);
        addAlert("Error al actualizar el rol", "error");
      }
    },
    // Manejar la apertura/cierre del popover
    handleTogglePopover(popoverId) {
      this.openPopoverId = this.openPopoverId === popoverId ? null : popoverId;
    },
    // Cerrar el popover cuando se hace scroll o clic fuera
    handleClosePopover() {
      this.openPopoverId = null;
    },
  },
};
</script>

<template>
    <section class="w-full p-2.5 flex flex-col gap-6 overflow-hidden">
    <Heading :type="1" class="medium">Administrar Usuarios</Heading>
    <div class="flex flex-row gap-4">
      <Input 
        type="button"
        text="Todos"
        variant="secondary"
        class="cursor-pointer"
      />
      <Input 
        type="button"
        text="Verificados"
        variant="secondary"
        class="cursor-pointer"
      />
      <Input 
        type="button"
        text="No verificados"
        variant="secondary"
        class="cursor-pointer"
      />
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
      <tbody class="flex flex-col gap-5 h-full overflow-y-scroll">
        <tr 
          v-for="(user, index) in users" :key="user.id" 
          class="flex w-full max-h-16 border-2 border-secondary-100 rounded-xl font-semibold"
          >
          <td class="py-2.5 px-5 flex flex-1">
            <router-link :to="`/ProfileOwner/${user.id}`" class="flex items-center gap-2 hover:cursor-pointer">
              <img :src="user.photoURL" alt="Imagen del usuario" class="w-8 h-8 object-cover rounded-full" />
              <p class="hover:underline">{{ user.name }} {{ user.lastName }}</p>
            </router-link>
          </td>
          <td class="py-2.5 px-5 flex flex-1 items-center">Usuario</td>
          <td class="py-2.5 px-5 flex flex-1">Habilitado</td>
          <td class="py-2.5 px-5 flex items-center w-32 font-">03/02/2025</td>
          <td class="py-2.5 px-5 flex justify-center relative w-24 items-center">
            <Popover
              :items="[
                { label: 'Ver perfil', to: `/ProfileOwner/${user.id}` },
                { label: 'Chat', to: `/ProfileOwner/${user.id}/chat` },
                // { label: car.isValidated ? 'Invalidar' : 'Validar', action: () => updateValidation(car.id, !car.isValidated), class: `car.isValidated ? 'text-red-500' : ''` },
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

<!--     <Heading :type="2" class="m-6 text-center">Usuarios</Heading>

    <div class="max-w-md mx-auto md:max-w-(--breakpoint-xl) m-4">
    <table class="min-w-full bg-white">
      <thead>
        <tr>
          <th class="py-3 px-4">Imágen</th>
          <th class="py-3 px-4">Nombre</th>
          <th class="py-3 px-4">Email</th>
          <th class="py-3 px-4">Rol</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td class="py-3 px-4">
            <img :src="user.photoURL" alt="Imagen del usuario" class="w-16 h-16 object-cover rounded-sm" />
          </td>
          <td class="py-3 px-4">
            <router-link :to="`/ProfileOwner/${user.id}`" class="flex items-center gap-2 hover:cursor-pointer">
              <p class="hover:underline">{{ user.name }}</p>
            </router-link>
          </td>
          <td class="py-3 px-4">{{ user.email }}</td>
          <td class="py-3 px-4">
            <select v-model="user.role" @change="updateRole(user)" class="hover:bg-gray-100 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md hover:cursor-pointer py-1 px-2">
              <option value="admin" class="hover:cursor-pointer">Admin</option>
              <option value="user" class="hover:cursor-pointer">User</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div> -->
</template>
