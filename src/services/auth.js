import { 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth } from "./firebase";
import { checkUserExists } from "@/services/user"; 

// Mantenemos solo los datos esenciales que usa tu store
let currentAuthState = {
  id: null,
  email: null
};

// Array para manejar observers
const authObservers = [];

// Configuramos el observer de Firebase
onAuthStateChanged(auth, (user) => {
  if (user) {
    currentAuthState = {
      id: user.uid,
      email: user.email
    };
  } else {
    currentAuthState = {
      id: null,
      email: null
    };
  }
  notifyAllObservers();
});

// Funciones básicas de autenticación
export async function login({ email, password }) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function register({ email, password }) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function logout() {
  return signOut(auth);
}

// Sistema de observers (simplificado)
export function subscribeToAuthState(callback) {
  authObservers.push(callback);
  // Notificar inmediatamente con el estado actual
  callback({ ...currentAuthState });
  
  return () => {
    const index = authObservers.indexOf(callback);
    if (index > -1) {
      authObservers.splice(index, 1);
    }
  };
}

// Helper para notificar a todos los observers
function notifyAllObservers() {
  authObservers.forEach(observer => {
    observer({ ...currentAuthState });
  });
}

export async function loginWithGoogle() {
  const provider = new GoogleAuthProvider();
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Verificar si el usuario existe en tu base de datos
    const userExists = await checkUserExists(user.uid);
    
    if (!userExists) {
      await signOut(auth);
      throw new Error('USER_NOT_REGISTERED');
    }
    
    return result;
  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
}

// Función separada para registro con Google
export async function registerWithGoogle() {
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider);
}

export async function loginWithFacebook() {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');
  
  provider.setCustomParameters({
    'display': 'popup',
    'auth_type': 'reauthenticate'
  });
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    const userExists = await checkUserExists(user.uid);
    
    if (!userExists) {
      await signOut(auth);
      throw new Error('USER_NOT_REGISTERED');
      router
    }
    
    return result;
  } catch (error) {
    console.error("Facebook sign-in error:", error);
    throw error;
  }
}

export async function registerWithFacebook() {
  const provider = new FacebookAuthProvider();
  provider.addScope('email');
  provider.addScope('public_profile');
  
  provider.setCustomParameters({
    'display': 'popup',
    'auth_type': 'reauthenticate'
  });
  
  return signInWithPopup(auth, provider).catch(error => {
    console.error("Facebook register error:", error);
    throw error;
  });
}