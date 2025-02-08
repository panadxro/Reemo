import "./style.css";
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/router";
import VueGoogleMaps from "@fawmi/vue-google-maps";

const app = createApp(App);

app.use(router);
app.use(VueGoogleMaps, {
    load: {
      key: "VITE_GOOGLE_MAPS_API_KEY",
      libraries: "marker",
      v: "beta",
    },
  });


app.mount("#app");
