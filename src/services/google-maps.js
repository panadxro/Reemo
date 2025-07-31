import { Loader } from "@googlemaps/js-api-loader";
import { addAlert } from "./alerts.js";


export async function loadGoogleMaps(){
  const loader = new Loader({
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: ["places", "geometry"], 
  });

  try {
    await loader.load();
  } catch (error) {
    console.error("Error al cargar Google Maps:", error);
  }
}


// Iniciamos el mapa
let map = null;
export async function initMap(mapElementId) {
  try {
    if (!mapElementId) {
      console.error('Se requiere el Id del elemento para iniciar el mapa');
      return;
    }

    // Verificar que el elemento existe antes de crear el mapa
    const mapElement = document.getElementById(mapElementId);
    if (!mapElement) {
      console.error(`Elemento con ID '${mapElementId}' no encontrado en el DOM`);
      return;
    }

    const { Map } = await google.maps.importLibrary("maps");

    map = new Map(mapElement, {
      center: { lat: -34.603722, lng: -58.381592 },
      zoom: 10,
      mapId: "4808da25693c56c8",
      streetViewControl: false,
      mapTypeControl: false,
    });

    console.log('[google-maps.js initMap] Mapa inicializado correctamente.');
    return map;
  } catch (error) {
    console.error("[google-maps.js initMap] Error al inicializar el mapa de Google:", error);
    // Asumiendo que addAlert está definido en otro lugar
    // addAlert("Error crítico al cargar el mapa. Verifique la configuración de la API de Google Maps.", "error");
    throw error;
  }
}


export async function createOverlayView( map, car, marker, content, vueInstance) {
  const { OverlayView } = await google.maps.importLibrary("maps");

  class CustomOverlay extends OverlayView {
    constructor(position, content, map, vueInstance) {
      super();
      this.position = position;
      this.content = content;
      this.map = map;
      this.div = null;
      this.vueInstance = vueInstance;
      this.setMap(map);
    }

    onAdd() {
      this.div = document.createElement("div");
      this.div.classList.add("custom-overlay");
      this.div.innerHTML = this.content;

      const panes = this.getPanes();
      panes.floatPane.appendChild(this.div);

      // redirecciona a la descripcion de cada vehiculo
      setTimeout(() => {
        const btn = document.getElementById(`btn-${car.id}`);
        if (btn) {
          btn.addEventListener("click", () => {
            console.log(`Redirigiendo a detalles del auto con ID: ${car.id}`);
            vueInstance.goToCarDetails(car.id);
            // this.$router.push({ name: "CarDetails", params: { id: car.id } });
          });
        } else {
          console.warn(`No se encontró btn-${car.id}`);
        }
      }, 100);

      // Cerrar overlay al hacer clic fuera
      setTimeout(() => {
        this.closeOverlayListener = () => {
          this.setMap(null);
          this.vueInstance.activeOverlay = null;
        };

        map.addListener("click", this.closeOverlayListener);
      }, 100);
    }

    draw() {
      if (!this.div) return;
      const overlayProjection = this.getProjection();
      const position = overlayProjection.fromLatLngToDivPixel(this.position);

      if (position) {
        this.div.style.left = `${position.x}px`;
        this.div.style.top = `${position.y}px`;
      }
    }

    onRemove() {
      if (this.div) {
        this.div.remove();
        this.div = null;
      }

      // Eliminar el evento de cierre para evitar overlays persistentes
      if (this.closeOverlayListener) {
        google.maps.event.clearListeners(map, "click");
        this.closeOverlayListener = null;
      }
    }
  }

  // Cerrar el overlay anterior si existe
  if (vueInstance.activeOverlay) {
    vueInstance.activeOverlay.setMap(null);
    vueInstance.activeOverlay = null;
  }

  marker.addListener("click", () => {
    console.log("car ID", car);
    // Cierra cualquier overlay activo antes de abrir uno nuevo
    console.log("Tipo de activeOverlay:", vueInstance.activeOverlay);

    if (vueInstance.activeOverlay) {
      vueInstance.activeOverlay.setMap(null);
    }

    const overlay = new CustomOverlay(
      new google.maps.LatLng(car.status?.currentLocation.location.lat, car.status?.currentLocation.location.lng),
      content,
      map,
      vueInstance
    );

    vueInstance.activeOverlay = overlay;
  });
}


