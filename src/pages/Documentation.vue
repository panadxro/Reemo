<script setup>
import { ref, inject, computed, onMounted } from 'vue';
import { useUserStore } from '@stores';
import { usePaymentStore } from '@stores/payment.store.js';

import Input from '@components/molecules/Input.vue';
import Heading from '../components/atoms/Heading.vue';
import BackButton from '../components/atoms/BackButton.vue';
import DNIBack from '../components/atoms/DNIBack.vue';
import DNIFront from '../components/atoms/DNIFront.vue';
import Checkbox from '../components/atoms/Checkbox.vue';
import MercadoPago from '../icons/MercadoPago.vue';
import PreviewDocumentation from '../components/user/PreviewDocumentation.vue';
import PaymentMethod from '../components/atoms/PaymentMethod.vue';
import Modal from '../components/molecules/Modal.vue';
import Trash from '../icons/Trash.vue';

const currentStep = ref(0);

const userStore = useUserStore();
const paymentStore = usePaymentStore();
const authSession = inject('authSession');

const user = computed(() => ({
  ...userStore.user,
  documents: userStore.user?.documents || {},
  personalInfo: userStore.user?.personalInfo || {}
}));

const selectedPayment = ref(null);

const handlePaymentClick = (method) => {
  selectedPayment.value = method;
}

function updatePaymentType(selectedBrand) {
  const brandTypeMap = {
    'Visa': 'bank',
    'Mastercard': 'bank',
    'Uala': 'digital_wallet',
    'PayPal': 'digital_wallet',
    'Mercado Pago': 'digital_wallet',
    'Lemon': 'digital_wallet',
    'Modo': 'digital_wallet'
  };
  paymentStore.newPaymentMethod.type = brandTypeMap[selectedBrand] || 'bank';
}

async function handleDeletePayment(index) {
  await paymentStore.removePaymentMethod(authSession.user.id, index);
  // Si el método eliminado era el seleccionado, limpiar selección
  if (selectedPayment.value === paymentStore.paymentMethods[index]) {
    selectedPayment.value = null;
  }
}

