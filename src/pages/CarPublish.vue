<script>
import Heading from "../components/atoms/Heading.vue";
import Sidebar from "../components/Sidebar.vue";
// import PublishPhotos from '../components/my-cars/PublishPhotos.vue';

import { subscribeToAuthState } from '../services/auth.js';
import { saveCars, subscribeToNewPublication } from '../services/publication.js'
import { validateStep1, validateStep2, validateStep3, validateStep4 } from '../services/validation-service.js'


let unsubscribeAuth = () => { };

export default {
  name: "Publish",
  components: { Heading, Sidebar },
  data() {
    return {
      loading: false,
      step: 1,
      selectedFiles: [null, null, null, null],
      photoPreview: ["", "", "", ""],
      cars: [],
      accessories: [
        { id: 'bt', name: 'Bluetooth' },
        { id: 'gps', name: 'GPS' },
        { id: 'wifi', name: 'Wi-Fi' },
        { id: 'revCam', name: 'Cámara de reversa' },
        { id: 'parkSense', name: 'Sensores de estacionamiento' },
        { id: 'cruiseCtrl', name: 'Control de crucero' },
        { id: 'heatSeat', name: 'Asientos calefactables' },
        { id: 'ac', name: 'Aire acondicionado' },
        { id: 'sunRoof', name: 'Techo solar' },
        { id: 'touchScreen', name: 'Pantalla Táctil' },
        { id: 'wirelessCharge', name: 'Carga inalámbrica' },
        { id: 'soundSystem', name: 'Sistema de sonido' },
        { id: 'abs', name: 'Frenos ABS' },
        { id: 'airbag', name: 'Airbag' },
        { id: 'laneAssist', name: 'Asistente de mantenimiento de carril' },
        { id: 'blindSpot', name: 'Control de punto ciego' },
        { id: 'tractionCtrl', name: 'Control de tracción' }
      ],

      newCar: {
        marca: "",
        modelo: "",
        año: "",
        patente: "",
        description: "",
        combustible: "",
        direccion: "",
        kilometraje: "",
        precio: "",
        chasis: "",
        motor: "",
        asientos: "",
        puertas: "",
        transmision: "",
        accessories: [],
        photos: []
      },
      loggedUser: {
        id: null,
        email: null,
        userName: null,
        lastName: null,
        name: null,
      },
      selectedPhotos: [],
      photoPreview: [],
      // Inicializamos errors que contiene todos los inputs que debe ingresar el usuario, que los vamos a usar más adelante para hacer las verificaciones
      errors: {
        marca: false,
        modelo: false,
        año: false,
        patente: false,
        description: false,
        direccion: false,
        combustible: false,
        kilometraje: false,
        precio: false,
        chasis: false,
        motor: false,
        asientos: false,
        puertas: false,
        transmision: false,
        accessories: false,
        photos: false
      }
    };
  },
  methods: {
    toggleAccessory(accessory) {
      const index = this.newCar.accessories.findIndex(acc => acc.id === accessory.id);
      if (index === -1) {
        this.newCar.accessories.push({ id: accessory.id, name: accessory.name });
      } else {
        this.newCar.accessories.splice(index, 1);
      }
    },
    validateStep1() {
      return validateStep1(this.newCar, this.errors);
    },
    validateStep2() {
      return validateStep2(this.newCar, this.errors);
    },
    validateStep3() {
      return validateStep3(this.newCar, this.errors);
    },
    validateStep4() {
      return validateStep4(this.selectedFiles, this.errors);
    },

    nextStep() {
      // Hacemos la validación antes de pasar al siguiente paso
      if (this.step === 1 && !this.validateStep1()) return;
      if (this.step === 2 && !this.validateStep2()) return;
      if (this.step === 3 && !this.validateStep3()) return;
      this.step += 1;
    },
    prevStep() {
      this.step -= 1;
    },

    getProgressPercentage() {
      return (this.step / 4) * 100;
    },

    handleFileSelection(index, event) {
      const file = event.target.files[0];
      if (file) {
        this.selectedFiles.splice(index, 1, file);
        this.photoPreview.splice(index, 1, URL.createObjectURL(file));
      }
    },

    async handleSubmit() {
      // PAra que nos aseguremos de la validación de todos los datos antes de enviar el formulario
      if (this.step === 1 && !this.validateStep1()) return;
      if (this.step === 2 && !this.validateStep2()) return;
      if (this.step === 3 && !this.validateStep3()) return;
      if (this.step === 4 && !this.validateStep4()) return;

      this.loading = true;

      try {
        // Generar un ID único para la publicación
        const carId = `${this.loggedUser.id}-${Date.now()}`;

        // Llamar a la función saveCars para guardar los datos del coche y las imágenes seleccionadas
        await saveCars({
          user_id: this.loggedUser.id,
          email: this.loggedUser.email,
          ...this.newCar
        }, this.selectedFiles, carId);

        // Reiniciar el formulario después de guardar
        this.newCar = {
          marca: "",
          modelo: "",
          año: "",
          patente: "",
          description: "",
          combustible: "",
          direccion: "",
          kilometraje: "",
          precio: "",
          chasis: "",
          motor: "",
          asientos: "",
          puertas: "",
          transmision: "",
          accessories: [],
          photos: []
        };

        this.selectedFiles = [null, null, null, null];
        this.photoPreview = ["", "", "", ""];

        this.$router.push('/Profile');
      } catch (error) {
        console.error("Error al guardar los datos del auto:", error);
      } finally {
        this.loading = false;
      }
    },

  },
  async mounted() {
    subscribeToNewPublication((newCar) => (this.cars = newCar));
    unsubscribeAuth = subscribeToAuthState(
      (newUserData) => (this.loggedUser = newUserData)
    );
  },
  unmounted() {
    unsubscribeAuth();
  },
};
</script>

