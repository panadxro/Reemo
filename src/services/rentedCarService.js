import { collection,getDocs, query, where, doc, getDoc, addDoc, updateDoc, onSnapshot, orderBy, increment } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { createRentalRequestNotification } from "../services/car/notifyRented.js";
import { addAlert } from './alerts.js'


// =================================================================================================
// I. Core Rental Lifecycle & Status Management
// =================================================================================================

/**
 * Envía una nueva solicitud de alquiler a la base de datos y notifica al propietario.
 * @param {object} rentalRequest - Objeto con los detalles de la solicitud de alquiler.
*/
export async function submitRentalRequest(rentalRequest) {
    try {
      const initialRentalData = {
        ...rentalRequest,
        timestamp: new Date(),
      }

      const rentalRequestRef = await addDoc(collection(db, 'rents'), initialRentalData);
      console.log('Solicitud de alquiler enviada con ID:', rentalRequestRef.id);

      await updateDoc(rentalRequestRef, { order_id: rentalRequestRef.id });

      // 2. Obtener datos en paralelo
      const [vehicleDoc, driverDoc] = await Promise.all([
        getDoc(doc(db, 'cars', rentalRequest.vehicle_id)),
        getDoc(doc(db, 'users', rentalRequest.driver_id))
      ]);

      // 3. Validar documentos
      if (!vehicleDoc?.exists() || !driverDoc?.exists()) {
        const missing = !vehicleDoc?.exists() ? 'vehículo' : 'conductor';
        throw new Error(`No se pudo encontrar la información del ${missing}.`);
      }

      const vehicleData = vehicleDoc.data();
      const driverData = driverDoc.data();

      // 4. Preparar mensaje
      const rentMessage = rentalRequest.status === 'pending' 
        ? `${driverData.personalInfo.firstName} quiere alquilar tu ${vehicleData.basicInfo.brand} ${vehicleData.basicInfo.model}. Revisá la solicitud y aprobala si estás de acuerdo.`
        : `El dueño del ${vehicleData.basicInfo.brand} ${vehicleData.basicInfo.model} no aprobó tu solicitud. Probá con otro vehículo disponible en la zona.`;

      const title = rentalRequest.status === 'pending' 
        ? `📩 Nueva solicitud de alquiler`
        : `❌ Tu solicitud fue rechazada`;

      // 5. Crear notificación con fotos
      await createRentalRequestNotification(
        rentalRequestRef.id, 
        rentalRequest.driver_id,
        rentalRequest.owner_id,
        rentMessage,
        title,
        "rent_request",
        vehicleData.photos[0],  
        driverData.personalInfo.profilePhoto  
      );

      addAlert("Solicitud de alquiler enviada correctamente", "success");
      return rentalRequestRef.id;

    } catch (error) {
      console.error('Error al enviar la solicitud de alquiler:', error);
      addAlert("Error al enviar la solicitud de alquiler", "error");
      throw error;
    }
  }

/**
 * Actualiza el estado de una solicitud de alquiler y la disponibilidad del vehículo asociado.
 * @param {string} reqId - ID de la solicitud de alquiler.
 * @param {string} newStatus - Nuevo estado para la solicitud.
 */
