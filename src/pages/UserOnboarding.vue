<script setup>
import { ref, markRaw, onMounted, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { useAuthStore, useUserStore, useGeoStore, usePaymentStore } from '@stores'
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
import PaymentMethod from '@/components/atoms/PaymentMethod.vue';
import Modal from '@/components/molecules/Modal.vue';


const showTermsModal = ref(false);
const showPolicyModal = ref(false);
const authStore = useAuthStore();
const userStore = useUserStore();
const geoStore = useGeoStore();
const router = useRouter();
const paymentStore = usePaymentStore();


const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

function openTermsModal() {
  showTermsModal.value = true;
}

function handleAcceptTerms() {
  if(agreements.value.acceptedTerms === false){
    showTermsModal.value = false;
    agreements.value.acceptedTerms = true;
  } else if(agreements.value.acceptedTerms === true) {
    showTermsModal.value = false;
  }
}

function openPolicyModal() {
  showPolicyModal.value = true;
}

function handleAcceptPolicy() {
  if(agreements.value.acceptedPrivacyPolicy === false){
    showPolicyModal.value = false;
    agreements.value.acceptedPrivacyPolicy = true;
  } else if(agreements.value.acceptedPrivacyPolicy === true) {
    showPolicyModal.value = false;
  }
}

const loggedUserId = computed(() => authStore.user?.id);
const personalInfo = computed(() => userStore.personalInfo);
const documents = computed(() => userStore.documents);
const address = computed(() => userStore.address);
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

const justifyClass = computed(() => ({
  'justify-start': currentStep.value <= 0,
  'justify-end': currentStep.value >= 2
}));

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
  address.province = geoStore.getCiudadesPorProvincia(address.value.province);
};

