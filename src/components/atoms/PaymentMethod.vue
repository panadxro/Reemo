<script>
import Mastercard from '@/icons/Mastercard.vue';
import Visa from '@/icons/Visa.vue';
import Uala from '@/icons/Uala.vue';
import Paypal from '@/icons/Paypal.vue';
import MercadoPago from '@/icons/MercadoPago.vue';
import Lemon from '@/icons/Lemon.vue';
import Modo from '@/icons/Modo.vue';
import Payment from '@/icons/Payment.vue';

export default {
  name: "PaymentMethod",
  props: {
    method: {
      type: String,
      required: true,
      validator: (value) => {
        return ['mastercard', 'mercado-pago', 'visa', 'uala', 'paypal', 'lemon', 'modo'].includes(value);
      }
    }
  },
  components: {
    Mastercard,
    Visa,
    Uala,
    Paypal,
    MercadoPago,
    Lemon,
    Modo,
    Payment
  }
};
</script>

<template>
  <Uala v-if="method === 'uala'" />
  <Paypal v-else-if="method === 'paypal'" />
  <MercadoPago v-else-if="method === 'mercado-pago'" />
  <Lemon v-else-if="method === 'lemon'" />
  <Modo v-else-if="method === 'modo'" />
  <Visa v-else-if="method === 'visa'" />
  <Mastercard v-else-if="method === 'mastercard'" />
  <Payment v-else />
</template>
