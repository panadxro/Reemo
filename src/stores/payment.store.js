import { defineStore } from 'pinia';
import { savePaymentMethod, getPaymentMethods, removePaymentMethod as removePaymentMethodAPI, setDefaultPaymentMethod as setDefaultPaymentMethodAPI } from "@services/payment/payment.js";
import { addAlert } from "@/services/alerts";

export const usePaymentStore = defineStore('payment', {
  state: () => ({
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
    loading: false,
    errorMessage: "",
    showDeleteModal: false,
    paymentToDeleteIndex: null,
  }),
  
  getters: {
    isFormValid() {
      const paymentData = this.newPaymentMethod[this.selectedPaymentMethodType];
      
      switch(this.selectedPaymentMethodType) {
        case 'credit_card':
          const cardNumberValid = paymentData.cardNumber && 
                                /^\d{16}$/.test(paymentData.cardNumber.replace(/\s/g, '')); // Solo números, 16 dígitos
          
          const cardholderValid = paymentData.cardholder && 
                                paymentData.cardholder.trim().length >= 5 && 
                                /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(paymentData.cardholder) && 
                                paymentData.cardholder.trim().split(/\s+/).length >= 2; 
          
          const expiryDateValid = paymentData.expiryDate && 
                                this.isExpiryDateValid(paymentData.expiryDate);
          
          const cvvValid = paymentData.cvv && 
                          /^\d{3,4}$/.test(paymentData.cvv); // 3 o 4 dígitos numéricos
          
          return cardholderValid && cardNumberValid && expiryDateValid && cvvValid;
        
        case 'digital_wallet':
          const walletTypeValid = paymentData.walletType && ['mercadopago', 'uala', 'otra'].includes(paymentData.walletType);
          const walletIdValid = paymentData.walletId && paymentData.walletId.trim().length >= 3;
          return walletTypeValid && walletIdValid;
        
        case 'paypal':
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return paymentData.email && emailRegex.test(paymentData.email);
        
        default:
          return false;
      }
    }
  },
  
  actions: {
    isExpiryDateValid(expiryDate) {
      if (!expiryDate) return false;
      
      try {
        const dateStr = String(expiryDate);
        
        const [year, month] = dateStr.split('-').map(Number);
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; 
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          return false;
        }
        
        if (year > currentYear + 10) {
          return false;
        }
        
        return true;
      } catch (e) {
        console.error("Error validando fecha de expiración:", e);
        return false;
      }
    },
    
    toggleNewPaymentForm() {
      this.showNewPaymentForm = !this.showNewPaymentForm;
    },
    
    async fetchPaymentMethods(userId) {
      if (!userId) {
        console.error("Usuario no identificado");
        this.errorMessage = "Usuario no identificado";
        return [];
      }
      
      this.loading = true;
      try {
        const methods = await getPaymentMethods(userId);
        console.log("Metodos de pago obtenidos:", methods);
        this.paymentMethods = methods;
        return methods;
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        this.errorMessage = "Error al cargar métodos de pago";
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async saveNewPaymentMethod(userId) {
      if (!userId) {
        addAlert('Usuario no identificado', 'error');
        return false;
      }
      
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
            
            if (isValid) {
              const existingWalletSameType = this.paymentMethods.find(
                method => method.type === 'digital_wallet' && method.walletType === paymentData.walletType
              );
              
              if (existingWalletSameType) {
                addAlert(`Ya tenés este tipo de billetera virtual registrada`, 'error');
                return false;
              }
            }
            break;
          case 'paypal':
            isValid = paymentData.email;
            
            // Verificar si ya existe una cuenta de PayPal
            if (isValid) {
              const existingPaypal = this.paymentMethods.find(method => method.type === 'paypal');
              
              if (existingPaypal) {
                addAlert('Ya tenés una cuenta de PayPal registrada', 'error');
                return false;
              }
            }
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
    
        await savePaymentMethod(userId, newMethod);
        await this.fetchPaymentMethods(userId);
        
        // Buscar el método recién creado en la lista actualizada
        const createdMethod = this.paymentMethods.find(m => 
          m.type === this.selectedPaymentMethodType && 
          ((m.walletId && m.walletId === paymentData.walletId) || 
           (m.cardNumber && m.cardNumber === paymentData.cardNumber) || 
           (m.email && m.email === paymentData.email))
        );
        
        this.showNewPaymentForm = false;
        this.resetNewPaymentMethodForm();
        
        addAlert('Método de pago guardado correctamente', 'success');
        return createdMethod;
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
    
    getPaymentMethodName(method) {
      if (!method) return 'No especificado';
      
      const names = {
        credit_card: 'Tarjeta de crédito',
        paypal: 'PayPal',
        uala: 'Ualá',
        mercadopago: 'Mercado Pago'
      };
      
      if (method.type === 'credit_card') {
        return `${names.credit_card} (**** ${method.cardNumber?.slice(-4) || 'XXXX'})`;
      } else if (method.type === 'digital_wallet') {
        return names[method.walletType] || 'Billetera digital';
      } else {
        return names[method.type] || 'Otro método';
      }
    },
    
    getPaymentDetails(method) {
      if (!method) return '';
      
      if (method.type === 'credit_card') {
        return `Titular: ${method.cardholder} - Vence ${method.expiryDate}`;
      } else if (method.type === 'paypal') {
        return method.email || '';
      } else if (method.type === 'digital_wallet') {
        return method.walletId || '';
      }
      
      return '';
    },
    
    confirmDeletePaymentMethod(index) {
      this.showDeleteModal = true;
      this.paymentToDeleteIndex = index;
    },
    
    cancelDeletePaymentMethod() {
      this.showDeleteModal = false;
      this.paymentToDeleteIndex = null;
    },
    
    async removePaymentMethod(userId, index) {
      if (!userId) {
        addAlert('Usuario no identificado', 'error');
        return false;
      }
      
      this.loading = true;
      try {
        const updatedMethods = await removePaymentMethodAPI(userId, index);
        this.paymentMethods = updatedMethods;
        this.showDeleteModal = false;
        this.paymentToDeleteIndex = null;
        addAlert('Método de pago eliminado correctamente', 'success');
        return true;
      } catch (error) {
        console.error('Error al eliminar método de pago:', error);
        addAlert('Error al eliminar el método de pago', 'error');
        return false;
      } finally {
        this.loading = false;
      }
    },
    
    async setDefaultPaymentMethod(userId, index) {
      if (!userId) {
        addAlert('Usuario no identificado', 'error');
        return false;
      }
      
      this.loading = true;
      try {
        const updatedMethods = await setDefaultPaymentMethodAPI(userId, index);
        this.paymentMethods = updatedMethods;
        addAlert('Método de pago predeterminado actualizado', 'success');
        return true;
      } catch (error) {
        console.error('Error al establecer método predeterminado:', error);
        addAlert('Error al actualizar método predeterminado', 'error');
        return false;
      } finally {
        this.loading = false;
      }
    }
  }
});