<script setup>
import { computed, ref, useAttrs } from 'vue';

const props = defineProps({
  modelValue: { type: [String, Number, Boolean, Array], default: '' },
  type: {
    type: String,
    default: 'text',
    validator: (value) => [
      'text', 'number', 'email', 'password', 'tel', 'url',
      'date', 'time', 'checkbox', 'radio', 'file',
      'button', 'submit', 'reset', 'select'
    ].includes(value)
  },
  id: String,
  name: String,
  placeholder: String,
  iconPosition: { type: String, default: 'left', validator: (value) => ['left', 'right'].includes(value) },
  variant: { type: String, default: 'primary', validator: (value) => ['primary', 'secondary'].includes(value) },
  outline: Boolean,
  text: String,
  options: { type: Array, default: () => [] },
  label: { type: Boolean, default: false },
  inputClass: { type: String, default: '' },
  disabled: { type: Boolean, default: false },
  readonly: { type: Boolean, default: false },
  required: { type: Boolean, default: false },
  autocomplete: { type: String, default: 'off' },
  autofocus: { type: Boolean, default: false },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
  step: { type: [String, Number], default: undefined },
  pattern: { type: String, default: undefined },
  minlength: { type: Number, default: undefined },
  maxlength: { type: Number, default: undefined }
});

const emit = defineEmits(['update:modelValue', 'focus', 'blur', 'click']);
const attrs = useAttrs();
const inputRef = ref(null);

// Clases base comunes
const baseClasses = computed(() => [
  props.inputClass,
  'flex flex-1 items-center justify-center rounded-2xl py-2.5 px-5 gap-2 border-2 font-semibold',
  { '!flex-col !items-start': props.label && !['button', 'submit', 'select'].includes(props.type) },
  { '!cursor-not-allowed opacity-50': props.disabled }
]);

// Clases de variante
const variantClasses = computed(() => {
  const variants = {
    primary: {
      outline: 'border-deep-blue-600 text-deep-blue-600 bg-white',
      normal: 'bg-deep-blue-600 text-white border-transparent hover:bg-deep-blue-700'
    },
    secondary: {
      outline: 'border-vibrant-light-800 bg-white',
      normal: 'bg-vibrant-light-600 text-deep-blue-900 border-transparent'
    }
  };
  
  return variants[props.variant][props.outline ? 'outline' : 'normal'];
});

// Clases del contenedor
const containerClasses = computed(() => [
  ...baseClasses.value,
  variantClasses.value
]);

// Clases del elemento (input/select/button)
const elementClasses = computed(() => [
  props.type === 'select' ? 'w-full' : 'w-full border-none outline-none bg-transparent',
  { 'cursor-not-allowed opacity-50 text-gray-500': props.disabled },
  props.type === 'button' || props.type === 'submit' ? variantClasses.value : ''
]);

// Métodos expuestos
const focus = () => inputRef.value?.focus();
const blur = () => inputRef.value?.blur();

defineExpose({ focus, blur,  });
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <!-- Label -->
    <label 
      v-if="label && !['button', 'submit', 'select'].includes(type)" 
      :for="id" 
      class="font-semibold text-deep-blue-900"
    >
      {{ placeholder }}
    </label>

    <!-- Input normal -->
    <label 
      v-if="!['button', 'submit', 'select'].includes(type)"
      :class="[
        containerClasses, 
        { 'cursor-text': type === 'text' || type === 'email' || type === 'tel' || type === 'password' }
      ]"
      @click.stop="focus()"
    >
      <slot v-if="iconPosition === 'left'" name="icon" />
      
      <input
        ref="inputRef"
        :type="type"
        :id="id"
        :name="name"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :required="required"
        :autocomplete="autocomplete"
        :autofocus="autofocus"
        :min="min"
        :max="max"
        :step="step"
        :minlength="minlength"
        :maxlength="maxlength"
        :pattern="pattern"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        @focus="$emit('focus', $event)"
        @blur="$emit('blur', $event)"
        v-bind="attrs"
        :class="[
          elementClasses,
          { 'text-gray-900': disabled }
        ]"
      />
      
      <slot v-if="iconPosition === 'right'" name="icon" />
  </label>

    <!-- Select -->
    <select
      v-else-if="type === 'select'"
      :id="id"
      :name="name"
      :disabled="disabled"
      :required="required"
      :autofocus="autofocus"
      v-bind="attrs"
      :value="modelValue"
      @change="$emit('update:modelValue', $event.target.value)"
      :class="containerClasses"
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
      :disabled="disabled"
      v-bind="attrs"
      @click="$emit('click', $event)"
      class="hover:cursor-pointer"
      :class="containerClasses"
    >
      <slot v-if="iconPosition === 'left'" name="icon" />
      {{ text }}
      <slot v-if="iconPosition === 'right'" name="icon" />
    </button>
  </div>
</template>

<style scoped>

/* Estilos para inputs normales */
input:not([type='select']) {
  border: none;
  outline: none;
  flex: 1;
}

select {
  cursor: pointer;
}
::picker(select) {
  border: 2px solid #A7EBEF;
}
::picker(select) {
  margin-block: .25em;
  border-radius: 1rem;
  scrollbar-width: none;
  scrollbar-color: #CAF3F5 #ffffff;
}
select::picker-icon {
  transition: 0.4s rotate;
  content: url("/src/icons/Dropdown.png");
  max-width: 1.5rem;
  max-height: 1.5rem;
}
select:open::picker-icon {
  rotate: 180deg;
}
select option:hover {
  background-color: #A7EBEF !important;
}
select option:checked {
  background-color: #DBFAFC;
}
option {
    padding: 0.5rem 1rem 0.5rem 1rem;
}
select option::checkmark {
  order:1;
  content: "✅";
}
</style>