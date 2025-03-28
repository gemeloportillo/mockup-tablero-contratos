/**
 * category-chart.js
 * 
 * Script específico para el gráfico de Distribución por Categoría de Contratación
 * Modificado para mostrar datos por años (últimos 7 años)
 * Con soporte para múltiples tipos de visualización
 */

// Variable global para el gráfico de categorías
window.categoryChart = null;

/**
* Inicializa el gráfico de categorías por año
*/
function initializeCategoryChart() {
  console.log("Inicializando gráfico de Distribución por Categoría (vista por años)...");
  
  // Verificar si el canvas existe
  const categoryCanvas = document.getElementById('categoryChart');
  if (!categoryCanvas) {
    console.error("No se encontró el elemento canvas con ID 'categoryChart'");
    return;
  }
  
  // Verificar si Chart.js está disponible
  if (typeof Chart === 'undefined') {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Verificar si el gráfico ya está inicializado para evitar duplicación
  if (window.categoryChart) {
    console.warn("El gráfico de categorías ya está inicializado. Se evitará la duplicación.");
    return;
  }
  
  try {
    const ctx = categoryCanvas.getContext('2d');
    
    // Datos para el gráfico (años y valores para cada categoría)
    // Generamos años dinámicamente (últimos 7 años)
    const currentYear = new Date().getFullYear();
    const years = Array.from({length: 7}, (_, i) => (currentYear - 6 + i).toString());
    
    // Datos simulados para cada categoría por año
    const goods = [15.2, 16.8, 18.5, 19.3, 21.2, 22.8, 24.5];
    const services = [10.5, 11.2, 12.8, 14.5, 15.8, 17.2, 18.9];
    const works = [8.3, 9.1, 8.7, 10.2, 12.5, 13.8, 15.2];
    
    // Configurar los datasets
    const datasets = [
      {
        label: 'Bienes',
        data: goods,
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
        data: services,
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
        data: works,
        backgroundColor: 'rgba(246, 194, 62, 0.3)',
        borderColor: 'rgba(246, 194, 62, 1)',
        pointBackgroundColor: 'rgba(246, 194, 62, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(246, 194, 62, 1)',
        borderWidth: 2,
        fill: true
      }
    ];
    
    // Opciones base del gráfico (comunes para todos los tipos)
    const baseOptions = {
      maintainAspectRatio: false,
      responsive: true,
      layout: {
        padding: {
          top: 10,
          right: 25,
          bottom: 10,
          left: 25
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Distribución por Categoría de Contratación (2019-2025)',
          font: {
            size: 16,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 15
          }
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          titleMarginBottom: 10,
          titleFont: {
            size: 14,
            weight: 'bold'
          },
          callbacks: {
            label: function(context) {
              return context.dataset.label + ': ' + context.formattedValue + ' MM';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor Total (Miles de Millones MXN)'
          },
          ticks: {
            maxTicksLimit: 5,
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Año'
          }
        }
      },
      elements: {
        line: {
          tension: 0.3 // Hace que las líneas sean suaves
        },
        point: {
          radius: 3,
          hoverRadius: 5
        }
      },
      animation: {
        duration: 1000,
        easing: 'easeOutQuart'
      }
    };
    
    // Guardar opciones base para uso posterior
    window.categoryChartBaseOptions = JSON.parse(JSON.stringify(baseOptions));
    
    // Crear el gráfico
    window.categoryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: datasets
      },
      options: baseOptions
    });
    
    // Guardar datos originales para referencia
    window.categoryChartOriginalData = {
      years: years,
      goods: goods,
      services: services,
      works: works
    };
    
    // Añadir botones de control para cambiar el tipo de gráfico
    addChartTypeControls(categoryCanvas);
    
    console.log("Gráfico de Distribución por Categoría inicializado correctamente");
  } catch (error) {
    console.error("Error al inicializar el gráfico de Distribución por Categoría:", error);
  }
}

