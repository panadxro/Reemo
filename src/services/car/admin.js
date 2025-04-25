import { doc, updateDoc, collection, query, getDocs } from "firebase/firestore";
import { db } from "./firebase.js"

// Actualizar validación del vehículo (Cambiar o eliminar)
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

// Obtener autos validados ordenados (Cambiar o eliminar)
export async function getAvailableCarsForAdmin() {
  const carsCollection = collection(db, "cars");

  // de mas nuievo a ams viejo
  const carsQuery = query(carsCollection, orderBy("created_at", "desc"));
  const carsSnapshot = await getDocs(carsQuery);

  return carsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}