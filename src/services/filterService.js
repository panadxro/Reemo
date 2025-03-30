
export function filterCars(cars, filters){
    let filteredCars = [...cars];

    // filtros por ubicacion
    if (filters.searchLocation && filters.map){
        filteredCars = updateCars(filteredCars, filters.searchLocation, filters.map);
    };

    // filtros por precio
    if(filters.minPrice !== undefined && filters.maxPrice !== undefined){
        filteredCars = filteredCars.filter(car => 
          car.price >= filters.minPrice && car.price <= filters.maxPrice
        );
    };

    // filtros por marca
    

    return filteredCars;
} 