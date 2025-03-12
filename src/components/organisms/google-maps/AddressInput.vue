<template>
  <div>
    <input
      id="autocomplete"
      type="text"
      :value="modelValue"
      placeholder="Ingresa una dirección"
      :class="['input block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-none focus:ring-0 peer']"
      style="width: 100%; padding: 8px;"
    />
  </div>
</template>

<script>
import { Loader } from "@googlemaps/js-api-loader";

export default {
  props: {
    modelValue: String,
  },
  emits: ["update:modelValue"],
  mounted() {
    this.loadGoogleMaps();
  },
  methods: {
    async loadGoogleMaps() {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: ["places", "geometry"], // Necesario para el autocompletado
      });

      try {
        await loader.load();
        this.initAutocomplete();
      } catch (error) {
        console.error("Error al cargar Google Maps:", error);
      }
    },
    initAutocomplete() {
      const input = document.getElementById("autocomplete");

      const autocomplete = new google.maps.places.Autocomplete(input, {
        types: ["geocode"],
        componentRestrictions: { country: "AR" }, // Restringir a Argentina
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();

        if (place.geometry) {
          // const selectedAddress = place.formatted_address;

          const selectedData = {
            address: place.formatted_address,
            location: place.geometry.location.toJSON(), // lat y lng
          };

          this.$emit("update:modelValue", selectedData.address); // actualizar v-model
          this.$emit("addressSelected", selectedData); // Emitir al padre
        } else {
          console.error("No se pudo obtener la dirección.");
        }
      });
    },
  },
};
</script>



