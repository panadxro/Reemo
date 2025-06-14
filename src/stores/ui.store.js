// stores/ui.js
import { defineStore } from 'pinia';

export const useUiStore = defineStore('ui', {
  state: () => ({
    openDropdowns: {}, // { 'section-1': 'doc-identidad', 'section-3': 'tarjeta' }
    isTransitioning: false
  }),
  actions: {
    setOpenDropdown(sectionId, dropdownId) {
      if (this.isTransitioning) return;
      
      // Cierra todos los dropdowns en la misma sección
      if (this.openDropdowns[sectionId] === dropdownId) {
        delete this.openDropdowns[sectionId];
        return;
      }

      this.isTransitioning = true;
      this.openDropdowns[sectionId] = dropdownId;
      
      setTimeout(() => {
        this.isTransitioning = false;
      }, 300);
    },
    openInitialDropdown(sectionId, dropdownId) {
      if (!this.openDropdowns[sectionId]) {
        this.openDropdowns[sectionId] = dropdownId;
      }
    }
  }
});