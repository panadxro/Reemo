<script>
import Calendar from '../../atoms/Calendar.vue';
import { useRentalStore } from '@/stores/rent.store.js';
import { mapState, mapGetters } from 'pinia';

export default {
  components: { Calendar },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
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
      availableUntilHours: [],
      initialSync: false
    };
  },
  computed: {
    ...mapState(useRentalStore, ['rentalData', 'car']),
    ...mapGetters(useRentalStore, ['storageKey'])
  },
  methods: {
    rentalStore() {
      return useRentalStore();
    },

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
      // Si está deshabilitado y tenemos valores iniciales, configurar con los datos del store
      if (this.disabled) {
        const allHours = this.generateTimeOptions();
        this.availableHours = allHours;
        this.availableUntilHours = allHours;
        
        // Sincronizar con los datos del store si estamos deshabilitados
        this.syncFromStore();
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
    
    updateInputs(values) {
      this.rentedFromDate = values.rentedFromDate;
      this.rentedUntilDate = values.rentedUntilDate;
      this.rentedFromHour = values.rentedFromHour;
      this.rentedUntilHour = values.rentedUntilHour;
    },
    
    emitDates() {
      const dateData = {
        rentedFromDate: this.rentedFromDate,
        rentedUntilDate: this.rentedUntilDate,
        rentedFromHour: this.rentedFromHour,
        rentedUntilHour: this.rentedUntilHour
      };
      
      // Emitir evento para el componente padre
      this.$emit('update-dates', dateData);
      
      // Actualizar el store
      this.rentalStore().handleDateUpdate(dateData);
    },
    
    syncFromStore() {
      // Solo sincronizar si tenemos un vehículo
      if (this.car && this.car.id && this.rentalData) {
        console.log(`Sincronizando datos del vehículo ${this.car.id} desde el store:`, this.rentalData);
        
        // Preparar todas las horas posibles
        const allHours = this.generateTimeOptions();
        this.availableHours = [...allHours];
        this.availableUntilHours = [...allHours];
        
        // Actualizar fechas desde el store
        if (this.rentalData.rentedFromDate) {
          this.rentedFromDate = this.rentalData.rentedFromDate;
        }
        
        if (this.rentalData.rentedUntilDate) {
          this.rentedUntilDate = this.rentalData.rentedUntilDate;
        }
        
        if (this.rentalData.selectedTime) {
          this.rentedFromHour = this.rentalData.selectedTime;
        }
        
        if (this.rentalData.selectedUntilTime) {
          this.rentedUntilHour = this.rentalData.selectedUntilTime;
        }

        // Después de sincronizar, actualizar horas disponibles para respetar las reglas
        this.updateAvailableUntilHours();
      } else {
        console.log('No hay datos o coche para sincronizar');
      }
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
    },
    // Observar cuando cambia el coche en el store para resetear y sincronizar los datos
    'car.id': {
      handler(newId, oldId) {
        if (newId !== oldId) {
          console.log(`Cambio de vehículo detectado: ${oldId} -> ${newId}`);
          this.syncFromStore();
        }
      },
      immediate: true
    }
  },
  mounted() {
    // Sincronizar con el store al montar el componente
    this.$nextTick(() => {
      this.syncFromStore();
      this.updateAvailableHours();
    });
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