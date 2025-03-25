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
      // Ajuste para zona horaria local
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
      if (minutes < 30) {
        return `${String(hours).padStart(2, '0')}:30`;
      } else {
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
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          this.rentedFromDate = tomorrow.toISOString().split("T")[0];
          this.availableHours = allHours;
          return;
        }
      } else {
        this.availableHours = allHours;
      }

      if (this.rentedFromHour && this.isPastTime(this.rentedFromDate, this.rentedFromHour)) {
        this.rentedFromHour = this.availableHours[0] || "";
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
      
      if (this.rentedUntilDate === this.rentedFromDate) {
        this.availableUntilHours = allHours.filter(h => h > this.rentedFromHour);
      } else {
        this.availableUntilHours = allHours;
      }

      const todayStr = this.getTodayDate();
      if (this.rentedUntilDate === todayStr) {
        const currentSlot = this.getCurrentTimeSlot();
        this.availableUntilHours = this.availableUntilHours.filter(hour => hour >= currentSlot);
      }

      if (!this.availableUntilHours.includes(this.rentedUntilHour)) {
        this.rentedUntilHour = this.availableUntilHours[0] || "";
      }
    },
  },
  watch: {
    rentedFromDate() {
      this.updateAvailableHours();
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
  }
};
</script>

<template>
  <div class="flex gap-4">
    <!-- Día y hora de retiro -->
    <div class="relative">
      <label class="block text-sm font-medium mb-1 text-white">Día y hora de retiro</label>
      <div class="flex items-center bg-[#343666] border border-gray-700 rounded-2xl p-4 text-white">
        <Calendar />

        <input
          type="date"
          v-model="rentedFromDate"
          :min="todayDate"
          class="bg-transparent text-white outline-none w-[130px] cursor-pointer"
        />

        <select
          v-model="rentedFromHour"
          class="bg-transparent text-white outline-none w-[90px]"
          :disabled="!rentedFromDate || availableHours.length === 0"
        >
          <option 
            v-for="hour in availableHours" 
            :key="hour" 
            :value="hour" 
            class="bg-[#DBFAFC] text-[#010440]"
            :disabled="rentedFromDate === todayDate && isPastTime(rentedFromDate, hour)"
          >
            {{ hour }}
          </option>
        </select>
      </div>
    </div>

    <!-- Día y hora de devolución -->
    <div class="relative">
      <label class="block text-sm font-medium mb-1 text-white">Día y hora de devolución</label>
      <div class="flex items-center bg-[#343666] border border-gray-700 rounded-2xl p-4 text-white">
        <Calendar />

        <input
          type="date"
          v-model="rentedUntilDate"
          :min="rentedFromDate || todayDate"
          class="bg-transparent text-white outline-none w-[130px] cursor-pointer"
          :disabled="!rentedFromDate"
        />

        <select
          v-model="rentedUntilHour"
          class="bg-transparent text-white outline-none w-[90px]"
          :disabled="!rentedUntilDate || availableUntilHours.length === 0"
        >
          <option 
            v-for="hour in availableUntilHours" 
            :key="hour" 
            :value="hour" 
            class="bg-[#DBFAFC] text-[#010440]"
          >
            {{ hour }}
          </option>
        </select>
      </div>
    </div>
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