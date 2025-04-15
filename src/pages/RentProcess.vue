<script>
// import DateTime from "@/components/organisms/rental/DateTime.vue";
// import PriceCalculator from "@/components/organisms/rental/PriceCalculator.vue";
// import RentalFooter from "@/components/organisms/rental/RentalFooter.vue";
// import { isCarAlreadyRented, submitRentalRequest } from "@services/rentedCarService";
// import { addAlert } from "@services/alerts";

// export default {
//   components: {
//     DateTime,
//     PriceCalculator,
//     RentalFooter
//   },
//   props: {
//     car: {
//       type: Object,
//       required: true,
//       validator: (value) => value && typeof value.precio === 'number'
//     },
//     loggedUser: {
//       type: Object,
//       required: true
//     },
//     rented: {
//       type: Boolean,
//       default: false
//     }
//   },
//   data() {
//     return {
//       rentedFromDate: "",
//       rentedUntilDate: "",
//       selectedTime: "",
//       selectedUntilTime: "",
//       currentTotalPrice: 0,
//       showConfirmation: false
//     };
//   },
//   methods: {
//     handleDateUpdate({ rentedFromDate, rentedUntilDate, rentedFromHour, rentedUntilHour }) {
//       this.rentedFromDate = rentedFromDate || "";
//       this.rentedUntilDate = rentedUntilDate || "";
//       this.selectedTime = rentedFromHour || "";
//       this.selectedUntilTime = rentedUntilHour || "";
//     },
    
//     handleTotalUpdate(total) {
//       this.currentTotalPrice = Number(total); 
//     },
    
//     goToConfirmation() {
//       if (this.validateRentalData()) {
//         this.showConfirmation = true;
//         this.$emit('hide-map');
//       }
//     },
    
//     async submitRental() {
//       try {
//         if (await isCarAlreadyRented(this.car.id)) {
//           addAlert("Este auto ya está alquilado", "info");
//           return;
//         }
        
//         await submitRentalRequest(this.prepareRentalData());
//         addAlert("Solicitud enviada con éxito", "success");
//         this.$router.push("/profile");
//       } catch (error) {
//         console.error("Error:", error);
//         addAlert("Error al enviar solicitud", "error");
//       }
//     },
    
//     validateRentalData() {
//       if (!this.rentedFromDate || !this.rentedUntilDate) {
//         addAlert("Selecciona fechas válidas", "error");
//         return false;
//       }
      
//       if (new Date(this.rentedFromDate) > new Date(this.rentedUntilDate)) {
//         addAlert("La fecha de fin debe ser posterior", "error");
//         return false;
//       }
      
//       return true;
//     },
    
//     prepareRentalData() {
//       return {
//         car_id: this.car.id,
//         owner_id: this.car.user_id,
//         user_id: this.loggedUser.id,
//         rented_from: `${this.rentedFromDate}T${this.selectedTime}:00`,
//         rented_until: `${this.rentedUntilDate}T${this.selectedUntilTime}:00`,
//         status: "pendiente",
//         rental_price: this.calculateTotalPrice()
//       };
//     },
    
//     calculateTotalPrice() {
//       if (!this.rentedFromDate || !this.rentedUntilDate) return 0;
      
//       const start = new Date(`${this.rentedFromDate}T${this.selectedTime}`);
//       const end = new Date(`${this.rentedUntilDate}T${this.selectedUntilTime}`);
//       const hours = (end - start) / (1000 * 60 * 60);
//       const days = Math.ceil(hours / 24);
      
//       return days * this.car.precio;
//     }
//   }
// };
</script>

<template>
  <!-- <div class="space-y-6">
    <DateTime 
      @update-dates="handleDateUpdate" 
      :disabled="rented || showConfirmation" 
    />
    
    <PriceCalculator
      v-if="!showConfirmation"
      :start-date="rentedFromDate"
      :start-time="selectedTime"
      :end-date="rentedUntilDate"
      :end-time="selectedUntilTime"
      :daily-price="car.precio"
      @total-updated="handleTotalUpdate"
    />
    
    <div v-if="showConfirmation" class="confirmation-view p-4 bg-blue-50 rounded-lg">
      <h3 class="text-lg font-bold mb-2">Resumen de tu reserva</h3>
      <div class="space-y-2">
        <p><span class="font-semibold">Desde:</span> {{ rentedFromDate }} {{ selectedTime }}</p>
        <p><span class="font-semibold">Hasta:</span> {{ rentedUntilDate }} {{ selectedUntilTime }}</p>
        <p><span class="font-semibold">Total:</span> ${{ currentTotalPrice.toLocaleString() }}</p>
      </div>
    </div>
    
    <RentalFooter 
      :total-amount="currentTotalPrice"
      :button-text="showConfirmation ? 'Confirmar reserva' : 'Siguiente'"
      :is-disabled="!rentedFromDate || !rentedUntilDate || rented"
      :is-confirmation="showConfirmation"
      @continue="goToConfirmation"
      @confirm="submitRental"
    />
  </div> -->
</template>
