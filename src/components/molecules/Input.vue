<script setup>
import { computed, ref, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  type: {
    type: String,
    default: 'text'
  },
  id: String,
  name: String,
  placeholder: String,
  iconPosition: {
    type: String,
    default: 'left', // Puede ser 'left' o 'right'
    validator: (value) => ['left', 'right'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary', // Puede ser 'primary' o 'secondary'
    validator: (value) => ['primary', 'secondary'].includes(value)
  },
  outline: Boolean, // Modo outline (true o false)
  text: String, // Texto de boton (si el tipo es 'button' o 'submit')
  options: {
    type: Array, // Tipo de la propiedad options
    default: () => [] // Valor por defecto (array vacío)
  }
});

const inputRef = ref(null);

const emit = defineEmits(['update:modelValue']);

// Referencia al elemento <select>
const selectRef = ref(null);

// Clases computadas según el modo y variante
const inputClasses = computed(() => {
  const baseClasses = 'flex flex-1 items-center justify-center rounded-2xl py-2.5 px-5 gap-2 border-[2px] font-semibold';
  const colorClasses = props.variant === 'primary' 
    ? (
        props.outline 
        ? 'border-deep-blue-600 text-deep-blue-600 bg-white' 
        : 'bg-deep-blue-600 text-white border-transparent hover:bg-deep-blue-700 focus:opacity-80'
    ) 
    : (
      props.outline 
      ? 'border-vibrant-light-800 bg-white' 
      : 'bg-vibrant-light-600 text-deep-blue-900 border-transparent focus:bg-vibrant-light-900'
    );

  return `${baseClasses} ${colorClasses}`;
});

// Clases solo para el label (cuando no es select)
const labelClasses = computed(() => {
  return props.type === 'select' ? '' : inputClasses.value;
});

// Clases para el input/select
const elementClasses = computed(() => {
  return props.type === 'select' ? inputClasses.value : 'w-full bg-transparent border-none outline-none';
});

// Exponer método focus
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
};

// Exponer métodos al padre
defineExpose({
  focus
});
</script>

<template>
  <!-- Input o Select -->
  <label 
    v-if="type !== 'button' && type !== 'submit'" 
    :for="id" 
    :class="labelClasses"
  >
    <slot v-if="iconPosition === 'left'" name="icon"></slot>

    <!-- Input para tipos de texto, número, etc. -->
    <input 
      v-if="type !== 'select'"
      ref="inputRef"
      :type="type" 
      :id="id" 
      :name="name" 
      :placeholder="placeholder" 
      @input="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      autocomplete="off"
      :class="elementClasses"
      :aria-label="placeholder"
    />

    <!-- Select -->
    <select
      v-else
      :id="id"
      :name="name"
      @change="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      :aria-label="placeholder"
      :class="[
        elementClasses
      ]"   
      ref="selectRef"
    >
      <option 
        v-if="placeholder" 
        value="" 
        disabled 
        :selected="!modelValue"
        class="text-background-600"
        >
        {{ placeholder }}
      </option>
      <option 
        v-for="(option, index) in options" 
        :key="index" 
        :value="option.value"
        :selected="option.value"
        >
        {{ option.label }}
      </option>
    </select>

    <slot v-if="iconPosition === 'right'" name="icon"></slot>
  </label>

  <!-- Botón cuando el type es 'button' o 'submit' -->
  <button 
    v-else 
    :type="type"
    :class="inputClasses"
  >
    <slot v-if="iconPosition === 'left'" name="icon"></slot>
    {{ text }}
    <slot v-if="iconPosition === 'right'" name="icon"></slot>
  </button>
</template>

<style scoped>
/* Estilos específicos para el select */
select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1.5em;
  padding-right: 2.5rem;
  cursor: pointer;
  width: 100%;
}

/* Estilos para inputs normales */
input:not([type='select']) {
  border: none;
  outline: none;
  flex: 1;
}
</style>