import { collection, addDoc, Timestamp, doc, updateDoc, query, where, limit, onSnapshot } from "firebase/firestore";
import { db } from "../../services/firebase.js";

/**
 * @param {string} rentId - El ID del documento de la solicitud de alquiler.
 * @param {string} senderId - El ID del usuario que envía la solicitud.
 * @param {string} receiverId - El ID del propietario del vehículo (quien recibe la notificación).
 */

export async function createRentalRequestNotification(rentId, senderId, receiverId, customMessage = null, notificacionType = "rent_request"){
  try {
    const notificationData = {
      type: notificacionType,
      status: 'pending',
      rent_id: rentId,
      sender_id: senderId,
      receiver_id: receiverId,
      message: customMessage,
      created_at: Timestamp.now(),
      read: false,
    };
  
    const nofifyRef = collection(db, "notifications");
    const docRef = await addDoc(nofifyRef, notificationData)
  
    console.log("Notificacion de solicitud de alquiler enviada con id", docRef.id)
    console.log("Notificacion de solicitud de alquiler enviada con id", docRef.id, "para el receptor:", receiverId, "Datos completos:", notificationData)
    // aca poner funcion para enviar la solicitud al remitente de la alerta 

  } catch (error) {
    console.error('Error al crear la notificacion de la solicitud de alquiler', error);
  }
}

// Cambie el estado de las notificaciones para que esten leídas
export async function readNotification(userId, callback){
  if (!userId) {
    console.warn("[subscribeToUnreadNotifications] El userId es inválido.");
    if (typeof callback === 'function') {
      callback(false);
    }
    return () => {}; 
  }

  try {
    const notificationsCol = collection(db, 'notifications');
    const q = query(
      notificationsCol,
      where('receiver_id', '==', userId),
      where('read', '==', false), // Solo nos interesan las no leídas
      limit(1) // Solo necesitamos saber si existe al menos una
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const hasUnread = !querySnapshot.empty;
      if (typeof callback === 'function') {
        callback(hasUnread);
      }
    }, (error) => {
      console.error("Error en el listener de notificaciones no leídas (Firestore): ", error);
      if (typeof callback === 'function') {
        // Podrías pasar el error o simplemente asumir que no hay no leídas en caso de error
        callback(false);
      }
    });

    return unsubscribe;

  } catch (error) {
    console.error("Error al configurar el listener de notificaciones no leídas: ", error);
    if (typeof callback === 'function') {
      callback(false);
    }
    return () => {};
  }
}



export async function markNotificationAsRead(notificationId){
  try{
    const notificationRef = doc(db, 'notifications', notificationId);
    await updateDoc(notificationRef, { read: true });
  } catch(error) {
    console.error('Error al marcar la notificacion como leída', error);
    throw error;
  } 
}