/**
 * Añade botones para cambiar el tipo de gráfico
 * @param {HTMLElement} canvas - El elemento canvas del gráfico
 */
function addChartTypeControls(canvas) {
  // Verificar si ya existen los controles
  const parentCard = canvas.closest('.card');
  if (!parentCard) return;
  
  const existingControls = parentCard.querySelector('.chart-controls');
  if (existingControls) return;
  
  // Crear contenedor para botones
  const controlsDiv = document.createElement('div');
  controlsDiv.className = 'chart-controls d-flex justify-content-center mt-3';
  
  // Crear botones para cada tipo de gráfico
  const types = [
    { id: 'line', icon: 'fa-chart-line', text: 'Línea' },
    { id: 'bar', icon: 'fa-chart-bar', text: 'Barras' },
    { id: 'radar', icon: 'fa-chart-pie', text: 'Radar' },
    { id: 'stacked', icon: 'fa-layer-group', text: 'Apilado' }
  ];
  
  types.forEach(type => {
    const button = document.createElement('button');
    button.className = `btn btn-sm ${type.id === 'line' ? 'btn-primary' : 'btn-outline-primary'} mx-1`;
    button.innerHTML = `<i class="fas ${type.icon} me-1"></i> ${type.text}`;
    button.setAttribute('data-chart-type', type.id);
    button.onclick = function() {
      // Actualizar estilo de botones
      controlsDiv.querySelectorAll('.btn').forEach(btn => {
        btn.className = btn.className.replace('btn-primary', 'btn-outline-primary');
      });
      button.className = button.className.replace('btn-outline-primary', 'btn-primary');
      
      try {
        // Cambiar tipo de gráfico
        if (type.id === 'stacked') {
          changeToStackedBar();
        } else {
          changeCategoryChartType(type.id);
        }
      } catch (error) {
        console.error(`Error al cambiar al tipo de gráfico ${type.id}:`, error);
        alert(`Ha ocurrido un error al cambiar al tipo de gráfico ${type.text}. Consulta la consola para más detalles.`);
      }
    };
    controlsDiv.appendChild(button);
  });
  
  // Añadir selector de año o período
  const periodSelector = document.createElement('select');
  periodSelector.className = 'form-select form-select-sm ms-auto me-3';
  periodSelector.style.width = '150px';
  
  const periods = [
    { id: 'all', text: 'Todos los años' },
    { id: 'last3', text: 'Últimos 3 años' },
    { id: 'last5', text: 'Últimos 5 años' },
    { id: 'custom', text: 'Período personalizado' }
  ];
  
  periods.forEach(period => {
    const option = document.createElement('option');
    option.value = period.id;
    option.textContent = period.text;
    periodSelector.appendChild(option);
  });
  
  periodSelector.onchange = function() {
    if (this.value === 'custom') {
      alert('Funcionalidad de período personalizado en desarrollo');
      this.value = 'all'; // Restablecer al valor predeterminado
    } else {
      filterByPeriod(this.value);
    }
  };
  
  controlsDiv.appendChild(periodSelector);
  
  // Añadir controles al card
  const cardBody = parentCard.querySelector('.card-body');
  cardBody.appendChild(controlsDiv);
}

/**
 * Filtra los datos por período seleccionado
 * @param {string} periodType - Tipo de período a mostrar
 */
