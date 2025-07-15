<script>
import Warning from '@/icons/Warning.vue';
import Success from '@/icons/Success.vue';

export default {
  name: 'VerifyValidation',
  components: {
    Warning,
    Success
  },
  props: {
    title: {
      type: String,
      default: 'Verificación requerida'
    },
    message: {
      type: String,
      required: true
    },
    show: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'normalYellow',
      validator: value => ['normalYellow', 'brightYellow', 'green'].includes(value)
    }
  },
  computed: {
    alertClasses() {
      return {
        normalYellow: 'from-amber-900/20 to-orange-900/20 border-amber-600/30 text-amber-300',
        brightYellow: 'from-amber-900/80 to-orange-900/80 border border-amber-600/50 text-amber-200',
        green: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 text-green-600'
      }[this.type]
    },
    textClasses() {
      return {
        normalYellow: 'text-yellow-200',
        brightYellow: 'text-amber-200',
        green: 'text-green-600'
      }[this.type]
    }
  }
}
</script>

<template>
  <div 
    v-if="show" 
    class="bg-gradient-to-r border rounded-2xl p-4 mb-2"
    :class="alertClasses"
  >
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0 mt-0.5">
        <Warning v-if="type === 'brightYellow' || type === 'normalYellow'" :class="textClasses" />
        <Success v-if="type === 'green'" class="text-green-600" />
      </div>
      <div class="flex-1">
        <h4 class="font-semibold text-sm mb-1 text-start" :class="textClasses.replace('200', '300')">
          {{ title }}
        </h4>
        <p class="text-sm text-start" :class="textClasses">
          {{ message }}
        </p>
      </div>
    </div>
  </div>
</template>