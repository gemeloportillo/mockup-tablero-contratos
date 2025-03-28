/**
 * main.js
 * 
 * Script principal del dashboard que coordina la inicialización de todos los componentes
 */

// Indicar que el dashboard se está inicializando desde main.js
window.dashboardInitialized = true;

// Inicializar todos los componentes cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
  console.log('Inicializando Dashboard de Seguimiento a la Contratación Pública');
  
  // Inicializar los datos globales
  initializeGlobalData();
  
  // Inicializar los dropdowns de Bootstrap
  initializeBootstrapComponents();
  
  // Inicializar el mapa después de que los datos estén disponibles
  if (window.mapUtils && typeof window.mapUtils.initializeMap === 'function') {
    window.mapUtils.initializeMap();
  } else {
    console.warn('mapUtils no disponible. Asegúrate de que map.js esté cargado antes que main.js');
  }
  
  // Configurar eventos para los botones de exportación
  setupExportEvents();
  
  // Manejar eventos de redimensionamiento para gráficos responsivos
  window.addEventListener('resize', handleResize);
});

/**
 * Inicializa los datos globales utilizados en el dashboard
 */
function initializeGlobalData() {
  // Datos nacionales para el gráfico de métodos de contratación
  window.methodsDataNacional = {
    labels: ['Licitación Abierta', 'Licitación Selectiva', 'Contratación Directa', 'Licitación Limitada'],
    datasets: [{
      data: [45, 25, 20, 10],
      backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
      hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
      hoverBorderColor: "rgba(234, 236, 244, 1)",
    }]
  };

  // Datos por estado para el gráfico de métodos de contratación
  window.estadosDatosContratacion = {
    "BAJA CALIFORNIA": { data: [50, 20, 15, 15] },
    "BAJA CALIFORNIA SUR": { data: [35, 30, 25, 10] },
    "SONORA": { data: [55, 20, 15, 10] },
    "CHIHUAHUA": { data: [45, 30, 15, 10] },
    "COAHUILA": { data: [40, 25, 20, 15] },
    "NUEVO LEÓN": { data: [60, 15, 15, 10] },
    "TAMAULIPAS": { data: [45, 25, 20, 10] },
    "SINALOA": { data: [30, 35, 25, 10] },
    "DURANGO": { data: [35, 25, 25, 15] },
    "ZACATECAS": { data: [40, 30, 20, 10] },
    "SAN LUIS POTOSI": { data: [45, 25, 20, 10] },
    "NAYARIT": { data: [25, 35, 30, 10] },
    "JALISCO": { data: [55, 20, 15, 10] },
    "AGUASCALIENTES": { data: [30, 30, 30, 10] },
    "GUANAJUATO": { data: [50, 20, 20, 10] },
    "QUERÉTARO": { data: [35, 30, 25, 10] },
    "HIDALGO": { data: [40, 25, 25, 10] },
    "COLIMA": { data: [30, 30, 30, 10] },
    "MICHOACÁN DE OCAMPO": { data: [35, 25, 30, 10] },
    "ESTADO DE MÉXICO": { data: [45, 25, 20, 10] },
    "CIUDAD DE MÉXICO": { data: [65, 15, 10, 10] },
    "TLAXCALA": { data: [30, 30, 30, 10] },
    "MORELOS": { data: [35, 25, 30, 10] },
    "PUEBLA": { data: [45, 25, 20, 10] },
    "VERACRUZ": { data: [40, 25, 25, 10] },
    "GUERRERO": { data: [25, 30, 35, 10] },
    "OAXACA": { data: [20, 30, 40, 10] },
    "TABASCO": { data: [30, 25, 35, 10] },
    "CHIAPAS": { data: [20, 35, 30, 15] },
    "CAMPECHE": { data: [40, 25, 30, 5] },
    "YUCATÁN": { data: [35, 30, 25, 10] },
    "QUINTANA ROO": { data: [35, 30, 25, 10] }
  };

  // Datos simulados de cantidad de contratos por estado para el mapa
  window.datosContratosPorEstado = {
    "BAJA CALIFORNIA": 87,
    "BAJA CALIFORNIA SUR": 42,
    "SONORA": 112,
    "CHIHUAHUA": 98,
    "COAHUILA": 76,
    "NUEVO LEÓN": 134,
    "TAMAULIPAS": 72,
    "SINALOA": 68,
    "DURANGO": 45,
    "ZACATECAS": 39,
    "SAN LUIS POTOSI": 63,
    "NAYARIT": 31,
    "JALISCO": 127,
    "AGUASCALIENTES": 29,
    "GUANAJUATO": 105,
    "QUERÉTARO": 78,
    "HIDALGO": 69,
    "COLIMA": 22,
    "MICHOACÁN DE OCAMPO": 84,
    "ESTADO DE MÉXICO": 157,
    "CIUDAD DE MÉXICO": 217,
    "TLAXCALA": 27,
    "MORELOS": 38,
    "PUEBLA": 89,
    "VERACRUZ": 103,
    "GUERRERO": 57,
    "OAXACA": 71,
    "TABASCO": 68,
    "CHIAPAS": 66,
    "CAMPECHE": 41,
    "YUCATÁN": 61,
    "QUINTANA ROO": 55
  };
}


