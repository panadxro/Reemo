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

let unsubscribeAuth = () => {};

export default {
  name: "UserProfile",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, UserCar, Arrow, BackButton },
  props: {
    id: String, // ID del usuario cuyo perfil se está viendo
  },
  data() {
    return {
      user: {}, // Datos del usuario
      posts: [], // Publicaciones del usuario
      cars: [], // Autos del usuario
      rentedCars: [], // Autos alquilados
      loading: true,
      loggedUser: {
        id: null,
        email: null,
        userName: null,
        name: null,
        lastName: null,
      }, // Usuario logueado
      isProfileOwner: false, // Variable local para determinar si el perfil es del usuario logueado
    };
  },
  watch: {
    id: {
      immediate: true, // Ejecuta el watcher inmediatamente al montar el componente
      handler(newId, oldId) {
        if (newId !== oldId) {
          this.loadUserData(newId); // Cargar datos del nuevo usuario
        }
      },
    },
  },
  async created() {
    // Suscribirse a cambios en el estado de autenticación
    subscribeToAuthState((user) => {
      this.loggedUser = user;
    });

    // Cargar datos del usuario inicial
    await this.loadUserData(this.id);
  },
  methods: {
    async loadUserData(userId) {
      try {
        this.loading = true;

        // Reiniciar datos
        this.user = {};
        this.posts = [];
        this.cars = [];
        this.rentedCars = [];

        // Determinar si el perfil es del usuario logueado
        this.isProfileOwner = userId === this.loggedUser?.id;

        // Obtener datos del usuario
        const userData = this.isProfileOwner ? this.loggedUser : await getUserById(userId);

        if (!userData) {
          console.error("Usuario no encontrado.");
        }

        // Mapear los datos del onboarding a la estructura esperada
        this.user = {
          id: userId,
          email: userData.email,
          userName: userData.personalInfo?.username || '',
          name: userData.personalInfo?.firstName || '',
          lastName: userData.personalInfo?.lastName || '',
          photoURL: userData.personalInfo?.profilePhoto || '',
          phone: userData.personalInfo?.phone || '',
          birthDate: userData.personalInfo?.birthDate || '',
          gender: userData.personalInfo?.gender || '',
          address: userData.address || {},
          documents: userData.documents || {},
          paymentMethods: userData.paymentMethods || []
        };

        // Obtener autos y publicaciones del usuario
        this.posts = await getPostsByUserId(userId);
        this.cars = await getUserCars(userId);

        // Obtener autos alquilados (solo para el usuario logueado)
        if (this.isProfileOwner) {
          this.rentedCars = await fetchRentedCars(this.loggedUser.id);
        }
      } catch (error) {
        console.error("Error al cargar el perfil:", error);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <!-- Sidebar (solo para el usuario logueado) -->
  <UserNav v-if="isProfileOwner" :user="user" />
  <section class="parent m-2.5 w-full max-h-vh">

    <!-- Perfil del usuario -->
    <div class="flex profile flex-col grow gap-3">
      <div class="flex items-center gap-5">
        <BackButton />
        <Heading :type="1" class="medium">{{ isProfileOwner ? "Mi perfil" : user.userName }}</Heading>
      </div>
      <article v-if="isProfileOwner" class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5">
        <img 
          v-if="user.photoURL" 
          class="w-32 aspect-square rounded-full bg-vibrant-light-800" 
          :src="`${user.photoURL}`"
          :alt="`Perfil de ${user.userName}`" 
        />
        <div>
          <Heading :type="2" class="medium">{{ user.name }} {{ user.lastName }}</Heading>
          <p>{{ user.email }}</p>
        </div>
      </article>
      <article v-else class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5">
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
            v-if="!isProfileOwner && loggedUser && loggedUser.id !== user.id"
            :to="`/user/${user.id}/chat`" 
            class="py-1 px-2 bg-primary-900 text-white rounded-lg"
          >
            Enviar Mensaje
          </router-link>
        </div>
      </article>
    </div>

    <!-- Autos del usuario -->
    <div class="overflow-hidden flex flex-col gap-5 px-5" :class="isProfileOwner ? 'my-cars' : 'user-cars'">
      <div class="flex items-center justify-between">
        <Heading :type="1">{{ isProfileOwner ? "Mis autos" : "Vehículos" }}</Heading>
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
        <p class="font-semibold opacity-50">{{ isProfileOwner ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}</p>
        <router-link v-if="isProfileOwner" to="/" class="font-semibold opacity-50 hover:opacity-100">
          <span class="hover:underline">Registra un auto</span>
        </router-link>
      </div>
    </div>

    <div
      v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
      :class="isProfileOwner ? 'div-my-user' : 'div-user'"
      class="div1 bg-gray-100 rounded-[40px]">
      <p>Usuario</p>
    </div>  

    <!-- Historial (solo para el usuario logueado) -->
    <div v-if="isProfileOwner" class="my-history bg-primary-900 rounded-[40px] px-5 py-7">
      <div class="flex items-center justify-between">
        <Heading :type="1" class="text-white">Historial</Heading>
        <a href="" class="text-white">Ver más</a>
      </div>
      <div v-if="rentedCars.length">
        <RentedCar v-for="rental in rentedCars" :key="rental.id" :car="rental.car" />
      </div>
      <div v-else class="flex flex-col justify-center items-center h-full text-white">
        <p class="text-pretty font-semibold opacity-50">Aún no has alquilado ningún auto.</p>
        <router-link to="/search" class="font-semibold opacity-50 hover:opacity-100">
          <span class="hover:underline">Alquilá un auto</span>
        </router-link>
      </div>
    </div>
    <div v-else 
      class="history bg-primary-900 rounded-[40px] px-5 py-7" 
      v-if="!$route.matched.some(route => route.name === 'PrivateChat')" >
      <div class="flex items-center justify-between">
        <Heading :type="1" class="text-white">Historial</Heading>
        <a href="" class="text-white">Ver más</a>
      </div>
      <div class="flex flex-col justify-center items-center h-full text-white">
        <p class=" text-pretty font-semibold opacity-50">Historial no disponible</p>
      </div>
    </div>
    <router-view></router-view>
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
  .my-history { grid-area: 1 / 4 / 2 / 6; }
  .div-user { grid-area: 1 / 4 / 2 / 6; }
  .div-my-user { grid-area: 2 / 1 / 3 / 3; }
  .user-cars { grid-area: 2 / 1 / 3 / 4; }
  .my-cars { grid-area: 2 / 3 / 3 / 6; }
  .history { grid-area: 2 / 4 / 3 / 6; }
</style>