function filterByPeriod(periodType) {
  if (!window.categoryChartOriginalData) {
    console.error('No hay datos originales disponibles para filtrar');
    return;
  }
  
  const currentYear = new Date().getFullYear();
  let years = [];
  let startYear;
  
  switch(periodType) {
    case 'last3':
      startYear = currentYear - 2;
      years = Array.from({length: 3}, (_, i) => (startYear + i).toString());
      break;
    case 'last5':
      startYear = currentYear - 4;
      years = Array.from({length: 5}, (_, i) => (startYear + i).toString());
      break;
    case 'custom':
      // Aquí podríamos abrir un modal para selección personalizada
      alert('Funcionalidad de período personalizado en desarrollo');
      return;
    case 'all':
    default:
      startYear = currentYear - 6;
      years = Array.from({length: 7}, (_, i) => (startYear + i).toString());
      break;
  }
  
  // Actualizar título del gráfico
  if (window.categoryChart && window.categoryChart.options.plugins.title) {
    window.categoryChart.options.plugins.title.text = `Distribución por Categoría de Contratación (${years[0]}-${years[years.length-1]})`;
  }
  
  // Generar datos proporcionales para el período seleccionado
  updateCategoryChart({
    years: years,
    goods: generateProportionalData(15.2, 24.5, years.length),
    services: generateProportionalData(10.5, 18.9, years.length),
    works: generateProportionalData(8.3, 15.2, years.length)
  });
}

/**
 * Genera datos proporcionales para el número de años
 * @param {number} start - Valor inicial
 * @param {number} end - Valor final
 * @param {number} count - Número de puntos a generar
 * @returns {Array} - Array de valores proporcionales
 */
function generateProportionalData(start, end, count) {
  return Array.from({length: count}, (_, i) => {
    const factor = i / (count - 1);
    const value = start + (end - start) * factor;
    return parseFloat(value.toFixed(1)); // Redondear a 1 decimal para datos más limpios
  });
}

/**
* Actualiza el gráfico con nuevos datos
* @param {Object} data - Nuevos datos para el gráfico 
* Formato esperado: { years: [], goods: [], services: [], works: [] }
*/
function updateCategoryChart(data) {
  if (!window.categoryChart) {
    console.error('El gráfico de categorías no está inicializado');
    initializeCategoryChart(); // Intentar inicializar si no existe
    if (!window.categoryChart) return; // Si aún no existe, salir
  }

  try {
    // Actualizar etiquetas (años)
    if (data.years && Array.isArray(data.years)) {
      window.categoryChart.data.labels = data.years;
    }
    
    // Actualizar datos de bienes si están disponibles
    if (data.goods && Array.isArray(data.goods) && data.goods.length > 0) {
      window.categoryChart.data.datasets[0].data = data.goods;
    }
    
    // Actualizar datos de servicios si están disponibles
    if (data.services && Array.isArray(data.services) && data.services.length > 0) {
      window.categoryChart.data.datasets[1].data = data.services;
    }
    
    // Actualizar datos de obras si están disponibles
    if (data.works && Array.isArray(data.works) && data.works.length > 0) {
      window.categoryChart.data.datasets[2].data = data.works;
    }
    
    // Redibujar el gráfico
    window.categoryChart.update();
    console.log("Gráfico de categorías actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar el gráfico de categorías:", error);
  }
}