onMounted(async () => {
  try {
    await userStore.loadUserProfile(authSession.user.id);
    // Cargar métodos de pago cuando se monta el componente
    await paymentStore.fetchPaymentMethods(authSession.user.id);
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
      <!-- Identificación Form (sin cambios) -->
      <form v-if="currentStep === 0" class="box-white flex flex-col gap-5 h-full w-full md:pr-2 overflow-y-auto">
        <legend class="text-deep-blue-900 font-semibold text-xl">Información personal</legend>
        <div class="flex gap-5">
          <Input
            type="text"
            name="firstname"
            id="firstname"
            placeholder="Nombre"
            v-model="user.personalInfo.firstName"
            :disabled="user.personalInfo.firstName ? true : false"
            :variant="'secondary'"
            :outline="true"
            :label="true"
            required />
          <Input
            type="text"
            name="lastname"
            id="lastname"
            placeholder="Apellido"
            v-model="user.personalInfo.lastName"
            :disabled="user.personalInfo.lastName ? true : false"
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
            :disabled="user.personalInfo.gender ? true : false"
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
            :disabled="user.personalInfo.birthDate ? true : false"
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

      <!-- Licencia Form (sin cambios) -->
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

      <div v-if="currentStep === 2" class="box-white flex flex-col gap-5 h-full w-full md:!pr-2 overflow-y-auto">
        <div class="flex justify-between items-center">
          <legend class="text-deep-blue-900 font-semibold text-xl">Métodos de pago</legend>
        </div>

        <!-- v-if="!paymentStore.showNewPaymentForm" -->
        <ul  class="flex flex-col gap-3">
          <li 
            v-for="(method, index) in paymentStore.paymentMethods"
            :key="index" 
            @click="handlePaymentClick(method)"
            class="flex flex-row items-center justify-between gap-2 border-2 border-vibrant-light-900 w-full px-4 py-3 rounded-2xl cursor-pointer"
            :class="{ 
              'bg-vibrant-light-600': selectedPayment === method,
              'bg-white': selectedPayment !== method 
            }"
          >
            <div class="flex items-center gap-2">
              <PaymentMethod :method="method.brand" />
              <p class="text-deep-blue-900 font-semibold text-xs">
                {{ method.cardNumber ? '•••• •••• •••• ' + method.cardNumber.slice(-4) : method.walletId }}
              </p>
            </div>
            <!-- <button 
              @click.stop="paymentStore.confirmDeletePaymentMethod(index)"
              class="text-red-500 hover:text-red-700 font-semibold text-sm"
            >
              Eliminar
            </button> "-->
            <Trash @click.stop="paymentStore.confirmDeletePaymentMethod(index)"/>
          </li>
          <li v-if="paymentStore.paymentMethods.length === 0" class="text-center py-8 text-gray-500">
            No tienes métodos de pago registrados
          </li>
        </ul>

        <div v-if="paymentStore.showNewPaymentForm" class="flex flex-col gap-4">
          <Heading :type="4" class="regular text-deep-blue-900">Nuevo método de pago</Heading>
          
          <div class="flex flex-col gap-4">
            <Input 
              type="select"
              placeholder="Selecciona una marca"
              :options="[
                {value: 'Visa', label: 'Visa', type: 'bank'},
                {value: 'Mastercard', label: 'Mastercard', type: 'bank'},
                {value: 'Uala', label: 'Ualá', type: 'digital_wallet'},
                {value: 'PayPal', label: 'PayPal', type: 'digital_wallet'},
                {value: 'Mercado Pago', label: 'Mercado Pago', type: 'digital_wallet'},
                {value: 'Lemon', label: 'Lemon', type: 'digital_wallet'},
                {value: 'Modo', label: 'Modo', type: 'digital_wallet'}
              ]"
              v-model="paymentStore.newPaymentMethod.brand"
              @update:modelValue="updatePaymentType"
              variant="secondary"
              :outline="true"
            />

            <Input 
              type="text"
              placeholder="Número de tarjeta (16 dígitos)"
              v-model="paymentStore.newPaymentMethod.cardNumber"
              variant="secondary"
              :outline="true"
            />
            
            <Input 
              type="text"
              placeholder="Titular de tarjeta"
              v-model="paymentStore.newPaymentMethod.cardHolder"
              variant="secondary"
              :outline="true"
            />
            
            <div class="flex gap-5">
              <Input 
                type="month"
                placeholder="MM/AA"
                v-model="paymentStore.newPaymentMethod.expiryDate"
                variant="secondary"
                :outline="true"
              />
              <Input
                type="password"
                placeholder="CVV"
                v-model="paymentStore.newPaymentMethod.cvv"
                variant="secondary"
                :outline="true"
              />
            </div>
          </div>
          
          <div class="flex gap-4 mt-6">
            <button 
              @click="paymentStore.toggleNewPaymentForm" 
              class="flex-1 py-3 px-4 border border-gray-600 rounded-xl hover:border-gray-400 transition-all text-deep-blue-900 hover:cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              @click="paymentStore.saveNewPaymentMethod(authSession.user.id)" 
              :disabled="!paymentStore.isFormValid || paymentStore.loading"
              class="flex-1 py-3 px-4 bg-vibrant-light-900 text-deep-blue-900 rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
            >
              {{ paymentStore.loading ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
        <Input
            v-if="!paymentStore.showNewPaymentForm"
            type="button"
            text="Agregar método"
            variant="secondary"
            :outline="true"
            @click="paymentStore.toggleNewPaymentForm" 
            class="cursor-pointer "
          />
      </div>
      

      <PreviewDocumentation :payment="selectedPayment" :user="user" :currentStep="currentStep" class="hidden md:flex"/>
    </article>

    <Modal 
      :isOpen="paymentStore.showDeleteModal" 
      title="Confirmar eliminación"
      :message="`¿Estás seguro de que quieres eliminar este método de pago? ${selectedPayment ? selectedPayment.brand : ''}`"
      confirmText="Eliminar"
      cancelText="Cancelar"
      @close="paymentStore.cancelDeletePaymentMethod"
      @confirm="() => handleDeletePayment(paymentStore.paymentToDeleteIndex)"
    />
  </section>
</template>