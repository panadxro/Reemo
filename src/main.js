import "./style.css";
import { createApp } from "vue";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import { createPinia } from 'pinia'
import App from "./App.vue";
import router from "./router/router";
import VueGoogleMaps from "@fawmi/vue-google-maps";

const app = createApp(App);
const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)

app.use(router);
app.use(VueGoogleMaps, {
    load: {
      key: "VITE_GOOGLE_MAPS_API_KEY",
      libraries: "marker",
      v: "beta",
    },
  });

app.use(pinia)
app.mount("#app");