export async function updateRentalStatus(reqId, newStatus) {
  const PLATFORM_COMMISSION_RATE = 0.15;
  try {
    const requestRef = doc(db, 'rents', reqId);
    const requestSnap = await getDoc(requestRef);

    // ¡Esta es la corrección!
    // Verificamos si el alquiler ya está completado para evitar ejecuciones duplicadas.
    if (requestSnap.data().status === 'completed') {
      console.log(`El alquiler ${reqId} ya está completado. No se realizarán más acciones.`);
      return;
    }

    const rentalData = requestSnap.data();
    const carId = rentalData.vehicle_id;
    if(!carId){
      console.error(`Error: vehicle_id no encontrado en la solicitud ${reqId}`);
      throw new Error(`vehicle_id no encontrado en la solicitud de alquiler ${reqId}.`);
    }
    
      // Actualizar la disponibilidad del auto
      if(carId){
        const carRef = doc(db, 'cars', carId);
        if(newStatus === 'confirmed' || newStatus === 'in_progress' || newStatus === 'returned_by_driver'){
          await updateDoc(carRef, { "status.current" : "not-available" });
        } else if (newStatus === 'completed') {
          await updateDoc(carRef, { "status.current" : "available" });

          if (rentalData.total_price && rentalData.owner_id){
            const earnings = rentalData.total_price * (1 - PLATFORM_COMMISSION_RATE);
            await updateDoc(requestRef, { earnings: earnings });

            const ownerRef = doc(db, 'users', rentalData.owner_id);
            await updateDoc(ownerRef, {
              "personalInfo.totalEarnings": increment(earnings)
            });
          }
        } else if (['rejected', 'cancelled_by_user', 'cancelled_by_owner', 'expired'].includes(newStatus)) {
          await updateDoc(carRef, { "status.current": "available" });
        }
          
      }

      await updateDoc(requestRef, { status: newStatus });

      const statusMessages = {
        'confirmed': 'Alquiler confirmado exitosamente',
        'rejected': 'Alquiler rechazado',
        'completed': 'Alquiler completado exitosamente',
        'cancelled_by_user': 'Alquiler cancelado por el usuario',
        'cancelled_by_owner': 'Alquiler cancelado por el propietario',
      };

      if (statusMessages[newStatus]) {
        addAlert(statusMessages[newStatus], newStatus === 'rejected' ? 'warning' : 'info');
      }
      console.log(`Se actualizó el estado de la solicitud ${newStatus}. Disponibilidad del auto ${carId} actualizada si corresponde.`);
      

  } catch (error) {
    console.error("Error al actualizar el estado de la solicitud", error);
    addAlert("Error al actualizar el estado del alquiler", "error");
    throw error;
  }
}

/**
 * Marca un alquiler como 'in_progress'. (Considerar si se va a añadir timestamp de recogida).
 * @param {string} rentalId - ID del alquiler.
 */
export async function markRentalAsPickedUp(rentalId) {
  const rentalRef = doc(db, 'rents', rentalId);
  await updateDoc(rentalRef, {
    status: 'in_progress',
    // pickup_timestamp: Timestamp.now()
  });
}

/**
 * Verifica si un vehículo específico ya tiene un alquiler activo ('confirmed' o 'in_progress').
 * @param {string} carId - ID del vehículo.
 * @returns {Promise<boolean>} - True si el auto está alquilado, false en caso contrario.
 */
export async function isCarAlreadyRented(carId) {
  const rentalQuery = query(
    collection(db, 'rents'), 
      where('vehicle_id', '==', carId),
      where('status', 'in', ['confirmed', 'in_progress'])
    );

  const rentalQuerySnapshot = await getDocs(rentalQuery);
  return !rentalQuerySnapshot.empty;

   // TODO: Añadir lógica para comprobar solapamiento de fechas, no solo si existe una solicitud.
}




// =================================================================================================
// II. Fetching & Subscribing to Rental Data
// =================================================================================================


/**
 * Se suscribe a los cambios en tiempo real de un documento de alquiler específico
 * y enriquece los datos con detalles del vehículo, propietario y conductor.
 * @param {string} rentalId - El ID del documento de alquiler.
 * @param {function} callback - Función a llamar con los detalles del alquiler actualizados y/o errores.
 * @returns {function} - Función para desuscribirse del listener de Firestore.
 */
