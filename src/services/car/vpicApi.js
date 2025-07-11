const VPIC_BASE_URL = 'https://vpic.nhtsa.dot.gov/api/vehicles';

export const vpicService = {
  async getBrands() {
  try {
    const response = await fetch(`${VPIC_BASE_URL}/getallmakes?format=json`);
    if (!response.ok) throw new Error('Error al obtener marcas');
    
    const data = await response.json();
    
    const allowedBrands = ['TOYOTA', 'HONDA', 'FORD', 'CHEVROLET', 'VOLKSWAGEN', 'BMW', 'MERCEDES-BENZ', 'AUDI', 'NISSAN', 'HYUNDAI', 'KIA', 'SUBARU', 'MAZDA', 'VOLVO', 'JEEP', 'DODGE', 'CHRYSLER', 'TESLA', 'LAND ROVER', 'LEXUS'];
    
    return data.Results
      .filter(make => allowedBrands.includes(make.Make_Name))
      .map(make => ({
        value: make.Make_Name,
        label: make.Make_Name
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  } catch (error) {
    console.error('Error fetching brands:', error);
    return [];
  }
},

  async getModelsForMake(makeName) {
    try {
      const response = await fetch(`${VPIC_BASE_URL}/getmodelsformake/${encodeURIComponent(makeName)}?format=json`);
      if (!response.ok) throw new Error('Error al obtener modelos');
      
      const data = await response.json();
      return data.Results.map(model => ({
        value: model.Model_Name,
        label: model.Model_Name
      })).sort((a, b) => a.label.localeCompare(b.label));
    } catch (error) {
      console.error('Error fetching models:', error);
      return [];
    }
  },

   async getVehicleDetails(makeName, modelName, year) {
    try {
      const response = await fetch(`${VPIC_BASE_URL}/getmodelsformakeyear/make/${encodeURIComponent(makeName)}/modelyear/${year}?format=json`);
      if (!response.ok) throw new Error('Error al obtener detalles del vehículo');
      
      const data = await response.json();
      return data.Results;
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      return [];
    }
  }
};