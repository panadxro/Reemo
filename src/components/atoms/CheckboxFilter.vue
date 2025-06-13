<script setup>
import CheckIcon from '@/icons/Check.vue';

const props = defineProps({
  modelValue: [Boolean, Array],
  id: String,
  name: String,
  label: String,
  labelPosition: {
    type: String,
    default: 'right',
    validator: (value) => ['left', 'right'].includes(value)
  },
  value: String
});

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
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
};

const isChecked = () => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(props.value); // Verifica si el valor está en el array
  } else {
    return props.modelValue; // Devuelve el valor booleano
  }
}
</script>

<template>
  <label 
    :for="id" 
    class="cursor-pointer"
  >
    <input
      type="checkbox"
      :id="id"
      :name="name"
      :checked="isChecked()"
      @change="toggle"
      class="hidden"
    />
    
    <div class="pill-checkbox" :class="{ 'pill-checkbox-checked': isChecked() }">
      {{ label }}
    </div>
  </label>
</template>

<style scoped>
.pill-checkbox {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;
  background-color: white;
  color: #333333;
  border: 1px solid #e0e0e0;
}

.pill-checkbox-checked {
  background-color: #CAF3F5;
  color: #0ba5ec;
  border-color: #0ba5ec;

}
</style>