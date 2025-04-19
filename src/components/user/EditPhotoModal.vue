<script>
import { addAlert } from '../../services/alerts';

import AddImg from '@icons/addImg.vue';

export default {
  name: "EditPhotoModal",
  props: ['editData'],
  components: { AddImg },
  data() {
    return {
      isVisible: false,
      editing: false,
      /*       editData: {
              photo: null,
              photoPreview: null,
              photoURL: '',
            }, */
    };
  },
  methods: {
    async handleSubmit() {
      if (this.editing) return;
      if (!this.editData.photo) {
        addAlert('Por favor selecciona una imagen', 'error');
        return;
      }
      this.editing = true;
      try {
        addAlert('Foto editada con éxito', 'success');
        this.initialData = { ...this.editData };
        this.close();
      } catch (error) {
        addAlert('Error al editar la foto', 'error');
      } finally {
        this.editing = false;
      }
    },
    handleFileSelection(ev) {
      this.editData.photo = ev.target.files[0] || null;

      if (this.editData.photo) {
        const reader = new FileReader();
        reader.onload = () => {
          this.editData.photoPreview = reader.result;
        };
        reader.readAsDataURL(this.editData.photo);
        this.handleSubmit();
      } else {
        this.editData.photoPreview = null;
      }
    },
    open() {
      this.isVisible = true;
    },

    close() {
      this.isVisible = false;
    },

  },
};
</script>

<template>
  <div v-if="isVisible" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50"
    @click.self="close">
    <!-- Imagen de perfil -->
    <div class="relative flex flex-col items-center">
      <img v-if="editData.photoPreview" :src="editData.photoPreview" alt="Perfil" class="w-48 h-48 rounded-full" />
      <img v-else-if="editData.photoURL" :src="editData.photoURL" alt="Perfil" class="w-48 h-48 rounded-full" />
      <div class="absolute inset-0 flex items-center justify-center space-x-4">
        <form action="#" @submit.prevent="handleSubmit">
          <label for="photoURL"
            class="w-24 w-24 aspect-square rounded-full flex items-center justify-center cursor-pointer">
            <AddImg />
            <span class="sr-only">Seleccionar foto</span>
          </label>
          <input type="file" id="photoURL" class="bg-green-500 text-white px-4 py-2 rounded-sm hidden"
            @change="handleFileSelection">
          <!--             <button type="submit" class="bg-red-500 text-white px-4 py-2 rounded-sm"
            >
              {{ !editing ? 'Actualizar Foto' : 'Actualizando...' }}
            </button> -->
        </form>
        <!-- Botones de acción -->

      </div>
    </div>
  </div>
</template>
