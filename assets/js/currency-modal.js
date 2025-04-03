/**
 * currency-modal.js
 * 
 * Script para el modal de detalles de valores por moneda
 * Sigue el mismo patrón de inicialización que otros scripts funcionales del dashboard
 */

// Variables globales para los gráficos
window.currencyBarChart = null;
window.currencyTrendChart = null;
let currencyData = null;
let currentRegion = 'hidalgo';

// Inicializar cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log("Inicializando script de modal de monedas...");
  
  // Configurar el enlace en la tarjeta para abrir el modal
  const valorTotalCard = document.querySelector('.card.bg-gradient-success');
  if (valorTotalCard) {
    const verDetallesLink = valorTotalCard.querySelector('.card-footer a');
    if (verDetallesLink) {
      verDetallesLink.setAttribute('data-bs-toggle', 'modal');
      verDetallesLink.setAttribute('data-bs-target', '#currencyDetailModal');
      verDetallesLink.removeAttribute('href');
    }
  }
  
  // Configurar el evento para cuando se muestre el modal
  const currencyModal = document.getElementById('currencyDetailModal');
  if (currencyModal) {
    currencyModal.addEventListener('shown.bs.modal', function() {
      console.log("Modal de monedas mostrado - Inicializando gráficos...");
      // Cargar datos y luego inicializar visualizaciones
      loadCurrencyData().then(() => {
        // Usar un timeout más largo para asegurar que el DOM esté totalmente renderizado
        setTimeout(function() {
          updateVisualizations(currentRegion);
        }, 300);
      });
    });
  }
  
  // Configurar cambio de región
  const regionSelector = document.getElementById('regionSelector');
  if (regionSelector) {
    regionSelector.addEventListener('change', function() {
      currentRegion = this.value;
      const currentRegionLabel = document.getElementById('currentRegion');
      if (currentRegionLabel) {
        currentRegionLabel.textContent = this.options[this.selectedIndex].text;
      }
      updateVisualizations(currentRegion);
    });
  }
  
  // Configurar cambio entre escalas logarítmica y lineal
  document.getElementById('viewLog')?.addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('viewLinear').classList.remove('active');
    if (window.currencyBarChart) {
      window.currencyBarChart.options.scales.x.type = 'logarithmic';
      window.currencyBarChart.options.scales.x.title.text = 'Valor (MXN) - Escala Logarítmica';
      window.currencyBarChart.update();
    }
  });
  
  document.getElementById('viewLinear')?.addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('viewLog').classList.remove('active');
    if (window.currencyBarChart) {
      window.currencyBarChart.options.scales.x.type = 'linear';
      window.currencyBarChart.options.scales.x.title.text = 'Valor (MXN) - Escala Lineal';
      window.currencyBarChart.update();
    }
  });
  
  // Configurar filtro por año
  const yearFilter = document.getElementById('yearFilter');
  if (yearFilter) {
    yearFilter.addEventListener('change', function() {
      // Implementación futura: filtrar por año
      updateVisualizations(currentRegion);
    });
  }
});

/**
 * Carga los datos de monedas desde un archivo JSON
 * @returns {Promise} Promesa que se resuelve con los datos cargados
 */
async function loadCurrencyData() {
  if (currencyData) {
    return currencyData; // Usar datos en caché si ya se cargaron
  }
  
  try {
    console.log("Intentando cargar datos de monedas desde JSON...");
    const response = await fetch('data/currency-data.json');
    if (!response.ok) {
      throw new Error(`Error al cargar los datos: ${response.status}`);
    }
    currencyData = await response.json();
    console.log("Datos de monedas cargados correctamente:", Object.keys(currencyData));
    return currencyData;
  } catch (error) {
    console.error('Error al cargar datos de monedas:', error);
    // Usar datos de ejemplo si falla la carga
    console.log("Usando datos de ejemplo para monedas");
    currencyData = generateSampleData();
    return currencyData;
  }
}

/**
 * Actualiza todas las visualizaciones con los datos de la región seleccionada
 * @param {string} region - Región seleccionada
 */
function updateVisualizations(region) {
  console.log(`Actualizando visualizaciones para región: ${region}`);
  
  if (!currencyData || !currencyData[region]) {
    console.error(`No hay datos disponibles para la región: ${region}`);
    return;
  }
  
  const regionData = currencyData[region];
  
  // Actualizar la tabla de monedas
  console.log("Actualizando tabla de monedas...");
  updateCurrencyTable(regionData.montoTotalCurrency);
  
  // Inicializar/actualizar los gráficos
  console.log("Inicializando gráficos...");
  initializeBarChart(regionData.montoTotalCurrency);
  initializeTrendChart(regionData.tendencia);
}

/**
 * Actualiza la tabla de monedas con los datos proporcionados
 * @param {Array} currencyArray - Array de datos de monedas
 */
