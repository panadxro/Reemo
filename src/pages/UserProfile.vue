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


  <!-- <div class="profile-layout">
    <UserNav v-if="isOwnProfile" class="nav-component" />
    
    <section class="profile-container">
      <div class="header-section">
        <BackButton />
        <Heading v-if="showProfile && showProfile.personalInfo" :type="1" class="medium profile-heading">
          {{ isOwnProfile ? "Mi perfil" : showProfile.personalInfo.username }}
        </Heading>
      </div>

      <article class="profile-info">
        <img 
          v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto" 
          class="profile-photo" 
          :src="showProfile.personalInfo.profilePhoto"
          :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
        />
        <div class="profile-details">
          <Heading :type="2" class="medium" v-if="showProfile && showProfile.personalInfo">
            {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
          </Heading>
          <p v-if="showProfile">{{ showProfile.email }}</p>
          <router-link 
            v-if="!isOwnProfile && showProfile && showProfile.personalInfo && showProfile.personalInfo.id !== id"
            :to="`/user/${id}/chat`" 
            class="message-button"
          >
            Enviar Mensaje
          </router-link>
        </div>
      </article>

      <div class="dashboard-grid">
        <div class="history-section" v-if="!$route.matched.some(route => route.name === 'PrivateChat')">
          <div class="section-header">
            <Heading :type="1" class="text-white">Historial</Heading>
            <a href="" class="section-link text-white">Ver más</a>
          </div>
          
          <div v-if="isOwnProfile" class="history-content">
            <div v-if="rentedCars && rentedCars.length">
              <RentedCar v-for="rental in rentedCars" :key="rental.id" :car="rental.car" />
            </div>
            <div v-else class=" text-white">
              <p class="empty-message">Aún no has alquilado ningún auto.</p>
              <router-link to="/search" class="action-link">
                <span>Alquilá un auto</span>
              </router-link>
            </div>
          </div>
          
          <div v-else class="empty-section text-white">
            <p class="empty-message">Historial no disponible</p>
          </div>
        </div>

        <div
          v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
          class="user-section">
          <p>Usuario</p>
        </div>

        <div class="cars-section">
          <div class="section-header">
            <Heading :type="1">{{ isOwnProfile ? "Mis autos" : "Vehículos" }}</Heading>
            <a href="" class="section-link">Ver más</a>
          </div>
          
          <div v-if="posts && posts.length" class="cars-content">
            <UserCar 
              v-for="post in posts" 
              :key="post.id" 
              :car="post"
            />
          </div>
          <div v-else class="empty-section">
            <p class="empty-message">
              {{ isOwnProfile ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}
            </p>
            <router-link v-if="isOwnProfile" to="/" class="action-link">
              <span>Registra un auto</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <router-view></router-view>
    </section>
  </div>  -->
<template>
  <section class="flex flex-col md:flex-row" v-if="isOwnProfile">
    <UserNav class="max-w-[95%] mx-auto md:mx-4"/>

    <section class="max-w-[95%] mx-auto md:mx-0">
      <div class="xl:flex gap-4 mb-4">
        <div class="flex flex-col">
          <div class="hidden md:flex md:items-center md:gap-2 mb-4 w-fit">
            <BackButton />
            <Heading :type="1">
             Mi perfil
            </Heading>
          </div>
          <article class="bg-secondary-100 rounded-[40px] p-6 xl:max-w-[600px]">
            <div class="flex gap-4 items-center">
              <img 
              v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto" 
              class="w-16 md:w-20 aspect-square rounded-full" 
              :src="showProfile.personalInfo.profilePhoto"
              :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
            />
            <div>
              <div class="flex items-center justify-between mb-4">
                <Heading :type="2" class="medium text-primary-900" v-if="showProfile && showProfile.personalInfo">
                  {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
                </Heading>
                <router-link 
                  v-if="!isOwnProfile && showProfile && showProfile.personalInfo && showProfile.personalInfo.id !== id"
                  :to="`/user/${id}/chat`" 
                  class="text-sm md:text-md text-primary-800 border-2 border-primary-800 rounded-lg px-4 py-2 bg-white hover:bg-primary-800 hover:text-white transition-colors duration-300 block"
                >
                  Enviar Mensaje
                </router-link>
              </div>
              <article class="flex flex-wrap gap-2 mb-4">
                <div class="rounded-md bg-vibrant-light-600 px-2 py-2">
                  <Heading :type="3" class="text-primary-900">10+</Heading>
                  <p class="text-sm text-background-600">Viajes</p>
                </div>
    
                <div class="rounded-md bg-vibrant-light-600 px-2 py-2">
                  <Heading :type="3" class="text-primary-900">4.2</Heading>
                  <p class="text-sm text-background-600">Estrellas</p>
                </div>
    
                <div class="rounded-md bg-vibrant-light-600 px-2 py-2">
                  <Heading :type="3" class="text-primary-900">Arrendador</Heading>
                  <p class="text-sm text-background-600">Rol Principal</p>
                </div> 
              </article>
              <div>
                <p class="text-primary-900">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quidem vitae ab incidunt, quas sunt necessitatibus voluptates optio ipsam obcaecati voluptatibus cumque, laboriosam corrupti.</p>
              </div>
            </div>
            
            </div>
          </article>
        </div>
  
        <div class="bg-primary-900 border-2 rounded-[40px] p-6 mt-4 xl:mt-0">
          <div class="flex items-center justify-between mb-4">
            <Heading :type="1" class="text-white">Historial</Heading>
            <a v-if="rentedCars && rentedCars.length" href="" class=" text-white">Ver todo</a>
          </div>

            <div v-if="rentedCars && rentedCars.length">
              <RentedCar v-for="rental in rentedCars" :key="rental.id" :car="rental.car" />
            </div>
            <div v-else class="text-white flex flex-col items-center justify-center">
              <img src="@/assets/car-history.png" alt="History Car" class="max-w-[150px] mx-auto mb-4" />
              <Heading :type="3" class="text-white text-center">No hay registros de alquileres.</Heading>
              <!-- <p class="text-sm text-white/70 mb-4 mt-2 text-center">Explora vehículos disponibles.</p> -->
              <router-link to="/search" class="mt-4 px-4 py-2 rounded-lg text-primary-900 bg-secondary-300 hover:bg-primary-700 hover:text-white transition-all duration-300 w-fit font-black">
                <span class="font-bold">Alquilá un auto</span>
              </router-link>
            </div>
          </div>

  
        <!-- Placeholder de usuario (solo si no es chat privado) -->
      </div>
      
      <div class="md:flex gap-4">
        <!-- Historial (condicional según si es perfil propio o visitado) -->
        
        <div
          v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
          class="bg-blue-800/20">
          <div class="section-header">
            <Heading :type="1">{{ isOwnProfile ? "Mis datos" : "Usuario" }}</Heading>
            <a href="" class="section-link">Ver más</a>
          </div>
        </div>

        <!-- Sección de autos -->
        <div class="bg-blue-900/40">
          <div class="section-header">
            <Heading :type="1">{{ isOwnProfile ? "Mis autos" : "Vehículos" }}</Heading>
            <a href="" class="section-link">Ver más</a>
          </div>
          
          <div v-if="posts && posts.length" class="cars-content">
            <UserCar 
              v-for="post in posts" 
              :key="post.id" 
              :car="post"
            />
          </div>
          <div v-else class="">
            <p class="empty-message">
              {{ isOwnProfile ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}
            </p>
            <router-link v-if="isOwnProfile" to="/" class="action-link">
              <span>Registra un auto</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- <router-view></router-view> -->
    </section>
  </section>

  <section class="flex flex-col md:flex-row" v-else>
    <UserNav class="max-w-[95%] mx-auto md:mx-4"/>

    <section class="max-w-[95%] mx-auto md:mx-0">
      <div class="xl:flex gap-4 mb-4">
        <div class="flex flex-col">
          <div class="hidden md:flex md:items-center md:gap-2 mb-4 w-fit">
            <BackButton />
            <Heading v-if="showProfile && showProfile.personalInfo" :type="1" class="medium profile-heading">
              {{ isOwnProfile ? "Mi perfil" : showProfile.personalInfo.username }}
            </Heading>
          </div>
          <article class="bg-secondary-100 rounded-[40px] p-6 xl:max-w-[600px]">
            <div class="flex gap-4 items-center">
              <img 
              v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto" 
              class="w-16 md:w-20 aspect-square rounded-full" 
              :src="showProfile.personalInfo.profilePhoto"
              :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
            />
            <div>
              <div class="flex items-center justify-between mb-4">
                <Heading :type="2" class="medium text-primary-900" v-if="showProfile && showProfile.personalInfo">
                  {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
                </Heading>
                <router-link 
                  v-if="!isOwnProfile && showProfile && showProfile.personalInfo && showProfile.personalInfo.id !== id"
                  :to="`/user/${id}/chat`" 
                  class="text-sm md:text-md text-primary-800 border-2 border-primary-800 rounded-lg px-4 py-2 bg-white hover:bg-primary-800 hover:text-white transition-colors duration-300 block"
                >
                  Enviar Mensaje
                </router-link>
              </div>
              <article class="flex flex-wrap gap-2 mb-4">
                <div class="rounded-md bg-vibrant-light-600 px-2 py-2">
                  <Heading :type="3" class="text-primary-900">10+</Heading>
                  <p class="text-sm text-background-600">Viajes</p>
                </div>
    
                <div class="rounded-md bg-vibrant-light-600 px-2 py-2">
                  <Heading :type="3" class="text-primary-900">4.2</Heading>
                  <p class="text-sm text-background-600">Estrellas</p>
                </div>
    
                <div class="rounded-md bg-vibrant-light-600 px-2 py-2">
                  <Heading :type="3" class="text-primary-900">Arrendador</Heading>
                  <p class="text-sm text-background-600">Rol Principal</p>
                </div> 
              </article>
              <div>
                <p class="text-primary-900">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Quidem vitae ab incidunt, quas sunt necessitatibus voluptates optio ipsam obcaecati voluptatibus cumque, laboriosam corrupti.</p>
              </div>
            </div>
            
            </div>
          </article>
        </div>
  
        <div class="bg-black/40 border-2 rounded-2xl px-4 py-2" v-if="!$route.matched.some(route => route.name === 'PrivateChat')">
          <div class="flex items-center justify-between mb-4">
            <Heading :type="1" class="text-white">Historial</Heading>
            <a href="" class=" text-white">Ver más</a>
          </div>
          
          <!-- Contenido de historial para usuario propio -->
          <div v-if="isOwnProfile">
            <div v-if="rentedCars && rentedCars.length">
              <RentedCar v-for="rental in rentedCars" :key="rental.id" :car="rental.car" />
            </div>
            <div v-else class=" text-white">
              <p class="">Aún no has alquilado ningún auto.</p>
              <router-link to="/search" class="action-link">
                <span>Alquilá un auto</span>
              </router-link>
            </div>
          </div>
          
          <!-- Contenido de historial para perfil visitado -->
          <div v-else class=" text-white">
            <p class="">Historial no disponible</p>
          </div>
        </div>
  
        <!-- Placeholder de usuario (solo si no es chat privado) -->
      </div>
      
      <div class="md:flex gap-4">
        <!-- Historial (condicional según si es perfil propio o visitado) -->
        
        <div
          v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
          class="bg-blue-800/20">
          <div class="section-header">
            <Heading :type="1">{{ isOwnProfile ? "Mis datos" : "Usuario" }}</Heading>
            <a href="" class="section-link">Ver más</a>
          </div>
        </div>

        <!-- Sección de autos -->
        <div class="bg-blue-900/40">
          <div class="section-header">
            <Heading :type="1">{{ isOwnProfile ? "Mis autos" : "Vehículos" }}</Heading>
            <a href="" class="section-link">Ver más</a>
          </div>
          
          <div v-if="posts && posts.length" class="cars-content">
            <UserCar 
              v-for="post in posts" 
              :key="post.id" 
              :car="post"
            />
          </div>
          <div v-else class="">
            <p class="empty-message">
              {{ isOwnProfile ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}
            </p>
            <router-link v-if="isOwnProfile" to="/" class="action-link">
              <span>Registra un auto</span>
            </router-link>
          </div>
        </div>
      </div>
      
      <!-- <router-view></router-view> -->
    </section>
  </section>

</template>