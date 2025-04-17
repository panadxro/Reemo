<script>
import RentalFooter from "@/components/organisms/rental/RentalFooter.vue";
import DateTime from "@/components/organisms/rental/DateTime.vue";
import RentalHeader from "@/components/organisms/rental/RentalHeader.vue";
import Heading from "@components/atoms/Heading.vue";
import BackButton from "@components/atoms/BackButton.vue";

export default {
  name: 'RentalStep2',
  components: {
    RentalFooter,
    DateTime,
    Heading,
    BackButton,
    RentalHeader
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
        currentTotalPrice: 0
      }
    };
  },
  methods: {
    handleDateUpdate() {
      // Esta función es necesaria para evitar errores en la consola
      // pero como está deshabilitado no se utilizará para actualizar fechas
    },

    goToNextStep() {
      this.$emit('continue');
    },
    
    calculatePercentage(percentage) {
      return this.rentalData.currentTotalPrice * (percentage / 100);
    }
  },
  mounted() {
    
    // Cargar datos guardados
    const savedData = localStorage.getItem('rentalData');
    if (savedData) {
      try {
        this.rentalData = JSON.parse(savedData);
        // console.log("Datos guardados cargados:", this.rentalData);
      } catch (e) {
        console.error("Error al cargar datos guardados:", e);
      }
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

    <section class="text-white">
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
                <p>${{ Number(calculatePercentage(25).toFixed(0)).toLocaleString('es-AR') }}</p>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <p>3-23 hs antes del alquiler</p>
              <div class="flex justify-between items-center gap-4">
                <span class="text-gray-300">40%</span>
                <p>${{ Number(calculatePercentage(40).toFixed(0)).toLocaleString('es-AR') }}</p>
              </div>
            </div>
            <div class="flex justify-between items-center">
              <p>3-0 hs antes del alquiler</p>
              <div class="flex justify-between items-center gap-4">
                <span class="text-gray-300">100%</span>
                <p>${{ Number(calculatePercentage(100).toFixed(0)).toLocaleString('es-AR') }}</p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <RentalFooter 
      :total-amount="rentalData.currentTotalPrice" 
      button-text="Siguiente" 
      :is-confirmation="false"
      @continue="goToNextStep" 
    />
  </div>
</template>