export function subscribeToRentalDetails(rentalId, callback) {
  if (!rentalId) {
    console.warn("[subscribeToRentalDetails] rentalId no proporcionado.");
    if (typeof callback === 'function') callback(null, "ID de alquiler no proporcionado.");
    return () => {};
  }

  const rentalRef = doc(db, 'rents', rentalId);

  const unsubscribe = onSnapshot(rentalRef, async (docSnap) => {
    if (docSnap.exists()) {
      const data = { id: docSnap.id, ...docSnap.data() };
      let enrichedData = { ...data };

      try {
        if (data.vehicle_id && (!data.vehicleData || typeof data.vehicleData !== 'object')) {
          const vehicleSnap = await getDoc(doc(db, 'cars', data.vehicle_id));
          if (vehicleSnap.exists()) enrichedData.vehicleData = { id: vehicleSnap.id, ...vehicleSnap.data() };
        }

        if (data.owner_id && (!data.ownerData || typeof data.ownerData !== 'object')) {
          const ownerSnap = await getDoc(doc(db, 'users', data.owner_id));
          if (ownerSnap.exists()) {
            const uData = ownerSnap.data();
            enrichedData.ownerData = { id: ownerSnap.id, name: uData.personalInfo?.firstName , photoURL: uData.personalInfo?.profilePhoto, lastname: uData.personalInfo?.lastName, username: uData.personalInfo?.username || uData.email  };
          }
        }

        if (data.driver_id && (!data.driverData || typeof data.driverData !== 'object')) {
          const driverSnap = await getDoc(doc(db, 'users', data.driver_id));
          if (driverSnap.exists()) {
            const uData = driverSnap.data();
            enrichedData.driverData = { id: driverSnap.id, name: uData.personalInfo?.firstName, lastname: uData.personalInfo?.lastName, photoURL: uData.personalInfo?.profilePhoto, username: uData.personalInfo?.username || uData.email };
          }
        }
        if (typeof callback === 'function') callback(enrichedData, null);
      } catch (enrichError) {
        console.error("Error al enriquecer detalles del alquiler:", enrichError);
        if (typeof callback === 'function') callback(data, "Error al enriquecer datos."); // Devolver datos básicos si falla el enriquecimiento
      }
    } else {
      if (typeof callback === 'function') callback(null, "No se encontraron detalles para este alquiler.");
    }
  }, (error) => {
    console.error("Error en listener de onSnapshot para el alquiler:", error);
    if (typeof callback === 'function') callback(null, "Ocurrió un error al escuchar los cambios del alquiler.");
  });

  return unsubscribe;
}


// Lógica para enriquecer los datos del alquiler (probablemente ya la tienes en tus funciones fetch)
async function enrichRentalData(rentalData) {
  if (!rentalData) return null;
  
  // Usamos Promise.all para obtener los detalles en paralelo
  const [vehicleDoc, ownerDoc, driverDoc] = await Promise.all([
    rentalData.vehicle_id ? getDoc(doc(db, 'cars', rentalData.vehicle_id)) : Promise.resolve(null),
    rentalData.owner_id ? getDoc(doc(db, 'users', rentalData.owner_id)) : Promise.resolve(null),
    rentalData.driver_id ? getDoc(doc(db, 'users', rentalData.driver_id)) : Promise.resolve(null)
  ]);

  
  const ownerData = ownerDoc.data();
  const driverData = driverDoc.data();
  // console.log('Datos del conductor: ', ownerData?.personalInfo.profilePhoto)
  
  return {
    ...rentalData,
    vehicleDetails: vehicleDoc?.exists() ? { id: vehicleDoc.id, ...vehicleDoc.data() } : null,
    ownerDetails: ownerDoc?.exists() ? { 
      id: ownerDoc.id, 
      name: ownerData.personalInfo?.username || ownerData.email || 'Conductor Desconocido',
      photoURL: ownerData.personalInfo?.profilePhoto || null,
      ...ownerDoc.data() } : null,
      
    driverDetails: driverDoc?.exists() ? {
      id: driverDoc.id,
      name: driverData.personalInfo?.username || driverData.email || 'Conductor Desconocido',
      photoURL: driverData.personalInfo?.profilePhoto || null,
      ...driverDoc.data() } : null,
  };
}

/**
 * Obtiene el último alquiler activo o pendiente del usuario como conductor.
 * @param {string} userId - ID del usuario (conductor).
 * @returns {Promise<Array<object>>} - Un array con el último alquiler enriquecido, o un array vacío si no hay.
 */
export async function fetchRentedCars(userId, callback) {
 const q = query(
    collection(db, 'rents'),
    where('driver_id', '==', userId),
    where('status', 'in', ['pending', 'confirmed', 'in_progress', "returned_by_driver"]),
    orderBy('start_time', 'desc'),
  );

  const unsubscribe = onSnapshot(q, async (snapshot) => {
    if (snapshot.empty) {
      callback(null, null);
      return;
    }
    
    const rentalDoc = snapshot.docs[0];
    const rentalData = { id: rentalDoc.id, ...rentalDoc.data() };
    const detailedRental = await enrichRentalData(rentalData);

    callback(detailedRental, null);

  }, (error) => {
    console.error("Error en el listener de RentedCars: ", error);
    c(null, error);
  });

  return unsubscribe; 
}