/**
* Cambia el tipo de visualización del gráfico
* @param {string} type - Tipo de gráfico ('line', 'bar', 'radar')
*/
function changeCategoryChartType(type) {
  if (!window.categoryChart) {
    console.error('El gráfico de categorías no está inicializado');
    return;
  }
  
  if (!['line', 'bar', 'radar'].includes(type)) {
    console.error(`Tipo de gráfico no soportado: ${type}`);
    return;
  }
  
  try {
    // Guardar datos actuales y el elemento canvas
    const currentData = window.categoryChart.data;
    const canvas = document.getElementById('categoryChart');
    
    if (!canvas) {
      console.error('No se encontró el elemento canvas del gráfico');
      return;
    }
    
    // Obtener opciones base (almacenadas durante la inicialización)
    let options = window.categoryChartBaseOptions 
                  ? JSON.parse(JSON.stringify(window.categoryChartBaseOptions)) 
                  : {};
    
    // Ajustar opciones específicas para cada tipo de gráfico
    if (type === 'radar') {
      // Configurar opciones específicas para radar
      options.scales = {
        r: {
          angleLines: {
            display: true,
            color: 'rgba(0, 0, 0, 0.1)'
          },
          beginAtZero: true,
          ticks: {
            showLabelBackdrop: true,
            backdropColor: 'rgba(255, 255, 255, 0.75)',
            backdropPadding: 2,
            callback: function(value) {
              return value.toFixed(1);
            }
          },
          pointLabels: {
            font: {
              size: 12
            }
          }
        }
      };
      
      // Ajustar datasets para radar
      currentData.datasets.forEach(dataset => {
        dataset.pointRadius = 4;
        dataset.pointHoverRadius = 6;
        dataset.borderWidth = 2;
      });
      
      // Actualizar título
      options.plugins.title.text = 'Distribución por Categoría de Contratación (Radar)';
    } 
    else if (type === 'bar') {
      // Configurar opciones específicas para barras
      options.scales = {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor Total (Miles de Millones MXN)'
          },
          ticks: {
            maxTicksLimit: 5,
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Año'
          }
        }
      };
      
      // Ajustar opciones de barras
      options.barPercentage = 0.8;
      options.categoryPercentage = 0.9;
      
      // Ajustar datasets para barras
      currentData.datasets.forEach(dataset => {
        dataset.borderWidth = 1;
        dataset.borderColor = dataset.backgroundColor.replace('0.3', '1');
        dataset.backgroundColor = dataset.backgroundColor.replace('0.3', '0.7');
        dataset.fill = false; // Las barras no usan fill
        dataset.hoverBackgroundColor = dataset.backgroundColor.replace('0.7', '0.9');
      });
      
      // Actualizar título
      options.plugins.title.text = 'Distribución por Categoría de Contratación (Barras)';
    }
    else if (type === 'line') {
      // Configurar opciones específicas para líneas
      options.scales = {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Valor Total (Miles de Millones MXN)'
          },
          ticks: {
            maxTicksLimit: 5,
            callback: function(value) {
              return value.toFixed(1);
            }
          }
        },
        x: {
          title: {
            display: true,
            text: 'Año'
          }
        }
      };
      
      // Ajustar datasets para líneas
      currentData.datasets.forEach(dataset => {
        dataset.fill = true;
        dataset.tension = 0.3;
        dataset.borderWidth = 2;
      });
      
      // Actualizar título
      options.plugins.title.text = 'Distribución por Categoría de Contratación (Línea)';
    }
    
    // Destruir el gráfico actual
    window.categoryChart.destroy();
    
    // Crear nuevo gráfico con el tipo solicitado
    const ctx = canvas.getContext('2d');
    window.categoryChart = new Chart(ctx, {
      type: type,
      data: currentData,
      options: options
    });
    
    console.log(`Tipo de gráfico de categorías cambiado a: ${type}`);
  } catch (error) {
    console.error(`Error al cambiar el tipo de gráfico:`, error);
    
    // Intento de recuperación - recrear el gráfico original
    try {
      if (window.categoryChartOriginalData) {
        recreateOriginalChart();
      }
    } catch (recoveryError) {
      console.error('Error al intentar recuperar el gráfico:', recoveryError);
    }
  }
}

/**
 * Cambia el gráfico a un formato de barras apiladas
 */
