import { getToken, onMessage } from 'firebase/messaging';
import { messaging } from '../firebase';

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
    console.log('An error occurred while retrieving token. ', err);
    return null;
  }
}

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });