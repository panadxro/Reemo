<script setup>
import { computed } from 'vue';

const props = defineProps({
  modelValue: String,
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
  text: String // Texto de boton (si el tipo es 'button' o 'submit')
});

const emit = defineEmits(['update:modelValue']);

// Clases computadas según el modo y variante
const buttonClasses = computed(() => {
  const baseClasses = 'flex items-center justify-center rounded-2xl py-2.5 px-5 gap-2 border-[2px] font-semibold';
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

const removeFocus = (event) => {
  event.target.blur();
};
</script>

<template>
  <label v-if="type !== 'button' && type !== 'submit'" :for="name" :class="buttonClasses">
    <slot v-if="iconPosition === 'left'" name="icon"></slot>

    <input 
      :type="type" 
      :id="id" 
      :name="name" 
      :placeholder="placeholder" 
      @input="$emit('update:modelValue', $event.target.value)"
      :value="modelValue"
      autocomplete="off"
      class="flex-1 bg-transparent border-none outline-none"
      :aria-label="placeholder"
    />

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
