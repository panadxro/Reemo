import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "./firebase";

export async function getUserProfileById(id) {
  const userRef = doc(db, `users/${id}`);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
    throw new Error("Usuario no encontrado");
  }

  const data = userSnapshot.data();

  return {
    id: userSnapshot.id,
    email: data.email,
    userName: data.userName,
    name: data.name,
    lastName: data.lastName,
    role: data.role, 
    photoURL: data.photoURL,
  };
}


export async function createUserProfile(id, { email, userName, name, lastName, role = "user" }) {
  const userRef = doc(db, `users/${id}`);

  await setDoc(userRef, { 
    email,
    userName: userName || "",
    name: name || "",
    lastName: lastName || "",
    role,
  });
}


export async function editUserProfile(id, data) {
  const userRef = doc(db, `users/${id}`);

  await updateDoc(userRef, {
    ...data,
  });
}