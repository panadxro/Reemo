<script>
// molecules
export default {
  name: "User",
  props: {
    user: {
      type: Object,
      required: true,
    },
  },
};
</script>

<template>
  <div
    class="max-w-md w-96 mx-auto p-4 sm:px-8 sm:py-4 flex rounded-xl items-center bg-blue-100"
  >
    <div class="shrink-0">
      <img
        v-if="user.photoURL"
        class="w-8 h-8 rounded-full"
        :src="`${user.photoURL}`"
        :alt="`Foto de perfil de ${user.userName}`"
      />
      <!-- <img v-else :src="`https://unavatar.io/${user.userName}`" alt="Foto de perfil inexistente"> -->
    </div>
    <div class="flex-1 min-w-0 ms-4">
      <h2 class="text-lg font-semibold text-gray-900 truncate">
        {{ user.name }} {{ user.lastName }}
      </h2>
      <p class="text-sm text-gray-500 truncate">
        {{ user.userName }}
      </p>
    </div>
    <div class="inline-flex items-center text-base font-semibold text-gray-900">
      <router-link to="/Profile/Edit" class="text-blue-700 underline"
        >Editar</router-link
      >
    </div>
  </div>
</template>
