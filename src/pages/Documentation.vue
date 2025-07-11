<script setup>
import { ref, inject, computed, onMounted } from 'vue';
import { useUserStore } from '@stores';

import Input from '@components/molecules/Input.vue';
import Heading from '../components/atoms/Heading.vue';
import BackButton from '../components/atoms/BackButton.vue';
import DNIBack from '../components/atoms/DNIBack.vue';
import DNIFront from '../components/atoms/DNIFront.vue';
import Checkbox from '../components/atoms/Checkbox.vue';
import MercadoPago from '../icons/MercadoPago.vue';
import PreviewDocumentation from '../components/user/PreviewDocumentation.vue';
import PaymentMethod from '../components/atoms/PaymentMethod.vue';

const currentStep = ref(0);

const userStore = useUserStore();
const authSession = inject('authSession');

const user = computed(() => ({
  ...userStore.user,
  documents: userStore.user?.documents || {},
  personalInfo: userStore.user?.personalInfo || {}
}));

const selectedPayment = ref(null);

const handlePaymentClick = (method) => {
  selectedPayment.value = method;
  showMobileModal.value = true;
}
const showMobileModal = ref(false);

const handleCloseModal = () => {
  showMobileModal.value = false;
  selectedPayment.value = null;
};

onMounted(async () => {
  try {
    await userStore.loadUserProfile(authSession.user.id);
    console.log(user.value)
  } catch (error) {
    console.error("Error cargando perfil del usuario:", error)
  }
})
</script>

