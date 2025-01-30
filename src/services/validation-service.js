export function validateStep1(newCar, errors) {
    // Validación para "marca" con los respectivos mensajes de cada erorr
    if (!newCar.marca) {
      // Si no hay ningún valor en marca, entra en este if y asigna un mensaje de error a errors.marca - Que después lo llamamos debajo del input en rojo
      errors.marca = "El campo marca no puede estar vacío";
    } else if (newCar.marca.length < 3) {
      // Si marca tiene valor pero tiene menos de tres letras, entra en este if y asigna un mensaje de error a errors.marca. Que después lo llamamos debajo del input en rojo
      errors.marca = "La marca debe tener al menos 3 letras";
    } else {
      // Como no hay ningún error, se asigna null a errors.marca, lo que significa que no hay ningún error para este campo.
      errors.marca = null;
    }

    // SE REPITEN VALIDACIONES DE MARCA ⬇️⬇️⬇️⬇️⬇️⬇️

    // Validación para "modelo" con los respectivos mensajes de cada erorr
    if (!newCar.modelo) {
      errors.modelo = "El campo modelo no puede estar vacío";
    } else if (newCar.modelo.length < 2) {
      errors.modelo = "El modelo debe tener al menos 2 letras";
    } else {
      errors.modelo = null;
    }

    // Validación para "año" con los respectivos mensajes de cada erorr
    if (!newCar.año) {
      errors.año = "El campo año no puede estar vacío";
    } else if (isNaN(newCar.año)) {
      errors.año = "El año debe ser un número";
    } else if (newCar.año < 2005 ) {
      errors.año = "El año debe ser mayor a 2005";
    } else if (newCar.año > 2024 ) {
      errors.año = "El año no puede ser mayor que 2024";
    } else {
      errors.año = null;
    }

    // Validación para "patente" con los respectivos mensajes de cada erorr
    if (!newCar.patente) {
      errors.patente = "El campo patente no puede estar vacío";
    } else if (newCar.patente.length < 6) {
      errors.patente = "La patente debe tener al menos 6 caracteres";
    } else if (newCar.patente.length > 7) {
      errors.patente = "La patente no puede tener más de 7 caracteres - No pongas espacios ni guiones";
    } else {
      errors.patente = null;
    }

    // Retorna true solo si todos los campos son válidos, es decir qwue no se encontraron errores
    return !errors.marca && !errors.modelo && !errors.año && !errors.patente;
  };

  export function validateStep2(newCar, errors) {

    if (!newCar.description) {
      errors.description = "El campo descripción no puede estar vacío";
    } else if (newCar.description.length < 20) {
      errors.description = "La descripción debe tener al menos 20 letras";
    } else if (newCar.description.length > 300) {
      errors.description = "La descripción no puede tener más de 300 letras";
    } else {
      errors.description = null;
    }

    if (!newCar.direccion) {
      errors.direccion = "El campo dirección no puede estar vacío";
    } else if (newCar.direccion.length < 6) {
      errors.direccion = "La dirección debe tener al menos 6 caracteres";
    } else if (newCar.direccion.length > 200) {
      errors.direccion = "La dirección no puede tener más de 200 caracteres";
    } else if (!/^[\w\s.,#-áéíóúñÁÉÍÓÚÑ]+$/.test(newCar.direccion)) {
      errors.direccion = "La dirección contiene caracteres no permitidos";
    } else if (!/\d/.test(newCar.direccion)) {
      errors.direccion = "La dirección debe contener al menos un número";
    } else {
      errors.direccion = null; // Validación exitosa
    }

    if (!newCar.combustible) {
      errors.combustible = "El campo combustible no puede estar vacío";
    } else {
      errors.combustible = null;
    }

    if (!newCar.transmision) {
      errors.transmision = "El campo transmisión no puede estar vacío";
    } else {
      errors.transmision = null;
    }

    if (!newCar.kilometraje) {
      errors.kilometraje = "El campo kilometraje no puede estar vacío";
    } else {
      errors.kilometraje = null;
    }

    return !errors.description && !errors.direccion && !errors.combustible && !errors.kilometraje && !errors.transmision;
  };

  export function validateStep3(newCar, errors) {
    if (!newCar.chasis) {
      errors.chasis = "El campo chasis no puede estar vacío";
    } else {
      errors.chasis = null;
    }

    if (!newCar.motor) {
      errors.motor = "El campo motor no puede estar vacío";
    } else {
      errors.motor = null;
    }

    if (!newCar.puertas) {
      errors.puertas = "El campo puertas no puede estar vacío";
    } else if (isNaN(newCar.puertas)) {
      errors.puertas = "El campo puertas debe ser un número";
    } else if (newCar.puertas < 2 ) {
      errors.puertas = "El auto debe tener más de 2 puertas";
    } else if (newCar.puertas > 5 ) {
      errors.puertas = "El auto no puede tener más de 5 puertas";
    } else {
      errors.puertas = null;
    }

    if (!newCar.asientos) {
      errors.asientos = "El campo asientos no puede estar vacío";
    } else if (isNaN(newCar.asientos)) {
      errors.asientos = "El campo asientos debe ser un número";
    } else if (newCar.asientos < 2 ) {
      errors.asientos = "El auto debe tener más de 2 asientos";
    } else if (newCar.asientos > 7 ) {
      errors.asientos = "El auto no puede tener más de 7 asientos";
    } else {
      errors.asientos = null;
    }

    // Se me ocurrió validarlo así pero no se si está bien, sino lo sacamos
    if (newCar.accessories.length == 0 ) {
      errors.accessories = "Selecciona al menos un accessorio";
    } else {
      errors.accessories = null;
    }

    if (!newCar.precio) {
      errors.precio = "El campo precio no puede estar vacío";
    } else if (newCar.precio < 20000) {
      errors.precio = "El precio por día no puede ser menor a $20000";
    } else if (newCar.precio > 100000) {
      errors.precio = "El precio por día no puede ser mayor a $100000";
    } else if (isNaN(newCar.precio)) {
      errors.precio = "El campo precio debe ser un número";
    } 
    else {
      errors.precio = null;
    }

    return !errors.chasis && !errors.motor && !errors.puertas && !errors.asientos && !errors.accessories && !errors.precio;
  };

  export function validateStep4(selectedFiles, errors) {
    const validFiles = selectedFiles.filter(file => file !== null);
    if (validFiles.length < 4) {
        errors.photos = "Debés subir 4 fotos del vehículo";
        return false;
    }
    errors.photos = null;
    return true;
  }