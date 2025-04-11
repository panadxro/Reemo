// Gestión de documentos
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

export async function updateUserDocuments(uid, documentData) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    documents: documentData,
    updatedAt: new Date()
  });
};

export async function addDocument(uid, type, url) {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    [`documents.${type}`]:url,
    updatedAt: new Date()
  });
};