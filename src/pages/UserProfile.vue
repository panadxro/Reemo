<script>
import { useUserStore, useAuthStore  } from '@stores'
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentStore } from '@/stores/payment.store.js'
import { useCarStore } from '@/stores/car.store.js' 

import Heading from "@components/atoms/Heading.vue";
import CardCar from "@components/organisms/my-cars/CardCar.vue";
import UserNav from "@components/user/UserNav.vue";
import RentedCar from "@components/organisms/rental/RentedCar.vue";
import Loading from "@icons/Loading.vue";
import UserCar from "@components/organisms/my-cars/UserCar.vue";
import Arrow from "../icons/Arrow.vue";
import BackButton from "@components/atoms/BackButton.vue";

import MercadoPago from "@icons/MercadoPago.vue";
import Uala from "@icons/Uala.vue";
import PayPal from "@icons/PayPal.vue";
import CreditCard from "@icons/CreditCard.vue";
import Input from "@components/molecules/Input.vue";
import Trash from "@icons/Trash.vue";
import Plus from "@icons/Plus.vue";
import Cross from "@icons/Cross.vue";
import Check from "@icons/Check.vue";
import DeletePaymentModal from '@/components/user/DeletePaymentModal.vue';
import RentStatusDetails from '@/components/organisms/rental/RentStatusDetails.vue';
import History from '@/components/user/history.vue'

export default {
  name: "UserProfile",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, UserCar, Arrow, BackButton, MercadoPago, Uala, PayPal, CreditCard, Trash, Plus, Input, DeletePaymentModal, Cross, Check, RentStatusDetails, History },
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
    const paymentStore = usePaymentStore();
    const carStore = useCarStore();

    const route = useRoute();
    const router = useRouter();

    const showAllPaymentMethods = ref(false);
    const showNewPaymentForm = ref(false);
    const showDeleteModal = ref(false);
    const paymentMethodToDelete = ref(null);    

    const loggedUserId = computed(() => {
      return authStore.user?.id
    })

    const userIdFromRoute = computed(() => {
      return route.params.id;
    }) 

    const isOwnProfile = computed(() => {
      return loggedUserId.value === userIdFromRoute.value;
    });

    // PAra verificare si es el usuario logueado o un usuario visitado, y le asignamos los autos correspondientes
    const userCars = computed(() => {
      return carStore.loadCarById(userIdFromRoute.value);
    });

    const displayedPaymentMethods = computed(() => {
      if (!paymentStore.paymentMethods.length) return [];
      return showAllPaymentMethods.value 
        ? paymentStore.paymentMethods 
        : paymentStore.paymentMethods.slice(0, 2);
    }); 

  const hasMoreMethods = computed(() => {
    return paymentStore.paymentMethods.length > 2;
  });

    const showProfile = computed(() => {
      return isOwnProfile.value ? userStore.profileData : userStore.visitedProfileData
    })

    watch(userIdFromRoute, async (newUserId, oldUserId) => {
      if (newUserId !== oldUserId) {
        await userStore.loadUserProfile(newUserId);
      }
    });

    const toggleShowAllMethods = () => {
  showAllPaymentMethods.value = !showAllPaymentMethods.value;
};

const toggleNewPaymentForm = () => {
  showNewPaymentForm.value = !showNewPaymentForm.value;
  if (showNewPaymentForm.value) {
    paymentStore.resetNewPaymentMethodForm();
  }
};

const removePaymentMethod = (index) => {
  paymentMethodToDelete.value = {
    index: index,
    method: paymentStore.paymentMethods[index]
  };
  showDeleteModal.value = true;
};

const confirmDeletePaymentMethod = async () => {
  if (paymentMethodToDelete.value !== null) {
    await paymentStore.removePaymentMethod(
      loggedUserId.value, 
      paymentMethodToDelete.value.index
    );
    showDeleteModal.value = false;
    paymentMethodToDelete.value = null;
  }
};

