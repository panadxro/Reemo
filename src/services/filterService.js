
export function filterByPreferences(cars, filters){
  // console.log('filtros recibidos', filters)
    return cars.filter(car => {{
      // console.log('analizando', car)
        const matchesPrice = 
          car.precio >= filters.minPrice &&
          car.precio <= filters.maxPrice;

        const brand = filters.brand
          ? car.marca.toLowerCase().includes(filters.brand.toLowerCase())
          : true;

        const model = filters.model
          ? car.modelo.toLowerCase().includes(filters.model.toLowerCase())
          : true;

        const chassis = filters.chassis?.length 
          ? filters.chassis.some(filtro =>
            removeAccents(car.chasis).toLowerCase().includes(removeAccents(filtro))
          )
          : true;

        const transmission = filters.transmission ? car.transmision === filters.transmission : true;

        const result = matchesPrice && brand && model && transmission && chassis;
        // console.log(`${car.marca} ${car.modelo} - Match`, result);
        // if (!matchesPrice || !brand || !model || !transmission || !chassis) {
        //   console.log("❌ Filtro fallido:", {
        //     marca: car.marca,
        //     modelo: car.modelo,
        //     price: car.price,
        //     chassis: car.chasis,
        //     transmision: car.transmision,
        //     matchesPrice, brand, model, transmission, chassis
        //   });
        // }

        return result;
    }})

} 


function removeAccents(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/á|à|ä|â/gi, "a")
    .replace(/é|è|ë|ê/gi, "e")
    .replace(/í|ì|ï|î/gi, "i")
    .replace(/ó|ò|ö|ô/gi, "o")
    .replace(/ú|ù|ü|û/gi, "u")
    .replace(/ñ/gi, "n")
    .toLowerCase();
}