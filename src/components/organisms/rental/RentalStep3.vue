<script>
import RentalFooter from "@/components/organisms/rental/RentalFooter.vue";
import DateTime from "@/components/organisms/rental/DateTime.vue";
import RentalHeader from "@/components/organisms/rental/RentalHeader.vue";
import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";
import DropdownForm from '@/components/molecules/DropdownForm.vue';
import Input from "@/components/molecules/Input.vue";
import MercadoPago from "@icons/MercadoPago.vue";
import Uala from "@icons/Uala.vue";
import CreditCard from "@icons/CreditCard.vue";
import PayPal from "@icons/PayPal.vue";
import { savePaymentMethod, getPaymentMethods } from "@services/payment/payment.js";
import { subscribeToAuthState } from "@/services/auth.js";
import { addAlert } from "@/services/alerts.js";
import Loading from '@/icons/Loading.vue';

export default {
  name: 'RentalStep3',
  components: {
    RentalFooter,
    DateTime,
    Heading,
    BackButton,
    RentalHeader,
    DropdownForm,
    Input,
    Loading,
    MercadoPago,
    Uala,
    CreditCard,
    PayPal
  },
  props: {
    car: {
      type: Object,
      required: true
    },
    loggedUser: {
      type: Object,
      required: true
    },
    rented: {
      type: Boolean,
      default: false
    },
    currentStep: {
      type: Number,
      required: true
    },
    sections: {
      type: Array,
      required: true
    },
    prevStep: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      rentalData: {
        rentedFromDate: "",
        rentedUntilDate: "",
        selectedTime: "",
        selectedUntilTime: "",
        currentTotalPrice: 0,
        selectedPaymentMethod: null
      },
      paymentMethods: [],
      newPaymentMethod: {
        digital_wallet: {
          type: 'digital_wallet',
          walletType: '',
          walletId: ''
        },
        credit_card: {
          type: 'credit_card',
          cardholder: '',
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        },
        paypal: {
          type: 'paypal',
          email: ''
        }
      },
      selectedPaymentMethodType: 'credit_card',
      showNewPaymentForm: false,
      loading: false,
      errorMessage: ""
    };
  },
  methods: {
    handleDateUpdate() {
      // Esta función es necesaria para evitar errores en la consola
      // pero como está deshabilitado no se utilizará para actualizar fechas
    },

    goToNextStep() {
      // Guardar el método de pago seleccionado en el localStorage
      const updatedRentalData = {
        ...this.rentalData,
        selectedPaymentMethod: this.rentalData.selectedPaymentMethod
      };
      
      localStorage.setItem('rentalData', JSON.stringify(updatedRentalData));
      this.$emit('continue');
    },
    
    selectPaymentMethod(method) {
      this.rentalData.selectedPaymentMethod = method;
      this.showNewPaymentForm = false; // Ocultar formulario si estaba abierto
    },
    
    async fetchPaymentMethods() {
      if (!this.loggedUser || !this.loggedUser.id) {
        this.errorMessage = "Usuario no identificado";
        return;
      }
      
      this.loading = true;
      try {
        // Obtener métodos de pago existentes
        const methods = await getPaymentMethods(this.loggedUser.id);
        this.paymentMethods = methods;
        
        // Si hay métodos guardados, seleccionar el primero por defecto
        if (methods.length > 0) {
          this.rentalData.selectedPaymentMethod = methods[0];
        }
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        this.errorMessage = "Error al cargar métodos de pago";
      } finally {
        this.loading = false;
      }
    },

    toggleNewPaymentForm() {
      this.showNewPaymentForm = !this.showNewPaymentForm;
      if (this.showNewPaymentForm) {
        // Deseleccionar método existente
        this.rentalData.selectedPaymentMethod = null;
      }
    },

    async saveNewPaymentMethod() {
      this.loading = true;
      try {
        const paymentData = this.newPaymentMethod[this.selectedPaymentMethodType];
        
        // Validación según tipo de método
        let isValid = false;
        switch(this.selectedPaymentMethodType) {
          case 'credit_card':
            isValid = paymentData.cardholder && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv;
            break;
          case 'digital_wallet':
            isValid = paymentData.walletType && paymentData.walletId;
            break;
          case 'paypal':
            isValid = paymentData.email;
            break;
        }

        if (!isValid) {
          addAlert('Por favor completa todos los campos del método de pago', 'error');
          return;
        }

        // Crear objeto con todos los datos necesarios
        const newMethod = {
          type: this.selectedPaymentMethodType,
          ...paymentData,
          createdAt: new Date()
        };

        // Guardar método de pago
        await savePaymentMethod(this.loggedUser.id, newMethod);
        
        // Refrescar lista de métodos
        await this.fetchPaymentMethods();
        
        // Seleccionar el nuevo método
        this.rentalData.selectedPaymentMethod = this.paymentMethods.find(m => 
          m.type === this.selectedPaymentMethodType && 
          (m.walletId === paymentData.walletId || m.cardNumber === paymentData.cardNumber || m.email === paymentData.email)
        );
        
        // Ocultar el formulario
        this.showNewPaymentForm = false;
        this.newPaymentMethod = {
          digital_wallet: { type: 'digital_wallet', walletType: '', walletId: '' },
          credit_card: { type: 'credit_card', cardholder: '', cardNumber: '', expiryDate: '', cvv: '' },
          paypal: { type: 'paypal', email: '' }
        };
        
        addAlert('Método de pago guardado correctamente', 'success');
      } catch (error) {
        console.error('Error al guardar método de pago:', error);
        addAlert('Error al guardar el método de pago', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    getPaymentMethodIdentifier(method) {
      if (!method) return null;
      
      switch(method.type) {
        case 'credit_card':
          return `card-${method.cardNumber}`;
        case 'digital_wallet':
          return `wallet-${method.walletType}-${method.walletId}`;
        case 'paypal':
          return `paypal-${method.email}`;
        default:
          return null;
  }
},
  },
  async mounted() {
  // Cargar datos guardados
  const savedData = localStorage.getItem('rentalData');
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      this.rentalData = parsedData;
      
      // Guardar temporalmente el ID o identificador único del método de pago seleccionado
      const savedPaymentMethodId = parsedData.selectedPaymentMethod ? 
        this.getPaymentMethodIdentifier(parsedData.selectedPaymentMethod) : null;
      
      // Primero cargamos los métodos de pago
      await this.fetchPaymentMethods();
      
      // Si teníamos un método guardado, buscamos su equivalente en los métodos recién cargados
      if (savedPaymentMethodId && this.paymentMethods.length > 0) {
        const matchedMethod = this.paymentMethods.find(method => 
          this.getPaymentMethodIdentifier(method) === savedPaymentMethodId
        );
        
        if (matchedMethod) {
          this.rentalData.selectedPaymentMethod = matchedMethod;
        }
      }
    } catch (e) {
      console.error("Error al cargar datos guardados:", e);
      await this.fetchPaymentMethods();
    }
  } else {
    await this.fetchPaymentMethods();
  }
},
  computed: {
    isNextDisabled() {
      return !this.rentalData.selectedPaymentMethod && !this.showNewPaymentForm;
    },
    
    isFormValid() {
      const paymentData = this.newPaymentMethod[this.selectedPaymentMethodType];
      
      switch(this.selectedPaymentMethodType) {
        case 'credit_card':
          return paymentData.cardholder && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv;
        case 'digital_wallet':
          return paymentData.walletType && paymentData.walletId;
        case 'paypal':
          return paymentData.email;
        default:
          return false;
      }
    }
  }
};
</script>

