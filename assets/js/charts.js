/**
 * charts.js - Funciones para crear y actualizar gráficos
 * Dashboard de Contratación Pública
 */

// Paleta de colores consistente para los gráficos
const chartColors = {
  primary: '#4e73df',
  primaryLight: 'rgba(78, 115, 223, 0.7)',
  primaryBorder: 'rgba(78, 115, 223, 1)',
  success: '#1cc88a',
  info: '#36b9cc',
  warning: '#f6c23e',
  danger: '#e74a3b',
  gray: '#858796',
  grayLight: '#f8f9fc',
  white: '#fff',
  // Colores para múltiples series
  seriesColors: [
      '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
      '#6f42c1', '#fd7e14', '#20c9a6', '#5a5c69', '#a3a4a5'
  ]
};

// Verificar que Chart esté definido antes de configurar opciones globales
if (typeof Chart !== 'undefined') {
  // Opciones globales de Chart.js para mantener consistencia en todos los gráficos
  Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', 'Arial', sans-serif";
  Chart.defaults.font.size = 13;
  Chart.defaults.color = '#858796';
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
  Chart.defaults.plugins.tooltip.titleFont = { size: 14, weight: 'bold' };
  Chart.defaults.plugins.tooltip.bodyFont = { size: 13 };
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.plugins.tooltip.cornerRadius = 6;
  Chart.defaults.plugins.legend.labels.padding = 20;
} else {
  console.error('Chart.js no está cargado correctamente. Por favor, incluya la biblioteca en su HTML.');
}

/**
* Inicializa todos los gráficos del dashboard
* @param {Object} data - Datos para los gráficos
*/
function initCharts(data) {
  // Verificar si hay datos y si Chart.js está disponible
  if (typeof Chart === 'undefined') {
    console.error('Chart.js no está disponible. Por favor, incluya la biblioteca antes de inicializar los gráficos.');
    return;
  }

  if (!data) {
    console.error('No se proporcionaron datos para los gráficos');
    return;
  }

  try {
    // No inicializamos el gráfico de empresa desde aquí, dejamos que company-chart.js lo maneje
    // Vamos a omitir esta parte para evitar conflictos
    /* 
    if (data.contractsByCompany && Array.isArray(data.contractsByCompany) && data.contractsByCompany.length > 0) {
      initCompanyContractsChart(data.contractsByCompany);
    } else {
      console.warn('Datos de contratos por empresa no disponibles o vacíos');
      // Inicializar con datos de ejemplo si no hay datos reales
      initCompanyContractsChart(getSampleCompanyData());
    }
    */
    
    if (data.procurementMethods && Array.isArray(data.procurementMethods) && data.procurementMethods.length > 0) {
      initProcurementMethodChart(data.procurementMethods);
    } else {
      console.warn('Datos de métodos de contratación no disponibles o vacíos');
      // Inicializar con datos de ejemplo
      initProcurementMethodChart(getSampleProcurementData());
    }
    
    // No inicializamos el gráfico de categorías desde aquí, dejamos que category-chart.js lo maneje
    /*
    if (data.categoriesMonthly && data.categoriesMonthly.months) {
      initCategoryChart(data.categoriesMonthly);
    } else {
      console.warn('Datos de categorías mensuales no disponibles');
      // Inicializar con datos de ejemplo
      initCategoryChart(getSampleCategoryData());
    }
    */
  } catch (error) {
    console.error('Error al inicializar los gráficos:', error);
  }
}

/**
* Esta función ha sido comentada para evitar conflictos con company-chart.js
* Crea o actualiza el gráfico de barras de contratos por empresa
* @param {Array} data - Datos de contratos por empresa
*/
/*
function initCompanyContractsChart(data) {
  // Código comentado para evitar conflictos con company-chart.js
}
*/

/**
* Crea o actualiza el gráfico de métodos de contratación
* @param {Array} data - Datos de métodos de contratación
*/
function initProcurementMethodChart(data) {
  try {
    // Verificar si el elemento canvas existe
    const canvas = document.getElementById('procurementMethodChart');
    if (!canvas) {
      console.error('No se encontró el elemento canvas #procurementMethodChart');
      return;
    }
    
    // Verificar que los datos sean válidos
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('Datos de métodos de contratación no válidos');
      data = getSampleProcurementData(); // Usar datos de ejemplo
    }
    
    const ctx = canvas.getContext('2d');

    // Preparar datos
    const labels = data.map(item => item.method || 'Sin método');
    const values = data.map(item => item.percentage || 0);

    // Colores para el gráfico de dona
    const backgroundColors = [
      chartColors.primary,
      chartColors.success,
      chartColors.info,
      chartColors.warning
    ];

    // Colores hover
    const hoverColors = [
      chartColors.primaryBorder,
      '#17a673',
      '#2c9faf',
      '#dda20a'
    ];

    if (window.procurementMethodChart) {
      // Actualizar si ya existe
      window.procurementMethodChart.data.labels = labels;
      window.procurementMethodChart.data.datasets[0].data = values;
      window.procurementMethodChart.update();
    } else {
      // Crear nuevo
      window.procurementMethodChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: backgroundColors,
            hoverBackgroundColor: hoverColors,
            hoverBorderColor: "rgba(234, 236, 244, 1)",
          }]
        },
        options: {
          maintainAspectRatio: false,
          cutout: '70%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 15
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed || 0;
                  return `${label}: ${value}%`;
                }
              }
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error al inicializar el gráfico de métodos de contratación:', error);
  }
}

