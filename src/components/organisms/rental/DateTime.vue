<script>
import Calendar from '../../atoms/Calendar.vue';

export default {
  components: {
    Calendar,
  },
  data() {
    return {
      todayDate: this.getTodayDate(),
      rentedFromDate: this.getTodayDate(),
      rentedFromHour: "",
      rentedUntilDate: "",
      rentedUntilHour: "",
      availableHours: [],
      availableUntilHours: [],
    };
  },
  methods: {
    getTodayDate() {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      today.setMinutes(today.getMinutes() - offset);
      return today.toISOString().split("T")[0];
    },
    generateTimeOptions() {
      let hours = [];
      for (let h = 0; h < 24; h++) {
        for (let m of ["00", "30"]) {
          hours.push(`${String(h).padStart(2, "0")}:${m}`);
        }
      }
      return hours;
    },
    isPastTime(selectedDate, selectedTime) {
      const now = new Date();
      const [hours, minutes] = selectedTime.split(':').map(Number);
      const selectedDateTime = new Date(selectedDate);
      selectedDateTime.setHours(hours, minutes, 0, 0);
      return selectedDateTime < now;
    },
    getCurrentTimeSlot() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    // Redondear al siguiente intervalo de 30 minutos
    if (minutes < 30) {
      return `${String(hours).padStart(2, '0')}:30`;
    } else {
      // Si pasamos de 30 minutos, avanzamos a la hora siguiente
      return `${String(hours + 1).padStart(2, '0')}:00`;
    }
  },

  updateAvailableHours() {
    if (!this.rentedFromDate) {
      this.availableHours = [];
      this.rentedFromHour = "";
      return;
    }

    const now = new Date();
    const allHours = this.generateTimeOptions();
    const todayStr = this.getTodayDate();

    if (this.rentedFromDate === todayStr) {
      const currentSlot = this.getCurrentTimeSlot();
      this.availableHours = allHours.filter(hour => hour >= currentSlot);
      
      if (this.availableHours.length === 0) {
        // Si no hay horas disponibles hoy, avanzamos al día siguiente
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.rentedFromDate = tomorrow.toISOString().split("T")[0];
        this.availableHours = allHours;
        this.rentedFromHour = this.availableHours[0];
        return;
      }
    } else {
      // Para días futuros, mostramos todas las horas
      this.availableHours = allHours;
    }

    // Si la hora seleccionada no está disponible, la reseteamos
    if (!this.availableHours.includes(this.rentedFromHour) || !this.rentedFromHour) {
      this.rentedFromHour = this.availableHours[0];
    }

    this.updateAvailableUntilHours();
  },

  updateAvailableUntilHours() {
    if (!this.rentedUntilDate || !this.rentedFromHour) {
      this.availableUntilHours = [];
      this.rentedUntilHour = "";
      return;
    }

    const allHours = this.generateTimeOptions();
    const todayStr = this.getTodayDate();
    
    // Si es el mismo día, solo horas después de la hora de retiro
    if (this.rentedUntilDate === this.rentedFromDate) {
      this.availableUntilHours = allHours.filter(h => h > this.rentedFromHour);
    } 
    // Si es un día diferente
    else {
      // Si es hoy, solo horas futuras
      if (this.rentedUntilDate === todayStr) {
        const currentSlot = this.getCurrentTimeSlot();
        this.availableUntilHours = allHours.filter(hour => hour >= currentSlot);
      } 
      // Si es un día futuro
      else {
        this.availableUntilHours = allHours;
      }
    }

    // Si la hora seleccionada no está disponible, la reseteamos
    if (!this.availableUntilHours.includes(this.rentedUntilHour) || !this.rentedUntilHour) {
      this.rentedUntilHour = this.availableUntilHours[0] || "";
    }
  },
  },
  watch: {
    rentedFromDate(newFromDate) {
    this.updateAvailableHours();
    
    if (this.rentedUntilDate && newFromDate) {
      const fromDate = new Date(newFromDate);
      const untilDate = new Date(this.rentedUntilDate);
      
      if (fromDate > untilDate) {
        this.rentedUntilDate = '';
      }
    }
  },
    rentedFromHour() {
      this.updateAvailableUntilHours();
    },
    rentedUntilDate() {
      this.updateAvailableUntilHours();
    }
  },
  mounted() {
  this.updateAvailableHours();
  if (this.rentedFromDate === this.todayDate && this.availableHours.length > 0) {
    this.rentedFromHour = this.availableHours[0];
  }
}
};
</script>

<template>
  <div>
    <div class="flex gap-8 justify-between">
      <!-- Día y hora de retiro -->
      <div class="">
        <label class="block text-sm font-medium mb-1 text-white">Día y hora de retiro</label>
        <div class="flex items-center bg-[#343666] border border-gray-700 rounded-2xl p-4 text-white">
          <Calendar />
  
          <input type="date" v-model="rentedFromDate" :min="todayDate"
            class="bg-transparent text-white outline-none w-[130px] cursor-pointer" />
  
          <select v-model="rentedFromHour" class="bg-transparent text-white outline-none w-[90px]"
            :disabled="!rentedFromDate || availableHours.length === 0">
            <option v-for="hour in availableHours" :key="hour" :value="hour" class="bg-[#DBFAFC] text-[#010440]">
              {{ hour }}
            </option>
          </select>
        </div>
      </div>
  
      <!-- Día y hora de devolución -->
      <div class="">
        <label class="block text-sm font-medium mb-1 text-white">Día y hora de devolución</label>
        <div class="flex items-center bg-[#343666] border border-gray-700 rounded-2xl p-4 text-white">
          <Calendar />
  
          <input type="date" v-model="rentedUntilDate" :min="rentedFromDate || todayDate"
            class="bg-transparent text-white outline-none w-[130px] cursor-pointer" :disabled="!rentedFromDate" />
  
          <select v-model="rentedUntilHour" class="bg-transparent text-white outline-none w-[90px]"
            :disabled="!rentedUntilDate || availableUntilHours.length === 0">
            <option v-for="hour in availableUntilHours" :key="hour" :value="hour" class="bg-[#DBFAFC] text-[#010440]">
              {{ hour }}
            </option>
          </select>
        </div>
      </div>
    </div>
  
      <section class="my-8 mx-2 flex flex-col gap-4">
        <div class="text-white flex justify-between">
          <p>Tiempo Total</p>
          <p>$</p>
        </div>
        <div class="text-white flex justify-between">
          <p>Precio</p>
          <p>$</p>
        </div>
        <div class="text-white flex justify-between">
          <p>Impuestos</p>
          <p>$</p>
        </div>
        <div class="text-white flex justify-between">
          <p>Seguro</p>
          <p>$</p>
        </div>
      </section>
  </div>
  
</template>

<style scoped>
input[type="date"] {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
}

input[type="date"]::-webkit-calendar-picker-indicator {
  opacity: 0;
  width: 100%;
  position: absolute;
}
</style>



