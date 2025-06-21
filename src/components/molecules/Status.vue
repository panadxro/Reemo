<script>
export default {
  props: {
    status: {
      type: String,
      required: true,
      validator: (value) => {
        return [
          "registered", // Nuevo estado
          "validated",
          "not-validated",
          "verified",
          "not-verified",
          "new",
          "rented",
          "available",
          "blocked",
        ].includes(value);
      },
    },
  },
  computed: {
    statusText() {
      const textos = {
        registrado: "Registrado",
        validated: "Validado",
        "not-validated": "No validado",
        new: "Nuevo",
        rented: "Alquilado",
        available: "Disponible",
        blocked: "Bloqueado",
        verified: "Verificado",
        "not-verified": "No verificado",
      };
      return textos[this.status] || "Unknown";
    },
    statusClass() {
      const clases = {
        registrado: "bg-purple-100 text-purple-800", // Estilo para el nuevo estado
        validated: "bg-vibrant-light-700 text-deep-blue-900",
        "not-validated": "bg-red-100 text-red-800",
        new: "bg-green-100 text-green-800",
        rented: "bg-yellow-100 text-yellow-800",
        available: "bg-blue-100 text-blue-800",
        blocked: "bg-gray-100 text-gray-800",
        verified: "bg-green-100 text-green-800",
        "not-verified": "bg-red-100 text-red-800",
      };
      return clases[this.status] || "bg-gray-100 text-gray-800";
    },
  },
};
</script>

<template>
  <span :class="statusClass" class="px-4 py-2 rounded-2xl text-sm font-semibold flex items-center">
    {{ statusText }}
  </span>
</template>