import { defineStore } from 'pinia'
import { getUserProfile, saveUserData } from '../services/user'

export const useUserProfileStore = defineStore('userProfile', {
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
      agreements: {}
    },
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
      this.user = {}
      this.post = []
      this.cars = []
      this.rentedCars = []
    },
    setUser(userData) {
      this.user = userData
    },
    async loadUserProfile(userId) {
      this.loading = true
      try {
        this.profileData = {
          personalInfo: {
            ...profileData.personalInfo,
            email: profileData.personalInfo?.email || ''
          },
          documents: profileData.documents || {},
          address: profileData.address || {},
          paymentMethods: profileData.paymentMethods || [],
          agreements: profileData.agreements || {}
        }
      } catch (error) {
        this.error = error.message
        throw error
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