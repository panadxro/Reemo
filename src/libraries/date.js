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