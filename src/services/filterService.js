
export function filterByPreferences(cars, filters){
  // console.log('filtros recibidos', filters)
    return cars.filter(car => {{
      // console.log('analizando', car)
        const matchesPrice = 
          car.pricing.rates.daily >= filters.minPrice &&
          car.pricing.rates.daily <= filters.maxPrice;

        const brand = filters.brand
          ? car.basicInfo.brand.toLowerCase().includes(filters.brand.toLowerCase())
          : true;

        const model = filters.model
          ? car.basicInfo.model.toLowerCase().includes(filters.model.toLowerCase())
          : true;

        const chassis = filters.chassis?.length 
          ? filters.chassis.some(filtro =>
            removeAccents(car.basicInfo.type).toLowerCase().includes(removeAccents(filtro))
          )
          : true;

        const transmission = filters.transmission ? car.specifications.transmission === filters.transmission : true;

        const result = matchesPrice && brand && model && transmission && chassis;
        console.log(`${car.basicInfo.brand} ${car.basicInfo.model} - Match`, result);
        if (!matchesPrice || !brand || !model || !transmission || !chassis) {
          console.log("❌ Filtro fallido:", {
            marca: car.basicInfo.brand,
            modelo: car.basicInfo.model,
            price: car.pricing.rates.daily,
            chassis: car.basicInfo.type,
            transmision: car.specifications.transmission,
            matchesPrice, brand, model, transmission, chassis
          });
        }

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