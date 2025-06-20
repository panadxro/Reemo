<script>
import RentalFooter from "@/components/organisms/rental/RentalFooter.vue";
import DateTime from "@/components/organisms/rental/DateTime.vue";
import RentalHeader from "@components/organisms/rental/RentalHeader.vue";
import PriceCalculator from './PriceCalculator.vue';
import { isCarAlreadyRented, submitRentalRequest } from "@services/rentedCarService";
import MercadoPago from "@icons/MercadoPago.vue";
import Uala from "@icons/Uala.vue";
import CreditCard from "@icons/CreditCard.vue";
import PayPal from "@icons/PayPal.vue";
import { addAlert } from "@services/alerts";

export default {
  components: {
    RentalFooter,
    DateTime,
    RentalHeader,
    MercadoPago,
    Uala,
    CreditCard,
    PayPal,
    PriceCalculator,
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
        selectedPaymentMethod: null,
      },
      paymentInfo: {
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
      },
      acceptTerms: false
    };
  },
  methods: {
    goToNextStep() {
      this.$emit('continue');
    },

    formatDate(dateString) {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    },

    handleTotalUpdate(price) {
      this.currentTotalPrice = price;
      this.$emit('total-updated', price);
    },

    handleDateUpdate() {
      // Función placeholder para evitar errores
    },
    
    async submitRental() {
      try {
        if (!this.acceptTerms) {
          addAlert("Debes aceptar los términos y condiciones", "error");
          return;
        }

        if (!this.rentalData.selectedPaymentMethod) {
          addAlert("Por favor selecciona un método de pago", "error");
          return;
        }

        if (await isCarAlreadyRented(this.car.id)) {
          addAlert("Este auto ya está alquilado", "info");
          return;
        }
        
        await submitRentalRequest(this.prepareRentalData());
        addAlert("¡Reserva completada con éxito!", "success");
        
        localStorage.removeItem('rentalData');
        localStorage.removeItem('paymentInfo');
        
        this.$router.push("/profile");
      } catch (error) {
        console.error("Error:", error);
        addAlert("Error al procesar la reserva: " + (error.message || "Por favor intenta nuevamente"), "error");
      }
    },
    
    prepareRentalData() {
      return {
        vehicle_id: this.car.id,
        owner_id: this.car.user_id,
        driver_id: this.loggedUser.id,
        start_location: null,
        end_location: null,
        start_time: `${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime}:00`,
        end_time: `${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime}:00`,
        status: "pendiente",
        total_price: this.rentalData.currentTotalPrice,
        payments: {
          transaction_id: null,
          amount: this.rentalData.currentTotalPrice,
          payment_method: this.getPaymentMethodName(this.rentalData.selectedPaymentMethod),
          status: 'pendiente',
          timestamp: new Date().toISOString()
        },
      };
    },

    formatPrice(price) {
      return Math.round(price).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    },

    getPaymentIcon(paymentMethod) {
      if (!paymentMethod) return null;
      const icons = {
        mercadopago: MercadoPago,
        uala: Uala,
        paypal: PayPal,
        credit_card: CreditCard
      };
      return icons[paymentMethod.walletType || paymentMethod.type];
    },
    
    getPaymentMethodName(paymentMethod) {
      if (!paymentMethod) return 'No especificado';
      const names = {
        credit_card: 'Tarjeta de crédito',
        paypal: 'PayPal',
        uala: 'Ualá',
        mercadopago: 'Mercado Pago'
      };
      return paymentMethod.type === 'credit_card' 
        ? `${names.credit_card} (**** ${paymentMethod.cardNumber.slice(-4)})` 
        : names[paymentMethod.walletType || paymentMethod.type];
    },
    
    getPaymentDetails(paymentMethod) {
      if (!paymentMethod) return '';
      if (paymentMethod.type === 'credit_card') {
        return `Titular: ${paymentMethod.cardholder} - Vence ${paymentMethod.expiryDate}`;
      }
      return paymentMethod.email || paymentMethod.walletId || '';
    }
  },
  computed: {
    paymentMethod() {
      return this.rentalData.selectedPaymentMethod;
    },
    priceHours() {
      return this.car.pricing.rates.daily / 24;
    },
    rentalHours() {
      if (!this.rentalData.rentedFromDate || !this.rentalData.rentedUntilDate) return 0;

      try {
        const start = new Date(`${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime || '00:00'}`);
        const end = new Date(`${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime || '00:00'}`);
        return Math.max(0, (end - start) / (1000 * 60 * 60));
      } catch {
        return 0;
      }
    },
    formatRentalTime() {
      return (hours) => {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = Math.floor((hours % 1) * 60);

        let timeString = "";

        if (days > 0) {
          timeString += `${days} día${days > 1 ? 's' : ''} `;
        }

        if (remainingHours > 0) {
          timeString += `${remainingHours} hora${remainingHours > 1 ? 's' : ''} `;
        }

        if (minutes > 0) {
          timeString += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
        }

        return timeString.trim() || "0 horas";
      };
    },
    basePrice() {
      return this.priceHours * this.rentalHours;
    },
    taxes() {
      return this.basePrice * 0.21;
    },
    insurance() {
      return 25000;
    },
    totalPrice() {
      return this.basePrice + this.taxes + this.insurance;
    },
    isFormValid() {
      return this.acceptTerms && this.paymentMethod;
    }
  },
  mounted() {
    const savedData = localStorage.getItem('rentalData');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        this.rentalData = {
          ...this.rentalData,
          ...parsedData
        };
        
        if (!this.rentalData.selectedPaymentMethod) {
          const savedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
          if (savedPaymentMethod) {
            this.rentalData.selectedPaymentMethod = JSON.parse(savedPaymentMethod);
          }
        }
        
        if (this.rentalData.currentTotalPrice === undefined || this.rentalData.currentTotalPrice === null) {
          this.rentalData.currentTotalPrice = parsedData.currentTotalPrice || 0;
        }
      } catch (e) {
        console.error("Error al procesar datos guardados:", e);
        addAlert("Error al cargar los datos de reserva", "error");
        this.$router.push(`/car/${this.car.id}`);
      }
    } else {
      this.$router.push(`/car/${this.car.id}`);
    }
  }
};
</script>