/**
 * Vista del Propietario:
 * Obtiene el ultimo alquiler activo o pendiente de un vehículo propiedad del usuario.
 * @param {string} ownerId - ID del usuario (propietario).
 * @returns {Promise<object|null>} - El ultimo alquiler enriquecido, o null si no hay.
 */

export async function fetchLatestActiveOwnedRental(ownerId, callback){
  // try {
    const rentsCollection = collection(db, "rents");
    const q = query(
      rentsCollection,
      where("owner_id", "==", ownerId),
      where("status", "in", ["pending", "confirmed", "in_progress", "returned_by_driver"]),
      orderBy("timestamp", "desc"),
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (snapshot.empty) {
        callback(null, null)
        return;
      };

      const rentalDoc = snapshot.docs[0];
      const rentalData = { id: rentalDoc.id, ...rentalDoc.data() };
      const detailedRental = await enrichRentalData(rentalData);

      callback(detailedRental, null)
    }, (error) => {
      console.error('Error en el listener de Owned Rentals', error)
      callback(null, error)
    });
    return unsubscribe;

}


/**
 * Vista del Propietario
 * Se suscribe a las solicitudes de alquiler ('pending' o 'confirmed') para los vehículos de un propietario.
 * @param {string} userId - ID del usuario (propietario).
 * @param {function} callback - Función a llamar con la lista de solicitudes de alquiler actualizadas.
 * @returns {function} - Función para desuscribirse del listener de Firestore.
 */
export async function fetchRentalRequests(userId, callback) {
  try {
    if (!userId) {
      console.warn("El userId es inválido o no está definido");
      return () => {};
    }

    const rentsCollection = collection(db, 'rents');
    const q = query(
      rentsCollection,
      where("owner_id", "==", userId),
      where("status", "in", ["pending", "confirmed", "in_progress"]) // Solo cargar solicitudes pendientes o aceptadas
    );
    
    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const rentalRequests = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const request = { id: docSnap.id, ...docSnap.data() };

            // Verificar si la fecha de devolución ha pasado
            const rentedUntil = new Date(request.end_time);
            const currentDate = new Date();

            // Lógica para pasar a 'completed' si la fecha de finalización ha pasado
            // y el estado actual es uno que precede a la finalización.
            if (rentedUntil < currentDate && 
                (request.status === "confirmed" || request.status === "in_progress")) {
              await updateRentalStatus(request.id, "completed");
              request.status = "completed";
            }

            // Obtener datos del usuario que solicita el alquiler
            const userRef = doc(db, 'users', request.driver_id);
            const userSnap = await getDoc(userRef);

            // Obtener datos del auto
            let carData = null;
            let carSnapId = null;
            if (request.vehicle_id) {
              const carRef = doc(db, 'cars', request.vehicle_id);
              const carSnap = await getDoc(carRef);
              if (carSnap.exists()) {
                carData = carSnap.data();
                carSnapId = carSnap.id;
              }
            }

            const userData = userSnap.exists() ? userSnap.data() : null;
            return {
              ...request,
              photoURL: userData?.photoURL || null,
              name: userData?.name || 'Usuario Desconocido',
              carMarca: carData?.basicInfo.brand || "Marca Desconocida",
              carModelo: carData?.basicInfo.model || "Modelo Desconocido",
              carId: carSnapId,
            };
            
          })
        );

        callback(rentalRequests);
      } catch (error) {
        console.error("Error al obtener las solicitudes de alquiler:", error);
        callback([]);
      }
    });

    // Retornar la función para desuscribirse
    return unsubscribe;
  } catch (error) {
    console.error("Error al obtener las solicitudes de alquiler:", error);
    return () => {};
  }
}


/**
 * Obtiene el historial de alquileres donde el usuario es el conductor
 * @param {string} userId - ID del usuario (conductor)
 * @returns {Promise<Array<object>>} - Array con los alquileres enriquecidos
 */
