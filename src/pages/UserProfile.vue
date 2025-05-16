<script>
import { useUserStore, useAuthStore } from '@stores'
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
    id: {
      type: String,
      required: true,
    },
  },
  watch: {
    id: {
      handler() {
        this.userStore.loadUserProfile(this.id);
      },
      immediate: true,
    }
  },
  setup() {
    const userStore = useUserStore();
    const authStore = useAuthStore();
    const route = useRoute();
    const router = useRouter();

    const loggedUserId = computed(() => {
      return authStore.user?.id
    })

    const userIdFromRoute =computed(() => {
      return route.params.id;
    }) 

    const isOwnProfile = computed(() => {
      return loggedUserId.value === userIdFromRoute.value;
    });

    const showProfile = computed(() => {
      return isOwnProfile.value ? userStore.profileData : userStore.visitedProfileData
    })

    watch(userIdFromRoute, async (newUserId, oldUserId) => {
      if (newUserId !== oldUserId) {
        await userStore.loadUserProfile(newUserId);
      }
    });

    onMounted(async () => {
      await userStore.loadUserProfile(userIdFromRoute.value);

      if(loggedUserId.value && isOwnProfile.value){
        if(!userStore.profileData.profileCompleted){
          router.push('/onboarding')
        }
      }

    });
    

    return {
      userStore,
      isOwnProfile,
      posts: userStore.posts,
      rentedCars: userStore.rentedCars,
      showProfile
    };
  }
}
</script>

<template>
  <div class="profile-layout">
    <!-- Sidebar (solo para el usuario logueado) - en móvil aparece arriba -->
    <UserNav v-if="isOwnProfile" class="nav-component" />
    <section class="profile-container w-full max-h-vh p-2.5">

      <!-- Perfil del usuario -->
      <div class="md:flex items-center gap-5 hidden">
        <BackButton />
        <Heading v-if="showProfile && showProfile.personalInfo" :type="1" class="medium">{{ isOwnProfile ? "Mi perfil" : showProfile.personalInfo.username }}</Heading>
      </div>
      <article v-if="isOwnProfile" class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5">
        <img 
          v-if="showProfile.personalInfo.profilePhoto" 
          class="w-32 aspect-square rounded-full object-cover bg-vibrant-light-800" 
          :src="showProfile.personalInfo.profilePhoto"
          :alt="`Perfil de ${showProfile.personalInfo.username}`" 
        />
        <div>
          <Heading :type="2" class="medium">{{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}</Heading>
          <p>{{ showProfile.email }}</p>
        </div>
      </article> 
      <article v-else-if="showProfile && showProfile.personalInfo" class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-row items-center gap-5"> 
        <img 
          v-if="showProfile.personalInfo.profilePhoto" 
          class="w-32 aspect-square rounded-full object-cover bg-vibrant-light-800" 
          :src="showProfile.personalInfo.profilePhoto" 
          :alt="`Perfil de ${showProfile.personalInfo.username}`" 
        /> 
        <div> 
          <Heading :type="2" class="medium">{{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}</Heading>
          <p>{{ showProfile.email }}</p>
          <router-link 
            v-if="!isOwnProfile && showProfile.personalInfo && showProfile.personalInfo.id !== this.id"
            :to="`/user/${this.id}/chat`" 
            class="py-1 px-2 bg-primary-900 text-white rounded-lg"
          > Enviar Mensaje
          </router-link>
        </div>
      </article>
      <div class="flex profile flex-col grow gap-3">
      </div>

      <div class="profile-grid">
        <!-- Historial (solo para el usuario logueado) -->
        <div v-if="isOwnProfile" class="my-history bg-primary-900 rounded-[40px] px-5 py-7">
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

        <div
          v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
          :class="isOwnProfile ? 'div-my-user' : 'div-user'"
          class="div1 bg-gray-100 rounded-[40px]">
          <p>Usuario</p>
        </div>  

        <!-- Autos del usuario -->
        <div class="overflow-hidden flex flex-col gap-5 px-5" :class="isOwnProfile ? 'my-cars' : 'user-cars'">
          <div class="flex items-center justify-between">
            <Heading :type="1">{{ isOwnProfile ? "Mis autos" : "Vehículos" }}</Heading>
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
            <p class="font-semibold opacity-50">{{ isOwnProfile ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}</p>
            <router-link v-if="isOwnProfile" to="/" class="font-semibold opacity-50 hover:opacity-100">
              <span class="hover:underline">Registra un auto</span>
            </router-link>
          </div>
        </div>
      </div>
      <router-view></router-view>
    </section>
  </div>
</template>

<style scoped>
  .profile-layout {
    display: flex;
    flex-direction: column;
    gap: 20px;
    width: 100%;
  }

  .nav-component {
    width: 100%;
  }

  .profile-container {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .profile-grid {
    display: grid;
    grid-template-columns: 1fr;
    grid-gap: 20px;
  }

  /* Default mobile layout - stacked */
  .profile { order: 1; }
  .my-history, .history { order: 2; }
  .div-my-user, .div-user { order: 3; }
  .user-cars, .my-cars { order: 4; }

  /* Medium screens and up - grid layout */
  @media (min-width: 768px) {
    .profile-layout {
      flex-direction: row;
    }

    .nav-component {
      width: auto;
    }

    .profile-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      grid-template-rows: repeat(1, auto);
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
  }

  /* Larger screens - full desktop layout */
  @media (min-width: 1024px) {
    .profile-grid {
      grid-template-rows: repeat(2, auto);
    }
  }
</style>