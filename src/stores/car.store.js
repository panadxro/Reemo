import { defineStore } from 'pinia';
import { getCarById, checkIfCarIsRented } from "../services/car-service.js";
import { useAuthStore } from '@stores';
import { getUserCars } from '@/services/car/core.js'

export const useCarStore = defineStore('car', {
  state: () => ({
    car: {
      id: null,
      marca: '',
      modelo: '',
      precio: 0,
      año: '',
      chasis: '',
      motor: '',
      transmision: '',
      combustible: '',
      description: '',
      accessories: [],
      images: [],
      coordenadas: {
        lat: null,
        lng: null
      },
      user: {
        id: null,
        name: '',
        lastName: '',
        photoURL: '',
        userName: ''
      },
      user_id: null
    },
    loading: false,
    error: null,
    currentImage: null,
    isRented: false,
    defaultCarImage: "/src/assets/Car-Img.png",
    defaultUserImage: "/src/assets/User.png",
    mapInitialized: false,
    userCars: [],
    visitedUserCars: [],
    loadingUserCars: false,
  }),

  getters: {
    isUserOwner: (state) => {
      const authStore = useAuthStore();
      return state.car.user_id === authStore.user?.id;
    },
    formattedPrice: (state) => {
      return state.car.precio ? `$${state.car.precio}` : '$0';  
    },
    carImages: (state) => {
      if (!state.car?.images || !Array.isArray(state.car.images)) {
        return [state.defaultCarImage];
      }
      return state.car.images.length > 0 ? state.car.images : [state.defaultCarImage];
    },
    errorMessage: (state) => {
      return state.error || "Hubo un error al obtener los detalles del auto. Volvé a intentar";
    },
    getUserCars: (state) => state.userCars || [],
    getVisitedUserCars: (state) => state.visitedUserCars || [],
  },

  actions: {
    async loadUserCars(userId) {
      this.loadingUserCars = true;
      try {
        const cars = await getUserCars(userId);
        
        const authStore = useAuthStore();
        if (userId === authStore.user?.id) { 
          this.userCars = cars || [];  
        } else {
          this.visitedUserCars = cars || [];  
        }
        return cars;
      } catch (error) {
        this.error = error.message || "Error al cargar autos del usuario";  message
        console.error("Error al cargar autos del usuario:", error);
        throw error;
      } finally {
        this.loadingUserCars = false;
      }
    },

    async fetchCarById(carId) {
      this.resetState();
      this.loading = true;
      
      try {
        const carData = await getCarById(carId);
        
        if (!carData) {
          throw new Error("No se encontraron datos del auto");
        }
        
        this.car = {
          ...this.car, 
          ...carData,  
          images: carData.images || [],
          accessories: carData.accessories || [],
          user: carData.user || {
            id: null,
            name: '',
            lastName: '',
            photoURL: '',
            userName: ''
          },
          coordenadas: carData.coordenadas || { lat: null, lng: null }
        };
        
        this.currentImage = this.carImages[0];
        
        this.isRented = await checkIfCarIsRented(carId);
        
        return this.car;
      } catch (error) {
        this.error = error.message || "Hubo un error al obtener los detalles del auto. Volvé a intentar";
        console.error("Error al obtener los detalles del auto:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    setCurrentImage(image) {
      this.currentImage = image || this.defaultCarImage; 
    },
    
    resetState() {
      this.car = {
        id: null,
        marca: '',
        modelo: '',
        precio: 0,
        año: '',
        chasis: '',
        motor: '',
        transmision: '',
        combustible: '',
        description: '',
        accessories: [],
        images: [],
        coordenadas: {
          lat: null,
          lng: null
        },
        user: {
          id: null,
          name: '',
          lastName: '',
          photoURL: '',
          userName: ''
        },
        user_id: null
      };
      this.currentImage = null;
      this.isRented = false;
      this.loading = false;
      this.error = null;
    },
    
    updateCarCoordinates(coordinates) {
      if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
        this.car.coordenadas = {
          lat: coordinates.lat,
          lng: coordinates.lng
        };
      } else {
        console.warn("Coordenadas inválidas:", coordinates);
      }
    },
    
    async checkRentalStatus() {
      if (!this.car?.id) { 
        console.warn("No hay ID de auto para verificar estado de alquiler");
        return false;
      }
      
      try {
        this.isRented = await checkIfCarIsRented(this.car.id);
        return this.isRented;
      } catch (error) {
        console.error("Error al verificar estado de alquiler:", error);
        return false;
      }
    },
    
    handleImageError(event) {
      if (event?.target) { 
        event.target.src = this.defaultCarImage;
      }
    }
  }
});