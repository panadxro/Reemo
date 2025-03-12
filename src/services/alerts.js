import { reactive } from 'vue';

const alerts = reactive([]);

function addAlert(message, severity) {
  // Eliminamos alerta existente si ya existe
  const existingAlert = alerts.find(alert => alert.message === message);
  if (existingAlert) {
    alerts.splice(alerts.indexOf(existingAlert), 1);
  }

  // Creamos una nueva alerta con un ID único
  const newAlert = { message, severity, id: Date.now() };

  // Agregamos la nueva alerta al inicio de la lista
  alerts.unshift(newAlert);

  // Limpiar alerta después de 3 segundos
  setTimeout(() => {
    // Verificamos si la alerta aún existe antes de intentar eliminarla
    const alertIndex = alerts.findIndex(alert => alert.id === newAlert.id);
    if (alertIndex !== -1) {
      alerts.splice(alertIndex, 1);
    }
  }, 3000);
}

function removeAlert(id) {
  const index = alerts.findIndex(alert => alert.id === id);
  if (index !== -1) {
    alerts.splice(index, 1);
  }
}

export { alerts, addAlert, removeAlert };