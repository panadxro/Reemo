<script>
export default {
  props: {
    min: {
      type: Number,
      default: 0,
    },
    max: {
      type: Number,
      default: 100000,
    },
    modelValue: {
      type: Object,
      required: true,
    },
    
  },
  data() {
    return {
      // minValue: this.min,
      // maxValue: this.max,
    };
  },
  computed: {
    rangeStyle() {
      const minPercent = ((this.minValue - this.min) / (this.max - this.min)) * 100;
      const maxPercent = ((this.maxValue - this.min) / (this.max - this.min)) * 100;
      return {
        left: `${minPercent}%`,
        width: `${maxPercent - minPercent}%`,
      };
    },
    minLabelStyle() {
      const minPercent = ((this.minValue - this.min) / (this.max - this.min)) * 100;
      return {
        left: `${minPercent}%`,
        transform: 'translateX(-50%)',
      };
    },
    maxLabelStyle() {
      const maxPercent = ((this.maxValue - this.min) / (this.max - this.min)) * 100;
      return {
        left: `${maxPercent}%`,
        transform: 'translateX(-50%)',
      };
    },
    minDotStyle() {
      const minPercent = ((this.minValue - this.min) / (this.max - this.min)) * 100;
      return {
        left: `${minPercent}%`,
        transform: 'translateX(-50%)',
      };
    },
    maxDotStyle() {
      const maxPercent = ((this.maxValue - this.min) / (this.max - this.min)) * 100;
      return {
        left: `${maxPercent}%`,
        transform: 'translateX(-50%)',
      };
    },

    minValue: {
      get() {
        return this.modelValue.minPrice;
      },
      set(val) {
        this.$emit('update:modelValue', { ...this.modelValue, minPrice: val });
      }
    },
    maxValue: {
      get() {
        return this.modelValue.maxPrice;
      },
      set(val) {
        this.$emit('update:modelValue', { ...this.modelValue, maxPrice: val });
      }
    },

  },
  methods: {
    updateMin(event) {
      this.minValue = Math.min(Number(event.target.value), this.maxValue);
    },
    updateMax(event) {
      this.maxValue = Math.max(Number(event.target.value), this.minValue);
    },
  },
};
</script>

<template>
  <div class="price-range-slider">
    <div class="slider-container">
      <!-- Barra de fondo -->
      <div class="slider-track"></div>

      <!-- Rango seleccionado -->
      <div class="slider-range" :style="rangeStyle"></div>

      <!-- Inputs para los thumbs -->
      <input
        type="range"
        v-model="minValue"
        step="5000"
        :min="min"
        :max="max"
        @input="updateMin"
        class="slider-thumb min-thumb cursor-pointer"
      />
      <input
        type="range"
        v-model="maxValue"
        step="5000"
        :min="min"
        :max="max"
        @input="updateMax"
        class="slider-thumb max-thumb"
      />

      <!-- Labels de precio -->
      <span class="value-label min-value" :style="minLabelStyle">{{ minValue }}$</span>
      <span class="value-label max-value" :style="maxLabelStyle">{{ maxValue }}$</span>

      <!-- Bolitas en los extremos -->
      <div class="slider-end-dot min-dot" :style="minDotStyle"></div>
      <div class="slider-end-dot max-dot" :style="maxDotStyle"></div>
    </div>
  </div>
</template>

<style scoped>
.price-range-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 85%;
  max-width: 400px;
  margin: 0 auto;
}

.slider-container {
  position: relative;
  width: 100%;
  height: 8px;
  margin-top: 50px;
}

.slider-track {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background-color: #35353528;
  border-radius: 2px;
  transform: translateY(-50%);
}

.slider-range {
  position: absolute;
  top: 50%;
  height: 4px;
  background-color: #4fd8df; /* Color del rango seleccionado */
  border-radius: 2px;
  transform: translateY(-50%);
}

.slider-thumb {
  position: absolute;
  top: 50%;
  width: 100%;
  height: 8px;
  margin: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%);
  z-index: 2;
}

.slider-thumb::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 25px;
  height: 25px;
  background-color: #42b983;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all; /* Permitir arrastre solo en los thumbs */
}

.slider-thumb::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background-color: #42b983;
  border-radius: 50%;
  cursor: pointer;
  pointer-events: all; /* Permitir arrastre solo en los thumbs */
}

.value-label {
  position: absolute;
  top: -45px; /* Posición arriba del thumb */
  font-size: 12px;
  color: #010440;
  background-color: #4fd8df;
  padding-inline: 16px;
  padding-block: 8px;
  white-space: nowrap;
  transform: translateX(-50%);
  border-radius: 12px;
  font-weight: bolder;
}

.min-value {
  left: 0;
}

.max-value {
  left: 100%;
}

.slider-end-dot {
  position: absolute;
  top: -5px;
  width: 16px;
  height: 16px;
  background-color: #ffffff;
  border: #4fd8df solid 4px;
  border-radius: 50%;
  transform: translateY(-50%);
}

.min-dot {
  left: 0;
}

.max-dot {
  right: 0;
}
</style>