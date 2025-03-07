<script>
import { getUserById, getPostsByUserId } from "../services/users"; 
import { subscribeToAuthState } from "../services/auth.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import UserNav from "@components/user/UserNav.vue";
import RentedCar from "@components/organisms/rental/RentedCar.vue";
import Loading from "@icons/Loading.vue";
import UserCar from "@components/organisms/my-cars/UserCar.vue";
import Arrow from "../icons/Arrow.vue";
import BackButton from "@components/atoms/BackButton.vue";

export default {
  name: "ProfileOwner",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, UserCar, Arrow, BackButton },
  props: ["id"], 
  data() {
    return {
      user: {}, 
      posts: [], 
      loading: true,
      loggedUser: null,
    };
  },
  async created() {
    try {
      this.user = await getUserById(this.id);
      if (!this.user) {
        console.error("Usuario no encontrado.");
      }

      this.posts = await getPostsByUserId(this.id);

      subscribeToAuthState((user) => {
        this.loggedUser = user;
      });
    } catch (error) {
      this.errorMsg = error.message; 
      console.error("Error al cargar el perfil:", error);
    }
    this.loading = false;
  },
};
</script>


<template>
  <section class="parent m-2.5 w-full max-h-vh">
    <div class="flex profile flex-col grow gap-3">
      <div class="flex items-center gap-5">
        <BackButton>
          <Arrow direction="left" />
        </BackButton>
        <Heading :type="1" class="medium">{{ user.userName }}</Heading>
      </div>
      <article class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5">
        <img 
          v-if="user.photoURL" 
          class="w-32 aspect-square rounded-full bg-vibrant-light-800" 
          :src="`${user.photoURL}`"
          :alt="`Perfil de ${user.userName}`" 
        />
        <div>
          <Heading :type="2" class="medium">{{ user.name }} {{ user.lastName }}</Heading>
          <p>{{ user.email }}</p>
          <router-link :to="`/user/${user.id}/chat`" class="py-1 px-2 bg-primary-900 text-white rounded-lg" v-if="loggedUser && loggedUser.id !== user.id">Enviar Mensaje</router-link>
        </div>
      </article>
    </div>

    <div class="user-car overflow-hidden">
      <div class="flex items-center justify-between">
        <Heading :type="1" class="regular">Vehículos</Heading>
        <a href="" class="text-primary-900">Ver más</a>
      </div>
      <div v-if="posts.length" class="flex flex-col gap-5 h-full overflow-auto">
        <UserCar 
          v-for="post in posts" 
          :key="post.id" 
          :car="post"
          />
      </div>
      <div v-else class="flex flex-col justify-center items-center h-full">
        <p class="font-semibold opacity-50">Este usuario no tiene autos registrados.</p>
      </div>
    </div>

    <div class="div1 bg-gray-100 rounded-[40px]">

    </div>

    <div class="history bg-primary-900 rounded-[40px] px-5 py-7">
      <div class="flex items-center justify-between">
        <Heading :type="1" class="text-white">Historial</Heading>
        <a href="" class="text-white">Ver más</a>
      </div>
      <div class="flex flex-col justify-center items-center h-full text-white">
        <p class=" text-pretty font-semibold opacity-50">Historial no disponible</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
  .parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;
  }

  .profile { grid-area: 1 / 1 / 2 / 4; }
  .history { grid-area: 2 / 4 / 3 / 6; }
  .div1 { grid-area: 1 / 4 / 2 / 6; }
  .user-car { grid-area: 2 / 1 / 3 / 4; }
</style>