<script>
import { login } from "../services/auth";
import { addAlert } from "../services/alerts";

import Heading from "../components/atoms/Heading.vue";

export default {
  name: "Login",
  components: { Heading },
  data() {
    return {
      user: {
        email: "",
        password: "",
      },
      loading: false,
      errorMsg: "",
    };
  },
  methods: {
    async handleSubmit() {
      this.loading = true;
      this.errorMsg = "";

      try {
        await login({
          // email: this.user.email,
          // password: this.user.password,
          ...this.user,
        });
        addAlert("¡Bienvenido a Reemo!", "success");
        // Redireccionamos al perfil.
        this.$router.push("/Profile");
      } catch (error) {
        let errorCode = error.code;

        if (errorCode === "auth/invalid-credential") {
          addAlert("Credenciales inválidas", "error");
        }
        if (errorCode === "auth/missing-password") {
          addAlert("Ingresa la contraseña", "error");
        }

        console.error("[Login.vue] Error al autenticar: ", error);
        // throw error;
      }
      this.loading = false;
    },
  },
};
</script>

<template>
  <div v-if="loading" class="flex items-center justify-center w-fit mx-auto bg-gray-50">
    <div role="status">
      <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none"
        xmlns="http://www.w3.org/2000/svg">
        <path
          d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
          fill="currentColor" />
        <path
          d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
          fill="currentFill" />
      </svg>
      <span class="sr-only">Cargando...</span>
    </div>
  </div>
  <!-- <form action="#" @submit.prevent="handleSubmit" class="max-w-md w-96 m-auto">
    <Heading :type="1">Iniciar sesión</Heading>
    <div class="relative z-0 w-full mb-5 group">
      <input
        type="email"
        id="email"
        placeholder=" "
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 peer"
        v-model="user.email"
        name="email"
      />
      <label
        for="email"
        class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >Email</label
      >
    </div>
    <div class="relative z-0 w-full mb-5 group">
      <input
        type="password"
        id="password"
        placeholder=" "
        class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-hidden focus:ring-0 focus:border-blue-600 peer"
        v-model="user.password"
        name="password"
      />
      <label
        for="password"
        class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-focus:rtl:translate-x-1/4 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
        >Contraseña</label
      >
    </div>
    <button
      type="submit"
      class="transition-all py-2 px-4 rounded-sm bg-blue-700 text-white focus:bg-blue-500 hover:bg-blue-500 active:bg-blue-900"
    >
      Ingresar
    </button>
    <p class="mt-8 mb-3">¿No tenés cuenta?</p>
    <router-link
      to="/Register"
      class="transition-all py-2 px-4 rounded-sm bg-yellow-700 text-white focus:bg-blue-500 hover:bg-blue-500 active:bg-blue-900"
      >Crear Cuenta</router-link
    >
  </form> -->

  <div class="centro my-16">
    <form action="#" @submit.prevent="handleSubmit" class="formulario">
      <div class="bienvenida-fila">
        <img class="bienvenida" alt="Logo" src="../assets/imagotipo-celeste.png">
        <Heading :type="1" class="mt-4">Iniciar sesión</Heading>
      </div>
      <div class="redes">
        <a href="#" title="Usar Google"> <img src="../assets/google.png" alt="Google">Usar Google</a>
        <a href="#" title="Usar Facebook"> <img src="../assets/facebook.png" alt="Facebook">Usar Facebook</a>
      </div>
      <div class="divisor">
        <div class="linea-divisor"></div>
        O
        <div class="linea-divisor"></div>
      </div>
      <div class="formulario-contenido">
        <div class="campo-texto">
          <label for="email">Mail:</label>
          <input aria-label="Email" type="email" id="email" name="email" v-model="user.email" placeholder="Mail"
            autocomplete="off">
          <svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-mail" width="44" height="44"
            viewBox="0 0 24 24" stroke-width="1.5" stroke="#A7A2CB" fill="none" stroke-linecap="round"
            stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <path d="M3 7a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v10a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2v-10z" />
            <path d="M3 7l9 6l9 -6" />
          </svg>
        </div>
        <div class="campo-texto">
          <label for="password">Contraseña:</label>
          <input id="password" type="password" name="password" v-model="user.password" placeholder="Contraseña">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" stroke-width="2"
            stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
            <path d="M5 13a2 2 0 0 1 2 -2h10a2 2 0 0 1 2 2v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-6z">
            </path>
            <path d="M11 16a1 1 0 1 0 2 0a1 1 0 0 0 -2 0"></path>
            <path d="M8 11v-4a4 4 0 1 1 8 0v4"></path>
          </svg>
        </div>
        <input type="submit" class="formulario-boton" value="Iniciar Sesión">
      </div>
      <div class="formulario__acciones">
        <div class="formulario-signup">
          <router-link to="/Register">Crear Cuenta</router-link>
        </div>
      </div>
    </form>
  </div>

