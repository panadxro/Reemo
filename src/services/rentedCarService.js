import { collection,getDocs, query, where, doc, getDoc, addDoc, updateDoc, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { createRentalRequestNotification } from "../services/car/notifyRented.js";
import {addAlert} from './alerts.js'


// =================================================================================================
// I. Core Rental Lifecycle & Status Management
// =================================================================================================

/**
 * Envía una nueva solicitud de alquiler a la base de datos y notifica al propietario.
 * @param {object} rentalRequest - Objeto con los detalles de la solicitud de alquiler.
*/
export async function submitRentalRequest(rentalRequest) {
    try {
      const initialRentalData  = {
        ...rentalRequest,
        timestamp: new Date(),
      }

      // se agrega la solicitud de alquiler
      const rentalRequestRef = await addDoc(collection(db, 'rents'), initialRentalData );
      console.log('Solicitud de alquiler enviada con ID:', rentalRequestRef.id)

      await updateDoc(rentalRequestRef, { order_id: rentalRequestRef.id });
      console.log('Documento actualizado con order_id:', rentalRequestRef.id);


      const rentMessage = rentalRequest.status === 'pending' 
      ? `Nueva solicitud de alquiler`
      : 'Solicitud de alquiler rechazada';

      await createRentalRequestNotification(
        rentalRequestRef.id, 
        rentalRequest.driver_id,
        rentalRequest.owner_id,
        rentMessage,
      )

    } catch (error) {
        console.error('Error al enviar la solicitud de alquiler:', error);
        throw error;
    }
}

/**
 * Actualiza el estado de una solicitud de alquiler y la disponibilidad del vehículo asociado.
 * @param {string} reqId - ID de la solicitud de alquiler.
 * @param {string} newStatus - Nuevo estado para la solicitud.
 */
export async function updateRentalStatus(reqId, newStatus) {
  try {
    const requestRef = doc(db, 'rents', reqId);
    const requestSnap = await getDoc(requestRef);

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
        }else if (
          newStatus === 'completed' ||
          newStatus === 'rejected' ||
          newStatus === 'cancelled_by_user' ||
          newStatus === 'cancelled_by_owner' ||
          newStatus === 'expired'
        ){
          await updateDoc(carRef, { "status.current" : "available" })
        }

      }

      await updateDoc(requestRef, { status: newStatus });
      console.log(`Se actualizó el estado de la solicitud ${newStatus}. Disponibilidad del auto ${carId} actualizada si corresponde.`);
      

  } catch (error) {
    console.error("Error al actualizar el estado de la solicitud", error);
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
            enrichedData.driverData = { id: driverSnap.id, name: uData.personalInfo?.firstName, lastname: uData.personalInfo?.lastName, photoURL: uData.personalInfo?.profilePhoto };
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

/**
 * Obtiene el último alquiler activo o pendiente del usuario como conductor.
 * @param {string} userId - ID del usuario (conductor).
 * @returns {Promise<Array<object>>} - Un array con el último alquiler enriquecido, o un array vacío si no hay.
 */
export async function fetchRentedCars(userId) {
  try {
    const rentsCollection = collection(db, "rents");
    const q = query(
      rentsCollection,
      where("driver_id", "==", userId),
      // Ordenar por fecha de inicio, las más recientes primero
      where("status", "in", ["pending", "confirmed", "in_progress"]),
      orderBy("start_time", "desc"),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty){
      return [];
    }

    const singleDoc = querySnapshot.docs[0];
    const appData = { id: singleDoc.id, ...singleDoc.data() };

    let vehicleDetails = null;
    let ownerDetails = null;

    if(appData.vehicle_id){
      const carRef = doc(db, 'cars', appData.vehicle_id);
      const carSnap = await getDoc(carRef);
      vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;
      console.log('[RentStatusDetails.vue] vehicleDetails:', vehicleDetails)

      if(vehicleDetails && vehicleDetails.ownerId ){
        const ownerRef = doc(db, 'users', vehicleDetails.ownerId );
        const ownerSnap = await getDoc(ownerRef);
        ownerDetails = ownerSnap.exists() ? {id: ownerSnap.id, name: ownerSnap.data().name, photoURL: ownerSnap.data().photoURL } : null;
      }
    } else {
      console.warn(`La solicitud ${appData.id} no tiene vehicle_id.`);
      // Devolver la aplicación sin detalles del vehículo si no hay vehicle_id
      return [{ ...appData, vehicleDetails: null, ownerDetails: null }];
    }

    return [{ ...appData, vehicleDetails, ownerDetails }];
  } catch (error) {
    console.error("Error al obtener las solicitudes de alquiler del conductor:", error);
    throw error;
  }
}

/**
 * Vista del Propietario:
 * Obtiene el ultimo alquiler activo o pendiente de un vehículo propiedad del usuario.
 * @param {string} ownerId - ID del usuario (propietario).
 * @returns {Promise<object|null>} - El ultimo alquiler enriquecido, o null si no hay.
 */
export async function fetchLatestActiveOwnedRental(ownerId){
  try {
    const rentsCollection = collection(db, "rents");
    const q = query(
      rentsCollection,
      where("owner_id", "==", ownerId),
      where("status", "in", ["pending", "confirmed", "in_progress"]),
      orderBy("timestamp", "desc"), // Usar timestamp de creación de la solicitud para "más reciente"
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null; // No hay alquileres activos/pendientes para los vehículos de este propietario
    }

    const rentalDoc = querySnapshot.docs[0];
    const rentalData = { id: rentalDoc.id, ...rentalDoc.data() };

    // Enriquecer con detalles del vehículo
    let vehicleDetails = null;
    if (rentalData.vehicle_id) {
      const carRef = doc(db, 'cars', rentalData.vehicle_id);
      const carSnap = await getDoc(carRef);
      vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;
    }

    // Enriquecer con detalles del conductor (inquilino)
    let driverDetails = null;
    if (rentalData.driver_id) {
      const driverRef = doc(db, 'users', rentalData.driver_id);
      const driverSnap = await getDoc(driverRef);
      if (driverSnap.exists()) {
        const dData = driverSnap.data();
        // Asegúrate de que la ruta a personalInfo y sus campos sea correcta
        driverDetails = {
          id: driverSnap.id,
          name: dData.personalInfo?.username || dData.email || 'Conductor Desconocido',
          photoURL: dData.personalInfo?.profilePhoto || null
        };
      }
    }
    return { ...rentalData, vehicleDetails, driverDetails };
  } catch (error) {
    console.error("Error al obtener el último alquiler activo del propietario:", error);
    throw error;
  }

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
      where("status", "in", ["pending", "confirmed"]) // Solo cargar solicitudes pendientes o aceptadas
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
      orderBy("start_time", "desc"),
    );

    const ownerQuery = query(
      rentsCollection,
      where("owner_id", "==", userId),
      where("status", "in", ["completed"]),
      orderBy("start_time", "desc")
    );

    const [driverSnapshot, ownerSnapshot] = await Promise.all([
      getDocs(driverQuery),
      getDocs(ownerQuery),
    ])

    const applicationsData = [];
    // evitamos ids duplicados
    const seenIds = new Set();

    driverSnapshot.docs.forEach((doc) => {
      if (!seenIds.has(doc.id)) {
        applicationsData.push({ id: doc.id, ...doc.data() });
        seenIds.add(doc.id);
      }
    });

    ownerSnapshot.docs.forEach((doc) => {
      if (!seenIds.has(doc.id)) {
        applicationsData.push({ id: doc.id, ...doc.data() });
        seenIds.add(doc.id);
      }
    });

    // Ordenamos la lista combinada por start_time descendente
    applicationsData.sort((a, b) => {
      const timeA = a.start_time?.seconds || 0;
      const timeB = b.start_time?.seconds || 0;
      return timeB - timeA;
    });
    
    if (applicationsData.length === 0) {
      return [];
    }

    // Enriquecer con detalles del vehÃculo
    const carsData = await Promise.all(
      applicationsData.map(async (app) => {
        if (!app.vehicle_id) {
          console.warn(`Solicitud ${app.id} no tiene vehicle_id.`);
          return { ...app, vehicleDetails: null, ownerDetails: null };
        }
        const carRef = doc(db, "cars", app.vehicle_id);
        const carSnap = await getDoc(carRef);
        const vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;

        let ownerDetails = null;
        if (vehicleDetails && vehicleDetails.ownerId) {
          const ownerRef = doc(db, "users", vehicleDetails.ownerId);
          const ownerSnap = await getDoc(ownerRef);
          ownerDetails = ownerSnap.exists() ? { id: ownerSnap.id, name: ownerSnap.data().personalInfo.firstName, profilePhoto: ownerSnap.data().personalInfo.profilePhoto } : null;
        }

        return { ...app, vehicleDetails, ownerDetails };
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
    if (!userId) {
      console.warn("ID de usuario no proporcionado");
      return [];
    }

    const rentsCollection = collection(db, "rents");
    
    // Consulta para obtener los alquileres donde el usuario es el propietario
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

    // Procesar los documentos y enriquecerlos
    const enrichedRentals = await Promise.all(
      ownerSnapshot.docs.map(async (document) => {
        try {
          const rentalData = { id: document.id, ...document.data() };
          
          // Obtener detalles del vehículo
          let vehicleDetails = null;
          if (rentalData.vehicle_id) {
            const carRef = doc(db, 'cars', rentalData.vehicle_id);
            const carSnap = await getDoc(carRef);
            vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;
          }

          // Obtener detalles del conductor (inquilino)
          let driverDetails = null;
          if (rentalData.driver_id) {
            const driverRef = doc(db, 'users', rentalData.driver_id);
            const driverSnap = await getDoc(driverRef);
            if (driverSnap.exists()) {
              const dData = driverSnap.data();
              driverDetails = {
                id: driverSnap.id,
                name: dData.personalInfo?.firstName || dData.personalInfo?.username || dData.email,
                lastname: dData.personalInfo?.lastName || '',
                photoURL: dData.personalInfo?.profilePhoto || null
              };
            }
          }

          console.log("fetchUserRentedOutHistory called with userId:", rentalData.owner_id);

          return {
            ...rentalData,
            vehicleDetails,
            driverDetails,
            isRentedOut: true
          };
        } catch (error) {
          console.error("Error al enriquecer datos del alquiler:", error);
          return null;
        }
      })
    );

    // Filtrar cualquier resultado nulo por errores en el enriquecimiento
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
    return () => {};
  }

}


