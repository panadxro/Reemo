// Operaciones con dirección
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export async function updateUserAddress(uid, addressData) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    address: {
      country: 'Argentina',
      ...addressData
    },
    updatedAt: new Date()
  });
};