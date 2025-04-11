// Manejo de datos personales
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export async function updatePersonalInfo(uid, data) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    personalInfo: data,
    updatedAt: new Date()
  });
};

export async function updateProfilePhoto(uid, photoURL) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    'personalInfo,profilePhoto': photoURL,
    updatedAt: new Date()
  });
};