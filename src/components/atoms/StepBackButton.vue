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
      return this.currentStep > 1;
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
    class="flex items-center p-2 cursor-pointer rounded-full transition-colors duration-100 hover:bg-background-800/30" 
    title="Volver al paso anterior">
    <Arrow direction="left" color="#FFFFFF"/>
  </button>
</template>