function changeToStackedBar() {
  if (!window.categoryChart) {
    console.error('El gráfico de categorías no está inicializado');
    return;
  }
  
  try {
    // Guardar datos actuales
    const currentData = window.categoryChart.data;
    const canvas = document.getElementById('categoryChart');
    
    if (!canvas) {
      console.error('No se encontró el elemento canvas del gráfico');
      return;
    }
    
    // Destruir gráfico actual
    window.categoryChart.destroy();
    
    // Ajustar datasets para barras apiladas
    currentData.datasets.forEach(dataset => {
      dataset.borderWidth = 1;
      dataset.borderColor = dataset.backgroundColor.replace('0.3', '1');
      dataset.backgroundColor = dataset.backgroundColor.replace('0.3', '0.7');
    });
    
    // Crear nuevo gráfico de barras apiladas
    const ctx = canvas.getContext('2d');
    window.categoryChart = new Chart(ctx, {
      type: 'bar',
      data: currentData,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        layout: {
          padding: {
            top: 10,
            right: 25,
            bottom: 10,
            left: 25
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Distribución por Categoría de Contratación (Apilado)',
            font: {
              size: 16,
              weight: 'bold'
            },
            padding: {
              top: 10,
              bottom: 20
            }
          },
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 12,
              padding: 15
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.formattedValue + ' MM';
              },
              footer: function(tooltipItems) {
                let sum = 0;
                tooltipItems.forEach(item => {
                  sum += parseFloat(item.raw);
                });
                return 'Total: ' + sum.toFixed(1) + ' MM';
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Año'
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Valor Total (Miles de Millones MXN)'
            },
            ticks: {
              beginAtZero: true,
              callback: function(value) {
                return value.toFixed(1);
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
    
    console.log("Tipo de gráfico cambiado a barras apiladas");
  } catch (error) {
    console.error("Error al cambiar a barras apiladas:", error);
    
    // Intento de recuperación
    try {
      if (window.categoryChartOriginalData) {
        recreateOriginalChart();
      }
    } catch (recoveryError) {
      console.error('Error al intentar recuperar el gráfico:', recoveryError);
    }
  }
}

/**
 * Recrea el gráfico original en caso de error
 */
function recreateOriginalChart() {
  if (!window.categoryChartOriginalData) {
    console.error('No hay datos originales disponibles para recrear el gráfico');
    return;
  }
  
  const canvas = document.getElementById('categoryChart');
  if (!canvas) {
    console.error('No se encontró el elemento canvas del gráfico');
    return;
  }
  
  try {
    const ctx = canvas.getContext('2d');
    const data = window.categoryChartOriginalData;
    
    // Recrear datasets
    const datasets = [
      {
        label: 'Bienes',
        data: data.goods,
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
        data: data.services,
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
        data: data.works,
        backgroundColor: 'rgba(246, 194, 62, 0.3)',
        borderColor: 'rgba(246, 194, 62, 1)',
        pointBackgroundColor: 'rgba(246, 194, 62, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(246, 194, 62, 1)',
        borderWidth: 2,
        fill: true
      }
    ];
    
    // Recrear gráfico original (línea)
    window.categoryChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.years,
        datasets: datasets
      },
      options: window.categoryChartBaseOptions || {
        maintainAspectRatio: false,
        responsive: true
      }
    });
    
    console.log("Gráfico de categorías recuperado correctamente");
    
    // Restablecer el estado del botón de línea
    const controls = canvas.closest('.card').querySelector('.chart-controls');
    if (controls) {
      controls.querySelectorAll('.btn').forEach(btn => {
        btn.className = btn.className.replace('btn-primary', 'btn-outline-primary');
        if (btn.getAttribute('data-chart-type') === 'line') {
          btn.className = btn.className.replace('btn-outline-primary', 'btn-primary');
        }
      });
    }
  } catch (error) {
    console.error('Error al recrear el gráfico original:', error);
  }
}

// Exportar funciones para uso en otros scripts
window.categoryChartModule = {
  initialize: initializeCategoryChart,
  update: updateCategoryChart,
  changeType: changeCategoryChartType,
  changeToStackedBar: changeToStackedBar,
  filterByPeriod: filterByPeriod
};

// Auto-inicialización
// Asegurarnos que la inicialización se ejecute solo cuando el DOM esté listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeCategoryChart, 500); // Pequeño retraso para asegurar que otros recursos estén cargados
} else {
  document.addEventListener('DOMContentLoaded', initializeCategoryChart);
}