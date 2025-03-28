/**
 * company-chart.js
 * 
 * Script para el gráfico de Contratos Adjudicados por Empresa
 */

// Inicializar el gráfico cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  initializeCompanyChart();
});

/**
* Inicializa el gráfico de contratos por empresa
*/
function initializeCompanyChart() {
  const companiesCtx = document.getElementById('companyContractsChart').getContext('2d');
  
  // Datos para el gráfico
  const companiesData = {
      labels: ['Constructora Hernández S.A.', 'TechSolutions Inc.', 'Grupo Logístico Internacional', 
              'Servicios Integrales S.A.', 'Medical Supplies Corp.', 'Ingeniería Avanzada', 
              'Transportes Unidos', 'Consultores Asociados'],
      datasets: [{
          label: 'Número de Contratos Adjudicados',
          data: [45, 39, 27, 25, 21, 18, 15, 12],
          backgroundColor: 'rgba(78, 115, 223, 0.7)',
          borderColor: 'rgba(78, 115, 223, 1)',
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8
      }]
  };

  // Opciones del gráfico
  const options = {
      maintainAspectRatio: false,
      scales: {
          y: {
              beginAtZero: true,
              title: {
                  display: true,
                  text: 'Número de Contratos'
              }
          },
          x: {
              title: {
                  display: true,
                  text: 'Empresa'
              },
              ticks: {
                  maxRotation: 45,
                  minRotation: 45
              }
          }
      },
      plugins: {
          legend: {
              display: false
          },
          tooltip: {
              callbacks: {
                  afterLabel: function(context) {
                      // Valor simulado del total en MXN
                      const values = [2250000, 1950000, 1350000, 1250000, 1050000, 900000, 750000, 600000];
                      return 'Valor total: $' + values[context.dataIndex].toLocaleString();
                  }
              }
          }
      },
      animation: {
          duration: 1000,
          easing: 'easeOutQuart'
      }
  };

  // Crear el gráfico
  window.companyChart = new Chart(companiesCtx, {
      type: 'bar',
      data: companiesData,
      options: options
  });
}

/**
* Actualiza el gráfico con nuevos datos
* @param {Object} data - Nuevos datos para el gráfico
*/
function updateCompanyChart(data) {
  if (!window.companyChart) {
      console.error('El gráfico de empresas no está inicializado');
      return;
  }

  // Actualizar los datos
  window.companyChart.data = data;
  
  // Redibujar el gráfico
  window.companyChart.update();
}

/**
* Filtra los datos del gráfico por un término de búsqueda
* @param {string} searchTerm - Término para filtrar empresas
*/
function filterCompanyChartByTerm(searchTerm) {
  if (!window.companyChart || !searchTerm) {
      return;
  }
  
  const originalData = {
      labels: ['Constructora Hernández S.A.', 'TechSolutions Inc.', 'Grupo Logístico Internacional', 
              'Servicios Integrales S.A.', 'Medical Supplies Corp.', 'Ingeniería Avanzada', 
              'Transportes Unidos', 'Consultores Asociados'],
      datasets: [{
          label: 'Número de Contratos Adjudicados',
          data: [45, 39, 27, 25, 21, 18, 15, 12],
          backgroundColor: 'rgba(78, 115, 223, 0.7)',
          borderColor: 'rgba(78, 115, 223, 1)',
          borderWidth: 1
      }]
  };
  
  // Filtrar las etiquetas y datos correspondientes
  const filteredIndices = originalData.labels.map((label, index) => {
      return { label, index };
  }).filter(item => {
      return item.label.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  const filteredLabels = filteredIndices.map(item => originalData.labels[item.index]);
  const filteredData = filteredIndices.map(item => originalData.datasets[0].data[item.index]);
  
  // Crear nuevo conjunto de datos filtrado
  const newData = {
      labels: filteredLabels,
      datasets: [{
          ...originalData.datasets[0],
          data: filteredData
      }]
  };
  
  // Actualizar el gráfico
  updateCompanyChart(newData);
}

/**
* Ordena los datos del gráfico
* @param {string} order - Orden ('asc' o 'desc')
*/
function sortCompanyChart(order) {
  if (!window.companyChart) {
      return;
  }
  
  const currentData = window.companyChart.data;
  
  // Crear array de objetos con etiqueta y valor para ordenar
  const dataArray = currentData.labels.map((label, index) => {
      return {
          label: label,
          value: currentData.datasets[0].data[index]
      };
  });
  
  // Ordenar según el criterio
  if (order === 'asc') {
      dataArray.sort((a, b) => a.value - b.value);
  } else if (order === 'desc') {
      dataArray.sort((a, b) => b.value - a.value);
  }
  
  // Reconstruir arrays ordenados
  const sortedLabels = dataArray.map(item => item.label);
  const sortedData = dataArray.map(item => item.value);
  
  // Actualizar el gráfico
  currentData.labels = sortedLabels;
  currentData.datasets[0].data = sortedData;
  window.companyChart.update();
}

// Exportar funciones para uso en otros scripts
window.companyChartModule = {
  initialize: initializeCompanyChart,
  update: updateCompanyChart,
  filterByTerm: filterCompanyChartByTerm,
  sort: sortCompanyChart
};