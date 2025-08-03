<script>
import { useUserStore, useCarStore  } from '@stores'
import { onMounted, ref, computed, watch, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { addAlert } from "@services/alerts.js";

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/cars/CardCar.vue";
import BackButton from "@components/atoms/BackButton.vue";
import Input from "@components/molecules/Input.vue";
import DeletePaymentModal from '@/components/user/DeletePaymentModal.vue';
import History from '@/components/user/History.vue'
import Loading from "@icons/Loading.vue";
import Cross from "@icons/Cross.vue";
import Send from "@icons/Send.vue";
import Edit from "@icons/Edit.vue";
import Check from "@icons/Check.vue";
import VerifyValidation from "@/components/user/VerifyValidation.vue";
import NoCarsRegister from '../components/atoms/NoCarsRegister.vue';
import NoMessage from '../components/atoms/NoMessage.vue';
import Status from '../components/molecules/Status.vue';

export default {
  name: "UserProfile",
  components: { Heading, CardCar, Loading, BackButton, Input, DeletePaymentModal, Cross, Check, History, VerifyValidation, NoCarsRegister, NoMessage, Send, Status, Edit },
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
    const authStore = inject('authStore');
    const userStore = useUserStore();
    const carStore = useCarStore();

    const route = useRoute();
    const router = useRouter();

    const userCars = computed(() => carStore.userCars);
    const loggedUserId = computed(() => authStore.user?.id);
    const userIdFromRoute = computed(() => route.params.id);
    const isOwnProfile = computed(() => loggedUserId.value === userIdFromRoute.value);
    const isUserVerified = computed(() => authStore.userStatus);

    const showProfile = computed(() => {
      return isOwnProfile.value ? userStore.profileData : userStore.visitedProfileData
    })

    const goToCarRegister = () => {
    if (isUserVerified.value) {
      router.push('/car/register');
    } else {
      addAlert("Aguardá la validación del perfil para registrar un vehículo", "warning");
    }
  };

    watch(userIdFromRoute, async (newUserId, oldUserId) => {
      if (newUserId !== oldUserId) {
        await userStore.loadUserProfile(newUserId);

        // if(!userIdFromRoute !== newUserId) {
        //   router.push('/not-found');
        // }

        // También cargar los autos cuando cambie el usuario
        if (newUserId) {
          try {
            await carStore.loadUserCars(newUserId);
            // console.log('nuevo id de usuario', newUserId);
          } catch (error) {
            console.error("Error cargando autos del usuario:", error);
          }
        }
      }
    });

    onMounted(async () => {
      try {
        // Cargar perfil del usuario
        await userStore.loadUserProfile(userIdFromRoute.value);
        // console.log('Perfil del usuario cargado', showProfile.value.uid,);
        // if (!showProfile.value.uid !== userIdFromRoute.value) {
        //   router.push('/not-found');
        //   return;
        // }

        // Fetch a los autos del usuario
        await carStore.loadUserCars(userIdFromRoute.value);
        console.log('Autos del usuario', carStore.userCars)

        // Si es el perfil propio, verificar si está completo y cargar métodos de pago
        if (loggedUserId.value && isOwnProfile.value) {
          if (!userStore.profileData.profileCompleted) {
            router.push('/onboarding');
          }
        }
      } catch (error) {
        console.error("Error en onMounted:", error);
      }
    });
    
    return {
      userStore,
      isOwnProfile,
      posts: userStore.posts,
      rentedCars: userStore.rentedCars,
      showProfile,
      userIdFromRoute,
      carStore,
      userCars,
      isUserVerified,
      loggedUserId,
      goToCarRegister
    };
  }
}
</script>

