import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
} from "firebase/auth";
import { auth } from "./firebase";

import { createUserProfile, editUserProfile, getUserProfileById } from "./user-profile";
import { uploadFile, getFileURL } from "./file-storage";

let userData = {
  id: null,
  email: null,
  userName: null,
  name: null,
  lastName: null,
  photoURL: null,
  role: null, // Agregado para almacenar el rol del usuario.
};

// Sí existe usuario en localStorage, lo cargamos en userData. Hasta que Firebase complete la verificación.
if (localStorage.getItem("user")) {
  userData = JSON.parse(localStorage.getItem("user"));
}

// Variable donde almacenar los observers para el estado de autenticación.
let observers = [];

onAuthStateChanged(auth, (user) => {
  if (user) {
    updateUserData({
      id: user.uid,
      email: user.email,
      userName: null,
      photoURL: user.photoURL,
    });
    localStorage.setItem("user", JSON.stringify(userData));

    // Buscamos los datos del perfil, para actualizar los datos del usuario autenticado.
    getUserProfileById(user.uid).then((profile) => {
      updateUserData({
        name: profile.name,
        lastName: profile.lastName,
        userName: profile.userName,
        role: profile.role || "user", // Actualizamos con el rol del perfil, por defecto "user".
      });
    });
  } else {
    updateUserData({
      id: null,
      email: null,
      userName: null,
      name: null,
      lastName: null,
      role: null,
    });
    localStorage.removeItem("user");
  }
});

export async function login({ email, password }) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential;
}

/**
 *
 * @param {{email: string, password: string}} data
 */
export async function register({ email, password }) {
  try {
    const credentials = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    // Creamos el perfil del usuario con el rol "user" por defecto.
    await createUserProfile(credentials.user.uid, { 
      email, 
      role: "user" // Valor por defecto para el nuevo usuario.
    });
  } catch (error) {
    console.error("[auth.js register] Error al registrar el usuario: ", error);
    throw error;
  }
}

/**
 *
 * @param {{user: string, name: string, lastName: string, photo: File}} data
 * @return {Promise<void>}
 */
export async function editMyProfile({ userName, name, lastName }) {
  try {
    // Actualizamos el perfil en Authentication.
    const promiseAuth = updateProfile(auth.currentUser, { userName });

    // Actualizamos el perfil del usuario en Firestore.
    const promiseProfile = editUserProfile(userData.id, {
      userName,
      name,
      lastName,
    });

    await Promise.all([promiseAuth, promiseProfile]);

    // Actualizamos los datos del usuario autenticado.
    updateUserData({
      userName,
      name,
      lastName,
    });
  } catch (error) {
    console.error(
      "[auth.js editMyProfile] Error al editar los datos del perfil: ",
      error,
    );
    throw error;
  }
}

export async function editMyProfilePhoto(photo) {
  try {
      const filepath = `users/${userData.id}/avatar.jpg`;

      // Subimos el archivo a Storage.
      await uploadFile(filepath, photo);

      // Obtenemos la URL pública para grabarla en Authentication y Firestore.
      const photoURL = await getFileURL(filepath);

      const promiseAuth = updateProfile(auth.currentUser, { photoURL });
      const promiseFirestore = editUserProfile(userData.id, { photoURL });

      await Promise.all([promiseAuth, promiseFirestore]);

      updateUserData({
          photoURL,
      });
  } catch (error) {
      console.error('[auth.js editMyProfilePhoto] Error al editar la foto del perfil: ', error);
      throw error;
  }
}

export async function logout() {
  return signOut(auth);
}

export function subscribeToAuthState(callback) {
  observers.push(callback);

  // Notificamos inmediatamente al callback del estado actual.
  notify(callback);

  return () => (observers = observers.filter((obs) => obs != callback));
}

function notify(callback) {
  callback({ ...userData });
}

/**
 * Recorre todos los observers y los notifica.
 */
function notifyAll() {
  observers.forEach((observer) => notify(observer));
}

// Actualiza los datos de usuario autenticado.
function updateUserData(newData) {
  userData = {
    ...userData,
    ...newData,
  };
  localStorage.setItem("user", JSON.stringify(userData));
  notifyAll();
}
