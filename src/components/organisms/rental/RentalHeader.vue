<script>
import StepBackButton from "@/components/atoms/StepBackButton.vue";

export default {
  name: 'RentalHeader',
  components: {
    StepBackButton
  },
  props: {
    currentStep: {
      type: Number,
      required: true
    },
    sections: {
      type: Array,
      required: true
    },
    prevStep: {
      type: Function,
      required: true
    }
  },
  computed: {
    currentTitle() {
      return this.sections[this.currentStep]?.title || '';
    },
    stepIndicator() {
      return `${this.currentStep + 1}/${this.sections.length}`;
    }
  }
};
</script>

<template>
  <div class="flex items-center justify-between">
    <div class="flex items-center gap-4 text-white">
      <StepBackButton 
        :current-step="currentStep"
        :prev-step="prevStep"
      />
      <h2 class="text-xl font-bold">{{ currentTitle }}</h2>
    </div>
    <p class="text-white">{{ stepIndicator }}</p>
  </div>
</template>