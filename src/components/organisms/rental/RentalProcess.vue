 
  <script setup>
  import { ref, computed, onMounted, watch } from 'vue';
  import { useRentalStore } from '@/stores/rent.store.js';
  import { useRouter } from 'vue-router';
  import { addAlert } from '@/services/alerts';
  
  // Componentes
  import RentalHeader from '@/components/organisms/rental/RentalHeader.vue';
  import DateTime from '@/components/organisms/rental/DateTime.vue';
  import PriceCalculator from '@/components/organisms/rental/PriceCalculator.vue';
  import RentalFooter from '@/components/organisms/rental/RentalFooter.vue';
  import Heading from '@/components/atoms/Heading.vue';
  import Loading from '@/icons/Loading.vue';
  import Input from '@/components/molecules/Input.vue';
  
  // Iconos
  import MercadoPago from '@/icons/MercadoPago.vue';
  import Uala from '@/icons/Uala.vue';
  import PayPal from '@/icons/PayPal.vue';
  import CreditCard from '@/icons/CreditCard.vue';
  
  // Props
  const props = defineProps({
    carId: {
      type: [String, Number],
      required: true
    },
    userId: {
      type: [String, Number],
      required: true
    },
    isCarRented: {
      type: Boolean,
      default: false
    }
  });
  
  // Store y router
  const store = useRentalStore();
  const router = useRouter();
  
  // Estado local
  const submitting = ref(false);
  
  // Computed properties
  const dateTimeValues = computed(() => ({
    rentedFromDate: store.rentalData.rentedFromDate,
    rentedFromHour: store.rentalData.selectedTime,
    rentedUntilDate: store.rentalData.rentedUntilDate,
    rentedUntilHour: store.rentalData.selectedUntilTime
  }));
  
  // Métodos
  function totalUpdated(total) {
    store.rentalData.currentTotalPrice = total;
  }
  
  async function handleSubmit() {
  if (!store.rentalData.selectedPaymentMethod) {
    addAlert('Por favor selecciona un método de pago antes de confirmar la reserva.', 'error');
    return;
  }

  submitting.value = true;
  try {
    const success = await store.submitRental();
    if (success) {
      router.push({ name: 'rental-success', params: { id: store.car.id } });
    }
  } catch (error) {
    console.error('Error al procesar la reserva:', error);
    addAlert('Ha ocurrido un error al procesar tu reserva. Por favor, intenta nuevamente.', 'error');
  } finally {
    submitting.value = false;
  }
}
  
  // Lifecycle hooks
  onMounted(async () => {
    // Cargar datos del auto y usuario
    await store.setInitialData({
      id: props.carId,
      user_id: props.userId,
      // Aquí deberías cargar los datos completos del auto desde tu API
      // Este es un ejemplo simplificado:
      marca: 'Cargando...',
      modelo: '',
      patente: '',
      precio: 0
    }, { id: props.userId }, props.isCarRented);
    
    watch(() => store.currentStep, async (newStep) => {
  if (newStep === 3) {
    await store.fetchPaymentMethods(); // Cargar métodos de pago al volver al paso 3

    // Verificar si el método seleccionado sigue existiendo
    if (store.rentalData.selectedPaymentMethod) {
      const methodExists = store.paymentMethods.some(
        method =>
          store.getPaymentMethodIdentifier(method) ===
          store.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod)
      );

      // Si el método seleccionado no existe, seleccionar el primero disponible
      if (!methodExists) {
        store.rentalData.selectedPaymentMethod = store.paymentMethods[0] || null;
      }
    }
  }
});

    // Agregar también un watch para el selectedPaymentMethod
    watch(() => store.rentalData.selectedPaymentMethod, (newMethod) => {
    if (newMethod && store.showNewPaymentForm) {
        store.showNewPaymentForm = false;
    }
    }, { immediate: true });
    
    // Si ya estamos en el paso 3 al montar, cargar los métodos de pago
    if (store.currentStep === 3) {
      await store.fetchPaymentMethods();
    }
    
    // Actualizar precio inicial
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
              :daily-price="store.car ? store.car.precio : 0"
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
            
            <div v-if="!store.loading && store.paymentMethods.length > 0" class="space-y-3">
                <div 
                v-for="(method, index) in store.paymentMethods" 
                :key="index"
                @click="store.selectPaymentMethod(method)"
                class="border rounded-xl p-4 cursor-pointer transition-all"
                :class="{
                  'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': store.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) === store.getPaymentMethodIdentifier(method), 
                  'border-gray-600 hover:border-vibrant-light-900': store.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) !== store.getPaymentMethodIdentifier(method)
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
                      'bg-vibrant-light-900 border-vibrant-light-900': store.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) === store.getPaymentMethodIdentifier(method), 
                      'border-gray-300': store.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) !== store.getPaymentMethodIdentifier(method)
                    }"
                  >
                    <svg v-if="store.getPaymentMethodIdentifier(store.rentalData.selectedPaymentMethod) === store.getPaymentMethodIdentifier(method)" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
            
            <div v-else-if="!store.loading && store.paymentMethods.length === 0" class="text-center py-4 text-gray-300">
              <p>No tenés métodos de pago guardados</p>
            </div>
            
            <div 
              v-if="!store.showNewPaymentForm"
              @click="store.toggleNewPaymentForm" 
              class="border border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:border-vibrant-light-900 transition-all flex items-center justify-center"
            >
              <div class="flex items-center gap-2 text-vibrant-light-900">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                <span>Agregar método de pago</span>
              </div>
            </div>
            
            <div v-if="store.showNewPaymentForm" class="mt-6">
              <Heading :type="4" class="text-white py-4">Nuevo método de pago</Heading>
              
              <div class="flex gap-4 mb-6">
                <div 
                  @click="store.selectedPaymentMethodType = 'credit_card'" 
                  class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
                  :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': store.selectedPaymentMethodType === 'credit_card', 'border-gray-600': store.selectedPaymentMethodType !== 'credit_card'}"
                >
                  Tarjeta
                </div>
                <div 
                  @click="store.selectedPaymentMethodType = 'digital_wallet'" 
                  class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
                  :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': store.selectedPaymentMethodType === 'digital_wallet', 'border-gray-600': store.selectedPaymentMethodType !== 'digital_wallet'}"
                >
                  Billetera Virtual
                </div>
                <div 
                  @click="store.selectedPaymentMethodType = 'paypal'" 
                  class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
                  :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': store.selectedPaymentMethodType === 'paypal', 'border-gray-600': store.selectedPaymentMethodType !== 'paypal'}"
                >
                  PayPal
                </div>
              </div>
              
              <div v-if="store.selectedPaymentMethodType === 'credit_card'" class="space-y-4">
                <Input 
                  type="text"
                  placeholder="Titular de tarjeta"
                  v-model="store.newPaymentMethod.credit_card.cardholder"
                  :variant="'secondary'"
                  :outline="false"
                />
                <Input 
                  type="text"
                  placeholder="Número de tarjeta"
                  v-model="store.newPaymentMethod.credit_card.cardNumber"
                  :variant="'secondary'"
                  :outline="false"
                />
                <div class="flex gap-5">
                  <Input 
                    type="text"
                    placeholder="MM/AA"
                    v-model="store.newPaymentMethod.credit_card.expiryDate"
                    :variant="'secondary'"
                    :outline="false"
                  />
                  <Input
                    type="password"
                    placeholder="CVV"
                    v-model="store.newPaymentMethod.credit_card.cvv"
                    :variant="'secondary'"
                    :outline="false"
                  />
                </div>
              </div>
              
              <div v-if="store.selectedPaymentMethodType === 'digital_wallet'" class="space-y-4">
                <Input 
                  type="select"
                  placeholder="Tipo de billetera"
                  :options="[
                    {value: 'mercadopago', label: 'Mercado Pago'},
                    {value: 'uala', label: 'Ualá'},
                    {value: 'otra', label:'Otra'}
                  ]"
                  v-model="store.newPaymentMethod.digital_wallet.walletType"
                  variant="secondary"
                  :outline="false"
                />
                <Input
                  type="text"
                  placeholder="CVU o Alias"
                  v-model="store.newPaymentMethod.digital_wallet.walletId"
                  variant="secondary"
                  :outline="false"
                />
              </div>
              
              <div v-if="store.selectedPaymentMethodType === 'paypal'" class="space-y-4">
                <Input 
                  type="email"
                  placeholder="Email de PayPal"
                  v-model="store.newPaymentMethod.paypal.email"
                  :variant="'secondary'"
                  :outline="false"
                />
              </div>
              
              <div class="flex gap-4 mt-6">
                <button 
                  @click="store.toggleNewPaymentForm" 
                  class="flex-1 py-3 px-4 border border-gray-600 rounded-xl hover:border-gray-400 transition-all text-white hover:cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  @click="store.saveNewPaymentMethod" 
                  :disabled="!store.isFormValid || store.loading"
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
            
            <div class="space-y-6">
              <!-- Detalles del vehículo -->
              <div class="bg-deep-blue-900 bg-opacity-20 rounded-xl p-6">
                <Heading type="4" class="text-white mb-4">Vehículo</Heading>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-gray-300 text-sm">Vehículo</p>
                    <p class="text-white font-medium">{{ store.car ? `${store.car.marca} ${store.car.modelo}` : 'No especificado' }}</p>
                  </div>
                  <div>
                    <p class="text-gray-300 text-sm">Matrícula</p>
                    <p class="text-white font-medium">{{ store.car ? store.car.patente : 'No especificada' }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Detalles de la reserva -->
              <div class="bg-deep-blue-900 bg-opacity-20 rounded-xl p-6">
                <Heading type="4" class="text-white mb-4">Detalles de la reserva</Heading>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p class="text-gray-300 text-sm">Desde</p>
                    <p class="text-white font-medium">
                      {{ store.formatDate(store.rentalData.rentedFromDate) }}
                      {{ store.rentalData.selectedTime }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-300 text-sm">Hasta</p>
                    <p class="text-white font-medium">
                      {{ store.formatDate(store.rentalData.rentedUntilDate) }}
                      {{ store.rentalData.selectedUntilTime }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-300 text-sm">Duración</p>
                    <p class="text-white font-medium">{{ store.formatRentalTime(store.rentalHours) }}</p>
                  </div>
                </div>
                
                <div class="mt-6">
                  <p class="text-gray-300 text-sm">Método de pago</p>
                  <p class="text-white font-medium">{{ store.getPaymentMethodName(store.rentalData.selectedPaymentMethod) }}</p>
                  <p class="text-gray-300 text-sm">{{ store.getPaymentDetails(store.rentalData.selectedPaymentMethod) }}</p>
                </div>
              </div>
              
              <!-- Desglose de precios -->
              <div class="bg-deep-blue-900 bg-opacity-20 rounded-xl p-6">
                <Heading type="4" class="text-white mb-4">Desglose de precios</Heading>
                
                <div class="space-y-3">
                  <div class="flex justify-between items-center">
                    <p class="text-gray-300">Precio por hora</p>
                    <p class="text-white">${{ store.formatPrice(store.priceHours) }}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-gray-300">Duración</p>
                    <p class="text-white">{{ store.formatRentalTime(store.rentalHours) }}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-gray-300">Precio base</p>
                    <p class="text-white">${{ store.formatPrice(store.basePrice) }}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-gray-300">Impuestos (21%)</p>
                    <p class="text-white">${{ store.formatPrice(store.taxes) }}</p>
                  </div>
                  <div class="flex justify-between items-center">
                    <p class="text-gray-300">Seguro</p>
                    <p class="text-white">${{ store.formatPrice(store.insurance) }}</p>
                  </div>
                  <hr class="border-gray-600" />
                  <div class="flex justify-between items-center font-semibold">
                    <p>Precio total</p>
                    <p>${{ store.formatPrice(store.totalPrice) }}</p>
                  </div>
                </div>
              </div>
              
              <!-- Aceptación de términos -->
              <div class="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  v-model="store.acceptTerms"
                  class="h-5 w-5 rounded text-vibrant-light-900 focus:ring-vibrant-light-900 border-gray-600 bg-transparent cursor-pointer"
                />
                <label for="acceptTerms" class="text-white cursor-pointer">
                  Acepto todos los términos y condiciones de alquiler
                </label>
              </div>
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
    </div>
  </template>