/**
 * utils.js - Funciones utilitarias generales
 * Dashboard de Contratación Pública
 */

/**
 * Formatea un número como moneda
 * @param {number} amount - Cantidad a formatear
 * @param {string} currency - Código de moneda (por defecto USD)
 * @returns {string} - Cantidad formateada como moneda
 */
function formatCurrency(amount, currency = 'USD') {
  if (amount === null || amount === undefined) {
      return '-';
  }
  
  return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
  }).format(amount);
}

/**
* Formatea una fecha al formato local
* @param {string|Date} date - Fecha a formatear
* @param {boolean} includeTime - Si se debe incluir la hora
* @returns {string} - Fecha formateada
*/
function formatDate(date, includeTime = false) {
  if (!date) {
      return '-';
  }
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
      return '-';
  }
  
  const options = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
  };
  
  if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
  }
  
  return dateObj.toLocaleDateString('es-MX', options);
}

/**
* Trunca un texto largo a una longitud determinada
* @param {string} text - Texto a truncar
* @param {number} maxLength - Longitud máxima
* @returns {string} - Texto truncado
*/
function truncateText(text, maxLength = 50) {
  if (!text) {
      return '';
  }
  
  if (text.length <= maxLength) {
      return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

/**
* Traduce un estado a español y asigna una clase de color
* @param {string} status - Estado en inglés
* @returns {Object} - Objeto con texto y clase CSS
*/
function translateStatus(status) {
  const statusMap = {
      'active': {
          text: 'Activo',
          class: 'bg-success'
      },
      'pending': {
          text: 'Pendiente',
          class: 'bg-warning'
      },
      'cancelled': {
          text: 'Cancelado',
          class: 'bg-danger'
      },
      'terminated': {
          text: 'Terminado',
          class: 'bg-secondary'
      },
      'planning': {
          text: 'Planeación',
          class: 'bg-info'
      },
      'planned': {
          text: 'Planeado',
          class: 'bg-info'
      },
      'unsuccessful': {
          text: 'Sin éxito',
          class: 'bg-danger'
      },
      'complete': {
          text: 'Completado',
          class: 'bg-success'
      },
      'withdrawn': {
          text: 'Retirado',
          class: 'bg-secondary'
      }
  };
  
  return statusMap[status] || {
      text: status || 'Desconocido',
      class: 'bg-secondary'
  };
}

/**
* Genera un color basado en un texto (para identificadores)
* @param {string} text - Texto para generar el color
* @returns {string} - Color en formato hex
*/
function stringToColor(text) {
  if (!text) {
      return '#cccccc';
  }
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  let color = '#';
  for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
  }
  
  return color;
}

/**
* Descarga datos como archivo CSV
* @param {Array} data - Array de objetos a exportar
* @param {string} filename - Nombre del archivo
*/
function downloadCSV(data, filename = 'export.csv') {
  if (!data || !data.length) {
      console.error('No hay datos para exportar');
      return;
  }
  
  // Obtener las cabeceras (keys del primer objeto)
  const headers = Object.keys(data[0]);
  
  // Crear contenido CSV
  let csvContent = headers.join(',') + '\n';
  
  // Agregar filas
  csvContent += data.map(row => {
      return headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? '' : row[header];
          
          // Escapar comillas y encerrar en comillas si tiene comas
          cell = String(cell).replace(/"/g, '""');
          if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
              cell = `"${cell}"`;
          }
          
          return cell;
      }).join(',');
  }).join('\n');
  
  // Crear Blob y link para descargar
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Crear URL para el blob
  const url = URL.createObjectURL(blob);
  
  // Configurar link
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  // Agregar al documento, hacer clic y limpiar
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
* Muestra un loader mientras se cargan datos
* @param {boolean} show - Si se debe mostrar u ocultar el loader
*/
function toggleLoader(show = true) {
  let loader = document.querySelector('.loading');
  
  if (show) {
      if (!loader) {
          loader = document.createElement('div');
          loader.className = 'loading';
          loader.innerHTML = '<div class="loading-spinner"></div>';
          document.body.appendChild(loader);
      }
  } else {
      if (loader) {
          loader.remove();
      }
  }
}

/**
* Genera un ID único
* @returns {string} - ID único
*/
function generateUniqueId() {
  return 'id_' + Math.random().toString(36).substr(2, 9);
}

/**
* Detecta el tema del sistema (claro/oscuro)
* @returns {string} - 'dark' o 'light'
*/
function detectSystemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
}

/**
* Aplica el tema actual (claro/oscuro)
* @param {string} theme - 'dark', 'light' o 'auto'
*/
function applyTheme(theme = 'auto') {
  const body = document.body;
  
  // Quitar todas las clases de tema
  body.classList.remove('theme-dark', 'theme-light', 'auto-dark-mode');
  
  if (theme === 'auto') {
      // Usar preferencia del sistema
      body.classList.add('auto-dark-mode');
  } else {
      // Aplicar tema específico
      body.classList.add(`theme-${theme}`);
  }
  
  // Guardar preferencia
  localStorage.setItem('theme', theme);
}

/**
* Debounce para limitar llamadas a funciones (útil para inputs)
* @param {Function} func - Función a ejecutar
* @param {number} wait - Tiempo de espera en ms
* @returns {Function} - Función con debounce
*/
function debounce(func, wait = 300) {
  let timeout;
  
  return function(...args) {
      const context = this;
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
          func.apply(context, args);
      }, wait);
  };
}

// Exportar funciones públicas
window.utils = {
  formatCurrency,
  formatDate,
  truncateText,
  translateStatus,
  stringToColor,
  downloadCSV,
  toggleLoader,
  generateUniqueId,
  detectSystemTheme,
  applyTheme,
  debounce
};