<template>
    <section class="parent md:m-2.5 w-full md:max-h-vh md:overflow-hidden">

      <!-- Perfil del usuario -->
      <div class="flex profile flex-col gap-3 h-full">
        <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-4 bg-white px-2.5 md:px-0 py-3 md:py-0">
          <BackButton />
          <Heading v-if="showProfile && showProfile.personalInfo" :type="1" class="medium">{{ isOwnProfile ? "Mi perfil" : showProfile.personalInfo.username }}</Heading>
        </div>
        <article class="bg-secondary-100 h-full md:flex-row rounded-[40px] justify-around items-center px-12 py-8 flex flex-col gap-5 box-vibrant">
          <!-- Perfil y verificación -->
          <div class="flex flex-col items-center md:items-start text-center md:text-left gap-1 h-auto">
            <img 
              v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto"
              class="w-24 h-24 xl:block h aspect-square rounded-full object-cover bg-vibrant-light-800"
              :src="showProfile.personalInfo.profilePhoto"
              :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
            />

            <Heading :type="2" class="text-2xl font-semibold text-gray-800 md:text-start"
              v-if="showProfile && showProfile.personalInfo">
              {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
            </Heading>
            <p class="text-gray-500 text-sm">{{ showProfile?.email || 'Este usuario no ha proporcionado un mail.' }}</p>
            <Status class="w-fit cursor-pointer" :status="showProfile?.status">
              <template v-if="isOwnProfile" #message>
                <VerifyValidation
                v-if="!isUserVerified"
                title="Perfil en proceso de validación"
                message="Tu perfil está en proceso de verificación. Para poder utilizar todas las funcionalidades (buscar vehículos, realizar alquileres y registrar vehículos), necesitamos validar tu información."
                class="!text-black"
                :show="!isUserVerified"
                type="brightYellow"
                />
  
                <VerifyValidation
                  v-else
                  title="Perfil verificado"
                  message="Tu perfil está verificado. Ahora puedes disfrutar de todas las funcionalidades: buscar vehículos, realizar alquileres y registrar tus propios vehículos en la plataforma."
                  class="!text-black"
                  :show="isUserVerified"
                  type="green"
                />
              </template>
            </Status>
          </div>
          
          <div class="flex flex-col justify-between h-full"
          v-if="!isOwnProfile && showProfile && showProfile.personalInfo && showProfile.personalInfo.id !== id">
            <router-link
            :to="`/user/${id}/chat`"
            class="cursor-pointer"
            >
              <Input 
                type="button"
                text="Enviar mensaje"
                variant="primary"
                :outline="false"
                icon-position="right"
              >
                <template #icon>
                  <Send color="#FFFFFF"/>
                </template>
              </Input>
            </router-link>
          </div>

          <router-link to="/onboarding" class="block md:hidden">
            <Input
              type="button"
              text="Editar perfil"
              variant="primary"
              :outline="false"
              icon-position="right"
            >
              <template #icon>
                <Edit color="#FFFFFF"/>
              </template>
            </Input>
          </router-link>
        
          <!-- Ganancias Totales -->
          <ul v-if="isOwnProfile" class="bg-gradient-to-tr bg-deep-blue-800 text-white !px-6 !py-4 rounded-2xl shadow-lg flex flex-col justify-center text-center md:text-start gap-2 h-fit">
              <p class="text-md font-bold">Ganancias totales</p>
              <h3 class="text-3xl font-bold">{{ new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(showProfile?.personalInfo?.totalEarnings || 0) }}</h3>
          </ul>
        </article>
      </div>




      <!-- Autos del usuario -->
      <div class="overflow-hidden flex flex-col gap-5 h-full" :class="isOwnProfile ? 'cars' : 'user-cars'">
        <div class="flex items-end justify-between">
          <Heading :type="2" class="medium text-primary-900 text-center sm:text-left">{{ isOwnProfile ? "Mis autos" : "Vehículos" }}</Heading>
          <router-link v-if="isOwnProfile" :to="`/cars/${loggedUserId}`" class="text-deep-blue-900 font-medium">Ver más</router-link>
        </div>
        <div v-if="carStore.loading" class="flex justify-center py-8">
          <Loading class="w-8 h-8 text-primary-800" />
        </div>
        <div v-else-if="userCars && userCars.length" class="box-white flex flex-col gap-5 h-full overflow-y-auto">
          <CardCar 
            v-for="(car, index) in userCars.slice(0, 4)" 
            :key="car.id" 
            :car="car"
            :index="index"
            layout="rectangle"
            @click="() => $router.push(`/car/${car.id}`)"
          />
        </div>
        <div v-else class="flex flex-col justify-center items-center gap-5 h-full">
          <NoCarsRegister class="max-w-[150px]"/>
          <p class="font-semibold opacity-50 text-center">{{ isOwnProfile ? "No tenés autos registrados." : "Este usuario no tiene autos registrados." }}</p>
          <Input
          v-if="isOwnProfile"
          type="button"
          text="Registrar auto"
          variant="primary"
          class="max-w-[200px]"
          @click="goToCarRegister"
          />
        </div>
      </div>
      
      <div
        v-if="!$route.matched.some(route => route.name === 'Chat')"
        :class="isOwnProfile ? 'div-my-user' : 'div-user'"
        class="bg-deep-blue-900 overflow-hidden rounded-[40px] py-7 px-5 flex flex-col gap-5 h-full"
        >
        <Heading :type="2" class="medium text-white sm:text-left">{{ isOwnProfile ? "Información personal" : "Información del usuario"  }}</Heading>
        <article class="box-deep overflow-y-auto h-full flex flex-col gap-5 pr-2">
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular text-white">Datos básicos</Heading>
            <ul class="flex flex-col gap-1">
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Nombre</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.personalInfo?.firstName || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Apellido</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.personalInfo?.lastName || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Email</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.email || 'No especificado' }}</p>
              </li>
              <li v-if="isOwnProfile == true || authStore?.user?.role === 'admin'" class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Teléfono</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.personalInfo?.phone || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Género</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.personalInfo?.gender || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Fecha de nacimiento</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.personalInfo?.birthDate || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Estado de cuenta</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.status === 'verified' ? 'Verificado' : 'No verificado'}}</p>
              </li>
            </ul>
          </div>
        </article>
      </div>  

      <!-- Historial (solo para el usuario logueado) -->
      <div v-if="isOwnProfile" class="my-history bg-primary-900 flex flex-col rounded-[40px] px-5 py-7 gap-6 h-full  overflow-hidden">
        <div class="flex items-end justify-between">
          <Heading :type="2" class="medium text-white text-center sm:text-left">Historial</Heading>
          <router-link  :to="`/rents/${loggedUserId}`" class="text-white font-medium">Ver más</router-link>
        </div>
        <History />
      </div>
      <div 
        v-else 
        class="reviews bg-primary-900 flex flex-col rounded-[40px] px-5 py-7 gap-6 h-full overflow-hidden"
        v-if="!$route.matched.some(route => route.name === 'Chat')">
        <div class="flex items-center">
          <Heading :type="2" class="medium text-white">Reseñas</Heading>
        </div>

        <div v-if="showProfile?.reviews && showProfile?.reviews?.length">
          <!-- Contenido de reseñas proximamente-->
        </div>

        <div v-else class="box-deep text-white flex flex-col items-center justify-center gap-5 h-full overflow-y-auto">
          <NoMessage class="max-w-[150px]"/>
          <p class="font-semibold opacity-50" v-if="showProfile && showProfile.personalInfo">Este usuario no tiene reseñas.</p>
          <Input
            type="button"
            text="Próximamente"
            variant="primary"
            :disabled="true"
            class="max-w-[200px]"
          />
        </div>
      </div>
      <router-view></router-view>
    </section>
</template>

<style scoped>
@media (width >= 768px) {
  .parent {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    grid-template-rows: repeat(2, 1fr);
    grid-column-gap: 20px;
    grid-row-gap: 20px;

    .profile { grid-area: 1 / 1 / 2 / 4; }
    .my-history { grid-area: 1 / 4 / 2 / 6; }
    .div-user { grid-area: 1 / 4 / 2 / 6; }
    .div-my-user { grid-area: 2 / 1 / 3 / 3; }
    .user-cars { grid-area: 2 / 1 / 3 / 4; }
    .cars { grid-area: 2 / 3 / 3 / 6; }
    .reviews { grid-area: 2 / 4 / 3 / 6; }
  }
}
@media (width < 768px) {
  .parent {
    display: flex;
    flex-direction: column;
    gap: 20px;

    .profile { order: 1; }
    .my-history { order: 2; }
    .div-user { order: 3; }
    .div-my-user { order: 4; }
    .user-cars { order: 5; }
    .cars { order: 6; }
    .reviews { order: 7; }
  }
}
</style>