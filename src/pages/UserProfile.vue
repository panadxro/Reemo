<script>
import { getUserById, getPostsByUserId } from "../services/users";
import { getUserCars } from "@services/car-service.js";
import { subscribeToAuthState } from "@services/auth.js";
import { fetchRentedCars } from "@services/rentedCarService.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import UserNav from "@components/user/UserNav.vue";
import RentedCar from "@components/organisms/rental/RentedCar.vue";
import Loading from "@icons/Loading.vue";
import UserCar from "@components/organisms/my-cars/UserCar.vue";
import Arrow from "../icons/Arrow.vue";
import BackButton from "@components/atoms/BackButton.vue";

export default {
  name: "UserProfile",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, UserCar, Arrow, BackButton },
  props: {
    id: String, // ID del usuario cuyo perfil se está viendo
    isOwner: Boolean, // Indica si el perfil es del usuario logueado
  },
  data() {
    return {
      user: {}, // Datos del usuario
      posts: [], // Publicaciones del usuario
      cars: [], // Autos del usuario
      rentedCars: [], // Autos alquilados
      loading: true,
      loggedUser: null, // Usuario logueado
    };
  },
  async created() {
    try {
      // Obtener datos del usuario
      this.user = this.isOwner ? this.loggedUser : await getUserById(this.id);
      if (!this.user) {
        console.error("Usuario no encontrado.");
      }

      // Obtener autos y publicaciones del usuario
      this.posts = await getPostsByUserId(this.id);
      this.cars = await getUserCars(this.id);

      // Obtener autos alquilados (solo para el usuario logueado)
      if (this.isOwner) {
        this.rentedCars = await fetchRentedCars(this.loggedUser.id);
      }

      // Suscribirse a cambios en el estado de autenticación
      subscribeToAuthState((user) => {
        this.loggedUser = user;
      });
    } catch (error) {
      console.error("Error al cargar el perfil:", error);
    }
    this.loading = false;
  },
};
</script>

<template>
  <section class="parent m-2.5 w-full max-h-vh">
    <!-- Sidebar (solo para el usuario logueado) -->
    <UserNav v-if="isOwner" :user="loggedUser" />

    <!-- Perfil del usuario -->
    <div class="flex profile flex-col grow gap-3">
      <div class="flex items-center gap-5">
        <BackButton>
          <Arrow direction="left" />
        </BackButton>
        <Heading :type="1" class="medium">{{ isOwner ? "Mi perfil" : user.userName }}</Heading>
      </div>
      <article class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5">
        <img 
          v-if="user.photoURL" 
          class="w-32 aspect-square rounded-full bg-vibrant-light-800" 
          :src="user.photoURL"
          :alt="`Perfil de ${user.userName}`" 
        />
        <div>
          <Heading :type="2" class="medium">{{ user.name }} {{ user.lastName }}</Heading>
          <p>{{ user.email }}</p>
          <!-- Botón "Enviar mensaje" (solo para otros usuarios) -->
          <router-link 
            v-if="!isOwner && loggedUser && loggedUser.id !== user.id"
            :to="`/user/${user.id}/chat`" 
            class="py-1 px-2 bg-primary-900 text-white rounded-lg"
          >
            Enviar Mensaje
          </router-link>
        </div>
      </article>
    </div>

    <!-- Autos del usuario -->
    <div class="user-car overflow-hidden">
      <div class="flex items-center justify-between">
        <Heading :type="1">{{ isOwner ? "Mis autos" : "Vehículos" }}</Heading>
        <a href="" class="text-primary-900">Ver más</a>
      </div>
      <div v-if="cars.length" class="flex flex-col gap-5 h-full overflow-auto">
        <UserCar 
          v-for="car in cars" 
          :key="car.id" 
          :car="car" 
        />
      </div>
      <div v-else class="flex flex-col justify-center items-center h-full">
        <p class="font-semibold opacity-50">{{ isOwner ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}</p>
        <router-link v-if="isOwner" to="/" class="font-semibold opacity-50 hover:opacity-100">
          <span class="hover:underline">Registra un auto</span>
        </router-link>
      </div>
    </div>

    <!-- Historial (solo para el usuario logueado) -->
    <div v-if="isOwner" class="history bg-primary-900 rounded-[40px] px-5 py-7">
      <div class="flex items-center justify-between">
        <Heading :type="1" class="text-white">Historial</Heading>
        <a href="" class="text-white">Ver más</a>
      </div>
      <div v-if="rentedCars.length">
        <RentedCar v-for="rental in rentedCars" :key="rental.id" :car="rental.car" />
      </div>
      <div v-else class="flex flex-col justify-center items-center h-full text-white">
        <p class="text-pretty font-semibold opacity-50">Aún no has alquilado ningún vehículo.</p>
        <router-link to="/search" class="font-semibold opacity-50 hover:opacity-100">
          <span class="hover:underline">Alquila un vehículo</span>
        </router-link>
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
  .history { grid-area: 1 / 4 / 2 / 6; }
  .div1 { grid-area: 2 / 1 / 3 / 3; }
  .user-car { grid-area: 2 / 3 / 3 / 6; }
</style>