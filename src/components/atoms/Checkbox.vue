<script setup>
import CheckIcon from '@/icons/Check.vue';

const props = defineProps({
  modelValue: Boolean,
  id: String,
  name: String,
  label: String, // Texto opcional
  labelPosition: {
    type: String,
    default: 'right', // 'left' o 'right'
    validator: (value) => ['left', 'right'].includes(value)
  }
});

const emit = defineEmits(['update:modelValue']);

const toggle = () => {
  emit('update:modelValue', !props.modelValue);
};
</script>

<template>
  <label 
    :for="id" 
    class="flex items-center cursor-pointer gap-2"
  >
    <!-- Texto a la izquierda -->
    <span v-if="label && labelPosition === 'left'" class="text-sm text-white">{{ label }}</span>

    <input
      type="checkbox"
      :id="id"
      :name="name"
      :checked="modelValue"
      @change="toggle"
      class="hidden"
    />
    
    <div class="checkbox-box">
      <CheckIcon v-if="modelValue" color="#FFFFFF"/>
    </div>

    <!-- Texto a la derecha -->
    <span v-if="label && labelPosition === 'right'" class="text-sm text-white">{{ label }}</span>
  </label>
</template>

<style scoped>
.checkbox-box {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border: 2px solid #DBFAFC;
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
