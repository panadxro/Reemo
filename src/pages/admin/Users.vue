
<script>
import { getUsers, updateUserRole } from "../../services/users.js";
import { addAlert } from "../../services/alerts";


import Heading from "@components/atoms/Heading.vue";

export default {
  components: { Heading },
  data() {
    return {
      users: [],
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
  },
};
</script>

<template>
    <Heading :type="2" class="m-6 text-center">Usuarios</Heading>

    <div class="max-w-md mx-auto md:max-w-screen-xl m-4">
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
            <img :src="user.photoURL" alt="Imagen del usuario" class="w-16 h-16 object-cover rounded" />
          </td>
          <td class="py-3 px-4">{{ user.name }}</td>
          <td class="py-3 px-4">{{ user.email }}</td>
          <td class="py-3 px-4">
            <select v-model="user.role" @change="updateRole(user)" class="hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent rounded-md hover:cursor-pointer py-1 px-2">
              <option value="admin" class="hover:cursor-pointer">Admin</option>
              <option value="user" class="hover:cursor-pointer">User</option>
            </select>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
