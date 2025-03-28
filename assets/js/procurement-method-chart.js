/**
 * procurement-method-chart.js
 * 
 * Script para el gráfico de Métodos de Contratación
 */

// Inicializar el gráfico cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  initializeProcurementMethodChart();
});

/**
* Inicializa el gráfico de métodos de contratación
*/
function initializeProcurementMethodChart() {
  const methodsCtx = document.getElementById('procurementMethodChart').getContext('2d');
  
  // Datos para los métodos de contratación (nacional)
  const methodsDataNacional = {
      labels: ['Licitación Abierta', 'Licitación Selectiva', 'Contratación Directa', 'Licitación Limitada'],
      datasets: [{
          data: [45, 25, 20, 10],
          backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
          hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
          hoverBorderColor: "rgba(234, 236, 244, 1)",
      }]
  };

  // Opciones del gráfico
  const options = {
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
          legend: {
              position: 'bottom'
          },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                      const percentage = Math.round((value * 100) / total);
                      return `${label}: ${percentage}% (${value} contratos)`;
                  }
              }
          }
      },
      animation: {
          animateRotate: true,
          animateScale: true
      }
  };

  // Crear el gráfico
  window.methodsChart = new Chart(methodsCtx, {
      type: 'doughnut',
      data: methodsDataNacional,
      options: options
  });
  
  // Guardar referencia global a los datos nacionales para restaurarlos luego de hovering en el mapa
  window.methodsDataNacional = methodsDataNacional;
  
  // Crear datos simulados por estado para interacción con el mapa
  window.estadosData = createEstadosData();
}

/**
* Crea un conjunto de datos simulados para cada estado de México
* @returns {Object} - Datos simulados por estado
*/
function createEstadosData() {
  return {
      "Aguascalientes": { data: [30, 40, 25, 5] },
      "Baja California": { data: [50, 20, 15, 15] },
      "Baja California Sur": { data: [35, 30, 25, 10] },
      "Campeche": { data: [40, 25, 30, 5] },
      "Chiapas": { data: [20, 35, 30, 15] },
      "Chihuahua": { data: [45, 30, 15, 10] },
      "Coahuila": { data: [55, 20, 10, 15] },
      "Colima": { data: [30, 30, 30, 10] },
      "Ciudad de México": { data: [60, 15, 15, 10] },
      "Durango": { data: [35, 25, 25, 15] },
      "Guanajuato": { data: [50, 20, 20, 10] },
      "Guerrero": { data: [25, 30, 35, 10] },
      "Hidalgo": { data: [40, 25, 25, 10] },
      "Jalisco": { data: [55, 20, 15, 10] },
      "México": { data: [45, 25, 20, 10] },
      "Michoacán": { data: [30, 30, 30, 10] },
      "Morelos": { data: [35, 25, 30, 10] },
      "Nayarit": { data: [25, 35, 30, 10] },
      "Nuevo León": { data: [60, 15, 15, 10] },
      "Oaxaca": { data: [20, 30, 40, 10] },
      "Puebla": { data: [45, 25, 20, 10] },
      "Querétaro": { data: [50, 20, 20, 10] },
      "Quintana Roo": { data: [35, 30, 25, 10] },
      "San Luis Potosí": { data: [40, 30, 20, 10] },
      "Sinaloa": { data: [45, 25, 20, 10] },
      "Sonora": { data: [50, 25, 15, 10] },
      "Tabasco": { data: [30, 25, 35, 10] },
      "Tamaulipas": { data: [45, 25, 20, 10] },
      "Tlaxcala": { data: [30, 30, 30, 10] },
      "Veracruz": { data: [40, 25, 25, 10] },
      "Yucatán": { data: [35, 30, 25, 10] },
      "Zacatecas": { data: [30, 35, 25, 10] }
  };
}

/**
* Actualiza el gráfico con datos de un estado específico
* @param {string} stateName - Nombre del estado
*/
function updateChartWithStateData(stateName) {
  if (!window.methodsChart || !window.estadosData) {
      return;
  }
  
  if (window.estadosData[stateName]) {
      window.methodsChart.data.datasets[0].data = window.estadosData[stateName].data;
      window.methodsChart.update();
      document.getElementById('region-title').textContent = `Datos de ${stateName}`;
  }
}

/**
* Restaura los datos nacionales en el gráfico
*/
function restoreNationalData() {
  if (!window.methodsChart || !window.methodsDataNacional) {
      return;
  }
  
  window.methodsChart.data.datasets[0].data = window.methodsDataNacional.datasets[0].data;
  window.methodsChart.update();
  document.getElementById('region-title').textContent = "Datos a nivel nacional";
}

/**
* Filtra los datos por tipo de contratación
* @param {string} type - Tipo de contratación a destacar
*/
function highlightProcurementType(type) {
  if (!window.methodsChart) {
      return;
  }
  
  const typeIndex = {
      'abierta': 0,
      'selectiva': 1,
      'directa': 2,
      'limitada': 3
  };
  
  if (typeIndex[type] === undefined) {
      // Restaurar todos los colores originales
      window.methodsChart.data.datasets[0].backgroundColor = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'];
      window.methodsChart.data.datasets[0].hoverBackgroundColor = ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'];
  } else {
      // Crear arrays de colores atenuados
      const backgroundColors = ['rgba(78, 115, 223, 0.3)', 'rgba(28, 200, 138, 0.3)', 
                               'rgba(54, 185, 204, 0.3)', 'rgba(246, 194, 62, 0.3)'];
      const hoverBackgroundColors = ['rgba(46, 89, 217, 0.3)', 'rgba(23, 166, 115, 0.3)', 
                                    'rgba(44, 159, 175, 0.3)', 'rgba(221, 162, 10, 0.3)'];
      
      // Restaurar colores intensos solo para el tipo seleccionado
      backgroundColors[typeIndex[type]] = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'][typeIndex[type]];
      hoverBackgroundColors[typeIndex[type]] = ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'][typeIndex[type]];
      
      window.methodsChart.data.datasets[0].backgroundColor = backgroundColors;
      window.methodsChart.data.datasets[0].hoverBackgroundColor = hoverBackgroundColors;
  }
  
  window.methodsChart.update();
}

// Exportar funciones para uso en otros scripts
window.procurementMethodChartModule = {
  initialize: initializeProcurementMethodChart,
  updateWithStateData: updateChartWithStateData,
  restoreNationalData: restoreNationalData,
  highlightType: highlightProcurementType
};