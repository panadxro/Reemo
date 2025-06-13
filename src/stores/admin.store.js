import { defineStore } from 'pinia';
import { getUsers, updateUserRole } from '@/services/user';
import { getCars } from '@/services/car';
import { useUserStore } from '@stores';
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
        console.log(this.users)
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
      const userStore = useUserStore();
      try {
        const cars = await getCars();

        const owners = await Promise.all(
          cars.map(async (car) => {
            const owner = await userStore.getUserById(car.ownerId);
            return { ...car, owner };
          })
        );

        this.cars = owners;
        console.log(this.cars)
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
  },
});