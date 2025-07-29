import { defineStore } from "pinia";
import { fetchUserNotification } from '@/services/rentedCarService';
import { markNotificationAsRead as markAsReadService, createRentalRequestNotification as createNotificationService } from '@/services/car/notifyRented';
import { updateRentalStatus as updateRentalStatusService } from '@/services/rentedCarService';
// Importa useAuthStore para reaccionar a cambios de autenticación directamente aca,
// aunque es común que el componente App.vue o un watcher global maneje esto.

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    isLoading: false,
    error: null,
    hasLoadedOnce: false,
    _unsubscribeListener: null,
    _currentUserId: null,
  }),

  getters: {
    unreadCount: (state) => state.notifications.filter(n => !n.read && n.status !== 'read').length,
    sortedNotifications: (state) => {
      return [...state.notifications].sort((a, b) => {
        const dateA = a.created_at?.second || 0;
        const dateB = b.created_at?.second || 0;
        return dateB - dateA;
      });
    },
  },

  actions: {
    /**
     * Inicia el listener para las notificaciones del usuario.
     * Solo crea un nuevo listener si no existe uno para el usuario actual o si se fuerza.
    **/
    async initListenerForUser(userId){
      if(!userId){
        this.clearListerAndData();
        console.warn('[NotificationStore] No se proporcionó userId para iniciar el listener.');
        return;
      }

      if (this._currentUserId === userId && this._unsubscribeListener && this.hasLoadedOnce) {
        console.log(`[NotificationStore] El listener ya está activo para el usuario: ${userId}`);
        this.isLoading = false;
        return
      }

      // Si el listener es para un usuario DIFERENTE, limpiar el anterior.
      if(this._currentUserId && this._currentUserId !== userId && this._unsubscribeListener) {
        this.clearListerAndData();
      }

      // console.log(`[NotificationStore] Iniciando listener para el usuario: ${userId}`);
      this.isLoading = true;
      this.error = null;
      this._currentUserId = userId;

      try {
        if(this._unsubscribeListener){
          this._unsubscribeListener();
          this._unsubscribeListener = null;
        }

        this._unsubscribeListener = fetchUserNotification(
          userId,
          (updateNotifications, err) => {
            if (err) {
              this.error = `Error al recibir actualizaciones de notificaciones: ${err}`;
              this.isLoading = false;
              return;
            } else {
              this.notifications = updateNotifications;
              this.error = null;
            }
            this.isLoading = false;
            this.hasLoadedOnce = true;
          }
        );

      } catch (error) {
        this.error = 'Falló al inicializar el listener de notificaciones.';
        this.isLoading = false;
        this.hasLoadedOnce = true;
        console.error('[NotificationStore] Error configurando el listener de fetchUserNotification', error);
        return;
      }
    },

    /**
     * Limpia los datos de notificaciones y detiene el listener.
     * Típicamente llamado al cerrar sesión.
     */

    clearListenerAndData() {
      if (this._unsubscribeListener) {
        console.log(`[NotificationStore] Deteniendo listener para el usuario: ${this._currentUserId}`);
        this._unsubscribeListener();
        this._unsubscribeListener = null
      }
      this.notifications = [];
      this.isLoading = false;
      this.error = null;
      this.hasLoadedOnce = false;
      this._currentUserId = null;
    },

    async markNotificationAsRead(notificationId) {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification && !notification.read) {
        notification.read = true; // O actualiza el campo 'status' si es lo que usas
      }
      try {
        await markAsReadService(notificationId);
      } catch (error) {
        console.error('[NotificationStore] Error al marcar notificación como leída:', error);
        if (notification) notification.read = false;
        throw error;
      }
    },

    async handleRentalAction(payload) {
      const { rentId, newStatus, senderId, vehicleOwnerId } = payload;
      try {
        await updateRentalStatusService(rentId, newStatus);

        // Opcional: Actualización optimista del estado en la notificación local
        const notif = this.notifications.find(n => n.rent_id === rentId && n.type === 'rent_request');
        if (notif && notif.rentDetails) {
          notif.rentDetails.status = newStatus;
          // Considera marcar esta notificación como leída/procesada si es una acción final
          // await this.markNotificationAsRead(notif.id);
        }

        const feedbackMessage = newStatus === 'confirmed'
          ? `Tu solicitud de alquiler ha sido aceptada.`
          : `Tu solicitud de alquiler ha sido rechazada.`;

        const title = newStatus === 'confirmed'
          ? `Tu solicitud de alquiler ha sido aceptada.`
          : `Tu solicitud de alquiler ha sido rechazada.`;

        await createNotificationService(
          rentId,
          vehicleOwnerId, // El dueño del vehículo es el sender de la respuesta
          senderId,       // El solicitante original es el receiver de la respuesta
          feedbackMessage,
          title,
          "rent_response" // Tipo de notificación de respuesta
        );
      } catch (error) {
        console.error('[NotificationStore] Error al manejar acción de alquiler:', error);
        throw error;
      }
    },

    // getDefaultTitle(notification) {
    //   if (notification.title === 'rent_request') return '📩 Nueva solicitud de alquiler';
    //   if (notification.title === 'rent_response') return 'Respuesta a tu solicitud';
    //   if (notification.title === 'car_validated') return 'Vehículo validado';
    //   if (notification.title === 'car_invalidated') return 'Vehículo rechazado';
    //   if (notification.title === 'car_updated_for_review') return 'Vehículo para revisión';
    //   return 'Nueva notificación';
    // }

  }
})
