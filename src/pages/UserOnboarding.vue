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
import DNIFront from '../components/atoms/DNIFront.vue';
import DNIBack from '../components/atoms/DNIBack.vue';
import DriverFront from '../components/atoms/DriverFront.vue';
import DriverBack from '../components/atoms/DriverBack.vue';
import Loading from '@icons/Loading.vue';
import User from '@icons/User.vue';
import Documentation from '@icons/Documentation.vue';
import Location from '@icons/Location.vue';
import Payment from '@icons/Payment.vue';
import Clipboard from '@icons/Clipboard.vue';

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
  { title: 'Datos personales', icon: markRaw(User) },
  { title: 'Documentación', icon: markRaw(Documentation) },
  { title: 'Ubicación', icon: markRaw(Location) },
  { title: 'Método de pago', icon: markRaw(Payment) },
  { title: 'Términos y condiciones', icon: markRaw(Clipboard) }
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
  window.addEventListener('beforeunload', handleBeforeUnload);
  await userStore.loadUserProfile(authSession.user.id);
  await geoStore.loadProvinciasYLocalidades();
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
  <section class="flex max-w-[1120px] max-h-[675px] h-full w-full mx-auto justify-between px-16 py-12 bg-deep-blue-900 rounded-[40px] text-white overflow-hidden">
    <!-- Secciones al costado -->
    <aside class="flex flex-col gap-8 w-full max-w-[425px]">
      <div class="flex flex-col gap-2">
        <Heading type="1" class="large text-white font-extrabold!">Onboarding</Heading>
        <p class="text-sm max-w-[420px]">¡Bienvenido! Completa los siguientes datos para finalizar tu registro y acceder a todas las funcionalidades de la plataforma.</p>
      </div>
      <ul class="sections-sidebar">
        <li
          v-for="(section, index) in sections"
          :key="index"
          :class="{ active: currentStep === index }"
          class="section-item"
        >
          <div class="flex items-center gap-4">
            <component :is="section.icon" color="white" />
            <Heading type="3" class="regular text-white">
              {{ section.title }}
            </Heading>
          </div>
          <span>
            <LongArrow direction="right" class="hidden" color="#ffffff" :class="{ 'block!': currentStep === index}"/>
          </span>
        </li>
      </ul>
    </aside>

    <!-- Formulario dinámico -->
    <section class="max-h-[568px]">
      <form
        class="flex flex-col justify-center gap-8 grow w-full max-w-[425px]"
        @submit.prevent="handleSubmit"
      >
        <div class="flex justify-end">
          <Reemo color="#FFFFFF" />
        </div>

        <!-- Paso 1: Información Personal -->
        <router-view v-if="currentStep === 0">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large text-white! font-extrabold!">Datos personales</Heading>
            <Loading v-if="!userStore.profileLoaded" role="status" />
          </div>

          <div class="flex flex-col gap-5">
            <div class="flex gap-3">
              <label for="profile-picture">
                <img v-if="filePreviews.profilePhoto || personalInfo.profilePhoto" 
                  :src="filePreviews.profilePhoto ? filePreviews.profilePhoto : personalInfo.profilePhoto" 
                  alt="Foto de perfil" 
                  class="profile-picture" />
                <img v-else src="/src/assets/User.png" alt="Foto de perfil por defecto" class="profile-picture default cursor-pointer" />
              </label>
              <div class="flex flex-col gap-4">
                <label for="profile-picture" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar foto de perfil</label>
                <span class="text-xs text-start">Se recomienda un mínimo de 800x800 px.<br/>
                  Se permite JPG o PNG y GIF</span>
              </div>
            </div>
            <input id="profile-picture" type="file" accept="image/*" 
            @change="(event) => handleFileChange(event, 'profilePhoto')" class="hidden" />            
            <Input v-model="personalInfo.username" type="text" placeholder="Nombre de usuario" :variant="'secondary'" :outline="false" required />
            <div class="flex gap-5">
              <Input v-model="personalInfo.firstName" type="text" placeholder="Nombre" :variant="'secondary'" :outline="false" required />
              <Input v-model="personalInfo.lastName" type="text" placeholder="Apellido" :variant="'secondary'" :outline="false" required />
            </div>
            
            <Input v-model="personalInfo.phone" type="tel" placeholder="Número de teléfono" :variant="'secondary'" :outline="false" required />
            <div class="flex gap-5">
              <Input
                type="select"
                name="gender"
                id="gender"
                placeholder="Genero"
                :options="[
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Femenino', label: 'Femenino' },
                  { value: 'Otro', label: 'Otro' },
                  { value: 'No especificado', label: 'Prefiero no decir' },
                ]"
                icon-position="right"
                variant="secondary"
                :outline="false"
                class="w-full cursor-pointer"
                v-model="personalInfo.gender"
              />
              <Input v-model="personalInfo.birthDate" type="date" placeholder="Fecha de nacimiento" :variant="'secondary'" :outline="false" required />
            </div>
          </div>
        </router-view>

        <!-- Paso 2: Documentación -->
        <router-view v-if="currentStep === 1">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large text-white! font-extrabold!">Documentación</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-2">

            <DropdownForm color="#FFFFFF" title="Documento de Identidad" :section-id="'section-1'" :dropdown-id="'doc-identidad'" :is-initial="true">
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
                  <span class="text-xs text-start">Cara dorsal de tu Documento Nacional de Identidad.</span>
                </div>
                <input id="dni-back" type="file" accept="image/*"
                @change="(event) => handleFileChange(event, 'dniBack')" class="hidden" />
              </div>
            </DropdownForm>
            
            <DropdownForm color="#FFFFFF" title="Registro de conducir" :dropdown-id="'doc-licencia'" :section-id="'section-1'">
              <p class="text-sm font-medium">Para poder alquilar en nuestra plataforma, es esencial que tengas vinculado tu registro de conducir. </p>
              <div class="flex gap-3">
                <label for="driver-front" class="cursor-pointer">
                  <img v-if="documents.driverLicenseFront || filePreviews.driverLicenseFront" :src="filePreviews.driverLicenseFront ? filePreviews.driverLicenseFront : documents.driverLicenseFront" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                  <DriverFront v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="driver-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del Registro</label>
                  <span class="text-xs text-start">Cara frontal de tu Licencia de Conducir.</span>
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
                  <span class="text-xs text-start">Cara dorsal de tu Licencia de Conducir.</span>
                </div>
                <input id="driver-back" type="file" accept="image/*"
                @change="(event) => handleFileChange(event, 'driverLicenseBack')"
                class="hidden" />
              </div>
            </DropdownForm>
          </div>
        </router-view>

        <!-- Paso 3: Ubicación -->
        <router-view v-if="currentStep === 2">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large text-white! font-extrabold!">Ubicación</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <p class="text-sm font-medium">Para garantizar que nuestros servicios estén disponibles en tu área, necesitamos confirmar tu ubicación en Argentina.</p>
          <div class="flex flex-col gap-5">
            <!-- Provincia -->
            <Input
              type="select"
              name="provincia"
              id="provincia"
              placeholder="Provincia"
              :options="geoStore.provincias.map(p => ({ value: p, label: p }))"
              v-model="address.province"
              @change="cargarCiudades"
              icon-position="right"
              variant="secondary"
              :outline="false"
              class="w-full cursor-pointer"
            />

            <!-- Ciudad/Localidad -->
            <Input
              type="select"
              name="ciudad"
              id="ciudad"
              placeholder="Ciudad/Localidad"
              :options="(address.province ? geoStore.getCiudadesPorProvincia(address.province) : []).map(c => ({ value: c, label: c }))"
              v-model="address.city"
              :disabled="!address.province"
              icon-position="right"
              variant="secondary"
              :outline="false"
              class="w-full cursor-pointer"
            />

            <div class="flex gap-5">
              <!-- Calle y número -->
              <Input
                type="text"
                placeholder="Calle y número"
                v-model="address.street"
                :variant="'secondary'"
                :outline="false"
              />
              <!-- Código Postal -->
              <Input
                type="text"
                placeholder="Código Postal"
                v-model="address.postalCode"
                :variant="'secondary'"
                :outline="false"
              />
            </div>
            
            <div class="flex gap-5">
              <!-- Piso (opcional) -->
              <Input
              type="text"
              placeholder="Piso"
              v-model="address.floor"
              :variant="'secondary'"
              :outline="false"
            />

            <!-- Departamento (opcional) -->
            <Input
              type="text"
              placeholder="Departamento"
              v-model="address.apartment"
              :variant="'secondary'"
              :outline="false"
              />
            </div>
          </div>
        </router-view>
 
        <!-- Paso 4: Método de Pago -->
        <router-view v-if="currentStep === 3" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large text-white! font-extrabold!">Método de pago</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-5">
    
            <DropdownForm color="#FFFFFF" title="Agregar tarjeta" :dropdown-id="'tarjeta'" :section-id="'section-3'" :is-initial="true">
              <Input 
                type="text"
                placeholder="Titular de tarjeta"
                v-model="paymentMethods[0].cardHolder"
                :variant="'secondary'"
                :outline="false"
                />
                <Input
                  type="text"
                  placeholder="Número de tarjeta"
                  v-model="paymentMethods[0].cardNumber"
                  :variant="'secondary'"
                  :outline="false"
                />
              <div class="flex gap-5">
                <Input 
                  type="date"
                  placeholder="Fecha de vencimiento"
                  v-model="paymentMethods[0].expirationDate"
                  :variant="'secondary'"
                  :outline="false"
                />
                <Input
                  type="password"
                  placeholder="CVV"
                  v-model="paymentMethods[0].cvv"
                  :variant="'secondary'"
                  :outline="false"
                />
              </div>
            </DropdownForm>
          </div>
        </router-view>

        <!-- Paso 5: Términos y Condiciones -->
        <router-view v-if="currentStep === 4" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large text-white! font-extrabold!">Términos y condiciones</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex gap-2 items-center">
            <Checkbox v-model="agreements.acceptedTerms" :disabled="agreements.acceptedTerms"/>
            <p class="text-sm font-medium">He leído y acepto los 
              <router-link
                to="/terms-and-conditions"
                class="text-primary text-background-900 font-bold"
                >
                <span class="hover:underline">Términos y Condiciones</span>
              </router-link>.
            </p>
          </div>
          <!-- Politicas de privacidad -->
          <div class="flex gap-2 items-center">
            <Checkbox v-model="agreements.acceptedPrivacyPolicy" :disabled="agreements.acceptedPrivacyPolicy"/>
            <p class="text-sm font-medium">He leído y acepto las 
              <router-link
                to="/privacy-policy"
                class="text-primary text-background-900 font-bold"
                >
                <span class="hover:underline">Políticas de Privacidad</span>
              </router-link>.
            </p>
          </div>
          <!-- Notificaciones -->
          <div class="flex gap-2 items-center">
            <Checkbox v-model="agreements.acceptedMarketing" />
            <p class="text-sm font-medium">Acepto recibir notificaciones y promociones por correo electrónico.</p>
          </div>
        </router-view>

        <!-- Botones de navegación -->
        <div class="flex justify-between items-center gap-32">
          <button 
            type="button" 
            class="bg-background-900/15 p-2 flex items-center h-fit rounded-full disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:not-disabled:bg-background-900/35" 
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
            :class="loading ? 'cursor-not-allowed bg-deep-blue-700' : 'cursor-pointer'"
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
  color: rgba(255, 255, 255, 0.5);
  position: absolute;
  bottom: -35px;
  left: 10px;
  transform: rotate(90deg)
}

.section-item.active {
  background-color: rgba(255, 255, 255, 0.2); /* Fondo blanco transparente al 20% */
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