/**
 * Datos de ejemplo de contratos recientes para cada estado
 * Este objeto se utilizará para mostrar contratos específicos cuando se seleccione un estado
 */
window.estadosContratosRecientes = {
  // Contratos para estados del norte
  "BAJA CALIFORNIA": [
      {id: "BC-2025-0143", proveedor: "Desarrollo y Construcciones del Norte S.A.", monto: 1850000, fecha: "18/03/2025", estado: "Activo"},
      {id: "BC-2025-0142", proveedor: "TechNova Solutions", monto: 950000, fecha: "15/03/2025", estado: "Activo"},
      {id: "BC-2025-0141", proveedor: "Constructora Fronteriza S.A.", monto: 725000, fecha: "12/03/2025", estado: "Activo"},
      {id: "BC-2025-0140", proveedor: "Sistemas Tecnológicos Avanzados", monto: 325000, fecha: "07/03/2025", estado: "Pendiente"},
      {id: "BC-2025-0139", proveedor: "Suministros Médicos del Norte", monto: 580000, fecha: "01/03/2025", estado: "Activo"}
  ],
  "SONORA": [
      {id: "SON-2025-0167", proveedor: "Constructora del Desierto S.A.", monto: 1740000, fecha: "20/03/2025", estado: "Activo"},
      {id: "SON-2025-0166", proveedor: "Soluciones Agroindustriales", monto: 890000, fecha: "17/03/2025", estado: "Activo"},
      {id: "SON-2025-0165", proveedor: "Tecnología Minera Aplicada", monto: 1200000, fecha: "14/03/2025", estado: "Activo"},
      {id: "SON-2025-0164", proveedor: "Infraestructura Sonorense", monto: 650000, fecha: "10/03/2025", estado: "Pendiente"},
      {id: "SON-2025-0163", proveedor: "Equipamiento Industrial del Norte", monto: 485000, fecha: "05/03/2025", estado: "Activo"}
  ],
  "CHIHUAHUA": [
      {id: "CHIH-2025-0182", proveedor: "Desarrollos Urbanos de Chihuahua", monto: 1950000, fecha: "19/03/2025", estado: "Activo"},
      {id: "CHIH-2025-0181", proveedor: "Sistemas Automatizados", monto: 870000, fecha: "16/03/2025", estado: "Activo"},
      {id: "CHIH-2025-0180", proveedor: "Infraestructura Vial del Norte", monto: 1320000, fecha: "13/03/2025", estado: "Activo"},
      {id: "CHIH-2025-0179", proveedor: "Tecnologías Educativas", monto: 420000, fecha: "09/03/2025", estado: "Pendiente"},
      {id: "CHIH-2025-0178", proveedor: "Equipamiento Hospitalario Integral", monto: 760000, fecha: "04/03/2025", estado: "Activo"}
  ],
  
  // Contratos para estados del centro
  "CIUDAD DE MÉXICO": [
      {id: "CDMX-2025-0217", proveedor: "Infraestructura Urbana Capital", monto: 4250000, fecha: "21/03/2025", estado: "Activo"},
      {id: "CDMX-2025-0216", proveedor: "Soluciones Digitales Metropolitanas", monto: 1950000, fecha: "18/03/2025", estado: "Activo"},
      {id: "CDMX-2025-0215", proveedor: "Construcciones y Obras Públicas", monto: 3100000, fecha: "15/03/2025", estado: "Activo"},
      {id: "CDMX-2025-0214", proveedor: "Sistemas de Transporte Integrado", monto: 2750000, fecha: "12/03/2025", estado: "Pendiente"},
      {id: "CDMX-2025-0213", proveedor: "Servicios Sanitarios Centrales", monto: 1825000, fecha: "08/03/2025", estado: "Activo"}
  ],
  "ESTADO DE MÉXICO": [
      {id: "EDOMEX-2025-0198", proveedor: "Desarrollo Metropolitano S.A.", monto: 2850000, fecha: "20/03/2025", estado: "Activo"},
      {id: "EDOMEX-2025-0197", proveedor: "Tecnologías Industriales Mexiquenses", monto: 1350000, fecha: "17/03/2025", estado: "Activo"},
      {id: "EDOMEX-2025-0196", proveedor: "Infraestructura Hidráulica Regional", monto: 1950000, fecha: "14/03/2025", estado: "Activo"},
      {id: "EDOMEX-2025-0195", proveedor: "Equipamientos Escolares Integrales", monto: 980000, fecha: "11/03/2025", estado: "Pendiente"},
      {id: "EDOMEX-2025-0194", proveedor: "Servicios Logísticos del Centro", monto: 640000, fecha: "07/03/2025", estado: "Activo"}
  ],
  "JALISCO": [
      {id: "JAL-2025-0172", proveedor: "Construcciones Tapatías S.A.", monto: 2250000, fecha: "19/03/2025", estado: "Activo"},
      {id: "JAL-2025-0171", proveedor: "Desarrollos Tecnológicos de Occidente", monto: 1150000, fecha: "16/03/2025", estado: "Activo"},
      {id: "JAL-2025-0170", proveedor: "Infraestructura Urbana Jalisco", monto: 1780000, fecha: "13/03/2025", estado: "Activo"},
      {id: "JAL-2025-0169", proveedor: "Equipamiento Hospitalario Occidental", monto: 850000, fecha: "10/03/2025", estado: "Pendiente"},
      {id: "JAL-2025-0168", proveedor: "Servicios Integrales Guadalajara", monto: 520000, fecha: "06/03/2025", estado: "Activo"}
  ],
  
  // Contratos para estados del sur
  "OAXACA": [
      {id: "OAX-2025-0152", proveedor: "Desarrollos Turísticos de Oaxaca", monto: 1650000, fecha: "18/03/2025", estado: "Activo"},
      {id: "OAX-2025-0151", proveedor: "Infraestructura Rural Sustentable", monto: 920000, fecha: "15/03/2025", estado: "Activo"},
      {id: "OAX-2025-0150", proveedor: "Constructora del Sureste", monto: 1450000, fecha: "12/03/2025", estado: "Activo"},
      {id: "OAX-2025-0149", proveedor: "Tecnologías Educativas Rurales", monto: 580000, fecha: "09/03/2025", estado: "Pendiente"},
      {id: "OAX-2025-0148", proveedor: "Suministros Médicos Oaxaqueños", monto: 390000, fecha: "05/03/2025", estado: "Activo"}
  ],
  "CHIAPAS": [
      {id: "CHP-2025-0137", proveedor: "Desarrollos Comunitarios de Chiapas", monto: 1250000, fecha: "17/03/2025", estado: "Activo"},
      {id: "CHP-2025-0136", proveedor: "Infraestructura Hidráulica del Sur", monto: 950000, fecha: "14/03/2025", estado: "Activo"},
      {id: "CHP-2025-0135", proveedor: "Tecnologías Agrícolas Sostenibles", monto: 820000, fecha: "11/03/2025", estado: "Activo"},
      {id: "CHP-2025-0134", proveedor: "Construcciones Rurales S.A.", monto: 560000, fecha: "08/03/2025", estado: "Pendiente"},
      {id: "CHP-2025-0133", proveedor: "Servicios Educativos Integrales", monto: 430000, fecha: "04/03/2025", estado: "Activo"}
  ],
  "YUCATÁN": [
      {id: "YUC-2025-0128", proveedor: "Desarrollos Turísticos de Yucatán", monto: 1750000, fecha: "19/03/2025", estado: "Activo"},
      {id: "YUC-2025-0127", proveedor: "Infraestructura Peninsular", monto: 980000, fecha: "16/03/2025", estado: "Activo"},
      {id: "YUC-2025-0126", proveedor: "Tecnologías Sustentables Maya", monto: 860000, fecha: "13/03/2025", estado: "Activo"},
      {id: "YUC-2025-0125", proveedor: "Constructora Mérida S.A.", monto: 620000, fecha: "10/03/2025", estado: "Pendiente"},
      {id: "YUC-2025-0124", proveedor: "Servicios Médicos Peninsulares", monto: 470000, fecha: "07/03/2025", estado: "Activo"}
  ],
  
  // Datos nacionales (para mostrar cuando no hay estado seleccionado)
  "NACIONAL": [
      {id: "CON-2025-0125", proveedor: "Constructora Hernández S.A.", monto: 1250000, fecha: "15/03/2025", estado: "Activo"},
      {id: "CON-2025-0124", proveedor: "TechSolutions Inc.", monto: 890500, fecha: "12/03/2025", estado: "Activo"},
      {id: "CON-2025-0123", proveedor: "Grupo Logístico Internacional", monto: 422800, fecha: "10/03/2025", estado: "Activo"},
      {id: "CON-2025-0122", proveedor: "Servicios Integrales S.A.", monto: 150750, fecha: "05/03/2025", estado: "Pendiente"},
      {id: "CON-2025-0121", proveedor: "Medical Supplies Corp.", monto: 320000, fecha: "01/03/2025", estado: "Activo"}
  ]
};

