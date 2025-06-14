import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "./firebase";

export async function uploadFile(path, file) {
  const metadata = {
    contentType: file.type || 'image/jpeg',  // Usa el tipo de archivo o asigna un tipo por defecto
  };
  const storageRef = ref(storage, path);
  const uploadTask = await uploadBytes(storageRef, file, metadata);
  return await getDownloadURL(uploadTask.ref);
}


export async function uploadUserFile(userId, file, path){
  const newPath = `users/${userId}/${path}`;
  try {
    const url = await uploadFile(newPath, file);
    return url;
  } catch (error) {
    throw error;
  }
}

export async function getFileURL(path) {
  const fileRef = ref(storage, path);
  return await getDownloadURL(fileRef);
}

// Esto es para verificar si las imágenes existen. Es decir, al crear un auto, se le asigna un array con 4 fotos pero estas fotos esntan en storage y si se borra no se muestra la foto default sino que el alt, porque el link de las imagenes está. Lo que hace esta función es crear el array que van a recorrer la vista. En caso de que en la URL exista una imágen, se agrega, sino no, y al estar vacío el array, se muestra la imágen default. Lo mismo pasaría si en vez de borrrar todas las fotos, borramos 3, una se mostraría si o sis


// export async function verifyImageURLs(images) {
//   const validImages = [];
//   for (const imageUrl of images) {
//     const storageRef = ref(storage, imageUrl);
//     try {
//       // Intenta obtener la URL desde Firebase Storage
//       await getDownloadURL(storageRef);
//       validImages.push(imageUrl); // Si la URL es válida, la agregamos
//     } catch (error) {
//       console.error('Error al obtener la imagen: ', error); // Si falla, no la agregamos
//     }
//   }
//   return validImages;
// }