<template>

  <form action="#" @submit.prevent="handleSubmit" class="max-w-md w-96 m-auto my-4 ">
    <Heading :type="1">Registrar vehículo</Heading>
    <div class="mb-8">
      <div class="progress-bar">
        <div class="progress-bar-fill" :style="{ width: getProgressPercentage() + '%' }"></div>
      </div>
      <span>{{ this.step }}/4</span>
    </div>

    <section v-if="step === 1">
      <div class="relative w-full group mb-10">
        <input type="text" name="marca" id="marca" v-model="newCar.marca" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 peer',
          errors.marca ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
          placeholder=" " />

        <!-- Párrafo para mostrar el mensaje de error -->
        <p v-if="errors.marca" class="text-red-500 text-xs italic mt-2">{{ errors.marca }}</p>

        <label for="marca"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:rtl:left-auto peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">
          Marca
        </label>
      </div>

      <div class="relative w-full  group mb-10">
        <input type="text" name="modelo" id="modelo" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 focus:border-[3px] peer',
          errors.modelo ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
          placeholder=" " v-model="newCar.modelo" />

        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.modelo" class="text-red-500 text-xs italic mt-2">{{ errors.modelo }}</p>
        <label for="modelo"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Modelo</label>
      </div>
      <div class="relative w-full  group mb-10">
        <input type="number" name="motor" id="año" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 focus:border-[3px] peer',
          errors.año ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']" placeholder=" "
          min="2005" max="2024" v-model="newCar.año" />

        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.año" class="text-red-500 text-xs italic mt-2">{{ errors.año }}</p>
        <label for="año"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Año</label>
      </div>
      <div class="relative w-full  group mb-10">
        <input type="text" name="patente" id="patente" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
          errors.patente ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
          placeholder=" " v-model="newCar.patente" />

        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.patente" class="text-red-500 text-xs italic mt-2">{{ errors.patente }}</p>

        <label for="patente"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Patente</label>
      </div>
      <button @click="nextStep" type="button"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2.5 text-center mt-5">Siguiente</button>
    </section>




    <section v-if="step === 2">
      <div class="relative w-full  group mb-10">

        <label for="description"
          class="peer-focus:font-large absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Descripción</label>
        <textarea v-model="newCar.description" id="description" name="description" rows="4"
          placeholder="Coloque una descripción"
          :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
            errors.description ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"></textarea>
        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.description" class="text-red-500 text-xs italic mt-2">{{ errors.description }}</p>
      </div>

      <div class="relative w-full  group mb-10">
        <input type="text" name="direccion" id="direccion" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
          errors.direccion ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
          placeholder=" " v-model="newCar.direccion" />

        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.direccion" class="text-red-500 text-xs italic mt-2">{{ errors.direccion }}</p>

        <label for="direccion"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Dirección</label>
      </div>

      <div class="relative w-full  group mb-10">
        <label for="underline_select" class="sr-only">Combustible</label>
        <select id="underline_select" name="combustible" v-model="newCar.combustible" :class="['block w-full py-2.5 px-0  text-gray-500 bg-transparent border-2 focus:outline-hidden focus:ring-0 peer ps-3 rounded-md',
          errors.combustible ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'
        ]">
          <option class="p-4" value="" disabled>Combustible</option>
          <option class="p-4">Nafta</option>
          <option class="p-4">Gasoil</option>
          <option class="p-4">GNC</option>
          <option class="p-4">Batería</option>
        </select>
        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.combustible" class="text-red-500 text-xs italic mt-2">{{ errors.combustible }}</p>
        <label for="underline_select" class="sr-only">Underline select</label>
      </div>

      <div class="relative w-full  group mb-10">
        <input type="number" name="kilometraje" id="kilometraje" :class="['block py-2.5 px-0 w-full ps-3 rounded-md bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
          errors.kilometraje ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
          placeholder=" " v-model="newCar.kilometraje" />
        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.kilometraje" class="text-red-500 text-xs italic mt-2">{{ errors.kilometraje }}</p>
        <label for="kilometraje"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Kilometraje</label>
      </div>

      <div class="relative w-full  group mb-10">
        <label for="underline_select" class="sr-only">Transmisión</label>
        <select id="underline_select" name="transmision" v-model="newCar.transmision" :class="['block w-full py-2.5 px-0  text-gray-500 bg-transparent border-2 focus:outline-hidden focus:ring-0 focus:border-gray-200 peer ps-3 rounded-md',
          errors.transmision ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'
        ]">
          >
          <option class="text-gray-300 ps-8" value="" disabled>Transmisión</option>
          <option class="ps-8" value="Manual">Manual</option>
          <option class="ps-8" value="Automático">Automático</option>
        </select>
        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.transmision" class="text-red-500 text-xs italic mt-2">{{ errors.transmision }}</p>

      </div>

      <button @click="prevStep" type="button"
        class="me-4 text-white bg-violet-400 hover:bg-zinc-600  focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2.5 text-center">Anterior</button>
      <button @click="nextStep" type="button"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2.5 text-center">Siguiente</button>


    </section>


    <section v-if="step === 3">
      <div class="grid md:grid-cols-2 md:gap-6">
        <div class="relative w-full  group mb-10">
          <label for="underline_select" class="sr-only">Chasis</label>
          <select id="underline_select" name="chasis" v-model="newCar.chasis" :class="['block w-full py-2.5 px-0  text-gray-500 bg-transparent border-2 focus:outline-hidden focus:ring-0 focus:border-gray-200 peer ps-3 rounded-md',
            errors.chasis ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'
          ]">
            <option class="text-gray-200 p-4" value="" disabled selected>Chasis</option>
            <option class="p-4">Hatchback</option>
            <option class="p-4">Sedán</option>
            <option class="p-4">Coupé</option>
            <option class="p-4">SUV</option>
            <option class="p-4">Deportivo</option>
            <option class="p-4">Pickup</option>
            <option class="p-4">Minivan</option>
            <option class="p-4">Van</option>
            <option class="p-4">Wagon</option>
            <option class="p-4">Convertible</option>
            <option class="p-4">Limusina</option>
            <option class="p-4">Furgoneta</option>
            <option class="p-4">Todoterreno</option>
            <option class="p-4">Autobús</option>
            <option class="p-4">Caravana</option>
          </select>
          <!-- Parrafo para mostrar el mensaje de error -->
          <p v-if="errors.chasis" class="text-red-500 text-xs italic mt-2">{{ errors.chasis }}</p>
          <label for="underline_select" class="sr-only">Underline select</label>
        </div>

        <div class="relative w-full  group mb-10">
          <input type="text" name="motor" id="motor" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
            errors.motor ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
            placeholder=" " v-model="newCar.motor" />
          <label for="motor"
            class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Motor</label>
          <!-- Parrafo para mostrar el mensaje de error -->
          <p v-if="errors.motor" class="text-red-500 text-xs italic mt-2">{{ errors.motor }}</p>
        </div>
      </div>
      <div class="grid md:grid-cols-2 md:gap-6">





        <div class="relative w-full  group mb-10">
          <input type="number" name="puertas" id="puertas" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
            errors.puertas ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
            placeholder=" " v-model="newCar.puertas" />
          <label for="puertas"
            class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">N°
            Puertas</label>
          <!-- Parrafo para mostrar el mensaje de error -->
          <p v-if="errors.puertas" class="text-red-500 text-xs italic mt-2">{{ errors.puertas }}</p>
        </div>
        <div class="relative w-full  group mb-10">
          <input type="number" name="asientos" id="asientos" :class="['block py-2.5 px-0 w-full ps-3 rounded-md text-gray-900 bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
            errors.asientos ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
            placeholder="" v-model="newCar.asientos" />
          <label for="asientos"
            class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">N°
            Asientos</label>
          <!-- Parrafo para mostrar el mensaje de error -->
          <p v-if="errors.asientos" class="text-red-500 text-xs italic mt-2">{{ errors.asientos }}</p>
        </div>
      </div>


      <div class="relative w-full  group mb-10">
        <input type="number" name="precio" id="precio" :class="['block py-2.5 px-0 w-full ps-3 rounded-md bg-transparent border-2 appearance-none focus:outline-hidden focus:ring-0 focus:border-[3px] peer',
          errors.precio ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600']"
          placeholder=" " v-model="newCar.precio" />
        <label for="precio"
          class="peer-focus:font-medium absolute ms-2 px-2 text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 bg-white">Precio/Día</label>
        <!-- Parrafo para mostrar el mensaje de error -->
        <p v-if="errors.precio" class="text-red-500 text-xs italic mt-2">{{ errors.precio }}</p>
      </div>

      <div class="relative w-full group mb-10">
        <h3 class="text-gray-700 font-semibold mb-2">Selecciona accesorios adicionales:</h3>
        <div v-for="accessory in accessories" :key="accessory.id" class="flex items-center mb-2">
          <input type="checkbox" :id="accessory.id" :value="accessory"
            :checked="newCar.accessories.some(acc => acc.id === accessory.id)" @change="toggleAccessory(accessory)" />
          <label :for="accessory.id" class="ml-2 text-gray-500">{{ accessory.name }}</label>
        </div>
        <p v-if="errors.accessories" class="text-red-500 text-xs italic mt-2">{{ errors.accessories }}</p>
      </div>

      <button @click="prevStep" type="button"
        class="me-4 text-white bg-violet-400 hover:bg-zinc-600  focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2.5 text-center">Anterior</button>
      <button @click="nextStep" type="button"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg  w-full sm:w-auto px-5 py-2.5 text-center">Siguiente</button>

    </section>


    <section v-if="step === 4" class="mx-auto">
      <div class="flex flex-wrap gap-4">
        <div v-for="index in 4" :key="index" class="image-input-container">
          <label :for="'file' + index" class="custom-file-upload">
            <div class="icon">
              <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="24" height="24">
                <path fill-rule="evenodd" clip-rule="evenodd"
                  d="M10 1C9.73478 1 9.48043 1.10536 9.29289 1.29289L3.29289 7.29289C3.10536 7.48043 3 7.73478 3 8V20C3 21.6569 4.34315 23 6 23H7C7.55228 23 8 22.5523 8 22C8 21.4477 7.55228 21 7 21H6C5.44772 21 5 20.5523 5 20V9H10C10.5523 9 11 8.55228 11 8V3H18C18.5523 3 19 3.44772 19 4V9C19 9.55228 19.4477 10 20 10C20.5523 10 21 9.55228 21 9V4C21 2.34315 19.6569 1 18 1H10ZM9 7H6.41421L9 4.41421V7ZM14 15.5C14 14.1193 15.1193 13 16.5 13C17.8807 13 19 14.1193 19 15.5V16V17H20C21.1046 17 22 17.8954 22 19C22 20.1046 21.1046 21 20 21H13C11.8954 21 11 20.1046 11 19C11 17.8954 11.8954 17 13 17H14V16V15.5ZM16.5 11C14.142 11 12.2076 12.8136 12.0156 15.122C10.2825 15.5606 9 17.1305 9 19C9 21.2091 10.7909 23 13 23H20C22.2091 23 24 21.2091 24 19C24 17.1305 22.7175 15.5606 20.9844 15.122C20.7924 12.8136 18.858 11 16.5 11Z">
                </path>
              </svg>
            </div>
            <div class="text">
              <span>Click para subir imagen</span>
            </div>
            <input type="file" @change="handleFileSelection(index - 1, $event)" :id="'file' + index" />
          </label>
          <p v-if="errors.photos" class="text-red-500 text-xs italic mt-2">{{ errors.photos }}</p>

          <div v-if="photoPreview[index - 1]" class="image-preview">
            <img :src="photoPreview[index - 1]" class="rounded-md border border-gray-300" />
          </div>
        </div>
      </div>

      <div class="mt-4">
        <button @click="prevStep" type="button"
          class="me-4 text-white bg-violet-400 hover:bg-zinc-600 focus:ring-4 focus:outline-hidden focus:ring-blue-300 font-medium rounded-lg w-full sm:w-auto px-5 py-2.5 text-center">
          Anterior
        </button>
        <button type="submit" :disabled="loading"
          :class="{ 'bg-gray-400 cursor-not-allowed': loading, 'bg-blue-700 hover:bg-blue-800': !loading }"
          class="text-white font-medium rounded-lg w-full sm:w-auto px-5 py-2.5 text-center">
          {{ loading ? "Cargando..." : "Finalizar" }}
        </button>
      </div>
    </section>
  </form>
</template>

<style scoped>
.progress-bar {
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: .3rem;
}

.progress-bar-fill {
  height: 100%;
  background-color: #020041;
  transition: width 0.3s ease;
}


.custom-file-upload {
  display: block;
  width: 100%;
  padding: 10px;
  background-color: #f7f7f7;
  border: 1px solid #ccc;
  text-align: center;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.custom-file-upload:hover {
  background-color: #e6e6e6;
}

.icon svg {
  width: 30px;
  height: 30px;
  fill: #888;
}

.text {
  margin-top: 8px;
  font-size: 14px;
  color: #444;
}

.image-input-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 1rem;
}

.image-preview {
  margin-top: 10px;
  width: 100%;
  max-width: 200px;
}

.image-preview img {
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
</style>