// export async function createMarker(map, car) {
//   const { OverlayView } = await google.maps.importLibrary("maps");

//   class CustomMarker extends OverlayView {
//     constructor(map, car) {
//       super();
//       this.map = map;
//       this.car = car;
//       this.div = null;
//       this.setMap(map);
//     }

//     onAdd() {
//       this.div = document.createElement("div");
//       this.div.className = "custom-marker";
//       this.div.innerHTML = `
//         <div class="marker-content">
//           <img src="../services/google-maps.js" class="marker-icon"/>
//           <span class="marker-price">${this.car.price} EUR</span>
//         </div>
//       `;

//       this.div.addEventListener("click", () => {
//         console.log("Clic en el vehículo: ", this.car);
//         window.location.href = `/detalles/${this.car.id}`;
//       });

//       const panes = this.getPanes();
//       panes.overlayMouseTarget.appendChild(this.div);
//     }

//     draw() {
//       const overlayProjection = this.getProjection();
//       const position = overlayProjection.fromLatLngToDivPixel(
//         new google.maps.LatLng(
//           this.car.coordenadas.lat,
//           this.car.coordenadas.lng
//         )
//       );

//       if (this.div && position) {
//         this.div.style.left = `${position.x}px`;
//         this.div.style.top = `${position.y}px`;
//       }
//     }

//     onRemove() {
//       if (this.div) {
//         this.div.parentNode.removeChild(this.div);
//         this.div = null;
//       }
//     }
//   }

//   //  Retornar la instancia del marcador
//   return new CustomMarker(map, car);
// }


const MAX_DISTANCE_KM = 50; // Radio de búsqueda en kilómetros. ¡Ajusta este valor si es necesario!

