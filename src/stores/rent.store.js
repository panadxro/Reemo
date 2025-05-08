import { defineStore } from 'pinia';
import { isCarAlreadyRented, submitRentalRequest } from "@services/rentedCarService";
import { addAlert } from "@/services/alerts";
import { usePaymentStore } from "@/stores/payment.store.js";

export const useRentalStore = defineStore('rental', {
  state: () => ({
    currentStep: 1,
    car: null,
    loggedUser: null,
    rented: false,
    sections: [
      { id: 1, title: 'Selecciona las fechas' },
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
    acceptTerms: false,
    loading: false,
    errorMessage: "",
    isStoreInitialized: false
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
    
    paymentMethod() {
      return this.rentalData.selectedPaymentMethod;
    },
    
    priceHours() {
      return this.car ? this.car.precio / 24 : 0;
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
      return this.basePrice * 0.21;
    },
    
    insurance() {
      return 25000;
    },
    
    totalPrice() {
      return this.basePrice + this.taxes + this.insurance;
    },
    
    // Generar una clave única para este vehículo
    storageKey() {
      if (!this.car || !this.car.id) return 'rentalData';
      return `rentalData_car_${this.car.id}`;
    }
  },
  
  actions: {
    setInitialData(car, loggedUser, isCarRented = false) {
      if (!loggedUser || !loggedUser.id) {
        console.error("Usuario no válido proporcionado:", loggedUser);
        throw new Error("Se requiere un usuario válido");
      }
      
      // Si estamos cambiando de auto, reseteamos los datos
      const isChangingCar = this.car && car && this.car.id !== car.id;
      
      this.car = car;
      this.loggedUser = loggedUser;
      this.rented = isCarRented;
      
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
        userId: this.loggedUser?.id,
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
        console.warn("No se puede cargar datos sin un ID de auto");
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
      this.rentalData.selectedPaymentMethod = method;
      const paymentStore = usePaymentStore();
      paymentStore.showNewPaymentForm = false;
      this.saveCurrentData(); // Guardar después de seleccionar método de pago
    },
    
    async fetchPaymentMethods() {
      if (!this.loggedUser || !this.loggedUser.id) {
        console.error("Usuario no identificado");
        this.errorMessage = "Usuario no identificado";
        return [];
      }
      
      this.loading = true;
      try {
        const paymentStore = usePaymentStore();
        const methods = await paymentStore.fetchPaymentMethods(this.loggedUser.id);
        
        // Si hay métodos disponibles, seleccionar el primero (si no hay uno ya seleccionado)
        if (methods.length > 0 && !this.rentalData.selectedPaymentMethod) {
          this.rentalData.selectedPaymentMethod = methods[0];
          this.saveCurrentData();
        }
        
        return methods;
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        this.errorMessage = "Error al cargar métodos de pago";
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async saveNewPaymentMethod() {
      const paymentStore = usePaymentStore();
      const newMethod = await paymentStore.saveNewPaymentMethod(this.loggedUser.id);
      
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
        car_id: this.car.id,
        owner_id: this.car.user_id,
        user_id: this.loggedUser.id,
        rented_from: `${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime}:00`,
        rented_until: `${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime}:00`,
        status: "pendiente",
        rental_price: this.rentalData.currentTotalPrice,
        payment_method: paymentStore.getPaymentMethodName(this.rentalData.selectedPaymentMethod)
      };
    },
    
    async submitRental() {
      try {
        if (!this.acceptTerms) {
          addAlert("Debes aceptar los términos y condiciones", "error");
          return false;
        }

        if (!this.rentalData.selectedPaymentMethod) {
          addAlert("Por favor selecciona un método de pago", "error");
          return false;
        }

        // Verificamos el precio final antes de enviar
        this.calculatePrice();

        if (await isCarAlreadyRented(this.car.id)) {
          addAlert("Este auto ya está alquilado", "info");
          return false;
        }
        
        await submitRentalRequest(this.prepareRentalData());
        addAlert("¡Reserva completada con éxito!", "success");
        
        // Limpiar datos y localStorage
        this.resetRentalData();
        localStorage.removeItem(this.storageKey);
        
        return true;
      } catch (error) {
        console.error("Error:", error);
        addAlert("Error al procesar la reserva: " + (error.message || "Por favor intenta nuevamente"), "error");
        return false;
      }
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
    }
  }
});