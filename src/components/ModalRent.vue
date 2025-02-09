<script>
import { isCarAlreadyRented, submitRentalRequest } from "../services/rentedCarService";
import { addAlert } from "../services/alerts";

export default {
  props: ["car", "loggedUser", "rented"],
  name: "ModalRent",
  data() {
    return {
      isVisible: false,
      today: new Date().toISOString().split("T")[0],
      rentedFromDate: "",
      rentedUntilDate: "",
      selectedTime: '00:00',
      selectedUntilTime: '00:00',
      timeOption: [],
    };
  },
  methods: {
    open() {
      this.isVisible = true;
    },
    close() {
      this.isVisible = false;
      this.rentedFromDate = "";
      this.rentedUntilDate = "";
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
          rented_from: this.rentedFromDate, // Fecha de recogida
          rented_until: this.rentedUntilDate, // Fecha de devolución
          selectedTime: this.selectedTime || '00:00',
          selectedUntilTime: this.selectedUntilTime || '00:00',
          status: "pendiente",
          rental_price: this.car.precio || null, // Precio calculado
        };

        await submitRentalRequest(rentalRequest);

        this.$emit('add-alert', 'Solicitud de alquiler enviada con éxito.', 'success');

      } catch (error) {
        addAlert("Error al enviar solicitud de alquiler", "error");
      }

      this.close();
      this.$router.push('/Profile');
    },
    timeOptions() {
      for (let hour = 0; hour < 24; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const formattedHour = hour < 10 ? '0' + hour : hour;
          const formattedMinute = minute < 10 ? '0' + minute : minute;
          this.timeOption.push(`${formattedHour}:${formattedMinute}`);
        }
      }
    }
  },
  mounted() {
    this.timeOptions();
  },
  computed: {
    // Horas disponibles para la fecha de recogida
    availableFromTimes() {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();

      return this.timeOption.filter(time => {
        if (this.rentedFromDate === this.today) {
          const [hour, minute] = time.split(':').map(Number);
          return hour > currentHour || (hour === currentHour && minute >= currentMinute);
        }
        return true; // Si no es hoy, todas las horas están disponibles
      });
    },
    // Horas disponibles para la fecha de devolución
    availableUntilTimes() {
      if (!this.rentedFromDate || !this.rentedUntilDate) {
        return [];
      }

      if (this.rentedFromDate === this.rentedUntilDate) {
        return this.timeOption.filter(time => time > this.selectedTime);
      }

      return this.timeOption; // Si las fechas son diferentes, todas las horas están disponibles
    },
    // Deshabilitar el selector de hora de recogida si no hay fecha de recogida
    isTimeDisabled() {
      return !this.rentedFromDate;
    },
    // Deshabilitar el selector de hora de devolución si no hay fecha de devolución
    isUntilTimeDisabled() {
      return !this.rentedUntilDate;
    }
  },
  watch: {
    // Observar cambios en la fecha de recogida
    rentedFromDate() {
      if (this.rentedFromDate === this.rentedUntilDate) {
        this.selectedUntilTime = this.timeOption.find(time => time > this.selectedTime) || '00:00';
      }
    },
    // Observar cambios en la hora de recogida
    selectedTime() {
      if (this.rentedFromDate === this.rentedUntilDate) {
        this.selectedUntilTime = this.timeOption.find(time => time > this.selectedTime) || '00:00';
      }
    }
  }
};
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    @click.self="close">
    <div class="bg-white rounded-lg p-6 shadow-lg max-w-md w-full">
      <h2 class="text-xl font-bold mb-4">Solicitar Alquiler</h2>
      <form @submit.prevent="submitRental">
        <!-- Fecha de inicio -->
        <div>
          <label for="rentedFromDate" class="block text-sm font-medium">Fecha de Inicio:</label>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <input type="date" id="rentedFromDate" v-model="rentedFromDate" required :min="today" class="mt-1 block w-full p-2 border border-gray-300 rounded" />

            <select id="time-select" v-model="selectedTime" :disabled="isTimeDisabled"
              class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-max-80 p-2.5">
              <option v-for="time in availableFromTimes" :key="time" :value="time">{{ time }}</option>
            </select>
          </div>
        </div>

        <!-- Fecha de Fin -->
        <div>
          <label for="rentedUntilDate" class="block text-sm font-medium">Fecha de Fin:</label>
          <div class="grid grid-cols-2 gap-4 mb-4">
            <input type="date" id="rentedUntilDate" v-model="rentedUntilDate" required :min="rentedFromDate" :disabled="isUntilDateDisabled"
              class="mt-1 block w-full p-2 border border-gray-300 rounded" />

              <select v-model="selectedUntilTime" :disabled="isUntilTimeDisabled" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-max-80 p-2.5">
                <option
                  v-for="time in availableUntilTimes"
                  :key="time"
                  :value="time"
                >
                  {{ time }}
                </option>
              </select>
              
          </div>
        </div>

        <div class="flex justify-end">
          <button type="button" @click="close" class="mr-2 text-gray-600">
            Cancelar
          </button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded">
            Enviar Solicitud
          </button>
        </div>
      </form>
    </div>
  </div>
</template>