import { defineStore } from "pinia";
import { fetchUserNotification } from '@/services/rentedCarService';
import { markNotificationAsRead as markAsReadService, createRentalRequestNotification as createNotificationService } from '@/services/car/notifyRented';
import { updateRentalStatus as updateRentalStatusService } from '@/services/rentedCarService';
// Importa useAuthStore para reaccionar a cambios de autenticación directamente aca,
// aunque es común que el componente App.vue o un watcher global maneje esto.
import { requestForToken, onMessageListener } from "@/services/notification/notifications";
import { addAlert } from '@services/alerts';
import router from '@router/router';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    isLoading: false,
    error: null,
    hasLoadedOnce: false,
    _unsubscribeListener: null,
    _currentUserId: null,
    token: null,
    notification: null,
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
      const { rentId, newStatus, senderId, vehicleOwnerId, vehicleOwnerName, vehicleOwnerLastname, vehicleBrand, vehicleModel } = payload;
      try {
        await updateRentalStatusService(rentId, newStatus);

        const notif = this.notifications.find(n => n.rent_id === rentId && n.type === 'rent_request');
        if (notif && notif.rentDetails) {
          notif.rentDetails.status = newStatus;
        }

        const feedbackMessage = newStatus === 'confirmed'
          ? `El dueño ${vehicleOwnerName} ${vehicleOwnerLastname} aprobó tu alquiler del ${vehicleBrand} ${vehicleModel}.`
          : `El dueño ${vehicleOwnerName} ${vehicleOwnerLastname} no aprobó tu alquiler del ${vehicleBrand} ${vehicleModel}.`;

        const title = newStatus === 'confirmed'
          ? `✅ Tu solicitud fue aprobada`
          : `❌ Tu solicitud fue rechazada`;

        await createNotificationService(
          rentId,
          vehicleOwnerId,
          senderId,
          feedbackMessage,
          title,
          "rent_response",
        );
      } catch (error) {
        console.error('[NotificationStore] Error al manejar acción de alquiler:', error);
        throw error;
      }
    },
    async requestPermission() {
      try {
        this.token = await requestForToken();
        // Envía este token a tu backend para guardarlo
        return this.token
      } catch (error) {
        console.error('Error requesting notification permission:', error)
        throw error
      }
    },
    // setupMessageListener()
    setupMessageListener() {
      onMessageListener()
        .then((payload) => {
          this.notification = payload

          const notificationTitle = payload.notification?.title || 'Nueva notificación';
          addAlert(`${notificationTitle}`, 'info');

          this.showPushNotification(payload);

          if (payload.data) {
            this.notifications.unshift({
              id: payload.data.id,
              title: payload.data.title,
              body: payload.data.body,
              created_at: payload.data.created_at,
              read: false,
              type: payload.data.type,
              ...payload.data
            });
          }
          // Muestra la notificacion en primer plano
          console.log('Message received. ', payload)
        })
        .catch((err) => {
          console.log('Error en el listener de mensajes: ', err)
        })
    },
    showPushNotification(payload) {
      if (document.visibilityState === 'visible') {
        return;
      }

      if (!("Notification" in window)) {
        alert("Este navegador no soporta notificaciones.");
        return;
      }

      // Verifica si ya tenemos permiso
      if (Notification.permission === "granted") {
        this.createNotification(payload);
      } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then((permission) => {
          if (permission === "granted") {
            this.createNotification(payload);
          }
        });
      }
    },
    createNotification(payload) {
      const title = payload.notification?.title || "Nueva notificación";
      const options = {
        body: payload.notification?.body || "",
        icon: "/apple-icon-180.png",
        data: payload.data || {}
      };

      const notification = new Notification(title, options);

      notification.onclick = (event) => {
        event.preventDefault();
        window.focus();

        if (payload.data?.route) {
          router.push(payload.data.route);
        }

        if (payload.messageId) {
          this.markNotificationAsRead(payload.messageId);
        }

        notification.close();
      }
    }
  }
})