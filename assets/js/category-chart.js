/**
 * category-chart.js
 * 
 * Script para el gráfico de Distribución por Categoría de Contratación
 */

// Inicializar el gráfico cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  initializeCategoryChart();
});

/**
* Inicializa el gráfico de categorías
*/
function initializeCategoryChart() {
  const categoryCtx = document.getElementById('categoryChart').getContext('2d');
  
  // Datos para el gráfico
  const categoryData = {
      labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
      datasets: [
          {
              label: 'Bienes',
              data: [42, 35, 50, 45, 60, 55, 65, 70, 65, 75, 70, 80],
              backgroundColor: 'rgba(78, 115, 223, 0.3)',
              borderColor: 'rgba(78, 115, 223, 1)',
              pointBackgroundColor: 'rgba(78, 115, 223, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(78, 115, 223, 1)',
              borderWidth: 2,
              fill: true
          },
          {
              label: 'Servicios',
              data: [25, 30, 35, 40, 45, 50, 40, 45, 55, 50, 60, 65],
              backgroundColor: 'rgba(28, 200, 138, 0.3)',
              borderColor: 'rgba(28, 200, 138, 1)',
              pointBackgroundColor: 'rgba(28, 200, 138, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(28, 200, 138, 1)',
              borderWidth: 2,
              fill: true
          },
          {
              label: 'Obras',
              data: [10, 15, 20, 15, 25, 30, 35, 25, 30, 35, 40, 45],
              backgroundColor: 'rgba(246, 194, 62, 0.3)',
              borderColor: 'rgba(246, 194, 62, 1)',
              pointBackgroundColor: 'rgba(246, 194, 62, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(246, 194, 62, 1)',
              borderWidth: 2,
              fill: true
          },
          {
              label: 'Consultorías',
              data: [8, 12, 15, 10, 18, 22, 20, 18, 25, 30, 28, 32],
              backgroundColor: 'rgba(231, 74, 59, 0.3)',
              borderColor: 'rgba(231, 74, 59, 1)',
              pointBackgroundColor: 'rgba(231, 74, 59, 1)',
              pointBorderColor: '#fff',
              pointHoverBackgroundColor: '#fff',
              pointHoverBorderColor: 'rgba(231, 74, 59, 1)',
              borderWidth: 2,
              fill: true
          }
      ]
  };

  // Opciones del gráfico
  const options = {
      maintainAspectRatio: false,
      scales: {
          y: {
              beginAtZero: true,
              title: {
                  display: true,
                  text: 'Valor Total (Millones USD)'
              }
          },
          x: {
              title: {
                  display: true,
                  text: 'Mes'
              }
          }
      },
      plugins: {
          legend: {
              position: 'bottom'
          },
          tooltip: {
              callbacks: {
                  label: function(context) {
                      let label = context.dataset.label || '';
                      if (label) {
                          label += ': ';
                      }
                      if (context.parsed.y !== null) {
                          label += new Intl.NumberFormat('es-MX', {
                              style: 'currency',
                              currency: 'USD',
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                          }).format(context.parsed.y) + ' millones';
                      }
                      return label;
                  }
              }
          }
      },
      interaction: {
          mode: 'index',
          intersect: false
      },
      animations: {
          tension: {
              duration: 1000,
              easing: 'linear',
              from: 0.8,
              to: 0.2,
              loop: false
          }
      }
  };

  // Crear el gráfico
  window.categoryChart = new Chart(categoryCtx, {
      type: 'line',
      data: categoryData,
      options: options
  });
}

/**
* Actualiza el gráfico con nuevos datos
* @param {Object} data - Nuevos datos para el gráfico
*/
function updateCategoryChart(data) {
  if (!window.categoryChart) {
      console.error('El gráfico de categorías no está inicializado');
      return;
  }

  // Actualizar los datos
  window.categoryChart.data = data;
  
  // Redibujar el gráfico
  window.categoryChart.update();
}

/**
* Filtra los datos del gráfico por fechas
* @param {string} startDate - Fecha de inicio formato YYYY-MM-DD
* @param {string} endDate - Fecha fin formato YYYY-MM-DD
*/
function filterCategoryChartByDate(startDate, endDate) {
  // En una aplicación real, esto haría una petición al servidor o filtraría datos locales
  console.log(`Filtrando datos de categorías desde ${startDate} hasta ${endDate}`);
  
  // Simulación de datos filtrados
  const filteredData = {
      labels: ['Ene', 'Feb', 'Mar'],
      datasets: window.categoryChart.data.datasets.map(dataset => {
          return {
              ...dataset,
              data: dataset.data.slice(0, 3) // Solo los primeros 3 meses como ejemplo
          };
      })
  };
  
  updateCategoryChart(filteredData);
}

/**
* Filtra los datos del gráfico por categoría
* @param {string} category - Categoría a mostrar
*/
function filterCategoryChartByCategory(category) {
  if (!window.categoryChart) {
      return;
  }
  
  const allDatasets = window.categoryChart.data.datasets;
  
  if (category === 'todos') {
      // Mostrar todas las categorías
      allDatasets.forEach(dataset => {
          dataset.hidden = false;
      });
  } else {
      // Mostrar solo la categoría seleccionada
      allDatasets.forEach(dataset => {
          dataset.hidden = dataset.label.toLowerCase() !== category;
      });
  }
  
  window.categoryChart.update();
}

// Exportar funciones para uso en otros scripts
window.categoryChartModule = {
  initialize: initializeCategoryChart,
  update: updateCategoryChart,
  filterByDate: filterCategoryChartByDate,
  filterByCategory: filterCategoryChartByCategory
};