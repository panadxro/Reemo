import { defineStore } from 'pinia';
import { getCarById, checkIfCarIsRented } from "../services/car-service.js";
import { useAuthStore } from '@stores';

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
    mapInitialized: false
  }),

  getters: {
    isUserOwner: (state) => {
      const authStore = useAuthStore();
      return state.car.user_id === authStore.user.id;
    },
    formattedPrice: (state) => {
      return `$${state.car.precio}`;
    },
    carImages: (state) => {
      return state.car.images && state.car.images.length > 0 
        ? state.car.images 
        : [state.defaultCarImage];
    },
    errorMessage: (state) => {
      return state.error || "Hubo un error al obtener los detalles del auto. Volvé a intentar";
    }
  },

  actions: {
    async fetchCarById(carId) {
      this.loading = true;
      this.error = null;
      
      try {
        const carData = await getCarById(carId);
        this.car = carData;
        
        // Establecer imagen por defecto si es necesario
        if (!this.car.user) {
          this.car.user = {};
        }
        
        this.currentImage = this.carImages[0];
        this.isRented = await checkIfCarIsRented(carId);
        
        return this.car;
      } catch (error) {
        this.error = "Hubo un error al obtener los detalles del auto. Volvé a intentar";
        console.error("Error al obtener los detalles del auto:", error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    setCurrentImage(image) {
      this.currentImage = image;
    },
    
    resetState() {
      this.$reset();
    },
    
    updateCarCoordinates(coordinates) {
      if (coordinates && coordinates.lat && coordinates.lng) {
        this.car.coordenadas = {
          lat: coordinates.lat,
          lng: coordinates.lng
        };
      }
    },
    
    async checkRentalStatus() {
      if (this.car.id) {
        try {
          this.isRented = await checkIfCarIsRented(this.car.id);
          return this.isRented;
        } catch (error) {
          console.error("Error al verificar estado de alquiler:", error);
          return false;
        }
      }
      return false;
    },
    
    handleImageError(event) {
      event.target.src = this.defaultCarImage;
    }
  }
});