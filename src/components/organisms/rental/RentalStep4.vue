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
    PriceCalculator
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
    };
  },
  methods: {
    goToNextStep() {
      this.$emit('continue');
    },

    formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  },

    handleTotalUpdate(price) {
      this.currentTotalPrice = price;
      this.$emit('total-updated', price);
    },

    handleDateUpdate(){
        //Hay que tener esta funcion para que no aparezca el error en consola,
        //pero como esta desahabilitado no se va a usar el actualizar fecha
      },
    
    async submitRental() {
      try {
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
        addAlert("Error al procesar la reserva", "error");
      }
    },
    
    prepareRentalData() {
      return {
        car_id: this.car.id,
        owner_id: this.car.user_id,
        user_id: this.loggedUser.id,
        rented_from: `${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime}:00`,
        rented_until: `${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime}:00`,
        status: "pendiente",
        rental_price: this.rentalData.currentTotalPrice,
      };
    },

    formatPrice(price) {
    return price.toLocaleString('es-AR');
  }
  },
  mounted() {
  const savedData = localStorage.getItem('rentalData');
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      this.rentalData = parsedData;
      
      console.log("Método de pago cargado:", this.rentalData.selectedPaymentMethod);
      
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
      this.$router.push(`/car/${this.car.id}`);
    }
  } else {
    this.$router.push(`/car/${this.car.id}`);
  }
},
computed: {
  paymentMethod() {
    return this.rentalData.selectedPaymentMethod;
  },
  calculateDuration() {
    if (!this.rentalData.rentedFromDate || !this.rentalData.rentedUntilDate) return 0;
    
    const start = new Date(this.rentalData.rentedFromDate);
    const end = new Date(this.rentalData.rentedUntilDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  },
  calculateHours() {
    if (!this.rentalData.selectedTime || !this.rentalData.selectedUntilTime) return 0;
    
    const [startHour, startMin] = this.rentalData.selectedTime.split(':').map(Number);
    const [endHour, endMin] = this.rentalData.selectedUntilTime.split(':').map(Number);
    
    let hourDiff = endHour - startHour;
    let minDiff = endMin - startMin;
    
    if (minDiff < 0) {
      hourDiff--;
      minDiff += 60;
    }
    
    if (hourDiff < 0) {
      hourDiff += 24;
    }
    
    return hourDiff + (minDiff > 30 ? 1 : minDiff > 0 ? 0.5 : 0);
  },
  calculateBasePrice() {
    return this.car.precio * this.calculateDuration;
  },
  calculateTaxes() {
    // Asumiendo un 21% de IVA
    return this.calculateBasePrice * 0.21;
  },
  calculateInsurance() {
    // Precio fijo de seguro por día
    return 25000;
  }
},
};
</script>

<template>
  <div class="space-y-6">
    <RentalHeader 
      :current-step="currentStep"
      :sections="sections"
      :prev-step="prevStep"
    />
    
    <div class="p-4 rounded-xl bg-blue-950 text-white">
      <h2 class="text-xl font-bold mb-4">Resumen de la Reserva</h2>
      
      
      <!-- Desglose de Costos -->
      <div class="space-y-3 border-b border-blue-800 pb-4 mb-4">
        <div class="flex justify-between">
          <span>Tiempo total</span>
          <span>{{ calculateDuration }} días {{ calculateHours }} hs</span>
        </div>
        
        <div class="flex justify-between">
          <span>Precio base</span>
          <span>${{ formatPrice(calculateBasePrice) }}</span>
        </div>
        
        <div class="flex justify-between">
          <span>Impuestos</span>
          <span>${{ formatPrice(calculateTaxes) }}</span>
        </div>
        
        <div class="flex justify-between">
          <span>Seguro</span>
          <span>${{ formatPrice(calculateInsurance) }}</span>
        </div>
      </div>
      
      <!-- Método de Pago -->
      <div class="bg-blue-900 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-3">
          <div class="rounded-xl bg-white p-2">
            <MercadoPago v-if="paymentMethod && paymentMethod.type === 'digital_wallet' && paymentMethod.walletType === 'mercadopago'" class="h-6 w-6"/>
            <Uala v-else-if="paymentMethod && paymentMethod.type === 'digital_wallet' && paymentMethod.walletType === 'uala'" class="h-6 w-6"/>
            <PayPal v-else-if="paymentMethod && paymentMethod.type === 'paypal'" class="h-6 w-6"/>
            <CreditCard v-else-if="paymentMethod && paymentMethod.type === 'credit_card'" class="h-6 w-6"/>
          </div>
          
          <div>
            <p v-if="paymentMethod" class="font-medium">
              {{
                paymentMethod.type === 'credit_card' 
                  ? 'Tarjeta terminada en ' + paymentMethod.cardNumber.slice(-4) 
                  : paymentMethod.type === 'paypal' 
                    ? 'PayPal' 
                    : paymentMethod.type === 'digital_wallet' && paymentMethod.walletType === 'uala' 
                      ? 'Ualá' 
                      : paymentMethod.type === 'digital_wallet' && paymentMethod.walletType === 'mercadopago' 
                        ? 'Mercado Pago' 
                        : paymentMethod.walletType || 'Otro método'
              }}
            </p>
            <p class="text-sm text-gray-300">
              {{ paymentMethod ? (paymentMethod.type === 'credit_card' ? paymentMethod.cardholder : 
                 paymentMethod.type === 'digital_wallet' ? paymentMethod.walletId : paymentMethod.email) 
                 : 'No se ha seleccionado método de pago' }}
            </p>
          </div>
        </div>
      </div>
      
      <!-- Información útil para el usuario -->
      <div class="bg-blue-800 rounded-lg p-4 mb-4 text-sm">
        <h3 class="font-bold mb-2">Información importante:</h3>
        <ul class="list-disc pl-5 space-y-1">
          <li>Presenta tu licencia de conducir vigente al momento del retiro</li>
          <li>El vehículo se entregará con tanque lleno y deberá devolverse en las mismas condiciones</li>
          <li>Recuerda revisar el estado del vehículo antes de retirarlo</li>
        </ul>
      </div>
      
    </div>
    
    <RentalFooter 
      :total-amount="rentalData.currentTotalPrice"
      button-text="Enviar solicitud" 
      :is-confirmation="false"
      @continue="submitRental" 
    />
  </div>
</template>
  
