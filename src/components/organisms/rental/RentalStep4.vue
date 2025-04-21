<script>
import RentalFooter from "@/components/organisms/rental/RentalFooter.vue";
import DateTime from "@/components/organisms/rental/DateTime.vue";
import RentalHeader from "@components/organisms/rental/RentalHeader.vue";
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
    }
  },
  mounted() {
  const savedData = localStorage.getItem('rentalData');
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData);
      this.rentalData = parsedData;
      
      console.log("Método de pago cargado:", this.rentalData.selectedPaymentMethod);
      
      // Si el método de pago es undefined o null, verifica si hay datos específicos guardados
      if (!this.rentalData.selectedPaymentMethod) {
        const savedPaymentMethod = localStorage.getItem('selectedPaymentMethod');
        if (savedPaymentMethod) {
          this.rentalData.selectedPaymentMethod = JSON.parse(savedPaymentMethod);
        }
      }
      
      // Si el precio es undefined o null, intentamos obtenerlo
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
      
      <DateTime 
        @update-dates="handleDateUpdate" 
        :disabled="true" 
      />
      
      <!-- Contenido de confirmación -->
      <div class="bg-[#343666] border border-gray-700 rounded-2xl p-4">
        <div class="flex items-center justify-center mb-4">
          <div class="bg-green-500 rounded-full p-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h3 class="text-white font-semibold text-center text-xl mb-3">
          Confirma los detalles de tu reserva
        </h3>
        
        <div class="space-y-4 text-white">
          <div class="border-b border-gray-700 pb-2">
            <h4 class="font-medium mb-2">Datos del vehículo</h4>
            <div class="flex gap-3">
              <img 
                :src="car.images && car.images[0]" 
                alt="Auto" 
                class="w-20 h-20 object-cover rounded-lg" 
              />
              <div>
                <p class="font-semibold">{{ car.marca }} {{ car.modelo }}</p>
                <p class="text-gray-300">Año: {{ car.año }}</p>
              </div>
            </div>
          </div>
          
          <div class="border-b border-gray-700 pb-2">
            <h4 class="font-medium mb-2">Método de pago</h4>
            <div class="flex items-center gap-3">
              
                <!-- Usar la propiedad computada -->
                <div class="rounded-xl bg-white p-2">
                  <MercadoPago v-if="paymentMethod && paymentMethod.type === 'digital_wallet' && paymentMethod.walletType === 'mercadopago'" class="h-6 w-6"/>
                <Uala v-else-if="paymentMethod && paymentMethod.type === 'digital_wallet' && paymentMethod.walletType === 'uala'" class="h-6 w-6"/>
                <PayPal v-else-if="paymentMethod && paymentMethod.type === 'paypal'" class="h-6 w-6"/>
                <CreditCard v-else-if="paymentMethod && paymentMethod.type === 'credit_card'" class="h-6 w-6"/>
                </div>

              <div v-if="paymentMethod">
                <p class="font-medium text-white">
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
                  {{ paymentMethod.type === 'credit_card' ? paymentMethod.cardholder : 
                     paymentMethod.type === 'digital_wallet' ? paymentMethod.walletId : paymentMethod.email }}
                </p>
              </div>
              <div v-else class="text-red-400">
                No se ha seleccionado método de pago
              </div>
            </div>
          </div>
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
  
