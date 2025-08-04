import { getToken, onMessage } from 'firebase/messaging';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { messaging } from '../firebase';
import { addAlert } from '@/services/alerts';

export const requestForToken = async () => {
  try {
    const currentToken = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_VAPID_KEY
    });
    if (currentToken) {
      console.log('current token for client: ', currentToken);
      // Guarda el token en tu backend/Pinia
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
    addAlert("Error al configurar notificaciones push", "error");
    return null;
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log("Mensaje recibido mientras la app está en primer plano", payload)

      // Mostrar alerta en la UI
      if (payload.notification) {
        addAlert(payload.notification.title, "info");
      }
      resolve(payload);
    });
  });

export const saveFCMToken = async (userId, token) => {
  try {
    await updateDoc(doc(db, 'users', userId), {
      fcmToken: token,
    });
  } catch (error) {
    console.error('Error guardando token FCM:', error);
    throw error; // Propaga el error para manejo superior
  }
}