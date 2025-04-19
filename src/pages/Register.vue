<script setup>
import { reactive } from "vue";
import { useAuthStore } from "@stores";
import { addAlert } from "../services/alerts";

import Heading from "../components/atoms/Heading.vue";
import Reemo from "@icons/Reemo.vue";
import Google from "../icons/Google.vue";
import FacebookIcon from "../icons/FacebookIcon.vue";
import Input from "../components/molecules/Input.vue";
import Mail from "../icons/Mail.vue";
import Password from "../icons/Password.vue";

const authStore = useAuthStore();

const user = reactive({
  email: "",
  password: "",
  repeatPassword: "",
});

const handleSubmit = async () => {
  console.log("Credentials to send:", {
    email: user.email,
    password: user.password,
  });
  if (!user.email || !user.password || !user.repeatPassword) {
    addAlert("Por favor, completa todos los campos.", "error");
    return;
  }
  if (user.password.length < 6) {
    addAlert("La contraseña debe tener al menos 6 caracteres.", "error");
    return;
  }
  if (user.password !== user.repeatPassword) {
    addAlert("Las contraseñas no coinciden.", "error");
    return;
  }
  try {
    await authStore.registerUser({
      email: user.email,
      password: user.password,
    });
  } catch (error) {}
};

</script>

<template>
  <form
    action="#" @submit.prevent="handleSubmit" autocomplete="off"
    class="flex flex-col max-w-lg px-16 py-12 bg-deep-blue-900 rounded-[40px] shadow-lg gap-9"
    >
    <Reemo color="#FFFFFF" />
    <div class="flex flex-col gap-5">
      <Heading :type="1" class="font-extrabold! text-background-900! large">Registrate</Heading>
      <p class="text-xs text-background-900 font-semibold">¡Bienvenido! Selecciona un método para crear una cuenta:</p>
    </div>

    <div class="flex flex-col gap-5">
      <div class="flex justify-between gap-10">
        <a href="/" class="flex items-center w-full justify-center gap-2 py-2.5 px-5 bg-background-900 font-semibold rounded-2xl"> <Google/> Google </a>
        <a href="/" class="flex items-center w-full justify-center gap-2 p-2 bg-background-900 font-semibold rounded-2xl"> <FacebookIcon/> Facebook </a>
      </div>
      <div class="flex items-center text-center text-background-900! gap-5 text-xs">
        <hr class="grow h-px bg-background-900!"/>
        O registrate con tu email
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
      <Input 
        v-model="user.repeatPassword"
        type="password" 
        id="repeatPassword" 
        name="repeatPassword" 
        placeholder="Repetir contraseña" 
        :variant="'secondary'" 
        :outline="true"
        class="cursor-text"
      >
        <template #icon>
          <Password color="#7b7b7b"/>
        </template>
      </Input>
      <p class="text-xs text-background-900 font-regular text-wrap">
        Al crear una cuenta, usted acepta nuestra 
        <router-link to="/" class="text-primary font-bold">
          <span class="hover:underline">
            Política de privacidad 
          </span> 
        </router-link>
        y nuestra 
        <router-link to="/" class="text-primary font-bold">
          <span class="hover:underline">
            Política de comunicación electrónica.
          </span>
        </router-link>
      </p>
    </div>
    <Input 
      type="submit" 
      :text="authStore.loading ? 'Cargando...' : 'Registrarse'"
      :iconPosition="'left'"
      :variant="'primary'"
      :class="authStore.loading ? 'cursor-not-allowed bg-deep-blue-700' : 'cursor-pointer'"
    >
    </Input>
    <p class="text-xs text-background-900 text-center font-regular">
      ¿Ya tenés una cuenta?
      <router-link to="/login" class="text-primary font-bold">
        <span class="hover:underline">
          Inicia sesión
        </span>
      </router-link>
    </p>
  </form>
</template>