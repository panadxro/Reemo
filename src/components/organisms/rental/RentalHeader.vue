<script>
import StepBackButton from "@/components/atoms/StepBackButton.vue";
import Heading from "@/components/atoms/Heading.vue";

export default {
  name: 'RentalHeader',
  components: {
    StepBackButton, 
    Heading
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
      return this.sections[this.currentStep - 1]?.title || '';
    },
    stepIndicator() {
      return `${this.currentStep}/${this.sections.length}`;
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
        :class="prevStep == 1 ? 'hidden' : ''"
      />
      <Heading type="3" class="regular text-white">{{ currentTitle }}</Heading>
    </div>
    <p class="text-white font-semibold">{{ stepIndicator }}</p>
  </div>
</template>