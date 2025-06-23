<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRentalStore } from '@/stores/rent.store.js';
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

import MercadoPago from '@/icons/MercadoPago.vue';
import Uala from '@/icons/Uala.vue';
import PayPal from '@/icons/PayPal.vue';
import CreditCard from '@/icons/CreditCard.vue';

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

const store = useRentalStore();
const router = useRouter();

const submitting = ref(false);
const showSuccess = ref(false);


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

function formatPrice(price) {
  return store.formatPrice(price);
}

function getPaymentMethodName(method) {
  return paymentStore.getPaymentMethodName(method);
}

function getPaymentDetails(method) {
  return paymentStore.getPaymentDetails(method);
}

function getPaymentIcon(method) {
  if (!method) return null;
  
  if (method.type === 'credit_card') {
    return CreditCard;
  } else if (method.type === 'paypal') {
    return PayPal;
  } else if (method.walletType === 'uala') {
    return Uala;
  } else if (method.walletType === 'mercadopago') {
    return MercadoPago;
  }
  
  return CreditCard; 
}

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
    addAlert('Debes aceptar los términos y condiciones', 'error');
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

function handleCloseSuccessModal() {
  showSuccess.value = false;
  router.push({ name: 'CarDetails', params: { id: carStore.car.id} });  
}

