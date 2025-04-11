import { defineStore } from 'pinia'
import { login, logout, subscribeToAuthState } from '@services/auth'
import { addAlert } from '@services/alerts'

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
    isInitialiazed: false
  }),
  actions: {
    init() {
      if (this.isInitialiazed) return;
      this.isInitialiazed = true;

      // Suscribirse a cambios de autenticación
      subscribeToAuthState((newUserData) => {
        if (newUserData) {
          this.user = {
            id: newUserData.uid,
            email: newUserData.email
          }
          this.isLoggedIn = true;
        } else {
          this.user = { id: null, email: null };
          this.isLoggedIn = false;
        }
      })
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
    async logout() {
      // Logica de logout
      try {
        await logout()
        this.$reset()
        this.user = { id: null, email: null}
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