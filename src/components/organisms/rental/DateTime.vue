<script>
import Calendar from '../../atoms/Calendar.vue';

export default {
  components: { Calendar },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    // Nuevos props para poder inicializar con valores
    initialFromDate: {
      type: String,
      default: ""
    },
    initialUntilDate: {
      type: String,
      default: ""
    },
    initialFromHour: {
      type: String,
      default: ""
    },
    initialUntilHour: {
      type: String,
      default: ""
    }
  },
  data() {
    const today = this.getTodayDate();
    return {
      todayDate: today,
      rentedFromDate: this.initialFromDate || today,
      rentedFromHour: this.initialFromHour || "",
      rentedUntilDate: this.initialUntilDate || "",
      rentedUntilHour: this.initialUntilHour || "",
      availableHours: [],
      availableUntilHours: []
    };
  },
  methods: {
    getTodayDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    },
    
    generateTimeOptions() {
      return Array.from({ length: 48 }, (_, i) => {
        const hours = Math.floor(i / 2);
        const mins = (i % 2) * 30;
        return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
      });
    },
    
    getCurrentTimeSlot() {
      const now = new Date();
      const hours = now.getHours();
      return now.getMinutes() < 30 
        ? `${String(hours).padStart(2, '0')}:30`
        : `${String(hours + 1).padStart(2, '0')}:00`;
    },
    
    updateAvailableHours() {
      // Si está deshabilitado y tenemos valores iniciales, configurarlos manualmente
      if (this.disabled) {
        const allHours = this.generateTimeOptions();
        this.availableHours = allHours;
        this.availableUntilHours = allHours;
        
        // Si hay datos almacenados en localStorage, usarlos
        const savedData = localStorage.getItem('rentalData');
        if (savedData) {
          const data = JSON.parse(savedData);
          this.rentedFromDate = data.rentedFromDate || this.rentedFromDate;
          this.rentedUntilDate = data.rentedUntilDate || this.rentedUntilDate;
          this.rentedFromHour = data.selectedTime || this.rentedFromHour;
          this.rentedUntilHour = data.selectedUntilTime || this.rentedUntilHour;
          
          // Forzar que availableHours contenga estos valores
          if (!this.availableHours.includes(this.rentedFromHour)) {
            this.availableHours.push(this.rentedFromHour);
          }
          if (!this.availableUntilHours.includes(this.rentedUntilHour)) {
            this.availableUntilHours.push(this.rentedUntilHour);
          }
          
          this.emitDates();
        }
        return;
      }
      
      // Lógica normal cuando no está deshabilitado
      if (!this.rentedFromDate) {
        this.availableHours = [];
        this.rentedFromHour = "";
        return;
      }
      
      const allHours = this.generateTimeOptions();
      const isToday = this.rentedFromDate === this.todayDate;
      
      this.availableHours = isToday 
        ? allHours.filter(h => h >= this.getCurrentTimeSlot())
        : allHours;
      
      if (this.availableHours.length === 0 && isToday) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        this.rentedFromDate = tomorrow.toISOString().split('T')[0];
        this.availableHours = allHours;
      }
      
      this.rentedFromHour = this.availableHours.includes(this.rentedFromHour) 
        ? this.rentedFromHour 
        : this.availableHours[0] || "";
      
      this.updateAvailableUntilHours();
    },
    
    updateAvailableUntilHours() {
      if (this.disabled) {
        return; // Si está deshabilitado, ya lo manejamos en updateAvailableHours
      }
      
      if (!this.rentedUntilDate || !this.rentedFromHour) {
        this.availableUntilHours = [];
        this.rentedUntilHour = "";
        return;
      }
      
      const allHours = this.generateTimeOptions();
      const isSameDay = this.rentedUntilDate === this.rentedFromDate;
      
      this.availableUntilHours = isSameDay
        ? allHours.filter(h => h > this.rentedFromHour)
        : allHours;
      
      this.rentedUntilHour = this.availableUntilHours.includes(this.rentedUntilHour)
        ? this.rentedUntilHour
        : this.availableUntilHours[0] || "";
    },
    
    emitDates() {
      this.$emit('update-dates', {
        rentedFromDate: this.rentedFromDate,
        rentedUntilDate: this.rentedUntilDate,
        rentedFromHour: this.rentedFromHour,
        rentedUntilHour: this.rentedUntilHour
      });
    }
  },
  watch: {
    rentedFromDate(newDate, oldDate) {
      if (!this.disabled && this.rentedUntilDate && newDate > this.rentedUntilDate) {
        this.rentedUntilDate = "";
        this.rentedUntilHour = "";
      }
      this.updateAvailableHours();
      this.emitDates();
    },
    rentedUntilDate() {
      this.updateAvailableUntilHours();
      this.emitDates();
    },
    rentedFromHour() {
      this.updateAvailableUntilHours();
      this.emitDates();
    },
    rentedUntilHour() {
      this.emitDates();
    },
    disabled(newVal) {
      this.updateAvailableHours();
    }
  },
  mounted() {
    this.updateAvailableHours();
  }
};
</script>

<template>
  <div class="flex flex-col md:flex-row gap-4">
    <!-- Retiro -->
    <div class="flex-1">
      <label class="block text-sm font-medium mb-1 text-white">Retiro</label>
      <div class="flex items-center bg-[#343666] border border-gray-700 rounded-2xl p-3"
           :class="{ 'opacity-80': disabled }">
        <div class="flex items-center gap-2 flex-1">
          <Calendar />
          <input 
            type="date" 
            v-model="rentedFromDate" 
            :min="todayDate"
            :disabled="disabled"
            class="bg-transparent text-white outline-none cursor-pointer w-full"
            :class="{ 'cursor-not-allowed': disabled }"
          />
        </div>
        
        <select 
          v-model="rentedFromHour" 
          :disabled="!rentedFromDate || disabled || availableHours.length === 0"
          class="bg-transparent text-white outline-none"
          :class="{ 'cursor-not-allowed': disabled }"
        >
          <option 
            v-for="hour in availableHours" 
            :key="hour" 
            :value="hour"
            class="bg-[#DBFAFC] text-[#010440]"
          >
            {{ hour }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- Devolución -->
    <div class="flex-1">
      <label class="block text-sm font-medium mb-1 text-white">Devolución</label>
      <div class="flex items-center bg-[#343666] border border-gray-700 rounded-2xl p-3"
           :class="{ 'opacity-80': disabled }">
        <div class="flex items-center gap-2 flex-1">
          <Calendar />
          <input 
            type="date" 
            v-model="rentedUntilDate" 
            :min="rentedFromDate || todayDate"
            :disabled="!rentedFromDate || disabled"
            class="bg-transparent text-white outline-none cursor-pointer w-full"
            :class="{ 'cursor-not-allowed': disabled }"
          />
        </div>
        
        <select 
          v-model="rentedUntilHour" 
          :disabled="!rentedUntilDate || disabled || availableUntilHours.length === 0"
          class="bg-transparent text-white outline-none"
          :class="{ 'cursor-not-allowed': disabled }"
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

input[disabled], select[disabled] {
  opacity: 0.8;
  cursor: not-allowed;
}
</style>