import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getUsers() {
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);

  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateUserRole(userId, newRole) {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { role: newRole });
    return { success: true, message: "Rol cambiado correctamente" };
  } catch (error) {
    console.error("Error al cambiar el rol del usuario:", error);
    return { success: false, message: "Error al actualizar la validación del auto" };
  }
}
export async function updateVerification(userId, newStatus) {
  try {
    const userDoc = doc(db, "users", userId);
    await updateDoc(userDoc, { status: newStatus });
    return { success: true, message: "Validación del usuario actualizada correctamente" };
  } catch (error) {
    console.error("Error al actualizar la validación del usuario:", error);
    return { success: false, message: "Error al actualizar la validación del usuario" };
  }
}