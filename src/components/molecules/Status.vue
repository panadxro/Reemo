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
          "not-available",
          "blocked",
          "confirmed",
          "pending",
          "rejected",
          "cancelled_by_user",
          "cancelled_by_owner",
          "returned_by_driver",
          "in_progress",
          "completed"
        ].includes(value);
      },
    },
    size: {
      type: String,
      default: "medium", // 'medium' o 'small'
      validator: (value) => ["medium", "small", "mini"].includes(value),
    }
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
        confirmed: "Confirmado",
        pending: "Pendiente",
        rejected: "Rechazado",
        completed: "Completado",
        "in_progress": "En progreso",
        "returned_by_driver": "Devuelto por el conductor",
        "cancelled_by_owner": "Cancelado por el propietario",
        "cancelled_by_user": "Cancelado por el usuario", 
        "not-available": "No disponible",
        "not-verified": "No verificado",
      };
      return textos[this.status] || "Desconocido";
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
        confirmed: "bg-green-100 text-green-800",
        pending: "bg-yellow-100 text-yellow-800",
        rejected: "bg-red-100 text-red-800",
        completed: "bg-green-100 text-green-800",
        "in_progress": "bg-blue-100 text-blue-800",
        "returned_by_driver": "bg-blue-100 text-blue-800",
        "cancelled_by_owner": "bg-red-100 text-red-800",
        "cancelled_by_user": "bg-red-100 text-red-800",
        "not-available": "bg-red-100 text-red-800",
        "not-verified": "bg-red-100 text-red-800",
      };
      return clases[this.status] || "bg-gray-100 text-gray-800";
    },
    sizeClass() {
      return {
        'medium': 'px-4 py-2 text-sm rounded-2xl',
        'small': 'px-2.5 py-2 text-xs rounded-lg',
        'mini': 'px-2 py-1 text-xs rounded-lg',
      }[this.size]
    }
  },
};
</script>

<template>
  <details class="group inline relative">
    <summary 
      :class="[statusClass, sizeClass]" 
      class="font-semibold flex items-center">
      {{ statusText }}
    </summary>
    <div v-if="$slots.message"
      class="absolute z-4 hidden group-hover:block min-w-[250px] md:min-w-[300px] mt-1 p-0"
      :class="{
        'left-0': true,
        'right-0 ': false
      }">
        <slot name="message"></slot>
    </div>
  </details>
</template>