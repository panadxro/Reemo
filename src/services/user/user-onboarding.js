import { doc, updateDoc } from "firebase/firestore";
import { db } from ".firebase";
import { uploadDocument } from "./documents/documents";
import { savePaymentMethod } from "./payments/payments";

export async function savePersonalData(userId, { name, lastName, phone }) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { name, lastName, phone });
}

export async function uploadUserDocuments(userId, { license, identification }) {
  const licenseURL = await uploadDocument(`users/${userId}/license.jpg`, license);
  const identificationURL = await uploadDocument(`users/${userId}/identification.jpg`, identification);

  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { licenseURL, identificationURL });
}

export async function savePaymentDetails(userId, paymentDetails) {
  await savePaymentMethod(userId, paymentDetails);
}

export async function acceptTermsAndConditions(userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { termsAccepted: true });
}

export async function completeOnboarding(userId) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { onboardingCompleted: true, active: true });
}