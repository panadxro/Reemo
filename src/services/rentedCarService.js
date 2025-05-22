import { collection,getDocs, query, where, doc, getDoc, addDoc, updateDoc, onSnapshot, orderBy, limit } from "firebase/firestore";
import { db } from "../services/firebase.js";
import { createRentalRequestNotification } from "../services/car/notifyRented.js";
import {addAlert} from './alerts.js'

// Vista del Conductor esto lo podemos convertir en el historial
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

      // const userRef = doc(db, 'users', rentalRequest.owner_id);
      // const userSnap = await getDoc(userRef);
        // if(userSnap.exists()){
          // const userData = userSnap.data();
          // const rentMessage = `Nueva solicitud de alquiler de ${userData.name} para las fechas ${rentalRequest.start_time } a ${rentalRequest.end_time }.`;
        // }

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


// Vista del Propietario
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
              carMarca: carData?.marca || "Marca Desconocida",
              carModelo: carData?.modelo || "Modelo Desconocido",
              carId: carSnapId,
            };
            

            // if (userSnap.exists() && carSnap.exists()) {
            //   const userData = userSnap.data();
            //   const carData = carSnap.data();
            //   return {
            //     ...request,
            //     photoURL: userData.photoURL || null,
            //     name: userData.name || null,
            //     carMarca: carData.marca || "Marca desconocida",
            //     carModelo: carData.modelo || "Modelo desconocida",
            //     carId: carSnap.id,
            //   };
            // } else {
            //   console.error(`El usuario o el auto no fueron encontrados`);
            //   return request;
            // }
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
      const notifications = [];
      for (const notificationsDoc of querySnapshot.docs){
        const notificationData = { id: notificationsDoc.id, ...notificationsDoc.data() };

        // Enriquecer con detalles adicionales según el tipo de notificación
        // Esta lógica es similar a la que ya tenías
        if (notificationData.type === 'rent_request' || notificationData.type === 'rent_response' && notificationData.rent_id){
          const rentRef = doc(db, 'rents', notificationData.rent_id);
          const rentSnap = await getDoc(rentRef);

          if(rentSnap.exists()){
            notificationData.rentDetails = { id: rentSnap.id, ...rentSnap.data() };

            // obtenemos detalles del vehículo
            if (notificationData.rentDetails.vehicle_id){
              const vehicleRef = doc(db, 'cars', notificationData.rentDetails.vehicle_id);
              const vehicleSnap = await getDoc(vehicleRef);

              if(vehicleSnap.exists()){
                notificationData.vehicleDetails = { id: vehicleSnap.id, ...vehicleSnap.data() };
              } else {
                console.warn(`[fetchUserNotification] Vehículo con ID ${notificationData.rentDetails.vehicle_id} no encontrado.`);
              }
            }
          }else{
            console.warn(`[fetchUserNotification] Renta ${notificationData.rent_id} no tiene vehicle_id.`);
          }
        }else{
          console.warn(`[fetchUserNotification] Renta con ID ${notificationData.rent_id} no encontrada.`);
        }

        // obtenemos los detalles del remitente
        if(notificationData.sender_id){
          const senderRef = doc(db, 'users', notificationData.sender_id );
          const senderSnap = await getDoc(senderRef);

          if(senderSnap.exists()) {
            const senderData = senderSnap.data();
            notificationData.senderDetails = { 
              id: senderSnap.id, 
              name: senderData.personalInfo?.username || senderData.email, // Ajusta según tu estructura de datos de usuario
              photoURL: senderData.personalInfo?.profilePhoto || null // Ajusta según tu estructura
            };
          }else{
            console.warn(`[fetchUserNotification] Remitente con ID ${notificationData.sender_id} no encontrado.`);
          }
        }
        notifications.push(notificationData);
      }
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





// export async function fetchUserNotification(userId){
//   if(!userId){
//     console.warn("[fetchUserNotification] El userId es inválido o no está definido. Retornando array vacío.");
//     return [];
//   }

//   try {
//     const notificationsCol = collection(db, 'notifications');
//     // filtramos por receiver_id y ordenamos por fecha de creacion
//     const q = query(
//       notificationsCol, 
//       where('receiver_id', '==', userId),
//       orderBy('created_at', 'desc')
//     );

//     const querySnapshot = await getDocs(q);
//     const notifications = [];

//     for (const notificationsDoc of querySnapshot.docs){
//       const notificationData = { id: notificationsDoc.id, ...notificationsDoc.data() };

//       if(notificationData.type === 'rent_request' && notificationData.rent_id){
//         // obtenemos detelles del alquiler
//         const rentRef = doc(db, 'rents', notificationData.rent_id);
//         const rentSnap = await getDoc(rentRef);

//         if(rentSnap.exists()) {
//           notificationData.rentDetails = { id: rentSnap.id, ...rentSnap.data() };

//           // obtenemos detalles del solicitante
//           if(notificationData.rentDetails.vehicle_id){
//             const vehicleRef = doc(db, 'cars', notificationData.rentDetails.vehicle_id);
//             const vehicleSnap = await getDoc(vehicleRef);

//             if(vehicleSnap.exists()){
//               notificationData.vehicleDetails = { id: vehicleSnap.id, ...vehicleSnap.data() };
//             } else {
//               console.warn(`[fetchUserNotification] Vehículo con ID ${notificationData.rentDetails.vehicle_id} no encontrado.`);
//             }
//           }
//         } else {
//           console.warn(`[fetchUserNotification] Renta con ID ${notificationData.rent_id} no encontrada.`);
//         }

//         // obtenemos los detalles del remitente
//         if(notificationData.sender_id){
//           const senderRef = doc(db, 'users', notificationData.sender_id );
//           const senderSnap = await getDoc(senderRef);
//           if(senderSnap.exists()){
//             notificationData.senderDetails = { id: senderSnap.id, ...senderSnap.data() };
//           } else {
//             console.warn(`[fetchUserNotification] Remitente con ID ${notificationData.sender_id} no encontrado.`);
//           }
//         }
//       }

//       // TODO aca se pueden agregar logica para otras notificaciones para el futuro...
//       notifications.push(notificationData);
//     }

//     return notifications

//   } catch (error) {
//     console.error("Error al obtener las notificaciones: ", error);
//     throw error;
//   }

// }