<template>
  <section class="flex flex-col gap-5 md:m-2.5 w-full md:max-h-vh md:overflow-hidden">
    <div class="flex items-center gap-5 fixed md:static top-0 left-0 right-0 z-10 bg-white px-2.5 md:px-0 py-3 md:py-0">
      <BackButton />
      <Heading :type="1" class="medium">Mis documentos</Heading>
    </div>
    <div class="flex flex-row gap-4 overflow-x-auto md:overflow-y-visible min-h-fit pb-2 md:pb-0">
      <Input 
        type="button"
        text="Identificación"
        variant="secondary"
        class="cursor-pointer rounded-2xl !min-w-fit"
        :input-class="currentStep === 0 ? ' bg-vibrant-light-900' : ''"
        @click="currentStep = 0"
      />
      <Input 
        type="button"
        text="Licencia de conducir"
        variant="secondary"
        class="cursor-pointer rounded-2xl !min-w-fit"
        :input-class="currentStep === 1 ? ' bg-vibrant-light-900' : ''"
        @click="currentStep = 1"
      />
      <Input 
        type="button"
        text="Métodos de pago"
        variant="secondary"
        class="cursor-pointer rounded-2xl !min-w-fit"
        :input-class="currentStep === 2 ? ' bg-vibrant-light-900' : ''"
        @click="currentStep = 2"
      />
    </div>
    <article class="flex h-full overflow-hidden">
      <form v-if="currentStep === 0" class="box-white flex flex-col gap-5 h-full w-full md:pr-2 overflow-y-auto">
        <legend class="text-deep-blue-900 font-semibold text-xl">Información personal</legend>
        <div class="flex gap-5">
          <Input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Nombre"
            v-model="user.personalInfo.firstName"
            :variant="'secondary'"
            disabled
            :outline="true"
            :label="true"
            required />
          <Input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Apellido"
            v-model="user.personalInfo.lastName"
            :variant="'secondary'"
            :label="true"
            :outline="true"
            required />
        </div>   
        <div class="flex gap-5">
          <Input
            type="text"
            name="gender"
            id="gender"
            placeholder="Sexo"
            v-model="user.personalInfo.gender"
            :variant="'secondary'"
            :outline="true"
            :label="true"
            required />
          <Input
            type="text"
            name="birthDate"
            id="birthDate"
            placeholder="Fecha de nacimiento"
            v-model="user.personalInfo.birthDate"
            :variant="'secondary'"
            :label="true"
            :outline="true"
            required />
        </div>
        <legend class="text-deep-blue-900 font-semibold text-xl">Documento nacional de identidad</legend>
        <Input
          type="tel"
          name="dni"
          id="dni"
          placeholder="Número de documento"
          :variant="'secondary'"
          :label="true"
          :outline="true"
          required />
        <div class="flex flex-col gap-5">
          <legend class="text-deep-blue-900 font-semibold">Archivos adjuntos</legend>
          <div class="flex gap-3">
            <label for="dni-front" class="cursor-pointer">
              <img v-if="user.documents?.dniFront" :src="user.documents.dniFront" alt="DNI Frontal" class="w-[140px] h-[85px] object-cover rounded-sm">
              <DNIFront v-else/>
            </label>
            <div class="flex flex-col gap-4">
              <label for="dni-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar frente del DNI</label>
              <span class="text-xs text-start">Cara frontal de tu Documento Nacional de Identidad.</span>
            </div>
            <input id="dni-front" type="file" accept="image/*"
            @change="(event) =>  (event, 'dniFront')" class="hidden" />
          </div>
          <div class="flex gap-3">
            <label for="dni-back" class="cursor-pointer">
              <img v-if="user.documents?.dniBack" :src="user.documents.dniBack" alt="DNI Frontal" class="w-[140px] h-[85px] object-cover rounded-sm">
              <DNIBack v-else/>
            </label>
            <div class="flex flex-col gap-4">
              <label for="dni-back" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del DNI</label>
              <span class="text-xs text-start">Cara dorsal de tu Documento Nacional de Identidad.</span>
            </div>
            <input id="dni-back" type="file" accept="image/*"
            @change="(event) => handleFileChange(event, 'dniBack')" class="hidden" />
          </div>
        </div>
      </form>
      <form v-if="currentStep === 1" class="box-white flex flex-col gap-5 h-full w-full md:pr-2 overflow-y-auto">
        <legend class="text-deep-blue-900 font-semibold text-xl">Datos de registro</legend>
        <div class="flex gap-5">
          <Input
            type="text"
            name="numberLicense"
            id="numberLicense"
            placeholder="Número de licencia"
            :variant="'secondary'"
            :outline="true"
            :label="true"
            required />
        </div>   
        <div class="flex gap-5">
          <Input
            type="text"
            name="emitLicense"
            id="emitLicense"
            placeholder="Fecha de emisión"
            :variant="'secondary'"
            :outline="true"
            :label="true"
            required />
          <Input
            type="text"
            name="expirateLicense"
            id="expirateLicense"
            placeholder="Fecha de vencimiento"
            :variant="'secondary'"
            :label="true"
            :outline="true"
            required />
        </div>
        <div class="flex flex-col gap-2">
          <legend class="text-deep-blue-900 font-semibold">Categoría</legend>
          <div class="text-deep-blue-900 font-bold flex gap-2">
            <Checkbox id="category-b" name="category" label="B" labelPosition="right" type="radio" value="category-b"/>
            <Checkbox id="category-b1" name="category" label="B1" labelPosition="right" type="radio" value="category-b1"/>
            <Checkbox id="category-b2" name="category" label="B2" labelPosition="right" type="radio" value="category-b2"/>
          </div>
        </div>
        <div class="flex flex-col gap-5">
          <legend class="text-deep-blue-900 font-semibold">Archivos adjuntos</legend>
          <div class="flex gap-3">
            <label for="driver-front" class="cursor-pointer">
              <img v-if="user.documents?.driverLicenseFront" :src="user.documents.driverLicenseFront" alt="Licencia Frontal" class="w-[140px] h-[85px] object-cover rounded-sm">
              <DNIFront v-else/>
            </label>
            <div class="flex flex-col gap-4">
              <label for="driver-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar frente del registro</label>
              <span class="text-xs text-start">Cara frontal de tu licencia de conducir.</span>
            </div>
            <input id="driver-front" type="file" accept="image/*"
            @change="(event) => handleFileChange(event, 'driverLicenseFront')" class="hidden" />
          </div>
          <div class="flex gap-3">
            <label for="driver-back" class="cursor-pointer">
              <img v-if="user.documents?.driverLicenseBack" :src="user.documents.driverLicenseBack" alt="Licencia Dorsal" class="w-[140px] h-[85px] object-cover rounded-sm">
              <DNIBack v-else/>
            </label>
            <div class="flex flex-col gap-4">
              <label for="driver-back" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del registro</label>
              <span class="text-xs text-start">Cara dorsal de tu licencia de conducir.</span>
            </div>
            <input id="driver-back" type="file" accept="image/*"
            @change="(event) => handleFileChange(event, 'driverLicenseBack')" class="hidden" />
          </div>
        </div>
      </form>
      <ul v-if="currentStep === 2" class="box-white flex flex-col gap-5 h-full w-full md:!pr-2 overflow-y-auto">
        <li 
          v-for="(method, index) in user.paymentMethods || []"
          :key="index" 
          @click="handlePaymentClick(method)"
          class="flex flex-row items-center gap-2 border-2 border-vibrant-light-900 w-full px-4 py-3 rounded-2xl cursor-pointer"
          :class="{ 
            'bg-vibrant-light-600': selectedPayment === method,
            'bg-white': selectedPayment !== method 
          }"
          >
          <PaymentMethod :method="method.walletType" 
        />
          <p class="text-deep-blue-900 font-semibold text-xs">{{ method.cardNumber ? '•••• ' + method.cardNumber.slice(-4) : method.walletId }}</p>
        </li>
      </ul>
      <PreviewDocumentation :payment="selectedPayment" :user="user" :currentStep="currentStep" class="hidden md:flex"/>
    </article>

    <!-- Modal para mobile -->
    <div v-if="showMobileModal && currentStep === 2" class="fixed inset-0 bg-black/50 z-30 md:hidden">
      <div class="flex items-end justify-center h-full p-4" @click.self="handleCloseModal">
        <div class="bg-white rounded-t-2xl w-full max-w-md">
          <div class="p-4">
            <div class="flex justify-between items-center mb-4">
              <Heading :type="3" class="regular">Método de pago</Heading>
              <button @click="handleCloseModal" class="text-gray-500 hover:text-gray-700 text-xl">
                &times;
              </button>
            </div>
            <div 
              v-if="selectedPayment"
              class="w-full aspect-video rounded-2xl flex items-center justify-center p-4 mb-4"
            >
              <PaymentMethod :method="selectedPayment?.walletType"/> 
            </div>
            <ul class="flex flex-col gap-4">
              <li v-if="selectedPayment?.walletId">
                <span class="text-xs font-medium text-background-600">Alias</span>
                <p class="font-semibold">{{ selectedPayment?.walletId || 'No disponible'}}</p>
              </li>
              <li v-if="selectedPayment?.cardNumber">
                <span class="text-xs font-medium text-background-600">Número de tarjeta</span>
                <p class="font-semibold">{{ selectedPayment?.cardNumber || 'No disponible'}}</p>
              </li>
              <li v-if="selectedPayment?.cardholder">
                <span class="text-xs font-medium text-background-600">Titular de tarjeta</span>
                <p class="font-semibold">{{ selectedPayment?.cardholder || 'No disponible'}}</p>
              </li>
              <li v-if="selectedPayment?.expiryDate">
                <span class="text-xs font-medium text-background-600">Fecha de vencimiento</span>
                <p class="font-semibold">{{ selectedPayment?.expiryDate || 'No disponible'}}</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>