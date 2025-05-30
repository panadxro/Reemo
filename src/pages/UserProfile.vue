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

export default {
  name: "UserProfile",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, UserCar, Arrow, BackButton, MercadoPago, Uala, PayPal, CreditCard, Trash, Plus, Input, DeletePaymentModal, Cross, Check, RentStatusDetails },

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
    const route = useRoute();
    const router = useRouter();
    const showAllPaymentMethods = ref(false);
    const showNewPaymentForm = ref(false);
    const showDeleteModal = ref(false);
    const paymentMethodToDelete = ref(null);    
    const carStore = useCarStore();

    const loggedUserId = computed(() => {
      return authStore.user?.id
    })

    const userIdFromRoute =computed(() => {
      return route.params.id;
    }) 

    const isOwnProfile = computed(() => {
      return loggedUserId.value === userIdFromRoute.value;
    });

    // PAra verificare si es el usuario logueado o un usuario visitado, y le asignamos los autos correspondientes
    const userCars = computed(() => {
  return isOwnProfile.value ? carStore.getUserCars : carStore.getVisitedUserCars;
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
    <BackButton class="md:hidden w-fit mt-1 ml-2" />
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
          <!-- Pongo datos falsos despues los reemplazoamos -->
          <article class="bg-secondary-100 rounded-[20px] md:rounded-[30px] xl:rounded-[40px] p-4 md:p-6 xl:max-w-[600px]">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <img 
                v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto" 
                class="w-16 sm:w-20 md:w-24 lg:w-20 aspect-square rounded-full mx-auto sm:mx-0 flex-shrink-0" 
                :src="showProfile.personalInfo.profilePhoto"
                :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
              />
              
              <div class="flex-1 w-full">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Heading 
                    :type="2" 
                    class="medium text-primary-900 text-center sm:text-left" 
                    v-if="showProfile && showProfile.personalInfo"
                  >
                    {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
                  </Heading>
                </div>
                
                <article class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 md:max-w-[400px]">
                  <div class="rounded-md bg-vibrant-light-600 px-3 py-2 text-center sm:text-left">
                    <Heading :type="3" class="text-primary-900">{{ showProfile?.tripsCount || '0' }}</Heading>
                    <p class="text-xs sm:text-sm text-background-600">Viajes</p>
                  </div>
          
                  <div class="rounded-md bg-vibrant-light-600 px-3 py-2 text-center sm:text-left">
                    <Heading :type="3" class="text-primary-900">{{ showProfile?.rating?.toFixed(1) || '0.0' }}</Heading>
                    <p class="text-xs sm:text-sm text-background-600">Estrellas</p>
                  </div>
          
                  <div class="rounded-md bg-vibrant-light-600 px-3 py-2 text-center sm:text-left sm:col-span-1 col-span-1 flex flex-col">
                    <Heading :type="3" class="text-primary-900 sm:text-base leading-tight">
                      {{ showProfile?.role === 'owner' ? 'Arrendador' : 'Arrendatario' }}
                    </Heading>
                    <p class="text-xs sm:text-sm text-background-600 mt-auto">Rol Principal</p>
                  </div>
                  
                </article>
                
                <!-- Pongo lorem para probar. DESPUES DESCOMNETAR LO DE ABNAJO -->
                <div class="mt-4">
                  <p class="text-primary-900 text-sm md:text-base leading-relaxed">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Illum officia pariatur laudantium similique amet deleniti iste, natus numquam accusantium eius ut aut, quo voluptatem dicta eos sint eveniet sunt alias! Earum deleniti recusandae dolores perferendis optio soluta tempora error ut!
                  </p>
                </div>
                
                <!-- <div class="mt-4">
                  <p class="text-primary-900 text-sm md:text-base leading-relaxed" v-if="showProfile?.bio">
                    {{ showProfile.bio }}
                  </p>
                  <p class="text-primary-900 italic text-xs sm:text-sm text-center sm:text-left" v-else>
                    Este usuario no ha agregado una biografía
                  </p>
                </div> -->
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

  
      </div>
      
      <div class="xl:flex gap-4 mb-4">
        <div class="bg-primary-900 p-6 mt-4 xl:mt-0 rounded-[40px] xl:w-[60%] xl:max-h-[400px] overflow-y-auto">
          <Heading :type="1" class="text-white pb-4">Información Personal</Heading>
          
          <!-- Datos Personales -->
          <div class="mb-6">
            <Heading :type="5" class="text-white mb-3">Datos Básicos</Heading>
            <div class="space-y-2">
              <div class="flex justify-between text-white">
                <span class="text-sm text-white/80">Nombre:</span>
                <span class="text-sm">{{ showProfile?.personalInfo?.firstName || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between text-white">
                <span class="text-sm text-white/80">Apellido:</span>
                <span class="text-sm">{{ showProfile?.personalInfo?.lastName || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between text-white">
                <span class="text-sm text-white/80">Email:</span>
                <span class="text-sm">{{ showProfile?.personalInfo?.email || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between text-white">
                <span class="text-sm text-white/80">Usuario:</span>
                <span class="text-sm">{{ showProfile?.personalInfo?.username || 'No especificado' }}</span>
              </div>
              <div class="flex justify-between text-white">
                <!-- Copie lo que estaba en admin, no es que el usuario este verificado sino que completo todos los pasos del onboarding, que practicamente es lo mismo -->
                <span class="text-sm text-white/80">Usuario verificado:</span>
                <span class="text-sm" :class="userStore.profileData.profileCompleted ? 'text-green-400' : 'text-red-400'">
                  {{ userStore.profileData.profileCompleted == true ? 'Verificado' : 'No Verificado'}}
                </span>
              </div>
            </div>
          </div>
        
          <!-- Dirección -->
          <div class="mb-6" v-if="showProfile?.address && Object.keys(showProfile.address).length > 0">
            <Heading :type="5" class="text-white mb-3">Dirección</Heading>
            <div class="space-y-2">
              <div class="flex justify-between text-white" v-if="showProfile.address.province && showProfile.address.country">
                <span class="text-sm text-white/80">Residencia:</span>
                <span class="text-sm">{{ showProfile.address.province }}, {{ showProfile.address.country }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.street">
                <span class="text-sm text-white/80">Calle:</span>
                <span class="text-sm">{{ showProfile.address.street }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.state">
                <span class="text-sm text-white/80">Provincia:</span>
                <span class="text-sm">{{ showProfile.address.state }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.postalCode">
                <span class="text-sm text-white/80">Código Postal:</span>
                <span class="text-sm">{{ showProfile.address.postalCode }}</span>
              </div>
            </div>
          </div>
        
        <!-- Documentos -->
        <div class="mb-6" v-if="showProfile?.documents">
          <Heading :type="5" class="text-white mb-3">Documentos</Heading>
          <div class="grid grid-cols-2 gap-4">
            <div v-if="showProfile.documents.dniFront" class="text-center">
              <img 
                :src="showProfile.documents.dniFront" 
                alt="DNI - Frente"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">DNI - Frente</p>
            </div>
            
            <div v-if="showProfile.documents.dniBack" class="text-center">
              <img 
                :src="showProfile.documents.dniBack" 
                alt="DNI - Dorso"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">DNI - Dorso</p>
            </div>
            
            <div v-if="showProfile.documents.driverLicenseFront" class="text-center">
              <img 
                :src="showProfile.documents.driverLicenseFront" 
                alt="Licencia de Conducir - Frente"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">Licencia - Frente</p>
            </div>
            
            <div v-if="showProfile.documents.driverLicenseBack" class="text-center">
              <img 
                :src="showProfile.documents.driverLicenseBack" 
                alt="Licencia de Conducir - Dorso"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">Licencia - Dorso</p>
            </div>
          </div>
        </div>
        
          <!-- Métodos de pago -->
          <div class="mb-3">
            <div class="flex items-center justify-between mb-3 gap-8 text-white">
              <Heading :type="5" class="text-white">Métodos de pago</Heading>
              <button 
                @click="toggleNewPaymentForm"
                class="flex items-center gap-1 border-b-[0.5px] border-transparent hover:border-white transition duration-200 hover:cursor-pointer"
              >
                <Plus class="w-4 h-4" />
                <span class="text-sm pb-0.5">Agregar</span>
              </button>
            </div>
          
            <!-- Lista de métodos de pago -->
            <div v-if="paymentStore.paymentMethods.length > 0" class="space-y-2 mb-3">
              <div 
                v-for="(method, index) in displayedPaymentMethods" 
                :key="index" 
                class="flex items-center justify-between p-3 bg-white rounded-lg"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 flex items-center justify-center p-1 rounded-xl bg-vibrant-light-600">
                    <MercadoPago v-if="method.walletType === 'mercadopago'"/>
                    <CreditCard v-if="method.type === 'credit_card'"/>
                    <Uala v-if="method.walletType === 'uala'"/>
                    <PayPal v-if="method.type === 'paypal'"/>
                  </div>
                  <div class="flex-1">
                    <p class="font-medium text-primary-900 text-sm">
                      {{ method.type === 'credit_card' ? 'Tarjeta terminada en ' + method.cardNumber.slice(-4) : 
                         method.type === 'paypal' ? 'PayPal' : 
                         method.walletType === 'uala' ? 'Ualá' : 
                         method.walletType === 'mercadopago' ? 'Mercado Pago' : 
                         method.walletType === 'otra' ? 'Otra' : 
                         method.walletType || 'Otro método' }}
                    </p>
                    <p class="text-xs text-background-600">
                      {{ method.type === 'credit_card' ? method.cardholder : 
                         method.type === 'digital_wallet' ? method.walletId : 
                         method.email }}
                    </p>
                  </div>
                </div>
                <button 
                  @click="removePaymentMethod(index)"
                  class="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors hover:cursor-pointer"
                  title="Eliminar método de pago"
                >
                  <Trash class="w-6 h-6" />
                </button>
              </div>
              
              <!-- Botón mostrar más/menos -->
              <button 
                v-if="hasMoreMethods"
                @click="toggleShowAllMethods"
                class="w-full text-sm text-primary-200 hover:text-primary-400 py-2 hover:bg-primary-50 rounded transition-colors"
              >
                {{ showAllPaymentMethods ? 'Mostrar menos' : `Mostrar ${paymentStore.paymentMethods.length - 2} método(s) más` }}
              </button>
            </div>
          
            <!-- Mensaje cuando no hay métodos -->
            <div v-else class="text-center py-4">
              <p class="text-white/80 text-sm mb-2">No tenés métodos de pago guardados</p>
            </div>
          
            <!-- Formulario para agregar nuevo método -->
            <div v-if="showNewPaymentForm" class="mt-4 p-4 rounded-lg border-secondary-100 border-2">
              <div class="flex items-center justify-between mb-4">
                <Heading :type="6" class="text-white">Nuevo método de pago</Heading>
                <button 
                  @click="toggleNewPaymentForm"
                  class="hover:text-background-800 text-white hover:cursor-pointer transition duration-200"
                >
                  ✕
                </button>
              </div>
              
              <!-- Selector de tipo de método -->
              <div class="flex gap-2 mb-4">
                <button 
                  @click="paymentStore.selectedPaymentMethodType = 'credit_card'" 
                  class="flex-1 p-2 text-xs border rounded-lg cursor-pointer text-center transition-all"
                  :class="{
                    'border-secondary-100 bg-secondary-100 text-primary-900': paymentStore.selectedPaymentMethodType === 'credit_card', 
                    'border-background-300 text-white hover:bg-secondary-100/20': paymentStore.selectedPaymentMethodType !== 'credit_card'
                  }"
                >
                  Tarjeta
                </button>
                <button 
                  @click="paymentStore.selectedPaymentMethodType = 'digital_wallet'" 
                  class="flex-1 p-2 text-xs border rounded-lg cursor-pointer text-center transition-all"
                  :class="{
                    'border-secondary-100 bg-secondary-100 text-primary-900': paymentStore.selectedPaymentMethodType === 'digital_wallet', 
                    'border-background-300 text-white hover:bg-secondary-100/20': paymentStore.selectedPaymentMethodType !== 'digital_wallet'
                  }"
                >
                  Billetera Virtual
                </button>
                <button 
                  @click="paymentStore.selectedPaymentMethodType = 'paypal'" 
                  class="flex-1 p-2 text-xs border rounded-lg cursor-pointer text-center transition-all"
                  :class="{
                    'border-secondary-100 bg-secondary-100 text-primary-900': paymentStore.selectedPaymentMethodType === 'paypal', 
                    'border-background-300 text-white hover:bg-secondary-100/20': paymentStore.selectedPaymentMethodType !== 'paypal'
                  }"
                >
                  PayPal
                </button>
              </div>
              
              <!-- Formularios específicos por tipo -->
              <div class="space-y-3 mb-4">
                <div v-if="paymentStore.selectedPaymentMethodType === 'credit_card'" class="space-y-3">
                  <Input 
                    type="text"
                    placeholder="Titular de tarjeta"
                    v-model="paymentStore.newPaymentMethod.credit_card.cardholder"
                    :variant="'secondary'"
                    :outline="false"
                  />
                  <Input 
                    type="text"
                    placeholder="Número de tarjeta"
                    v-model="paymentStore.newPaymentMethod.credit_card.cardNumber"
                    :variant="'secondary'"
                    :outline="false"
                  />
                  <div class="flex gap-2">
                    <Input 
                      type="month"
                      placeholder="MM/AA"
                      v-model="paymentStore.newPaymentMethod.credit_card.expiryDate"
                      :variant="'secondary'"
                      :outline="false"
                    />
                    <Input
                      type="password"
                      placeholder="CVV"
                      v-model="paymentStore.newPaymentMethod.credit_card.cvv"
                      :variant="'secondary'"
                      :outline="false"
                    />
                  </div>
                </div>
                
                <!-- Billetera digital -->
                <div v-if="paymentStore.selectedPaymentMethodType === 'digital_wallet'" class="space-y-3">
                  <Input 
                    type="select"
                    placeholder="Tipo de billetera"
                    :options="[
                      {value: 'mercadopago', label: 'Mercado Pago'},
                      {value: 'uala', label: 'Ualá'},
                    ]"
                    v-model="paymentStore.newPaymentMethod.digital_wallet.walletType"
                    variant="secondary"
                    :outline="false"
                  />
                  <Input
                    type="text"
                    placeholder="CVU o Alias"
                    v-model="paymentStore.newPaymentMethod.digital_wallet.walletId"
                    variant="secondary"
                    :outline="false"
                  />
                </div>
                
                <!-- PayPal -->
                <div v-if="paymentStore.selectedPaymentMethodType === 'paypal'" class="space-y-3">
                  <Input 
                    type="email"
                    placeholder="Email de PayPal"
                    v-model="paymentStore.newPaymentMethod.paypal.email"
                    :variant="'secondary'"
                    :outline="false"
                  />
                </div>
              </div>
              
              <!-- Botones de acción -->
              <div class="flex gap-2">
                <button 
                  @click="toggleNewPaymentForm" 
                  class="flex-1 py-3 px-4 border border-gray-600 rounded-xl hover:border-gray-400 transition-all text-white hover:cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  @click="saveNewPaymentMethod" 
                  :disabled="!paymentStore.isFormValid || paymentStore.loading"
                  class="flex-1 py-3 px-4 bg-vibrant-light-900 text-deep-blue-900 rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer hover:opacity-80"
                >
                  {{ paymentStore.loading ? 'Guardando...' : 'Guardar' }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sección de autos -->
        <div class="bg-secondary-100 rounded-[40px] p-6 mt-4 xl:mt-0 xl:max-h-[400px] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <Heading :type="1" class="text-primary-900">
              {{ isOwnProfile ? "Mis autos" : "Vehículos" }}
            </Heading>
            <!-- Mostrar en caso de que se haga la pagina -->
            <!-- <router-link 
              v-if="isOwnProfile && userCars.length > 0" 
              to="/my-cars" 
              class="text-primary-800 text-sm hover:text-primary-600 transition-colors"
            >
              Ver todos
            </router-link> -->
          </div>
        
          <div v-if="carStore.loadingUserCars" class="flex justify-center py-8">
            <Loading class="w-8 h-8 text-primary-800" />
          </div>
        
          <div v-else-if="userCars.length > 0" class="space-y-4">
            <div 
              v-for="car in userCars.slice(0, 4)" 
              :key="car.id"
              :class="[
                'bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer',
                userCars.length === 1 ? 'p-6' : 'p-4'
              ]"
              @click="$router.push(`/car/${car.id}`)"
            >
              <div :class="['flex', userCars.length === 1 ? 'gap-6' : 'gap-4']">
                <div class="relative flex-shrink-0">
                  <img 
                    :src="car.images?.[0] || carStore.defaultCarImage" 
                    :alt="car.marca + ' ' + car.modelo"
                    :class="[
                      'object-cover rounded-xl',
                      userCars.length === 1 ? 'w-32 h-28 sm:w-36 sm:h-32' : 'w-24 h-20 sm:w-28 sm:h-24'
                    ]"
                    @error="carStore.handleImageError"
                  />
                  <div 
                    :class="[
                      'absolute -top-1 -right-1 rounded-full font-medium',
                      userCars.length === 1 ? 'px-3 py-1.5 text-sm' : 'px-2 py-1 text-xs',
                      car.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    ]"
                  >
                    {{ car.isAvailable ? 'Disponible' : 'No disponible' }}
                  </div>
                </div>
        
                <div :class="['flex-1', userCars.length === 1 ? 'space-y-3' : 'space-y-2']">
                  <div class="flex justify-between items-start">
                    <h3 :class="[
                      'font-bold text-primary-900 leading-tight',
                      userCars.length === 1 ? 'text-xl' : 'text-lg'
                    ]">
                      {{ car.marca }} {{ car.modelo }}
                    </h3>
                    <span :class="[
                      'text-primary-800 font-bold flex-shrink-0 ml-2',
                      userCars.length === 1 ? 'text-base' : 'text-sm'
                    ]">
                      ${{ car.precio }}/día
                    </span>
                  </div>
                  
                  <p :class="[
                    'text-background-600',
                    userCars.length === 1 ? 'text-base' : 'text-sm'
                  ]">
                    {{ car.año }} • {{ car.combustible }} • {{ car.transmision }}
                  </p>
        
                  <!-- Cambiar info como queiran -->
                  <div class="flex gap-2 flex-wrap">
                    <span :class="[
                      'bg-vibrant-light-600 text-primary-900 px-2 py-1 rounded-lg',
                      userCars.length === 1 ? 'text-sm' : 'text-xs'
                    ]">
                      {{ car.asientos }} asientos
                    </span>
                  </div>
        
                  <!-- Agregar despues -->
                  <!-- <div v-if="car.rating" class="flex items-center gap-1">
                    <span class="text-yellow-500">★</span>
                    <span class="text-sm text-primary-900 font-medium">{{ car.rating }}</span>
                    <span class="text-xs text-background-600">({{ car.reviewCount || 0 }} reseñas)</span>
                  </div> -->
                </div>
              </div>
            </div>
            <router-link 
          v-if="isOwnProfile" 
          to="/car/register" 
          class="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium"
        >
          <Plus class="w-4 h-4" />
          Registrar auto
        </router-link>
          </div>
        
          <div v-else class="text-center py-8">
            <img 
              src="@/assets/no-cars.png" 
              alt="No cars" 
              class="max-w-[120px] mx-auto mb-4 opacity-50"
            />
            <Heading :type="3" class="text-background-600 mb-2">
             Aún no tenés autos registrados
            </Heading>
            <router-link 
              v-if="isOwnProfile" 
              to="/car/register" 
              class="inline-flex items-center gap-2 px-4 py-2 bg-primary-800 text-white rounded-lg hover:bg-primary-900 transition-colors font-medium"
            >
              <Plus class="w-4 h-4" />
              Registrar auto
            </router-link>
          </div>
        
          <!-- se deberia mostrar en caso de que haya mas de 4 autos pero es dificcil que pase y ademas la apgina no existe -->
          <!-- <div v-if="userCars.length > 4" class="mt-4 text-center">
            <router-link 
              to="/my-cars" 
              class="text-primary-800 hover:text-primary-600 text-sm font-medium"
            >
              Ver los {{ userCars.length - 4 }} autos restantes →
            </router-link>
          </div> -->
        </div>
      </div>


      
      <!-- <router-view></router-view> -->
    </section>
    <DeletePaymentModal
    :isOpen="showDeleteModal"
    :paymentMethod="paymentMethodToDelete?.method"
    title="Eliminar método de pago"
    message="¿Estás seguro de que querés eliminar este método de pago? Esta acción no se puede deshacer."
    confirmText="Eliminar"
    cancelText="Cancelar"
    @close="() => { showDeleteModal = false; paymentMethodToDelete = null; }"
    @confirm="confirmDeletePaymentMethod"
  />
    <div
      v-if="!$route.matched.some(route => route.name === 'PrivateChat')"
      :class="isOwnProfile ? 'div-my-user' : 'div-user'"
      class="div1 bg-gray-100 rounded-[40px]">
      <!-- <p>Usuario</p> -->
    </div>  

    <!-- Historial (solo para el usuario logueado) -->
    <div v-if="isOwnProfile" class="my-history bg-primary-900 rounded-[40px] px-5 py-7">
      <div class="flex items-center justify-between">
        <Heading :type="1" class="text-white">Historial</Heading>
        <a href="" class="text-white">Ver más</a>
      </div>
      <!-- <div v-if="rentedCars.length"> -->
        <RentStatusDetails />
        <!-- <RentedCar v-for="rental in rentedCars" :key="rental.id" :car="rental.car" /> -->
      <!-- </div> -->
      <!-- <div v-else class="flex flex-col justify-center items-center h-full text-white">
        <p class="text-pretty font-semibold opacity-50">Aún no has alquilado ningún auto.</p>
        <router-link to="/search" class="font-semibold opacity-50 hover:opacity-100">
          <span class="hover:underline">Alquilá un auto</span>
        </router-link>
      </div> -->
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




  <section class="" v-else>
    <BackButton class="md:hidden w-fit mt-1 ml-2" />
    <section class="max-w-[95%] mx-auto md:mx-0 xl:max-w-[2388px]">
      <div class="xl:flex gap-4 mb-4">
        <!-- Seccion datos del otro usuario e infor -->
        <div class="flex flex-col xl:w-[50%] xl:max-h-[785.5px]" 
             :class="{ 'hidden xl:flex': $route.matched.some(route => route.name === 'PrivateChat') }">
          <div class="hidden md:flex md:items-center md:gap-2 mb-4 w-fit">
            <BackButton />
            <Heading v-if="showProfile && showProfile.personalInfo" :type="1" class="pt-2">
              {{ showProfile.personalInfo.username }}
            </Heading>
          </div>
          
          <article class="bg-secondary-100 rounded-[20px] md:rounded-[30px] xl:rounded-[40px] p-4 md:p-6 xl:max-h-[400px] overflow-y-auto">
            <div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <img 
                v-if="showProfile && showProfile.personalInfo && showProfile.personalInfo.profilePhoto" 
                class="w-16 sm:w-20 md:w-24 lg:w-20 aspect-square rounded-full mx-auto sm:mx-0 flex-shrink-0" 
                :src="showProfile.personalInfo.profilePhoto"
                :alt="`Perfil de ${showProfile?.personalInfo?.username || 'usuario'}`" 
              />
              
              <div class="flex-1 w-full">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <Heading 
                    :type="2" 
                    class="medium text-primary-900 text-center sm:text-left" 
                    v-if="showProfile && showProfile.personalInfo"
                  >
                    {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }}
                  </Heading>
                  
                  <router-link 
                    v-if="!isOwnProfile && showProfile && showProfile.personalInfo && showProfile.personalInfo.id !== id"
                    :to="`/user/${id}/chat`" 
                    class="text-sm md:text-base text-primary-800 border-2 border-primary-800 rounded-lg px-3 py-2 md:px-4 bg-white hover:bg-primary-800 hover:text-white transition-colors duration-300 text-center sm:text-left whitespace-nowrap w-fit mx-auto sm:mx-0"
                  >
                    Enviar Mensaje
                  </router-link>
                </div>
                
                <article class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 md:max-w-[400px]">
                  <div class="rounded-md bg-vibrant-light-600 px-3 py-2 text-center sm:text-left">
                    <Heading :type="3" class="text-primary-900">{{ showProfile?.tripsCount || '0' }}</Heading>
                    <p class="text-xs sm:text-sm text-background-600">Viajes</p>
                  </div>
          
                  <div class="rounded-md bg-vibrant-light-600 px-3 py-2 text-center sm:text-left">
                    <Heading :type="3" class="text-primary-900">{{ showProfile?.rating?.toFixed(1) || '0.0' }}</Heading>
                    <p class="text-xs sm:text-sm text-background-600">Estrellas</p>
                  </div>
          
                  <div class="rounded-md bg-vibrant-light-600 px-3 py-2 text-center sm:text-left sm:col-span-1 col-span-1 flex flex-col">
                    <Heading :type="3" class="text-primary-900 sm:text-base leading-tight">
                      {{ showProfile?.role === 'owner' ? 'Arrendador' : 'Arrendatario' }}
                    </Heading>
                    <p class="text-xs sm:text-sm text-background-600 mt-auto">Rol Principal</p>
                  </div>
                  
                </article>
                
                <div class="mt-4">
                  <p class="text-primary-900 text-sm md:text-base leading-relaxed">
                    Lorem ipsum, dolor sit amet consectetur adipisicing elit. Illum officia pariatur laudantium similique amet deleniti iste, natus numquam accusantium eius ut aut, quo voluptatem dicta eos sint eveniet sunt alias! Earum deleniti recusandae dolores perferendis optio soluta tempora error ut!
                  </p>
                </div>
              </div>
            </div>
          </article>
  
          <div class="bg-primary-900 p-6 mt-4 rounded-[40px] xl:max-h-[400px] overflow-y-auto">
            <Heading :type="1" class="text-white pb-4">Información del Usuario</Heading>
            
            <!-- Aca pongo los tres items como validadods si profileCompleted es truew -->
            <div class="mb-6">
              <Heading :type="5" class="text-white mb-3">Verificación</Heading>
              <div class="space-y-3">
                <div class="flex items-center gap-3">
                  <Cross class="w-6 h-6 text-primary-900 bg-alert-warning-800 rounded-full" v-if="!showProfile?.profileCompleted" />
                  <Check class="w-6 h-6 bg-alert-success-900  rounded-full" v-else />
                  <span class="text-white text-sm">Identidad verificada</span>
                </div>
                <div class="flex items-center gap-3">
                  <Cross class="w-6 h-6 text-primary-900 bg-alert-warning-800 rounded-full" v-if="!showProfile?.profileCompleted" />
                  <Check class="w-6 h-6 bg-alert-success-900 rounded-full" v-else />
                  <span class="text-white text-sm">Licencia de conducir verificada</span>
                </div>
                <div class="flex items-center gap-3">
                  <Cross class="w-6 h-6 text-primary-900 bg-alert-warning-800 rounded-full" v-if="!showProfile?.profileCompleted" />
                  <Check class="w-6 h-6 bg-alert-success-900 rounded-full" v-else />
                  <span class="text-white text-sm">Usuario verificado</span>
                </div>
              </div>
            </div>
    
            <div class="mb-6">
              <Heading :type="5" class="text-white mb-3">Estadísticas</Heading>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ showProfile?.responseRate || '0' }}%</div>
                  <div class="text-white/80 text-sm">Tasa de respuesta</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ showProfile?.yearsOnPlatform || '0' }}</div>
                  <div class="text-white/80 text-sm">En la plataforma</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ showProfile?.rating?.toFixed(1) || '0.0' }}</div>
                  <div class="text-white/80 text-sm">Calificación promedio</div>
                </div>
                <div class="text-center">
                  <div class="text-2xl font-bold text-white">{{ showProfile?.completedRentals || '0' }}</div>
                  <div class="text-white/80 text-sm">Alquileres completados</div>
                </div>
              </div>
            </div>
    
            <div class="mb-4">
              <Heading :type="5" class="text-white mb-3">Tiempo de respuesta</Heading>
              <div class="bg-white/10 rounded-lg p-3">
                <span class="text-white text-sm">
                  {{ showProfile?.averageResponseTime ? `Responde normalmente en menos de ${showProfile.averageResponseTime} horas` : 'Tiempo de respuesta no disponible' }}
                </span>
              </div>
            </div>
          </div>
        </div>
  
        <router-view 
          class="xl:hidden w-full min-h-screen" 
          v-if="$route.matched.some(route => route.name === 'PrivateChat')"
        ></router-view>
  
       
        <template v-if="!$route.matched.some(route => route.name === 'PrivateChat')">
          <div class="xl:w-[50%] xl:max-h-[785.5px] flex flex-col gap-4">
            <div class="bg-primary-900 border-2 rounded-[40px] p-6 mt-4 xl:mt-0 max-h-[380px] overflow-y-auto h-full">
              <div class="flex items-center justify-between mb-4">
                <Heading :type="1" class="text-white">Reseñas</Heading>
                <span class="text-white text-sm">{{ showProfile?.reviews?.length || '0' }} reseñas</span>
              </div>
    
              <div v-if="showProfile?.reviews && showProfile?.reviews?.length">
                <!-- Contenido de reseñas -->
              </div>
    
              <div v-else class="text-white flex flex-col items-center justify-center">
                <img src="@/assets/no-reviews.png" alt="Sin reseñas" class="max-w-[150px] mx-auto mb-4" />
                <Heading :type="3" class="text-white text-center" v-if="showProfile && showProfile.personalInfo">
                  {{ showProfile.personalInfo.firstName }} {{ showProfile.personalInfo.lastName }} no tiene reseñas.
                </Heading>
              </div>
            </div>
  
            <div class="bg-secondary-100 rounded-[40px] p-6 xl:mt-0 xl:max-h-[400px] overflow-y-auto">
              <div class="flex items-center justify-between mb-4">
                <Heading :type="1" class="text-primary-900">Vehículos</Heading>
                <span class="text-primary-800 text-sm">{{ userCars.length }} disponibles</span>
              </div>
            
              <div v-if="carStore.loadingUserCars" class="flex justify-center py-8">
                <Loading class="w-8 h-8 text-primary-800" />
              </div>
            
              <div v-else-if="userCars.length === 0" class="text-center py-8">
                <p class="text-primary-900">Este usuario no tiene vehículos registrados</p>
              </div>
            
              <div v-else class="space-y-4">
                <div v-for="car in userCars" :key="car.id" 
                     class="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer p-4"
                     @click="$router.push(`/car/${car.id}`)">
                  <div class="flex gap-4">
                    <div class="relative flex-shrink-0">
                      <img 
                        :src="car.images?.[0] || '/src/assets/Car-Img.png'" 
                        :alt="`${car.marca} ${car.modelo}`"
                        class="w-28 h-24 object-cover rounded-xl"
                      />
                      <div class="absolute -top-1 -right-1 px-2 py-1 rounded-full text-xs font-medium"
                           :class="car.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                        {{ car.isAvailable ? 'Disponible' : 'No disponible' }}
                      </div>
                    </div>
            
                    <div class="flex-1 space-y-2">
                      <div class="flex justify-between items-start">
                        <h3 class="text-lg font-bold text-primary-900 leading-tight">
                          {{ car.marca }} {{ car.modelo }}
                        </h3>
                        <span class="text-sm text-primary-800 font-bold flex-shrink-0 ml-2">
                          ${{ car.precio }}/día
                        </span>
                      </div>
                      
                      <p class="text-sm text-background-600">
                        {{ car.año }} • {{ car.combustible }} • {{ car.transmision }}
                      </p>
            
                      <div class="flex gap-2 flex-wrap">
                        <span v-if="car.asientos" class="bg-vibrant-light-600 text-primary-900 px-2 py-1 rounded-lg text-xs">
                          {{ car.asientos }} asientos
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
  
        <router-view 
          class="xl:w-[50%] hidden xl:block max-h-[785.5px]" 
          v-if="$route.matched.some(route => route.name === 'PrivateChat')"
        ></router-view>
      </div>
    </section>
  </section>

</template>