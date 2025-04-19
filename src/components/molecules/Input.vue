<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: [String, Number],
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

const emit = defineEmits(['update:modelValue']);

// Referencia al elemento <select>
const selectRef = ref(null);

// Clases computadas según el modo y variante
const buttonClasses = computed(() => {
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

// Método para enfocar el <select> cuando se hace clic en el <label>
  const focusSelect = () => {
  if (props.type === 'select' && selectRef.value) {
    selectRef.value.focus();
  }
};

const removeFocus = (event) => {
  event.target.blur();
};

</script>

<template>
  <!-- Input o Select -->
  <label 
    v-if="type !== 'button' && type !== 'submit'" 
    :for="id" 
    :class="buttonClasses"
    @click="focusSelect"
  >
    <slot v-if="iconPosition === 'left'" name="icon"></slot>

    <!-- Input para tipos de texto, número, etc. -->
    <input 
      v-if="type !== 'select'"
      :type="type" 
      :id="id" 
      :name="name" 
      :placeholder="placeholder" 
      @input="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      autocomplete="off"
      class="w-full bg-transparent border-none outline-none"
      :aria-label="placeholder"
    />

    <!-- Select -->
    <select
      v-else
      :id="id"
      :name="name"
      @change="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      class="flex w-full bg-transparent border-none outline-none"
      :aria-label="placeholder"
      ref="selectRef"
    >
      <option 
        v-if="placeholder" 
        value="" 
        disabled 
        selected
        >
        {{ placeholder }}
      </option>
      <option 
        v-for="(option, index) in options" 
        :key="index" 
        :value="option.value"
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
    :class="buttonClasses"
    @mouseup="removeFocus"
  >
    <slot v-if="iconPosition === 'left'" name="icon"></slot>
    {{ text }}
    <slot v-if="iconPosition === 'right'" name="icon"></slot>
  </button>
</template>

<style scoped>
input {
  border: none;
  outline: none;
  flex: 1;
}
</style>
