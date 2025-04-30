<script>
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
      // Porcentaje de impuestos a aplicar al precio base
      // Por ahora lo dejo en 10% pero lo podemos cambiar
      type: Number,
      default: 0.21
    },
    insuranceFee: {
      // Despues ver cuanto es el seguro
      // Por ahora lo dejo en 25000
      type: Number,
      default: 25000
    }
  },
  computed: {
    priceHours() {
      return this.dailyPrice / 24;
    },
    rentalHours() {
      if (!this.startDate || !this.endDate) return 0;

      try {
        const start = new Date(`${this.startDate}T${this.startTime || '00:00'}`);
        const end = new Date(`${this.endDate}T${this.endTime || '00:00'}`);
        return Math.max(0, (end - start) / (1000 * 60 * 60));
      } catch {
        return 0;
      }
    },
    // rentalDays() {
    //   return Math.ceil(this.rentalHours / 24);
    // },
    basePrice() {
      return this.rentalHours * this.priceHours;
    },
    taxes() {
      return this.basePrice * this.taxRate;
    },
    totalPrice() {
      const total = this.basePrice + this.taxes + this.insuranceFee;
      return Number(total.toFixed());
    },
    // funcion para que en vez de mostrar 12.5 horas por ejemplo, muestre 12:30 y si te pasas de un día por ejemplo. muestre 1 día y 12:30 hs
    formatRentalTime() {
      return (hours) => {
        const days = Math.floor(hours / 24);
        const remainingHours = Math.floor(hours % 24);
        const minutes = (hours % 1) * 60;

        let timeString = "";

        if (days > 0) {
          timeString += `${days} día${days > 1 ? 's' : ''} `;
        }

        if (remainingHours > 0 || minutes > 0) {
          timeString += `${remainingHours}${minutes === 30 ? ':30 hs' : ' hs'}`;
        }

        return timeString.trim();
      };
    }
  },
  watch: {
    totalPrice(newVal) {
      this.$emit('total-updated', newVal);
    }
  },

  mounted() {
    this.$emit('total-updated', this.totalPrice);
  }
};
</script>

<template>
  <div class="px-4 ">
    <div class="space-y-2 text-white">

      <div class="flex justify-between pt-2">
        <span>Tiempo total</span>
        <span v-if="startDate && endDate">
          {{ formatRentalTime(rentalHours) }}
        </span>
        <span v-else class="text-gray-400">-</span>
      </div>


      <!-- <div class="flex justify-between pt-2">
        <span>Tarifa por hora</span>
        <span>${{ priceHours.toFixed(2) }}</span>
      </div> -->

      <!-- <div class="flex justify-between pt-2">
        <span>Tarifa diaria</span>
        <span>${{ (dailyPrice || 0).toLocaleString() }}</span>
      </div> -->

      <div class="flex justify-between pt-2">
        <span>Precio</span>
        <span v-if="startDate && endDate">${{ basePrice.toFixed().toLocaleString() }}</span>
        <span v-else class="text-gray-400">$0</span>
      </div>

      <div class="flex justify-between pt-2">
        <span>Impuestos</span>
        <span v-if="startDate && endDate">${{ taxes.toFixed().toLocaleString() }}</span>
        <span v-else class="text-gray-400">$0</span>
      </div>

      <div class="flex justify-between pt-2">
        <span>Seguro</span>
        <span>${{ insuranceFee.toLocaleString() }}</span>
      </div>

      <!-- <div class="flex justify-between pt-2 font-bold text-lg border-t border-background-600">
        <span>Total</span>
        <span v-if="startDate && endDate">${{ totalPrice }}</span> -->
      <!-- <span v-else>${{ insuranceFee.toLocaleString() }}</span> -->
      <!-- <span v-else>-</span> -->
      <!-- </div> -->
    </div>
  </div>
</template>