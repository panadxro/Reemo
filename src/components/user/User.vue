<script>
import UserEdit from "./UserEdit.vue";
import Home from "@icons/Home.vue";
import Heading from "@components/atoms/Heading.vue";
import UserIcon from "@icons/UserIcon.vue";
import Credential from "../../icons/Credential.vue";
import Car from "../../icons/Car.vue";
import History from "../../icons/History.vue";
import NavButton from "../molecules/NavButton.vue";

export default {
  name: "User",
  components: { UserEdit, Home, Heading, UserIcon, Credential, Car, History, NavButton },
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
  <aside class="bg-vibrant-light-600 m-2.5 py-12 px-5 flex flex-col items-center gap-2 rounded-[40px] min-w-[250px]">
    <img 
      v-if="user.photoURL" 
      class="w-20 aspect-square rounded-full bg-vibrant-light-800" 
      :src="`${user.photoURL}`"
      :alt="`Perfil de ${user.userName}`" 
    />
    <Heading :type="1" class="regular">{{ user.name }} {{ user.lastName }}</Heading>
    <p class="text-sm text-gray-500 truncate">
      @{{ user.userName }}
    </p>
    <button type="button" @click="openUserEdit">Editar</button>
    <ul class="flex flex-col gap-3 my-7 w-full">
      <li>
        <NavButton to="/profile" title="Mi perfil">
          <UserIcon />
          <span>Mi perfil</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Documentación">
          <Credential />
          <span>Documentación</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Mis autos">
          <Car />
          <span>Mis autos</span>
        </NavButton>
      </li>
      <li>
        <NavButton to="/profile" title="Historial">
          <History />
          <span>Historial</span>
        </NavButton>
      </li>
    </ul>
  </aside>
  <UserEdit ref="UserEdit" /> 
</template>
