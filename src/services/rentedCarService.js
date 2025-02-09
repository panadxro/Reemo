import { collection,getDocs, query, where, doc, getDoc, addDoc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase.js";
import {addAlert} from './alerts.js'

export async function fetchRentedCars(userId) {
    try {
      // Crea la consulta a firebase
      const carsCollection = collection(db, "rental_requests");
      const q = query(
        carsCollection,
        where("user_id", "==", userId),
        where("status", "==", "aceptado")
      );
      console.log("Id del usuario", userId);

      // Obtenemos los documentos de la coleccion filtrada
      const carsSnapshot = await getDocs(q);
      const rentedCarsData = carsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cargar detalles del vehículo usando car_id (opcional)
      const carDetailsPromises = rentedCarsData.map(async (rental) => {
        const carRef = doc(db, "cars", rental.car_id);
        const carSnapshot = await getDoc(carRef);
        return {
          ...rental,
          car: carSnapshot.exists()
            ? { id: carSnapshot.id, ...carSnapshot.data() }
            : null,
        };
        
    });
    const carDetails = await Promise.all(carDetailsPromises);
    return carDetails;
    // return carDetailsPromises

}catch (error){
    console.error("Error al obtener los autos alquilados:", error);
    throw error;
}
};


// verificar si el auto ya está alquilado
export async function isCarAlreadyRented(carId) {
    const rentalQuery = query(
        collection(db, 'rental_requests'), 
        where('car_id', '==', carId), 
        where('rented', '==', true)
    );

  const rentalQuerySnapshot = await getDocs(rentalQuery);
  return !rentalQuerySnapshot.empty;

}

//cambia el estado de la solicitud de alquiler
export async function updateRentalStatus(reqId, newStatus) {
  try {
    const requestRef = doc(db, 'rental_requests', reqId);
    const updateData = { status: newStatus };

    // Si el nuevo estado es "finalizado", marcar el auto como disponible
    if (newStatus === 'finalizado') {
      updateData.rented = false;

      // Obtener el ID del auto asociado a la solicitud
      const requestSnap = await getDoc(requestRef);
      const carId = requestSnap.data().car_id;

      // Actualizar el estado del auto en la colección "cars"
      const carRef = doc(db, 'cars', carId);
      await updateDoc(carRef, { rented: false });
    }

    await updateDoc(requestRef, updateData);
    console.log(`Se actualizó el estado a ${newStatus} y rented a ${updateData.rented || false}`);
  } catch (error) {
    console.error("Error al actualizar el estado de la solicitud", error);
    throw error;
  }
}

// envia una solicitud de alquiler
export async function submitRentalRequest(rentalRequest) {
    try {
      const rentalStatus = {
        ...rentalRequest,
        status: 'pendiente',
        timestamp: new Date(),
      }

      await addDoc(collection(db, 'rental_requests'), rentalStatus);
      console.log('Solicitud de alquiler fue enviado')

      // envia la notificacion al propietario del vehiculo
      notifyOwner(rentalRequest.owner_id, rentalStatus)

    } catch (error) {
        console.error('Error al enviar la solicitud de alquiler:', error);
        throw error;
    }
}

export async function notifyOwner(owner_id, rentalRequest) {
  try {
    const userRef = doc(db, 'users', rentalRequest.user_id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      const message = `Nueva solicitud de alquiler de ${userData.name} para las fechas ${rentalRequest.rented_from} a ${rentalRequest.rented_until}.`;
      console.log(message);
      addAlert(message, "success");
    } else {
      const message = `El usuario con ID ${rentalRequest.user_id} no fue encontrado`;
      addAlert(message, "info");
    }
  } catch (error) {
    const message = "Error al notificar al propietario:";
    addAlert(message, "error");
  }
}

export async function fetchRentalRequests(userId, callback) {
  try {
    if (!userId) {
      console.warn("El userId es inválido o no está definido");
      return;
    }

    const rentalRequestCollection = collection(db, 'rental_requests');
    const q = query(
      rentalRequestCollection,
      where("owner_id", "==", userId),
      where("status", "in", ["pendiente", "aceptado"]) // Solo cargar solicitudes pendientes o aceptadas
    );
    
    // Escuchar cambios en tiempo real
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const rentalRequests = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const request = { id: docSnap.id, ...docSnap.data() };

            // Verificar si la fecha de devolución ha pasado
            const rentedUntil = new Date(request.rented_until);
            const currentDate = new Date();

            if (rentedUntil < currentDate && request.status !== "finalizado") {
              // Actualizar el estado a "finalizado"
              await updateRentalStatus(request.id, "finalizado");
              request.status = "finalizado"; // Actualizar el estado localmente
            }

            // Obtener datos del usuario que solicita el alquiler
            const userRef = doc(db, 'users', request.user_id);
            const userSnap = await getDoc(userRef);

            // Obtener datos del auto que se quiere alquilar
            const carRef = doc(db, 'cars', request.car_id);
            const carSnap = await getDoc(carRef);

            if (userSnap.exists() && carSnap.exists()) {
              const userData = userSnap.data();
              const carData = carSnap.data();
              return {
                ...request,
                photoURL: userData.photoURL || null,
                name: userData.name || null,
                carMarca: carData.marca || "Marca desconocida",
                carModelo: carData.modelo || "Modelo desconocida",
                carId: carSnap.id,
              };
            } else {
              console.error(`El usuario o el auto no fueron encontrados`);
              return request;
            }
          })
        );

        // Llamar al callback con las solicitudes actualizadas
        callback(rentalRequests);
      } catch (error) {
        console.error("Error procesando las solicitudes de alquiler:", error);
      }
    });

    // Retornar la función para desuscribirse
    return unsubscribe;
  } catch (error) {
    console.error("Error al obtener las solicitudes de alquiler:", error);
  }
}
    






    // onSnapshot(doc(db, 'users', request.user_id), (snapshot) => {
    //   try {
    //     const rentalRequests = await Promise.all(
    //       snapshot.docs.map(async (docSnap) => {
    //         const request = { id: docSnap.id, ...docSnap.data() };


    //         // const userRef = doc(db, 'users', request.user_id);
    //         // const userSnap = await getDoc(userRef);

    //         if (userSnap.exists()) {
    //           const userData = userSnap.data();
    //           return {
    //             ...request,
    //             photoURL: userData.photoURL || null,
    //             name: userData.name || null,
    //           };
    //         } else {
    //           console.error(`El usuario con ID ${request.user_id} no fue encontrado`);
    //           return request;
    //         }
    //       })
    //     );
