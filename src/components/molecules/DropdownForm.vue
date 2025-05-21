<script>
import Arrow from "../../icons/Arrow.vue";
import { useUiStore } from '@stores';
import { computed, onMounted } from 'vue';

export default {
  name: "DropdownForm",
  components: {
    Arrow,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    dropdownId: {
      type: [String, Number],
      required: true,
    },
    isInitial: {
      type: Boolean,
      default: false
    },
    sectionId: {
      type: [String, Number],
      required: true
    },
    color: {
      type: String,
      default: "#010440"
    }
  },
  setup(props, { emit }) {
    const uiStore = useUiStore();
    
    const isOpen = computed(() => uiStore.openDropdowns[props.sectionId] === props.dropdownId);

    const toggleDropdown = () => {
      uiStore.setOpenDropdown(props.sectionId, props.dropdownId);
      emit('dropdown-toggle', props.dropdownId);
    };

    onMounted(() => {
      if (props.isInitial) {
        uiStore.openInitialDropdown(props.sectionId, props.dropdownId)
      }
    });

    return { isOpen, toggleDropdown };
  },
  computed: {
    contentStyle() {
      return {
        maxHeight: this.isOpen ? "500px" : "0px",
        overflow: "hidden",
        transition: "max-height 0.3s ease-out",
      };
    },
  }
};
</script>

<template>
  <div 
    class="dropdown-form"
    :class="isOpen ? 'gap-5' : ''"
    >
    <button 
      type="button"
      class="dropdown-button"
      :class="!`text-${color}`" 
      @click="toggleDropdown"
    >
      {{ title }}
      <Arrow :color="color" :direction="isOpen ? 'up' : 'down'" />
    </button>
    <div class="dropdown-content" :style="contentStyle">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped>
.dropdown-form {
  display: flex;
  flex-direction: column;
}

.dropdown-button {
  display: flex;
  justify-content: space-between;
  font-weight: 600;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.dropdown-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
</style>