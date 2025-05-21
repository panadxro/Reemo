import { defineStore } from 'pinia'

export const useCarStore = defineStore('car', {
  state: () => ({
    carData: {
      id: null,
      ownerId: null,
      basicInfo: {
        brand: null,
        model: null,
        year: null,
        type: null,
        color: null,
        licensePlate: null
      }
    }
  })
})