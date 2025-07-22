<script setup>
import { watch, markRaw, shallowRef, defineAsyncComponent, provide } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'


import DefaultLayout from '@layouts/DefaultLayout.vue'
import SimpleLayout from "@layouts/SimpleLayout.vue"
import DashboardLayout from '@layouts/DashboardLayout.vue'
import UserLayout from '@layouts/UserLayout.vue'
import MapsLayout from '@layouts/MapsLayout.vue'

const Alert = defineAsyncComponent(() => import('@/components/atoms/Alert.vue'))
const authStore = useAuthStore()
const route = useRoute()

provide('authStore', authStore);

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
  '/notification': 'dashboard',
  
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

</script>

<template>
  <component :is="currentLayout">
    <router-view />
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
</style>
