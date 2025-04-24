// Operaciones básicas de usuario
import { doc, getDoc, setDoc, updateDoc, serverTimestamp, collection, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { getDownloadURL } from 'firebase/storage';

export async function createUserProfile( uid, email ) {
  const userRef = doc(db, 'users', uid);
  const initialData = {
    personalInfo: {
      firstName: 'Desconocido',
      lastName: '',
      profilePhoto: '/src/assets/User.png',
      username: 'Desconocido'
    },
    documents: {},
    address: {},
    paymentMethods: [],
    agreements: {},
    email: email,
    role: 'user'
  }
    await setDoc(userRef, {
    ...initialData,

    uid, 
    emailVerified: false, 
    profileCompleted: false, 
    role: 'user', 
    createdAt: new Date(), 
    updatedAt: new Date()
  });
};

export async function getUserProfile(uid) {
  try {
    const userRef = doc(db, 'users', uid);
    const userSnapshot = await getDoc(userRef);

    return userSnapshot.exists() 
      ? userSnapshot.data() 
      : new Error("Usuario no encontrado");
  } catch (error) {
    console.error("Error obteniendo datos del usuario:", error);
    throw error;
  }
};

export async function checkProfileComplete(uid) {
  const user = await getUserProfile(uid);
  return user?.profileCompleted || false;
};

export async function editUserProfile(uid, data) {
  const userRef = doc(db, 'users', uid);

  await updateDoc(userRef, {
    ...data,
  });
}

export async function saveUserData(uid, data) {
  try {
    if (!uid) throw new Error("UID is required")

    const userRef = doc(db, 'users', uid);

    await setDoc(userRef, {
      ...data,
      updateAt: serverTimestamp()
    }, { merge: true });
  } catch (error) {
    console.error("Error guardando datos del usuario:", error);
    throw error;
  }
};

export async function uploadUserFile(uid, file, path) {
  const storageReference = storageRef(storage, `users/${uid}/${path}`);
  const snapshot = await uploadBytes(storageReference, file);
  return await getDownloadURL(snapshot.ref);
}

export async function completeOnboarding(uid) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    profileCompleted: true,
    onboardingCompletedAt: serverTimestamp()
  });
};

export async function checkUsernameAvailability(username) {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('personalInfo.username', '==', username));
  const querySnapshot = await getDoc(q);
  return querySnapshot.empty;
};