<template>
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
    
    <div class=" text-white">
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
            <p class="font-medium">{{ formatDate(rentalData.rentedFromDate) }} a las {{ rentalData.selectedTime }}</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Devolución</p>
            <p class="font-medium">{{ formatDate(rentalData.rentedUntilDate) }} a las {{ rentalData.selectedUntilTime }}</p>
          </div>
        </div>
        
        <div class="bg-primary-800 p-3 rounded-lg">
          <div class="flex justify-between items-center">
            <span class="font-medium">Duración total</span>
            <span class="font-semibold">{{ formatRentalTime(rentalHours) }}</span>
          </div>
        </div>
      </div>

      <div class="space-y-3 pb-6 mb-6">
        <h3 class="font-semibold pb-2">Detalle de pago</h3>
        
        <div class="space-y-2">
          <div class="flex justify-between">
            <span class="text-gray-400">Subtotal:</span>
            <span>$ {{ formatPrice(basePrice) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Impuestos (21%):</span>
            <span>$ {{ formatPrice(taxes) }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Seguro:</span>
            <span>$ {{ formatPrice(insurance) }}</span>
          </div>
          <div class="flex justify-between pt-2 border-t border-gray-200 text-secondary-300">
            <span class="font-semibold">Total:</span>
            <span class="font-bold">$ {{ formatPrice(totalPrice) }}</span>
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
              @click="$emit('change-step', 2)"
              class="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
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
        </ul>
      </div>
      
      <div class="mb-6 ">
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
    
    <RentalFooter 
      :total-amount="rentalData.currentTotalPrice"
      button-text="Enviar solicitud" 
      :is-disabled="!isFormValid"
      :is-confirmation="true"
      @confirm="submitRental" 
    />
    <p v-if="!isFormValid" class="text-red-300">Debes aceptar los terminos y condiciones</p>
  </div>
</template>