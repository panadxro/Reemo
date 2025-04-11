// Métodos de pago (coordinación con /payment)
import { updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

export async function addPaymentMethod(uid, methodData) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    paymentMethods: arrayUnion({
      ...methodData,
      addedAt: new Date()
    }),
    updatedAt: new Date()
  });
};

export async function setDefaultPaymentMethod(uid, methodId) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    paymentMethods: arrayUnion({
      isDefault: true
    }),
    updatedAt: new Date()
  });
};