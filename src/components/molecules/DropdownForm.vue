<script>
import Arrow from "../../icons/Arrow.vue";

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
    initialOpen: {
      type: Boolean,
      default: false, // Por defecto, el dropdown está cerrado
    },
  },
  data() {
    return {
      isOpen: this.initialOpen,
    };
  },
  computed: {
    contentStyle() {
      return {
        maxHeight: this.isOpen ? "500px" : "0px", // Ajusta el valor máximo según tu contenido
        overflow: "hidden",
        transition: "max-height 0.3s ease-out",
      };
    },
  },
  methods: {
    toggleDropdown() {
      this.isOpen = !this.isOpen;
      this.$emit("dropdown-toggle", this);
    },
    closeDropdown() {
      this.isOpen = false;
    },
  },
};
</script>

<template>
  <div class="dropdown-form" ref="dropdown">
    <button 
      type="button"
      class="dropdown-button" 
      @click="toggleDropdown"
      >
      {{ title }}
      <Arrow color="#FFFFFF" :direction="isOpen ? 'up' : 'down'" />
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
  gap: 20px;
}

.dropdown-button {
  display: flex;
  justify-content: space-between;
  padding-block: 10px;
  color: white;
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