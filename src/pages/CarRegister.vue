<script setup>
import { ref, markRaw, onMounted, onBeforeUnmount, computed, reactive, watch } from 'vue';
import { useAuthStore, useUserStore, useCarStore } from '@stores'
import { loadGoogleMaps, initAutocomplete } from "../services/google-maps.js"; 
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
import Cross from "@icons/Cross.vue"

const router = useRouter();

const authStore = useAuthStore();
const userStore = useUserStore();
const carStore = useCarStore();

const basicInfo = computed(() => carStore.basicInfo);
const specifications = computed(() => carStore.specifications);
const status = computed(() => carStore.status);
const features = computed(() => carStore.features);
const pricing = computed(() => carStore.pricing);
const photos = computed(() => carStore.photos);
const insurance = computed(() => carStore.insurance);
const availability = computed(() => carStore.availability);

const authSessionHistory = sessionStorage.getItem('auth_session_history');
const authSession = JSON.parse(authSessionHistory);

const currentStep = ref(0);
const autocompleteInitialized = ref(false);

const justifyClass = computed(() => ({
  'justify-start': currentStep.value <= 1,
  'justify-center': currentStep.value > 1 && currentStep.value < 5,
  'justify-end': currentStep.value >= 5
}));

const selectedAccessories = ref([]);

const allAccessoryOptions = ref([
  { value: 'touchScreen', label: 'Pantalla táctil' },
  { value: 'appleCarPlayAndroidAuto', label: 'Apple CarPlay/Android Auto' },
  { value: 'bluetooth', label: 'Bluetooth' },
  { value: 'gps', label: 'GPS' },
  { value: 'premiumSound', label: 'Sonido premium' },
  { value: 'integratedVirtualAssistant', label: 'Asistente virtual integrado' },
  { value: '360parkingSensors', label: 'Sensores de estacionamiento 360°' },
  { value: 'absBrakes', label: 'Frenos ABS' },
  { value: 'cruiseControl', label: 'Control de crucero' },
  { value: 'automaticParkingAssistant', label: 'Asistente de estacionamiento automático' },
  { value: 'rearViewCamera', label: 'Cámara de marcha atrás' },
  { value: 'esc', label: 'Control de estabilidad (ESC)' },
  { value: 'tractionControl', label: 'Control de tracción' },
  { value: 'airbags', label: 'Airbags' },
  { value: 'seatbeltPretensioners', label: 'Cinturones de seguridad con pretensores' },
  { value: 'isofixLatch', label: 'Anclajes ISOFIX/LATCH' },
  { value: 'steeringWheelPaddles', label: 'Paletas de cambio al volante' },
  { value: 'drivingModes', label: 'Modos de conducción (Eco, Sport, Off-road)' },
  { value: 'sportsSuspension', label: 'Suspensión deportiva' },
  { value: 'powerSteering', label: 'Dirección asistida' },
  { value: 'sportsBrakes', label: 'Frenos deportivos' },
  { value: 'sportsExhaust', label: 'Escape deportivo' },
  { value: 'startStopSystem', label: 'Sistema start-stop' },
  { value: 'lockingDifferential', label: 'Diferencial autoblocante' },
  { value: 'cngReady', label: 'Preparación GNC' },
  { value: 'automaticClimateControl', label: 'Climatizador automático' },
  { value: 'heatedVentilatedSeats', label: 'Asientos calefaccionados/ventilados' },
  { value: 'memorySeat', label: 'Asiento con memoria' },
  { value: 'premiumUpholstery', label: 'Tapizado premium' },
  { value: 'electricSunroof', label: 'Techo solar eléctrico' },
  { value: 'automaticWipers', label: 'Limpiaparabrisas automáticos' },
  { value: 'automaticTrunk', label: 'Maletero automático' },
  { value: 'smartMirrors', label: 'Espejos inteligentes' },
  { value: 'premiumSoundproofing', label: 'Insonorización premium' },
  { value: 'trunkOrganizer', label: 'Organizador de maletero' }
]);

const availableAccessoryOptions = computed(() => {
  const selectedValues = selectedAccessories.value.map(acc => acc.value);
  return allAccessoryOptions.value.filter(option => !selectedValues.includes(option.value));
});

