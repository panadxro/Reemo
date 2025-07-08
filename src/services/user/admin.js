import { collection, getDocs, doc, updateDoc, query, where } from "firebase/firestore";
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

export const getAdminUser = async () => {
  try {
    const userRef = collection(db, 'users');
    const q = query(userRef, where("role", "==", "admin"));
    const querySnap = await getDocs(q);

    const admins = [];
    querySnap.forEach((doc) => {
      admins.push({ id: doc.id, ...doc.data() });
    });

    return admins;
  } catch (error) {
    console.error("Error al obtener los usuarios administradores:", error);
    throw error;
  }
}