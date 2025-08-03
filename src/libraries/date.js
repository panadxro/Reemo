export function formatDateHour(date) {
    if(!date) return null;

    const formatter = new Intl.DateTimeFormat('es-AR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit', hour12: false
    });
    return formatter.format(date).replace(',', '');
}

export function formatDate(date) {
    if (!date) return null;
  
    if (typeof date.toDate === 'function') {
      date = date.toDate();
    }
  
    const formatter = new Intl.DateTimeFormat('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return formatter.format(date);
  }

export function formatDateTime(timestamp) {
  // Obtener la fecha actual y la fecha del timestamp
  const now = new Date();
  let date;
  
  // Convertir el timestamp a fecha
  if (timestamp && timestamp.seconds) {
    date = new Date(timestamp.seconds * 1000);
  } else if (typeof timestamp === 'string') {
    date = new Date(timestamp);
  } else {
    return 'Fecha no disponible';
  }

  // Calcular la diferencia en milisegundos
  const diffMs = now - date;
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Formatear según la diferencia de tiempo
  if (diffHours < 24) {
    return `${diffHours}hr`; // Menos de 24 horas: mostrar horas
  } else if (diffDays < 7) {
    return `${diffDays}d`; // Menos de 7 días: mostrar días
  } else {
    // Más de 7 días: mostrar día y mes abreviado
    const months = [
      'ene', 'feb', 'mar', 'abr', 'may', 'jun',
      'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
    ];
    const day = date.getDate().toString().padStart(2, '0');
    const month = months[date.getMonth()];
    return `${day} ${month}`;
  }
};

export function formatNotificationDate(timestamp){
  if (!timestamp) return '';
  
  const now = new Date();
  let notificationDate;
  
  if (timestamp.seconds) {
    notificationDate = new Date(timestamp.seconds * 1000);
  } else {
    notificationDate = new Date(timestamp);
  }
  
  const diffMs = now - notificationDate;
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHours = Math.round(diffMin / 60);
  const diffDays = Math.round(diffHours / 24);
  
  if (diffSec < 60) {
    return 'Ahora';
  } else if (diffMin < 60) {
    return `Hace ${diffMin} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} h`;
  } else if (diffDays === 1) {
    return 'ayer';
  } else if (diffDays < 7) {
    return `Hace ${diffDays} días`;
  }
  
  const options = { 
    month: 'short', 
    day: 'numeric',
  };
  
  return notificationDate.toLocaleDateString('es-ES', options);
};