function calculateDistance(coords1, coords2) {
  if (!coords1 || !coords2 || typeof coords1.lat !== 'number' || typeof coords1.lng !== 'number' || typeof coords2.lat !== 'number' || typeof coords2.lng !== 'number') {
    return Infinity; 
  }
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLon = toRad(coords2.lng - coords1.lng);
  const lat1 = toRad(coords1.lat);
  const lat2 = toRad(coords2.lat);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Filtramos los autos por la Ubicacion
export function updateCars(allCars, searchLocation) {
  if (!searchLocation || typeof searchLocation.lat !== 'number' || typeof searchLocation.lng !== 'number') {
    console.warn('[updateCars] searchLocation inválida, mostrando todos los autos con coordenadas válidas');
    return allCars.filter(car => 
      car?.status?.currentLocation?.location &&
      typeof car.status.currentLocation.location.lat === 'number' &&
      typeof car.status.currentLocation.location.lng === 'number'
    );
  }

  // Primero filtrar autos con coordenadas válidas
  const validCars = allCars.filter(car => {
    return car?.status?.currentLocation?.location &&
           typeof car.status.currentLocation.location.lat === 'number' &&
           typeof car.status.currentLocation.location.lng === 'number';
  });

  if (validCars.length !== allCars.length) {
    console.warn(`[updateCars] ${allCars.length - validCars.length} autos omitidos por coordenadas inválidas`);
  }

  const nearbyCars = validCars.filter(car => {
    const carLocation = car.status.currentLocation.location;
    const distance = calculateDistance(searchLocation, carLocation);
    return distance <= MAX_DISTANCE_KM;
  });

  return nearbyCars;
}

// export function updateCars(cars, searchLocation, map ) {
//   if (!searchLocation || !searchLocation.lat || !searchLocation.lng) {
//     console.error("searchLocation no es válido");
//     // alert('No hay autos disponibles en esta zona')
//     return [];
//   }

//   console.log('[updateCars] search location tiene: ', searchLocation)
//   const searchLatLng = new google.maps.LatLng(
//     searchLocation.lat,
//     searchLocation.lng
//   );
  
//   const searchRadius = 10000;

//   const filteredCars = cars.filter((car) => {
//     if (!car.coordenadas) return false;
    
//     console.log(`[updateCars] Procesando coche ID: ${car.id}. Ubicación del coche:`, car.status?.currentLocation?.location, 'Buscando cerca de:', searchLocation);

//     const carLatLng = new google.maps.LatLng(
//       car.status?.currentLocation.location.lat,
//       car.status?.currentLocation.location.lng
//     );
//     const distance = google.maps.geometry.spherical.computeDistanceBetween(
//       searchLatLng,
//       carLatLng
//     );
    
//     return distance <= searchRadius;
//   });

//   if (map) {
//     // centramos el mapa en la busqueda
//     map.setCenter(searchLocation);
//     map.setZoom(14);
//   }

//   if (filteredCars.length === 0) {
//     console.warn("No hay autos cercanos en esta zona.");
//     addAlert('No hay autos disponibles en esta zona', 'warning')
//   }

//   return filteredCars;
//   // return filterByPreferences;
// }


// Maneja el autocompletado del buscador de Google Maps
export function initAutocomplete(inputId, onPlaceSelected) {
  const input = document.getElementById(inputId);

  if (!input) {
    console.error("No se encontro el input", inputId);
    return;
  }

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"], // O ['address'] si prefieres
    componentRestrictions: { country: "AR" },
    fields: ["formatted_address", "geometry"],
  });

  autocomplete.addListener("place_changed", () => {
    const place = autocomplete.getPlace();

    if (!place.geometry || !place.geometry.location) {
      console.error("No se pudo obtener la direccion o coordenadas")
      return;
    }

    const formattedAddress = place.formatted_address;
    const location = place.geometry.location.toJSON();

    // Llama la funcion que maneja la seleccion del lugar
    if(onPlaceSelected && typeof onPlaceSelected == 'function'){
      onPlaceSelected({ formattedAddress, location })
    }

    // podemos extraer otros componentes como la ciudad
    // city: place.address_components.find(c => c.types.includes("locality"))?.long_name,
    // country: place.address_components.find(c => c.types.includes("country"))?.long_name,
  });

}

// Funcion para obtener la ubicacion del usuario
export function getCurrentLocation() {
  return new Promise(async (resolve, reject) => {
    if (!navigator.geolocation) {
      const errorMsg = "La geolocalización no está disponible en este navegador.";
      console.error(errorMsg);
      addAlert(errorMsg, "error");
      reject(new Error(errorMsg));
      return;
    }

    // Importar Geocoder aquí para asegurar que la librería de places esté cargada
    let Geocoder;
    try {
      const { Geocoder: GmsGeocoder } = await google.maps.importLibrary("geocoding");
      Geocoder = GmsGeocoder;
    } catch (error) {
      console.error("Error al importar la librería de geocoding de Google Maps:", error);
      addAlert("Error al inicializar el servicio de geocodificación.", "error");
      reject(new Error("Error al inicializar geocoding."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };

        // Primero resolvemos con las coordenadas para una actualización rápida del mapa
        // El componente puede usar esto para centrar el mapa inmediatamente.
        // Luego, procedemos a obtener la dirección formateada.

        const geocoder = new Geocoder();
        geocoder.geocode({ 'location': location }, (results, status) => {
          if (status === "OK" && results[0]) {
            resolve({
              formattedAddress: results[0].formatted_address,
              location // {lat, lng}
            });
          } else {
            console.error("Geocoder falló debido a: " + status);
            // Aún podríamos resolver con la ubicación si la geocodificación falla
            addAlert("No se pudo obtener la dirección para tu ubicación, pero se usaron las coordenadas.", "warning");
            reject(new Error("Geocoder falló: " + status));
          }
        });
      },
      (error) => {
        console.error("Error al obtener la ubicación:", error.message);
        // addAlert(`Error al obtener tu ubicación: ${error.message}`, "error");
        reject(error);
      }
      // Opciones para getCurrentPosition que podrían ayudar a obtener una respuesta más rápida
      // ,{
      //   enableHighAccuracy: false, // Puede ser más rápido si no se necesita alta precisión
      //   timeout: 10000, // 10 segundos de timeout
      //   maximumAge: 60000 // Aceptar una posición en caché de hasta 1 minuto
      // }
    );
  });
}


