// Manejo de términos y condiciones
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

export async function acceptedTerms(uid) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    agreements: {
      acceptedTerms: true,
      acceptedPrivacyPolicy: true,
      acceptedAt: new Date()
    },
    profileCompleted: true,
    updatedAt: new Date()
  });
};