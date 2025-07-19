let cachedProvinciasYLocalidades = null;

export const getProvinciasYLocalidades = async () => {
  if (cachedProvinciasYLocalidades) {
    return cachedProvinciasYLocalidades;
  }

  try {
    const responseProvincias = await fetch('https://apis.datos.gob.ar/georef/api/provincias');
    const dataProvincias = await responseProvincias.json();

    const provincias = dataProvincias.provincias;
    const provinciasConLocalidades = [];

    for (const provincia of provincias) {
      const responseLocalidades = await fetch(`https://apis.datos.gob.ar/georef/api/localidades?provincia=${provincia.id}&campos=nombre&max=5000`);
      const dataLocalidades = await responseLocalidades.json();

      provinciasConLocalidades.push({
        nombre: provincia.nombre,
        localidades: dataLocalidades.localidades.map(localidad => localidad.nombre)
      });
    }

    cachedProvinciasYLocalidades = provinciasConLocalidades;
    return provinciasConLocalidades;
  } catch (error) {
    console.error('Error:', error);
    return [];
  }
};