import "./style.css";
import { createPinia } from 'pinia'
import { createApp } from "vue";
import { useAuthStore } from './stores/auth.store';

import App from "./App.vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import router from "./router/router";
import VueGoogleMaps from "@fawmi/vue-google-maps";

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(VueGoogleMaps, {
  load: {
    key: "VITE_GOOGLE_MAPS_API_KEY",
    libraries: "marker",
    v: "beta",
  },
});
  
app.use(pinia);
pinia.use(piniaPluginPersistedstate)
const authStore = useAuthStore(pinia);
authStore.init();
app.mount("#app");