/**
* Esta función ha sido comentada para evitar conflictos con category-chart.js
* Crea o actualiza el gráfico de línea para categorías por mes
* @param {Object} data - Datos de categorías por mes
*/
/*
function initCategoryChart(data) {
  try {
    // Verificar si el elemento canvas existe
    const canvas = document.getElementById('categoryChart');
    if (!canvas) {
      console.error('No se encontró el elemento canvas #categoryChart');
      return;
    }
    
    // Verificar que los datos sean válidos
    if (!data || !data.months || !Array.isArray(data.months)) {
      console.warn('Datos de categorías mensuales no válidos');
      data = getSampleCategoryData(); // Usar datos de ejemplo
    }
    
    const ctx = canvas.getContext('2d');

    // Preparar datos
    const months = data.months || [];
    const goods = data.goods || Array(months.length).fill(0);
    const services = data.services || Array(months.length).fill(0);
    const works = data.works || Array(months.length).fill(0);
    
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

    if (window.categoryChart) {
      // Actualizar si ya existe
      window.categoryChart.data.labels = months;
      window.categoryChart.data.datasets = datasets;
      window.categoryChart.update();
    } else {
      // Crear nuevo
      window.categoryChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: months,
          datasets: datasets
        },
        options: {
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Valor Total (Millones MXN)'
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
              mode: 'index',
              intersect: false
            }
          },
          elements: {
            line: {
              tension: 0.3 // Hace que las líneas sean suaves
            }
          }
        }
      });
    }
  } catch (error) {
    console.error('Error al inicializar el gráfico de categorías:', error);
  }
}
*/

/**
* Actualiza las estadísticas de tarjetas basadas en los datos filtrados
* @param {Object} data - Datos de estadísticas
*/
function updateStatsCards(data) {
  try {
    if (!data) {
      console.warn('No se proporcionaron datos para actualizar las tarjetas de estadísticas');
      return;
    }
    
    const totalContratosElement = document.getElementById('totalContratos');
    const valorTotalElement = document.getElementById('valorTotal');
    const totalEmpresasElement = document.getElementById('totalEmpresas');
    const licitacionesActivasElement = document.getElementById('licitacionesActivas');
    
    if (totalContratosElement) {
      totalContratosElement.textContent = numberWithCommas(data.totalContracts || 0);
    }
    
    if (valorTotalElement) {
      valorTotalElement.textContent = '$' + numberWithCommas(data.totalValue || 0);
    }
    
    if (totalEmpresasElement) {
      totalEmpresasElement.textContent = data.totalSuppliers || 0;
    }
    
    if (licitacionesActivasElement) {
      licitacionesActivasElement.textContent = data.activeTenders || 0;
    }
  } catch (error) {
    console.error('Error al actualizar las tarjetas de estadísticas:', error);
  }
}

/**
* Formatea números con comas como separadores de miles
* @param {number} x - Número a formatear
* @returns {string} Número formateado
*/
function numberWithCommas(x) {
  if (x === undefined || x === null) return '0';
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
* Exporta el gráfico como imagen o PDF
* @param {string} chartId - ID del canvas del gráfico
* @param {string} format - Formato de exportación ('png', 'jpg', 'pdf')
* @param {string} fileName - Nombre del archivo a descargar
*/
function exportChart(chartId, format, fileName) {
  try {
    const canvas = document.getElementById(chartId);
    if (!canvas) {
      console.error(`El canvas con ID ${chartId} no existe`);
      return;
    }

    if (format === 'pdf') {
      // Requiere jsPDF (debe ser incluido en el proyecto)
      if (typeof jsPDF === 'undefined') {
        console.error('jsPDF no está disponible. Incluya la biblioteca para exportar en PDF.');
        return;
      }
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    } else {
      // Exportar como imagen
      const link = document.createElement('a');
      link.download = `${fileName}.${format}`;
      link.href = canvas.toDataURL(`image/${format}`);
      link.click();
    }
  } catch (error) {
    console.error('Error al exportar el gráfico:', error);
  }
}

/**
 * Genera datos de ejemplo para el gráfico de contratos por empresa
 * @returns {Array} Datos de ejemplo
 */
function getSampleCompanyData() {
  return [
    { company: "Empresa A", contracts: 45, value: 12500000 },
    { company: "Empresa B", contracts: 30, value: 8750000 },
    { company: "Empresa C", contracts: 25, value: 6200000 },
    { company: "Empresa D", contracts: 18, value: 5100000 },
    { company: "Empresa E", contracts: 12, value: 3800000 }
  ];
}

/**
 * Genera datos de ejemplo para el gráfico de métodos de contratación
 * @returns {Array} Datos de ejemplo
 */
function getSampleProcurementData() {
  return [
    { method: "Licitación Pública", percentage: 45 },
    { method: "Adjudicación Directa", percentage: 30 },
    { method: "Invitación a Tres", percentage: 15 },
    { method: "Convenio Modificatorio", percentage: 10 }
  ];
}

/**
 * Genera datos de ejemplo para el gráfico de categorías por mes
 * @returns {Object} Datos de ejemplo
 */
function getSampleCategoryData() {
  return {
    months: ["Ene", "Feb", "Mar", "Abr", "May", "Jun"],
    goods: [12.5, 15.8, 14.2, 16.5, 18.2, 17.5],
    services: [8.3, 7.5, 9.8, 10.2, 11.5, 12.8],
    works: [5.2, 6.4, 4.8, 7.2, 8.5, 9.1]
  };
}

// Exportar funciones públicas
window.chartUtils = {
  initCharts,
  updateStatsCards,
  exportChart,
  getSampleCompanyData,
  getSampleProcurementData,
  getSampleCategoryData
};