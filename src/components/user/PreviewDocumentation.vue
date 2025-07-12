<script setup>
import Heading from '@components/atoms/Heading.vue';
import PaymentMethod from '@components/atoms/PaymentMethod.vue';

const props = defineProps({
  currentStep: {
    type: Number,
    default: 0
  },
  user: {
    type: Object,
    required: true
  },
  payment: {
    type: Object,
    required: false
  }
});

// Color de fondo según walletType
const getColorByWalletType = (walletType) => {
  switch (walletType) {
    case 'mastercard':
      return 'bg-mastercard';
    case 'visa':
      return 'bg-visa';
    case 'uala':
      return 'bg-uala';
    case 'paypal':
      return 'bg-paypal';
    case 'mercadopago':
      return 'bg-mercado-pago';
    case 'lemon':
      return 'bg-lemon';
    case 'modo':
      return 'bg-modo';
    default:
      return 'bg-background-900';
  }
};

</script>

<template>
  <aside class="md:bg-vibrant-light-700 mx-2.5 md:py-8 md:px-5 flex flex-col gap-2 rounded-[40px] max-w-[250px] min-w-[250px] absolute top-0 left-0 h-full z-10 md:static">
    <template v-if="currentStep === 0">
      <Heading :type="3" class="regular">Documento nacional</Heading>
      <img v-if="user.documents.dniFront" :src="user.documents.dniFront" alt="DNI Frontal" class="w-full aspect-video object-cover rounded-sm">
      <div v-else class="bg-background-800 w-full aspect-video rounded-2xl"></div>
      <div class="box-vibrant flex flex-col gap-2 overflow-y-auto">
        <Heading :type="4" class="regular">{{user.personalInfo.firstName}} {{ user.personalInfo.lastName }}</Heading>
        <ul class="flex flex-col gap-2">
          <ul>
            <span class="text-xs font-medium text-background-600">Sexo</span>
            <p class="font-semibold">{{ user.personalInfo.gender }}</p>
          </ul>
          <ul>
            <span class="text-xs font-medium text-background-600">Fecha de nacimiento</span>
            <p class="font-semibold">{{ user.personalInfo.birthDate }}</p>
          </ul>
          <ul>
            <span class="text-xs font-medium text-background-600">Domicilio</span>
            <p class="font-semibold">{{ user.address.street }}, {{ user.address.city }}, {{ user.address.province }}</p>
          </ul>
          <ul>
            <span class="text-xs font-medium text-background-600">Número de documento</span>
            <p class="font-semibold">{{ user.documents.documentNumber || 'No disponible'}}</p>
          </ul>
        </ul>
      </div>
    </template>
    <template v-if="currentStep === 1 ">
      <Heading :type="3" class="regular">Licencia de conducir</Heading>
      <img v-if="user.documents.driverLicenseFront" :src="user.documents.driverLicenseFront" alt="Licencia de conducir frontal" class="w-full aspect-video object-cover rounded-sm">
      <div v-else class="bg-background-800 w-full aspect-video rounded-2xl"></div>
      <div class="box-vibrant flex flex-col gap-2 overflow-y-auto">
        <Heading :type="4" class="regular">{{user.personalInfo.firstName}} {{ user.personalInfo.lastName }}</Heading>
        <ul class="flex flex-col gap-2">
          <ul>
            <span class="text-xs font-medium text-background-600">Número de licencia</span>
            <p class="font-semibold">{{ user.personalInfo.licenseNumber || 'No disponible' }}</p>
          </ul>
          <ul>
            <span class="text-xs font-medium text-background-600">Fecha de emisión</span>
            <p class="font-semibold">{{ user.personalInfo.birthDate || 'No disponible'}}</p>
          </ul>
          <ul>
            <span class="text-xs font-medium text-background-600">Fecha de vencimiento</span>
            <p class="font-semibold">{{ user.personalInfo.birthDate || 'No disponible'}}</p>
          </ul>
          <ul>
            <span class="text-xs font-medium text-background-600">Número de documento</span>
            <p class="font-semibold">{{ user.documents.dni || 'No disponible'}}</p>
          </ul>
        </ul>
      </div>
    </template>
    <template v-if="currentStep === 2">
        <Heading :type="3" class="regular">Método de pago</Heading>
        <div 
          v-if="payment"
          class="w-full aspect-video rounded-2xl flex items-center justify-center p-4"
          :class="getColorByWalletType(payment.walletType)" 
        >
          <PaymentMethod :method="payment?.walletType"/> 
  
        </div>
        <ul class="box-vibrant flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          <ul v-if="payment.walletId">
            <span class="text-xs font-medium text-background-600">Alias</span>
            <p class="font-semibold">{{ payment?.walletId || 'No disponible'}}</p>
          </ul>
          <ul v-if="payment.cardNumber">
            <span class="text-xs font-medium text-background-600">Número de documento</span>
            <p class="font-semibold">{{ payment?.cardNumber || 'No disponible'}}</p>
          </ul>
          <ul v-if="payment.cardholder">
            <span class="text-xs font-medium text-background-600">Titular de tarjeta</span>
            <p class="font-semibold">{{ payment?.cardholder || 'No disponible'}}</p>
          </ul>
          <ul v-if="payment.expiryDate">
            <span class="text-xs font-medium text-background-600">Fecha de vencimiento (MM/AA)</span>
            <p class="font-semibold">{{ payment?.expiryDate || 'No disponible'}}</p>
          </ul>
        </ul>
    </template>
  </aside>
</template>