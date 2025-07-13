<script setup>
import { computed, defineAsyncComponent } from 'vue';
import { alerts } from "../../services/alerts";

const Success = defineAsyncComponent(() => import('@/icons/Success.vue'));
const Info = defineAsyncComponent(() => import('@/icons/Info.vue'));
const Warning = defineAsyncComponent(() => import('@/icons/Warning.vue'));
const Error = defineAsyncComponent(() => import('@/icons/Error.vue'));

const iconComponent = (severity) => {
  return {
    success: Success,
    info: Info,
    warning: Warning,
    error: Error,
  }[severity];
};

const alertList = computed(() => alerts);
</script>

<template>
  <div class="alert-container">
    <transition-group 
      name="slide-bounce"
      >
      <div 
        class="alert-msj"
        v-for="alert in alerts"
        :key="alert.id" 
      >
        <div 
          :class="`alert alert-${alert.severity}`" 
          >
          <span class="icon" v-if="iconComponent">
            <component :is="iconComponent(alert.severity)" />
          </span>
          <span class="message">{{ alert.message }}</span>
        </div>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.alert-container {
  display: flex;
  flex-direction: column;
  position: fixed;
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%; /* Ocupa el ancho completo */
  gap: .2rem;
  z-index: 1000;
}
.alert-msj {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30%;
  margin: 0 auto;
}

.alert {
  width: 100%;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  transition: all 0.5s linear;
}

/* Estilos de severidad */
.alert-success {
  background-color: #d4edda;
  color: #155724;
}

.alert-info {
  background-color: #cce5ff;
  color: #004085;
}

.alert-warning {
  background-color: #fff3cd;
  color: #856404;
}

.alert-error {
  background-color: #f8d7da;
  color: #721c24;
}

.icon {
  margin-right: 0.5rem;
}

/* Animación personalizada */
@keyframes bounceInUp {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  60% {
    opacity: 1;
    transform: translateY(-10px);
  }
  80% {
    transform: translateY(5px);
  }
  100% {
    transform: translateY(0);
  }
}

@keyframes bounceOutDown {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  20% {
    transform: translateY(-5px);
  }
  100% {
    opacity: 0;
    transform: translateY(100%);
  }
}

/* Clases para la transición de entrada y salida con rebote */
.slide-bounce-enter-active {
  animation: bounceInUp 0.6s ease-out;
}

.slide-bounce-leave-active {
  animation: bounceOutDown 0.6s ease-in;
}
</style>