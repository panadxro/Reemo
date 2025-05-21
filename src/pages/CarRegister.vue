<script setup>
import { ref, markRaw, onMounted, onBeforeUnmount, computed, reactive } from 'vue';
import { useAuthStore, useUserStore, useGeoStore } from '@stores'
import { useRouter } from "vue-router";
import { addAlert } from "../services/alerts.js";

import Heading from '../components/atoms/Heading.vue';
import Input from '../components/molecules/Input.vue';
import Checkbox from '../components/atoms/Checkbox.vue';
import LongArrow from '../icons/LongArrow.vue';
import Reemo from '../icons/Reemo.vue';
import DropdownForm from '../components/molecules/DropdownForm.vue';
import DriverFront from '../components/atoms/DriverFront.vue';
import Loading from '@icons/Loading.vue';
import Car from "@icons/Car.vue";
import Velocimetre from "@icons/Velocimetre.vue";
import Equipment from "@icons/Equipment.vue";
import Locate from "@icons/Locate.vue";
import History from "@icons/History.vue";
import Images from "@icons/Images.vue";
import Secure from "@icons/Secure.vue";
import Search from "@icons/Search.vue"

const authStore = useAuthStore();
const userStore = useUserStore();
const geoStore = useGeoStore();
const router = useRouter();

const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

const loggedUserId = computed(() => authStore.user?.id);
const personalInfo = computed(() => userStore.personalInfo);
const documents = computed(() => userStore.documents);
const address = computed(() => userStore.address);
const paymentMethods = computed(() => userStore.paymentMethods);
const agreements = computed(() => userStore.agreements);

const currentStep = ref(0);
const filePreviews = reactive({
  profilePhoto: null,
  profilePhotoFile: null,
  dniFront: null,
  dniFrontFile: null,
  dniBack: null,
  dniBackFile: null,
  driverLicenseFront: null,
  driverLicenseFrontFile: null,
  driverLicenseBack: null,
  driverLicenseBackFile: null,
});

const loading = ref(false)
const sections = ref([
  { title: 'Información básica', icon: markRaw(Car) },
  { title: 'Especificaciones técnicas', icon: markRaw(Velocimetre) },
  { title: 'Equipamiento y características', icon: markRaw(Equipment) },
  { title: 'Ubicación y disponibilidad', icon: markRaw(Locate) },
  { title: 'Políticas y tarifas', icon: markRaw(History) },
  { title: 'Fotos del vehículo', icon: markRaw(Images) },
  { title: 'Información de seguro', icon: markRaw(Secure) },
])

const handleFileChange = async (event, field) => {
  const file = event.target.files[0];
  if (file) {
    // Creamos la previsualización
    filePreviews[field] = URL.createObjectURL(file);
    filePreviews[`${field}File`] = file;
  }
};

