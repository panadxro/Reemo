<script setup>
import { watch, markRaw, shallowRef, provide, computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useRegisterSW } from 'virtual:pwa-register/vue'

import DefaultLayout from '@layouts/DefaultLayout.vue'
import SimpleLayout from "@layouts/SimpleLayout.vue"
import DashboardLayout from '@layouts/DashboardLayout.vue'
import UserLayout from '@layouts/UserLayout.vue'
import MapsLayout from '@layouts/MapsLayout.vue'
import Alert from './components/atoms/Alert.vue';
import Offline from "@pages/Offline.vue";

const isOnline = ref(navigator.onLine);
const showOffline = ref(false);

const { offlineReady, needRefresh, updateServiceWorker } = useRegisterSW()

const updateOnlineStatus = () => {
  isOnline.value = navigator.onLine;
  if (!isOnline.value) {
    showOffline.value = true;
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);

  if (offlineReady.value) {
    showOffline.value = true;
  }
});

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus);
  window.removeEventListener('offline', updateOnlineStatus);
});

const authStore = useAuthStore()
authStore.init();
const route = useRoute()

const authSession = computed(() => authStore.authSession);
const loggedUser = computed(() => authStore.user);


provide('authStore', authStore);
provide('authSession', authSession);
provide('loggedUser', loggedUser);
provide('isOnline', isOnline);

const layoutComponents = {
  default: markRaw(DefaultLayout),
  simple: markRaw(SimpleLayout),
  dashboard: markRaw(DashboardLayout),
  user: markRaw(UserLayout),
  map: markRaw(MapsLayout)
}

// Mapeo de rutas a tipos de layout
const layoutMap = {
  // Layout simple (sin navbar/footer)
  '/login': 'simple',
  '/register': 'simple',
  '/ForgotPassword': 'simple',
  '/onboarding': 'simple',
  '/car/register': 'simple',
  '/car/edit': 'simple',
  
  // Rutas con layout de dashboard (con sidebar)
  '/dashboard': 'dashboard',
  '/admin': 'dashboard',
  '/search': 'dashboard',
  '/map': 'map',
  '/car/': 'dashboard',
  '/notifications': 'dashboard',
  
  // Rutas con layout de usuario (sin sidebar y usernav) 
  '/user': 'user',
  '/rent': 'user',
  '/cars': 'user',
  '/documents': 'user',
  
  // Por defecto (con navbar y footer)
  '/404': 'default',
  'default': 'default'
}

const currentLayout = shallowRef(layoutComponents.default)

watch(() => route.path, (path) => {
  // Buscar el layout correspondiente
  const matchedLayoutKey = Object.keys(layoutMap).find(key => path.startsWith(key))
  const layoutType = matchedLayoutKey ? layoutMap[matchedLayoutKey] : layoutMap.default
  
  // Asignamos el componente directamente (ya está marcado como no reactivo)
  currentLayout.value = layoutComponents[layoutType]
}, { immediate: true })

/* onMounted(() => {
  const authSessionHistory = sessionStorage.getItem('auth_session_history');
  const authSession = JSON.parse(authSessionHistory);

}) */

</script>

<template>
  <component :is="currentLayout">
    <router-view :isOnline="isOnline"/>
  </component>
  <Alert />
</template>

<style>
html {
  font-family:
    "Onest",
    Monaco,
    Lucida Console,
    "Courier New",
    Courier,
    monospace;
  background: #fff;
  letter-spacing: -0.025rem;
}

body,
figure {
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
}

ul {
  list-style: none;
  padding: 0;
}

*,
*::before,
*::after {
  box-sizing: border-box;
}

h1,
h2,
h3,
h4 {
  margin: 0;
  font-family:
    "Onest",
    sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    "Open Sans",
    "Helvetica Neue",
    sans-serif;
}

.no-scroll {
  overflow: hidden;
}

#app {
  background-color: #FFFFFF;
}

.box-white {
  scrollbar-color: #CAF3F5 #FFFFFF;

}
.box-deep {
  scrollbar-color: #143968 #010440;
}
.box-vibrant {
  scrollbar-color: #A7EBEF #dbfafc;
}
.box-thin {
  scrollbar-width: thin;
}
.box-invisible {
  scrollbar-color: #A7EBEF #dbfafc;
  scrollbar-width: none;
}
select:focus {
  outline: none;
}

select,
::picker(select) {
  appearance: base-select !important;
}
select option:first-of-type {
  display: none;
}

.pac-container {
  border-radius: 1rem;
  cursor: pointer;
  scrollbar-width: none;
  scrollbar-color: #CAF3F5 #ffffff;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  border: 2px solid #A7EBEF;
}
.pac-item {
  cursor: pointer;
  border: none;
  padding: 0.5rem 1rem 0.5rem 1rem;
}
.pac-item:hover {
  background-color: #A7EBEF !important;
}
.pac-item span:last-child {
  font-size: 1rem;
  font-family: onest;
  font-weight: 600;
}
.pac-item-query {
  color: #010440;
  font-size: 1rem;
  font-family: onest;
  font-weight: 600;
}
.pac-icon-marker {
  display: none;
}

.gm-control-active, .gm-fullscreen-control {
  display: hidden !important;
  opacity: 0;
  pointer-events: none;
}
.gm-style > div:last-child > div > *{
  display: none;
}
</style>
