import { defineStore } from 'pinia';
import { login, logout, subscribeToAuthState, register } from '@services/auth';
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
      lastname: null,
      profilePhoto: null,
      username: null
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
    userDisplayName: (state) => {
      if (state.user.firstName && state.user.lastName) {
        return `${state.user.firstName} ${state.user.lastName}`;
      }
      if (state.user.name && state.user.lastname) {
        return `${state.user.name} ${state.user.lastname}`;
      }
      if (state.user.firstName) {
        return state.user.firstName;
      }
      if (state.user.name) {
        return state.user.name;
      }
      if (state.user.username) {
        return state.user.username;
      }
      if (state.user.email) {
        return state.user.email.split('@')[0];
      }
      return 'Usuario';
    },
    userFirstName: (state) => {
      return state.user.firstName || state.user.name || state.user.username || 'Usuario';
    },
    userLastName: (state) => {
      return state.user.lastName || state.user.lastname || '';
    },
    userProfilePhoto: (state) => {
      return state.user.profilePhoto;
    }
  },
  actions: {
    init() {
      if (this.isInitialized) return;
      this.isInitialized = true;

      // limpiar listener anterior
      if(this.unsubscribeReadNotification){
        // this.unsubscribeReadNotification();
        this.unsubscribeReadNotification = null;
      }

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
            // Inicializar campos del perfil
            firstName: null,
            lastName: null,
            name: null,
            lastname: null,
            profilePhoto: null,
            username: null
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
            lastname: null,
            profilePhoto: null,
            username: null
          };
          this.isLoggedIn = false;
          // userStore.resetProfile();
          // Detener el listener de notificaciones si el usuario se desloguea
          if(this.unsubscribeReadNotification){
            // this.unsubscribeReadNotification();
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
          name: profileData.personalInfo.name || profileData.personalInfo.firstName || null,
          lastname: profileData.personalInfo.lastname || profileData.personalInfo.lastName || null,
          profilePhoto: profileData.personalInfo.profilePhoto || profileData.personalInfo.photoURL || null,
          username: profileData.personalInfo.username || profileData.personalInfo.userName || null
        };
      }
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
          email: userCredential.user.email,
          firstName: null,
          lastName: null,
          name: null,
          lastname: null,
          profilePhoto: null,
          username: null
        }
        this.isLoggedIn = true
        this.updateAuthSessionHistory(localStorage.getItem('auth_session') || '');
        subscribeToAuthState((user)=>{})
        const userStore = useUserStore();
        await userStore.loadUserProfile(this.user.id);
        
        // Actualizar datos del perfil en auth después de cargar
        this.updateUserProfile(userStore.profileData);
        
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
          email: userCredential.user.email,
          firstName: null,
          lastName: null,
          name: null,
          lastname: null,
          profilePhoto: null,
          username: null
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
        const notificationStore = useNotificationStore();
        notificationStore.clearListenerAndData();

        if(this.unsubscribeReadNotification){
            this.unsubscribeReadNotification = null;
        }

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
    },

    setUnreadNotifications(status){
      this.unreadNotifications = status;
    }
  },
})