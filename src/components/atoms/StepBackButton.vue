<script>
import Arrow from '../../icons/Arrow.vue';

export default {
  name: "StepBackButton",
  components: { Arrow },
  props: {
    currentStep: {
      type: Number,
      required: true
    },
    prevStep: {  
      type: Function,
      required: true
    }
  },
  computed: {
    shouldShow() {
      return this.currentStep > 0;
    }
  },
  methods: {
    handleClick() {
      if (this.shouldShow) {
        this.prevStep(); 
      }
    }
  }
};
</script>

<template>
  <button
    v-if="shouldShow"
    @click="handleClick" 
    class="flex items-center p-2 cursor-pointer rounded-full transition-colors duration-100 bg-background-700 hover:bg-background-800" 
    title="Volver al paso anterior">
    <Arrow direction="left"/>
  </button>
</template>