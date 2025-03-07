<script>
export default {
  props: {
    condition: {
      type: String,
      required: true,
      validator: (value) => {
        // Lista de conditions válidos
        return [
          "validado",
          "no-validado",
          "nuevo",
          "alquilado",
          "disponible",
          "bloqueado",
        ].includes(value);
      },
    },
  },
  computed: {
    statusText() {
      // Mapeo de conditions a textos
      const textos = {
        validado: "Validado",
        "no-validado": "No Validado",
        nuevo: "Nuevo",
        alquilado: "Alquilado",
        disponible: "Disponible",
        bloqueado: "Bloqueado",
      };
      return textos[this.condition] || "Desconocido";
    },
    statusClass() {
      // Mapeo de conditions a clases de estilo
      const clases = {
        validado: "bg-vibrant-light-700 text-deep-blue-900",
        "no-validado": "bg-red-100 text-red-800",
        nuevo: "bg-green-100 text-green-800",
        alquilado: "bg-yellow-100 text-yellow-800",
        disponible: "bg-blue-100 text-blue-800",
        bloqueado: "bg-gray-100 text-gray-800",
      };
      return clases[this.condition] || "bg-gray-100 text-gray-800"; // Estilo por defecto
    },
  },
};
</script>

<template>
  <span :class="statusClass" class="px-4 py-2 rounded-2xl text-sm font-semibold flex items-center">
    {{ statusText }}
  </span>
</template>