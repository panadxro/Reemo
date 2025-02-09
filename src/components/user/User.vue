<script>
import UserEdit from "./UserEdit.vue";
import Home from "@icons/Home.vue";

export default {
  name: "User",
  components: { UserEdit, Home },
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
  methods: {
    openUserEdit() {
      this.$refs.UserEdit.openUserEdit();
    },
  },
};
</script>

<template>
  <aside class="bg-secondary-100 m-2.5 py-12 px-7 flex flex-col items-center gap-2 rounded-[40px] min-w-[250px]">
    <img 
      v-if="user.photoURL" 
      class="w-20 aspect-square rounded-full" 
      :src="`${user.photoURL}`"
      :alt="`Perfil de ${user.userName}`" 
    />
    <h2 class="text-lg font-semibold text-gray-900 truncate">
      {{ user.name }} {{ user.lastName }}
    </h2>
    <p class="text-sm text-gray-500 truncate">
      @{{ user.userName }}
    </p>
    <button type="button" @click="openUserEdit">Editar</button>
    <ul class="flex flex-col gap-3 my-7 w-full">
      <li>
        <a
          class="flex flex-row gap-3 px-5 py-2 flex-start items-center" 
          href=""
          title="Mi perfil">
          <Home />
          <span>Mi perfil</span>
        </a>
      </li>
      <li>
        <a
          class="flex flex-row gap-3 px-5 py-2 w-full" 
          href=""
          title="Documentación">
          <Home />
          <span>Documentación</span>
        </a>
      </li>
      <li>
        <a
          class="flex flex-row gap-3 px-5 py-2 " 
          href=""
          title="Mis autos">
          <Home />
          <span>Mis autos</span>
        </a>
      </li>
      <li>
        <a
          class="flex flex-row gap-3 px-5 py-2 " 
          href=""
          title="Historial">
          <Home />
          <span>Historial</span>
        </a>
      </li>
    </ul>
  </aside>
  <UserEdit ref="UserEdit" /> 
</template>
