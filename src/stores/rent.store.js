import { defineStore } from 'pinia';
import { isCarAlreadyRented, submitRentalRequest, fetchUserRentalHistory, fetchUserRentedOutHistory , fetchRentDetail } from "@services/rentedCarService";
import { addAlert } from "@/services/alerts";
import { usePaymentStore } from "@/stores/payment.store.js";


export const useRentStore = defineStore('rent', {
  state: () => ({
    currentStep: 1,
    car: null,
    loggedUser: null,
    rented: false,
    sections: [
      { id: 1, title: 'Selecciona fecha de alquiler' },
      { id: 2, title: 'Información' },
      { id: 3, title: 'Método de pago' },
      { id: 4, title: 'Confirma tu reserva' }
    ],
    rentalData: {
      rentedFromDate: "",
      rentedUntilDate: "",
      selectedTime: "",
      selectedUntilTime: "",
      currentTotalPrice: 0,
      selectedPaymentMethod: null
    },
    userRents: [],
    rent: null,
    acceptTerms: false,
    loading: false,
    errorMessage: "",
    isStoreInitialized: false,
    currentRentalId: null,
  }),
  
  getters: {
    isNextDisabled() {
      if (this.currentStep === 1) {
        return !this.rentalData.rentedFromDate || !this.rentalData.rentedUntilDate || this.rented;
      } else if (this.currentStep === 3) {
        return !this.rentalData.selectedPaymentMethod;
      } else if (this.currentStep === 4) {
        return !this.rentalData.selectedPaymentMethod;
      }
      return false;
    },

    rentedByMe() {
    return this.userRents.filter(rent => rent.rentType === 'rented_by_me');
  },
  
  rentedToOthers() {
    return this.userRents.filter(rent => rent.rentType === 'rented_to_others');
  },
  
  allRentsSorted() {
    return this.userRents.sort((a, b) => 
      new Date(b.start_time) - new Date(a.start_time)
    )},
    
    paymentMethod() {
      return this.rentalData.selectedPaymentMethod;
    },
    
    priceHours() {
      return this.car ? this.car.pricing.rates.daily / 24 : 0;
    },
    
    rentalHours() {
      if (!this.rentalData.rentedFromDate || !this.rentalData.rentedUntilDate) return 0;

      try {
        const start = new Date(`${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime || '00:00'}`);
        const end = new Date(`${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime || '00:00'}`);
        return Math.max(0, (end - start) / (1000 * 60 * 60));
      } catch (e) {
        console.error("Error calculando horas de alquiler:", e);
        return 0;
      }
    },
    
    basePrice() {
      return this.priceHours * this.rentalHours;
    },
    
    taxes() {
      return this.basePrice * 0.15;
    },
    
    insurance() {
      return 25000;
    },
    
    totalPrice() {
      return this.basePrice + this.taxes + this.insurance;
    },
    
    // Genera una clave única para este vehículo
    storageKey() {
      if (!this.car || !this.car.id) return 'rentalData';
      return `rentalData_car_${this.car.id}`;
    }
  },
  
  actions: {
    setInitialData(car, loggedUser, isCarRented = false) {
      if (!car) {
        console.error("Auto no válido:", car);
        throw new Error("Se requiere un auto válido con ID");
      }

      if (!loggedUser || typeof loggedUser !== 'string') {
        console.error("Usuario no válido:", loggedUser);
        throw new Error("Se requiere un usuario válido con ID");
      }
      
      // Si estamos cambiando de auto, reseteamos los datos
      const isChangingCar = this.car && car && this.car.id !== car.id;


      this.car = car;
      this.loggedUser = loggedUser;
      this.rented = isCarRented;
      console.log('[setInitialData] contenido de this.rented 😊😊😊', this.rented)
      
      // Solo reseteamos datos si cambiamos de auto
      if (isChangingCar) {
        console.log(`Cambiando de auto ${this.car.id} a ${car.id}, reseteando datos`);
        this.resetRentalData();
        localStorage.removeItem(this.storageKey);
        this.currentStep = 1;
      } else {
        // Si es el mismo auto o primera carga, intentamos cargar datos guardados
        this.loadSavedData();
      }
      
      // Calculamos el precio después de cargar los datos guardados
      this.calculatePrice();
      this.isStoreInitialized = true;
      
      console.log("Store inicializado con datos:", {
        carId: this.car?.id,
        userId: this.loggedUser,
        fechas: {
          desde: this.rentalData.rentedFromDate,
          hasta: this.rentalData.rentedUntilDate
        },
        precio: this.rentalData.currentTotalPrice,
        paso: this.currentStep
      });
    },
      
    resetRentalData() {
      this.rentalData = {
        rentedFromDate: "",
        rentedUntilDate: "",
        selectedTime: "",
        selectedUntilTime: "",
        currentTotalPrice: 0,
        selectedPaymentMethod: null
      };
      this.acceptTerms = false;
      this.currentStep = 1;
      
      if (this.car && this.car.id) {
        localStorage.removeItem(this.storageKey);
      }
    },
      
    // Guardar datos de la reserva actual en localStorage
    saveCurrentData() {
      const dataToSave = {
        currentStep: this.currentStep,
        rentalData: {
          ...this.rentalData,
          // Asegurarnos de que el precio se guarde correctamente
          currentTotalPrice: this.totalPrice
        },
        acceptTerms: this.acceptTerms
      };
      
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(dataToSave));
      } catch (error) {
        console.error("Error al guardar datos en localStorage:", error);
      }
    },
    
    // Cargar datos guardados desde localStorage
    loadSavedData() {
      if (!this.car || !this.car.id) {
        console.log("No se puede cargar datos sin un ID de auto");
        return;
      }
      
      try {
        const savedData = localStorage.getItem(this.storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          
          // Restaurar datos
          if (parsedData.rentalData) {
            // Asegurarse de que todos los campos necesarios existan
            const completeRentalData = {
              ...this.rentalData,
              ...parsedData.rentalData
            };
            
            this.rentalData = completeRentalData;
          }
          
          if (typeof parsedData.currentStep === 'number') {
            this.currentStep = parsedData.currentStep;
          }
          
          if (typeof parsedData.acceptTerms === 'boolean') {
            this.acceptTerms = parsedData.acceptTerms;
          }
          
          console.log("Datos cargados desde localStorage:", parsedData);
          
          // Calculamos el precio después de cargar datos
          this.calculatePrice();
        } else {
          console.log("No hay datos guardados para este auto");
        }
      } catch (error) {
        console.error("Error al cargar datos desde localStorage:", error);
      }
    },
    
    nextStep() {
      if (this.currentStep === 3 && !this.rentalData.selectedPaymentMethod) {
        addAlert('Por favor selecciona un método de pago', 'error');
        return;
      }

      if (this.currentStep < 4) {
        this.currentStep++;
        this.calculatePrice(); // Recalcular precio al avanzar
        this.saveCurrentData(); // Guardar después de cambiar el paso
      }
    },
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
        this.saveCurrentData(); // Guardar después de cambiar el paso
      }
    },
    
    goToStep(step) {
      if (step >= 1 && step <= 4) {
        this.currentStep = step;
        this.calculatePrice(); // Recalcular precio al cambiar de paso
        this.saveCurrentData(); // Guardar después de cambiar el paso
      }
    },
    
    handleDateUpdate(data) {
      this.rentalData.rentedFromDate = data.rentedFromDate || this.rentalData.rentedFromDate;
      this.rentalData.rentedUntilDate = data.rentedUntilDate || this.rentalData.rentedUntilDate;
      this.rentalData.selectedTime = data.rentedFromHour || this.rentalData.selectedTime;
      this.rentalData.selectedUntilTime = data.rentedUntilHour || this.rentalData.selectedUntilTime;
      
      this.calculatePrice();
      this.saveCurrentData(); // Guardar después de actualizar fechas
    },
    
    calculatePrice() {
      if (this.car && this.rentalData.rentedFromDate && this.rentalData.rentedUntilDate) {
        const calculatedPrice = this.totalPrice;
        this.rentalData.currentTotalPrice = calculatedPrice;
        return calculatedPrice;
      }
      return 0;
    },
    
    selectPaymentMethod(method) {
      if (!method) {
        console.error("Intento de seleccionar método de pago nulo");
        return;
      }
      
      const paymentStore = usePaymentStore();
      // Verificar que el método exista en la lista
      const isValid = paymentStore.paymentMethods.some(
        m => paymentStore.getPaymentMethodIdentifier(m) === 
            paymentStore.getPaymentMethodIdentifier(method)
      );
      
      if (isValid) {
        this.rentalData.selectedPaymentMethod = method;
        paymentStore.showNewPaymentForm = false;
        this.saveCurrentData();
      } else {
        console.error("Intento de seleccionar método de pago no válido:", method);
      }
    },
    
    async fetchPaymentMethods() {
      if (!this.loggedUser) {
        console.error("Usuario no identificado");
        return [];
      }
      
      this.loading = true;
      try {
        const paymentStore = usePaymentStore();
        await paymentStore.fetchPaymentMethods(this.loggedUser);
        
        if (paymentStore.paymentMethods.length > 0 && !this.rentalData.selectedPaymentMethod) {
          this.selectPaymentMethod(paymentStore.paymentMethods[0]);
        }
        
        return paymentStore.paymentMethods;
      } finally {
        this.loading = false;
      }
    },
    
    async saveNewPaymentMethod() {
      const paymentStore = usePaymentStore();
      const newMethod = await paymentStore.saveNewPaymentMethod(this.loggedUser);
      
      if (newMethod) {
        this.rentalData.selectedPaymentMethod = newMethod;
        this.saveCurrentData();
      }
      
      return !!newMethod;
    },
    
    calculatePercentage(percentage) {
      return this.rentalData.currentTotalPrice * (percentage / 100);
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const [year, month, day] = dateString.split('-');
      return `${day}/${month}/${year}`;
    },
    
    formatPrice(price) {
      return Math.round(price).toLocaleString('es-AR', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      });
    },
    
    formatRentalTime(hours) {
      if (!hours) return '';
      
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      const minutes = Math.round((hours % 1) * 60);

      let timeString = "";

      if (days > 0) {
        timeString += `${days} día${days > 1 ? 's' : ''} `;
      }

      if (remainingHours > 0 || minutes > 0) {
        if (minutes === 30) {
          timeString += `${remainingHours}:30 hs`;
        } else if (minutes > 0) {
          timeString += `${remainingHours} hs ${minutes} min`;
        } else {
          timeString += `${remainingHours} hs`;
        }
      }

      return timeString.trim();
    },
    
    prepareRentalData() {
      const paymentStore = usePaymentStore();
      return {
        vehicle_id: this.car.id,
        owner_id: this.car.ownerId,
        driver_id: this.loggedUser,
        start_location: null,
        end_location: null,
        start_time: `${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime}:00`,
        end_time: `${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime}:00`,
        status: "pending",
        total_price: this.rentalData.currentTotalPrice,
        payments: {
          transaction_id: Math.random() * (999999999 - 111111111) + 11111,
          amount: this.rentalData.currentTotalPrice,
          payment_method: this.rentalData.selectedPaymentMethod?.brand || this.rentalData.selectedPaymentMethod.type || 'desconocido',
          status: 'completed',
          timestamp: new Date().toISOString()
        },
      };
    },
    
    async submitRental() {
      try {
        if (!this.acceptTerms) {
          addAlert("Debés aceptar los términos y condiciones", "error");
          return false;
        }

        if (!this.rentalData.selectedPaymentMethod) {
          addAlert("Por favor selecciona un método de pago", "error");
          return false;
        }

        const paymentStore = usePaymentStore();
        const isValidMethod = paymentStore.paymentMethods.some(
          method => paymentStore.getPaymentMethodIdentifier(method) === 
                  paymentStore.getPaymentMethodIdentifier(this.rentalData.selectedPaymentMethod)
        );
        
        if (!isValidMethod) {
          addAlert("El método de pago seleccionado no es válido", "error");
          return false;
        }

        if (await isCarAlreadyRented(this.car.id)) {
          addAlert("Este auto ya está alquilado", "info");
          return false;
        }
        
        const rentalId = await submitRentalRequest(this.prepareRentalData());
        addAlert("¡Reserva completada con éxito!", "success");
        this.currentStep = 0;
        
        // Limpiar solo los datos de este vehículo específico
        if(rentalId){
          addAlert("¡Reserva completada con éxito!", "success");
          localStorage.removeItem(this.storageKey);
          return rentalId;
        } else {
          addAlert("Error al procesar la reserva", "error");
          return false;
        }


        // const newRentId = await submitRentalRequest(this.prepareRentalData());
        
        // if(newRentId){
        //   // si se guarda bien crea la notificacion
        //   await createRentalRequestNotification(
        //     newRentId,
        //     this.loggedUser, // sender id
        //     this.car.user_id, // receiver id
        //   )
        //   addAlert("¡Reserva completada con éxito!", "success");
        //   localStorage.removeItem(this.storageKey);
        //   return true;
        // }else {
        //   addAlert("Error al procesar la reserva", "error")
        //   return false;
        // }
        

      } catch (error) {
        console.error("Error:", error);
        addAlert("Error al procesar la reserva: " + (error.message || "Por favor intenta nuevamente"), "error");
        return false;
      }
    },

    clearAllRentalData() {
      // Buscar todas las claves que comienzan con 'rentalData_car_'
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('rentalData_car_')) {
          localStorage.removeItem(key);
        }
      });
      
      localStorage.removeItem('rentalData');
      
      this.resetRentalData();
    },

    
    // Actualizar términos y condiciones
    updateTermsAcceptance(accepted) {
      this.acceptTerms = accepted;
      this.saveCurrentData(); // Guardar después de actualizar aceptación de términos
    },
    
    resetStore() {
      // Método para resetear completamente el store y eliminar datos guardados
      if (this.car && this.car.id) {
        localStorage.removeItem(this.storageKey);
      }
      this.$reset();
    },
    // Obtener rentas del usuario
   async loadUserRents(userId) {
      try {
        this.loading = true;
        
        // Cargar ambos tipos de rentas en paralelo
        const [rentedByMe, rentedToMe] = await Promise.all([
          fetchUserRentalHistory(userId),     
          fetchUserRentedOutHistory(userId)   
        ]);
        
        const combinedRents = [
          ...(rentedByMe || []).map(rent => ({ ...rent, rentType: 'rented_by_me' })),
          ...(rentedToMe || []).map(rent => ({ ...rent, rentType: 'rented_to_others' }))
        ];
        
        this.userRents = combinedRents.sort((a, b) => 
          new Date(b.start_time) - new Date(a.start_time)
        );
        
        console.log('Todas las rentas cargadas:', {
          total: this.userRents.length,
          rentedByMe: rentedByMe?.length || 0,
          rentedToOthers: rentedToMe?.length || 0
        });
        
      } catch (error) {
        console.error('Error cargando rentas:', error);
        this.error = error;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async loadRent(rentId) {
  try {
    this.loading = true;
    
    const rentDetail = this.userRents.find(rent => rent.id === rentId);
    
    if (rentDetail) {
      this.rent = rentDetail;
    } else {
      // Si no está en userRents, obtener desde el servicio
      const fetchedRentDetail = await fetchRentDetail(rentId);
      if (fetchedRentDetail) {
        this.rent = fetchedRentDetail;
        // Opcionalmente, agregar al cache local
        this.userRents.push(fetchedRentDetail);
      } else {
        throw new Error('Renta no encontrada');
      }
    }
    
  } catch (error) {
    console.error('Error cargando detalle de renta:', error);
    this.rent = null;
    throw error;
  } finally {
    this.loading = false;
  }
},
    
    // Limpiar el detalle de la renta
    clearRentDetail() {
      this.rent = null;
    }
  }
});