const saveNewPaymentMethod = async () => {
  const Check = await paymentStore.saveNewPaymentMethod(loggedUserId.value);
  if (Check) {
    showNewPaymentForm.value = false;
  }
};

    onMounted(async () => {
      await userStore.loadUserProfile(userIdFromRoute.value);
      // console.error("User is not logged in", userIdFromRoute.value)

      // Fetch a los autos del usuaroi
      await carStore.loadUserCars(userIdFromRoute.value);

      if(loggedUserId.value && isOwnProfile.value){
        if(!userStore.profileData.profileCompleted){
          router.push('/onboarding')
        }
        await paymentStore.fetchPaymentMethods(loggedUserId.value);
      }
    });
    
    return {
      userStore,
      isOwnProfile,
      posts: userStore.posts,
      rentedCars: userStore.rentedCars,
      showProfile,
      paymentStore,
      userIdFromRoute,
      showAllPaymentMethods,
      showNewPaymentForm,
      displayedPaymentMethods,
      hasMoreMethods,
      toggleShowAllMethods,
      toggleNewPaymentForm,
      removePaymentMethod,
      saveNewPaymentMethod,
      showDeleteModal,
      paymentMethodToDelete,
      confirmDeletePaymentMethod,
      carStore,
      userCars
    };
  }
}
</script>

