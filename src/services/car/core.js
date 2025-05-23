import { collection, doc, getDoc, setDoc, serverTimestamp, query, where, getDocs, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "./firebase.js";

export async function createCarData( uid ) {
  const carRef = doc(db, 'cars', uid);
  const initialData = {
    basicInfo: {
      brand: '',
      model: '',
      year: '',
      type: '',
      color: '',
      licensePlate: ''
    },
    specifications: {
      engine: '',
      horsepower: '',
      transmision: '',
      drivetrain: '',
      fuelType: '',
      passengerCapacity: 0,
      trunkCapacity: '',
      currentMileage: 0
    },
    status: {
      current: '',
      currentLocation: {
        address: '',
        city: '',
        country: '',
        coordinates: ''
      },
      trimesRented: 0
    },
    features: {
      interior: [],
      exterior: [],
      safety: [],
      additional: [],
      restrictions: {
        minimumDriverAge: 0,
        requiresValidLicense: false,
        smokingAllowed: false,
        petsAllowed: true
      },
      hasInsurance: true,
      insuranceDetails: ""
    },
    pricing: {
      rates: {
        daily: 0,
        weekly: 0,
        monthly: 0
      },
      mileagePolicy: {
        includedPerDay: 0,
        extraPricePerKm: 0
      },
      securityDeposit: 0,
      cancellationPolicy: ''
    },
    photos: [],
    availability: {
      schedule: {
        monday: false,
        tuesday: false,
        wednesday: false,
        thursday: false,
        friday: false,
        saturday: false,
        sunday: false
      },
      blockedDates: [],
      nextAvailableDate: ''
    }
  }
  await setDoc(carRef, {
    ...initialData,
    cid,
    ownerId: uid,
    createdAt: new Date(),
    updatedAt: new Date()
  });
};

// Obtener auto por ID
export async function getCarById(carId) {
  try {
    const carDoc = doc(db, "cars", carId);
    const carSnapshot = await getDoc(carDoc);
    return carSnapshot.exists()
    ? carSnapshot.data()
    : new Error("Auto no encontrado");
  } catch (error) {
    console.error("Error al obtener el auto:", error);
    throw error;
  }
};

export async function editCar(carId, data) {
  const carRef = doc(db, "cars", carId);
  await updateDoc(carRef, { 
    ...data,
    updatedAt: serverTimestamp()
  });
}



export async function saveCarData(carId, data) {
  try {
    if (!carId) throw new Error("No se proporcionó un ID de auto")

    const carRef = doc(db, "cars", carId)

    await setDoc(carRef, {
      ...data,
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error al guardar los datos del auto:", error);
    throw error;
  }
};

// Chekea si el auto esta rentado (Cambiar o eliminar)
export async function checkIfCarIsRented(carId) {
  const rentalQuery = query(
    collection(db, "rental_requests"),
    where("car_id", "==", carId)
  );
  const querySnapshot = await getDocs(rentalQuery);
  return !querySnapshot.empty && querySnapshot.docs[0].data().rented;
}

// Obtener autos del Usuario por ID
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

// Obtener autos
export async function getAvailableCars(loggedUserId) {
  const carsCollection = collection(db, "cars");
  const rentedCollection = collection(db, "rental_requests");

  // Consulta para obtener autos disponibles y validados
  const carsQuery = query(
    carsCollection,
    where("isAvailable", "==", true),
    where("isValidated", "==", true)
  );
  const carsSnapshot = await getDocs(carsQuery);

  // Consulta para obtener solicitudes de alquiler con estado "aceptado"
  const rentedQuery = query(
    rentedCollection,
    where("status", "==", "aceptado")
  );
  const rentedSnapshot = await getDocs(rentedQuery);

  // Obtener los IDs de los autos con solicitudes "aceptado"
  const rentedCars = rentedSnapshot.docs.map((doc) => doc.data().car_id);

  return carsSnapshot.docs
    .map((doc) => ({ id: doc.id, ...doc.data() }))
    .filter(
      (car) =>
        car.user_id !== loggedUserId && // El auto no pertenece al usuario actual
        !rentedCars.includes(car.id) // El auto no tiene una solicitud "aceptado"
    );
}