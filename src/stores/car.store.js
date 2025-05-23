import { defineStore } from "pinia";
import { updateCar } from "../services/car/core";
import { useAuthStore } from "./auth";

export const useCarStore = defineStore("car", {
  state: () => ({
    currentCar: {
      id: null,
      ownerId: null,
      basicInfo: {
        brand: null,
        model: null,
        year: null,
        type: null,
        color: null,
        licensePlate: null,
      },
      specifications: {
        engine: null,
        horsepower: null,
        transmission: null,
        drivetrain: null,
        fuelType: null,
        fuelEfficiency: null,
        passengerCapacity: null,
        trunkCapacity: null,
        currentMileage: null,
      },
      status: {
        current: "available", // Por defecto disponible
        currentLocation: {
          address: null,
          city: null,
          country: "Argentina",
          coordinates: null,
        },
        timesRented: 0, // Inicia en 0
      },
      features: {
        technology: [],
        safety: [],
        performance: [],
        comfort: [],
        restrictions: {
          minimumDriverAge: 18, // Valor por defecto
          requiresValidLicense: true,
          smokingAllowed: false,
          petsAllowed: false,
        },
        hasInsurance: false,
        insuranceDetails: null,
      },
      pricing: {
        rates: {
          daily: null,
          weekly: null,
          monthly: null,
        },
        mileagePolicy: {
          includedPerDay: 200, // Valor por defecto
          extraPricePerKm: 1000, // Valor por defecto
        },
        securityDeposit: null,
        cancellationPolicy: "flexible",
      },
      photos: [],
      insurance: {
        type: null,
        company: null,
        policyNumber: null,
        expirationDate: null,
        documentUrl: null,
      },
      availability: {
        schedule: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false,
        },
        blockedDates: [],
      }
    },
    loading: false,
    error: null,
  }),
  actions: {
    async initCar() {
      
    },
    async updateCar(cid, carData) {
      this.loading = true;
      try {
        const { basicInfo, specifications, features, pricing, insurance, availability } = carData;

        if(basicInfo) {
          await updateCar(cid, "basicInfo", basicInfo);
        }
        if(specifications) {
          await updateCar(cid, "specifications", specifications);
        }
        if(features) {
          await updateCar(cid, "features", features);
        }
        if(pricing) {
          await updateCar(cid, "pricing", pricing);
        }
        if(insurance) {
          await updateCar(cid, "insurance", insurance);
        }
        if(availability) {
          await updateCar(cid, "availability", availability);
        }
      } catch (error) {
        this.error = error;
      } finally {
        this.loading = false;
      }
    }
  },
  getters: {
    car: (state) => state.currentCar,
    basicInfo: (state) => state.currentCar?.basicInfo || {},
    specifications: (state) => state.currentCar?.specifications || {},
    status: (state) => state.currentCar?.status || {},
    features: (state) => state.currentCar?.features || {},
    pricing: (state) => state.currentCar?.pricing || {},
    photos: (state) => state.currentCar?.photos || [],
    insurance: (state) => state.currentCar?.insurance || {},
    availability: (state) => state.currentCar?.availability || {},
  }
});