const nextStep = () => {
  if (currentStep.value < sections.value.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const cargarCiudades = () => {
  userStore.setCity(''); // Reinicia la ciudad seleccionada
  userStore.setCities(geoStore.getCiudadesPorProvincia(address.value.province) || []);
};

const days = [
  { label: 'L', value: 'monday' },
  { label: 'M', value: 'tuesday' },
  { label: 'X', value: 'wednesday' },
  { label: 'J', value: 'thursday' },
  { label: 'V', value: 'friday' },
  { label: 'S', value: 'saturday' },
  { label: 'D', value: 'sunday' }
];

// Días seleccionados (solo para demostración visual)
const selectedDays = ref(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);

const handleSubmit = async () => {
  // Basic validation example
  if (!agreements.value.acceptedTerms || !agreements.value.acceptedPrivacyPolicy) {
    addAlert('Debes aceptar los términos y políticas', 'error')
    return
  }
  loading.value = true
    try {
      // 1. Upload files
      const uploadPromises = [];

      console.log(filePreviews.profilePhotoFile instanceof File)
      if (filePreviews.profilePhotoFile instanceof File) {
        uploadPromises.push(
          userStore.uploadFile(loggedUserId.value, filePreviews.profilePhotoFile, 'profile/avatar.jpg', 'profilePhoto')
        );
      }
      if (filePreviews.dniFrontFile instanceof File) {
        uploadPromises.push(
          userStore.uploadFile(loggedUserId.value, filePreviews.dniFrontFile, 'documents/dni_front.jpg', 'dniFront')
        );
      }
      if (filePreviews.dniBackFile instanceof File) {
        uploadPromises.push(
          userStore.uploadFile(loggedUserId.value, filePreviews.dniBackFile, 'documents/dni_back.jpg', 'dniBack')
        );
      }
      if (filePreviews.driverLicenseFrontFile instanceof File) {
        uploadPromises.push(
          userStore.uploadFile(loggedUserId.value, filePreviews.driverLicenseFrontFile, 'documents/drive_front.jpg', 'driverLicenseFront')
        );
      }
      if (filePreviews.driverLicenseBackFile instanceof File) {
        uploadPromises.push(
          userStore.uploadFile(loggedUserId.value, filePreviews.driverLicenseBackFile, 'documents/driver_back.jpg', 'driverLicenseBack')
        );
      }
      console.log(uploadPromises)
      await Promise.all(uploadPromises);

      // Update profile
      await userStore.updateProfile(loggedUserId.value, {
        personalInfo: userStore.personalInfo,
        documents: userStore.documents,
        address: userStore.address,
        paymentMethods: userStore.paymentMethods,
        agreements: userStore.agreements
      })

      addAlert('!Usuario completado con éxito!', 'success');
      router.push('/search');
    } catch (error) {
      console.error('Error en onboarding:', error);
      addAlert('Error al cargar los datos de usuario.', 'error');
    } finally {
      loading.value = false
    }
};

const handleBeforeUnload = (event) => {
  const message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
  event.preventDefault();
  event.returnValue = message;
  return message;
};

// Load initial data
onMounted(async () => {
  // window.addEventListener('beforeunload', handleBeforeUnload);
  await userStore.loadUserProfile(authSession.user.id);
  await geoStore.loadProvinciasYLocalidades();
});

onBeforeUnmount(() => {
  // window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
  <section class="flex max-w-[1120px] max-h-[675px] h-full w-full mx-auto justify-between px-16 py-12 bg-vibrant-light-600 rounded-[40px] text-deep-blue-900 overflow-hidden">
    <!-- Secciones al costado -->
    <aside class="flex flex-col gap-8 w-full max-w-[425px]">
      <div class="flex flex-col gap-2">
        <Heading type="1" class="large text-deep-blue-900 font-extrabold!">Registrar vehículo</Heading>
        <p class="text-sm max-w-[420px]">Subscribí tu vehículo a la plataforma y haz que trabaje por vos.</p>
      </div>
      <ul class="sections-sidebar">
        <li
          v-for="(section, index) in sections"
          :key="index"
          :class="{ active: currentStep === index }"
          class="section-item"
        >
          <div class="flex items-center gap-4">
            <component :is="section.icon" />
            <Heading type="3" class="regular text-deep-blue-900">
              {{ section.title }}
            </Heading>
          </div>
          <span>
            <LongArrow direction="right" class="hidden" color="#ffffff" :class="{ '!block': currentStep === index}"/>
          </span>
        </li>
      </ul>
    </aside>

    <!-- Formulario dinámico -->
    <section class="max-h-[568px]">
      <form
        class="flex flex-col justify-center gap-9 grow w-full max-w-[425px]"
        @submit.prevent="handleSubmit"
      >
        <div class="flex justify-end">
          <Reemo />
        </div>

        <!-- Paso 1: Información básica -->
        <router-view v-if="currentStep === 0">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Información básica</Heading>
            <Loading v-if="!userStore.profileLoaded" role="status" />
          </div>
          <p class="text-sm font-medium">Ingresá los datos principales del vehículo. Esta información ayuda a identificar correctamente el auto y mostrarlo a los usuarios interesados.</p>

          <div class="flex flex-col gap-5">      
            <div class="flex gap-5">
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Marca"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              />
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Modelo"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              />            
            </div>
            <div class="flex gap-5">
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Año"
                :options="Array.from({ length: new Date().getFullYear() - 2009 }, (_, i) => ({
                  value: 2010 + i,
                  label: (2010 + i).toString()
                }))"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-25"
              />
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Tipo de chasis"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-45"
              /> 
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Color"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-30"
              /> 
            </div>  
            <div class="flex gap-5">
              <Input type="text" placeholder="Patente" :variant="'secondary'" :outline="true" required />
              <Input type="text" placeholder="Kilometraje" :variant="'secondary'" :outline="true" required />
            </div>           
          </div>
        </router-view>

        <!-- Paso 2: Especificaciones técnicas -->
        <router-view v-if="currentStep === 1">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Especificaciones técnicas</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <p class="text-sm font-medium">Completá las características técnicas del vehículo. Las opciones se adaptan según la marca y el modelo del vehículo, para que puedas seleccionar solo lo que corresponde a tu modelo.</p>

          <div class="flex flex-col gap-5">
            <div class="flex gap-5">
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Motor"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              />
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Transmisión"
                v-model="selectedTransmission"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              /> 
            </div>
            <div class="flex gap-5">
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Combustible"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full cursor-pointer"
              />
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Tracción"
                :options="[
                  { value: 'male', label: 'Masculino' },
                  { value: 'female', label: 'Femenino' },
                  { value: 'other', label: 'Otro' },
                  { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full cursor-pointer"
              />            
            </div> 
            <div class="flex gap-5">
              <Input type="text" placeholder="Consumo" :variant="'secondary'" :outline="true" required />
              <Input type="text" placeholder="Puertas" :variant="'secondary'" :outline="true" required />
              <Input type="text" placeholder="Asientos" :variant="'secondary'" :outline="true" required />
            </div>
          </div>
        </router-view>

        <!-- Paso 3: Equipamiento y características -->
        <router-view v-if="currentStep === 2">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Equipamiento y características</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-5">
            <Input
              type="select"
              name="tecnologia-conectividad"
              id="tecnologia-conectividad"
              placeholder="Buscar características"
              :options="[
                { value: 'male', label: 'Pantalla táctil' },
                { value: 'female', label: 'Apple CarPlay/Android Auto' },
                { value: 'other', label: 'Bluetooth' },
                { value: 'other', label: 'GPS' },
                { value: 'other', label: 'Sonido premium' },
                { value: 'other', label: 'Asistente virtual integrado' },
                { value: 'other', label: 'Sensores de estacionamiento 360°' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="w-full cursor-pointer"
            />   
            <DropdownForm title="Tecnología y conectividad" :section-id="'section-1'" :dropdown-id="'tecnologia-conectividad'" :is-initial="true">
        
            </DropdownForm>
            <DropdownForm title="Seguridad y Asistencia" :section-id="'section-1'" :dropdown-id="'seguridad-asistencia'">
                  
            </DropdownForm>
            <DropdownForm title="Performance" :section-id="'section-1'" :dropdown-id="'performance'">
                 
            </DropdownForm>
            <DropdownForm title="Confort" :section-id="'section-1'" :dropdown-id="'confort'">
                
            </DropdownForm>
          </div>
        </router-view>
 
        <!-- Paso 4: Ubicación y disponibilidad -->
        <router-view v-if="currentStep === 3" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Ubicación y disponibilidad</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-5">
            <Input type="text" placeholder="Direccion" :variant="'secondary'" :outline="true" iconPosition="right" required>
              <template #icon>
                <Search color="#7b7b7b"/>
              </template>
            </Input>

            <div class="w-full h-[120px] bg-background-700 flex flex-col items-center justify-center text-background-600 rounded-[23px]">
              <h4 class="font-semibold">Mapa</h4>
              <p>Esto hacelo vos Yoel</p>
            </div>

            <div class="w-full h-full bg-vibrant-light-700 flex flex-col items-center justify-center rounded-[23px] p-4">
              <Heading type="5" class="mb-6">Días activo</Heading>
              
              <!-- Selector de días -->
              <div class="flex gap-4 mb-8">
                <div 
                  v-for="(day, index) in days" 
                  :key="index"
                  class="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-deep-blue-900 font-semibold"
                  :class="selectedDays.includes(day.value) ? 'bg-vibrant-light-900' : ''"
                >
                  {{ day.label }}
                </div>
              </div>
              
              <!-- Selector de horario -->
              <div class="flex w-full max-w-xs gap-4 font-bold">
                <div class="flex-1 flex flex-col items-center">
                  <label for="desde">Desde</label>
                  <div id="desde">08:00 AM</div>
                </div>
                <div class="flex-1 flex flex-col items-center">
                  <label for="hasta">Hasta</label>
                  <div id="hasta">05:00 PM</div>
                </div>
              </div>
            </div>

          </div>
        </router-view>

        <!-- Paso 5: Políticas y tarifas -->
        <router-view v-if="currentStep === 4" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Políticas y tarifas</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <p class="text-sm font-medium">Establecé la tarifa diaria para alquilar tu vehículo. Configurá los kilómetros incluidos, el precio por KM extra y el depósito de seguridad sugerido. Esto permite definir claramente las condiciones para el arrendatario.</p>
          <DropdownForm title="Tarifa base" :section-id="'section-2'" :dropdown-id="'tarifa'" :is-initial="true">
            <div class="flex gap-5">
              <Input type="text" placeholder="Diaria" :variant="'secondary'" :outline="true" required />
              <Input type="text" placeholder="Semanal" :variant="'secondary'" :outline="true" required />
              <Input type="text" placeholder="Mensual" :variant="'secondary'" :outline="true" required />
            </div>
            <div class="flex gap-2 items-center">
            <Checkbox />
            <p class="text-sm font-medium">Sugerencia automática</p>
          </div>
          </DropdownForm>
          <DropdownForm title="Política de kilometraje" :section-id="'section-2'" :dropdown-id="'kilometraje'">
            <div class="flex gap-5">
              <Input
                type="select"
                name="km-incluidos"
                id="km-incluidos"
                placeholder="KM incluidos/día"
                :options="[
                  { value: 'male', label: 'Climatizador automático' },
                  { value: 'female', label: 'Asientos calefaccionados/ventilados' },
                  { value: 'other', label: 'Asientos con memoria' },
                  { value: 'other', label: 'Tapizado premium' },
                  { value: 'other', label: 'Limpiaparabrisas automáticos' },
                  { value: 'other', label: 'Maletero automático' },
                  { value: 'other', label: 'Espejos inteligentes' },
                  { value: 'other', label: 'Insonorización premium' },
                  { value: 'other', label: 'Organizador de maletero' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-50"
              />  
              <Input type="number" placeholder="Precio por KM extra" :variant="'secondary'" :outline="true" class="flex !flex-40"/>
            </div>
          </DropdownForm>
          <DropdownForm title="Depósito de seguridad" :section-id="'section-2'" :dropdown-id="'seguridad'">
              <Input type="number" placeholder="Monto total del depósito" :variant="'secondary'" :outline="true" required />
          </DropdownForm>
        </router-view>

         <!-- Paso 5: Fotos del vehículo -->
        <router-view v-if="currentStep === 5" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Fotos del vehículo</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <p class="text-sm font-medium">Subí imágenes claras y atractivas de tu auto para generar confianza en los posibles clientes. Las fotos deben mostrar el estado real del vehículo, incluyendo el exterior y interior.</p>
          <div class="flex gap-3">
            <label for="dni-front" class="cursor-pointer">
              <img src="" class="w-[250px] h-[150px] object-cover rounded-sm">
            </label>
            <div class="flex flex-col gap-4">
              <label for="dni-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Editar imagen</label>
              <span class="text-xs text-start">
                Las imagenes del vehículo aumentan tu reservas un 40%.
              </span>
            </div>
            <input id="dni-front" type="file" accept="image/*" class="hidden" />
          </div>
          
          <!-- Sección para las 4 imágenes cuadradas -->
          <div class="flex gap-4">
            <!-- Imagen 1 -->
            <div class="flex flex-col items-center gap-2">
              <label for="image-1" class="cursor-pointer">
                <div class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                  <span class="text-gray-500 text-sm" v-if="!true">+ Agregar imagen</span>
                  <img v-else src="../assets/Car-Img.png" class="w-full h-full object-cover rounded-lg" alt="Imagen 1">
                </div>
              </label>
              <input id="image-1" type="file" accept="image/*" class="hidden" />
            </div>
            
            <!-- Imagen 2 -->
            <div class="flex flex-col items-center gap-2">
              <label for="image-2" class="cursor-pointer">
                <div class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                  <span class="text-gray-500 text-sm" v-if="!true">+ Agregar imagen</span>
                  <img v-else src="../assets/Car-Img.png" class="w-full h-full object-cover rounded-lg" alt="Imagen 2">
                </div>
              </label>
              <input id="image-2" type="file" accept="image/*" class="hidden" />
            </div>
            
            <!-- Imagen 3 -->
            <div class="flex flex-col items-center gap-2">
              <label for="image-3" class="cursor-pointer">
                <div class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                  <span class="text-gray-500 text-sm" v-if="!true">+ Agregar imagen</span>
                  <img v-else src="../assets/Car-Img.png" class="w-full h-full object-cover rounded-lg" alt="Imagen 3">
                </div>
              </label>
              <input id="image-3" type="file" accept="image/*" class="hidden" />
            </div>
            
            <!-- Imagen 4 -->
            <div class="flex flex-col items-center gap-2">
              <label for="image-4" class="cursor-pointer">
                <div class="border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition">
                  <span class="text-gray-500 text-sm" v-if="!true">+ Agregar imagen</span>
                  <img v-else src="../assets/Car-Img.png" class="w-full h-full object-cover rounded-lg" alt="Imagen 4">
                </div>
              </label>
              <input id="image-4" type="file" accept="image/*" class="hidden" />
            </div>
          </div>
        </router-view>

        <!-- Paso 6: Información de seguro -->
        <router-view v-if="currentStep === 6" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Información de seguro</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <p class="text-sm font-medium">Indicá el tipo de cobertura, la compañía aseguradora y la vigencia del contrato. Además, cargá una imagen de la cédula verde para validar que la póliza está activa y cumple con los requisitos legales.</p>
          <div class="flex flex-col gap-5">
            <Input
              type="select"
              name="confort"
              id="confort"
              placeholder="Tipo de cobertura"
              :options="[
                { value: 'male', label: 'Climatizador automático' },
                { value: 'female', label: 'Asientos calefaccionados/ventilados' },
                { value: 'other', label: 'Asientos con memoria' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="w-full cursor-pointer"
            />
            <Input
              type="select"
              name="confort"
              id="confort"
              placeholder="Compañia aseguradora"
              :options="[
                { value: 'male', label: 'Climatizador automático' },
                { value: 'female', label: 'Asientos calefaccionados/ventilados' },
                { value: 'other', label: 'Asientos con memoria' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="w-full cursor-pointer"
            />
            <Input type="date" placeholder="Vencimiento de póliza" :variant="'secondary'" :outline="true" required />
            <div class="flex gap-3">
              <label for="driver-front" class="cursor-pointer">
                <img v-if="documents.driverLicenseFront || filePreviews.driverLicenseFront" :src="filePreviews.driverLicenseFront ? filePreviews.driverLicenseFront : documents.driverLicenseFront" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                <DriverFront v-else/>
              </label>
              <div class="flex flex-col gap-4">
                <label for="driver-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del Registro</label>
                <span class="text-xs text-start">Parte trasera de tu Licencia de Conducir.</span>
              </div>
              <input id="driver-front" type="file" accept="image/*"
              @change="(event) => handleFileChange(event, 'driverLicenseFront')"
              class="hidden" />
            </div>
          </div>
        </router-view>

        <!-- Botones de navegación -->
        <div class="flex justify-between items-center gap-32">
          <button 
            type="button" 
            class="bg-vibrant-light-800 p-2 flex items-center h-fit rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:not-disabled:bg-background-900/35" 
            @click="prevStep" 
            :disabled="currentStep === 0"
          >
            <span class="sr-only">Anterior</span>
            <LongArrow color="#FFFFFF" direction="left" />
          </button>
          <Input
            type="button"
            text="Siguiente"
            variant="primary"
            @click="nextStep"
            :disabled="currentStep === sections.length - 1"
            v-if="currentStep < sections.length - 1"
            class="cursor-pointer"
          />
          <Input
            type="submit"
            :text="loading ? 'Procesando...' : 'Finalizar'"
            variant="primary"
            :class="loading ? 'cursor-not-allowed bg-deep-blue-900' : 'cursor-pointer'"
            :disabled="loading"
            v-if="currentStep === sections.length - 1"
            class="cursor-pointer"
          />
        </div>
      </form>
    </section>
  </section>
</template>

<style scoped>
.sections-sidebar {
  max-width: 420px;
  width: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.section-item {
  padding: 1rem;
  border-radius: 16px;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;
  align-items: center;
  position: relative;
}

.section-item:not(:last-child)::after {
  content: "----";
  color: #7B7B7B;
  position: absolute;
  bottom: -35px;
  left: 10px;
  transform: rotate(90deg)
}

.section-item.active {
  background-color: #A7EBEF; /* Fondo blanco transparente al 20% */
  font-weight: bold;
}

.profile-picture-label {
  display: inline-block;
  cursor: pointer;
  position: relative;
}

.profile-picture {
  width: 95px;
  height: 95px;
  border-radius: 100%;
  object-fit: cover;
  background-color: rgba(255, 255, 255, 0.5)
}

.default{
  filter: brightness(7);
}
</style>

<!--  <DropdownForm title="Documento de Identidad" :section-id="'section-1'" :dropdown-id="'doc-identidad'" :is-initial="true">
              <p class="text-sm font-medium">Para completar la verificación de identidad, sube una foto clara y ligible de tu DNI.</p>
              <div class="flex gap-3">
                <label for="dni-front" class="cursor-pointer">
                  <img v-if="documents.dniFront || filePreviews.dniFront" :src="filePreviews.dniFront ? filePreviews.dniFront : documents.dniFront" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                  <DNIFront v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="dni-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar frente del DNI</label>
                  <span class="text-xs text-start">
                    Parte frontal de tu Documento Nacional de Identidad.
                  </span>
                </div>
                <input id="dni-front" type="file" accept="image/*" @change="(event) => handleFileChange(event, 'dniFront')" class="hidden" />
              </div>
              <div class="flex gap-3">
                <label for="dni-back" class="cursor-pointer">
                  <img v-if="documents.dniBack || filePreviews.dniBack" :src="filePreviews.dniBack ? filePreviews.dniBack : documents.dniBack" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Dorsal">
                  <DNIBack v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="dni-back" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del DNI</label>
                  <span class="text-xs text-start">Parte trasera de tu Documento Nacional de Identidad.</span>
                </div>
                <input id="dni-back" type="file" accept="image/*"
                @change="(event) => handleFileChange(event, 'dniBack')" class="hidden" />
              </div>
            </DropdownForm>
            
            <DropdownForm title="Registro de conducir" :dropdown-id="'doc-licencia'" :section-id="'section-1'">
              <p class="text-sm font-medium">Para poder alquilar en nuestra plataforma, es esencial que tengas vinculado tu registro de conducir. </p>
              <div class="flex gap-3">
                <label for="driver-front" class="cursor-pointer">
                  <img v-if="documents.driverLicenseFront || filePreviews.driverLicenseFront" :src="filePreviews.driverLicenseFront ? filePreviews.driverLicenseFront : documents.driverLicenseFront" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                  <DriverFront v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="driver-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del Registro</label>
                  <span class="text-xs text-start">Parte trasera de tu Licencia de Conducir.</span>
                </div>
                <input id="driver-front" type="file" accept="image/*"
                @change="(event) => handleFileChange(event, 'driverLicenseFront')"
                class="hidden" />
              </div>
              <div class="flex gap-3">
                <label for="driver-back" class="cursor-pointer">
                  <img v-if="documents.driverLicenseBack || filePreviews.driverLicenseBack" :src="filePreviews.driverLicenseBack ? filePreviews.driverLicenseBack : documents.driverLicenseBack" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Dorsal">
                  <DriverBack v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="driver-back" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del Registro</label>
                  <span class="text-xs text-start">Parte trasera de tu Licencia de Conducir.</span>
                </div>
                <input id="driver-back" type="file" accept="image/*"
                @change="(event) => handleFileChange(event, 'driverLicenseBack')"
                class="hidden" />
              </div>
            </DropdownForm> -->