<script>
import { reactive } from "vue";
import { useAuthStore } from "@stores";
import { addAlert } from "../services/alerts";

import Heading from "../components/atoms/Heading.vue";
import Reemo from '@icons/Reemo.vue';
import Google from "../icons/Google.vue";
import FacebookIcon from "../icons/FacebookIcon.vue";
import Input from "../components/molecules/Input.vue";
import Mail from "@icons/Mail.vue";
import Password from "../icons/Password.vue";
import Checkbox from "../components/atoms/Checkbox.vue";

export default {
  name: "Login",
  components: { Heading, Reemo, Google, FacebookIcon, Input, Mail, Password, Checkbox },
  setup() {
    const authStore = useAuthStore();
    const user = reactive({
      email: "",
      password: "",
    });
    return { authStore, user };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.errorMsg = "";

      // Validaciones previas
      if (!this.user.email) {
        addAlert("Por favor, ingresa tu email.", "error");
        this.loading = false;
        return;
      } 
      if (!this.user.password) {
        addAlert("Por favor, ingresa tu contraseña.", "error");
        this.loading = false;
        return;
      }
      try{
        await this.authStore.loginUser(this.user)
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>

<template>
  <form
    action="#" @submit.prevent="handleSubmit" 
    class="flex flex-col min-w-lg px-16 py-12 bg-deep-blue-900 rounded-[40px] shadow-lg gap-9"
    >
    <Reemo color="#FFFFFF"/>
    <div class="flex flex-col gap-5">
      <Heading :type="1" class="font-extrabold! text-background-900! large">Inicia sesión</Heading>
      <p class="text-xs text-background-900 font-semibold">¡Bienvenido! Selecciona un método para ingresar a tu cuenta:</p>
    </div>

    <div class="flex flex-col gap-5">
      <div class="flex justify-between gap-10">
        <a href="/" class="flex items-center w-full justify-center gap-2 py-2.5 px-5 bg-background-900 font-semibold rounded-2xl"> <Google/> Google </a>
        <a href="/" class="flex items-center w-full justify-center gap-2 p-2 bg-background-900 font-semibold rounded-2xl"> <FacebookIcon/> Facebook </a>
      </div>
      <div class="flex items-center text-center text-background-900! gap-5 text-xs">
        <hr class="grow h-px bg-background-900!"/>
        O ingresa con tu email
        <hr class="grow h-px bg-background-900!"/>
      </div>
      <Input 
        v-model="user.email"
        type="email" 
        id="email" 
        name="email" 
        placeholder="Email" 
        :variant="'secondary'" 
        :outline="true"
        class="cursor-text"
        >
        <template #icon>
          <Mail color="#7b7b7b"/>
        </template>
      </Input>
      <Input 
        v-model="user.password"
        type="password" 
        id="password" 
        name="password" 
        placeholder="Contraseña" 
        :variant="'secondary'" 
        :outline="true"
        class="cursor-text"
        >
        <template #icon>
          <Password color="#7b7b7b"/>
        </template>
      </Input>
      <div class="flex justify-between items-center">
        <Checkbox v-model="user.remember" id="remember" name="remember" label="Recordarme" labelPosition="right" class="text-white"/>
        <router-link to="/register" class="text-primary text-xs text-background-900 font-bold">
          <span class="hover:underline">
            ¿Olvidaste tu contraseña?
          </span>
        </router-link>
      </div>
    </div>
    <Input 
      type="submit" 
      :text="authStore.loading ? 'Cargando...' : 'Iniciar sesión'"
      :iconPosition="'left'"
      :variant="'primary'"
      :class="authStore.loading ? 'cursor-not-allowed bg-deep-blue-700' : 'cursor-pointer'"
    >
    </Input>
    <p class="text-xs text-background-900 text-center font-regular">
      ¿No tenés una cuenta? 
      <router-link to="/register" class="text-primary font-bold">
        <span class="hover:underline">
          Registrar
        </span>
      </router-link>
    </p>
  </form>
</template>