// Funcion para actualizar y mostrar los marcadores en el mapa de Google Maps
// export async function updateMapMarkers(map, filteredCars, markers, comentarioIcon, vueInstance){
//   if(!map){
//     console.error('el mapa no se inicia')
//     return [];
//   }

//   const { Marker } = await google.maps.importLibrary("marker"); 

//   // limpia los marcadores anteriores
//   markers.forEach(marker => marker.setMap(null));
//   markers = [];

//   if (filteredCars.length === 0) {
//     console.warn("No hay autos para mostrar en el mapa.");
//     addAlert('No hay autos disponibles en esta zona', 'warning')
//     return markers;
//   }

//   const bounds = new google.maps.LatLngBounds();

//   filteredCars.forEach(car => {
//     if (!car.coordenadas || !car.coordenadas.lat || !car.coordenadas.lng) {
//       console.warn(`El auto con ID ${car.id} no tiene coordenadas.`);
//       return;
//     }

//     const position = {
//       lat: car.coordenadas.lat,
//       lng: car.coordenadas.lng
//     };

//     const marker = new google.maps.Marker({
//       map: map,
//       position: position,
//       title: car.direccion,
//       icon: {
//         url: comentarioIcon,
//         scaledSize: new google.maps.Size(50, 50), // Ajusta el tamaño del icono
//         anchor: new google.maps.Point(25, 25), // Ajusta la posición del icono
//       }
//     });

//     const imageUrl = car.images?.length ? car.images[0] : "default-image.jpg";
// const content = `
// <div class="w-80 bg-white rounded-2xl shadow-lg p-4 space-y-4 text-gray-800 overflow-hidden border border-gray-200">
//   <!-- Estados y ícono -->
//   <div class="flex items-start justify-between">
//     <div class="space-x-2">
//       <span class="text-xs bg-yellow-100 text-yellow-800 font-semibold px-2 py-0.5 rounded-full">Nuevo</span>
//       <span class="text-xs bg-green-100 text-green-800 font-semibold px-2 py-0.5 rounded-full">Disponible</span>
//     </div>
//     <button class="p-1 text-gray-500 hover:bg-gray-100 rounded-full">
//       ✏️
//     </button>
//   </div>

//   <!-- Imagen principal -->
//   <div class="w-full h-52 rounded-xl overflow-hidden border border-gray-200">
//     <img src="${imageUrl}" alt="Auto" class="w-full h-full object-cover">
//   </div>

//   <!-- Galería -->
//   <div class="flex overflow-x-auto space-x-2">
//     <img src="${imageUrl}" alt="Vista 1" class="w-20 h-14 object-cover rounded-lg border-2 border-cyan-300">
//     <img src="${imageUrl}" alt="Vista 2" class="w-20 h-14 object-cover rounded-lg border-2 border-cyan-300">
//     <img src="${imageUrl}" alt="Vista 3" class="w-20 h-14 object-cover rounded-lg border-2 border-cyan-300">
//     <img src="${imageUrl}" alt="Vista 4" class="w-20 h-14 object-cover rounded-lg border-2 border-cyan-300">
//   </div>

