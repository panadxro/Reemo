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
      this.profileData = {
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
        role: 'user'
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
        const userProfile = await getUserProfile(userId);
        if (userId === authStore.user?.id) {
          this.profileData = {
            ...userProfile,
           personalInfo: {
             ...userProfile?.personalInfo,
             email: userProfile?.email || '',
             emailVerified: userProfile?.emailVerified || false,
           },
           role: userProfile?.role || 'user'
         };
        } else {
          this.visitedProfileData = {
            ...userProfile,
            personalInfo: {
              ...userProfile?.personalInfo,
              email: userProfile?.email || '',
              emailVerified: userProfile?.emailVerified || false,
            },
          };
          this.visitedRole = userProfile?.role || 'user';
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