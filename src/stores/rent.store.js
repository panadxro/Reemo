import { defineStore } from 'pinia';
import { isCarAlreadyRented, submitRentalRequest } from "@services/rentedCarService";
import { savePaymentMethod, getPaymentMethods } from "@services/payment/payment.js";
import { addAlert } from "@/services/alerts";

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
    paymentMethods: [],
    newPaymentMethod: {
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
    selectedPaymentMethodType: 'credit_card', 
    showNewPaymentForm: false,
    initialPaymentMethodLoaded: false,
    loading: false,
    errorMessage: "",
    acceptTerms: false,
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
    
    isFormValid() {
      const paymentData = this.newPaymentMethod[this.selectedPaymentMethodType];
      
      switch(this.selectedPaymentMethodType) {
        case 'credit_card':
          return paymentData.cardholder && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv;
        case 'digital_wallet':
          return paymentData.walletType && paymentData.walletId;
        case 'paypal':
          return paymentData.email;
        default:
          return false;
      }
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
      // if (!this.car || !this.car.id) {
      //   console.warn("No se puede guardar datos sin un ID de auto");
      //   return;
      // }
      
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
        // console.log("Datos guardados en localStorage:", dataToSave);
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
      // console.log("Actualizando fechas en el store:", data);
      
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
        // console.log("Precio calculado:", calculatedPrice);
        return calculatedPrice;
      }
      return 0;
    },
    
    selectPaymentMethod(method) {
      this.rentalData.selectedPaymentMethod = method;
      this.showNewPaymentForm = false;
      this.saveCurrentData(); // Guardar después de seleccionar método de pago
    },
    
    async fetchPaymentMethods() {
      console.log("Fetch a metodos de pago:", this.loggedUser);
      if (!this.loggedUser || !this.loggedUser.id) {
        console.error("Usuario no identificado");
        this.errorMessage = "Usuario no identificado";
        return [];
      }
      
      this.loading = true;
      try {
        const methods = await getPaymentMethods(this.loggedUser.id);
        console.log("Metodos de pago obtenidos:", methods);
        this.paymentMethods = methods;
        
        // Si hay métodos disponibles, seleccionar el primero (si no hay uno ya seleccionado)
        if (methods.length > 0 && !this.rentalData.selectedPaymentMethod) {
          this.rentalData.selectedPaymentMethod = methods[0];
          this.saveCurrentData(); // Guardar después de cargar método de pago
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

    toggleNewPaymentForm() {
      this.showNewPaymentForm = !this.showNewPaymentForm;
    },
    
    async saveNewPaymentMethod() {
      this.loading = true;
      try {
        const paymentData = this.newPaymentMethod[this.selectedPaymentMethodType];
        
        let isValid = false;
        switch(this.selectedPaymentMethodType) {
          case 'credit_card':
            isValid = paymentData.cardholder && paymentData.cardNumber && paymentData.expiryDate && paymentData.cvv;
            break;
          case 'digital_wallet':
            isValid = paymentData.walletType && paymentData.walletId;
            break;
          case 'paypal':
            isValid = paymentData.email;
            break;
        }

        if (!isValid) {
          addAlert('Por favor completa todos los campos del método de pago', 'error');
          return false;
        }

        const newMethod = {
          type: this.selectedPaymentMethodType,
          ...paymentData,
          createdAt: new Date()
        };

        await savePaymentMethod(this.loggedUser.id, newMethod);
        await this.fetchPaymentMethods();
        
        // Buscar el método recién creado en la lista actualizada
        const createdMethod = this.paymentMethods.find(m => 
          m.type === this.selectedPaymentMethodType && 
          ((m.walletId && m.walletId === paymentData.walletId) || 
           (m.cardNumber && m.cardNumber === paymentData.cardNumber) || 
           (m.email && m.email === paymentData.email))
        );
        
        if (createdMethod) {
          this.rentalData.selectedPaymentMethod = createdMethod;
          this.saveCurrentData(); // Guardar después de crear método de pago
        }
        
        this.showNewPaymentForm = false;
        this.resetNewPaymentMethodForm();
        
        addAlert('Método de pago guardado correctamente', 'success');
        return true;
      } catch (error) {
        console.error('Error al guardar método de pago:', error);
        addAlert('Error al guardar el método de pago', 'error');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    resetNewPaymentMethodForm() {
      // Resetear los formularios de método de pago
      this.newPaymentMethod = {
        digital_wallet: { type: 'digital_wallet', walletType: '', walletId: '' },
        credit_card: { type: 'credit_card', cardholder: '', cardNumber: '', expiryDate: '', cvv: '' },
        paypal: { type: 'paypal', email: '' }
      };
    },
    
    getPaymentMethodIdentifier(method) {
      if (!method) return null;
      
      // Si ya es un string (un ID guardado anteriormente), devolverlo directamente
      if (typeof method === 'string') return method;
      
      switch(method.type) {
        case 'credit_card':
          return `card-${method.cardNumber}`;
        case 'digital_wallet':
          return `wallet-${method.walletType}-${method.walletId}`;
        case 'paypal':
          return `paypal-${method.email}`;
        default:
          return null;
      }
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
    
    calculatePercentage(percentage) {
      return this.rentalData.currentTotalPrice * (percentage / 100);
    },
    
    getPaymentMethodName(paymentMethod) {
      if (!paymentMethod) return 'No especificado';
      
      const names = {
        credit_card: 'Tarjeta de crédito',
        paypal: 'PayPal',
        uala: 'Ualá',
        mercadopago: 'Mercado Pago'
      };
      
      if (paymentMethod.type === 'credit_card') {
        return `${names.credit_card} (**** ${paymentMethod.cardNumber?.slice(-4) || 'XXXX'})`;
      } else if (paymentMethod.type === 'digital_wallet') {
        return names[paymentMethod.walletType] || 'Billetera digital';
      } else {
        return names[paymentMethod.type] || 'Otro método';
      }
    },
    
    getPaymentDetails(paymentMethod) {
      if (!paymentMethod) return '';
      
      if (paymentMethod.type === 'credit_card') {
        return `Titular: ${paymentMethod.cardholder} - Vence ${paymentMethod.expiryDate}`;
      } else if (paymentMethod.type === 'paypal') {
        return paymentMethod.email || '';
      } else if (paymentMethod.type === 'digital_wallet') {
        return paymentMethod.walletId || '';
      }
      
      return '';
    },
    
    prepareRentalData() {
      return {
        car_id: this.car.id,
        owner_id: this.car.user_id,
        user_id: this.loggedUser.id,
        rented_from: `${this.rentalData.rentedFromDate}T${this.rentalData.selectedTime}:00`,
        rented_until: `${this.rentalData.rentedUntilDate}T${this.rentalData.selectedUntilTime}:00`,
        status: "pendiente",
        rental_price: this.rentalData.currentTotalPrice,
        payment_method: this.getPaymentMethodName(this.rentalData.selectedPaymentMethod)
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