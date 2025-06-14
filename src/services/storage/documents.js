import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export async function uploadUserFile(userId, file, path) {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, `users/${userId}/${path}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const uploadVehiclePhoto = async (file, path) => {
  try {
    const storage = getStorage();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error('Error uploading vehicle photo:', error);
    throw error;
  }
};