//   <!-- Descripción -->
//   <div>
//     <p class="text-sm text-gray-500">Ford</p>
//     <div class="flex items-center justify-between">
//       <h2 class="text-2xl font-bold text-blue-900">Focus</h2>
//       <div class="flex items-center space-x-1 text-yellow-500 text-sm">
//         <span>4.7</span>
//         <span>⭐</span>
//       </div>
//     </div>
//   </div>

//   <!-- Usuario -->
//   <div class="flex items-center space-x-3">
//     <img src="${imageUrl}" alt="User" class="w-9 h-9 rounded-full border border-gray-300">
//     <p class="font-medium text-gray-800">Jazmín Vega</p>
//   </div>

//   <!-- Año y tipo -->
//   <div class="flex justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
//     <div>
//       <p class="font-semibold">Año</p>
//       <p>2018</p>
//     </div>
//     <div>
//       <p class="font-semibold">Tipo</p>
//       <p>Hatchback</p>
//     </div>
//     <div class="text-right">
//       <p class="font-semibold text-gray-800 text-lg">$50k <span class="text-sm font-normal text-gray-500">/ hora</span></p>
//     </div>
//   </div>
// </div>
// `;

//     createOverlayView(map, car, marker, content, vueInstance);

//     markers.push(marker);

//     // Expande los límites del mapa
//     bounds.extend(position); 
//   });

//   setTimeout(() => {
//     if (filteredCars.length > 0) {
//       map.fitBounds(bounds);
//     }
//   }, 500);

//   return markers
// }


/**
 * Filtra los coches basándose en la proximidad a una ubicación de búsqueda.
 * @param {Array<Object>} allCars - Array completo de todos los coches disponibles.
 * @param {Object} searchLocation - Objeto con {lat, lng} de la ubicación de búsqueda.
 * @param {google.maps.Map} mapInstance - (Opcional) Instancia del mapa, no siempre necesaria aquí.
 * @returns {Array<Object>} - Array de coches filtrados.
 */
export async function updateMapMarkers(map, cars, existingMarkers, iconUrl, onMarkerClickCallback) {
  // Limpiar marcadores existentes
  existingMarkers.forEach(marker => marker.setMap(null));
  const newMarkers = [];

  if (!map) {
    console.error('[google-maps.js] updateMapMarkers: El mapa no está inicializado.');
    return newMarkers;
  }

  if (!cars || cars.length === 0) {
    console.log("[google-maps.js] updateMapMarkers: No hay coches para mostrar.");
    return newMarkers;
  }

  const bounds = new google.maps.LatLngBounds();
  let validMarkersCount = 0;

  cars.forEach(car => {
    try {
      // Verificación más robusta de las coordenadas
      if (!car?.status?.currentLocation?.location ||
          typeof car.status.currentLocation.location.lat !== 'number' ||
          typeof car.status.currentLocation.location.lng !== 'number' ||
          isNaN(car.status.currentLocation.location.lat) ||
          isNaN(car.status.currentLocation.location.lng)) {
        console.warn(`[updateMapMarkers] Coche ${car.id} omitido - coordenadas inválidas`);
        return;
      }

      const position = {
        lat: car.status.currentLocation.location.lat,
        lng: car.status.currentLocation.location.lng
      };

      const marker = new google.maps.Marker({
        position: position,
        map: map,
        title: `${car.basicInfo?.brand || ''} ${car.basicInfo?.model || ''}`,
        icon: iconUrl ? { 
          url: iconUrl, 
          scaledSize: new google.maps.Size(40, 40) 
        } : undefined,
      });

      marker.addListener('click', () => {
        if (typeof onMarkerClickCallback === 'function') {
          onMarkerClickCallback({...car});
        }
      });

      newMarkers.push(marker);
      bounds.extend(position);
      validMarkersCount++;
    } catch (error) {
      console.error(`[updateMapMarkers] Error al crear marcador para coche ${car.id}:`, error);
    }
  });

  if (validMarkersCount > 0) {
    setTimeout(() => {
      if (map && typeof map.fitBounds === 'function') {
        map.fitBounds(bounds);
        if (validMarkersCount === 1 && map.getZoom() > 15) {
          map.setZoom(14);
        }
      }
    }, 100);
  } else {
    console.log("[updateMapMarkers] No se pudo crear ningún marcador válido");
  }

  return newMarkers;
}


