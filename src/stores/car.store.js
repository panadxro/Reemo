import { defineStore } from "pinia";
import { saveCarData, createCarData, getCarById, getAvailableCars, getUserCars, updateCarValidation } from "../services/car";
import { uploadVehiclePhoto } from '../services/storage/documents'
import { useAuthStore } from '@stores';

export const useCarStore = defineStore("car", {
  state: () => ({
    currentCar: {
      basicInfo: {
        brand: '',
        model: '',
        year: '',
        type: '',
        color: '',
        licensePlate: '',
        kilometers: null
      },
      specifications: {
        engine: '',
        transmission: '',
        fuelType: '',
        drivetrain: '',
        autonomy: null,
        doors: null,
        seats: null
      },
      status: {
        current: 'available',
        description: null,
        currentLocation: {
          address: '',
          city: '',
          country: '',
          location: null,
        },
        timesRented: null
      },
      features: {
        interior: [],
        exterior: [],
        safety: [],
        additional: [],
        accessories: [],
        restrictions: {
          minimumDriverAge: null,
          requiresValidLicense: false,
          smokingAllowed: false,
          petsAllowed: true
        },
        hasInsurance: true,
        insuranceDetails: "",
      },
      pricing: {
        rates: {
          daily: null,
          weekly: null,
          monthly: null
        },
        mileagePolicy: {
          includedPerDay: null,
          extraPricePerKm: null
        },
        securityDeposit: null,
      },
      photos: {
        photo1: null,
        photo2: null,
        photo3: null,
        photo4: null
      },
      availability: {
        schedule: {
          monday: false,
          tuesday: false,
          wednesday: false,
          thursday: false,
          friday: false,
          saturday: false,
          sunday: false
        },
        hours: {
          startTime: '08:00',
          endTime: '17:00',
        },
        blockedDates: [],
        nextAvailableDate: ''
      },
      insurance: {
        number: null,
        company: null,
        type: null,
        expirationDate: null,
      },
      id: null,
    },
    allAccessoryOptions: [
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
    ],
    loading: false,
    error: null,
    availableCars: [],
    userCars: []
  }),

  actions: {
    async initializeCar() {
      try {
        this.loading = true;
        this.currentCar.id = createCarData();
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async saveCar(carData) {
      try {
        this.loading = true;
        // Asegurarnos que tenemos un ID
        if (!carData.id) {
          throw new Error("Car ID is missing");
        }

        // Añadir ownerId si no está presente
        if (!carData.ownerId) {
          carData.ownerId = useAuthStore().user.id;
        }
        const carId = await saveCarData(carData);
        this.currentCar = { ...carData, id: carId };
        return carId;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateCar(carId, carData) {
      this.loading = true;
      try {
        await saveCarData(carId, carData);
        this.currentCar = { ...this.currentCar, ...carData };
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // No uso updateCar porque no es para actualizar todo el aut, sino solo la disponibilidad
    async changeCarAvailability(carId, newStatus, ownerId) {
      try {
        const response = await updateCarValidation(carId, newStatus);
        if(response.success) {
          // Actualizar el auto específico en userCars
          this.userCars = this.userCars.map(car => {
            if (car.id === carId) {
              return {
                ...car,
                status: {
                  ...car.status,
                  current: newStatus
                }
              };
            }
            return car;
          });
          
          // Si el auto actual es el que estamos modificando, actualízalo también
          if (this.currentCar.id === carId) {
            this.currentCar = {
              ...this.currentCar,
              status: {
                ...this.currentCar.status,
                current: newStatus
              }
            };
          }

          await this.loadUserCars(ownerId)
          return true;
        } else {
          this.error = response.message || 'Error updating car availabilitation'
        }
      } catch (error) {
        console.error("Error al actualizar la disponibilidad:", error);
        throw error;
      }
    },

    async loadCarById(carId) {
      try {
        this.loading = true;
        const carData = await getCarById(carId);
        if (carData) {
          this.currentCar = carData;
        }
        return carData;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async loadUserCars(userId) {
      try {
        this.loading = true;
        const cars = await getUserCars(userId);
        if (cars) {
          this.userCars = cars;
        }
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    async uploadCarPhoto(userId, file, carId, photoIndex) {
      try {
        // 1. Validar que photos sea un array
        if (!Array.isArray(this.currentCar.photos)) {
          this.currentCar.photos = [];
        }

        const filePath = `users/${userId}/cars/${carId}/photo_${photoIndex}`;
        const photoUrl = await uploadVehiclePhoto(file, filePath);
        
        // 2. Actualizar el array de fotos de forma segura
        this.currentCar.photos = [...this.currentCar.photos]; // Crear nuevo array
        this.currentCar.photos[photoIndex] = photoUrl;
        
        return photoUrl;
      } catch (error) {
        console.error(`Error subiendo foto ${photoIndex}:`, error);
        throw error;
      }
    },
    async loadAvailableCars(userId) {
      try {
        this.loading = true;
        const cars = await getAvailableCars(userId);
        this.availableCars = cars;
      } catch (error) {
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    updateFeatures(featuresData) {
      this.currentCar.features = {
        ...this.currentCar.features,
        ...featuresData
      };
    },

    updateCarCurrentLocation(locationData){
      if(this.currentCar && this.currentCar.status && this.currentCar.status.currentLocation ){
        this.currentCar.status.currentLocation.address = locationData.address;
        this.currentCar.status.currentLocation.location = locationData.location;
        // Podemos actualizar city/country si los extraemos del place object
      }
    },
  },

  getters: {
    car: (state) => state.currentCar,
    basicInfo: (state) => state.currentCar?.basicInfo || {},
    specifications: (state) => state.currentCar?.specifications || {},
    status: (state) => state.currentCar?.status || {},
    features: (state) => state.currentCar?.features || {},
    pricing: (state) => state.currentCar?.pricing || {},
    photos: (state) => state.currentCar?.photos || [],
    insurance: (state) => state.currentCar?.insurance || {},
    availability: (state) => state.currentCar?.availability || {},
    getUserCars: (state) => state.userCars,
  }
});