export async function fetchUserRentalHistory(userId) {
  try {
    const rentsCollection = collection(db, "rents");
    
    const driverQuery = query(
      rentsCollection,
      where("driver_id", "==", userId),
      where("status", "in", ["completed"]),
      orderBy("start_time", "desc")
    );

    const driverSnapshot = await getDocs(driverQuery);

    const applicationsData = [];
    const seenIds = new Set();

    driverSnapshot.docs.forEach((doc) => {
      if (!seenIds.has(doc.id)) {
        applicationsData.push({ id: doc.id, ...doc.data() });
        seenIds.add(doc.id);
      }
    });

    if (applicationsData.length === 0) {
      return [];
    }

    // Enriquecer con detalles del vehículo
    const carsData = await Promise.all(
      applicationsData.map(async (app) => {
        if (!app.vehicle_id) {
          console.warn(`Solicitud ${app.id} no tiene vehicle_id.`);
          return { ...app, vehicleDetails: null, ownerDetails: null, driverDetails: null };
        }

        const carRef = doc(db, "cars", app.vehicle_id);
        const carSnap = await getDoc(carRef);
        const vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;

        let ownerDetails = null;
        let driverDetails = null;

        if (app.owner_id) {
          const ownerRef = doc(db, "users", app.owner_id);
          const ownerSnap = await getDoc(ownerRef);
          ownerDetails = ownerSnap.exists() ? { 
            id: ownerSnap.id, 
            name: ownerSnap.data().personalInfo?.firstName || 'Sin nombre',
            lastname: ownerSnap.data().personalInfo?.lastName || '',
            profilePhoto: ownerSnap.data().personalInfo?.profilePhoto || null
          } : null;
        }

        if (app.driver_id) {
          const driverRef = doc(db, "users", app.driver_id);
          const driverSnap = await getDoc(driverRef);
          driverDetails = driverSnap.exists() ? { 
            id: driverSnap.id,
            name: driverSnap.data().personalInfo?.firstName || 'Sin nombre',
            lastname: driverSnap.data().personalInfo?.lastName || '',
            profilePhoto: driverSnap.data().personalInfo?.profilePhoto || null
          } : null;
        }

        return { ...app, vehicleDetails, ownerDetails, driverDetails };
      })
    );

    return carsData;
  } catch (error) {
    console.error("Error al obtener las solicitudes de alquiler del conductor:", error);
    throw error;
  }
}

/**
 * Obtiene el historial de vehículos del usuario que han sido rentados por otros
 * @param {string} userId - ID del usuario (propietario)
 * @returns {Promise<Array<object>>} - Array con los alquileres enriquecidos
 */
export async function fetchUserRentedOutHistory(userId) {
  try {
    if (!userId || typeof userId !== 'string') {
      console.error("ID de usuario inválido:", userId);
      return [];
    }

    const rentsCollection = collection(db, "rents");
    
    const ownerQuery = query(
      rentsCollection,
      where("owner_id", "==", userId),
      where("status", "in", ["completed", "in_progress"]),
      orderBy("start_time", "desc")
    );

    const ownerSnapshot = await getDocs(ownerQuery);

    if (ownerSnapshot.empty) {
      console.log("No se encontraron vehículos rentados por otros");
      return [];
    }

    const enrichedRentals = await Promise.all(
      ownerSnapshot.docs.map(async (document) => {
        try {
          const rentalData = { id: document.id, ...document.data() };
          
          // Vehicle details
          let vehicleDetails = null;
          if (rentalData.vehicle_id) {
            const carRef = doc(db, 'cars', rentalData.vehicle_id);
            const carSnap = await getDoc(carRef);
            vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;
          }

          // Driver details
          let driverDetails = null;
          if (rentalData.driver_id) {
            const driverRef = doc(db, 'users', rentalData.driver_id);
            const driverSnap = await getDoc(driverRef);
            if (driverSnap.exists()) {
              const dData = driverSnap.data();
              driverDetails = {
                id: driverSnap.id,
                name: dData.personalInfo?.firstName || dData.personalInfo?.name || dData.personalInfo?.username || dData.email.split('@')[0],
                lastname: dData.personalInfo?.lastName || dData.personalInfo?.lastname || '',
                photoURL: dData.personalInfo?.profilePhoto || dData.personalInfo?.photoURL || null,
                firstName: dData.personalInfo?.firstName || dData.personalInfo?.name,
                lastName: dData.personalInfo?.lastName || dData.personalInfo?.lastname,
                profilePhoto: dData.personalInfo?.profilePhoto || dData.personalInfo?.photoURL
              };
            }
          }

          let ownerDetails = null;
          if (rentalData.owner_id) {
            if (rentalData.owner_id === userId) {
              ownerDetails = {
                id: userId,
                name: "Tú",
                lastname: "",
                photoURL: null,
                firstName: "Tú",
                lastName: "",
                profilePhoto: null
              };
            } else {
              const ownerRef = doc(db, 'users', rentalData.owner_id);
              const ownerSnap = await getDoc(ownerRef);
              if (ownerSnap.exists()) {
                const oData = ownerSnap.data();
                ownerDetails = {
                  id: ownerSnap.id,
                  name: oData.personalInfo?.firstName || oData.personalInfo?.name || oData.personalInfo?.username || oData.email.split('@')[0],
                  lastname: oData.personalInfo?.lastName || oData.personalInfo?.lastname || '',
                  photoURL: oData.personalInfo?.profilePhoto || oData.personalInfo?.photoURL || null,
                  firstName: oData.personalInfo?.firstName || oData.personalInfo?.name,
                  lastName: oData.personalInfo?.lastName || oData.personalInfo?.lastname,
                  profilePhoto: oData.personalInfo?.profilePhoto || oData.personalInfo?.photoURL
                };
              }
            }
          }

          return {
            ...rentalData,
            vehicleDetails,
            driverDetails,
            ownerDetails,
            isRentedOut: true
          };
        } catch (error) {
          console.error(`Error procesando documento ${document.id}:`, error);
          return null;
        }
      })
    );

    return enrichedRentals.filter(rental => rental !== null);
  } catch (error) {
    console.error("Error al obtener el historial de vehículos rentados por otros:", error);
    throw error;
  }
}

