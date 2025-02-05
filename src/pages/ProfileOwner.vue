<script>
import { getUserById, getPostsByUserId } from "../services/users"; // Importa la función para obtener el usuario

import Loading from "@icons/Loading.vue";
import CardCar from "../components/my-cars/CardCar.vue";

export default {
  name: "ProfileOwner",
  components: { Loading, CardCar },
  props: ["id"], 
  data() {
    return {
      user: {}, 
      posts: [], 
      loading: true,
    };
  },
  async created() {
    try {
      this.user = await getUserById(this.id);
      if (!this.user) {
        console.error("Usuario no encontrado.");
      }

      this.posts = await getPostsByUserId(this.id);
    } catch (error) {
      this.errorMsg = error.message; 
      console.error("Error al cargar el perfil:", error);
    }
    this.loading = false;
  },
};
</script>


<template>
    <div>
        <div v-if="loading" class="flex items-center justify-center w-fit mx-auto ">
            <Loading role="status" />
          </div>
      
      <div v-else>
        <div class="max-w-md mx-auto">
          <h1>Perfil de {{ user.name }} {{ user.lastName }}</h1>
          <img :src="user.photoURL" alt="Foto de perfil" class="w-24 h-24 rounded-full" />
          <p>Email: {{ user.email }}</p>
          <p class="mb-4">Nombre de usuario: {{ user.userName }}</p>
          <router-link :to="`/ProfileOwner/${user.id}/chat`" class="py-1 px-2 bg-primary-900 text-white rounded-lg ">Enviar Mensaje</router-link>
        </div>
  
        <div v-if="posts.length > 0">
          <h2>Publicaciones</h2>
          <div class="max-w-md mx-auto md:max-w-screen-xl m-4 grid justify-items-center gap-4 md:grid-cols-2 md:mb-8 lg:grid-cols-3 xl:grid-cols-4">
            <div v-for="post in posts" :key="post.id" class="post rounded-2xl flex relative flex-col shadow-sm w-full overflow-hidden hover:bg-primary-300">
                <CardCar :car="post" />
              </div>
          </div>
        </div>
        <div v-else>
          <p>Este usuario no tiene publicaciones.</p>
        </div>
      </div>
    </div>
  </template>
