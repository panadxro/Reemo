<script>
import { useAuthStore, useUserStore } from '@/stores'
import { onMounted, onBeforeUnmount } from 'vue'
import { saveUserData, completeOnboarding, getUserProfile } from '../services/user';
import { subscribeToAuthState } from "../services/auth.js";
import { uploadUserFile } from '../services/storage/documents.js';
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

export default {
  name: "CarRegister",
  components: { Heading, Input, Checkbox, LongArrow, Reemo, DropdownForm, DNIFront, DNIBack, DriverFront, DriverBack, Loading },
  data() {
    return {
      openDropdown: null,
      currentStep: 0, // Paso actual
      profilePhotoPreview: null,
      dniFrontUrl: null,
      dniBackUrl: null,
      driverFrontUrl: null,
      driverBackUrl: null,
      paymentMethods: {
        digital_wallet: {
          type: 'digital_wallet',
          walletType: '',
          walletId: ''
        },
        credit_card: {
          type: 'credit_card',
          cardholder: '',
          cardNumber: '',
          expiryDate: '',
          cvv: ''
        },
        paypal: {
          type: 'paypal',
          email: ''
        }
      },
      selectedPaymentMethod: 'credit_card',
      loading: false,
      sections: [
        { title: "Información Personal" },
        { title: "Documentación" },
        { title: "Ubicación" },
        { title: "Método de Pago" },
        { title: "Términos y Condiciones" },
      ],
      loggedUser: {
        id: null
      },
      user: {
        profilePhoto: null,
        username: "",
        firstName: "",
        lastName: "",
        phone: "",
        gender: "",
        birthDate: "",
        documentType: "",
        documentNumber: "",
        dniFrontUrl: null,
        dniBackUrl: null,
        licenseNumber: "",
        driverFrontUrl: null,
        driverBackUrl: null,
        province: "",
        city: "",
        postalCode: "",
        street: "",
        floor: "",
        apartment: "",
        acceptedNotifications: false,
        acceptedPrivacyPolicy: false,
        paymentMethodType: 'credit_card' // Valor por defecto
      },
      provincias: [
        "Buenos Aires",
        "Catamarca",
        "Chaco",
        "Chubut",
        "Córdoba",
        "Corrientes",
        "Entre Ríos",
        "Formosa",
        "Jujuy",
        "La Pampa",
        "La Rioja",
        "Mendoza",
        "Misiones",
        "Neuquén",
        "Río Negro",
        "Salta",
        "San Juan",
        "San Luis",
        "Santa Cruz",
        "Santa Fe",
        "Santiago del Estero",
        "Tierra del Fuego",
        "Tucumán",
      ],
      ciudades: [], // Se llena dinámicamente según la provincia seleccionada
      ciudadesPorProvincia: {
        "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca"],
        "Córdoba": ["Córdoba", "Villa María", "Río Cuarto"],
        "Santa Fe": ["Rosario", "Santa Fe", "Rafaela"],
        // Agrega más provincias y ciudades aquí
      },
    };
  },
  async created() {
    subscribeToAuthState((user) => {
      this.loggedUser = user || {};
    });
  },
  setup() {
    const authStore = useAuthStore()
    const profileStore = useUserStore()
    
    const handleBeforeUnload = (event) => {
      const message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
      event.preventDefault();
      event.returnValue = message;
      return message;
    };
    
    onMounted(() => {
      authStore.init() // Inicializa la escucha de auth
      window.addEventListener('beforeunload', handleBeforeUnload);
    })

    onBeforeUnmount(() => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    });

    return {
      authStore,
      profileStore
    }
  },
  methods: {
    async prepareUserData() {
      const uid = this.loggedUser?.id; 
      const paymentData = this.paymentMethods[this.selectedPaymentMethod];
      this.loading = true;

      return {
        // Información Personal
        personalInfo: {
          profilePhoto: this.user.profilePhotoPreview || this.user.profilePhoto,
          username: this.user.username,
          firstName: this.user.firstName,
          lastName: this.user.lastName,
          phone: this.user.phone,
          gender: this.user.gender,
          birthDate: this.user.birthDate
        },

        // Documentación
        documents: {
          dniFront: this.user.dniFrontUrl,
          dniBack: this.user.dniBackUrl,
          driverLicenseFront: this.user.driverFrontUrl,
          driverLicenseBack: this.user.driverBackUrl
        },

        //Ubicación
        address: {
          country: "Argentina",
          province: this.user.province,
          city: this.user.city,
          postalCode: this.user.postalCode,
          street: this.user.street,
          floor: this.user.floor,
          apartment: this.user.apartment
        },

        // Método de Pago
        paymentMethods: [{
          type: this.selectedPaymentMethod,
          ...paymentData,
          // Datos sensibles
          ...(this.selectedPaymentMethod === 'credit_card' && {
            cardNumber: paymentData.cardNumber.replace(/\d(?=\d{4})/g, "*")
          })
        }],

        // Acuerdos
        agreements: {
          acceptedTerms: this.user.acceptedTerms,
          acceptedPrivacyPolicy: this.user.acceptedPrivacyPolicy,
          acceptedMarketing: this.user.acceptedNotifications,
          acceptedAt: new Date()
        },
        
        // Metadata importante
        createdAt: new Date(),
        updatedAt: new Date()
      };
    },
    handleDropdownToggle(dropdownInstance) {
      if (this.openDropdown && this.openDropdown !== dropdownInstance) {
        this.openDropdown.closeDropdown();
      }
      this.openDropdown = dropdownInstance.isOpen ? dropdownInstance : null;
    },
    nextStep() {
      if (this.currentStep < this.sections.length - 1) {
        this.currentStep++;
      }
    },
    prevStep() {
      if (this.currentStep > 0) {
        this.currentStep--;
      }
    },
    cargarCiudades() {
      this.user.city = ""; // Reinicia la ciudad seleccionada
      this.ciudades = this.ciudadesPorProvincia[this.user.province] || [];
    },
    async handleSubmit() {
      // Validar paso de términos
      if (!this.user.acceptedTerms || !this.user.acceptedPrivacyPolicy) {
        console.log("Debes aceptar los términos y políticas");
        addAlert('Debes aceptar los términos y políticas', 'error')
        return
      }
      let paymentValid = false;
      const payment = this.paymentMethods[this.selectedPaymentMethod];

      switch(this.selectedPaymentMethod) {
        case 'credit_card':
          paymentValid = payment.cardholder && payment.cardNumber && payment.expiryDate && payment.cvv;
          break;
        case 'digital_wallet':
          paymentValid = payment.walletType && payment.walletId;
          break;
        case 'paypal':
          paymentValid = payment.email;
          break;
        default:
          paymentValid = false;
      }

      if (!paymentValid) {
        addAlert('Debes completar la información de pago', 'error')
        console.error("Debes completar la información de pago");
        this.currentStep = 3;
        return;
      }

      // Lógica para enviar el formulario
      try {
        this.loading = true;
        const uid = this.loggedUser?.id;
        // Validacion adicional
        if (!uid) {
          addAlert('No se pudo identificar al usuario', 'error')
          return
        }

        // 1. Subir archivos primero
        const uploadPromises = [];

        if (this.user.profilePhoto instanceof File) {
          uploadPromises.push(
            uploadUserFile(uid, this.user.profilePhoto, 'profile/avatar.jpg').then(url =>  { this.user.profilePhoto = url; })
          );
        }
        if (this.user.dniFrontUrl instanceof File) {
          uploadPromises.push(
            uploadUserFile(uid, this.user.dniFrontUrl, 'documents/dni_front.jpg').then(url =>  { this.user.dniFrontUrl = url; })
          );
        }
        if (this.user.dniBackUrl instanceof File) {
          uploadPromises.push(
            uploadUserFile(uid, this.user.dniBackUrl, 'documents/dni_back.jpg').then(url =>  { this.user.dniBackUrl = url; })
          );
        }
        if (this.user.driverFrontUrl instanceof File) {
          uploadPromises.push(
            uploadUserFile(uid, this.user.driverFrontUrl, 'documents/drive_front.jpg').then(url =>  { this.user.driverFrontUrl = url; })
          );
        }
        if (this.user.driverBackUrl instanceof File) {
          uploadPromises.push(
            uploadUserFile(uid, this.user.driverBackUrl, 'documents/driver_back.jpg').then(url =>  { this.user.driverBackUrl = url; })
          );
        }

        await Promise.all(uploadPromises);

        // 2. Preparar datos con URLs de archivos
        const userData = await this.prepareUserData();

        // 3. Guardar en Firestore
        await this.profileStore.saveProfile(uid, userData);
        await completeOnboarding(uid);
        
        // 4. Redirección o feedback
        console.log("¡Onboarding completado con éxito!");
        addAlert('Usuario completado con éxito!','success')
        this.$router.push('/search');
      } catch (error) {
        console.error("Error en onboarding:", error);
        addAlert('Error al cargar los datos de usuario', 'error');
      } finally {
        this.loading = false;
      }
    },
    handleProfilePhoto(event) {
      const file = event.target.files[0];
      if (file) {
        // Guardar el archivo para subir luego
        this.user.profilePhoto = file;
        // Crear URL temporal para previsualización
        this.profilePhotoPreview = URL.createObjectURL(file);
      }
    },
    handleDNIFront(event) {
      const file = event.target.files[0];
      if (file) {
        this.user.dniFrontUrl = file;
        this.dniFrontUrl = URL.createObjectURL(file)
      }
    },
    handleDNIBack(event) {
      const file = event.target.files[0];
      if (file) {
        this.user.dniBackUrl = file;
        this.dniBackUrl = URL.createObjectURL(file)
      }
    },
    handleDriverFront(event) {
      const file = event.target.files[0];
      if (file) {
        this.user.driverFrontUrl = file;
        this.driverFrontUrl = URL.createObjectURL(file)
      }
    },
    handleDriverBack(event) {
      const file = event.target.files[0];
      if (file) {
        this.user.driverBackUrl = file;
        this.driverBackUrl = URL.createObjectURL(file)
      }
    },
    async loadUserData(userId) {
      this.loading = true;
      try {
        const userData = await getUserProfile(userId);
        if(!userData || !userData.paymentMethods?.[0]) return;

        const { personalInfo = {}, address = {}, documents = {}, paymentMethods = [], agreements = {} } = userData;
        const primaryPaymentMethod = paymentMethods[0] || {};

        // Mapeo de los datos de usuario
        this.user = {
          ...this.user,
          // Información personal
          profilePhotoPreview: personalInfo?.profilePhoto || null,
          ...['username', 'firstName', 'lastName', 'phone', 'gender', 'birthDate']
            .reduce((acc, key) => ({
              ...acc,
              [key]: personalInfo[key] || ''
            }), {}),
          // Documentación
          dniFrontUrl: documents?.dniFront || null,
          dniBackUrl: documents?.dniBack || null,
          driverFrontUrl: documents?.driverLicenseFront || null,
          driverBackUrl: documents?.driverLicenseBack || null,
          documentNumber: documents?.documentNumber || '',

          // Ubicación
          ...['province', 'city', 'postalCode', 'street', 'floor', 'apartment']
            .reduce((acc,key) => ({
              ...acc,
              [key]: address[key] || ''
            }), {}),

          // Términos
          acceptedTerms: agreements.acceptedTerms || false,
          acceptedPrivacyPolicy: agreements.acceptedPrivacyPolicy || false,
          acceptedNotifications: agreements.acceptedMarketing || false
        };

        //  Método de pago
        if (primaryPaymentMethod.type) {
          this.selectedPaymentMethod = primaryPaymentMethod.type;
          
          if (primaryPaymentMethod.type === 'credit_card') {
            this.paymentMethods.credit_card = {
              cardholder: primaryPaymentMethod.cardholder || '',
              cardNumber: primaryPaymentMethod.cardNumber || '',
              expiryDate: primaryPaymentMethod.expiryDate || '',
              cvv: paymentMethods.cvv ? '***' : '' // No cargamos el CVV por seguridad
            };
          }
          else if (primaryPaymentMethod.type === 'digital_wallet') {
            this.paymentMethods.digital_wallet = {
              walletType: primaryPaymentMethod.walletType || '',
              walletId: primaryPaymentMethod.walletId || ''
            };
          }
          else if (primaryPaymentMethod.type === 'paypal') {
            this.paymentMethods.paypal = {
              email: primaryPaymentMethod.email || ''
            };
          }
        }
        if (this.user.province) this.cargarCiudades();
      } catch (error) {
        console.error("Error cargando datos del usuario:", error);
        addAlert('Error al cargar los datos de usuario', 'error');
      } finally {
        this.loading = false;
      }
    }
  },
  async created() {
    subscribeToAuthState(async (user) => {
      if (!user) {
        // Redirige a login si no está autenticado
        this.$router.push('/login');
        return;
      }
      this.loggedUser = user || {};

      if (user?.id) {
        await this.loadUserData(user.id)
      }
    });
  },
  beforeUnmount() {
    this.unsubscribeAuth?.();
  }
};
</script>

