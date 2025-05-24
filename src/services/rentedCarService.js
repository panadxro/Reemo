import { collection,getDocs, query, where, doc, getDoc, addDoc, updateDoc, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { createRentalRequestNotification } from "../services/car/notifyRented.js";
import {addAlert} from './alerts.js'

// Esto lo podemos convertir en el historial
// export async function fetchUserRentalHistory(userId) {
//   try {
//     const rentsCollection = collection(db, "rents");
//     const q = query(
//       rentsCollection,
//       where("driver_id", "==", userId),
//       // Ordenar por fecha de inicio, las más recientes primero
//       // where("status", "in", ["confirmed", "in_progress"])
//       orderBy("start_time", "desc"),
//     );

//     const querySnapshot = await getDocs(q);
//     const applicationsData = querySnapshot.docs.map((doc) => ({
//       id: doc.id,
//       ...doc.data(),
//     }));

//     // Enriquecer con detalles del vehículo
//     const carsData = await Promise.all(
//       applicationsData.map(async (app) => {
//         if (!app.vehicle_id) {
//           console.warn(`Solicitud ${app.id} no tiene vehicle_id.`);
//           return { ...app, vehicleDetails: null, ownerDetails: null };
//         }
//         const carRef = doc(db, "cars", app.vehicle_id);
//         const carSnap = await getDoc(carRef);
//         const vehicleDetails = carSnap.exists() ? { id: carSnap.id, ...carSnap.data() } : null;

//         let ownerDetails = null;
//         if (vehicleDetails && vehicleDetails.user_id) {
//           const ownerRef = doc(db, "users", vehicleDetails.user_id);
//           const ownerSnap = await getDoc(ownerRef);
//           ownerDetails = ownerSnap.exists() ? { id: ownerSnap.id, name: ownerSnap.data().name, photoURL: ownerSnap.data().photoURL } : null;
//         }

//         return { ...app, vehicleDetails, ownerDetails };
//       })
//     );

//     return carsData;
//   } catch (error) {
//     console.error("Error al obtener las solicitudes de alquiler del conductor:", error);
//     throw error;
//   }
// }


// Vista del Conductor donde obtenemos los datos de la ultima solicitud

export async function fetchRentedCars(userId) {
  try {
    const rentsCollection = collection(db, "rents");
    const q = query(
      rentsCollection,
      where("driver_id", "==", userId),
      // Ordenar por fecha de inicio, las más recientes primero
      // where("status", "in", ["confirmed", "in_progress"])
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

      if(vehicleDetails && vehicleDetails.user_id){
        const ownerRef = doc(db, 'users', vehicleDetails.user_id);
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


// verificar si el auto ya está alquilado
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

//cambia el estado de la solicitud de alquiler
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
        if(newStatus === 'confirmed' || newStatus === 'in_progress'){
          await updateDoc(carRef, { isAvailable: false });
        }else if (
          newStatus === 'completed' ||
          newStatus === 'rejected' ||
          newStatus === 'cancelled_by_user' ||
          newStatus === 'cancelled_by_owner' ||
          newStatus === 'expired'
        ){
          await updateDoc(carRef, { isAvailable: true })
        }

      }

      await updateDoc(requestRef, { status: newStatus });
      console.log(`Se actualizó el estado de la solicitud ${newStatus}. Disponibilidad del auto ${carId} actualizada si corresponde.`);
      

  } catch (error) {
    console.error("Error al actualizar el estado de la solicitud", error);
    throw error;
  }
}


// envia una solicitud de alquiler
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
        rentalRequestRef.id, // ID de la solicitud de alquiler recién creada
        rentalRequest.driver_id, // ID del usuario que alquila (remitente)
        rentalRequest.owner_id, // ID del propietario (destinatario)
        rentMessage,
      )

    } catch (error) {
        console.error('Error al enviar la solicitud de alquiler:', error);
        throw error;
    }
}


// Vista del Conductor
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