import { defineStore } from 'pinia';
import { getUsers, updateUserRole } from '@/services/user/admin';

export const useAdminStore = defineStore('adminUser', {
  state: () => ({
    users: [],
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