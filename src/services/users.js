import { collection, getDocs, doc, updateDoc, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

export async function getUsers() {
  const usersCollection = collection(db, "users");
  const usersSnapshot = await getDocs(usersCollection);

  return usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updateUserRole(userId, newRole) {
    try {
        const userDoc = doc(db, "users", userId);
        await updateDoc(userDoc, { role: newRole });
        return { success: true, message: "Rol cambiado correctamente" }; //para manjear alkertas
      } catch (error) {
        console.error("Error al cambiar el rol del usuario:", error);
        return { success: false, message: "Error al actualizar la validación del auto" }; //para mannejar alertas
      }
  }

  export async function getUserById(userId) {
    try {
      const userDoc = doc(db, "users", userId); 
      const userSnapshot = await getDoc(userDoc); 
  
      if (userSnapshot.exists()) {
        return { id: userSnapshot.id, ...userSnapshot.data() };
      } else {
        return null; 
      }
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
      throw new Error("Hubo un error al cargar el perfil del usuario.");
    }
  }
  
  export async function getPostsByUserId(userId) {
  try {
    const carsRef = collection(db, "cars"); 
    const q = query(carsRef, where("user_id", "==", userId)); 
    const querySnapshot = await getDocs(q); 
    
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() }); 
    });
    
    return posts; 
  } catch (error) {
    console.error("Error al obtener las publicaciones:", error);
    throw new Error("Hubo un error al cargar las publicaciones del usuario.");
  }
}

// ME LO HIZO COPILOT NO SE NI SI FUNCIONA
// export async function deleteUser(userId) {
//     try {
//         const userDoc = doc(db, "users", userId);
//         await updateDoc(userDoc, { active: false });
//         return { success: true, message: "Usuario eliminado correctamente" }; //para manjear alkertas
//       } catch (error) {
//         console.error("Error al eliminar el usuario:", error);
//         return { success: false, message: "Error al eliminar el usuario" }; //para mannejar alertas
//       }
//   }