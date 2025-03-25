  <script>
  import DateTime from "@/components/organisms/rental/DateTime.vue";
  import { isCarAlreadyRented, submitRentalRequest } from "@services/rentedCarService";
  import { addAlert } from "@services/alerts";
  
  export default {
    components: {
      DateTime,
    },
    props: ["car", "loggedUser", "rented"],
    data() {
      return {
        rentedFromDate: "",
        rentedUntilDate: "",
        selectedTime: "00:00",
        selectedUntilTime: "00:00",
      };
    },
    methods: {
      handleDateUpdate(dates) {
        this.rentedFromDate = dates.rentedFromDate;
        this.rentedUntilDate = dates.rentedUntilDate;
        this.selectedTime = dates.selectedTime;
        this.selectedUntilTime = dates.selectedUntilTime;
      },
      async submitRental() {
        if (!this.car || !this.loggedUser || !this.rentedFromDate || !this.rentedUntilDate) {
          addAlert("Por favor, completa todos los campos.", "error");
          return;
        }
  
        if (this.rentedFromDate > this.rentedUntilDate) {
          addAlert("La fecha de fin debe ser posterior a la fecha de inicio.", "error");
          return;
        }
  
        if (this.rentedFromDate === this.rentedUntilDate && this.selectedTime >= this.selectedUntilTime) {
          addAlert("La hora de fin debe ser posterior a la hora de inicio.", "error");
          return;
        }
  
        try {
          const alreadyRented = await isCarAlreadyRented(this.car.id);
  
          if (alreadyRented) {
            addAlert("Este auto ya está alquilado", "info");
            return;
          }
  
          const rentalRequest = {
            car_id: this.car.id,
            rented: false,
            owner_id: this.car.user_id,
            user_id: this.loggedUser.id,
            rented_from: this.rentedFromDate,
            rented_until: this.rentedUntilDate,
            selectedTime: this.selectedTime,
            selectedUntilTime: this.selectedUntilTime,
            status: "pendiente",
            rental_price: this.car.precio || null,
          };
  
          await submitRentalRequest(rentalRequest);
  
          addAlert("Solicitud de alquiler enviada con éxito.", "success");
          this.$router.push("/profile");
        } catch (error) {
          addAlert("Error al enviar solicitud de alquiler", "error");
        }
      },
    },
  };
  </script>

<template>
      <DateTime @update-dates="handleDateUpdate" />
      <div class="flex justify-end mt-4">
        <button
          @click="submitRental"
          class="bg-blue-600 text-white px-4 py-2 rounded-sm"
        >
          Enviar Solicitud
        </button>
      </div>
  </template>