<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRentStore } from '@/stores/rent.store.js';
import { useRouter } from 'vue-router';
import { addAlert } from '@/services/alerts';
import { useAuthStore } from '@stores/auth.store';
import { useCarStore } from '@stores/car.store.js';
import { usePaymentStore } from '@stores/payment.store.js';

import RentalHeader from '@/components/organisms/rental/RentalHeader.vue';
import DateTime from '@/components/organisms/rental/DateTime.vue';
import PriceCalculator from '@/components/organisms/rental/PriceCalculator.vue';
import RentalFooter from '@/components/organisms/rental/RentalFooter.vue';
import Heading from '@/components/atoms/Heading.vue';
import Loading from '@/icons/Loading.vue';
import Input from '@/components/molecules/Input.vue';
import RentalSuccess from '@/components/organisms/rental/RentalSuccess.vue';
import Modal from '@/components/molecules/Modal.vue';
import Checkbox from '@/components/atoms/Checkbox.vue';

import PaymentMethod from '@/components/atoms/PaymentMethod.vue';

const authStore = useAuthStore();
const carStore = useCarStore();
const paymentStore = usePaymentStore();

const props = defineProps({
  // carId: {
  //   type: [String, Number],
  //   required: true
  // },
  userId: {
    // type: [String, Number],
    required: true
  },
  isCarRented: {
    type: Boolean,
    default: false
  }
});

const store = useRentStore();
const router = useRouter();

const submitting = ref(false);
const showSuccess = ref(false);
const showTermsModal = ref(false);

const isVerified = computed(() => authStore.userStatus === 'verified');

const isAvailable = computed(() => carStore.status.current === 'available');

const dateTimeValues = computed(() => ({
  rentedFromDate: store.rentalData.rentedFromDate,
  rentedFromHour: store.rentalData.selectedTime,
  rentedUntilDate: store.rentalData.rentedUntilDate,
  rentedUntilHour: store.rentalData.selectedUntilTime
}));

const paymentMethod = computed(() => store.rentalData.selectedPaymentMethod);
const acceptTerms = computed({
  get: () => store.acceptTerms,
  set: (value) => store.acceptTerms = value
});

function openTermsModal() {
  showTermsModal.value = true;
}

function handleAcceptTerms() {
  if(store.acceptTerms === false){
    showTermsModal.value = false;
    store.acceptTerms = true;
  } else if(store.acceptTerms === true) {
    showTermsModal.value = false;
  }
}

function formatPrice(price) {
  return store.formatPrice(price);
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

// function getPaymentMethodName(method) {
//   return paymentStore.getPaymentMethodName(method);
// }

// function getPaymentDetails(method) {
//   return paymentStore.getPaymentDetails(method);
// }

// function getPaymentIcon(method) {
//   if (!method) return null;
  
//   if (method.type === 'credit_card') {
//     return CreditCard;
//   } else if (method.type === 'paypal') {
//     return PayPal;
//   } else if (method.brand === 'uala') {
//     return Uala;
//   } else if (method.brand === 'mercadopago') {
//     return MercadoPago;
//   }
  
//   return CreditCard; 
// }

function totalUpdated(total) {
  store.rentalData.currentTotalPrice = total;
  store.calculatePrice();
}

async function handleSubmit() {
  if (!store.rentalData.selectedPaymentMethod) {
    addAlert('Por favor selecciona un método de pago antes de confirmar la reserva.', 'error');
    return;
  }
  if (!store.acceptTerms) {
    addAlert('Debés aceptar los términos y condiciones', 'error');
    return;
  }

  submitting.value = true;
  try {
    const success = await store.submitRental();
    if (success) {
      // router.push({ name: 'Rental-Success', params: { id: store.car.id } });
      showSuccess.value = true;
      store.clearAllRentalData();
    }
  } catch (error) {
    console.error('Error al procesar la reserva:', error);
    addAlert('Ha ocurrido un error al procesar tu reserva. Por favor, intenta nuevamente.', 'error');
  } finally {
    submitting.value = false;
  }
}

function handleViewProfileOwner() {
  showSuccess.value = false;
  router.push({ name: 'UserProfile', params: { id: store.car?.ownerId } });
}

function handleViewAlert() {
  showSuccess.value = false;
  router.push({ name: 'Dashboard', params: { id: authStore.user.id } }); 
}

function handleCarNotAvailable() {
  addAlert('El auto no está disponible para reservar en este momento.', 'error');
  // Opcional: redirigir a la página de búsqueda o listado de autos
  // router.push({ name: 'Cars' });
}

watch(() => store.currentStep, async (newStep) => {
  console.log("Nuevo Paso:", newStep);
  if (newStep === 3) {
    console.log("Fetch a los métodos de pago..."); 
    await paymentStore.fetchPaymentMethods(authStore.user?.id);
    console.log("Métodos de pago:", paymentStore.paymentMethods);
    
    if (store.rentalData.selectedPaymentMethod && 
        !paymentStore.paymentMethods.some(m => 
          paymentStore.getPaymentMethodIdentifier(m) === 
          paymentStore.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod)
        )) {
      store.rentalData.selectedPaymentMethod = paymentStore.paymentMethods[0] || null;
    }
  }
});

  watch(() => store.rentalData.selectedPaymentMethod, (newMethod) => {
    if (newMethod && paymentStore.showNewPaymentForm) {
      paymentStore.showNewPaymentForm = false;
    }
  }, { immediate: true });

  watch(
    () => [
      store.rentalData.rentedFromDate,
      store.rentalData.selectedTime,
      store.rentalData.rentedUntilDate,
      store.rentalData.selectedUntilTime
    ],
    () => {
      store.calculatePrice();
    },
    { deep: true }
  );

