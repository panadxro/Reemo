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
        return ['Mastercard', 'Mercado Pago', 'Visa', 'Uala', 'PayPal', 'Lemon', 'Modo'].includes(value);
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
  <Uala v-if="method === 'Uala'" />
  <Paypal v-else-if="method === 'PayPal'" />
  <MercadoPago v-else-if="method === 'Mercado Pago'" />
  <Lemon v-else-if="method === 'Lemon'" />
  <Modo v-else-if="method === 'Modo'" />
  <Visa v-else-if="method === 'Visa'" />
  <Mastercard v-else-if="method === 'Mastercard'" />
  <Payment v-else />
</template>

