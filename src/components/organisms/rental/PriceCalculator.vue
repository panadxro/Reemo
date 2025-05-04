<script>
import { useRentalStore } from '@/stores/rent.store.js';
import { useCarStore } from '@/stores/car.store.js';
import { computed, watch, onMounted } from 'vue';

export default {
  props: {
    startDate: String,
    startTime: String,
    endDate: String,
    endTime: String,
    dailyPrice: {
      type: Number,
      required: true,
      default: 0,
      validator: value => !isNaN(value)
    },
    taxRate: {
      type: Number,
      default: 0.21
    },
    insuranceFee: {
      type: Number,
      default: 25000
    },
    showTotal: {
      type: Boolean,
      default: true
    }
  },
  
  setup(props, { emit }) {
    const rentalStore = useRentalStore();
    const carStore = useCarStore();
    
    const priceHours = computed(() => props.dailyPrice / 24);
    
    const rentalHours = computed(() => {
      if (!props.startDate || !props.endDate) return 0;

      try {
        const start = new Date(`${props.startDate}T${props.startTime || '00:00'}`);
        const end = new Date(`${props.endDate}T${props.endTime || '00:00'}`);
        return Math.max(0, (end - start) / (1000 * 60 * 60));
      } catch {
        return 0;
      }
    });
    
    const basePrice = computed(() => rentalHours.value * priceHours.value);
    
    const taxes = computed(() => basePrice.value * props.taxRate);
    
    const totalPrice = computed(() => {
      const total = basePrice.value + taxes.value + props.insuranceFee;
      return Number(total.toFixed());
    });
    
    // Format methods
    const formatRentalTime = (hours) => {
      if (!hours) return '';
      
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      const minutes = Math.round((hours % 1) * 60);

      let timeString = "";

      if (days > 0) {
        timeString += `${days} día${days > 1 ? 's' : ''} `;
      }

      if (remainingHours > 0 || minutes > 0) {
        if (minutes === 30) {
          timeString += `${remainingHours}:30 hs`;
        } else if (minutes > 0) {
          timeString += `${remainingHours} hs ${minutes} min`;
        } else {
          timeString += `${remainingHours} hs`;
        }
      }

      return timeString.trim();
    };
    
    const formatPrice = (price) => {
      return Math.round(price).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    };
    
    watch([() => props.startDate, () => props.endDate, () => props.startTime, () => props.endTime], 
      ([newStartDate, newEndDate, newStartTime, newEndTime]) => {
        if (newStartDate && newEndDate) {
          rentalStore.handleDateUpdate({
            rentedFromDate: newStartDate,
            rentedUntilDate: newEndDate,
            rentedFromHour: newStartTime || '00:00',
            rentedUntilHour: newEndTime || '00:00'
          });
        }
      }
    );

    watch(() => carStore.car.id, (newId, oldId) => {
  if (newId !== oldId) {
    // Re-calcular precio al cambiar de auto
    emit('total-updated', totalPrice.value);
  }
}, { immediate: true });
    
    watch(totalPrice, (newVal) => {
      emit('total-updated', newVal);
    });
    
    onMounted(() => {
      emit('total-updated', totalPrice.value);
      
      
    });
    
    return {
      rentalStore,
      rentalHours,
      basePrice,
      taxes,
      totalPrice,
      priceHours,
      formatRentalTime,
      formatPrice
    };
  }
};
</script>

<template>
  <div class="px-4">
    <div class="space-y-2 text-white">
      <div class="flex justify-between pt-2">
        <span>Tiempo total</span>
        <span v-if="startDate && endDate">
          {{ formatRentalTime(rentalHours) }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </div>

      <div class="flex justify-between pt-2">
        <span>Precio</span>
        <span v-if="startDate && endDate">${{ formatPrice(basePrice) }}</span>
        <span v-else class="text-gray-400">$0</span>
      </div>

      <div class="flex justify-between pt-2">
        <span>Impuestos</span>
        <span v-if="startDate && endDate">${{ formatPrice(taxes) }}</span>
        <span v-else class="text-gray-400">$0</span>
      </div>

      <div class="flex justify-between pt-2">
        <span>Seguro</span>
        <span>${{ formatPrice(insuranceFee) }}</span>
      </div>

      <div v-if="showTotal" class="flex justify-between pt-2 font-bold text-lg border-t border-background-600">
        <span>Total</span>
        <span v-if="startDate && endDate">${{ formatPrice(totalPrice) }}</span>
        <span v-else class="text-gray-400">-</span>
      </div>
    </div>
  </div>
</template>