// export async function updateMapMarkers(map, cars, existingMarkers, iconUrl, onMarkerClickCallback) {
//   // 1. Limpiar marcadores existentes del mapa y del array
//   existingMarkers.forEach(marker => marker.setMap(null));
//   let newMarkers = [];
//   // existingMarkers.length = 0;


//   if (!map) {
//     console.error('[google-maps.js] updateMapMarkers: El mapa no está inicializado.');
//     return newMarkers;
//   }

//   if (!cars || cars.length === 0) {
//     console.warn("[google-maps.js] updateMapMarkers: No hay coches filtrados para mostrar en el mapa.");
//     return newMarkers; 
//   }
  
//   // console.log('[google-maps.js] updateMapMarkers: Creando marcadores para', cars.length, 'coches.');
//   const bounds = new google.maps.LatLngBounds();

//   // 2. Crear nuevos marcadores
//   cars.forEach(car => {
//     // Asegurarse de que el coche tiene una ubicación válida
//     if (!car.coordenadas || typeof car.status.currentLocation.location.lat !== 'number' || typeof car.status.currentLocation.location.lng !== 'number') {
//       console.warn('[google-maps.js] Coche omitido por ubicación inválida o faltante:', car.id, car.location);
//       return;
//     }

//     const marker = new google.maps.Marker({
//       position: { lat: car.status.currentLocation.location.lat, lng: car.status.currentLocation.location.lng },
//       map: map,
//       icon: iconUrl ? {
//         url: iconUrl,
//         scaledSize: new google.maps.Size(40, 40) // Ajusta el tamaño
//       } : undefined, // Usa el icono por defecto si iconUrl no se proporciona
//       title: `${car.marca} ${car.modelo}` // Tooltip al pasar el mouse
//     });

//     // Crear una copia del objeto 'car' para el listener.
//     // Aseguramos que si el objeto original en el array 'cars' es modificado después,
//     // el listener todavía tendrá los datos correctos de cuando se creo el marcador.
//     const carDataForCallback = JSON.parse(JSON.stringify(car));

//     // 3. Añadir listener de clic al marcador
//     marker.addListener('click', () => {
//       // console.log('[google-maps.js] Marcador pulsado. Objeto de coche en el ámbito del oyente.:', JSON.parse(JSON.stringify(carDataForCallback)));
//       // console.log('[google-maps.js] car.location en el ámbito del oyente:', carDataForCallback.coordenadas);

//       if (typeof onMarkerClickCallback === 'function') {
//         onMarkerClickCallback(carDataForCallback); // Llamar al callback con los datos del coche
//       } else {
//         console.error("[google-maps.js] onMarkerClickCallback no es una función. Verifica que se pasa correctamente desde Maps.vue.");
//       }
//     });

//     // existingMarkers.push(marker);
//     newMarkers.push(marker);
//     bounds.extend(marker.getPosition());
//   });

//   // return existingMarkers;

//   if (newMarkers.length > 0) {
//     // Usar un pequeño timeout puede ayudar si el mapa aún se está renderizando o ajustando
//     setTimeout(() => {
//       if (map && typeof map.fitBounds === 'function') { 
//         map.fitBounds(bounds);
//         // Si solo hay un marcador, fitBounds puede hacer un zoom excesivo.
//         if (newMarkers.length === 1 && map.getZoom() > 15) { // 15 es un ejemplo, ajústalo
//           map.setZoom(14);
//         }
//       }
//     }, 100);
//   }

//   // console.log('[google-maps.js] updateMapMarkers: Retornando', newMarkers.length, 'marcadores nuevos.');
//   return newMarkers; 

// }