function updateCurrencyTable(currencyArray) {
  const tableBody = document.getElementById('currencyTableBody');
  if (!tableBody) {
    console.error("No se encontró el elemento #currencyTableBody");
    return;
  }
  
  // Calcular el total para los porcentajes
  const total = currencyArray.reduce((sum, item) => sum + item.total, 0);
  
  // Limpiar la tabla
  tableBody.innerHTML = '';
  
  // Ordenar por valor (de mayor a menor)
  const sortedData = [...currencyArray].sort((a, b) => b.total - a.total);
  
  // Añadir filas a la tabla
  sortedData.forEach(item => {
    const percentage = (item.total / total * 100);
    const percentageDisplay = percentage < 0.001 ? 
      percentage.toExponential(2) : 
      percentage.toFixed(percentage < 0.01 ? 4 : percentage < 0.1 ? 3 : percentage < 1 ? 2 : 1);
    
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><span class="badge ${item.badgeClass}">${item.currency}</span> ${item.name}</td>
      <td class="text-end">${new Intl.NumberFormat('es-MX').format(item.total)}</td>
      <td>
        <div class="d-flex align-items-center">
          <div class="progress flex-grow-1 me-2" style="height: 8px;">
            <div class="progress-bar ${item.badgeClass}" role="progressbar" 
              style="width: ${Math.max(0.01, percentage)}%;" 
              aria-valuenow="${percentage}" aria-valuemin="0" aria-valuemax="100"></div>
          </div>
          <span>${percentageDisplay}%</span>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
  
  // Actualizar el total en el pie de tabla
  const tfoot = tableBody.closest('table').querySelector('tfoot');
  if (tfoot) {
    const totalRow = tfoot.querySelector('tr');
    if (totalRow) {
      totalRow.querySelector('th:nth-child(2)').textContent = new Intl.NumberFormat('es-MX').format(total);
    }
  }
}

/**
 * Inicializa el gráfico de barras horizontal con los datos proporcionados
 * @param {Array} currencyArray - Array de datos de monedas
 */
function initializeBarChart(currencyArray) {
  console.log("Inicializando gráfico de barras...");
  
  const barCtx = document.getElementById('currencyBarChart');
  if (!barCtx) {
    console.error("No se encontró el elemento #currencyBarChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === 'undefined') {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Preparar los datos para el gráfico
  const labels = currencyArray.map(item => item.currency);
  const values = currencyArray.map(item => item.total);
  const colors = currencyArray.map(item => item.color);
  
  // Intentar destruir el gráfico anterior si existe
  try {
    if (window.currencyBarChart) {
      window.currencyBarChart.destroy();
      console.log("Gráfico anterior destruido correctamente");
    }
  } catch (e) {
    console.error("Error al destruir gráfico anterior:", e);
  }
  
  try {
    console.log("Creando nuevo gráfico de barras...");
    window.currencyBarChart = new Chart(barCtx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Valor Total',
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace('0.8', '1')),
          borderWidth: 1
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const formatter = new Intl.NumberFormat('es-MX', {
                  style: 'currency',
                  currency: 'MXN',
                  maximumFractionDigits: 0
                });
                
                // Calcular el porcentaje del total
                const total = values.reduce((a, b) => a + b, 0);
                const percentage = (value / total * 100).toFixed(6);
                
                return `${formatter.format(value)} (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'logarithmic',
            title: {
              display: true,
              text: 'Valor (MXN) - Escala Logarítmica'
            },
            ticks: {
              callback: function(value, index, values) {
                if (value === 10000000000000) return '10T';
                if (value === 1000000000000) return '1T';
                if (value === 100000000000) return '100B';
                if (value === 10000000000) return '10B';
                if (value === 1000000000) return '1B';
                if (value === 100000000) return '100M';
                if (value === 10000000) return '10M';
                if (value === 1000000) return '1M';
                if (value === 100000) return '100K';
                return value;
              }
            }
          }
        }
      }
    });
    console.log("Gráfico de barras creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de barras:", error);
  }
}

/**
 * Inicializa el gráfico de tendencias con los datos proporcionados
 * @param {Object} tendenciaData - Datos de tendencia (periodos, mxn, otras)
 */
function initializeTrendChart(tendenciaData) {
  console.log("Inicializando gráfico de tendencias...");
  
  const trendCtx = document.getElementById('currencyTrendChart');
  if (!trendCtx) {
    console.error("No se encontró el elemento #currencyTrendChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === 'undefined') {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Intentar destruir el gráfico anterior si existe
  try {
    if (window.currencyTrendChart) {
      window.currencyTrendChart.destroy();
      console.log("Gráfico de tendencias anterior destruido correctamente");
    }
  } catch (e) {
    console.error("Error al destruir gráfico de tendencias anterior:", e);
  }
  
  try {
    console.log("Creando nuevo gráfico de tendencias...");
    window.currencyTrendChart = new Chart(trendCtx, {
      type: 'line',
      data: {
        labels: tendenciaData.periodos,
        datasets: [
          {
            label: 'MXN (miles de millones)',
            data: tendenciaData.mxn,
            borderColor: 'rgba(66, 165, 204, 1)',
            backgroundColor: 'rgba(66, 165, 204, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y-mxn'
          },
          {
            label: 'Otras monedas (millones)',
            data: tendenciaData.otras,
            borderColor: 'rgba(66, 204, 143, 1)',
            backgroundColor: 'rgba(66, 204, 143, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y-other'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          'y-mxn': {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'MXN (miles de millones)'
            }
          },
          'y-other': {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Otras monedas (millones)'
            },
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
    console.log("Gráfico de tendencias creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de tendencias:", error);
  }
}

/**
 * Genera datos de ejemplo en caso de que no se pueda cargar el JSON
 * @returns {Object} Datos de ejemplo para las monedas
 */
function generateSampleData() {
  return {
    "nacional": {
      "montoTotalCurrency": [
        {
          "total": 193639.43,
          "currency": "CAD",
          "name": "Dólar Canadiense",
          "color": "rgba(204, 66, 138, 0.8)",
          "badgeClass": "bg-secondary"
        },
        {
          "total": 284745926.19,
          "currency": "EUR",
          "name": "Euro",
          "color": "rgba(66, 184, 204, 0.8)",
          "badgeClass": "bg-info"
        },
        {
          "total": 250556.01,
          "currency": "GBP",
          "name": "Libra Esterlina",
          "color": "rgba(138, 86, 208, 0.8)",
          "badgeClass": "bg-secondary"
        },
        {
          "total": 6620000,
          "currency": "JPY",
          "name": "Yen Japonés",
          "color": "rgba(230, 193, 84, 0.8)",
          "badgeClass": "bg-warning"
        },
        {
          "total": 2191158137346.92,
          "currency": "MXN",
          "name": "Peso Mexicano",
          "color": "rgba(66, 165, 204, 0.8)",
          "badgeClass": "bg-primary"
        },
        {
          "total": 4075221998.56,
          "currency": "USD",
          "name": "Dólar Americano",
          "color": "rgba(66, 204, 143, 0.8)",
          "badgeClass": "bg-success"
        },
        {
          "total": 5764397.7,
          "currency": "N/E",
          "name": "No Especificado",
          "color": "rgba(128, 128, 128, 0.8)",
          "badgeClass": "bg-dark"
        }
      ],
      "tendencia": {
        "periodos": ["2021-Q1", "2021-Q2", "2021-Q3", "2021-Q4", "2022-Q1", "2022-Q2", "2022-Q3", "2022-Q4", "2023-Q1", "2023-Q2"],
        "mxn": [210000, 230000, 280000, 260000, 290000, 320000, 380000, 410000, 430000, 460000],
        "otras": [400, 450, 470, 520, 550, 600, 620, 640, 680, 710]
      }
    },
    "hidalgo": {
      "montoTotalCurrency": [
        {
          "total": 45689.88,
          "currency": "CAD",
          "name": "Dólar Canadiense",
          "color": "rgba(204, 66, 138, 0.8)",
          "badgeClass": "bg-secondary"
        },
        {
          "total": 87245789.45,
          "currency": "EUR",
          "name": "Euro",
          "color": "rgba(66, 184, 204, 0.8)",
          "badgeClass": "bg-info"
        },
        {
          "total": 75600.84,
          "currency": "GBP",
          "name": "Libra Esterlina",
          "color": "rgba(138, 86, 208, 0.8)",
          "badgeClass": "bg-secondary"
        },
        {
          "total": 1540000,
          "currency": "JPY",
          "name": "Yen Japonés",
          "color": "rgba(230, 193, 84, 0.8)",
          "badgeClass": "bg-warning"
        },
        {
          "total": 562147892345.75,
          "currency": "MXN",
          "name": "Peso Mexicano",
          "color": "rgba(66, 165, 204, 0.8)",
          "badgeClass": "bg-primary"
        },
        {
          "total": 957621384.34,
          "currency": "USD",
          "name": "Dólar Americano",
          "color": "rgba(66, 204, 143, 0.8)",
          "badgeClass": "bg-success"
        },
        {
          "total": 1247598.32,
          "currency": "N/E",
          "name": "No Especificado",
          "color": "rgba(128, 128, 128, 0.8)",
          "badgeClass": "bg-dark"
        }
      ],
      "tendencia": {
        "periodos": ["2021-Q1", "2021-Q2", "2021-Q3", "2021-Q4", "2022-Q1", "2022-Q2", "2022-Q3", "2022-Q4", "2023-Q1", "2023-Q2"],
        "mxn": [45000, 51000, 63000, 72000, 78000, 83000, 91000, 98000, 104000, 112000],
        "otras": [95, 110, 125, 148, 163, 175, 190, 215, 230, 248]
      }
    }
  };
}

// Exportar funciones para uso en otros scripts (opcional)
window.currencyModalModule = {
  updateVisualizations,
  initializeBarChart,
  initializeTrendChart
};