onMounted(async () => {    
  if (!carStore.car) {
    console.error('carStore.car es null');
    return;
  }
  
  if (!authStore.user?.id) {
    console.error('authStore.user.id es null', authStore.user?.id);
    return;
  }
  store.setInitialData(carStore.car, authStore.user.id, carStore.isCarRented);
  console.log("authstore.user.id:", authStore.user.id);
    
  if (store.currentStep === 3) {
    await paymentStore.fetchPaymentMethods(authStore.user?.id);
  }
    
  store.calculatePrice();
});
</script>

<template>
  <div class="relative overflow-y-auto lg:pr-6 box-deep">
    <div class="space-y-6">
      <!-- Header con paso actual -->
      <RentalHeader 
        :current-step="store.currentStep"
        :sections="store.sections"
        :prev-step="store.prevStep"
      />
      
      <!-- Componente de fechas (siempre visible, pero deshabilitado en pasos 2-4) -->
      <DateTime 
        @update-dates="store.handleDateUpdate" 
        :disabled="store.currentStep > 1 || store.rented"
        :initial-values="dateTimeValues"
      />
      
      <!-- Contenido dinámico según el paso actual -->
      <div class="rental-step-content">
        <!-- Paso 1: Calculadora de precio -->
        <template v-if="store.currentStep === 1">
          <PriceCalculator
            :start-date="store.rentalData.rentedFromDate"
            :start-time="store.rentalData.selectedTime"
            :end-date="store.rentalData.rentedUntilDate"
            :end-time="store.rentalData.selectedUntilTime"
            :daily-price="store.car ? store.car.pricing.rates.daily : 0"
            @total-updated="totalUpdated"
          />
        </template>
        
        <!-- Paso 2: Términos y condiciones -->
        <section v-else-if="store.currentStep === 2" class="text-white flex flex-col gap-6">
          <article class="flex flex-col gap-4">
            <Heading type="4" class="regular text-white">Pagos</Heading>
            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Depósito de seguridad</Heading>
              <p class="text-gray-400">Antes del inicio de la reserva, se realiza un depósito de seguridad reembolsable. Este monto puede variar según el vehículo, y será devuelto una vez finalizada la reserva, siempre y cuando no se reporten daños o infracciones.</p>
            </div>
      
            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Cobros adicionales</Heading>
              <p class="text-gray-400">Se pueden aplicar cargos extras por combustible, limpieza excesiva, infracciones de tránsito, o cualquier daño ocasionado durante el período de uso.</p>
            </div>

            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Facturación</Heading>
              <p class="text-gray-400">Una vez confirmado la reserva y el pago, vas a recibir una factura electrónica en tu correo registrado.</p>
            </div>
          </article>
          
          <article class="flex flex-col gap-4">
            <Heading type="4" class="regular text-white">Tiempos de reserva</Heading>
      
            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Tiempos estipulados</Heading>
              <p class="text-gray-400">Al elegir fecha de retiro y de devolución, el usuario se compromete con el propietario para devolverlo en tiempo y forma.</p>
            </div>
      
            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Exceso de tiempo</Heading>
              <p class="text-gray-400">Al exceder el tiempo elegido, se cobra una tarifa adicional de $10.000 por cada hora.</p>
            </div>
          </article>
      
          <article class="flex flex-col gap-4">
            <Heading type="4" class="regular text-white">Política de cancelación</Heading>
      
            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Cancelación del propietario</Heading>
              <p class="text-gray-400">Vas a recibir un reembolso completo si el dueño cancela después de haber aceptado la reserva.</p>
            </div>
      
            <div class="flex flex-col gap-2">
              <Heading type="5" class="small text-white">Cancelación del arrendatario</Heading>
              <p class="text-gray-400">Estos son los precios que deberás abonar en caso de que canceles la reserva dependiendo el tiempo de antelación.</p>
      
              <ul class="grid gap-4">
                <li class="flex justify-between items-center">
                  <p class="text-gray-400">48 hs o más antes del alquiler</p>
                  <p class="text-gray-400">Sin coste</p> 
                </li>
                <li class="flex justify-between items-center">
                  <p class="text-gray-400">24-47 hs antes del alquiler</p>
                  <p class="text-gray-400"><span class="text-gray-300 mr-4">25%</span>${{ store.formatPrice(store.calculatePercentage(25)) }}</p>
                </li>
                <li class="flex justify-between items-center">
                  <p class="text-gray-400">3-23 hs antes del alquiler</p>
                  <p class="text-gray-400"><span class="text-gray-300 mr-4">40%</span>${{ store.formatPrice(store.calculatePercentage(40)) }}</p>
                </li>
                <li class="flex justify-between items-center">
                  <p class="text-gray-400">3-0 hs antes del alquiler</p>
                  <p class="text-gray-400"><span class="text-gray-300 mr-4">100%</span>${{ store.formatPrice(store.calculatePercentage(100)) }}</p>
                </li>
              </ul>
            </div>
          </article>
        </section>
        
        <!-- Paso 3: Selección de método de pago -->
        <div v-else-if="store.currentStep === 3" class="rounded-xl space-y-4">
          <div class="flex items-center justify-between">
            <Heading type="4" class="regular text-white">Formas de pago</Heading>
            <div v-if="store.loading" class="flex items-center">
              <Loading role="status" class="h-6 w-6" />
            </div>
          </div>
          
          <div v-if="!store.loading && paymentStore.paymentMethods.length > 0" class="space-y-3">
            <div 
              v-for="(method, index) in paymentStore.paymentMethods" 
              :key="index"
              @click="store.selectPaymentMethod(method)"
              class="border rounded-xl p-4 cursor-pointer transition-all"
              :class="{
                'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': paymentStore.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) === paymentStore.getPaymentMethodIdentifier(method), 
                'border-gray-600 hover:border-vibrant-light-900': paymentStore.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) !== paymentStore.getPaymentMethodIdentifier(method)
              }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 flex items-center justify-center p-1 rounded-xl bg-white">
                    <PaymentMethod :method="method.brand" class="h-6 w-6" />
                  </div>
                  <div>
                    <p class="font-medium text-white">
                      {{ method.brand }}
                    </p>
                    <p v-if="method.cardNumber" class="text-sm text-gray-400">
                      •••• •••• •••• {{ String(method.cardNumber).slice(-4) }}
                    </p>
                  </div>
                </div>
                <div 
                  class="w-6 h-6 rounded-full border flex items-center justify-center"
                  :class="{
                    'bg-vibrant-light-900 border-vibrant-light-900': paymentStore.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) === paymentStore.getPaymentMethodIdentifier(method), 
                    'border-gray-300': paymentStore.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) !== paymentStore.getPaymentMethodIdentifier(method)
                  }"
                >
                  <svg v-if="paymentStore.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) === paymentStore.getPaymentMethodIdentifier(method)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          
          <div v-else-if="!store.loading && paymentStore.paymentMethods.length === 0" class="text-center text-gray-300">
            <p class="text-gray-400">No tenés métodos de pago guardados</p>
          </div>
          
          <!-- <div 
            v-if="!paymentStore.showNewPaymentForm"
            @click="paymentStore.toggleNewPaymentForm" 
            class="border border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:border-vibrant-light-900 transition-all flex items-center justify-center">
            <div class="flex items-center gap-2 text-vibrant-light-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>Agregar método de pago</span>
            </div>
          </div> -->
          <Input
            v-if="!paymentStore.showNewPaymentForm"
            type="button"
            text="Agregar método de pago"
            variant="tertiary"
            :outline="false"
            @click="paymentStore.toggleNewPaymentForm" 
            class="cursor-pointer w-full"
          />
          
          <div v-if="paymentStore.showNewPaymentForm" class="mt-6 flex flex-col gap-4">
            <Heading :type="4" class="regular text-white ">Nuevo método de pago</Heading>
            
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
                :outline="false"
              />

              <Input 
              type="text"
              placeholder="Número de tarjeta (16 dígitos)"
              v-model="paymentStore.newPaymentMethod.cardNumber"
              variant="secondary"
              :outline="false"
              />
              
              <Input 
                type="text"
                placeholder="Titular de tarjeta"
                v-model="paymentStore.newPaymentMethod.cardHolder"
                variant="secondary"
                :outline="false"
              />
              
              <div class="flex gap-5">
                <Input 
                  type="month"
                  placeholder="MM/AA"
                  v-model="paymentStore.newPaymentMethod.expiryDate"
                  variant="secondary"
                  :outline="false"
                />
                <Input
                  type="password"
                  placeholder="CVV"
                  v-model="paymentStore.newPaymentMethod.cvv"
                  variant="secondary"
                  :outline="false"
                />
              </div>
            </div>
            
            <div class="flex gap-4 mt-6">
              <button 
                @click="paymentStore.toggleNewPaymentForm" 
                class="flex-1 py-3 px-4 border border-gray-600 rounded-xl hover:border-gray-400 transition-all text-white hover:cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                @click="paymentStore.saveNewPaymentMethod(authStore.user.id)" 
                :disabled="!paymentStore.isFormValid || store.loading"
                class="flex-1 py-3 px-4 bg-vibrant-light-900 text-deep-blue-900 rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
              >
                {{ store.loading ? 'Guardando...' : 'Guardar' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- Paso 4: Confirmación -->
        <div v-else-if="store.currentStep === 4" class="text-white">
          <h2 class="text-2xl font-bold mb-6">
            Resumen de tu reserva
          </h2>
          
          <div class="space-y-4 pb-6 my-6">
            <h3 class="font-semibold pb-2">
              Detalle de alquiler
            </h3>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-400">Retiro</p>
                <p class="font-medium">{{ store.formatDate(store.rentalData.rentedFromDate) }} a las
                  {{ store.rentalData.selectedTime }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-400">Devolución</p>
                <p class="font-medium">{{ store.formatDate(store.rentalData.rentedUntilDate) }}
                 a las {{ store.rentalData.selectedUntilTime }}</p>
              </div>
            </div>
            
            <div class="bg-primary-800 p-3 rounded-lg">
              <div class="flex justify-between items-center">
                <span class="font-medium">Duración total</span>
                <span class="font-semibold">{{ store.formatRentalTime(store.rentalHours) }}</span>
              </div>
            </div>
          </div>

          <div class="space-y-3 pb-6 mb-6">
            <h3 class="font-semibold pb-2">Detalle de pago</h3>
            
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-400">Subtotal:</span>
                <span>$ {{ formatPrice(store.basePrice) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Comisión (15%):</span>
                <span>$ {{ formatPrice(store.taxes) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-400">Seguro:</span>
                <span>$ {{ formatPrice(store.insurance) }}</span>
              </div>
              <div class="flex justify-between pt-2 border-t border-gray-200 text-secondary-300">
                <span class="font-semibold">Total:</span>
                <span class="font-bold">$ {{ formatPrice(store.totalPrice) }}</span>
              </div>
            </div>
          </div>
          
          <div class="mb-6">
            <h3 class="font-semibold pb-2">
              Método de pago
            </h3>
            
            <div 
              class="border rounded-lg p-4 transition-all"
              :class="{
                'border-secondary-300 bg-primary-800': paymentMethod,
                'border-red-300': !paymentMethod
              }"
            >
              <div v-if="paymentMethod" class="flex items-center gap-3">
                <div class="rounded-xl bg-white p-2 shadow-sm">
                  <PaymentMethod :method="paymentMethod.brand" class="h-6 w-6" />
                </div>
                
                <div>
                  <p class="font-medium">{{ paymentMethod.brand }}</p>
                  <p class="text-sm text-gray-400">
                    <!-- {{ getPaymentDetails(paymentMethod) }} -->
                      •••• •••• •••• {{ paymentMethod.cardNumber.slice(-4) }}
                  </p>
                </div>
              </div>
              
              <div v-else class="text-center">
                <p class="text-gray-500">No se ha seleccionado método de pago</p>
                <button 
                  @click="store.goToStep(3)"
                  class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium cursor-pointer"
                >
                  Seleccionar método de pago
                </button>
              </div>
            </div>
          </div>
          
          <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-sm">
            <h3 class="font-bold text-yellow-800">Información importante:</h3>
            <ul class="list-disc pl-5 space-y-1 text-yellow-700">
              <li>Presenta tu licencia de conducir vigente al momento del retiro</li>
              <li>Toma fotografías del vehículo antes de usarlo para evitar conflictos. En caso de encontrar daños, informar al dueño del vehículo</li>
              <li>El seguro cubre daños básicos (consulta coberturas completas)</li>
              <li>En caso de ser aceptada la solicitud, comunicate con el dueño para saber donde retirar el vehículo</li>
            </ul>
          </div>
          
          <div class="flex items-start gap-2">
            <Checkbox v-model="acceptTerms"/>
            <span class="text-md text-white"> 
              Acepto los <span @click="openTermsModal" class="text-secondary-300 hover:underline cursor-pointer">Términos y Condiciones</span> 
            </span>
          </div>
            <Modal
              class="text-deep-blue-900"
                :isOpen="showTermsModal"
                title="Términos y Condiciones"
                :message="`
                  <div class='terms-container'>
  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>1. Aceptación de Términos</h5>
    <p class='text-sm'>Al utilizar esta aplicación, usted acepta cumplir con estos Términos y Condiciones, así como con nuestra política de privacidad. Si no está de acuerdo, absténgase de usar el servicio.</p>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>2. Requisitos para Renta</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Debe ser mayor de 21 años y contar con licencia de conducir vigente.</li>
      <li>Se requiere tarjeta de crédito válida para garantizar el pago y posibles daños.</li>
    </ul>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>3. Reservas y Pagos</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Los precios incluyen impuestos aplicables, salvo indicación contraria.</li>
      <li>El pago se realizará al confirmar la reserva. Cancelaciones con menos de 24 horas pueden incurrir en cargos.</li>
    </ul>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>4. Uso del Vehículo</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Prohibido uso ilegal, subarrendamiento o conducción bajo influencia de alcohol/drogas.</li>
      <li>El usuario es responsable de multas, daños o pérdidas durante el periodo de renta.</li>
    </ul>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>5. Seguro</h5>
    <p class='text-sm'>Incluye cobertura básica según la ley local. Opciones adicionales pueden estar disponibles.</p>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>6. Devolución</h5>
    <p class='text-sm'>El vehículo debe devolverse en la fecha/hora acordada. Retrasos generarán cargos adicionales.</p>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>7. Limitación de Responsabilidad</h5>
    <p class='text-sm'>La aplicación no se hace responsable por daños indirectos, pérdidas o accidentes derivados del uso del vehículo.</p>
  </div>

  <div class='term-section'>
    <h5 class='font-semibold mb-2'>8. Modificaciones</h5>
    <p class='text-sm'>Nos reservamos el derecho de actualizar estos términos. Los cambios serán notificados dentro de la app.</p>
  </div>

  <p class='text-xs mt-6 text-gray-500'>Fecha de última actualización: 27/07/25</p>
</div>
                `"
                confirmText="Aceptar"
                cancelText="Cerrar"
                @close="showTermsModal = false"
                @confirm="handleAcceptTerms"
              />
        </div>
      </div>
      
      <RentalFooter
        :total-amount="store.totalPrice"
        :button-text="store.currentStep === 4 ? 'Confirmar reserva' : 'Continuar'"
        :is-disabled="store.isNextDisabled"
        :is-confirmation="store.currentStep === 4"
        :is-verified="isVerified"
        :is-available="isAvailable"
        :show-verification-warning="true"
        @continue="store.nextStep"
        @confirm="handleSubmit"
        @car-not-available="handleCarNotAvailable"
      />
    </div>

      <!-- <RentalSuccess
        v-if="showSuccess"
        :rental-id="store.car?.id"
        @close-modal="handleViewProfileOwner"
        @view-profile="handleViewAlert"
      /> -->

     <Modal
      :is-open="showSuccess"
      title="¡Solicitud Enviada!"
      message="Tu solicitud de alquiler ha sido enviada correctamente. El propietario será notificado y se pondrá en contacto contigo pronto."
      :image="carStore.car?.photos?.[0]"
      primary-button-text="Ver mis alquileres"
      secondary-button-text="Ver perfil del dueño"
      @primary-action="handleViewAlert"
      @secondary-action="handleViewProfileOwner"
    />

  </div>
</template>