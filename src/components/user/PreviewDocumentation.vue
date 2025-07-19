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
    required: false,
    default: null
  }
});

// Color de fondo según brand
const getColorByWalletType = (brand) => {
  if (!brand) return 'bg-background-900'; // Fallback si no hay brand

  switch (brand) {
    case 'Mastercard':
      return 'bg-mastercard';
    case 'Visa':
      return 'bg-visa';
    case 'Uala':
      return 'bg-uala';
    case 'PayPal':
      return 'bg-paypal';
    case 'Mercado Pago':
      return 'bg-mercado-pago';
    case 'Lemon':
      return 'bg-lemon';
    case 'Modo':
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
          :class="getColorByWalletType(payment?.brand)" 
        >
          <PaymentMethod :method="payment?.brand"/> 
        </div>

        <div v-else class="w-full aspect-video rounded-2xl bg-background-900 flex items-center justify-center">
          <p class="text-background-600">Selecciona un método</p>
        </div>

        <ul v-if="payment" class="box-vibrant flex flex-col gap-2 overflow-y-auto overflow-x-hidden">
          <li v-if="payment.brand">
            <span class="text-xs font-medium text-background-600">Tarjeta</span>
            <p class="font-semibold">{{ payment.brand || 'No disponible'}}</p>
          </li>
          <li v-if="payment.cardNumber">
            <span class="text-xs font-medium text-background-600">Número de tarjeta</span>
            <p class="font-semibold">•••• •••• •••• {{ payment.cardNumber.slice(-4) || 'No disponible'}}</p>
          </li>
          <li v-if="payment.cardHolder">
            <span class="text-xs font-medium text-background-600">Titliar de tarjeta</span>
            <p class="font-semibold">{{ payment.cardHolder || 'No disponible'}}</p>
          </li>
          <li v-if="payment.expiryDate">
            <span class="text-xs font-medium text-background-600">Fecha de vencimiento (AAAA/MM)</span>
            <p class="font-semibold">{{ payment.expiryDate || 'No disponible'}}</p>
          </li>
        </ul>
    </template>
  </aside>
</template>