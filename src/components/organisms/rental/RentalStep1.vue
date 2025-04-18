<script>
import DateTime from '@/components/organisms/rental/DateTime.vue';
import PriceCalculator from '@/components/organisms/rental/PriceCalculator.vue';
import RentalFooter from '@/components/organisms/rental/RentalFooter.vue';
import RentalHeader from '@/components/organisms/rental/RentalHeader.vue';

export default {
  name: 'RentalStep1',
  components: {
    DateTime,
    PriceCalculator,
    RentalFooter,
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
  },
  initialData:{
    type: Object,
    default: () => ({})
  }
  },
  data() {
    return {
    rentedFromDate: this.initialData.rentedFromDate || "",
    rentedUntilDate: this.initialData.rentedUntilDate || "",
    selectedTime: this.initialData.selectedTime || "",
    selectedUntilTime: this.initialData.selectedUntilTime || "",
    currentTotalPrice: this.initialData.currentTotalPrice || 0
  };
  },
  methods: {
    handleDateUpdate(data) {
      this.rentedFromDate = data.rentedFromDate;
      this.rentedUntilDate = data.rentedUntilDate;
      this.selectedTime = data.rentedFromHour;
      this.selectedUntilTime = data.rentedUntilHour;
      
      // Emitir al componente padre
      this.$emit('update-dates', {
        rentedFromDate: this.rentedFromDate,
        rentedUntilDate: this.rentedUntilDate,
        selectedTime: this.selectedTime,
        selectedUntilTime: this.selectedUntilTime
      });
    },
    
    handleTotalUpdate(price) {
      this.currentTotalPrice = price;
      this.$emit('total-updated', price);
    },
    
    goToNextStep() {
    if (!this.rentedFromDate || !this.rentedUntilDate || !this.selectedTime || !this.selectedUntilTime) {
      // AGREGAR LAS ALERTAS QUE TENEMOS EN EL PROYECTO
      // aunque no se si es necesario porque el botón de continuar está deshabilitado, pero por las dudas
      alert("Por favor, completa todos los campos de fecha y hora");
      return;
    }
    
    // Guarda los datos con la estructura correcta antes de avanzar
    const rentalData = {
      rentedFromDate: this.rentedFromDate,
      rentedUntilDate: this.rentedUntilDate,
      selectedTime: this.selectedTime,
      selectedUntilTime: this.selectedUntilTime,
      currentTotalPrice: this.currentTotalPrice
    };
    
    localStorage.setItem('rentalData', JSON.stringify(rentalData));
    
    this.$emit('continue');
  }

  },
  mounted() {
    const savedData = localStorage.getItem('rentalData');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        this.rentedFromDate = data.rentedFromDate || "";
        this.rentedUntilDate = data.rentedUntilDate || "";
        this.selectedTime = data.selectedTime || "";
        this.selectedUntilTime = data.selectedUntilTime || "";
        this.currentTotalPrice = data.currentTotalPrice || 0;
      } catch (e) {
        console.error("Error al cargar datos guardados:", e);
      }
    }
  },
  watch: {
  initialData: {
    deep: true,
    handler(newData) {
      if (newData) {
        this.rentedFromDate = newData.rentedFromDate || "";
        this.rentedUntilDate = newData.rentedUntilDate || "";
        this.selectedTime = newData.selectedTime || "";
        this.selectedUntilTime = newData.selectedUntilTime || "";
        this.currentTotalPrice = newData.currentTotalPrice || 0;
      }
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
:disabled="rented"
:initialFromDate="rentedFromDate"
:initialUntilDate="rentedUntilDate"
:initialFromHour="selectedTime"
:initialUntilHour="selectedUntilTime"
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
      @continue="goToNextStep"
    />
  </div>
</template>