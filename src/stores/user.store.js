import { defineStore } from 'pinia'
import {
  getUserProfile,
  saveUserData,
  updatePersonalInfo,
  updateUserDocuments,
  updateUserAddress,
  addPaymentMethod,
  acceptedTerms
} from '../services/user'
import { useAuthStore } from '@stores'

export const useUserStore = defineStore('user', {
  state: () => ({
    profileData: {
      personalInfo: {
        firstName: '',
        lastName: '',
        email: '',
        profilePhoto: '',
        userName: ''
      },
      documents: {},
      address: {},
      paymentMethods: [],
      agreements: {},
      role: 'user'
    },
    visitedProfileData: null,
    visitedRole: null,
    posts: [],
    cars: [],
    rentedCars: [],
    loading: false,
    loadingStates: {
      profile: false,
      posts: false,
      cars: false
    },
    error: null,
  }),
  actions: {
    setLoading(value) {
      this.loading = value
    },
    resetProfile() {
      const authStore = useAuthStore();
      this.profileData = { // Corregido: Usar profileData para el reset
          personalInfo: {
            firstName: '',
            lastName: '',
            email: '',
            profilePhoto: '',
            username: ''
          },
          documents: {},
          address: {},
          paymentMethods: [],
          agreements: {},
          role: 'user' // Valor por defecto
        }
      this.visitedProfileData = null;
      this.visitedRole = null;
      this.posts = [];
      this.cars = [];
      this.rentedCars = [];
    },
    setUser(userData) {
      this.user = userData
    },
    async loadUserProfile(userId) {
      const authStore = useAuthStore();
      this.loading = true
      try {
        const userProfile = await getUserProfile(userId); // Llamada al servicio. Aqui llegan los datos
        console.log(userProfile) // puedes borrar esta linea, es solo para ver que recibes
        if (userId === authStore.user?.id) {
          this.profileData = {
            ...userProfile, // hacemos un spread del userProfile para que tome todos los datos que no estan en personalInfo.
           personalInfo: {
             ...userProfile?.personalInfo, // Ahora usamos userProfile en vez de profileData
             email: userProfile?.email || '', // Ajustado con el ?, lo movemos dentro de personalInfo
             emailVerified: userProfile?.emailVerified || false, // tambien lo agregamos
           },
         };
        } else {
          // Crea una nueva propiedad para el perfil visitado
          this.visitedProfileData = {
            ...userProfile, // hacemos un spread del userProfile para que tome todos los datos que no estan en personalInfo.
            personalInfo: {
              ...userProfile?.personalInfo, // Ahora usamos userProfile en vez de profileData
              email: userProfile?.email || '', // Ajustado con el ?, lo movemos dentro de personalInfo
              emailVerified: userProfile?.emailVerified || false, // tambien lo agregamos
            },
          };
          this.visitedRole = userProfile?.role || 'user'; // guardamos el rol del usuario visitado
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false
      }
    },
    async saveProfile(uid, profileData) {
      this.loading = true
      try {
        await saveUserData(uid, profileData)
        // Actualiza los datos locales con los nuevos datos
        this.profileData = {
          ...this.profileData,
          ...profileData
        }
      } catch (error) {
        this.error = error.message || 'Error al guardar'
        throw error
      } finally {
        this.loading = false
      }
    },
    async completeOnboarding(userData) {
      const { uid, profile, documents, address, agreements } = userData
      this.loading = true
      try {
        if(profile) {
          await updatePersonalInfo(uid, profile)
        }
        if(documents){
          await updateUserDocuments(uid, documents)
        }
        if(address){
          await updateUserAddress(uid, address)
        }
        if(payment){
          await addPaymentMethod(uid, payment)
        }
        if(agreements){
          await acceptedTerms(uid, agreements)
        }
      } catch (error) {
        this.error = error.message || 'Error al guardar el onboarding'
        throw error
      } finally {
        this.loading = false
      }
    },
    // Queda añadir más acciones especificas
    async updateProfilePhoto(file) {
      // Logica para actualizar foto de perfil
    }
  },
  getters: {
    user: (state) => state.profileData,
    personalInfo: (state) => state.profileData?.personalInfo || {},
    documents: (state) =>  state.profileData?.documents || {},
    address: (state) =>  state.profileData?.address || {},
    paymentMethods: (state) =>  state.profileData?.paymentMethods || {},
    agreements: (state) =>  state.profileData?.agreements || {},
  }
})