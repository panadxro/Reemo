import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

export function createCarData() {
  const newCarRef = doc(collection(db, 'cars'));
  return newCarRef.id;
}

// Obtener auto por ID
export async function getCarById(carId) {
  try {
    const carRef = doc(db, "cars", carId);
    const carSnap = await getDoc(carRef);
    
    if (!carSnap.exists()) {
      throw new Error("Vehículo no encontrado");
    }
    
    return {
      id: carSnap.id,
      ...carSnap.data()
    };
  } catch (error) {
    console.error("Error getting car:", error);
    throw error;
  }
}

export const updateCarAvailability = async (carId, newAvailability) => {
  try {
    const carRef = doc(db, "cars", carId);
    await updateDoc(carRef, {
      availability: newAvailability
    });
    return true;
  } catch (error) {
    console.error("Error updating car availability:", error);
    throw error;
  }
};

export const updateCarAvailabilityAndStatus = async (carId, newAvailability, newStatus) => {
  try {
    const carRef = doc(db, "cars", carId);
    await updateDoc(carRef, {
      availability: newAvailability,
      "status.current": newStatus
    });
    return { success: true };
  } catch (error) {
    console.error("Error actualizando disponibilidad y estado:", error);
    return { success: false, message: error.message };
  }
};

export async function editCar(carId, data) {
  const carRef = doc(db, "cars", carId);
  await updateDoc(carRef, { 
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function saveCarData(carData) {
  try {
    if (!carData.id) {
      throw new Error("Car ID is required");
    }

    const carRef = doc(db, 'cars', carData.id);
    
    await setDoc(carRef, {
      ...carData,
      updatedAt: serverTimestamp(),
      createdAt: carData.createdAt || serverTimestamp()
    });

    return carData.id;
  } catch (error) {
    console.error("Error saving car data:", error);
    throw error;
  }
}

// Chekea si el auto esta rentado (Cambiar o eliminar)
export async function checkIfCarIsRented(carId) {
  const rentalQuery = query(
    collection(db, "rental_requests"),
    where("car_id", "==", carId)
  );
  const querySnapshot = await getDocs(rentalQuery);
  return !querySnapshot.empty && querySnapshot.docs[0].data().rented;
}

export function getUserCars(userId) {
  return new Promise((resolve, reject) => {
    const carsCollection = collection(db, "cars");
    const userCarsQuery = query(carsCollection, where("ownerId", "==", userId)); // Cambió de "user_id" a "ownerId"

    const unsubscribe = onSnapshot(
      userCarsQuery,
      (snapshot) => {
        const cars = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        resolve(cars);
      },
      (error) => {
        console.error("Error al obtener los autos:", error);
        reject(error);
      }
    );

    return unsubscribe;
  });
}

// Habia que actualizar estan funcion porque quedaron los datos viejos
  export async function getAvailableCars(userId) {
    const carsCollection = collection(db, "cars");
    const rentedCollection = collection(db, "rents");
  
    // Consulta para obtener autos disponibles y validados
    const carsQuery = query(
      carsCollection,
      where("status.current", "==", "available"),
      // where("isValidated", "==", true)
    );
    const carsSnapshot = await getDocs(carsQuery);
  
    // Consulta para obtener solicitudes de alquiler con estado "aceptado"
    const activeRentsQuery  = query(
      rentedCollection,
      where("status", "in", ['confirmed', 'in_progress'])
    );
    const activeRentsSnapshot  = await getDocs(activeRentsQuery);
  
    // Obtener los IDs de los autos con solicitudes "aceptado"
    const rentedVehicleIds  = new Set(activeRentsSnapshot.docs.map((doc) => doc.data().vehicle_id));
  
    return carsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (car) =>
          car.ownerId !== userId && // El auto no pertenece al usuario actual
          !rentedVehicleIds.has(car.id) // El auto no está en la lista de IDs de vehículos activamente alquilados
      );
  }