/**
 * Vista del Conductor: 
 * Se suscribe a las notificaciones de un usuario en tiempo real y las enriquece con detalles.
 * (Nota: Esta función parece estar duplicada o ser muy similar a la de notificationService.js. Considerar unificar.)
 * @param {string} userId - El ID del usuario para el cual obtener las notificaciones.
 * @param {function} callback - Función a llamar con las notificaciones actualizadas y/o errores.
 * @returns {function} - Función para desuscribirse del listener de Firestore.
 */
export function fetchUserNotification(userId, callback){
  if(!userId){
    console.warn("[fetchUserNotification] El userId es inválido o no está definido. Retornando array vacío.");
    if (typeof callback === 'function') {
      callback ([]);
    }
    return () => {};
  }

  try {
    const notificationsCol = collection(db, 'notifications');
    // filtramos por receiver_id y ordenamos por fecha de creacion
    const q = query(
      notificationsCol, 
      where('receiver_id', '==', userId),
      orderBy('created_at', 'desc')
    );

    const unsubscribe = onSnapshot(q, async (querySnapshot) => {
      const changes = querySnapshot.docChanges();

      // Verificar si hay cambiois nuevos (notificaciones añadidas)
      const newNotifications = changes
        .filter(change => change.type === 'added')
        .map(change => ({ id: change.doc.id, ...change.doc.data() }));

      // Mostrar alerta para cada nueva notificación
      newNotifications.forEach(notification => {
        if (!notification.read) {
          addAlert(notification.message || notification.title, "info")
        }
      });

      const rawNotifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
     
      if (rawNotifications.length === 0) {
        if (typeof callback === 'function') {
          callback([]);
        }
        return;
      }

      // 1. Recopilar todos los IDs necesarios
      const senderIds = new Set();
      const rentIds = new Set();
      rawNotifications.forEach(n => {
        if (n.sender_id) senderIds.add(n.sender_id);
        if ((n.type === 'rent_request' || n.type === 'rent_response') && n.rent_id) {
          rentIds.add(n.rent_id);
        }
      });

      // 2. Obtener todos los datos de remitentes y rentas en paralelo
      const [sendersSnapshots, rentsSnapshots] = await Promise.all([
        Promise.all(Array.from(senderIds).map(id => getDoc(doc(db, 'users', id)))),
        Promise.all(Array.from(rentIds).map(id => getDoc(doc(db, 'rents', id))))
      ]);

      const sendersMap = new Map();
      sendersSnapshots.forEach(snap => {
        if (snap.exists()) {
          const senderData = snap.data();
          sendersMap.set(snap.id, {
            id: snap.id,
            name: senderData.personalInfo?.username || senderData.email,
            photoURL: senderData.personalInfo?.profilePhoto || null
          });
        }
      });

      const rentsMap = new Map();
      const vehicleIdsFromRents = new Set();
      rentsSnapshots.forEach(snap => {
        if (snap.exists()) {
          const rentData = { id: snap.id, ...snap.data() };
          rentsMap.set(snap.id, rentData);
          if (rentData.vehicle_id) {
            vehicleIdsFromRents.add(rentData.vehicle_id);
          }
        }
      });

      // 3. Obtener detalles de vehículos si hay alguno
      let vehiclesMap = new Map();
      if (vehicleIdsFromRents.size > 0) {
        const vehiclesSnapshots = await Promise.all(
          Array.from(vehicleIdsFromRents).map(id => getDoc(doc(db, 'cars', id)))
        );
        vehiclesSnapshots.forEach(snap => {
          if (snap.exists()) {
            vehiclesMap.set(snap.id, { id: snap.id, ...snap.data() });
          }
        });
      }

      // 4. Ensamblar las notificaciones con todos los detalles
      const notifications = rawNotifications.map(n => {
        const notificationData = { ...n };
        if (n.sender_id) {
          notificationData.senderDetails = sendersMap.get(n.sender_id) || null;
        }
        if ((n.type === 'rent_request' || n.type === 'rent_response') && n.rent_id) {
          notificationData.rentDetails = rentsMap.get(n.rent_id) || null;
          if (notificationData.rentDetails && notificationData.rentDetails.vehicle_id) {
            notificationData.vehicleDetails = vehiclesMap.get(notificationData.rentDetails.vehicle_id) || null;
          }
        }
        return notificationData;
      });

      // Llamar al callback una vez que todas las notificaciones han sido procesadas
      if (typeof callback === 'function') {
         callback(notifications);
       }
    })

   return unsubscribe;

  } catch (error) {
    console.error("Error al obtener las notificaciones: ", error);
    addAlert("Error al cargar notificaciones", "error");
    return () => {};
  }

}


