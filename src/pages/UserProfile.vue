<script>
import { useUserStore, useAuthStore  } from '@stores'
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { usePaymentStore } from '@/stores/payment.store.js'

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
import DeletePaymentModal from '@/components/user/DeletePaymentModal.vue';

export default {
  name: "UserProfile",
  components: { Heading, CardCar, UserNav, RentedCar, Loading, UserCar, Arrow, BackButton, MercadoPago, Uala, PayPal, CreditCard, Trash, Plus, Input, DeletePaymentModal },
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

    const loggedUserId = computed(() => {
      return authStore.user?.id
    })

    const userIdFromRoute =computed(() => {
      return route.params.id;
    }) 

    const isOwnProfile = computed(() => {
      return loggedUserId.value === userIdFromRoute.value;
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
  const success = await paymentStore.saveNewPaymentMethod(loggedUserId.value);
  if (success) {
    showNewPaymentForm.value = false;
  }
};

    onMounted(async () => {
      await userStore.loadUserProfile(userIdFromRoute.value);

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
      
      <div class="xl:flex gap-4 mb-4">
        <div class="bg-primary-900 p-6 mt-4 xl:mt-0 rounded-[40px] xl:w-[60%] max-h-[400px] overflow-y-auto">
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
                <span class="text-sm text-white/80">Email verificado:</span>
                <span class="text-sm" :class="showProfile?.personalInfo?.emailVerified ? 'text-green-400' : 'text-red-400'">
                  {{ showProfile?.personalInfo?.emailVerified ? 'Sí' : 'No' }}
                </span>
              </div>
            </div>
          </div>
        
          <!-- Dirección -->
          <div class="mb-6" v-if="showProfile?.address && Object.keys(showProfile.address).length > 0">
            <Heading :type="5" class="text-white mb-3">Dirección</Heading>
            <div class="space-y-2">
              <div class="flex justify-between text-white" v-if="showProfile.address.street">
                <span class="text-sm text-white/80">Calle:</span>
                <span class="text-sm">{{ showProfile.address.street }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.city">
                <span class="text-sm text-white/80">Ciudad:</span>
                <span class="text-sm">{{ showProfile.address.city }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.state">
                <span class="text-sm text-white/80">Provincia:</span>
                <span class="text-sm">{{ showProfile.address.state }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.zipCode">
                <span class="text-sm text-white/80">Código Postal:</span>
                <span class="text-sm">{{ showProfile.address.zipCode }}</span>
              </div>
              <div class="flex justify-between text-white" v-if="showProfile.address.country">
                <span class="text-sm text-white/80">País:</span>
                <span class="text-sm">{{ showProfile.address.country }}</span>
              </div>
            </div>
          </div>
        
        <!-- Documentos -->
        <div class="mb-6" v-if="showProfile?.documents">
          <Heading :type="5" class="text-white mb-3">Documentos</Heading>
          <div class="grid grid-cols-2 gap-4">
            <!-- DNI - Frente -->
            <div v-if="showProfile.documents.dniFront" class="text-center">
              <img 
                :src="showProfile.documents.dniFront" 
                alt="DNI - Frente"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">DNI - Frente</p>
            </div>
            
            <!-- DNI - Dorso -->
            <div v-if="showProfile.documents.dniBack" class="text-center">
              <img 
                :src="showProfile.documents.dniBack" 
                alt="DNI - Dorso"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">DNI - Dorso</p>
            </div>
            
            <!-- Licencia de Conducir - Frente -->
            <div v-if="showProfile.documents.driverLicenseFront" class="text-center">
              <img 
                :src="showProfile.documents.driverLicenseFront" 
                alt="Licencia de Conducir - Frente"
                class="h-20 w-[95%] object-cover rounded-lg border border-white/20"
              />
              <p class="text-xs text-white/80 mt-1">Licencia - Frente</p>
            </div>
            
            <!-- Licencia de Conducir - Dorso -->
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