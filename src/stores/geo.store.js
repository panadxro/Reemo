import { defineStore } from 'pinia';
import { getProvinciasYLocalidades } from '@services/geo';

export const useGeoStore = defineStore('geo', {
  state: () => ({
    provinciasYLocalidades: [],
  }),
  getters: {
    provincias: (state) => {
      return state.provinciasYLocalidades.map(provincia => provincia.nombre)
    },
    getCiudadesPorProvincia: (state) => {
      return (provinciaNombre) => {
        const provincia = state.provinciasYLocalidades.find(p => p.nombre === provinciaNombre);
        return provincia ? provincia.localidades : [];
      };
    }
  },
  actions: {
    async loadProvinciasYLocalidades() {
      if (this.provinciasYLocalidades.length === 0) {
        this.provinciasYLocalidades = await getProvinciasYLocalidades();
      }
    },
  },
});