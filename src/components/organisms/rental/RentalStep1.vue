<script>
import DateTime from '@/components/organisms/rental/DateTime.vue';
import PriceCalculator from '@/components/organisms/rental/PriceCalculator.vue';
import RentalFooter from '@/components/organisms/rental/RentalFooter.vue';

export default {
  components: {
    DateTime,
    PriceCalculator,
    RentalFooter
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
    }
  },
  data() {
    return {
      rentedFromDate: "",
      rentedUntilDate: "",
      selectedTime: "",
      selectedUntilTime: "",
      currentTotalPrice: 0
    };
  },
  methods: {
    handleDateUpdate(data) {
      this.rentedFromDate = data.rentedFromDate;
      this.rentedUntilDate = data.rentedUntilDate;
      this.selectedTime = data.rentedFromHour;
      this.selectedUntilTime = data.rentedUntilHour;
      
      // Guardar datos para pasos siguientes
      this.saveRentalData();
    },
    
    handleTotalUpdate(price) {
      this.currentTotalPrice = price;
      this.saveRentalData();
    },
    
    saveRentalData() {
      // Guardar datos en localStorage para pasos siguientes
      const rentalData = {
        rentedFromDate: this.rentedFromDate,
        rentedUntilDate: this.rentedUntilDate,
        selectedTime: this.selectedTime,
        selectedUntilTime: this.selectedUntilTime,
        currentTotalPrice: this.currentTotalPrice
      };
      
      localStorage.setItem('rentalData', JSON.stringify(rentalData));
    },
    
    goToInformation() {
      if (!this.rentedFromDate || !this.rentedUntilDate || !this.selectedTime || !this.selectedUntilTime) {
        alert("Por favor, completa todos los campos de fecha y hora");
        return;
      }
      
      this.$router.push(`/car/${this.car.id}/information`);
    }
  },

  // NO FUNCIONA, ARREGLAR
  mounted() {
  this.$emit('show-map'); // Mostrar el mapa al montar
  
  const savedData = localStorage.getItem('rentalData');
  if (savedData) {
    try {
      const data = JSON.parse(savedData);
      this.rentedFromDate = data.rentedFromDate || "";
      this.rentedUntilDate = data.rentedUntilDate || "";
      this.selectedTime = data.selectedTime || "";
      this.selectedUntilTime = data.selectedUntilTime || "";
      this.currentTotalPrice = data.currentTotalPrice || 0;
      
      
      if (this.rentedFromDate && this.rentedUntilDate) {
        this.$nextTick(() => {
          this.$emit('dates-loaded', {
            rentedFromDate: this.rentedFromDate,
            rentedUntilDate: this.rentedUntilDate,
            rentedFromHour: this.selectedTime,
            rentedUntilHour: this.selectedUntilTime
          });
        });
      }
    } catch (e) {
      console.error("Error al cargar datos guardados:", e);
    }
  }
}
};
</script>

<template>
    <div class="space-y-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold text-white">Paso 1: Selecciona las fechas</h2>
      </div>
      
      <DateTime 
      @update-dates="handleDateUpdate" 
      :disabled="rented"
      :initial-values="{
        rentedFromDate: rentedFromDate,
        rentedUntilDate: rentedUntilDate,
        rentedFromHour: selectedTime,
        rentedUntilHour: selectedUntilTime
      }"
    />
      
      <PriceCalculator
        :start-date="rentedFromDate"
        :start-time="selectedTime"
        :end-date="rentedUntilDate"
        :end-time="selectedUntilTime"
        :daily-price="car.precio"
        @total-updated="handleTotalUpdate"
      />
      
      <RentalFooter 
        :total-amount="currentTotalPrice"
        button-text="Siguiente"
        :is-disabled="!rentedFromDate || !rentedUntilDate || rented"
        :is-confirmation="false"
        @continue="goToInformation"
      />
    </div>
  </template>
  
