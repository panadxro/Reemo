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
          :class="`alert alert-${alert.severity} ${alert.notification ? 'notification-alert' : ''}`" 
          >
          <span class="icon" v-if="iconComponent">
            <component :is="iconComponent(alert.severity)" />
          </span>
          <span class="message">{{ alert.message }}</span>
          <span v-if="alert.notification" class="notification-badge">Nuevo</span>
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
  bottom: 25%;
  left: 0;
  right: 0;
  height: 1px;
  width: 100%; /* Ocupa el ancho completo */
  gap: .2rem;
  z-index: 4;
  pointer-events: none;
}
.alert-msj {
  display: flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  padding-inline: 8px;
  margin: 0 auto;
}
.notification-badge {
  margin-left: 0.5rem;
  padding: 0.2rem 0.5rem;
  background-color: #4a90e2;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
}

.alert {
  width: 100%;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  opacity: 0;
  transform: translateY(100%);
  animation: slideIn 0.5s forwards, fadeOut 0.5s forwards 2.5s;
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
@keyframes slideIn {
  0% {
    opacity: 0;
    transform: translateY(100%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Animación de salida */
@keyframes fadeOut {
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(100%);
  }
}

/* Clases para la transición de entrada y salida con rebote */
/* .slide-bounce-enter-active {
  animation: slideInUp 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

.slide-bounce-leave-active {
  animation: slideOutDown 0.4s cubic-bezier(0.55, 0.085, 0.68, 0.53) both;
} */
</style>