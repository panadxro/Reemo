<script setup>
import { ref, reactive, onMounted, watch, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { subscribeToAuthState } from "../services/auth.js"
import { subscribeToNewPublication } from "../services/publication.js"
import { useAuthStore, useCarStore } from '@stores'
import { vpicService } from '../services/car/vpicApi.js'
import { addAlert } from "../services/alerts.js"

import { updateCars, initAutocomplete, loadGoogleMaps, getCurrentLocation } from "../services/google-maps.js"
import { filterByPreferences } from "../services/filterService.js"

import Heading from "@components/atoms/Heading.vue"
import CardCar from "@components/organisms/cars/CardCar.vue"
import Loading from "@icons/Loading.vue"
import Input from "../components/molecules/Input.vue"
import FilterIcon from '@icons/FilterIcon.vue'
import PriceRange from "../components/molecules/PriceRange.vue"
import CheckboxFilter from "../components/atoms/CheckboxFilter.vue"
import Repeat from "@icons/Repeat.vue"
import SearchIcon from "@icons/Search.vue"
import BackButton from "@components/atoms/BackButton.vue"
import NoCarsResult from "@components/atoms/NoCarsResult.vue"
import Arrow from "@icons/Arrow.vue"

const router = useRouter()
const authStore = useAuthStore();
const carStore = useCarStore(); 

const loggedUser = reactive({
  id: null,
  email: null,
})

const cars = ref([])
const searchQuery = ref("")
const searchLocation = ref("")
const filteredCars = ref([])
const map = ref(null)
const markers = ref([])
const loading = ref(false)
const showFilters = ref(false)

const chassisTypes = ["Sedan", "Van", "SUV", "Pickup", "Minivan", "Coupe"]
const selectedChassis = ref([])
const savedFilters = ref(null)
const optionsTransmission = ["Ambos", "Manual", "Automatico"]
const selectedTransmission = ref([])

// Variables para la API de vehículos
const vehicleMakes = ref([])
const vehicleModels = ref([])
const loadingMakes = ref(false)
const loadingModels = ref(false)

const filters = reactive({
  transmission: '',
  brand: '',
  model: '',
  minPrice: 20000,
  maxPrice: 100000,
  chassis: [],
})

const isVerified = computed(() => authStore.userStatus === 'verified');

// Funciones para la API de vehículos
const loadMakes = async () => {
  loadingMakes.value = true;
  try {
    vehicleMakes.value = await vpicService.getBrands();
  } catch (error) {
    console.error('Error loading makes:', error);
    addAlert('Error al cargar las marcas de vehículos', 'error');
  } finally {
    loadingMakes.value = false;
  }
};

const loadModels = async (makeName) => {
  if (!makeName) {
    vehicleModels.value = [];
    return;
  }
  
  loadingModels.value = true;
  try {
    vehicleModels.value = await vpicService.getModelsForMake(makeName);
  } catch (error) {
    console.error('Error loading models:', error);
    addAlert('Error al cargar los modelos para esta marca', 'error');
  } finally {
    loadingModels.value = false;
  }
};

// Methods
const fetchCars = async () => {
  loading.value = true
  filteredCars.value = null 
  try {
    await carStore.loadAvailableCars(loggedUser.id)
    cars.value = carStore.availableCars
    filteredCars.value = cars.value
  } catch (error) {
    console.error("Error al buscar autos:", error)
    filteredCars.value = [] 
  } finally {
    loading.value = false
  }
}

const goToCarDetails = (carId) => {
  router.push({ name: "CarDetails", params: { id: carId } })
}

const handleRegisterClick = () => {
  if (!isVerified.value) {
    addAlert("El usuario no esta verificado. Aguardá la verificación", "error");
    return;
  }
  router.push({ name: 'CarRegister' });
}

const handlePlaceSelected = ({ formattedAddress, location }) => {
  searchQuery.value = formattedAddress
  searchLocation.value = location
  applyFilters()
}

const useMyLocation = () => {
  getCurrentLocation(handlePlaceSelected)
}

const applyFilters = () => {
  let carsToFilter = []

  if (searchLocation.value && searchLocation.value.lat && searchLocation.value.lng) {
    carsToFilter = updateCars(cars.value, searchLocation.value, map.value)
  } else {
    carsToFilter = cars.value
  }

  // luego filtramos por preferencias
  filteredCars.value = filterByPreferences(carsToFilter, filters)
  
  if (window.innerWidth < 1000) {
    showFilters.value = false
  }
}

const resetFilters = () => {
  Object.assign(filters, {
    minPrice: 20000,
    maxPrice: 100000,
    brand: "",
    model: "",
    chassis: [],
    transmission: "",
  })
  searchLocation.value = ""
  vehicleModels.value = []
  applyFilters()
  localStorage.removeItem('filters')
}

const toggleFilters = () => {
  if (window.innerWidth < 1024) {
    showFilters.value = !showFilters.value
  }
}

onMounted(async () => {
  await loadGoogleMaps()
  initAutocomplete('searchInput', handlePlaceSelected)

  // Cargar marcas al iniciar
  await loadMakes()

  const savedFilters = localStorage.getItem("filters")
  if (savedFilters) {
    const parsedFilters = JSON.parse(savedFilters)
    Object.assign(filters, parsedFilters)
    // Si hay una marca guardada, cargar sus modelos
    if (filters.brand) {
      await loadModels(filters.brand)
    }
    applyFilters()
  }

  subscribeToAuthState((newUserData) => {
    Object.assign(loggedUser, newUserData)
    fetchCars()
  })

  subscribeToNewPublication((newCars) => {
    cars.value = newCars
  })
  
  showFilters.value = window.innerWidth >= 1024

  window.addEventListener('resize', () => {
    showFilters.value = window.innerWidth >= 1024
  })
})

watch(() => filters.brand, async (newBrand, oldBrand) => {
  if (newBrand !== oldBrand) {
    filters.model = ""
    if (newBrand) {
      await loadModels(newBrand)
    } else {
      vehicleModels.value = []
    }
  }
})
</script>

<template>
  <section class="w-full md:min-h-full relative flex p-2.5 gap-5">
    <div 
      class="bg-vibrant-light-600 md:rounded-[40px] md:px-5 pr-2! md:py-9 h-full transition-all duration-300 lg:w-1/4 xl:w-1/5 lg:min-w-[320px] overflow-hidden flex flex-col gap-5 px-2.5 py-5"
      :class=" showFilters ? 'fixed lg:relative inset-0 z-4' : 'hidden lg:block'"
    >
      <div class="flex items-center justify-between">
        <button
          type="button"
          @click="showFilters = false" 
          class="flex items-center p-2 cursor-pointer rounded-full transition-colors duration-100 hover:bg-background-700/30 md:hidden" 
          title="Ir a la página anterior">
          <Arrow direction="left"/>
        </button>
        <Heading :type="2" class="regular mt-2">Filtrar vehículo</Heading>
        <button @click="resetFilters" class="cursor-pointer hover:bg-vibrant-light-800 rounded-full p-1 transition-colors duration-300" title="Limpiar filtros">
          <Repeat/>
        </button>
      </div>
      <div class="box-vibrant h-full overflow-y-auto md:pr-3 flex flex-col gap-5 relative">
        <!-- marca -->
        <div class="flex flex-col gap-2">
          <Heading :type="3" class="small hidden">Marca del vehículo</Heading>
          <div class="flex flex-col sm:flex-row gap-2 text-sm">
            <!-- Marca -->
            <Input
                type="select"
                v-model="filters.brand"
                name="brand"
                id="brand"
                placeholder="Marca"
                :options="vehicleMakes"
                icon-position="right"
                variant="secondary"
                :outline="true"
                :disabled="loadingMakes"
              />
            <!-- Modelo -->
            <Input
                type="select"
                v-model="filters.model"
                :disabled="!filters.brand || loadingModels"
                name="model"
                id="model"
                placeholder="Modelo"
                :options="vehicleModels"
                icon-position="right"
                variant="secondary"
                :outline="true"
              />
          </div>
        </div>
  
        <!-- rango de precio -->
        <div>
          <Heading :type="3" class="small">Rango de precio</Heading>
          <div class="mx-4 lg:mx-4">
            <PriceRange :min="20000" :max="100000" v-model="filters" />
          </div>
        </div>
  
        <!-- chasis -->
        <div class="flex flex-col gap-2">
          <Heading :type="3" class="small">Chasis</Heading>
          <div class="flex flex-wrap 2 gap-2 mt-2 text-sm">
            <CheckboxFilter 
              v-for="chassis in chassisTypes" 
              :key="chassis" 
              :id="chassis.toLowerCase()"
              :name="chassis.toLowerCase()" 
              :label="chassis" 
              labelPosition="right" 
              class="text-deep-blue-900"
              v-model="filters.chassis" 
              :value="chassis" 
            />
          </div>
        </div>
  
        <!-- transmisión -->
        <div class="flex flex-col gap-2">
          <Heading :type="3" class="small">Transmisión</Heading>
          <div class="flex flex-wrap gap-2 mt-2">
            <button 
              v-for="option in optionsTransmission" 
              :key="option" 
              @click="filters.transmission = option === 'Ambos' ? '' : option" 
              :class="[
                'cursor-pointer px-3 py-[6px] text-sm rounded-xl border font-medium transition-all duration-200',
                filters.transmission === (option === 'Ambos' ? '' : option)
                  ? 'bg-[#e6faff] border-[#0ba5ec] text-[#0ba5ec]'
                  : 'bg-white border-gray-300 text-black'
              ]"
            >
              {{ option }}
            </button>
          </div>
        </div>
  
        <div class="flex gap-2 sticky bottom-0">
          <Input
            type="button"
            @click="applyFilters"
            text="Aplicar filtros"
            variant="primary"
            class="text-sm"
            :outline="false"
            />
        </div>
      </div>
    </div>

  <div class="w-full lg:w-3/4 xl:w-4/5 overflow-hidden flex flex-col h-full gap-3">
    <div class="flex items-center gap-5 gap-y-1.5 fixed md:static top-0 left-0 right-0 z-3 bg-white px-2.5 md:px-0 py-3 md:py-0 flex-wrap">
      <BackButton />
      <Heading :type="1" class="text-xl lg:text-2xl text-start flex-1 lg:mt-0">Autos disponibles</Heading>  
      <div class="flex justify-between items-center gap-2 w-full md:w-auto">
        <a 
          href="/car/register"
          class="hidden md:flex"
          >
          <Input
            type="button"
            variant="primary"
            text="Registrar vehículo"
            class="!w-fit"
            :outline="false"
          />    
        </a>
        <router-link 
          to="/maps?focusSearch=true"
          class="flex-1 w-full md:min-w-0"
          >
          <Input
            type="text"
            id="searchInput"
            name="searchInput"
            placeholder="Buscar por ubicación..."
            icon-position="left"
            input-class="!w-full md:!w-fit"
            class="items-end justify-center !flex-1"
            variant="secondary"
            :outline="false"
            >
            <template #icon>
              <SearchIcon />
            </template>
          </Input>
        </router-link>    
        <button 
          @click="toggleFilters" 
          class="lg:hidden bg-vibrant-light-600 p-3 rounded-full"
        >
          <FilterIcon/>
        </button>  
      </div>
    </div>
      <div v-if="loading" class="flex items-center justify-center h-full w-full py-8">
        <Loading role="status" />
        <span class="sr-only">Cargando...</span>
      </div>
      <div v-else-if="filteredCars.length > 0" class="box-white flex-1 overflow-y-auto md:pr-2 pt-8 md:pt-0">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3">
          <CardCar v-for="(car, index) in filteredCars" :key="car.id" :car="car" :index="index" />
        </div>
      </div>
      <div v-else class="flex flex-col items-center justify-center h-full text-center gap-2">
        <NoCarsResult class="max-w-[150px] m-4"/>
        <p class="text-gray-400 font-bold">No hay resultados para tu búsqueda.</p>
        <Input
          type="button"
          text="Recargar página"
          variant="secondary"
          class="!w-fit"
          @click="resetFilters"
          />
      </div>
    </div>
  </section>
</template>