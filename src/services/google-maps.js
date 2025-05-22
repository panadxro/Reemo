import { Loader } from "@googlemaps/js-api-loader";


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
  if(!mapElementId){
    console.error('Se requiere el Id del elemento para iniciar el mapa')
    return;
  }

  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("map"), {
    center: { lat: -34.603722, lng: -58.381592 },
    zoom: 10,
    mapId: "4808da25693c56c8",
    streetViewControl: false,
    mapTypeControl: false,
  });

  return map;
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
      new google.maps.LatLng(car.coordenadas.lat, car.coordenadas.lng),
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

// Filtramos los autos por la Ubicacion



// export function updateCars(cars, searchLocation, map, filters = {}) {
export function updateCars(cars, searchLocation, map ) {
  if (!searchLocation || !searchLocation.lat || !searchLocation.lng) {
    console.error("searchLocation no es válido");
    // alert('No hay autos disponibles en esta zona')
    return [];
  }

  const searchLatLng = new google.maps.LatLng(
    searchLocation.lat,
    searchLocation.lng
  );
  
  const searchRadius = 5000;

  const filteredCars = cars.filter((car) => {
    if (!car.coordenadas) return false;

    const carLatLng = new google.maps.LatLng(
      car.coordenadas.lat,
      car.coordenadas.lng
    );
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      searchLatLng,
      carLatLng
    );
    
    return distance <= searchRadius;
  });

  // const filterByPreferences = filteredCars.filter(car => {
  //   return (
  //     car.price >= filters.minPrice &&
  //     car.price <= filters.maxPrice &&
  //     (filters.marca ? car.marca === filters.marca : true) &&
  //     (filters.modelo ? car.modelo === filters.modelo : true) &&
  //     (filters.transmision ? car.transmision === filters.transmision : true)
  //   );
  // });

  if (map) {
    // centramos el mapa en la busqueda
    map.setCenter(searchLocation);
    map.setZoom(14);
  }

  if (filteredCars.length === 0) {
    console.warn("No hay autos cercanos en esta zona.");
  }

  return filteredCars;
  // return filterByPreferences;
}


// Maneja el autocompletado del buscador de Google Maps
export function initAutocomplete(inputId, onPlaceSelected) {
  const input = document.getElementById(inputId);

  if (!input) {
    console.error("No se encontro el input", inputId);
    return;
  }

  const autocomplete = new google.maps.places.Autocomplete(input, {
    types: ["geocode"],
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
  });

}

// Funcion para obtener la ubicacion del usuario
export function getCurrentLocation(callback) {
  if (!navigator.geolocation) {
    console.error("La geolocalización no está disponible.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      };

      const geocoder = new google.maps.Geocoder();

      geocoder.geocode({ location }, (results, status) => {
        if (status === "OK" && results[0]) {
          callback({
            formattedAddress: results[0].formatted_address,
            location
          });
        } else {
          console.error("No se pudo obtener la dirección desde las coordenadas.");
        }
      });
    },
    (error) => {
      console.error("Error al obtener la ubicación:", error);
    }
  );
}


// export function getCurrentLocation(callback){
//   if(navigator.geolocation){
//     navigator.geolocation.getCurrentPosition(
//       (position) => {
//         const location = {
//           lat: position.coords.latitude,
//           lng: position.coords.longitude,
//         };
//         callback(location)
//       },
//       (error) => {
//         console.error("Error obteniendo la geolocalizacion", error)
//       }
//     );
//   }else{
//     console.warn('La geolocalizacion no esta soportada por este navegador')
//   }
// }

// Funcion para actualizar y mostrar los marcadores en el mapa de Google Maps
export async function updateMapMarkers(map, filteredCars, markers, comentarioIcon, vueInstance){
  if(!map){
    console.error('el mapa no se inicia')
    return [];
  }

  const { Marker } = await google.maps.importLibrary("marker"); 

  // limpia los marcadores anteriores
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  if (filteredCars.length === 0) {
    console.warn("No hay autos para mostrar en el mapa.");
    return markers;
  }

  const bounds = new google.maps.LatLngBounds();

  filteredCars.forEach(car => {
    if (!car.coordenadas || !car.coordenadas.lat || !car.coordenadas.lng) {
      console.warn(`El auto con ID ${car.id} no tiene coordenadas.`);
      return;
    }

    const position = {
      lat: car.coordenadas.lat,
      lng: car.coordenadas.lng
    };

    const marker = new google.maps.Marker({
      map: map,
      position: position,
      title: car.direccion,
      icon: {
        url: comentarioIcon,
        scaledSize: new google.maps.Size(50, 50), // Ajusta el tamaño del icono
        anchor: new google.maps.Point(25, 25), // Ajusta la posición del icono
      }
    });

    const imageUrl = car.images?.length ? car.images[0] : "default-image.jpg";
    const content = `
          <div class="infowindow-container">
            <figure class="infowindow-image">
              <img src="${imageUrl}" alt="${car.marca} ${car.modelo}" />
            </figure>
            <div class="infowindow-details">
              <h3>${car.marca} ${car.modelo}</h3>
              <p>⭐ 5.0 - 6 valoraciones</p>
              <p><strong>${car.precio} € / día</strong></p>
              <p>28040 Buenos Aires • Servicio de entrega disponible</p>
              <button class="infowindow-btn" id="btn-${car.id}">Ver Detalles</button>
            </div>
          </div>
        `;

    createOverlayView(map, car, marker, content, vueInstance);

    markers.push(marker);

    // Expande los límites del mapa
    bounds.extend(position); 
  });

  setTimeout(() => {
    if (filteredCars.length > 0) {
      map.fitBounds(bounds);
    }
  }, 500);

  return markers
}
