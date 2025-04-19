import { doc, updateDoc, getDoc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase";

export async function savePaymentMethod(userId, paymentDetails) {
  const userRef = doc(db, "users", userId);
  
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    throw new Error("Usuario no encontrado");
  }
  
  const userData = userDoc.data();
  
  if (!userData.paymentMethods) {
    await updateDoc(userRef, { 
      paymentMethods: [paymentDetails] 
    });
  } else {
    await updateDoc(userRef, { 
      paymentMethods: arrayUnion(paymentDetails) 
    });
  }
}

export const getPaymentMethods = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.paymentMethods || []; 
    } else {
      console.warn('Usuario no encontrado');
      return [];
    }
  } catch (error) {
    console.error('Error al obtener métodos de pago:', error);
    throw error;
  }
};

export async function removePaymentMethod(userId, index) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    if (!userData.paymentMethods || userData.paymentMethods.length <= index) {
      throw new Error("Método de pago no encontrado");
    }
    
    const updatedMethods = userData.paymentMethods.filter((_, i) => i !== index);
    
    await updateDoc(userRef, { 
      paymentMethods: updatedMethods 
    });
    
    return updatedMethods;
  } catch (error) {
    console.error("Error al eliminar método de pago:", error);
    throw error;
  }
}

export async function setDefaultPaymentMethod(userId, index) {
  try {
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw new Error("Usuario no encontrado");
    }
    
    const userData = userDoc.data();
    if (!userData.paymentMethods || userData.paymentMethods.length <= index) {
      throw new Error("Método de pago no encontrado");
    }
    
    const updatedMethods = userData.paymentMethods.map((method, i) => ({
      ...method,
      isDefault: i === index
    }));
    
    await updateDoc(userRef, { 
      paymentMethods: updatedMethods 
    });
    
    return updatedMethods;
  } catch (error) {
    console.error("Error al establecer método de pago predeterminado:", error);
    throw error;
  }
}