/**
 * Inicializa componentes de Bootstrap
 */
function initializeBootstrapComponents() {
  // Inicializar todos los tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
  
  // Inicializar todos los popovers
  const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
  popoverTriggerList.map(function (popoverTriggerEl) {
    return new bootstrap.Popover(popoverTriggerEl);
  });
}

/**
 * Configura eventos para los botones de exportación
 */
function setupExportEvents() {
  document.querySelectorAll('.dropdown-item').forEach(item => {
    if (item.textContent.includes('Exportar como CSV')) {
      item.addEventListener('click', function() {
        const parentCard = this.closest('.card');
        if (parentCard) {
          const cardTitle = parentCard.querySelector('.card-header h6').textContent.trim();
          
          if (cardTitle.includes('Distribución Regional')) {
            if (window.mapUtils && typeof window.mapUtils.exportStateDataAsCSV === 'function') {
              window.mapUtils.exportStateDataAsCSV();
            } else {
              console.warn('Función exportStateDataAsCSV no disponible');
              alert('Exportación a CSV no disponible');
            }
          } else {
            exportData('csv', cardTitle);
          }
        }
      });
    }
    
    if (item.textContent.includes('Exportar como PDF')) {
      item.addEventListener('click', function() {
        const parentCard = this.closest('.card');
        if (parentCard) {
          const cardTitle = parentCard.querySelector('.card-header h6').textContent.trim();
          exportData('pdf', cardTitle);
        }
      });
    }
    
    if (item.textContent.includes('Actualizar datos')) {
      item.addEventListener('click', function() {
        const parentCard = this.closest('.card');
        if (parentCard) {
          const cardTitle = parentCard.querySelector('.card-header h6').textContent.trim();
          
          if (cardTitle.includes('Distribución Regional')) {
            if (window.mapUtils && typeof window.mapUtils.initializeMap === 'function') {
              window.mapUtils.initializeMap();
            }
          } else if (cardTitle.includes('Métodos de Contratación')) {
            if (window.methodsChart) {
              window.methodsChart.update();
            }
          } else if (cardTitle.includes('Contratos Adjudicados por Empresa')) {
            if (window.companyChart) {
              window.companyChart.update();
            }
          } else if (cardTitle.includes('Distribución por Categoría')) {
            if (window.categoryChart) {
              window.categoryChart.update();
            }
          }
          
          console.log(`Actualizando ${cardTitle}...`);
        }
      });
    }
  });
}

/**
 * Maneja el redimensionamiento de la ventana para actualizar gráficos
 */
function handleResize() {
  // Redimensionar mapa si existe
  const mapContainer = document.getElementById('mexico-map');
  if (mapContainer && mapContainer.querySelector('svg')) {
    // En esta implementación, no necesitamos hacerlo manualmente
    // ya que D3 maneja bien los SVG responsivos con viewBox
    console.log('Redimensionando mapa...');
  }
}

/**
 * Función para exportar datos del dashboard a diferentes formatos
 * @param {string} format - Formato de exportación ('csv', 'pdf', etc.)
 * @param {string} component - Nombre del componente a exportar
 */
function exportData(format, component) {
  console.log(`Exportando ${component} como ${format}`);
  
  // Simulación de exportación
  alert(`Se descargará ${component} en formato ${format}`);
  
  // En una implementación real:
  // 1. Para CSV: Generar datos en formato CSV y descargar
  // 2. Para PDF: Usar una biblioteca como jsPDF para generar el PDF
}

// Exponer funciones públicas
window.dashboardUtils = {
  exportData: exportData
};