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

  // Consulta para obtener todos los autos (antes filtrabamos isAvailable e isValidates, despues habria que volverlo a agregar)
  const carsQuery = query(carsCollection);
  const carsSnapshot = await getDocs(carsQuery);

  // Para obtener solicitudes de alquiler con estado "aceptado"
  const activeRentsQuery = query(
    rentedCollection,
    where("status", "in", ['confirmed', 'in_progress'])
  );
  const activeRentsSnapshot = await getDocs(activeRentsQuery);

  // para obtener los ids de esos autos y despues filtrarlo
  const rentedVehicleIds = new Set(activeRentsSnapshot.docs.map((doc) => doc.data().vehicle_id));

  return carsSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter((car) => {
      const isNotOwner = car.ownerId !== userId;
      
      // Filtrar por status disponible
      const isAvailable = car.status?.current === 'available';
      
      // y si el auto no está alquilado
      const isNotRented = !rentedVehicleIds.has(car.id);
      
      return isNotOwner && isAvailable && isNotRented;
    });
}


