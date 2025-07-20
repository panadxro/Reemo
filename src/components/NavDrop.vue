<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import Navbar from './Navbar.vue';

const props = defineProps({
  initialVisible: {
    type: Boolean,
    default: true
  }
});

const isNavbarVisible = ref(props.initialVisible);
const navdropHeight = ref('auto');
const contentElement = ref(null);

// Actualizar altura cuando cambia la visibilidad
watch(isNavbarVisible, (visible) => {
  updateHeight();
});

// Función para calcular la altura
const updateHeight = () => {
  if (contentElement.value) {
    const contentHeight = contentElement.value.offsetHeight;
    navdropHeight.value = isNavbarVisible.value ? 
      `calc(${contentHeight}px + var(--navbar-height, 60px))` : 
      `${contentHeight}px`;
  }
};

// Inicializar y configurar ResizeObserver
onMounted(() => {
  updateHeight();
  
  const resizeObserver = new ResizeObserver(() => {
    updateHeight();
  });
  
  if (contentElement.value) {
    resizeObserver.observe(contentElement.value);
  }
});

</script>

<template>
  <div 
    class="navdrop-container"
    :style="{ height: navdropHeight }"
  >
    <div 
      class="navdrop"
      :class="{ 
        'navdrop--visible': isNavbarVisible, 
        'navdrop--hidden': !isNavbarVisible 
      }"
    >
      <Navbar 
        v-model:isVisible="isNavbarVisible"
        @scroll-change="isNavbarVisible = $event"
      />
    </div>
    
    <div 
      ref="contentElement"
      class="navdrop-content"
    >
      <slot name="content"/>
    </div>
  </div>
</template>

<style scoped>
.navdrop-container {
  height: var(--navbar-height, 60px);
  transition: height 0.3s ease;
}

.navdrop {
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transition: transform 0.3s ease;
  z-index: 10;
}

.navdrop--visible {
  transform: translateY(0);
}

.navdrop--hidden {
  transform: translateY(-100%);
}

.navdrop-content {
  width: 100%;
  padding-top: var(--navbar-height, 60px);
}
</style>