const handleAccessorySelect = (event) => {
  console.log('handleAccessorySelect ejecutado', event); 
  
  let selectedValue;
  if (typeof event === 'string') {
    selectedValue = event;
  } else if (event?.target?.value) {
    selectedValue = event.target.value;
  } else if (event?.value) {
    selectedValue = event.value;
  } else {
    console.log('No se pudo obtener el valor del evento:', event);
    return;
  }
  
  console.log('Acesorio seleccionado:', selectedValue); 
  
  if (selectedValue && selectedValue !== '') {
    const selectedOption = allAccessoryOptions.value.find(option => option.value === selectedValue);
    
    if (selectedOption && !selectedAccessories.value.find(acc => acc.value === selectedValue)) {
      selectedAccessories.value.push(selectedOption);
      console.log('Accesorios actuales:', selectedAccessories.value); 
      
      updateFeaturesInStore();
    }
  }
};

const updateFeaturesInStore = () => {
  const accessoryValues = selectedAccessories.value.map(acc => acc.value);
  console.log('Actualizando store con:', accessoryValues); 
  
  carStore.updateFeatures({ accessories: accessoryValues });
  
  console.log('accesorios despues de actualizare:', carStore.features); 
};

const removeAccessory = (value) => {
  selectedAccessories.value = selectedAccessories.value.filter(acc => acc.value !== value);
  
  updateFeaturesInStore();
};

const validateStep = (step) => {
  switch (step) {
    case 0: // Información básica
      if (!basicInfo.value.brand || !basicInfo.value.model || !basicInfo.value.year || 
          !basicInfo.value.type || !basicInfo.value.color || !basicInfo.value.licensePlate || 
          !basicInfo.value.kilometers) {
        addAlert('Por favor completa todos los campos de información básica', 'error');
        return false;
      }
      return true;

    case 1: // Especificaciones técnicas
      if (!specifications.value.engine || !specifications.value.transmission || 
          !specifications.value.fuelType || !specifications.value.drivetrain || 
          !specifications.value.autonomy || !specifications.value.doors || 
          !specifications.value.seats) {
        addAlert('Por favor completa todos los campos de especificaciones técnicas', 'error');
        return false;
      }
      return true;

    case 2: // Equipamiento y características
      // Este paso es opcional ya que son accesorios
      return true;

    case 3: // Ubicación y disponibilidad
      if ( !availability.value.hours.startTime || 
          !availability.value.hours.endTime) {
        addAlert('Por favor completa la ubicación y horarios de disponibilidad', 'error');
        return false;
      }
      
      // Verificar que al menos un día esté seleccionado
      const hasDaySelected = Object.values(availability.value.schedule).some(day => day);
      if (!hasDaySelected) {
        addAlert('Por favor selecciona al menos un día de disponibilidad', 'error');
        return false;
      }
      return true;

    case 4: // Políticas y tarifas
      if (!pricing.value.rates.daily || !pricing.value.rates.weekly || 
          !pricing.value.rates.monthly || !pricing.value.mileagePolicy.includedPerDay || 
          !pricing.value.mileagePolicy.extraPricePerKm || !pricing.value.securityDeposit) {
        addAlert('Por favor completa todos los campos de políticas y tarifas', 'error');
        return false;
      }
      return true;

    case 5: // Fotos del vehículo
      if (!status.value.description || !filePreviews.photo1File) {
        addAlert('Por favor completa la descripción y sube al menos una foto', 'error');
        return false;
      }
      return true;

    case 6: // Información de seguro
      if (!insurance.value.number || !insurance.value.company || !insurance.value.type) {
        addAlert('Por favor completa todos los campos de información de seguro', 'error');
        return false;
      }
      return true;

    default:
      return true;
  }
};