</template>

<style scoped>
.redes {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin: 1rem 0px;
}

.redes img {
  width: 1.5rem;
  height: 1.5rem;
}

.redes>a {
  border-radius: 0.5rem;
  width: 100%;
  min-height: 3rem;
  display: flex;
  gap: 0.75rem;
  justify-content: center;
  align-items: center;
  text-decoration: none;
  font-size: 1rem;
  color: #010440;
  border: 1px solid #010440d1;
  font-weight: 700;
  transition: all .2s ease;
}

.redes>a:hover {
  background-color: #010440d1;
  color: white;
  transition: all .2s ease;
}

.divisor {
  display: flex;
  flex-direction: row;
  color: #010440;
  gap: 1rem;
  align-items: center;
}

.linea-divisor {
  width: 100%;
  height: 1px;
  background-color: #010440;
  opacity: .2;
}

.centro {
  display: flex;
  justify-content: center;
  align-items: center;
}

.formulario {
  display: flex;
  flex-direction: column;
  position: relative;
  gap: 1rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.286);
  min-width: 17.5rem;
  max-width: 31.25rem;
  width: 100%;
  padding: 2rem;
}

.bienvenida-fila {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  gap: 0.5rem;
}

.formulario-boton {
  background-color: #499fa4;
  color: white;
  white-space: nowrap;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1rem;
  line-height: 3.125rem;
  outline: none;
  font-size: 1.125rem;
  letter-spacing: .025em;
  text-decoration: none;
  cursor: pointer;
  font-weight: 800;
  min-height: 3.125rem;
  width: 100%;
  border-radius: 0.5rem;
  box-shadow: 0 5px 10px rgba(0, 0, 0, .15);
  transition: all .3s ease;
  -webkit-transition: all .3s ease;
}

.campo-texto input {
  color: #4FD8DF;
  font-size: 1rem;
  font-weight: 500;
  max-width: 100%;
  width: 100%;
  border: 1px solid grey;
  height: 3.125rem;
  color: #010440;
  letter-spacing: .03rem;
  background-color: transparent;
  outline: none;
  transition: .25s;
  border-radius: 0.5rem;
  text-indent: 1.25rem;
  margin-top: 0.5rem;
}

.campo-texto input:focus {
  border: 1px solid #499fa4;
}

.formulario-boton:hover {
  background-color: #3a8084;
}

.campo-texto {
  position: relative;
}

.campo-texto input::-webkit-input-placeholder {
  color: grey;
}

.campo-texto svg {
  position: absolute;
  right: -0.125rem;
  bottom: -0.25rem;
  width: 1.875rem;
  height: 1.875rem;
  transform: translate(-50%, -50%);
  transform-origin: center;
  stroke: #010440;
}

.campo-texto input:focus+svg {
  stroke: #499fa4;
}

.campo-texto label {
  color: #010440;
  font-size: 0.875rem;
  font-weight: 600;
  letter-spacing: .03rem;
  z-index: 10;
}

.campo-texto label:has(+ input:focus) {
  color: #499fa4;
}

.input-icon {
  position: absolute;
  bottom: 0;
  top: 55%;
  right: 0.5rem;
  transform: translate(-50%, -50%);
  transform-origin: center;
}

.formulario__acciones {
  display: flex;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
  margin-top: 0.5rem;
}

.formulario-contenido {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.formulario__acciones a {
  color: #4FD8DF;
  font-weight: 600;
}

.formulario__acciones a:hover {
  text-decoration: underline;
}

.formulario__row {
  display: flex;
  justify-content: space-between;
}

.formulario-signup {
  display: flex;
  justify-content: center;
}

.formulario-signup a {
  color: #4FD8DF;
  font-weight: 800;
  text-decoration: none;
  font-size: 1.125rem;
}

.formulario-signup a:hover {
  text-decoration: underline;
}
</style>