/**
 * Obtiene los detalles de una renta específica por su ID
 * @param {string} rentId - ID de la renta
 * @returns {Promise<object|null>} - Objeto con los detalles de la renta enriquecidos, o null si no existe
 */
export async function fetchRentDetail(rentId) {
  try {
    if (!rentId) {
      console.warn("ID de renta no proporcionado");
      return null;
    }

    const rentRef = doc(db, 'rents', rentId);
    const rentSnap = await getDoc(rentRef);

    if (!rentSnap.exists()) {
      console.warn(`No se encontró la renta con ID: ${rentId}`);
      return null;
    }

    const rentData = { id: rentSnap.id, ...rentSnap.data() };

    // Enriquecer con detalles del vehículo
    let vehicleDetails = null;
    if (rentData.vehicle_id) {
      const carRef = doc(db, 'cars', rentData.vehicle_id);
      const carSnap = await getDoc(carRef);
      vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;
    }
    console.log('vehicleDetails:', vehicleDetails);

    // Enriquecer con detalles del propietario
    let ownerDetails = null;
    if (rentData.owner_id) {
      const ownerRef = doc(db, 'users', rentData.owner_id);
      const ownerSnap = await getDoc(ownerRef);
      if (ownerSnap.exists()) {
        const ownerData = ownerSnap.data();
        ownerDetails = {
          id: ownerSnap.id,
          name: ownerData.personalInfo?.firstName || 'Sin nombre',
          lastname: ownerData.personalInfo?.lastName || '',
          photoURL: ownerData.personalInfo?.profilePhoto || null,
          username: ownerData.personalInfo?.username || ownerData.email
        };
      }
    }

    // Enriquecer con detalles del conductor
    let driverDetails = null;
    if (rentData.driver_id) {
      const driverRef = doc(db, 'users', rentData.driver_id);
      const driverSnap = await getDoc(driverRef);
      if (driverSnap.exists()) {
        const driverData = driverSnap.data();
        driverDetails = {
          id: driverSnap.id,
          name: driverData.personalInfo?.firstName || 'Sin nombre',
          lastname: driverData.personalInfo?.lastName || '',
          photoURL: driverData.personalInfo?.profilePhoto || null,
          username: driverData.personalInfo?.username || driverData.email
        };
      }
    }

    return {
      ...rentData,
      vehicleDetails,
      ownerDetails,
      driverDetails
    };

  } catch (error) {
    console.error("Error al obtener los detalles de la renta:", error);
    throw error;
  }
}
