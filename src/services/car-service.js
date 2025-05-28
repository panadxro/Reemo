import { collection, doc, getDoc, addDoc, serverTimestamp, query, where, getDocs, updateDoc, onSnapshot, orderBy} from "firebase/firestore";
  import { db } from "./firebase.js";
  

  //Es la que estaba en CarDetails
  export async function getCarById(carId) {
    const carDoc = doc(db, "cars", carId);
    const carSnapshot = await getDoc(carDoc);
    if (carSnapshot.exists()) {
      const carData = carSnapshot.data();
      const userDoc = doc(db, "users", carData.user_id);
      const userSnapshot = await getDoc(userDoc);
      if (userSnapshot.exists()) {
        const userData = userSnapshot.data();
        return { id: carSnapshot.id, ...carData, user: userData };
      }
      return { id: carSnapshot.id, ...carData, user: null };
    }
    throw new Error("Auto no encontrado.");
  }

  //Es la que estaba en Profile
  export function getUserCars(userId) {
    return new Promise((resolve, reject) => {
      const carsCollection = collection(db, "cars");
      const userCarsQuery = query(carsCollection, where("user_id", "==", userId));
  
      const unsubscribe = onSnapshot(
        userCarsQuery,
        (snapshot) => {
          const cars = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          resolve(cars); // Resuelve la promesa con los autos
        },
        (error) => {
          console.error("Error al obtener los autos:", error);
          reject(error); // Rechaza la promesa si hay un error
        }
      );
  
      // Devuelve la función para desuscribirse
      return unsubscribe;
    });
  }

  // Es la que estaba en Püblications
  export async function getAvailableCars(userId) {
    const carsCollection = collection(db, "cars");
    const rentedCollection = collection(db, "rents");
  
    // Consulta para obtener autos disponibles y validados
    const carsQuery = query(
      carsCollection,
      where("isAvailable", "==", true),
      where("isValidated", "==", true)
    );
    const carsSnapshot = await getDocs(carsQuery);
  
    // Consulta para obtener solicitudes de alquiler con estado "aceptado"
    const activeRentsQuery  = query(
      rentedCollection,
      where("status", "in", ['confirmed', 'in_progress'])
    );
    const activeRentsSnapshot  = await getDocs(activeRentsQuery );
  
    // Obtener los IDs de los autos con solicitudes "aceptado"
    const rentedVehicleIds  = new Set(activeRentsSnapshot.docs.map((doc) => doc.data().vehicle_id));
  
    return carsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter(
        (car) =>
          car.user_id !== userId && // El auto no pertenece al usuario actual
          !rentedVehicleIds.has(car.id) // El auto no está en la lista de IDs de vehículos activamente alquilados
      );
  }
  
  

  export async function getAvailableCarsForAdmin() {
    const carsCollection = collection(db, "cars");
  
    // de mas nuievo a ams viejo
    const carsQuery = query(carsCollection, orderBy("created_at", "desc"));
    const carsSnapshot = await getDocs(carsQuery);
  
    return carsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  // Es la que estaba en Püblications

export async function addCar(newCar) {
  const carsCollection = collection(db, "cars");
  const docRef = await addDoc(carsCollection, {
    ...newCar,
    created_at: serverTimestamp(),
  });
  return { id: docRef.id, ...newCar };
}

export async function updateCarValidation(carId, isValidated) {
  try {
    const carDoc = doc(db, "cars", carId);
    await updateDoc(carDoc, { isValidated });
    return { success: true, message: "Validación actualizada correctamente" }; //para manjear alkertas
  } catch (error) {
    console.error("Error al actualizar la validación del auto:", error);
    return { success: false, message: "Error al actualizar la validación del auto" }; //para mannejar alertas
  }
}



  