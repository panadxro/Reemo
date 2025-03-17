import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";

export async function uploadDocument(filepath, file) {
  const storageRef = ref(storage, filepath);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}