<template>
  <div class="relative">
  <div class="space-y-6">
    <RentalHeader 
      :current-step="currentStep"
      :sections="sections"
      :prev-step="prevStep"
    />

    <DateTime 
      @update-dates="handleDateUpdate" 
      :disabled="true" 
      :initial-values="{
        rentedFromDate: rentalData.rentedFromDate,
        rentedUntilDate: rentalData.rentedUntilDate,
        rentedFromHour: rentalData.selectedTime,
        rentedUntilHour: rentalData.selectedUntilTime
      }" 
    />

    <!-- Sección de métodos de pago -->
    <div class="rounded-xl space-y-4">
      <div class="flex items-center justify-between">
        <Heading :type="3" class="text-white py-4">Formas de pago</Heading>
        <div v-if="loading" class="flex items-center">
          <Loading role="status" class="h-6 w-6" />
        </div>
      </div>
      
      <!-- Lista de métodos de pago existentes -->
      <div v-if="!loading && paymentMethods.length > 0" class="space-y-3">
        <div 
          v-for="(method, index) in paymentMethods" 
          :key="index"
          @click="selectPaymentMethod(method)"
          class="border rounded-xl p-4 cursor-pointer transition-all"
          :class="{
            'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': rentalData.selectedPaymentMethod === method, 
            'border-gray-600 hover:border-vibrant-light-900': rentalData.selectedPaymentMethod !== method
          }"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 flex items-center justify-center rounded-full ">
                <!-- Aca tendirmaos que poner los iconos segun metodo de pago -->
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
            
            <!-- Checkbox indicador de selección -->
            <div 
              class="w-6 h-6 rounded-full border flex items-center justify-center"
              :class="{
                'bg-vibrant-light-900 border-vibrant-light-900': rentalData.selectedPaymentMethod === method, 
                'border-gray-300': rentalData.selectedPaymentMethod !== method
              }"
            >
              <svg v-if="rentalData.selectedPaymentMethod === method" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else-if="!loading && paymentMethods.length === 0" class="text-center py-4 text-gray-300">
        <p>No tenés métodos de pago guardados</p>
      </div>
      
      <!-- Botón para agregar nuevo método de pago -->
      <div 
        v-if="!showNewPaymentForm"
        @click="toggleNewPaymentForm" 
        class="border border-dashed border-gray-600 rounded-xl p-4 cursor-pointer hover:border-vibrant-light-900 transition-all flex items-center justify-center"
      >
        <div class="flex items-center gap-2 text-vibrant-light-900">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
          </svg>
          <span>Agregar método de pago</span>
        </div>
      </div>
      
      <!-- Formulario para agregar nuevo método de pago -->
      <div v-if="showNewPaymentForm" class="mt-6">
        <Heading :type="4" class="text-white py-4">Nuevo método de pago</Heading>
        
        <!-- Selector de tipo de método de pago -->
        <div class="flex gap-4 mb-6">
          <div 
            @click="selectedPaymentMethodType = 'credit_card'" 
            class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
            :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': selectedPaymentMethodType === 'credit_card', 'border-gray-600': selectedPaymentMethodType !== 'credit_card'}"
          >
            Tarjeta
          </div>
          <div 
            @click="selectedPaymentMethodType = 'digital_wallet'" 
            class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
            :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': selectedPaymentMethodType === 'digital_wallet', 'border-gray-600': selectedPaymentMethodType !== 'digital_wallet'}"
          >
            Billetera Virtual
          </div>
          <div 
            @click="selectedPaymentMethodType = 'paypal'" 
            class="flex-1 p-3 border rounded-xl cursor-pointer text-center transition-all text-white"
            :class="{'border-vibrant-light-900 bg-deep-blue-900 bg-opacity-20': selectedPaymentMethodType === 'paypal', 'border-gray-600': selectedPaymentMethodType !== 'paypal'}"
          >
            PayPal
          </div>
        </div>
        
        <!-- Formulario de tarjeta de crédito -->
        <div v-if="selectedPaymentMethodType === 'credit_card'" class="space-y-4">
          <Input 
            type="text"
            placeholder="Titular de tarjeta"
            v-model="newPaymentMethod.credit_card.cardholder"
            :variant="'secondary'"
            :outline="false"
          />
          <Input 
            type="text"
            placeholder="Número de tarjeta"
            v-model="newPaymentMethod.credit_card.cardNumber"
            :variant="'secondary'"
            :outline="false"
          />
          <div class="flex gap-5">
            <Input 
              type="text"
              placeholder="MM/AA"
              v-model="newPaymentMethod.credit_card.expiryDate"
              :variant="'secondary'"
              :outline="false"
            />
            <Input
              type="password"
              placeholder="CVV"
              v-model="newPaymentMethod.credit_card.cvv"
              :variant="'secondary'"
              :outline="false"
            />
          </div>
        </div>
        
        <!-- Formulario de billetera digital -->
        <div v-if="selectedPaymentMethodType === 'digital_wallet'" class="space-y-4">
          <Input 
            type="select"
            placeholder="Tipo de billetera"
            :options="[
              {value: 'mercadopago', label: 'Mercado Pago'},
              {value: 'uala', label: 'Ualá'},
              {value: 'otra', label:'Otra'}
            ]"
            v-model="newPaymentMethod.digital_wallet.walletType"
            variant="secondary"
            :outline="false"
          />
          <Input
            type="text"
            placeholder="CVU o Alias"
            v-model="newPaymentMethod.digital_wallet.walletId"
            variant="secondary"
            :outline="false"
          />
        </div>
        
        <!-- Formulario de PayPal -->
        <div v-if="selectedPaymentMethodType === 'paypal'" class="space-y-4">
          <Input 
            type="email"
            placeholder="Email de PayPal"
            v-model="newPaymentMethod.paypal.email"
            :variant="'secondary'"
            :outline="false"
          />
        </div>
        
        <!-- Botones de acción -->
        <div class="flex gap-4 mt-6">
          <button 
            @click="toggleNewPaymentForm" 
            class="flex-1 py-3 px-4 border border-gray-600 rounded-xl hover:border-gray-400 transition-all text-white hover:cursor-pointer"
          >
            Cancelar
          </button>
          <button 
            @click="saveNewPaymentMethod" 
            :disabled="!isFormValid || loading"
            class="flex-1 py-3 px-4 bg-vibrant-light-900 text-deep-blue-900 rounded-xl font-medium hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:cursor-pointer"
          >
            {{ loading ? 'Guardando...' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <RentalFooter 
      :total-amount="rentalData.currentTotalPrice" 
      button-text="Siguiente" 
      :is-disabled="!rentalData.selectedPaymentMethod && !showNewPaymentForm"
      :is-confirmation="false"
      @continue="goToNextStep" 
    />
  </div>
</div>
</template>