const handleSubmit = async () => {
  // Basic validation example
  if (!agreements.value.acceptedTerms || !agreements.value.acceptedPrivacyPolicy) {
    addAlert('Debés aceptar los términos y políticas', 'error')
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

function updatePaymentType(selectedBrand) {
  const brandTypeMap = {
    'Visa': 'bank',
    'Mastercard': 'bank',
    'Uala': 'digital_wallet',
    'PayPal': 'digital_wallet',
    'Mercado Pago': 'digital_wallet',
    'Lemon': 'digital_wallet',
    'Modo': 'digital_wallet'
  };
  paymentStore.newPaymentMethod.type = brandTypeMap[selectedBrand] || 'bank';
}

// Load initial data
onMounted(async () => {
  window.addEventListener('beforeunload', handleBeforeUnload);
  await userStore.loadUserProfile(authSession.user.id);
  await geoStore.loadProvinciasYLocalidades();

  if (currentStep.value === 3) {
    await paymentStore.fetchPaymentMethods(loggedUserId.value);
  }
});

watch(() => currentStep.value, async (newStep) => {
  if (newStep === 3) {
    await paymentStore.fetchPaymentMethods(loggedUserId.value);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
  <section class="flex flex-col md:flex-row 2xl:max-w-[1120px] 2xl:max-h-[675px] min-h-screen md:min-h-auto md:h-screen w-full 2xl:mx-auto gap-10 justify-start md:justify-center 2xl:justify-between py-4 px-2 xl:px-16 xl:py-12 bg-deep-blue-900 2xl:rounded-[40px] text-white overflow-hidden shadow-2xl">
    <!-- Secciones al costado -->
    <aside class="flex flex-col gap-8 w-full md:max-w-[425px] md:overflow-hidden">
      <div class="flex flex-col gap-4 md:gap-2">
        <div class="flex justify-between items-center">
          <Heading type="1" class="large text-white font-extrabold!">Onboarding</Heading>
          <Reemo class="cursor-pointer" color="#FFFFFF" @click="router.push('/dashboard')"/>
        </div>
        <p class="text-sm max-w-[420px]">¡Bienvenido! Completa los siguientes datos para finalizar tu registro y acceder a todas las funcionalidades de la plataforma.</p>
      </div>
      <ul class="sections-sidebar" :class="justifyClass">
        <li
          v-for="(section, index) in sections"
          :key="index"
          :class="{ active: currentStep === index }"
          class="section-item"
        >
          <div class="flex items-center gap-4">
            <component :is="section.icon" color="white" />
            <Heading type="3" class="regular text-white hidden md:block">{{ section.title }}</Heading>
          </div>
          <span class="hidden md:block">
            <LongArrow direction="right" class="hidden" color="#ffffff" :class="{ 'block!': currentStep === index}"/>
          </span>
        </li>
      </ul>
    </aside>

    <!-- Formulario dinámico -->
    <form
      class="flex flex-col justify-center gap-8 w-full max-w-[425px] md:max-h-[568px] md:overflow-hidden"
      @submit.prevent="handleSubmit"
    >

      <!-- Paso 1: Información Personal -->
      <router-view v-if="currentStep === 0">
        <div class="flex gap-4 items-center">
          <Heading type="2" class="medium md:!text-4xl text-white! font-extrabold!">Datos personales</Heading>
          <Loading v-if="!userStore.profileLoaded" role="status" />
        </div>

        <div class="box-deep flex flex-col gap-5 min-w-full md:overflow-y-auto md:pr-2">
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
          <div>
            <Input v-model="personalInfo.username" type="text" placeholder="Nombre de usuario" :variant="'secondary'" :outline="false" :label="personalInfo.username" required />
          </div>         
          <div class="flex gap-5">
            <Input v-model="personalInfo.firstName" type="text" placeholder="Nombre" :variant="'secondary'" :outline="false" :label="personalInfo.firstName" required />
            <Input v-model="personalInfo.lastName" type="text" placeholder="Apellido" :variant="'secondary'" :outline="false" :label="personalInfo.lastName" required />
          </div>
          <div>
            <Input v-model="personalInfo.phone" type="tel" placeholder="Número de teléfono" :variant="'secondary'" :outline="false" :label="personalInfo.phone" required />
          </div>
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
              variant="secondary"
              :outline="false"
              :label="personalInfo.gender"
              v-model="personalInfo.gender"
            />
            <Input v-model="personalInfo.birthDate" type="date" placeholder="Fecha de nacimiento" :variant="'secondary'" :outline="false" :label="personalInfo.birthDate" required />
          </div>
        </div>
      </router-view>

      <!-- Paso 2: Documentación -->
      <router-view v-if="currentStep === 1">
        <div class="flex gap-4 items-center">
          <Heading type="2" class="medium md:!text-4xl text-white! font-extrabold!">Documentación</Heading>
          <Loading v-if="loading" role="status" />
        </div>
        <div class="box-deep flex flex-col gap-5 min-w-full md:overflow-y-auto md:pr-2">

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
          <Heading type="2" class="medium md:!text-4xl text-white! font-extrabold!">Ubicación</Heading>
          <Loading v-if="loading" role="status" />
        </div>
        <p class="text-sm font-medium">Para garantizar que nuestros servicios estén disponibles en tu área, necesitamos confirmar tu ubicación en Argentina.</p>
        <div class="box-deep flex flex-col gap-5 min-w-full md:overflow-y-auto md:pr-2">
          <!-- Provincia -->
           <div>
             <Input
               type="select"
               name="provincia"
               id="provincia"
               placeholder="Provincia"
               :options="geoStore.provincias.map(p => ({ value: p, label: p }))"
               v-model="address.province"
               @change="cargarCiudades"
               :label="address.province"
               variant="secondary"
               :outline="false"
             />
           </div>

          <!-- Ciudad/Localidad -->
          <div>
            <Input
              type="select"
              name="ciudad"
              id="ciudad"
              placeholder="Ciudad/Localidad"
              :options="(address.province ? geoStore.getCiudadesPorProvincia(address.province) : []).map(c => ({ value: c, label: c }))"
              v-model="address.city"
              :disabled="!address.province"
              variant="secondary"
              :label="address.city"
              :outline="false"
            />
          </div>

          <div class="flex gap-5">
            <!-- Calle y número -->
            <Input
              type="text"
              placeholder="Calle y número"
              v-model="address.street"
              :label="address.street"
              :variant="'secondary'"
              :outline="false"
            />
            <!-- Código Postal -->
            <Input
              type="text"
              placeholder="Código Postal"
              v-model="address.postalCode"
              :label="address.postalCode"
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
            :label="address.floor"
            :variant="'secondary'"
            :outline="false"
          />

          <!-- Departamento (opcional) -->
          <Input
            type="text"
            placeholder="Departamento"
            v-model="address.apartment"
            :label="address.apartment"
            :variant="'secondary'"
            :outline="false"
            />
          </div>
        </div>
      </router-view>

      <!-- Paso 4: Método de Pago -->
      <router-view v-if="currentStep === 3" class="step">
      <div class="flex gap-4 items-center">
        <Heading type="2" class="medium md:!text-4xl text-white! font-extrabold!">Métodos de pago</Heading>
        <Loading v-if="loading" role="status" />
      </div>

      <p class="text-sm font-medium">Para garantizar que puedas hacer uso de nuestros servicios, debés ingresar, al menos, un método de pago.</p>
      
      <div class="box-deep flex flex-col gap-5 min-w-full md:overflow-y-auto md:pr-2">
        <!-- Métodos de pago existentes -->
        <div v-if="!loading && paymentStore.paymentMethods.length > 0" class="space-y-3">
          <div 
            v-for="(method, index) in paymentStore.paymentMethods" 
            :key="index"
            class="border rounded-xl p-4 transition-all"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 flex items-center justify-center p-1 rounded-xl bg-white">
                  <PaymentMethod :method="method.brand" class="h-6 w-6" />
                </div>
                <div>
                  <p class="font-medium text-white">
                    {{ method.brand }}
                  </p>
                  <p v-if="method.cardNumber" class="text-sm text-gray-400">
                    •••• •••• •••• {{ String(method.cardNumber).slice(-4) }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mensaje cuando no hay métodos de pago -->
        <div v-else-if="!loading && paymentStore.paymentMethods.length === 0" class="text-center text-gray-300">
          <p class="text-gray-400">No tenés métodos de pago guardados</p>
        </div>
        <Input
          v-if="!paymentStore.showNewPaymentForm"
          type="button"
          text="Agregar método de pago"
          variant="tertiary"
          :outline="false"
          @click.prevent="paymentStore.toggleNewPaymentForm"
        />
        
        <!-- Formulario para nuevo método de pago -->
        <div v-if="paymentStore.showNewPaymentForm" class="mt-6 flex flex-col gap-4">
          <Heading :type="4" class="regular text-white">Nuevo método de pago</Heading>
          
          <div class="flex flex-col gap-4">
            <Input 
              type="select"
              placeholder="Selecciona una marca"
              :options="[
                {value: 'Visa', label: 'Visa', type: 'bank'},
                {value: 'Mastercard', label: 'Mastercard', type: 'bank'},
                {value: 'Uala', label: 'Ualá', type: 'digital_wallet'},
                {value: 'PayPal', label: 'PayPal', type: 'digital_wallet'},
                {value: 'Mercado Pago', label: 'Mercado Pago', type: 'digital_wallet'},
                {value: 'Lemon', label: 'Lemon', type: 'digital_wallet'},
                {value: 'Modo', label: 'Modo', type: 'digital_wallet'}
              ]"
              v-model="paymentStore.newPaymentMethod.brand"
              @update:modelValue="updatePaymentType"
              variant="secondary"
              :outline="false"
            />

            <Input 
              type="text"
              placeholder="Número de tarjeta (16 dígitos)"
              v-model="paymentStore.newPaymentMethod.cardNumber"
              variant="secondary"
              :outline="false"
            />
            
            <Input 
              type="text"
              placeholder="Titular de tarjeta"
              v-model="paymentStore.newPaymentMethod.cardHolder"
              variant="secondary"
              :outline="false"
            />
            
            <div class="flex gap-5">
              <Input 
                type="month"
                placeholder="MM/AA"
                v-model="paymentStore.newPaymentMethod.expiryDate"
                variant="secondary"
                :outline="false"
              />
              <Input
                type="password"
                placeholder="CVV"
                v-model="paymentStore.newPaymentMethod.cvv"
                variant="secondary"
                :outline="false"
              />
            </div>
          </div>
          
          <div class="flex gap-4 mt-6">
            <Input
              type="button"
              text="Cancelar"
              variant="primary"
              :outline="true"
              @click.prevent="paymentStore.toggleNewPaymentForm" 
            />
            <Input
              type="button"
              :text="loading ? 'Guardando...' : 'Guardar'"
              variant="primary"
              :outline="false"
              :input-class="loading ? 'cursor-not-allowed bg-deep-blue-700' : ''"
              :disabled="!paymentStore.isFormValid || loading"
              @click.prevent="paymentStore.saveNewPaymentMethod(authStore.user.id)" 
            />
          </div>
        </div>
      </div>
    </router-view>

      <!-- Paso 5: Términos y Condiciones -->
      <router-view v-if="currentStep === 4" class="step">
        <div class="flex gap-4 items-center">
          <Heading type="2" class="medium md:!text-4xl text-white! font-extrabold!">Términos y condiciones</Heading>
          <Loading v-if="loading" role="status" />
        </div>
        <div class="flex flex-col gap-5">
          <div class="flex gap-2 items-center">
            <Checkbox v-model="agreements.acceptedTerms" :disabled="agreements.acceptedTerms"/>
            <p class="text-sm font-medium">He leído y acepto los 
              <span class="hover:underline font-bold cursor-pointer" @click="openTermsModal">Términos y Condiciones</span>
              <Modal
              class="text-deep-blue-900"
                :isOpen="showTermsModal"
                title="Términos y Condiciones"
                :message="`
                  <div class='terms-container'>
  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>1. Aceptación de Términos</h5>
    <p class='text-sm'>Al utilizar esta aplicación, usted acepta cumplir con estos Términos y Condiciones, así como con nuestra política de privacidad. Si no está de acuerdo, absténgase de usar el servicio.</p>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>2. Requisitos para Renta</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Debe ser mayor de 21 años y contar con licencia de conducir vigente.</li>
      <li>Se requiere tarjeta de crédito válida para garantizar el pago y posibles daños.</li>
    </ul>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>3. Reservas y Pagos</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Los precios incluyen impuestos aplicables, salvo indicación contraria.</li>
      <li>El pago se realizará al confirmar la reserva. Cancelaciones con menos de 24 horas pueden incurrir en cargos.</li>
    </ul>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>4. Uso del Vehículo</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Prohibido uso ilegal, subarrendamiento o conducción bajo influencia de alcohol/drogas.</li>
      <li>El usuario es responsable de multas, daños o pérdidas durante el periodo de renta.</li>
    </ul>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>5. Seguro</h5>
    <p class='text-sm'>Incluye cobertura básica según la ley local. Opciones adicionales pueden estar disponibles.</p>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>6. Devolución</h5>
    <p class='text-sm'>El vehículo debe devolverse en la fecha/hora acordada. Retrasos generarán cargos adicionales.</p>
  </div>

  <div class='term-section mb-4'>
    <h5 class='font-semibold mb-2'>7. Limitación de Responsabilidad</h5>
    <p class='text-sm'>La aplicación no se hace responsable por daños indirectos, pérdidas o accidentes derivados del uso del vehículo.</p>
  </div>

  <div class='term-section'>
    <h5 class='font-semibold mb-2'>8. Modificaciones</h5>
    <p class='text-sm'>Nos reservamos el derecho de actualizar estos términos. Los cambios serán notificados dentro de la app.</p>
  </div>

  <p class='text-xs mt-6 text-gray-500'>Fecha de última actualización: 27/07/25</p>
</div>
                `"
                confirmText="Aceptar"
                cancelText="Cerrar"
                @close="showTermsModal = false"
                @confirm="handleAcceptTerms"
              />
              <!-- <router-link
                to="/terms-and-conditions"
                class="text-primary text-background-900 font-bold"
                > -->
              <!-- </router-link>. -->
            </p>
          </div>
          <!-- Politicas de privacidad -->
          <div class="flex gap-2 items-center">
            <Checkbox v-model="agreements.acceptedPrivacyPolicy" :disabled="agreements.acceptedPrivacyPolicy"/>
            <p class="text-sm font-medium">He leído y acepto las 
              <!-- <router-link
                to="/privacy-policy"
                class="text-primary text-background-900 font-bold"
                > -->
                <span class="hover:underline font-bold cursor-pointer" @click="openPolicyModal">Políticas de Privacidad</span>
                <Modal
              class="text-deep-blue-900"
                :isOpen="showPolicyModal"
                title="Términos y Condiciones"
                :message="`<div class='privacy-policy-container'>
  
  <div class='policy-section mb-4'>
    <h5 class='font-semibold mb-2'>1. Recopilación de Información</h5>
    <p class='text-sm'>Recopilamos información personal cuando usted: realiza una reserva, crea una cuenta, o interactúa con nuestros servicios. Esto incluye nombre, dirección, datos de pago, licencia de conducir y datos de contacto.</p>
  </div>

  <div class='policy-section mb-4'>
    <h5 class='font-semibold mb-2'>2. Uso de la Información</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Procesar reservas y pagos</li>
      <li>Verificar su identidad y elegibilidad</li>
      <li>Comunicarnos sobre su reserva</li>
      <li>Mejorar nuestros servicios</li>
      <li>Cumplir con obligaciones legales</li>
    </ul>
  </div>

  <div class='policy-section mb-4'>
    <h5 class='font-semibold mb-2'>3. Protección de Datos</h5>
    <p class='text-sm'>Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra accesos no autorizados, alteración o destrucción.</p>
  </div>

  <div class='policy-section mb-4'>
    <h5 class='font-semibold mb-2'>4. Compartir Información</h5>
    <p class='text-sm'>Podemos compartir sus datos con:</p>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Proveedores de pago</li>
      <li>Empresas asociadas para servicios adicionales</li>
      <li>Autoridades cuando lo requiera la ley</li>
    </ul>
  </div>

  <div class='policy-section mb-4'>
    <h5 class='font-semibold mb-2'>5. Cookies y Tecnologías Similares</h5>
    <p class='text-sm'>Utilizamos cookies para mejorar su experiencia, analizar tráfico y personalizar contenido. Puede gestionarlas en la configuración de su navegador.</p>
  </div>

  <div class='policy-section mb-4'>
    <h5 class='font-semibold mb-2'>6. Sus Derechos</h5>
    <ul class='list-disc pl-5 space-y-1 text-sm'>
      <li>Acceder a sus datos personales</li>
      <li>Solicitar corrección o eliminación</li>
      <li>Oponerse al procesamiento</li>
      <li>Solicitar limitación del tratamiento</li>
    </ul>
  </div>

  <div class='policy-section'>
    <h5 class='font-semibold mb-2'>7. Cambios a esta Política</h5>
    <p class='text-sm'>Nos reservamos el derecho de actualizar esta política. Las versiones actualizadas serán publicadas en la aplicación con fecha de revisión.</p>
  </div>

  <p class='text-xs mt-6 text-gray-500'>Fecha de última actualización: 27/07/25</p>
</div>`"
                confirmText="Aceptar"
                cancelText="Cerrar"
                @close="showPolicyModal = false"
                @confirm="handleAcceptPolicy"
              />
              <!-- </router-link>-->
            </p>
          </div>
          <!-- Notificaciones -->
          <div class="flex gap-2 items-center">
            <Checkbox v-model="agreements.acceptedMarketing" />
            <p class="text-sm font-medium">Acepto recibir notificaciones y promociones por correo electrónico.</p>
          </div>
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
          v-if="currentStep < sections.length - 1"
          type="button"
          text="Siguiente"
          variant="primary"
          @click="nextStep"
          :disabled="currentStep === sections.length - 1"
        />
        <Input
          v-if="currentStep === sections.length - 1"
          type="submit"
          :text="loading ? 'Procesando...' : 'Finalizar'"
          variant="primary"
          :input-class="loading ? 'cursor-not-allowed bg-deep-blue-700' : 'cursor-pointer'"
          :disabled="loading"
        />
      </div>
    </form>
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
  overflow: hidden;
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
@media (width <= 768px) {
  .sections-sidebar {
    flex-direction: row;
  }
  .section-item {
    border-radius: 100%;
  }
  .section-item:not(:last-child)::after {
    transform: rotate(0deg);
    bottom: 13px;
    right: -37px;
  }
}
@media (width >= 768px) {
  .section-item:not(:last-child)::after {
    bottom: -35px;
    left: 10px;
    transform: rotate(90deg);
  }
}
.section-item:not(:last-child)::after {
  content: "----";
  color: rgba(255, 255, 255, 0.5);
  position: absolute;
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