function handleViewAlert() {
  showSuccess.value = false;
  router.push({ name: 'UserProfile', params: { id: authStore.user.id } }); 
}

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
  

  watch(() => store.currentStep, async (newStep) => {
  console.log("Nuevo Paso:", newStep);
  if (newStep === 3) {
    console.log("Fetch a los métodos de pago..."); 
    await store.fetchPaymentMethods();
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
    
  if (store.currentStep === 3) {
    await store.fetchPaymentMethods();
  }
    
  store.calculatePrice();
});
</script>

<template>
  <div class="relative">
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
        <section v-else-if="store.currentStep === 2" class="text-white">
          <div class="my-8">
            <Heading type="3" class="text-white py-4">
              Pagos
            </Heading>
      
            <div>
              <Heading type="5" class="text-white mb-2">
                Depósito de seguridad
              </Heading>
              <p>
                Antes del inicio de la reserva, se realiza un depósito de seguridad reembolsable. Este monto puede variar según el vehículo, y será devuelto una vez finalizada la reserva, siempre y cuando no se reporten daños o infracciones.
              </p>
            </div>
      
            <div>
              <Heading type="5" class="text-white mb-2 mt-4">
                Cobros adicionales
              </Heading>
              <p>
                Se pueden aplicar cargos extras por combustible, limpieza excesiva, infracciones de tránsito, o cualquier daño ocasionado durante el período de uso.
              </p>
            </div>

            <div>
              <Heading type="5" class="text-white mb-2 mt-4">
                Facturación
              </Heading>
              <p>
                Una vez confirmado la reserva y el pago, vas a recibir una factura electrónica en tu correo registrado.
              </p>
            </div>
          </div>
          
          <div class="my-8">
            <Heading type="3" class="text-white py-4">
              Tiempos de reserva
            </Heading>
      
            <div>
              <Heading type="5" class="text-white mb-2">
                Tiempos estipulados
              </Heading>
              <p>
                Al elegir fecha de retiro y de devolución, el usuario se compromete con el propietario para devolverlo en tiempo y forma.
              </p>
            </div>
      
            <div>
              <Heading type="5" class="text-white mb-2 mt-4">
                Exceso de tiempo
              </Heading>
              <p>
                Al exceder el tiempo elegido, se cobra una tarifa adicional de $10.000 por cada hora.
              </p>
            </div>
          </div>
      
          <div class="my-8">
            <Heading type="3" class="text-white py-4">
              Política de cancelación
            </Heading>
      
            <div>
              <Heading type="5" class="text-white mb-2">
                Cancelación del propietario
              </Heading>
              <p>
                Vas a recibir un reembolso completo si el dueño cancela después de haber aceptado la reserva.
              </p>
            </div>
      
            <div>
              <Heading type="5" class="text-white mb-2 mt-4">
                Cancelación del arrendatario
              </Heading>
              <p>
                Estos son los precios que deberás abonar en caso de que canceles la reserva dependiendo el tiempo de antelación.
              </p>
      
              <article class="grid gap-4 mt-4">
                <div class="flex justify-between items-center">
                  <p>48 hs o más antes del alquiler</p>
                  <p>Sin coste</p> 
                </div>
                <div class="flex justify-between items-center">
                  <p>24-47 hs antes del alquiler</p>
                  <div class="flex justify-between items-center gap-4">
                    <span class="text-gray-300">25%</span>
                    <p>${{ store.formatPrice(store.calculatePercentage(25)) }}</p>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <p>3-23 hs antes del alquiler</p>
                  <div class="flex justify-between items-center gap-4">
                    <span class="text-gray-300">40%</span>
                    <p>${{ store.formatPrice(store.calculatePercentage(40)) }}</p>
                  </div>
                </div>
                <div class="flex justify-between items-center">
                  <p>3-0 hs antes del alquiler</p>
                  <div class="flex justify-between items-center gap-4">
                    <span class="text-gray-300">100%</span>
                    <p>${{ store.formatPrice(store.calculatePercentage(100)) }}</p>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>
        
        <!-- Paso 3: Selección de método de pago -->
        <div v-else-if="store.currentStep === 3" class="rounded-xl space-y-4">
          <div class="flex items-center justify-between">
            <Heading :type="3" class="text-white py-4">Formas de pago</Heading>
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
                    <MercadoPago v-if="method.walletType === 'mercadopago'"/>
                    <Uala v-if="method.walletType === 'uala'"/>
                    <PayPal v-if="method.type === 'paypal'"/>
                    <CreditCard v-if="method.type === 'credit_card'"/>
                  </div>
                  <div>
                    <p class="font-medium text-white">
                      {{
                        method.type === 'credit_card' 
                          ? 'Tarjeta terminada en ' + method.cardNumber.slice(-4) 
                          : method.type === 'paypal' 
                            ? 'PayPal' 
                            : method.walletType === 'uala' 
                              ? 'Ualá' 
                              : method.walletType === 'mercadopago' 
                                ? 'Mercado Pago'
                                  : method.walletType === 'otra' 
                                  ? 'Otra' 
                                    : method.walletType || 'Otro método'
                      }}
                    </p>
                    <p class="text-sm text-gray-300">
                      {{ method.type === 'credit_card' ? method.cardholder : 
                        method.type === 'digital_wallet' ? method.walletId : method.email }}
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
          
          <div v-else-if="!store.loading && paymentStore.paymentMethods.length === 0" class="text-center py-4 text-gray-300">
            <p>No tenés métodos de pago guardados</p>
          </div>
          
          <div 
            v-if="!paymentStore.showNewPaymentForm"
            @click="paymentStore.toggleNewPaymentForm" 
            class="border border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:border-vibrant-light-900 transition-all flex items-center justify-center"
          >
            <div class="flex items-center gap-2 text-vibrant-light-900">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
              </svg>
              <span>Agregar método de pago</span>
            </div>
          </div>
          
          <div v-if="paymentStore.showNewPaymentForm" class="mt-6">
            <Heading :type="4" class="text-white py-4">Nuevo método de pago</Heading>
            
            <div class="flex gap-4 mb-6">
              <div 
                @click="paymentStore.selectedPaymentMethodType = 'credit_card'" 
                class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
                :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': paymentStore.selectedPaymentMethodType === 'credit_card', 'border-gray-600': paymentStore.selectedPaymentMethodType !== 'credit_card'}"
              >
                Tarjeta
              </div>
              <div 
                @click="paymentStore.selectedPaymentMethodType = 'digital_wallet'" 
                class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
                :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': paymentStore.selectedPaymentMethodType === 'digital_wallet', 'border-gray-600': paymentStore.selectedPaymentMethodType !== 'digital_wallet'}"
              >
                Billetera Virtual
              </div>
              <div 
                @click="paymentStore.selectedPaymentMethodType = 'paypal'" 
                class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
                :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': paymentStore.selectedPaymentMethodType === 'paypal', 'border-gray-600': paymentStore.selectedPaymentMethodType !== 'paypal'}"
              >
                PayPal
              </div>
            </div>
            
            <div v-if="paymentStore.selectedPaymentMethodType === 'credit_card'" class="space-y-4">
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
              <div class="flex gap-5">
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
            
            <div v-if="paymentStore.selectedPaymentMethodType === 'digital_wallet'" class="space-y-4">
              <!-- {value: 'otra', label:'Otra'} -->
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
            
            <div v-if="paymentStore.selectedPaymentMethodType === 'paypal'" class="space-y-4">
              <Input 
                type="email"
                placeholder="Email de PayPal"
                v-model="paymentStore.newPaymentMethod.paypal.email"
                :variant="'secondary'"
                :outline="false"
              />
            </div>
            
            <div class="flex gap-4 mt-6">
              <button 
                @click="paymentStore.toggleNewPaymentForm" 
                class="flex-1 py-3 px-4 border border-gray-600 rounded-xl hover:border-gray-400 transition-all text-white hover:cursor-pointer"
              >
                Cancelar
              </button>
              <button 
                @click="paymentStore.saveNewPaymentMethod(userId)" 
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
            Resumen de tu Reserva
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
                <span class="text-gray-400">Impuestos (21%):</span>
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
                  <component :is="getPaymentIcon(paymentMethod)" class="h-6 w-6" />
                </div>
                
                <div>
                  <p class="font-medium">{{ getPaymentMethodName(paymentMethod) }}</p>
                  <p class="text-sm text-gray-400">
                    {{ getPaymentDetails(paymentMethod) }}
                  </p>
                </div>
              </div>
              
              <div v-else class="text-center py-4">
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
            <h3 class="font-bold mb-2 text-yellow-800">Información importante:</h3>
            <ul class="list-disc pl-5 space-y-1 text-yellow-700">
              <li>Presenta tu licencia de conducir vigente al momento del retiro</li>
              <li>Toma fotografías del vehículo antes de usarlo para evitar conflictos. En caso de encontrar daños, informar al dueño del vehículo</li>
              <li>El seguro cubre daños básicos (consulta coberturas completas)</li>
              <li>En caso de ser aceptada la solicitud, comunicate con el dueño para saber donde retirar el vehículo</li>
            </ul>
          </div>
          
          <div class="mb-6">
            <label class="flex items-start gap-2">
              <input 
                type="checkbox" 
                v-model="acceptTerms"
                class="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              >
              <span class="text-sm text-white">
                Acepto los <a href="#" class="text-secondary-300 hover:underline">Términos y Condiciones</a> 
                y la <a href="#" class="text-secondary-300 hover:underline">Política de Privacidad</a>
              </span>
            </label>
          </div>
        </div>
      </div>
      
      <RentalFooter
        :total-amount="store.totalPrice"
        :button-text="store.currentStep === 4 ? 'Confirmar reserva' : 'Continuar'"
        :is-disabled="store.isNextDisabled"
        :is-confirmation="store.currentStep === 4"
        @continue="store.nextStep"
        @confirm="handleSubmit"
      />
    </div>

      <RentalSuccess
        v-if="showSuccess"
        :rental-id="store.car?.id"
        @close-modal="handleCloseSuccessModal"
        @view-profile="handleViewAlert"
      />

  </div>
</template>