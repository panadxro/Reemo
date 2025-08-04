import { defineStore } from 'pinia'
import {
  getUserProfile,
  saveUserData,
  updatePersonalInfo,
  updateUserDocuments,
  updateUserAddress,
  addPaymentMethod,
  acceptedTerms,
  getUserById
} from '../services/user'
import { uploadUserFile } from '../services/storage/documents'
import { useAuthStore } from '@stores'

export const useUserStore = defineStore('user', {
  state: () => ({
    profileData: {
      personalInfo: {
        firstName: null,
        lastName: null,
        email: null,
        profilePhoto: null || '/src/assets/User.png',
        userName: null
      },
      documents: null,
      address: {},
      paymentMethods: [],
      agreements: {},
      role: 'user'
    },
    profileLoaded: false,
    visitedProfileData: null,
    visitedRole: null,
    userById: {},
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
          firstName: null,
          lastName: null,
          email: null,
          profilePhoto: null,
          username: null,
          totalEarnings: 0
        },
        documents: null,
        address: null,
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

    async getUserById(userId) {
      if (!userId) {
        console.error('getUserById: no existe el userId');
        return null;
      }

      if (this.userById[userId]) {
        return this.userById[userId];
      }

      this.loading = true;
      try {
        const userProfile = await getUserById(userId);
        
        if (userProfile) {
          this.userById[userId] = userProfile;
          return userProfile;
        }
        
        return null;
      } catch (error) {
        console.error('Error getting user by ID:', error);
        this.error = error.message;
        return null;
      } finally {
        this.loading = false;
      }
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
             totalEarnings: userProfile?.personalInfo?.totalEarnings || 0
           },
           role: userProfile?.role || 'user'
         };
          this.profileLoaded = true

        } else {
          this.visitedProfileData = {
            ...userProfile,
            personalInfo: {
              ...userProfile?.personalInfo
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
    async updateProfile(uid, profileData) {
      this.loading = true
      try {
        const {personalInfo, documents, address, paymentMethods, agreements} = profileData;
        if(personalInfo ) {
          await updatePersonalInfo(uid, personalInfo);
        }
        if(documents) {
           await updateUserDocuments(uid, documents);
        }
        if(address) {
           await updateUserAddress(uid, address);
        }
        if(paymentMethods) {
           await addPaymentMethod(uid, paymentMethods);
        }
        if(agreements) {
           await acceptedTerms(uid, agreements);
        }
      } catch (error) {
        this.error = error.message || 'Error al guardar'
        throw error
      } finally {
        this.loading = false
        this.profileData = {
          ...this.profileData,
          ...profileData
        }
      }
    },
    // Queda añadir más acciones especificas
    async uploadFile(userId, file, path, field){
        return uploadUserFile(userId, file, path).then(url => {
          switch (field) {
            case 'profilePhoto':
              this.profileData.personalInfo.profilePhoto = url;
              break;
            case 'dniFront':
              this.profileData.documents.dniFront = url;
              break;
            case 'dniBack':
              this.profileData.documents.dniBack = url;
              break;
            case 'driverLicenseFront':
              this.profileData.documents.driverLicenseFront = url;
              break;
            case 'driverLicenseBack':
              this.profileData.documents.driverLicenseBack = url;
              break;
            default:
              break;
          }
        });
    }
  },
  getters: {
    isProfileLoaded: (state) => state.profileLoaded,
    user: (state) => state.profileData,
    personalInfo: (state) => state.profileData?.personalInfo || {},
    documents: (state) =>  state.profileData?.documents || {},
    address: (state) =>  state.profileData?.address || {},
    paymentMethods: (state) =>  state.profileData?.paymentMethods || {},
    agreements: (state) =>  state.profileData?.agreements || {},
    getUserDataById: (state) => (userId) => {
      return state.userById[userId] || null;
    },
  }
})