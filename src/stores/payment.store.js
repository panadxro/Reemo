import { defineStore } from 'pinia';
import { savePaymentMethod, getPaymentMethods, removePaymentMethod as removePaymentMethodAPI, setDefaultPaymentMethod as setDefaultPaymentMethodAPI } from "@services/payment/payment.js";
import { addAlert } from "@/services/alerts";

export const usePaymentStore = defineStore('payment', {
  state: () => ({
    paymentMethods: [],
    newPaymentMethod: {
      type: '',                
      brand: '',               
      cardNumber: '',          
      cardHolder: '',          
      expiryDate: '',          
      cvv: '',
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
      const { type, brand, cardNumber, cardHolder, expiryDate, cvv } = this.newPaymentMethod;
      
      const commonValidations = [
        !!type && ['bank', 'digital_wallet'].includes(type), 
        !!brand && brand.trim() !== '',                      
        !!cardNumber && /^\d{16}$/.test(cardNumber.replace(/\s/g, '')), 
        !!cardHolder && cardHolder.trim().length >= 5,       // Nombre válido (min 5 chars)
        !!expiryDate && this.isExpiryDateValid(expiryDate), 
        !!cvv && /^\d{3,4}$/.test(cvv)                      
      ];

      return commonValidations.every(validation => validation === true);
    }
  },
  
  actions: {
    isExpiryDateValid(expiryDate) {
      if (!expiryDate) return false;
      
      try {
        const dateStr = String(expiryDate);
        
        const [part1, part2] = dateStr.includes('/') 
          ? dateStr.split('/') 
          : dateStr.split('-');
        
        let month, year;
        
        if (dateStr.includes('/')) {
          month = parseInt(part1, 10);
          year = 2000 + parseInt(part2, 10); 
        } else {
          year = parseInt(part1, 10);
          month = parseInt(part2, 10);
        }
        
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1; 
        
        if (year < currentYear || (year === currentYear && month < currentMonth)) {
          return false;
        }
        
        if (year > currentYear + 10) {
          return false;
        }
        
        return month >= 1 && month <= 12;
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
        this.paymentMethods = [];
        return [];
      }
      
      this.loading = true;
      try {
        const methods = await getPaymentMethods(userId);
        // console.log("Métodos de pago obtenidos:", methods);
        this.paymentMethods = Array.isArray(methods) ? methods : [];
        return this.paymentMethods;
      } catch (error) {
        console.error("Error al obtener métodos de pago:", error);
        this.errorMessage = "Error al cargar métodos de pago";
        this.paymentMethods = [];
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
        const currentBrand = this.newPaymentMethod.brand.trim().toLowerCase();
        const currentCardNumber = this.newPaymentMethod.cardNumber.replace(/\s/g, '');

        const duplicateMethod = this.paymentMethods.find(method => 
          method.brand.trim().toLowerCase() === currentBrand &&
          method.cardNumber.replace(/\s/g, '') === currentCardNumber
        );

        if (duplicateMethod) {
          addAlert(`Ya tienes un método ${duplicateMethod.brand} con esta tarjeta registrada`, 'error');
          return false;
        }

        if (!this.isFormValid) {
          addAlert('Por favor completa todos los campos correctamente', 'error');
          return false;
        }

        const newMethod = {
          type: this.newPaymentMethod.type,
          brand: this.newPaymentMethod.brand.trim(),
          cardNumber: currentCardNumber, 
          cardHolder: this.newPaymentMethod.cardHolder.trim(),
          expiryDate: this.newPaymentMethod.expiryDate,
          cvv: this.newPaymentMethod.cvv,
          createdAt: new Date(),
          // last4: currentCardNumber.slice(-4) 
        };

        await savePaymentMethod(userId, newMethod);
        await this.fetchPaymentMethods(userId);
        
        this.showNewPaymentForm = false;
        this.resetNewPaymentMethodForm();
        
        addAlert('Método de pago guardado correctamente', 'success');
        return true;
      } catch (error) {
        console.error('Error al guardar método de pago:', error);
        addAlert(error.message || 'Error al guardar el método de pago', 'error');
        return false;
      } finally {
        this.loading = false;
      }
    },
        
        resetNewPaymentMethodForm() {
          this.newPaymentMethod = {
              type: 'bank', 
              brand: '', 
              cardNumber: '', 
              cardHolder: '', 
              expiryDate: '', 
              cvv: '' 
          };
    },
    
    getPaymentMethodIdentifier(method) {
      if (!method) return null;
      
      if (typeof method === 'string') return method;
      
      return `${method.type}-${method.brand}-${method.cardNumber}`;
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