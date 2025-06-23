<script>
import Action from "@/icons/Action.vue";

export default {
  name: "Popover",
  components: { Action },
  props: {
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
    isOpen: {
      type: Boolean,
      required: true,
    },
    popoverId: {
      type: [String, Number],
      required: true,
    },
  },
  data() {
    return {
      popoverDirection: "bottom", // Dirección inicial del popover
    };
  },
  methods: {
    // Método que calcula la dirección del popover
    calculatePopoverDirection() {
      const button = this.$el.querySelector("button");
      if (button) {
        const buttonRect = button.getBoundingClientRect();
        const spaceBelow = window.innerHeight - buttonRect.bottom;
        const spaceAbove = buttonRect.top;

        // Si no hay suficiente espacio abajo, mostrar el popover hacia arriba
        if (spaceBelow < 200 && spaceAbove >= 200) {
          this.popoverDirection = "top";
        } else {
          this.popoverDirection = "bottom";
        }
      }
    },
    // Método para cerrar el popover cuando se hace clic fuera
    handleClickOutside(event) {
      const popover = this.$el.querySelector(".popover-container");
      const button = this.$el.querySelector("button");

      // Verificar si el clic fue fuera del popover y del botón
      if (
        popover &&
        !popover.contains(event.target) &&
        !button.contains(event.target)
      ) {
        this.$emit("close-popover");
      }
    },
  },
  watch: {
    // Recalcular la dirección del popover cuando se abre
    isOpen(newVal) {
      if (newVal) {
        this.calculatePopoverDirection();
      }
    },
  },
  mounted() {
    // Agregar listener para el evento de clic fuera
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeDestroy() {
    // Remover listeners cuando el componente se destruye
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<template>
  <div class="relative">
    <!-- Botón que abre el popover -->
    <button
      @click="$emit('toggle-popover', popoverId)"
      class="p-2 rounded-full cursor-pointer hover:bg-vibrant-light-700 focus:bg-vibrant-light-700"
    >
      <Action />
    </button>

    <!-- Popover -->
    <div
      v-if="isOpen"
      class="popover-container absolute right-0 w-40 bg-white border-2 border-vibrant-light-700 rounded-lg shadow-xl z-10"
      :class="{
        'bottom-full': popoverDirection === 'top',
        '': popoverDirection === 'bottom',
      }"
    >
      <ul>
        <li v-for="(item, index) in items" :key="index">
          <!-- Usar router-link si hay un "to" -->
          <router-link
            v-if="item.to"
            :to="item.to"
            class="block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100"
            :class="item.class"
          >
            {{ item.label }}
          </router-link>
          <!-- Usar button si no hay un "to" -->
          <button
            v-else
            @click="item.action && item.action()"
            class="block w-full text-left px-4 py-2 text-sm font-semibold hover:bg-gray-100 cursor-pointer"
            :class="item.class"
          >
            {{ item.label }}
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>