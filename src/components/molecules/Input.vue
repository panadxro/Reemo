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
    default: 'left', // Puede ser 'left' o 'right',
    validator: (value) => ['left', 'right'].includes(value)
  },
  variant: {
    type: String,
    default: 'primary', // Puede ser 'primary' o 'secondary',
    validator: (value) => ['primary', 'secondary'].includes(value)
  },
  outline: Boolean, // Modo outline (true o false),
  text: String, // Texto de boton (si el tipo es 'button' o 'submit'),
  options: {
    type: Array, // Tipo de la propiedad options,
    default: () => [] // Valor por defecto (array vacío)
  },
  label: {
    type: Boolean,
    default: false
  },
  inputClass: { // Nueva prop para clases personalizadas del input/button
    type: String,
    default: ''
  }
});

const inputRef = ref(null);

const emit = defineEmits(['update:modelValue']);

const selectRef = ref(null);

// Clases del contenedor (solo layout)
const containerClasses = computed(() => {
    const baseClasses = props.inputClass || '';
  const variantClasses = props.variant === 'primary' 
    ? (
        props.outline 
        ? 'border-deep-blue-600 text-deep-blue-600 bg-white' 
        : 'bg-deep-blue-600 text-white border-transparent hover:bg-deep-blue-700 focus:opacity-80'
    ) 
    : (
      props.outline 
      ? 'border-vibrant-light-800 bg-white' 
      : 'bg-vibrant-light-600 text-deep-blue-900 border-transparent'
    );
  return `${baseClasses} ${variantClasses} flex flex-1 items-center justify-center rounded-2xl py-2.5 px-5 gap-2 border-2 font-semibold`;
});

// Clases del elemento (input/select/button - estilos visuales)
const elementClasses = computed(() => {
  const baseClasses = props.inputClass || '';
  const variantClasses = props.variant === 'primary' 
    ? (
        props.outline 
        ? 'border-deep-blue-600 text-deep-blue-600 bg-white' 
        : 'bg-deep-blue-600 text-white border-transparent hover:bg-deep-blue-700 focus:opacity-80'
    ) 
    : (
      props.outline 
      ? 'border-vibrant-light-800 bg-white' 
      : 'bg-vibrant-light-600 text-deep-blue-900 border-transparent'
    );

  return `${baseClasses} ${variantClasses}`;
});

// Exponer método focus
const focus = () => {
  if (inputRef.value) {
    inputRef.value.focus();
  }
};

defineExpose({
  focus
});
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label arriba -->
    <label 
      v-if="label && type !== 'button' && type !== 'submit'" 
      :for="id" 
      class="font-semibold text-deep-blue-900"
    >
      {{ placeholder }}
    </label>

    <!-- Contenedor del input/select -->
    <label 
      v-if="type !== 'button' && type !== 'submit' && type !== 'select'" 
      :for="id" 
      :class="[
        containerClasses,
        { '!flex-col !items-start': label }
      ]"
    >
      <slot v-if="iconPosition === 'left'" name="icon"></slot>

      <!-- Input normal -->
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
        :class="[
          'w-full border-none outline-none',
          elementClasses
        ]"
        :aria-label="placeholder"
      />

      
      <slot v-if="iconPosition === 'right'" name="icon"></slot>
    </label>
    
    <!-- Select -->
    <select
      v-else-if="type === 'select'"
      :id="id"
      :name="name"
      @change="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      :aria-label="placeholder"
      :class="containerClasses"
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
        :selected="option.value === modelValue"
      >
        {{ option.label }}
      </option>
    </select>

    <!-- Botón -->
    <button 
      v-else 
      :type="type"
      :class="[
        containerClasses,
        elementClasses,
        'cursor-pointer'
      ]"
    >
      <slot v-if="iconPosition === 'left'" name="icon"></slot>
      {{ text }}
      <slot v-if="iconPosition === 'right'" name="icon"></slot>
    </button>
  </div>
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