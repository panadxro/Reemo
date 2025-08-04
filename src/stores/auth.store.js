import { defineStore } from 'pinia';
import { login, logout, subscribeToAuthState, register, loginWithGoogle, loginWithFacebook, registerWithFacebook, registerWithGoogle } from '@services/auth';
import { createUserProfile } from '../services/user';
import { readNotification } from '@/services/car/notifyRented'
import { addAlert } from '@services/alerts';
import router from '@router/router';
import { useUserStore } from '@stores';
import { useNotificationStore } from '@stores/notification.store'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: {
      id: null,
      email: null,
      firstName: null,
      lastName: null,
      name: null,
      profilePhoto: null || '/src/assets/User.png',
      username: null,
      status: null,
      role: null
    },
    loading: false,
    error: null,
    isLoggedIn: false,
    isSubmitting: false,
    isInitialized: false,
    unreadNotifications: false,
    unsubscribeReadNotification: null,
  }),
  persist: {
    key: 'auth_session',
    storage: localStorage,
    pick: ['user', 'isLoggedIn'] 
  },
  getters: {
    userFirstName: (state) => {
      return state.user.firstName || state.user.name || state.user.username || 'Usuario';
    },
    userLastName: (state) => {
      return state.user.lastName || '';
    },
    userProfilePhoto: (state) => {
      return state.user.profilePhoto;
    },
    userStatus: (state) => {
      return state.user.status || 'not-verified';
    }
  },
  actions: {
    init() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      if(this.unsubscribeReadNotification){
        this.unsubscribeReadNotification = null;
      }

      const authSessionValue = localStorage.getItem('auth_session');
      sessionStorage.setItem('auth_session_history', authSessionValue || '');

      subscribeToAuthState(async (newUserData) => {
        const userStore = useUserStore();
        if (newUserData.id) {
          this.user = {            
            id: newUserData.id,
            email: newUserData.email,
            firstName: null,
            lastName: null,
            name: null,
            profilePhoto: null,
            username: null,
            status: 'not-verified',
            role: null
          };
          this.isLoggedIn = true;          

          if (!userStore.profileData.personalInfo.userName) {
            await userStore.loadUserProfile(newUserData.id); 
            this.updateUserProfile(userStore.profileData);
          }

          this.unsubscribeReadNotification = readNotification(
            newUserData.id,
            (hasUnread) => {
              this.unreadNotifications = hasUnread;
            }
          );
        
        } else {
          this.user = { 
            id: null, 
            email: null,
            firstName: null,
            lastName: null,
            name: null,
            profilePhoto: null,
            username: null,
            status: null,
            role: null
          };
          this.isLoggedIn = false;
          
          if(this.unsubscribeReadNotification){
            this.unsubscribeReadNotification = null;
          }
        }
      })
    },
    
    updateUserProfile(profileData) {
      if (profileData && profileData.personalInfo) {
        this.user = {
          ...this.user,
          firstName: profileData.personalInfo.firstName || null,
          lastName: profileData.personalInfo.lastName || null,
          name: profileData.personalInfo.firstName || null, 
          profilePhoto: profileData.personalInfo.profilePhoto || null,
          username: profileData.personalInfo.username || null,
          status: profileData.status || 'not-verified',
          role: profileData.role || 'user'
        };
        // console.log("Perfil de usuario actualizado:", this.user);
      }
    },

    updateAuthSessionHistory(value) {
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
          email: userCredential.user.email,
          firstName: null,
          lastName: null,
          name: null,
          profilePhoto: null,
          username: null,
          status: null 
        }
        this.isLoggedIn = true
        subscribeToAuthState((user)=>{})
        const userStore = useUserStore();
        await userStore.loadUserProfile(this.user.id);
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        
        this.updateUserProfile(userStore.profileData);
        
        router.push(`/dashboard`);
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
          email: userCredential.user.email,
          firstName: null,
          lastName: null,
          name: null,
          profilePhoto: null,
          username: null,
          status: null 
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
      try {
        await logout()
        const notificationStore = useNotificationStore();
        notificationStore.clearListenerAndData();
        
        if(this.unsubscribeReadNotification){
          this.unsubscribeReadNotification = null;
        }
        
        this.$reset()
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
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
    },

    setUnreadNotifications(status){
      this.unreadNotifications = status;
    },

    async registerWithGoogle() {
      if (this.isSubmitting) {
        console.warn("Intento de registro mientras ya se está procesando");
        return Promise.reject("Operación ya en curso");
      }

      this.isSubmitting = true;
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await registerWithGoogle();
        
        // Resetear el estado para nuevo registro
        this.user = {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          firstName: userCredential.user.displayName?.split(' ')[0] || null,
          lastName: userCredential.user.displayName?.split(' ')[1] || null,
          name: userCredential.user.displayName || null,
          profilePhoto: userCredential.user.photoURL || null,
          username: null,
          status: 'not-verified',
          role: 'user'
        };
        this.isLoggedIn = true;
        
        // Crear perfil para nuevo usuario
        await createUserProfile(this.user.id, this.user.email);
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        
        // Redirigir a onboarding
        router.push('/onboarding');
        addAlert("¡Registro con Google exitoso! Completa tu perfil", "success");
        return userCredential;
      } catch (error) {
        console.error("Error en registro con Google:", error);
        this.error = 'Error al registrarse con Google';
        addAlert(this.error, 'error');
        throw error;
      } finally {
        this.loading = false;
        setTimeout(() => {
          this.isSubmitting = false;
        }, 3000);
      }
    },

    async loginWithGoogle() {
      if (this.isSubmitting) {
        console.warn("Intento de login mientras ya se está procesando");
        return Promise.reject("Operación ya en curso");
      }

      this.isSubmitting = true;
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await loginWithGoogle();
        
        // Mantener datos existentes del usuario
        this.user = {
          ...this.user,
          id: userCredential.user.uid,
          email: userCredential.user.email,
          firstName: userCredential.user.displayName?.split(' ')[0] || this.user.firstName,
          lastName: userCredential.user.displayName?.split(' ')[1] || this.user.lastName,
          name: userCredential.user.displayName || this.user.name,
          profilePhoto: userCredential.user.photoURL || this.user.profilePhoto
        };
        this.isLoggedIn = true;
        
        const userStore = useUserStore();
        await userStore.loadUserProfile(this.user.id);
        this.updateUserProfile(userStore.profileData);
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        
        router.push(`/dashboard`);
        addAlert("¡Bienvenido de nuevo con Google!", "success");
        return userCredential;
      } catch (error) {
        console.error("Error en login con Google:", error);
        
        if (error.message === 'USER_NOT_REGISTERED') {
          this.error = 'Esta cuenta de Google no está registrada. Por favor, registrate primero.';
          addAlert(this.error, 'error');
          router.push(`/register`);
        } else {
          this.error = 'Error al iniciar sesión con Google';
          addAlert(this.error, 'error');
        }
        throw error;
      } finally {
        this.loading = false;
        setTimeout(() => {
          this.isSubmitting = false;
        }, 3000);
      }
    },


     async registerWithFacebook() {
      if (this.isSubmitting) {
        console.warn("Intento de registro mientras ya se está procesando");
        return Promise.reject("Operación ya en curso");
      }

      this.isSubmitting = true;
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await registerWithFacebook();
        
        // Resetear el estado para nuevo registro
        this.user = {
          id: userCredential.user.uid,
          email: userCredential.user.email,
          firstName: userCredential.user.displayName?.split(' ')[0] || null,
          lastName: userCredential.user.displayName?.split(' ')[1] || null,
          name: userCredential.user.displayName || null,
          profilePhoto: userCredential.user.photoURL || null,
          username: null,
          status: 'not-verified',
          role: 'user'
        };
        this.isLoggedIn = true;
        
        // Crear perfil para nuevo usuario
        await createUserProfile(this.user.id, this.user.email);
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        
        // Redirigir a onboarding
        router.push('/onboarding');
        addAlert("¡Registro con Facebook exitoso! Completa tu perfil", "success");
        return userCredential;
      } catch (error) {
        console.error("Error en registro con Facebook:", error);
        this.handleFacebookError(error);
        throw error;
      } finally {
        this.loading = false;
        setTimeout(() => {
          this.isSubmitting = false;
        }, 3000);
      }
    },


     async loginWithFacebook() {
      if (this.isSubmitting) {
        console.warn("Intento de login mientras ya se está procesando");
        return Promise.reject("Operación ya en curso");
      }

      this.isSubmitting = true;
      this.loading = true;
      this.error = null;

      try {
        const userCredential = await loginWithFacebook();
        
        // Mantener datos existentes del usuario
        this.user = {
          ...this.user,
          id: userCredential.user.uid,
          email: userCredential.user.email,
          firstName: userCredential.user.displayName?.split(' ')[0] || this.user.firstName,
          lastName: userCredential.user.displayName?.split(' ')[1] || this.user.lastName,
          name: userCredential.user.displayName || this.user.name,
          profilePhoto: userCredential.user.photoURL || this.user.profilePhoto
        };
        this.isLoggedIn = true;
        
        const userStore = useUserStore();
        await userStore.loadUserProfile(this.user.id);
        this.updateUserProfile(userStore.profileData);
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        
        router.push(`/dashboard`);
        addAlert("¡Bienvenido de nuevo con Facebook!", "success");
        return userCredential;
      } catch (error) {
        if (error.message === 'USER_NOT_REGISTERED') {
          this.error = 'Esta cuenta de Facebook no está registrada. Por favor, registrate primero.';
          addAlert(this.error, 'error');
          router.push(`/register`);
        } else {
          this.error = 'Error al iniciar sesión con Facebook';
          addAlert(this.error, 'error');
        }
        throw error;
      } finally {
        this.loading = false;
        setTimeout(() => {
          this.isSubmitting = false;
        }, 3000);
      }
    },


    handleFacebookError(error) {
      const errorCode = error.code;
      switch (errorCode) {
        case 'auth/account-exists-with-different-credential':
          this.error = 'Ya existe una cuenta con este email usando otro método de autenticación';
          break;
        case 'auth/popup-closed-by-user':
          this.error = 'El popup de Facebook se cerró antes de completar la autenticación';
          break;
        case 'auth/cancelled-popup-request':
          this.error = 'Se inició otra solicitud de autenticación antes de completar esta';
          break;
        case 'auth/permission-denied':
          this.error = 'No se concedieron los permisos necesarios';
          break;
        default:
          this.error = 'Error al autenticar con Facebook';
      }
      addAlert(this.error, 'error');
    }
  }
});