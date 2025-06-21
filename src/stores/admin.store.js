import { defineStore } from 'pinia';
import { getUsers, updateUserRole, updateVerification } from '@/services/user';
import { getCars, updateCarValidation } from '@/services/car';

export const useAdminStore = defineStore('adminUser', {
  state: () => ({
    users: [],
    cars: [],
    loading: false,
    error: null,
  }),
  actions: {
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await getUsers();
        // console.log(this.users)
        this.error = null;
      } catch (error) {
        this.users = [];
        this.error = error.message || 'Error fetching users';
      } finally {
        this.loading = false;
      }
    },
    async fetchCars() {
      this.loading = true;
      try {
        // Primero obtén todos los usuarios
        await this.fetchUsers(); // Esto llenará this.users
        
        // Luego obtén los autos
        const cars = await getCars();
        
        // Ahora puedes mapear los owners desde this.users
        this.cars = cars.map(car => {
          const owner = this.users.find(user => user.id === car.ownerId);
          return { ...car, owner: owner || {} };
        });
        
        this.error = null;
      } catch (error) {
        this.cars = [];
        this.error = error.message || 'Error fetching cars';
      } finally {
        this.loading = false;
      }
    },
    async changeUserRole(userId, newRole) {
      try {
        const response = await updateUserRole(userId, newRole);
        if (response.success) {
          await this.fetchUsers();
        } else {
          this.error = response.message || 'Error updating user role';
        }
      } catch (error) {
        this.error = error.message || 'Error updating user role';
      }
    },
    async changeUserVerification(userId, newStatus) {
      try {
        const reponse = await updateVerification(userId, newStatus);
        if (reponse.success) {
          await this.fetchUsers();
        } else {
          this.error = reponse.message || 'Error updating user verification';
        }
      } catch (error) {
        this.error = error.message || 'Error updating user verification';
      }
    },
    async changeCarValidation(carId, newStatus) {
      try {
        const response = await updateCarValidation(carId, newStatus);
        if (response.success) {
          await this.fetchCars();
        } else {
          this.error = response.message || 'Error updating car validation';
        }
      } catch (error) {
        this.error = error.message || 'Error updating car validation';
      }
    }
  },
});