import { collection, getDocs, doc, updateDoc, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";

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