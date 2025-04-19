import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function savePaymentMethod(userId, paymentDetails) {
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, { paymentMethod: paymentDetails });
}