const filePreviews = reactive({
  photo1: null,
  photo1File: null,
  photo2: null,
  photo2File: null,
  photo3: null,
  photo3File: null,
  photo4: null,
  photo4File: null
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

const handleFileChange = (event, field) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validaciones básicas
  if (!file.type.startsWith('image/')) {
    addAlert('Por favor sube solo imágenes (JPEG, PNG)', 'error');
    return;
  }

  // Crear preview
  const reader = new FileReader();
  reader.onload = (e) => {
    filePreviews[field] = e.target.result;
  };
  reader.readAsDataURL(file);

  // Guardar archivo
  filePreviews[`${field}File`] = file;
};

const nextStep = () => {
  if (!validateStep(currentStep.value)) {
    return; // No avanzar si la validación falla
  }
  
  if (currentStep.value < sections.value.length - 1) {
    currentStep.value++;
  }
};

const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const days = [
  { label: 'L', storeKey: 'monday' },
  { label: 'M', storeKey: 'tuesday' },
  { label: 'X', storeKey: 'wednesday' },
  { label: 'J', storeKey: 'thursday' },
  { label: 'V', storeKey: 'friday' },
  { label: 'S', storeKey: 'saturday' },
  { label: 'D', storeKey: 'sunday' }
];

const timeOptions = ref(
  Array.from({ length: 24 }, (_, i) => {
    const hour = i % 12 || 12;
    const ampm = i < 12 ? 'AM' : 'PM';
    return {
      value: `${i.toString().padStart(2, '0')}:00`,
      label: `${hour}:00 ${ampm}`
    };
  })
);

const handleSubmit = async () => {
    // Validar el último paso antes de enviar
    if (!validateStep(currentStep.value)) {
    return;
  }
  
  // Validar todos los pasos antes de enviar
  for (let i = 0; i < sections.value.length; i++) {
    if (!validateStep(i)) {
      currentStep.value = i; // Redirigir al paso con error
      addAlert(`Por favor completa todos los campos requeridos en la sección "${sections.value[i].title}"`, 'error');
      return;
    }
  }

  loading.value = true;
  
  try {
    // 1. Obtener ID del store (ya generado previamente)
    const carId = carStore.currentCar.id;
    if (!carId) throw new Error("Missing car ID");

    // 2. Subir fotos
    const photoUrls = [];
    for (let i = 0; i < 4; i++) {
      const photoKey = `photo${i+1}`;
      if (filePreviews[`${photoKey}File`]) {
        photoUrls[i] = await carStore.uploadCarPhoto(
          authStore.user.id,
          filePreviews[`${photoKey}File`],
          carStore.currentCar.id,
          i
        );
      }
    }

    // 3. Preparar datos completos
    const carData = {
      id: carId,
      ownerId: authStore.user.id,
      basicInfo: { ...basicInfo.value },
      specifications: { ...specifications.value },
      status: { 
        ...status.value,
        current: "available",
        timesRented: 0
      },
      features: { ...features.value },
      pricing: { ...pricing.value },
      insurance: { ...insurance.value },
      availability: { ...availability.value },
      photos: photoUrls.filter(url => url)
    };

   // 4. Guardar en Firestore (primera creación real)
   await carStore.saveCar(carData);

    addAlert('¡Vehículo registrado con éxito!', 'success');
    router.push(`/car/${carStore.currentCar.id}`);
    
  } catch (error) {
    console.error('Error al registrar vehículo:', error);
    addAlert('Error al registrar el vehículo. Por favor intenta nuevamente.', 'error');
  } finally {
    loading.value = false;
  }
};

const handleBeforeUnload = (event) => {
  const message = '¿Estás seguro de que quieres salir? Los cambios no guardados se perderán.';
  event.preventDefault();
  event.returnValue = message;
  return message;
};

const toggleDay = (dayKey) => {
  carStore.availability.schedule[dayKey] = !carStore.availability.schedule[dayKey];
};

// Load initial data
onMounted(async () => {
  // window.addEventListener('beforeunload', handleBeforeUnload);
  try {
    if (!authSession.user.id) {
      throw new Error("User not authenticated");
    }
    
    // await geoStore.loadProvinciasYLocalidades();
    // await carStore.initializeCar(authSession.user.id);
    if (!carStore.currentCar.id) {
      carStore.initializeCar();
    }

    // Cargar accesorios existentes si los hay
    if (features.value?.accessories) {
      selectedAccessories.value = allAccessoryOptions.value.filter(
        option => features.value.accessories.includes(option.value)
      );
    }
  } catch (error) {
    console.error("Initialization error:", error);
    addAlert('Error al cargar los datos del vehículo', 'error');
    router.push('/'); // Redirige si hay error
  }
});

watch(currentStep, async (newStep) => {  
  if (newStep === 3 && !autocompleteInitialized.value) {  
    // const addressInput = document.getElementById('carRegisterAddressInput');
    // if(!addressInput){
    //   console.warn('[CarRegister] input de dirección no encontrado', addressInput);
    //   setTimeout(() => {}, 100);
    //   return;
    // }
    try {
      await loadGoogleMaps();
      initAutocomplete('carRegisterAddressInput', (placeData) => {
        if (placeData && status.value && status.value.currentLocation) {
          // Actualizar el store directamente o mediante una acción
          carStore.updateCarCurrentLocation({
            address: placeData.formattedAddress,
            location: placeData.location // {lat, lng}
          });
          // Opcional: podrías extraer y guardar ciudad/país aquí si es necesario
        }
      });
      autocompleteInitialized.value = true;
    } catch (error) {
      console.error("Error al inicializar autocompletado de dirección en CarRegister:", error);
      addAlert('No se pudo inicializar la búsqueda de direcciones.', 'error');
    }
  }
});

onBeforeUnmount(() => {
  // window.removeEventListener('beforeunload', handleBeforeUnload);
});
</script>

<template>
  <section class="flex relative max-w-[1120px] max-h-[675px] h-full w-full mx-auto justify-between px-16 py-12 bg-vibrant-light-600 rounded-[40px] text-deep-blue-900 overflow-hidden">
    <!-- Secciones al costado -->
    <aside class="flex flex-col gap-8 w-full max-w-[425px]">
      <div class="flex flex-col gap-2">
        <div class="flex gap-2 items-center">
        <Heading type="1" class="large text-deep-blue-900 font-extrabold!">Registrar vehículo</Heading>
        </div>
        <p class="text-sm max-w-[420px]">Subscribí tu vehículo a la plataforma y haz que trabaje por vos.</p>
      </div>
      <ul 
        class="flex flex-col gap-[40px] max-w-[420px] w-full h-[495px] rounded-lg px-2 overflow-hidden transition-all duration-300 ease-in-out"
        :class="justifyClass"
        >
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
      <div class="flex justify-between">
        <p>{{ currentStep + 1 }}/{{ sections.length }}</p>
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
                v-model="basicInfo.brand"
                name="brand"
                id="brand"
                placeholder="Marca"
                :options="[
                  { value: 'Toyota', label: 'Toyota' },
                  { value: 'Volkswagen', label: 'Volkswagen' },
                  { value: 'Ford', label: 'Ford' },
                  { value: 'Chevrolet', label: 'Chevrolet' },
                  { value: 'Fiat', label: 'Fiat' },
                  { value: 'Renault', label: 'Renault' },
                  { value: 'Peugeot', label: 'Peugeot' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              />
              <Input
                type="select"
                v-model="basicInfo.model"
                name="model"
                id="model"
                placeholder="Modelo"
                :options="[
                  { value: 'Corolla', label: 'Corolla' },
                  { value: 'Hilux', label: 'Hilux' },
                  { value: 'Etios', label: 'Etios' },
                  { value: 'SW4', label: 'SW4' },
                  { value: 'Yaris', label: 'Yaris' }
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
                v-model.number="basicInfo.year"
                name="year"
                id="year"
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
                v-model="basicInfo.type"
                name="type"
                id="type"
                placeholder="Tipo de chasis"
                :options="[
                  { value: 'Sedan', label: 'Sedán' },
                  { value: 'Hatchback', label: 'Hatchback' },
                  { value: 'SUV', label: 'SUV' },
                  { value: 'Pickup', label: 'Pickup' },
                  { value: 'Van', label: 'Van' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-45"
              /> 
              <Input
                type="select"
                v-model="basicInfo.color"
                name="color"
                id="color"
                placeholder="Color"
                :options="[
                  { value: 'Blanco', label: 'Blanco' },
                  { value: 'Negro', label: 'Negro' },
                  { value: 'Gris', label: 'Gris' },
                  { value: 'Rojo', label: 'Rojo' },
                  { value: 'Azul', label: 'Azul' },
                  { value: 'Plateado', label: 'Plateado' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-30"
              /> 
            </div>  
            <div class="flex gap-5">
              <Input
                type="text"
                v-model="basicInfo.licensePlate"
                name="licensePlate"
                id="licensePlate"
                placeholder="Patente"
                :variant="'secondary'"
                :outline="true"
                required />
              <Input
                type="number"
                v-model.number="basicInfo.kilometers"
                name="kilometers"
                id="kilometers"
                placeholder="Kilometraje"
                :variant="'secondary'"
                :outline="true"
                required />
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
                v-model="specifications.engine"
                name="engine"
                id="engine"
                placeholder="Motor"
                :options="[
                  { value: '1.4', label: '1.4L 4 cilindros' },
                  { value: '1.6', label: '1.6L 4 cilindros' },
                  { value: '1.8', label: '1.8L 4 cilindros' },
                  { value: '2.0', label: '2.0L 4 cilindros' },
                  { value: '2.4', label: '2.4L 4 cilindros' },
                  { value: '3.0', label: '3.0L V6' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              />
              <Input
                type="select"
                v-model="specifications.transmission"
                name="transmission"
                id="transmission"
                placeholder="Transmisión"
                :options="[
                  { value: 'Automática', label: 'Automática' },
                  { value: 'Manual', label: 'Manual' },
                  { value: 'CVT', label: 'CVT' }                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full"
              /> 
            </div>
            <div class="flex gap-5">
              <Input
                type="select"
                v-model="specifications.fuelType"
                name="fuelType"
                id="fuelType"
                placeholder="Combustible"
                :options="[
                  { value: 'Nafta', label: 'Nafta' },
                  { value: 'Diesel', label: 'Diésel' },
                  { value: 'GNC', label: 'GNC' },
                  { value: 'Híbrido', label: 'Híbrido' },
                  { value: 'Eléctrico', label: 'Eléctrico' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full cursor-pointer"
              />
              <Input
                type="select"
                v-model="specifications.drivetrain"
                name="drivetrain"
                id="drivetrain"
                placeholder="Tracción"
                :options="[
                  { value: 'Delantera', label: 'Delantera' },
                  { value: 'Trasera', label: 'Trasera' },
                  { value: '4x4', label: '4x4' },
                  { value: 'AWD', label: 'AWD (Tracción integral)' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="w-full cursor-pointer"
              />            
            </div> 
            <div class="flex gap-5">
              <Input
                type="number"
                v-model.number="specifications.autonomy"
                placeholder="Autonomía"
                name="autonomy"
                id="autonomy"
                :variant="'secondary'"
                :outline="true"
                required />
              <Input
                type="number"
                v-model.number="specifications.doors"
                name="doors"
                id="doors"
                placeholder="Puertas"
                :variant="'secondary'"
                :outline="true"
                required />
              <Input
                type="number"
                v-model.number="specifications.seats"
                name="seats"
                id="seats"
                placeholder="Asientos"
                :variant="'secondary'"
                :outline="true"
                required />
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
      :options="availableAccessoryOptions"
      icon-position="right"
      variant="secondary"
      :outline="true"
      class="w-full cursor-pointer"
      @change="handleAccessorySelect"
    />   
    
    <div 
      v-if="selectedAccessories.length > 0" 
      class="flex flex-wrap gap-2 mt-3 max-h-[200px] overflow-auto"
      >
      <div 
        v-for="accessory in selectedAccessories" 
        :key="accessory.value"
        class="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-2 rounded-full text-sm font-medium border border-blue-200 hover:bg-blue-200 transition-colors"
      >
        <span>{{ accessory.label }}</span>
        <Cross @click="removeAccessory(accessory.value)" :aria-label="`Eliminar ${accessory.label}`"/>
      </div>
    </div>
    
    <!-- <DropdownForm title="Tecnología y conectividad" :section-id="'section-1'" :dropdown-id="'tecnologia-conectividad'" :is-initial="true">
    </DropdownForm>
    <DropdownForm title="Seguridad y Asistencia" :section-id="'section-1'" :dropdown-id="'seguridad-asistencia'">
    </DropdownForm>
    <DropdownForm title="Performance" :section-id="'section-1'" :dropdown-id="'performance'">
    </DropdownForm>
    <DropdownForm title="Confort" :section-id="'section-1'" :dropdown-id="'confort'">
    </DropdownForm>
    -->
  </div>
</router-view>
 
        <!-- Paso 4: Ubicación y disponibilidad -->
        <router-view v-if="currentStep === 3" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Ubicación y disponibilidad</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <div class="flex flex-col gap-5">
            <Input
              id="carRegisterAddressInput"
              v-model="status.currentLocation.address"
              type="text" placeholder="Direccion" :variant="'secondary'" :outline="true" iconPosition="right" required>
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
              
              <div class="flex gap-4 mb-8">
                <div 
                  v-for="(day, index) in days" 
                  :key="index"
                  class="w-8 h-8 rounded-full flex items-center justify-center cursor-pointer text-deep-blue-900 font-semibold"
                  :class="{
                    'bg-vibrant-light-900': availability.schedule[day.storeKey],
                    'bg-white': !availability.schedule[day.storeKey]
                  }"
                  @click="toggleDay(day.storeKey)"
                >
                  {{ day.label }}
                </div>
              </div>
              
              <!-- Selector de horario -->
              <div class="flex w-full max-w-xs gap-4 font-bold">
                <div class="flex-1 flex flex-col items-center">
                  <label for="start-time">Desde</label>
                  <select 
                    id="start-time" 
                    v-model="availability.hours.startTime" 
                    class="p-2 rounded-lg border border-gray-300"
                  >
                    <option 
                      v-for="time in timeOptions" 
                      :key="'start-'+time.value" 
                      :value="time.value"
                    >
                      {{ time.label }}
                    </option>
                  </select>
                </div>
                <div class="flex-1 flex flex-col items-center">
                  <label for="end-time">Hasta</label>
                  <select 
                    id="end-time" 
                    v-model="availability.hours.endTime"
                    class="p-2 rounded-lg border border-gray-300"
                  >
                    <option 
                      v-for="time in timeOptions" 
                      :key="'end-'+time.value" 
                      :value="time.value"
                    >
                      {{ time.label }}
                    </option>
                  </select>
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
              <Input
                type="number"
                v-model.number="pricing.rates.daily"
                name="daily"
                id="daily"
                placeholder="Diaria"
                :variant="'secondary'"
                :outline="true"
                required />
              <Input
                type="number"
                v-model.number="pricing.rates.weekly"
                name="weekly"
                id="weekly"
                placeholder="Semanal"
                :variant="'secondary'"
                :outline="true"
                required />
              <Input
                type="number"
                v-model.number="pricing.rates.monthly"
                name="monthly"
                id="monthly"
                placeholder="Mensual"
                :variant="'secondary'"
                :outline="true"
                required />
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
                v-model.number="pricing.mileagePolicy.includedPerDay"
                name="km-incluidos"
                id="km-incluidos"
                placeholder="KM incluidos/día"
                :options="[
                  { value: '100', label: '100 km/día' },
                  { value: '150', label: '150 km/día' },
                  { value: '200', label: '200 km/día (Recomendado)' },
                  { value: '250', label: '250 km/día' },
                  { value: '300', label: '300 km/día' },
                  { value: 'ilimitado', label: 'Ilimitado' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-45"
              />
              <Input
                type="select"
                v-model="pricing.mileagePolicy.extraPricePerKm"
                name="km-extra"
                id="km-extra"
                placeholder="Precio por KM extra"
                :options="[
                  { value: '500', label: '$500/km' },
                  { value: '750', label: '$750/km' },
                  { value: '1000', label: '$1000/km (Promedio)' },
                  { value: '1200', label: '$1200/km' },
                  { value: '1500', label: '$1500/km' }
                ]"
                icon-position="right"
                variant="secondary"
                :outline="true"
                class="flex !flex-50"
              />    
            </div>
          </DropdownForm>
          <DropdownForm title="Depósito de seguridad" :section-id="'section-2'" :dropdown-id="'seguridad'">
              <Input 
                type="number" 
                v-model.number="pricing.securityDeposit" 
                name="security-deposit" 
                id="security-deposit" 
                placeholder="Monto total del depósito" 
                :variant="'secondary'" 
                :outline="true" 
                required />
          </DropdownForm>
        </router-view>

         <!-- Paso 5: Fotos del vehículo -->
         <router-view v-if="currentStep === 5" class="step">
          <div class="flex gap-4 items-center">
            <Heading type="2" class="large !text-deep-blue-900 !font-extrabold">Fotos del vehículo</Heading>
            <Loading v-if="loading" role="status" />
          </div>
          <p class="text-sm font-medium">Describe las características principales de tu vehículo. Subí fotos que muestren tanto el exterior como el interior, destacando sus mejores atributos. Las publicaciones con buenas imágenes reciben un 40% más de reservas.</p>
          
          <!-- Textarea descripcion -->
          <Input 
            type="textarea" 
            v-model="status.description" 
            name="description" 
            id="description" 
            placeholder="Descripción" 
            :variant="'secondary'" 
            :outline="true" 
            required />

          <!-- Contenedor de fotos con grid de 4 columnas -->
          <div class="grid grid-cols-4 gap-4 w-full">
            <div 
              v-for="index in 4" 
              :key="index" 
              class="flex flex-col items-center gap-2"
            >
              <label :for="'photo' + index" class="cursor-pointer w-full">
                <!-- Contenedor de imagen con tamaño fijo y object-cover -->
                <div class="relative aspect-square w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-gray-50 hover:bg-gray-100 transition">
                  <!-- Imagen de placeholder o subida -->
                  <img 
                    v-if="!filePreviews['photo' + index]" 
                    src="../assets/Car-Img.png" 
                    class="absolute inset-0 w-full h-full object-contain p-4"
                    :alt="`Foto ${index}`"
                  >
                  <img 
                    v-else 
                    :src="filePreviews['photo' + index]" 
                    class="absolute inset-0 w-full h-full object-cover"
                    :alt="`Foto ${index}`"
                  >
                  <!-- Indicador de foto subida -->
                  <div 
                    v-if="filePreviews['photo' + index]" 
                    class="absolute top-2 right-2 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✓
                  </div>
                </div>
              </label>
              <input 
                :id="'photo' + index" 
                type="file" 
                accept="image/*" 
                @change="(e) => handleFileChange(e, 'photo' + index)" 
                class="hidden"
              >
              <span class="text-xs text-gray-500">Foto {{ index }}</span>
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
              type="tel" 
              v-model.number="insurance.number" 
              name="number-insurance" 
              id="number-insurance" 
              placeholder="Número de póliza" 
              :variant="'secondary'" 
              :outline="true" 
              required />
            <Input
              type="select"
              v-model="insurance.company"
              name="company"
              id="company"
              placeholder="Compañia aseguradora"
              :options="[
                { value: 'san_cristobal', label: 'San Cristóbal' },
                { value: 'la_caja', label: 'La Caja' },
                { value: 'federacion_patronal', label: 'Federación Patronal' },
                { value: 'allianz', label: 'Allianz' },
                { value: 'sancor', label: 'Sancor Seguros' },
                { value: 'mercantil', label: 'Mercantil Andina' },
                { value: 'triunfo', label: 'El Triunfo' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="w-full cursor-pointer" />
            <Input
              type="select"
              v-model="insurance.type"
              name="type-insurance"
              id="type-insurance"
              placeholder="Tipo de cobertura"
              :options="[
                { value: 'total', label: 'Todo riesgo' },
                { value: 'terceros_completo', label: 'Terceros completo' },
                { value: 'terceros_basico', label: 'Terceros básico' },
                { value: 'granizo', label: 'Todo riesgo + granizo' }
              ]"
              icon-position="right"
              variant="secondary"
              :outline="true"
              class="w-full cursor-pointer"
            />
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
            :type="currentStep === 6 ? 'submit' : 'button'"
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
/* .sections-sidebar {
  max-width: 420px;
  width: 100%;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 40px;
}
 */
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