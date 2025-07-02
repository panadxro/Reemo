<script setup>
import CheckIcon from '@/icons/Check.vue';

const props = defineProps({
  modelValue: [Boolean, Array],
  id: String,
  name: String,
  label: String, // Texto opcional
  labelPosition: {
    type: String,
    default: 'right', // 'left' o 'right'
    validator: (value) => ['left', 'right'].includes(value)
  },
  value: String,
  type: {
    type: String,
    default: 'checkbox', // 'checkbox' o 'radio'
    validator: (value) => ['checkbox', 'radio'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  if (props.type === 'radio') {
    // Para radios, siempre establece el valor
    emit('update:modelValue', props.value);
  } else {
    if (Array.isArray(props.modelValue)) {
      // Si modelValue es un array, maneja múltiples selecciones
      let newValue = [...props.modelValue];
      if (newValue.includes(props.value)) {
        // Si el valor ya está en el array, lo eliminamos
        newValue = newValue.filter(item => item !== props.value);
      } else {
        // Si el valor no está en el array, lo agregamos
        newValue.push(props.value);
      }
      emit('update:modelValue', newValue);
    } else {
      // Si modelValue es un booleano, maneja una sola selección
      emit('update:modelValue', !props.modelValue);
    }
  }
};

const isChecked = () => {
  if (props.type === 'radio') {
    return props.modelValue === props.value;
  } else {
    if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value); // Verifica si el valor está en el array
    } else {
      return props.modelValue; // Devuelve el valor booleano
    }
  }
}
</script>

<template>
  <label 
    :for="id" 
    class="flex items-center cursor-pointer gap-2"
  >
    <!-- Texto a la izquierda -->
    <span v-if="label && labelPosition === 'left'" class="text-sm">{{ label }}</span>

    <input
      :type="type"
      :id="id"
      :name="name"
      :checked="isChecked()"
      @change="toggle"
      class="hidden"
    />
    
    <div class="checkbox-box">
      <CheckIcon v-if="isChecked()" color="#FFFFFF"/>
    </div>

    <!-- Texto a la derecha -->
    <span v-if="label && labelPosition === 'right'" class="text-sm">{{ label }}</span>
  </label>
</template>

<style scoped>
.checkbox-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #DBFAFC;
  background-color: #FFFFFF;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.2s ease-in-out;
}

input:checked + .checkbox-box {
  background-color: #333ac6; /* Azul */
  border-color: #333ac6;
}
</style>