<template>
  <section class="flex max-w-[1200px] mx-auto gap-8 px-16 py-12 bg-deep-blue-900 rounded-[40px] text-white">
    <!-- Secciones al costado -->
    <aside class="flex flex-col gap-4">
      <div>
        <Heading type="1" class="large text-white font-extrabold!">Onboarding</Heading>
        <p class="text-sm">¡Bienvenido! Selecciona un método para ingresar a tu cuenta:</p>
      </div>
      <div class="sections-sidebar">
        <div
          v-for="(section, index) in sections"
          :key="index"
          :class="{ active: currentStep === index }"
          class="section-item"
        >
          {{ section.title }}
          <LongArrow direction="right" class="hidden" color="#ffffff" :class="{ '!block': currentStep === index}"/>
        </div>
      </div>
    </aside>

    <!-- Formulario dinámico -->
      <form class="max-w-[426px] flex-1 flex flex-col gap-9" @submit.prevent="handleSubmit">
        <div class="flex justify-end">
          <Reemo color="#FFFFFF" />
        </div>
        <!-- Paso 1: Información Personal -->
        <router-view v-if="currentStep === 0">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-white !font-extrabold">Datos personales</Heading>
            <Loading v-if="loading" role="status" />
          </div>

          <div class="flex flex-col gap-5">
            <div class="flex gap-3">
              <label for="profile-picture">
                <img v-if="profilePhotoPreview || user.profilePhotoPreview" 
                  :src="profilePhotoPreview ? profilePhotoPreview : user.profilePhotoPreview" 
                  alt="Foto de perfil" 
                  class="profile-picture" />
                <img v-else src="https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png" alt="Foto de perfil por defecto" class="profile-picture cursor-pointer" />
              </label>
              <div class="flex flex-col gap-4">
                <label for="profile-picture" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar foto de perfil</label>
                <span class="text-xs text-start">Se recomienda un mínimo de 800x800 px.<br/>
                  Se permite JPG o PNG y GIF</span>
              </div>
            </div>
            <input id="profile-picture" type="file" accept="image/*" @change="handleProfilePhoto" class="hidden" />
          <Input v-model="user.username" type="text" placeholder="Nombre de usuario" :variant="'secondary'" :outline="false" required />
          <div class="flex gap-5">
            <Input v-model="user.firstName" type="text" placeholder="Nombre" :variant="'secondary'" :outline="false" required />
            <Input v-model="user.lastName" type="text" placeholder="Apellido" :variant="'secondary'" :outline="false" required />
          </div>
            
          <Input v-model="user.phone" type="tel" placeholder="Número de teléfono" :variant="'secondary'" :outline="false" required />
          <div class="flex gap-5">
            <Input
              type="select"
              name="gender"
              id="gender"
              placeholder="Genero"
              :options="[
                { value: 'male', label: 'Masculino' },
                { value: 'female', label: 'Femenino' },
                { value: 'other', label: 'Otro' },
                { value: 'prefer-not-to-say', label: 'Prefiero no decir' },
              ]"
              icon-position="right"
              variant="secondary"
              :outline="false"
              class="w-full cursor-pointer"
              v-model="user.gender"
            />
            <Input v-model="user.birthDate" type="date" placeholder="Fecha de nacimiento" :variant="'secondary'" :outline="false" required />
          </div>
        </div>
        
        </router-view>

        <!-- Paso 2: Documentación -->
        <router-view v-if="currentStep === 1">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-white !font-extrabold">Documentación</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-2">

            <DropdownForm title="Documento de Identidad" :initialOpen="true" @dropdown-toggle="handleDropdownToggle">
              <p class="text-sm font-medium">Para completar la verificación de identidad, sube una foto clara y ligible de tu DNI.</p>
              <div class="flex gap-3">
                <label for="dni-front" class="cursor-pointer">
                  <img v-if="user.dniFrontUrl || dniFrontUrl" :src="dniFrontUrl ? dniFrontUrl : user.dniFrontUrl" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                  <DNIFront v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="dni-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar frente del DNI</label>
                  <span class="text-xs text-start">
                    Parte frontal de tu Documento Nacional de Identidad.
                  </span>
                </div>
                <input id="dni-front" type="file" accept="image/*" @change="handleDNIFront" class="hidden" />
              </div>
              <div class="flex gap-3">
                <label for="dni-back" class="cursor-pointer">
                  <img v-if="user.dniBackUrl || dniBackUrl" :src="dniBackUrl ? dniBackUrl : user.dniBackUrl" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Dorsal">
                  <DNIBack v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="dni-back" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del DNI</label>
                  <span class="text-xs text-start">Parte trasera de tu Documento Nacional de Identidad.</span>
                </div>
                <input id="dni-back" type="file" accept="image/*" @change="handleDNIBack" class="hidden" />
              </div>
            </DropdownForm>
            
            <DropdownForm title="Registro de conducir" @dropdown-toggle="handleDropdownToggle">
              <p class="text-sm font-medium">Para poder alquilar en nuestra plataforma, es esencial que tengas vinculado tu registro de conducir. </p>
              <div class="flex gap-3">
                <label for="driver-front" class="cursor-pointer">
                  <img v-if="user.driverFrontUrl || driverFrontUrl" :src="driverFrontUrl ? driverFrontUrl : user.driverFrontUrl" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                  <DriverFront v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="driver-front" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del Registro</label>
                  <span class="text-xs text-start">Parte trasera de tu Licencia de Conducir.</span>
                </div>
                <input id="driver-front" type="file" accept="image/*" @change="handleDriverFront" class="hidden" />
              </div>
              <div class="flex gap-3">
                <label for="driver-back" class="cursor-pointer">
                  <img v-if="user.driverBackUrl || driverBackUrl" :src="driverBackUrl ? driverBackUrl : user.driverBackUrl" class="w-[140px] h-[85px] object-cover rounded-sm" alt="DNI Frontal">
                  <DriverBack v-else/>
                </label>
                <div class="flex flex-col gap-4">
                  <label for="driver-back" class="text-start bg-background-900 w-fit text-deep-blue-900 px-4 py-2 rounded-2xl cursor-pointer border-2 border-vibrant-light-900 font-semibold">Cargar dorso del Registro</label>
                  <span class="text-xs text-start">Parte trasera de tu Licencia de Conducir.</span>
                </div>
                <input id="driver-back" type="file" accept="image/*" @change="handleDriverBack" class="hidden" />
              </div>
            </DropdownForm>
          </div>
        </router-view>

        <!-- Paso 3: Ubicación -->
        <router-view v-if="currentStep === 2">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-white !font-extrabold">Ubicación</Heading>
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
              :options="provincias.map(p => ({ value: p, label: p }))"
              v-model="user.province"
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
              :options="ciudades.map(c => ({ value: c, label: c }))"
              v-model="user.city"
              :disabled="!user.province"
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
                v-model="user.street"
                :variant="'secondary'"
                :outline="false"
              />
              <!-- Código Postal -->
              <Input
                type="text"
                placeholder="Código Postal"
                v-model="user.postalCode"
                :variant="'secondary'"
                :outline="false"
              />
            </div>
            
            <div class="flex gap-5">
              <!-- Piso (opcional) -->
              <Input
              type="text"
              placeholder="Piso"
              v-model="user.floor"
              :variant="'secondary'"
              :outline="false"
            />

            <!-- Departamento (opcional) -->
            <Input
              type="text"
              placeholder="Departamento"
              v-model="user.apartment"
              :variant="'secondary'"
              :outline="false"
              />
            </div>
          </div>
        </router-view>
 
        <!-- Paso 4: Método de Pago -->
        <router-view v-if="currentStep === 3" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-white !font-extrabold">Método de Pago</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-5">

            <DropdownForm title="Billetera Digital" @dropdown-toggle="() => selectedPaymentMethod = 'digital_wallet'" :isOpen="selectedPaymentMethod === 'digital_wallet'">
              <Input 
                type="select"
                placeholder="Tipo de billetera"
                :options="[
                  {value: 'mercadopago', label: 'Mercado Pago'},
                  {value: 'uala', label: 'Ualá'},
                  {value: 'otra', label:'Otra'}
                ]"
                v-model="paymentMethods.digital_wallet.walletType"
                variant="secondary"
                :outline="false"
                />
              <Input
                type="text"
                placeholder="CVU o Alias"
                v-model="paymentMethods.digital_wallet.walletId"
                variant="secondary"
                :outline="false"
              />
            </DropdownForm>
            
            <DropdownForm title="Tarjeta de crédito/débito" @dropdown-toggle="() => selectedPaymentMethod = 'credit_card'" :isOpen="selectedPaymentMethod === 'credit_card'">
              <Input 
                type="text"
                placeholder="Titular de tarjeta"
                v-model="paymentMethods.credit_card.cardholder"
                :variant="'secondary'"
                :outline="false"
                />
                <Input 
                  type="text"
                  placeholder="Número de tarjeta"
                  v-model="paymentMethods.credit_card.cardNumber"
                  :variant="'secondary'"
                  :outline="false"
                />
              <div class="flex gap-5">
                <Input 
                  type="date"
                  placeholder="Fecha de vencimiento"
                  v-model="paymentMethods.credit_card.expiryDate"
                  :variant="'secondary'"
                  :outline="false"
                />
                <Input
                  type="password"
                  placeholder="CVV"
                  v-model="paymentMethods.credit_card.cvv"
                  :variant="'secondary'"
                  :outline="false"
                />
              </div>
            </DropdownForm>

            <DropdownForm title="Paypal" @dropdown-toggle="() => selectedPaymentMethod = 'paypal'" :isOpen="selectedPaymentMethod === 'paypal'">
              <Input 
                type="email"
                placeholder="Email de PayPal"
                v-model="paymentMethods.paypal.email"
                :variant="'secondary'"
                :outline="false"
                />
            </DropdownForm>
          </div>
        </router-view>

        <!-- Paso 5: Términos y Condiciones -->
        <router-view v-if="currentStep === 4" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-white !font-extrabold">Términos y Condiciones</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex gap-2 items-center">
            <Checkbox v-model="user.acceptedTerms" :disabled="user.acceptedTerms"/>
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
            <Checkbox v-model="user.acceptedPrivacyPolicy" :disabled="user.acceptedPrivacyPolicy"/>
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
            <Checkbox v-model="user.acceptedNotifications" />
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
</template>

<style>
.sections-sidebar {
  width: 350px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 40px
}

.section-item {
  padding: 1rem;
  border-radius: 16px;
  transition: background-color 0.3s ease;
  display: flex;
  justify-content: space-between;
  font-size: 20px;
  font-weight: 600;
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
}
</style>