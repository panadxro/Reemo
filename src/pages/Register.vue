<script>
import { register } from "../services/auth";
import { addAlert } from "../services/alerts";

import Heading from "../components/atoms/Heading.vue";
import Reemo from '@icons/Reemo.vue';
import Google from "../icons/Google.vue";
import FacebookIcon from "../icons/FacebookIcon.vue";
import Input from "../components/molecules/Input.vue";
import Mail from "../icons/Mail.vue";
import Password from "../icons/Password.vue";
import Checkbox from "../components/atoms/Checkbox.vue";

export default {
  name: "Register",
  components: { Heading, Reemo, Google, FacebookIcon, Input, Mail, Password, Checkbox },
  data() {
    return {
      user: {
        email: "",
        password: "",
        repeatPassword: "",
      },
      loading: false,
      errorMsg: "",
      passwordMatchError: false,
    };
  },
  methods: {
    async handleSubmit() {
      if (this.user.password !== this.user.repeatPassword) {
        this.passwordMatchError = true;
        return addAlert('Las contraseñas no coinciden', 'error');
      }
      this.loading = true;
      this.errorMsg = "";
      this.passwordMatchError = false; 
      try {
        await register({ ...this.user });
        addAlert("¡Usuario creado con éxito!", "success");
        this.$router.push("/Onboarding");
      } catch (error) {
        let errorCode = error.code;
        switch (errorCode) {
          case 'auth/missing-password':
            return addAlert('Para crear un usuario debés ingresar una contraseña', 'warning');
          case 'auth/weak-password':
            return addAlert('La contraseña debe tener al menos 6 caracteres', 'warning');
          case 'auth/email-already-in-use':
            return addAlert('El mail utilizado ya tiene un usuario asignado', 'error');
          case 'auth/invalid-email':
            return addAlert('El email ingresado no es válido', 'error');
          default:
            return addAlert('Error al registrar usuario', 'error');
        }
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
    class="flex flex-col max-w-lg px-16 py-12 bg-deep-blue-900 rounded-[40px] shadow-lg gap-9"
    >
    <Reemo color="#FFFFFF"/>
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
      :text="loading ? 'Cargando...' : 'Registrarse'"
      :iconPosition="'left'"
      :variant="'primary'"
      :class="loading ? 'cursor-not-allowed bg-deep-blue-700' : 'cursor-pointer'"
    >
    </Input>
    <p class="text-xs text-background-900 text-center font-regular">
      ¿Ya tenés una cuenta?
      <router-link to="/Login" class="text-primary font-bold">
        <span class="hover:underline">
          Inicia sesión
        </span>
      </router-link>
    </p>
  </form>
</template>