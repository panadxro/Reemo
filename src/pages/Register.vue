<script setup>
import { reactive, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@stores";
import { addAlert } from "../services/alerts";

import Heading from "../components/atoms/Heading.vue";
import Reemo from "@icons/Reemo.vue";
import Google from "../icons/Google.vue";
import FacebookIcon from "../icons/FacebookIcon.vue";
import Input from "../components/molecules/Input.vue";
import Mail from "../icons/Mail.vue";
import Password from "../icons/Password.vue";
import BackButton from "../components/atoms/BackButton.vue";

const authStore = inject('authStore');
const authSession = inject('authSession');
const router = useRouter();

const user = reactive({
  email: "",
  password: "",
  repeatPassword: "",
});

const handleSubmit = async () => {
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
      role: "user",
    });
  } catch (error) {}
};

const handleGoogleSignUp = async () => {
  try {
    await authStore.registerWithGoogle();
  } catch (error) {
    console.error("Error en registro con Google:", error);
  }
};

const handleFacebookSignUp = async () => {
  try {
    await authStore.registerWithFacebook();
  } catch (error) {
    console.error("Error en registro con Facebook:", error);
  }
};

onMounted(async () => {
  await authSession.isLoggedIn;
  if (authSession.isLoggedIn) {
    router.push("/");
  }
});

</script>

<template>
  <form
    action="#" @submit.prevent="handleSubmit" autocomplete="off"
    class="flex flex-col justify-center md:max-w-lg md:px-16 px-2.5 py-12 bg-deep-blue-900 md:rounded-[40px] shadow-lg gap-4 md:gap-8 w-full h-screen md:h-auto" 
    >
    <div class="flex gap-2 justify-between items-center">
      <BackButton class="flex md:absolute top-10 left-10" color="#FFFFFF"/>
      <router-link to="/">
        <Reemo color="#FFFFFF"/>
      </router-link>
    </div>
    <div class="flex flex-col gap-5">
      <Heading :type="1" class="font-extrabold! text-background-900! large">Registrate</Heading>
      <p class="hidden md:flex text-sm text-background-900 font-semibold">¡Bienvenido! Selecciona un método para crear una cuenta:</p>
      <p class="md:hidden text-sm text-background-900 font-semibold">¡Bienvenido! Ingresa tus datos para crear una cuenta:</p>
    </div>

    <div class="flex flex-col gap-5">
      <div class="flex justify-between gap-4 md:gap-10">
        <Input
          type="button"
          variant="primary"
          :outline="true"
          @click="handleGoogleSignUp"
          icon-position="left"
          text="Google"
        >
          <template #icon>
            <Google/>
          </template>
        </Input>
        <Input
          type="button"
          variant="primary"
          :outline="true"
          @click="handleFacebookSignUp"
          icon-position="left"
          text="Facebook"
        >
          <template #icon>
            <FacebookIcon/>
          </template>
        </Input>
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
    </div>
    <Input 
      type="submit" 
      :text="authStore.loading ? 'Cargando...' : 'Registrarse'"
      :iconPosition="'left'"
      :variant="'primary'"
      :disabled="authStore.loading"
    >
    </Input>
    <p class="text-sm text-background-900 text-center font-regular">
      ¿Ya tenés una cuenta?
      <router-link to="/login" class="text-primary font-bold">
        <span class="hover:underline">
          Inicia sesión
        </span>
      </router-link>
    </p>
  </form>
</template>