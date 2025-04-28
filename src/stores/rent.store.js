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
      { id: 1, name: 'Fechas' },
      { id: 2, name: 'Términos' },
      { id: 3, name: 'Pago' },
      { id: 4, name: 'Confirmación' }
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
    acceptTerms: false
  }),
  
  getters: {
    isNextDisabled() {
      if (this.currentStep === 1) {
        return !this.rentalData.rentedFromDate || !this.rentalData.rentedUntilDate || this.rented;
      } else if (this.currentStep === 3) {
        return !this.rentalData.selectedPaymentMethod || !this.paymentMethods.length;
      } else if (this.currentStep === 4) {
        return !this.acceptTerms || !this.rentalData.selectedPaymentMethod;
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
      } catch {
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
    }
  },
  
  actions: {
    setInitialData(car, loggedUser, rented = false) {
      this.car = car;
      this.loggedUser = loggedUser;
      this.rented = rented;
      this.loadSavedData();
    },
    
    loadSavedData() {
      const savedData = localStorage.getItem('rentalData');
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData);
          this.rentalData = {
            ...this.rentalData,
            ...parsedData
          };
        } catch (e) {
          console.error("Error al cargar datos guardados:", e);
        }
      }
    },
    
    saveCurrentData() {
      localStorage.setItem('rentalData', JSON.stringify(this.rentalData));
    },
    
    nextStep() {

      if (this.currentStep === 3 && !this.rentalData.selectedPaymentMethod) {
        addAlert('Por favor selecciona un método de pago', 'error');
        return;
      }

      if (this.currentStep < 4) {
        this.currentStep++;
        this.saveCurrentData();
      }
    },
    
    prevStep() {
      if (this.currentStep > 1) {
        this.currentStep--;
      }
    },
    
    goToStep(step) {
      if (step >= 1 && step <= 4) {
        this.currentStep = step;
      }
    },
    
    handleDateUpdate(data) {
      this.rentalData.rentedFromDate = data.rentedFromDate;
      this.rentalData.rentedUntilDate = data.rentedUntilDate;
      this.rentalData.selectedTime = data.rentedFromHour;
      this.rentalData.selectedUntilTime = data.rentedUntilHour;
      
      this.calculatePrice();
    },
    
    calculatePrice() {
      if (this.car && this.rentalData.rentedFromDate && this.rentalData.rentedUntilDate) {
        this.rentalData.currentTotalPrice = this.totalPrice;
      }
    },
    
    selectPaymentMethod(method) {
      this.rentalData.selectedPaymentMethod = method;
      this.showNewPaymentForm = false;
    },
    
    async fetchPaymentMethods() {
      if (!this.loggedUser || !this.loggedUser.id) {
        this.errorMessage = "Usuario no identificado";
        return;
      }
      
      this.loading = true;
      try {
        const methods = await getPaymentMethods(this.loggedUser.id);
        console.log("Métodos de pago obtenidos:", methods);
        this.paymentMethods = methods;
        
        // if (methods.length > 0 && !this.rentalData.selectedPaymentMethod && !this.initialPaymentMethodLoaded) {
        //   this.rentalData.selectedPaymentMethod = methods[0];
        //   this.initialPaymentMethodLoaded = true;
        // }
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        this.errorMessage = "Error al cargar métodos de pago";
      } finally {
        this.loading = false;
      }
    },

    toggleNewPaymentForm() {
      this.showNewPaymentForm = !this.showNewPaymentForm;
      if (this.showNewPaymentForm) {
        this.rentalData.selectedPaymentMethod = null;
      }
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
          return;
        }

        const newMethod = {
          type: this.selectedPaymentMethodType,
          ...paymentData,
          createdAt: new Date()
        };

        await savePaymentMethod(this.loggedUser.id, newMethod);
        await this.fetchPaymentMethods();
        
        this.rentalData.selectedPaymentMethod = this.paymentMethods.find(m => 
          m.type === this.selectedPaymentMethodType && 
          (m.walletId === paymentData.walletId || m.cardNumber === paymentData.cardNumber || m.email === paymentData.email)
        );
        
        this.showNewPaymentForm = false;
        this.newPaymentMethod = {
          digital_wallet: { type: 'digital_wallet', walletType: '', walletId: '' },
          credit_card: { type: 'credit_card', cardholder: '', cardNumber: '', expiryDate: '', cvv: '' },
          paypal: { type: 'paypal', email: '' }
        };
        
        addAlert('Método de pago guardado correctamente', 'success');
      } catch (error) {
        console.error('Error al guardar método de pago:', error);
        addAlert('Error al guardar el método de pago', 'error');
      } finally {
        this.loading = false;
      }
    },
    
    getPaymentMethodIdentifier(method) {
      if (!method) return null;
      
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
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      const minutes = Math.floor((hours % 1) * 60);

      let timeString = "";

      if (days > 0) {
        timeString += `${days} día${days > 1 ? 's' : ''} `;
      }

      if (remainingHours > 0) {
        timeString += `${remainingHours} hora${remainingHours > 1 ? 's' : ''} `;
      }

      if (minutes > 0) {
        timeString += `${minutes} minuto${minutes > 1 ? 's' : ''}`;
      }

      return timeString.trim() || "0 horas";
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
      return paymentMethod.type === 'credit_card' 
        ? `${names.credit_card} (**** ${paymentMethod.cardNumber.slice(-4)})` 
        : names[paymentMethod.walletType || paymentMethod.type];
    },
    
    getPaymentDetails(paymentMethod) {
      if (!paymentMethod) return '';
      if (paymentMethod.type === 'credit_card') {
        return `Titular: ${paymentMethod.cardholder} - Vence ${paymentMethod.expiryDate}`;
      }
      return paymentMethod.email || paymentMethod.walletId || '';
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
          return;
        }

        if (!this.rentalData.selectedPaymentMethod) {
          addAlert("Por favor selecciona un método de pago", "error");
          return;
        }

        if (await isCarAlreadyRented(this.car.id)) {
          addAlert("Este auto ya está alquilado", "info");
          return;
        }
        
        await submitRentalRequest(this.prepareRentalData());
        addAlert("¡Reserva completada con éxito!", "success");
        
        localStorage.removeItem('rentalData');
        
        return true;
      } catch (error) {
        console.error("Error:", error);
        addAlert("Error al procesar la reserva: " + (error.message || "Por favor intenta nuevamente"), "error");
        return false;
      }
    }
  }
});