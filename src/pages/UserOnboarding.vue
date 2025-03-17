<script>
export default {
  data() {
    return {
      currentStep: 0, // Paso actual
      steps: [
        { title: "Información Básica" },
        { title: "Información Legal" },
        { title: "Información de Pago" },
        { title: "Preferencias y Términos" },
      ],
      user: {
        fullName: "",
        birthDate: "",
        phone: "",
        documentType: "",
        documentNumber: "",
        licenseNumber: "",
        paymentMethod: "",
        cardNumber: "",
        cardExpiryDate: "",
        acceptedTerms: false,
        acceptedRegulations: false,
      },
    };
  },
  methods: {
    nextStep() {
      if (this.currentStep < this.steps.length - 1) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    handleSubmit() {
      // Lógica para enviar el formulario
      console.log("Perfil guardado:", this.user);
    },
  },
};




/* 
import Heading from '../components/atoms/Heading.vue';
import { editMyProfile, subscribeToAuthState } from '../services/auth';

import AddImg from '../icons/addImg.vue';
import EditPhotoModal from '../components/user/EditPhotoModal.vue';

let unsubscribeAuth = () => { };

export default {
  name: 'UserOnboarding',
  components: { Heading, AddImg, EditPhotoModal },
  data() {
    return {
      editData: {
        userName: null,
        name: null,
        lastName: null,
        photo: null,
        photoPreview: null,
        photoURL: '',
      },
      errorMessage: '',
      editing: false
    };
  },
  methods: {
    async handleSubmit() {
      if (this.editing) return;

      if (!this.editData.userName || !this.editData.name || !this.editData.lastName) {
        this.errorMessage = 'Por favor completa todos los campos.';
        return;
      }

      this.editing = true;

      try {
        const updatedData = {
          ...this.editData,
          photo: this.editData.photo ? this.editData.photo : this.editData.photoURL
        };

        await editMyProfile(updatedData);
        console.log("Perfil editado con éxito")
        this.$router.push('/profile');
      } catch (error) {
        console.error(error);
      } finally {
        this.editing = false;
      }
    },
    // Previsualizar y guardar el archivo seleccionado
    handleFileSelection(ev) {
      const file = ev.target.files[0] || null;
      if (file && file.type.startsWith('image/')) {
        this.editData.photo = file;
        const reader = new FileReader();
        reader.onload = () => {
          this.editData.photoPreview = reader.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.errorMessage = 'Por favor selecciona una imagen válida.';
      }
    },
    openModal() {
      this.$refs.EditPhotoModal.open();
    }
  },
  mounted() {
    unsubscribeAuth = subscribeToAuthState(userData => this.editData = {
      userName: userData.userName || '',
      name: userData.name || '',
      lastName: userData.lastName || '',
      photoURL: userData.photoURL || '',
      photoPreview: userData.photoURL || '',
      photo: null,
    });
  },
  unmounted() {
    unsubscribeAuth();
  } 
}
*/
</script>

<template>
  <div class="wizard">
    <!-- Indicador de progreso -->
    <div class="progress-bar">
      <div v-for="(step, index) in steps" :key="index" :class="{ active: currentStep === index }">
        Paso {{ index + 1 }}: {{ step.title }}
      </div>
    </div>

    <!-- Formulario por pasos -->
    <form @submit.prevent="handleSubmit">
      <!-- Paso 1: Información Básica -->
      <div v-if="currentStep === 0" class="step">
        <h2>Información Básica</h2>
        <Input v-model="user.fullName" label="Nombre completo" required />
        <Input v-model="user.birthDate" type="date" label="Fecha de nacimiento" required />
        <Input v-model="user.phone" label="Número de teléfono" required />
      </div>

      <!-- Paso 2: Información Legal -->
      <div v-if="currentStep === 1" class="step">
        <h2>Información Legal</h2>
        <Input v-model="user.documentType" label="Tipo de documento" required />
        <Input v-model="user.documentNumber" label="Número de documento" required />
        <Input v-model="user.licenseNumber" label="Número de licencia de conducir" required />
      </div>

      <!-- Paso 3: Información de Pago -->
      <div v-if="currentStep === 2" class="step">
        <h2>Información de Pago</h2>
        <Input v-model="user.paymentMethod" label="Método de pago" required />
        <Input v-model="user.cardNumber" label="Número de tarjeta" required />
        <Input v-model="user.cardExpiryDate" type="date" label="Fecha de vencimiento" required />
      </div>

      <!-- Paso 4: Preferencias y Términos -->
      <div v-if="currentStep === 3" class="step">
        <h2>Preferencias y Términos</h2>
        <Checkbox v-model="user.acceptedTerms" label="Acepto los términos y condiciones" required />
        <Checkbox v-model="user.acceptedRegulations" label="Acepto las normativas de conducción" required />
      </div>

      <!-- Botones de navegación -->
      <div class="navigation-buttons">
        <button type="button" @click="prevStep" :disabled="currentStep === 0">Anterior</button>
        <button type="button" @click="nextStep" :disabled="currentStep === steps.length - 1">Siguiente</button>
        <button v-if="currentStep === steps.length - 1" type="submit">Guardar perfil</button>
      </div>
    </form>
  </div>








  <!-- <div v-if="editing" class="mb-8 flex items-center justify-center w-fit mx-auto bg-gray-50">
    <div role="status">
      <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor" />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill" />
      </svg>
      <span class="sr-only">Cargando...</span>
    </div>
  </div>
  <form action="#" @submit.prevent="handleSubmit" class="max-w-md w-96 m-auto">
    <Heading :type="1">Editar mi Perfil</Heading>
    <div v-if="errorMessage" class="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50" role="alert">
      {{ errorMessage }}
    </div>
    <div class="relative">
      <figure class="flex items-center justify-center w-full mb-5">
        <img v-if="editData.photoPreview" :src="editData.photoPreview" alt="Perfil" class="w-24 h-24 rounded-full" />
        <img v-else-if="editData.photoURL" :src="editData.photoURL" alt="Perfil" class="w-24 h-24 rounded-full" />
        <img v-else src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png"
          alt="Perfil" class="w-24 h-24 rounded-full" />
      </figure>
      <div class="absolute inset-0 flex items-center justify-center">
        <label for="photo" class="w-24 aspect-square rounded-full flex items-center justify-center cursor-pointer">
          <span class="sr-only">Seleccionar foto</span>
        </label>
        <button type="button" id="photo" @click="openModal" class="hidden"></button>
      </div>
    </div>
    <EditPhotoModal ref="EditPhotoModal" :editData="editData" />
    <div class="relative z-0 w-full mb-5 group">
      <input id="userName"
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 peer"
        placeholder=" " v-model="editData.userName">
      <label for="userName"
        class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre
        de usuario</label>
    </div>
    <div class="relative z-0 w-full mb-5 group">
      <input type="text" id="name" placeholder=" "
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 peer"
        v-model="editData.name">
      <label for="name"
        class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre</label>
    </div>
    <div class="relative z-0 w-full mb-5 group">
      <input type="text" id="lastName" placeholder=" "
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 peer"
        v-model="editData.lastName">
      <label for="lastName"
        class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Apellido</label>
    </div>
    <button type="submit"
      class="transition-all py-2 px-4 rounded-sm bg-blue-700 text-white focus:bg-blue-500 hover:bg-blue-500 active:bg-blue-900">
      {{ !editing ? 'Aceptar' : 'Guardando...' }}
    </button>
  </form> -->
</template>

<style>
.wizard {
  max-width: 600px;
  margin: 0 auto;
}
.progress-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}
.progress-bar div {
  flex: 1;
  text-align: center;
  padding: 10px;
  border-bottom: 2px solid #ccc;
}
.progress-bar div.active {
  border-bottom: 2px solid #007bff;
}
.navigation-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
</style>