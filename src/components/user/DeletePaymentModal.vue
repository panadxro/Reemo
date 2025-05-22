 
  <script>
  import Heading from "@components/atoms/Heading.vue";

import MercadoPago from "@icons/MercadoPago.vue";
import Uala from "@icons/Uala.vue";
import PayPal from "@icons/PayPal.vue";
import CreditCard from "@icons/CreditCard.vue";
  
  export default {
    name: "Modal",
    components: { Heading, MercadoPago, Uala, PayPal, CreditCard },
    props: {
      isOpen: {
        type: Boolean,
        required: true
      },
      title: {
        type: String,
        default: "Confirmar acción"
      },
      paymentMethod: {
        type: Object,
        default: null
    },
      message: {
        type: String,
        default: "¿Estás seguro de realizar esta acción?"
      },
      confirmText: {
        type: String,
        default: "Confirmar"
      },
      cancelText: {
        type: String,
        default: "Cancelar"
      }
    },
    emits: ["close", "confirm"],
    setup(props, { emit }) {
      const onClose = () => {
        emit("close");
      };
      
      const onConfirm = () => {
        emit("confirm");
      };
      
      return {
        onClose,
        onConfirm
      };
    }
  }
  </script>

<template>
    <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center">

      <div class="absolute inset-0 bg-black/60" @click="onClose"></div>
      
      <div class="relative bg-primary-900 rounded-[40px] p-6 w-full max-w-md mx-4 z-10">
        <div class="flex flex-col">
          <div class="flex justify-between items-start mb-4">
            <Heading :type="5" class="text-white text-center">{{ title }}</Heading>
            <button 
              @click="onClose" 
              class="text-white hover:text-background-600 transition-colors hover:cursor-pointer"
            >
              ✕
            </button>
          </div>

          <div v-if="paymentMethod" class="mb-4 p-3 bg-white/10 rounded-lg">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 flex items-center justify-center p-1 rounded-xl bg-vibrant-light-600">
                <MercadoPago v-if="paymentMethod.walletType === 'mercadopago'"/>
                <CreditCard v-if="paymentMethod.type === 'credit_card'"/>
                <Uala v-if="paymentMethod.walletType === 'uala'"/>
                <PayPal v-if="paymentMethod.type === 'paypal'"/>
              </div>
              <div>
                <p class="font-medium text-white text-sm">
                  {{ paymentMethod.type === 'credit_card' ? 'Tarjeta terminada en ' + paymentMethod.cardNumber.slice(-4) : 
                     paymentMethod.type === 'paypal' ? 'PayPal' : 
                     paymentMethod.walletType === 'uala' ? 'Ualá' : 
                     paymentMethod.walletType === 'mercadopago' ? 'Mercado Pago' : 
                     paymentMethod.walletType === 'otra' ? 'Otra' : 
                     paymentMethod.walletType || 'Otro método' }}
                </p>
              </div>
            </div>
          </div>
          
          <div class="mb-6">
            <p class="text-background-800">{{ message }}</p>
          </div>
          
          <div class="flex gap-3 justify-center">
            <button 
              @click="onClose" 
              class="px-4 py-2 w-full text-white rounded-lg  hover:cursor-pointer"
            >
              {{ cancelText }}
            </button>
            <button 
              @click="onConfirm" 
              class="px-4 py-2 w-full bg-white text-primary-900 rounded-lg hover:bg-white/70 transition-colors hover:cursor-pointer"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  