import { addDoc, doc, deleteDoc, getDoc, collection, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase';

async function uploadImage(file, userId, carId) {
  if (!file) return null;
  const timestamp = Date.now();
  const storageRef = ref(storage, `cars/${userId}/${carId}/${timestamp}.jpg`); 
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function saveCars({ user_id, email, marca, modelo, año, chasis, motor, combustible, kilometraje, patente, transmision, puertas, asientos, description, direccion, coordenadas, precio, accessories }, images) {
  const carsRef = collection(db, 'cars');

  // Cree esto que es como un id temporal parapasarlo como tercer parámetro y que funcione el storage y las fotos de un mismo auto se guarden en la misma carpeta
  const carId = `${user_id}-${Date.now()}`;

  try {
    const photoURLs = [];
    for (let i = 0; i < images.length; i++) {
      const url = await uploadImage(images[i], user_id, carId);
      if (url) {
        photoURLs.push(url);
      }
    }

    return addDoc(carsRef, {
      user_id,
      email,
      marca,
      modelo,
      año,
      chasis,
      motor,
      combustible,
      kilometraje,
      patente,
      transmision,
      puertas,
      asientos,
      description,
      direccion,
      coordenadas,
      precio,
      accessories: accessories || [],
      // isValidated:false,
      isAvailable: true,
      images: photoURLs,
      created_at: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error al guardar los datos del auto:', error);
    throw error;
  }
}

export function subscribeToNewPublication(callback) {
  const carsRef = collection(db, 'cars');
  const q = query(carsRef, orderBy('created_at'));

  onSnapshot(q, snapshot => {
      // Transformamos el snapshot en un array de mensajes.
      const messages = snapshot.docs.map(doc => {
          return {
              id: doc.id,
              email: doc.data().email,
              marca: doc.data().marca,
              modelo: doc.data().modelo,
              año: doc.data().año,
              chasis: doc.data().chasis,
              motor: doc.data().motor,
              combustible: doc.data().combustible,
              kilometraje: doc.data().kilometraje,
              patente: doc.data().patente,
              transmision: doc.data().transmision,
              puertas: doc.data().puertas,
              asientos: doc.data().asientos,
              description: doc.data().description,
              direccion: doc.data().direccion,
              precio: doc.data().precio,
              accessories: doc.data().accessories || []
          }
      });
      // Invocamos el callback que nos pasaron como parámetro y le mandamos los mensajes.
      callback(messages);
  });

}

export async function unsubscribeToPublication(idPublication) {
  try {
    const publicationRef = doc(db, 'cars', idPublication);
    const publicationSnapshot = await getDoc(publicationRef);

    if (!publicationSnapshot.exists()) {
      throw new Error('La publicación no existe');
    }

    const publicacionData = publicationSnapshot.data();
    const images = publicacionData.images || [];

    // Eliminar las imágenes utilizando el carId
    for (const fotoURL of images) {
      const fotoRef = ref(storage, fotoURL);
      await deleteObject(fotoRef);
    }

    // Eliminar el documento de la publicaciónm en Firestore
    await deleteDoc(publicationRef);

    console.log('Publicación y fotos eliminadas correctamente.');
    return { success: true };
  } catch (error) {
    console.error('Error eliminando la publicación y sus fotos:', error);
    return { success: false, message: error.message };
  }
}

export async function deleteCar(id) {
  try {
    const response = await unsubscribeToPublication(id); 
    return response.success 
      ? { success: true, message: 'Publicación eliminada' } 
      : { success: false, message: response.message };
  } catch (error) {
    console.error('Error al eliminar la publicación:', error);
    return { success: false, message: 'Error al eliminar la publicación' };
  }
}

export async function toggleAvailability(carId) {
  try {
    const carRef = doc(db, "cars", carId);
    const carSnapshot = await getDoc(carRef);

    if (!carSnapshot.exists()) {
      throw new Error("El auto no existe.");
    }

    const carData = carSnapshot.data();
    const newAvailability = !carData.isAvailable;

    await updateDoc(carRef, {
      isAvailable: newAvailability,
    });

    console.log(`Disponibilidad del auto ${carId} actualizada a: ${newAvailability}`);
    return { success: true, newAvailability };
  } catch (error) {
    console.error("Error al cambiar la disponibilidad del auto:", error);
    return { success: false, message: error.message };
  }
}