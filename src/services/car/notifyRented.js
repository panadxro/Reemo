import { db } from "../../services/firebase.js";
import { collection, addDoc, Timestamp, doc, updateDoc, query, where, limit, onSnapshot } from "firebase/firestore";
import { getAdminUser } from "../user/admin.js";

/**
 * @param {string} rentId - El ID del documento de la solicitud de alquiler.
 * @param {string} senderId - El ID del usuario que envía la solicitud.
 * @param {string} receiverId - El ID del propietario del vehículo (quien recibe la notificación).
 */

export async function createRentalRequestNotification(rentId, senderId, receiverId, customMessage = null, title = null, notificacionType = "rent_request"){
  try {
    const notificationData = {
      type: notificacionType,
      status: 'pending',
      rent_id: rentId,
      sender_id: senderId,
      receiver_id: receiverId,
      title: title,
      message: customMessage,
      created_at: Timestamp.now(),
      read: false,
    };
  
    const nofifyRef = collection(db, "notifications");
    const docRef = await addDoc(nofifyRef, notificationData)
  
    // console.log("Notificacion de solicitud de alquiler enviada con id", docRef.id)
    // console.log("Notificacion de solicitud de alquiler enviada con id", docRef.id, "para el receptor:", receiverId, "Datos completos:", notificationData)

  } catch (error) {
    console.error('Error al crear la notificacion de la solicitud de alquiler', error);
  }
}

const carValidationStatusNotification = (car, newStatus, message = null) => {
  // Generar el contenido de la notificación, ahora pasando el motivo.
  // Asumimos que tienes un archivo de templates como en la sugerencia anterior.
  // Si no, puedes construir el mensaje aquí mismo.
  const title = newStatus === 'validated' ? '¡Tu vehículo ha sido validado!' : 'Se requiere una acción para tu vehículo';
  const link = newStatus == 'validated'
    ? `/car/${car.id}`
    : `/car/edit/${car.id}`
  const reason = newStatus === 'validated'
    ? `Buenas noticias. Tu ${car.basicInfo.brand} ${car.basicInfo.model} fue aprobado y ya está visible para alquilar.`
    : `Tu ${car.basicInfo.brand} ${car.basicInfo.model} fue marcado como no validado por el siguiente motivo: "${message}". Por favor, corrige el problema y vuelve a solicitar la validación.`;

  if (newStatus === 'validated') {
    return {
      title: title,
      message: reason,
      type: 'car_validated',
      link: link, // Enlace a la página de detalles del auto
    };
  } else { // 'not-validated'
    return {
      title: title,
      // message: `Tu ${car.basicInfo.brand} ${car.basicInfo.model} fue marcado como no validado. Por favor, revisa los detalles o contacta a soporte para más información.`,
      message: reason,
      type: 'car_invalidated',
      link: link // Enlace a la página de detalles del auto
    };
  }
};

/**
 * Crea una notificación para el dueño de un vehículo cuando su estado de validación cambia.
 * @param {object} car - El objeto completo del vehículo.
 * @param {string} newStatus - El nuevo estado de validación ('validated' o 'not-validated').
 */
export const createCarValidationNotification = async (car, newStatus, message = null) => {
  if (!car || !car.ownerId) {
    console.error("No se puede crear la notificación: faltan datos del coche o del propietario.");
    return;
  }

  // 1. Generar el contenido de la notificación usando el template
  const notificationContent = carValidationStatusNotification(car, newStatus, message);

  // 2. Guardar la notificación en la base de datos
  try {
    await addDoc(collection(db, 'notifications'), {
      ...notificationContent,
      receiver_id: car.ownerId,
      read: false,
      created_at: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error al crear la notificación de validación:", error);
    throw error;
  }
};


/**
 * Notifica a todos los administradores que un vehículo ha sido actualizado y requiere revisión.
 * @param {object} updatedCar - El objeto del vehículo que fue actualizado.
 * @param {object} owner - El objeto del usuario propietario del vehículo.
 */

export const notifyAdminsOfVehicleUpdate = async (updatedCar, owner) => {
  if (!updatedCar || !owner) {
    console.error("Datos insuficientes para crear la notificación de actualización de vehículo.");
    return;
  }

  try {
    const admins = await getAdminUser();
    if (!admins || admins.length === 0) {
      console.warn("No se encontraron administradores para notificar.");
      return;
    }

    const ownerName = `${owner.personalInfo?.firstName || ''} ${owner.personalInfo?.lastName || ''}`.trim() || 'un usuario';
    const notificationContent = {
      title: 'Vehículo actualizado para revisión',
      message: `El vehículo ${updatedCar.basicInfo.brand} ${updatedCar.basicInfo.model} de ${ownerName} ha sido actualizado y requiere validación nuevamente.`,
      type: 'car_updated_for_review',
      link: `/admin/cars`, // Enlace a la página de detalles del auto para que el admin lo revise
      read: false,
      created_at: Timestamp.now(),
    };
    // link: `/admin/${updatedCar.id}`, // Enlace a la página de detalles del auto para que el admin lo revise

    const promises = admins.map(admin => addDoc(collection(db, 'notifications'), {...notificationContent, receiver_id: admin.id}));
    await Promise.all(promises);
  } catch (error) {
    console.error("Error al crear notificaciones de revisión para administradores:", error);
    // No relanzamos el error para no bloquear el flujo del usuario, pero lo registramos.
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