<template>
  <div class="flex md:flex-1 xs:flex-row-reverse md:flex-row max-h-vh overflow-auto mb-20 md:mb-0">
    <UserNav v-if="isOwnProfile"/>
    <section class="parent m-2.5 w-full md:max-h-vh md:overflow-hidden">

      <!-- Perfil del usuario -->
      <div class="flex profile flex-col gap-3 overflow-hidden">
        <div class="flex items-center gap-5">
          <BackButton />
          <Heading v-if="showProfile && showProfile.personalInfo" :type="1" class="medium">{{ isOwnProfile ? "Mi perfil" : showProfile.personalInfo.username }}</Heading>
        </div>
        <article  class="bg-secondary-100 h-full rounded-[40px] px-6 py-5 flex flex-col md:flex-row items-center gap-5">
          <img 
            v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto"
            class="w-32 md:w-24 lg:w-32 aspect-square rounded-full object-cover bg-vibrant-light-800"
            :src="showProfile.personalInfo.profilePhoto"
            :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
          />
          <div class="flex flex-col justify-between h-full gap-2 md:gap-0">
            <div class="flex justify-between items-center">
              <Heading :type="2" class="medium text-primary-900 text-center sm:text-left"
                v-if="showProfile && showProfile.personalInfo">
                {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
              </Heading>
              <router-link
                v-if="!isOwnProfile && showProfile && showProfile.personalInfo && showProfile.personalInfo.id !== id"
                :to="`/user/${id}/chat`"
                class="text-sm md:text-base text-primary-800 border-2 border-primary-800 rounded-lg px-3 py-2 md:px-4 bg-white hover:bg-primary-800 hover:text-white transition-colors duration-300 text-center sm:text-left whitespace-nowrap w-fit mx-auto sm:mx-0">
                Enviar Mensaje
              </router-link>
            </div>

            <ul class="flex items-center gap-2.5">
              <li class="flex flex-col bg-vibrant-light-600 rounded-xl px-2.5 py-2.5 w-16 h-16">
                <Heading :type="3" class="medium text-primary-900 leading-none">{{ showProfile?.tripsCount || '0' }}</Heading>
                <p class="text-xs sm:text-sm text-background-600">Viajes</p>
              </li>

              <li class="flex flex-col bg-vibrant-light-600 rounded-xl px-2.5 py-2.5 h-16">
                <Heading :type="3" class="medium text-primary-900 leading-none">{{ showProfile?.rating?.toFixed(1) || '0.0' }}</Heading>
                <p class="text-xs sm:text-sm text-background-600">Estrellas</p>
              </li>

              <li class="flex flex-col bg-vibrant-light-600 rounded-xl px-2.5 py-2.5 h-16">
                <Heading :type="3" class="medium text-primary-900 leading-none">Rol</Heading>
                <p class="text-xs sm:text-sm text-background-600">{{ showProfile?.role === 'owner' ? 'Arrendador' : 'Arrendatario' }}</p>
              </li>
            </ul>

            <p class="text-primary-900 text-sm md:text-md leading-relaxed">
              Lorem ipsum, dolor sit amet consectetur adipisicing elit. Illum officia pariatur laudantium
              similique amet deleniti iste, natus numquam accusantium eius ut aut, quo voluptatem dicta eos sint
              eveniet sunt alias! 200 caracteres máximos.
            </p>
          </div>
        </article>
      </div>

      <!-- Autos del usuario -->
      <div class="overflow-hidden flex flex-col gap-5 px-5" :class="isOwnProfile ? 'my-cars' : 'user-cars'">
        <div class="flex items-center justify-between">
          <Heading :type="2" class="medium text-primary-900 text-center sm:text-left">{{ isOwnProfile ? "Mis autos" : "Vehículos" }}</Heading>
          <a href="" class="text-primary-900">Ver más</a>
        </div>
        <div v-if="carStore.loading" class="flex justify-center py-8">
          <Loading class="w-8 h-8 text-primary-800" />
        </div>
        <div v-else-if="userCars && userCars.length" class="flex flex-col gap-5 h-full overflow-auto">
          <UserCar 
            v-for="car in userCars.slice(0, 4)" 
            :key="car.id" 
            :car="car"
            @click="() => $router.push(`/car/${car.id}`)"
          />
          <router-link 
            v-if="isOwnProfile" 
            to="/car/register" 
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium"
            >
            <Plus class="w-4 h-4" />
            Registrar auto
          </router-link>
        </div>
        <div v-else class="flex flex-col justify-center items-center h-full">
          <img src="@/assets/no-cars.png" alt="No cars" class="max-w-[120px] mx-auto opacity-50" />
          <p class="font-semibold opacity-50">{{ isOwnProfile ? "Aún no tienes autos registrados." : "Este usuario no tiene autos registrados." }}</p>
          <router-link v-if="isOwnProfile" to="/car/register" class="font-semibold opacity-50 hover:opacity-100">
            <span class="hover:underline">Registra un auto</span>
          </router-link>
        </div>
      </div>
      
      <div
        v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
        :class="isOwnProfile ? 'div-my-user' : 'div-user'"
        class="bg-deep-blue-900 overflow-hidden rounded-[40px] py-7 px-5 "
        >
        <Heading :type="2" class="medium text-white text-center sm:text-left">{{ isOwnProfile ? "Información Personal" : "Información del Usuario"  }}</Heading>
        <article v-if="isOwnProfile" class="overflow-y-auto h-full flex flex-col gap-5 pr-4 py-4">
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular text-white">Datos Básicos</Heading>
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
                <p class="text-sm text-white/50">{{ showProfile?.personalInfo?.email || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Estado</Heading>
                <p class="text-sm text-white/50">{{ userStore.profileData.profileCompleted == true ? 'Verificado' : 'No Verificado'}}</p>
              </li>
            </ul>
          </div>
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular text-white">Dirección</Heading>
            <ul class="flex flex-col gap-1">
              <li class="flex justify-between items-center">
                <span class="text-sm font-bold text-white">Ciudad</span>
                <p class="text-sm text-white/50">
                  {{ showProfile?.address?.province || 'No especificado' }},
                  {{ showProfile?.address?.country || 'No especificado' }}
                </p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Calle</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.address?.street || 'No especificado' }}</p>
              </li>
              <li class="flex justify-between items-center">
                <Heading :type="6" class="text-sm font-bold text-white">Código Postal</Heading>
                <p class="text-sm text-white/50">{{ showProfile?.address?.postalCode || 'No especificado' }}</p>
              </li>
            </ul>
          </div>
        </article>
        <article v-else class="overflow-y-auto h-full flex flex-col gap-5 pr-4 py-4">
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular text-white">Verificación</Heading>
            <ul class="flex flex-col gap-2">
              <li class="flex items-center gap-2">
                <Cross class="w-6 h-6 text-primary-900 bg-alert-warning-800 rounded-full"
                  v-if="!showProfile?.profileCompleted" />
                <Check class="w-6 h-6 bg-alert-success-900  rounded-full" v-else />
                <span class="text-white text-sm">Identidad verificada</span>
              </li>
              <li class="flex items-center gap-2">
                <Cross class="w-6 h-6 text-primary-900 bg-alert-warning-800 rounded-full"
                  v-if="!showProfile?.profileCompleted" />
                <Check class="w-6 h-6 bg-alert-success-900 rounded-full" v-else />
                <span class="text-white text-sm">Licencia de conducir verificada</span>
              </li>
              <li class="flex items-center gap-2">
                <Cross class="w-6 h-6 text-primary-900 bg-alert-warning-800 rounded-full"
                  v-if="!showProfile?.profileCompleted" />
                <Check class="w-6 h-6 bg-alert-success-900 rounded-full" v-else />
                <span class="text-white text-sm">Usuario verificado</span>
              </li>
            </ul>
          </div>
      
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular text-white">Estadísticas</Heading>
            <ul class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <li class="text-center">
                <div class="text-2xl font-bold text-white">{{ showProfile?.responseRate || '0' }}%</div>
                <div class="text-white/80 text-sm">Tasa de respuesta</div>
              </li>
              <li class="text-center">
                <div class="text-2xl font-bold text-white">{{ showProfile?.yearsOnPlatform || '0' }}</div>
                <div class="text-white/80 text-sm">En la plataforma</div>
              </li>
              <li class="text-center">
                <div class="text-2xl font-bold text-white">{{ showProfile?.rating?.toFixed(1) || '0.0' }}</div>
                <div class="text-white/80 text-sm">Calificación promedio</div>
              </li>
              <li class="text-center">
                <div class="text-2xl font-bold text-white">{{ showProfile?.completedRentals || '0' }}</div>
                <div class="text-white/80 text-sm">Alquileres completados</div>
              </li>
            </ul>
          </div>
      
          <div class="flex flex-col gap-2">
            <Heading :type="3" class="regular text-white">Tiempo de respuesta</Heading>
            <div class="bg-white/10 rounded-lg p-3">
              <span class="text-white text-sm">
                {{ showProfile?.averageResponseTime ? `Responde normalmente en menos de
                ${showProfile.averageResponseTime} horas` : 'Tiempo de respuesta no disponible' }}
              </span>
            </div>
          </div>
        </article>
      </div>  

      <!-- Historial (solo para el usuario logueado) -->
      <div v-if="isOwnProfile" class="my-history bg-primary-900 flex flex-col rounded-[40px] px-5 py-7 gap-6">
        <div class="flex items-center justify-between">
          <Heading :type="2" class="medium text-white text-center sm:text-left">Historial</Heading>
          <router-link v-if="rentedCars && rentedCars.length" to="/history" class=" text-white">Ver más</router-link>
        </div>
        <History />
      </div>
      <div 
        v-else 
        class="reviews bg-primary-900 flex flex-col rounded-[40px] px-5 py-7 gap-6"
        v-if="!$route.matched.some(route => route.name === 'PrivateChat')">
        <div class="flex items-center justify-between">
          <Heading :type="2" class="medium text-white">Reseñas</Heading>
          <span class="text-white text-sm">{{ showProfile?.reviews?.length || '0' }} reseñas</span>
        </div>

        <div v-if="showProfile?.reviews && showProfile?.reviews?.length">
          <!-- Contenido de reseñas -->
        </div>

        <div v-else class="text-white flex flex-col items-center justify-center">
          <img src="@/assets/no-reviews.png" alt="Sin reseñas" class="max-w-[120px] mx-auto" />
          <p class="font-semibold opacity-50" v-if="showProfile && showProfile.personalInfo">Este usuario no tiene reseñas.</p>
        </div>
      </div>
      <router-view></router-view>
    </section>
  </div>
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
    .my-cars { grid-area: 2 / 3 / 3 / 6; }
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
    .my-cars { order: 6; }
    .reviews { order: 7; }
  }
}
</style>