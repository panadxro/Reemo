import { defineStore } from 'pinia';
import { login, logout, subscribeToAuthState, register } from '@services/auth';
import { createUserProfile } from '../services/user';
import { addAlert } from '@services/alerts';
import router from '@router/router';
import { useUserStore } from '@stores'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      id: null,
      email: null
    },
    loading: false,
    error: null,
    isLoggedIn: false,
    isSubmitting: false,
    isInitialized: false
  }),
  persist: {
    key: 'auth_session',
    storage: localStorage,
    pick: ['user', 'isLoggedIn']
  },
  actions: {
    init() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      // Leer el valor de auth_session de localStorage
      const authSessionValue = localStorage.getItem('auth_session');
      sessionStorage.setItem('auth_session_history', authSessionValue || '');

      // Suscribirse a cambios de autenticación
      subscribeToAuthState(async (newUserData) => {
        // console.log('Firebase auth state changed:', newUserData);
        const userStore = useUserStore();
        if (newUserData.id) {
          this.user = {            
            id: newUserData.id,
            email: newUserData.email,
          };
          this.isLoggedIn = true;          

          if (!userStore.profileData.personalInfo.userName) {
            await userStore.loadUserProfile(newUserData.id); // Cargamos el perfil
          }
        } else {
          this.user = { id: null, email: null };
          this.isLoggedIn = false;
          // userStore.resetProfile();
        }
      })
    },
    updateAuthSessionHistory(value) {
      // Actualiza el valor de auth_session_history en sessionStorage
      sessionStorage.setItem('auth_session_history', value);
    },
    async loginUser(credentials) {
      if (this.isSubmitting) {
        console.warn("Intento de login mientras ya se está procesando")
        return Promise.reject("Operación ya en curso")
      }

      this.isSubmitting = true
      this.loading = true
      this.error = null

      try {
        const userCredential = await login(credentials).catch(async (error) => {
          if (error.message.includes('connection')) {
            console.log('Reintentando conexión...');
            return await login(credentials);
          }
          throw error;
        });
        
        this.user = {
          id: userCredential.user.uid,
          email: userCredential.user.email
        }
        this.isLoggedIn = true
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        subscribeToAuthState((user)=>{})
        const userStore = useUserStore();
        await userStore.loadUserProfile(this.user.id);
        router.push(`/user/${this.user.id}`);
        addAlert("!Bienvenido a Reemo!", "success")
        return userCredential
      } catch (error) {
        this.handleLoginError(error)
        throw error
      } finally {
        this.loading = false
        setTimeout(() => {
          this.isSubmitting = false
        }, 3000)
      }
    },
    async registerUser(credentials){
      if (this.isSubmitting) {
        console.warn("Intento de registro mientras ya se está procesando")
        return Promise.reject("Operación ya en curso")
      }

      this.isSubmitting = true
      this.loading = true
      this.error = null

      try {
        await register(credentials)
        const userCredential = await login({
          email: credentials.email,
          password: credentials.password
        })
        this.user = {
          id: userCredential.user.uid,
          email: userCredential.user.email
        }
        this.isLoggedIn = true
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        await createUserProfile(this.user.id, this.user.email)
        router.push('/onboarding');
        addAlert("!Bienvenido a Reemo!", "success")
      } catch (error) {
        this.handleLoginError(error)
        throw error
      } finally {
        this.loading = false
        setTimeout(() => {
          this.isSubmitting = false
        }, 3000)
      }
    },
    async logout() {
      // Logica de logout
      try {
        await logout()
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        this.$reset()
        router.push("/");
      } catch (error) {
        console.error("Error durante el deslogeo:", error)
        throw error;
      }
    },
    handleLoginError(error) {
      const errorCode = error.errorCode
      switch (errorCode) {
        case 'auth/invalid-email':
          this.error = 'El correo electrónico ingresado no es valido.'
          break
        case 'auth/wrong-password':
          this.error = 'La contraseña es incorrecta.'
          break
        case 'auth/user-not-found':
          this.error = 'No existe una cuenta con este email'
          break
        default:
          this.error = 'Error al iniciar sesión. Intenta de nuevo.'
      }
      addAlert(this.error, 'error')
      this.isSubmitting = false
    }
  }
})