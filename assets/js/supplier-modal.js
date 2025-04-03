/**
 * supplier-modal.js
 *
 * Script para el modal de detalles de empresas adjudicadas
 * Sigue el mismo patrón de inicialización que otros scripts funcionales del dashboard
 */

// Variables globales para los gráficos
window.marketConcentrationChart = null;
window.topSuppliersChart = null;
window.supplierCategoriesChart = null;
let supplierData = null;
let currentSupplierRegion = "hidalgo";
let currentSupplierPage = 1;
let supplierItemsPerPage = 10;
let filteredSuppliers = [];
let sortSuppliersBy = "value"; // 'value' o 'contracts' o 'avgValue'
let concentrationView = "value"; // 'value' o 'contracts'

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function() {
  console.log("Inicializando script de modal de empresas adjudicadas...");
  
  // Configurar el enlace en la tarjeta para abrir el modal
  const empresasCard = document.querySelector(".card.bg-gradient-info");
  if (empresasCard) {
    const verDetallesLink = empresasCard.querySelector(".card-footer a");
    if (verDetallesLink) {
      verDetallesLink.setAttribute("data-bs-toggle", "modal");
      verDetallesLink.setAttribute("data-bs-target", "#supplierDetailModal");
      verDetallesLink.removeAttribute("href");
    }
  }
  
  // Configurar el evento para cuando se muestre el modal
  const supplierModal = document.getElementById("supplierDetailModal");
  if (supplierModal) {
    supplierModal.addEventListener("shown.bs.modal", function() {
      console.log("Modal de empresas mostrado - Inicializando gráficos...");
      // Cargar datos y luego inicializar visualizaciones
      loadSupplierData().then(() => {
        // Usar un timeout para asegurar que el DOM esté totalmente renderizado
        setTimeout(function() {
          updateSupplierVisualizations(currentSupplierRegion);
        }, 300);
      });
    });
  }
  
  // Configurar cambio de región
  const regionSelector = document.getElementById("supplierRegionSelector");
  if (regionSelector) {
    regionSelector.addEventListener("change", function() {
      currentSupplierRegion = this.value;
      const currentRegionLabel = document.getElementById("supplierCurrentRegion");
      if (currentRegionLabel) {
        currentRegionLabel.textContent = this.options[this.selectedIndex].text;
      }
      currentSupplierPage = 1; // Resetear paginación
      updateSupplierVisualizations(currentSupplierRegion);
    });
  }
  
  // Configurar cambio entre vistas de concentración
  document.getElementById("viewByValue")?.addEventListener("click", function() {
    this.classList.add("active");
    document.getElementById("viewByContracts").classList.remove("active");
    concentrationView = "value";
    if (supplierData && supplierData[currentSupplierRegion]) {
      initializeMarketConcentrationChart(supplierData[currentSupplierRegion].marketConcentration);
      document.getElementById("concentrationNote").textContent = "Top 10 empresas vs resto del mercado por monto adjudicado";
    }
  });
  
  document.getElementById("viewByContracts")?.addEventListener("click", function() {
    this.classList.add("active");
    document.getElementById("viewByValue").classList.remove("active");
    concentrationView = "contracts";
    if (supplierData && supplierData[currentSupplierRegion]) {
      initializeMarketConcentrationChart(supplierData[currentSupplierRegion].marketConcentration);
      document.getElementById("concentrationNote").textContent = "Top 10 empresas vs resto del mercado por número de contratos";
    }
  });
  
  // Configurar ordenamiento de empresas
  document.getElementById("sortSuppliersByValue")?.addEventListener("click", function(e) {
    e.preventDefault();
    sortSuppliersBy = "value";
    if (supplierData && supplierData[currentSupplierRegion]) {
      initializeTopSuppliersChart(supplierData[currentSupplierRegion].topSuppliers);
    }
  });
  
  document.getElementById("sortSuppliersByContracts")?.addEventListener("click", function(e) {
    e.preventDefault();
    sortSuppliersBy = "contracts";
    if (supplierData && supplierData[currentSupplierRegion]) {
      initializeTopSuppliersChart(supplierData[currentSupplierRegion].topSuppliers);
    }
  });
  
  document.getElementById("sortSuppliersByAvgValue")?.addEventListener("click", function(e) {
    e.preventDefault();
    sortSuppliersBy = "avgValue";
    if (supplierData && supplierData[currentSupplierRegion]) {
      initializeTopSuppliersChart(supplierData[currentSupplierRegion].topSuppliers);
    }
  });
  
  // Configurar búsqueda de empresas
  const searchButton = document.getElementById("supplierSearchButton");
  const searchInput = document.getElementById("supplierSearch");
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", function() {
      filterSuppliersTable(searchInput.value);
    });
    searchInput.addEventListener("keyup", function(e) {
      if (e.key === "Enter") {
        filterSuppliersTable(this.value);
      }
    });
  }
  
  // Configurar paginación
  document.querySelectorAll('#supplierDetailModal .pagination .page-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageText = this.textContent;
      
      if (pageText === 'Anterior') {
        if (currentSupplierPage > 1) currentSupplierPage--;
      } else if (pageText === 'Siguiente') {
        if (currentSupplierPage < Math.ceil(filteredSuppliers.length / supplierItemsPerPage)) {
          currentSupplierPage++;
        }
      } else {
        currentSupplierPage = parseInt(pageText);
      }
      
      updateSuppliersTable(filteredSuppliers);
      updateSupplierPagination();
    });
  });
});

/**
 * Carga los datos de empresas desde un archivo JSON
 * @returns {Promise} Promesa que se resuelve con los datos cargados
 */
async function loadSupplierData() {
  if (supplierData) {
    return supplierData; // Usar datos en caché si ya se cargaron
  }
  
  try {
    console.log("Intentando cargar datos de empresas desde JSON...");
    const response = await fetch("data/supplier-data.json");
    if (!response.ok) {
      throw new Error(`Error al cargar los datos: ${response.status}`);
    }
    supplierData = await response.json();
    console.log("Datos de empresas cargados correctamente:", Object.keys(supplierData));
    return supplierData;
  } catch (error) {
    console.error("Error al cargar datos de empresas:", error);
    // Usar datos de ejemplo si falla la carga
    console.log("Usando datos de ejemplo para empresas");
    supplierData = generateSampleSupplierData();
    return supplierData;
  }
}

/**
 * Actualiza todas las visualizaciones con los datos de la región seleccionada
 * @param {string} region - Región seleccionada
 */
function updateSupplierVisualizations(region) {
  console.log(`Actualizando visualizaciones de empresas para región: ${region}`);
  
  if (!supplierData || !supplierData[region]) {
    console.error(`No hay datos disponibles para la región: ${region}`);
    return;
  }
  
  const regionData = supplierData[region];
  
  // Actualizar las estadísticas generales
  updateSupplierStatistics(regionData.stats);
  
  // Inicializar/actualizar los gráficos
  console.log("Inicializando gráficos de empresas...");
  initializeMarketConcentrationChart(regionData.marketConcentration);
  initializeTopSuppliersChart(regionData.topSuppliers);
  initializeSupplierCategoriesChart(regionData.categories);
  
  // Actualizar la tabla de empresas
  filteredSuppliers = [...regionData.suppliers];
  updateSuppliersTable(filteredSuppliers);
  updateSupplierPagination();
}

/**
 * Actualiza las estadísticas generales de empresas
 * @param {Object} stats - Datos estadísticos
 */
function updateSupplierStatistics(stats) {
  console.log("Actualizando estadísticas de empresas...");
  
  // Actualizar contadores
  document.getElementById("totalSuppliersCount").textContent = stats.total.toLocaleString();
  document.getElementById("avgContractsPerSupplier").textContent = stats.avgContracts.toFixed(1);
  
  // Formatear valor promedio como moneda
  const avgValue = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(stats.avgValue);
  document.getElementById("avgValuePerSupplier").textContent = avgValue;
  
  // Actualizar índice de concentración
  document.getElementById("concentrationIndex").textContent = `${stats.concentrationIndex.toFixed(1)}%`;
}

/**
 * Inicializa el gráfico de concentración de mercado
 * @param {Object} concentrationData - Datos de concentración de mercado
 */
function initializeMarketConcentrationChart(concentrationData) {
  console.log("Inicializando gráfico de concentración de mercado...");
  
  const chartCtx = document.getElementById("marketConcentrationChart");
  if (!chartCtx) {
    console.error("No se encontró el elemento #marketConcentrationChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Determinar qué datos usar según la vista seleccionada
  const dataField = concentrationView === "value" ? "valuePercentage" : "contractsPercentage";
  
  // Preparar datos para el gráfico
  const labels = ["Top 10 Empresas", "Resto de Empresas"];
  const values = [
    concentrationData.top10[dataField], 
    concentrationData.others[dataField]
  ];
  const colors = [
    "rgba(66, 165, 204, 0.8)",   // Azul para top 10
    "rgba(204, 204, 204, 0.8)"   // Gris para el resto
  ];
  
  // Intentar destruir el gráfico anterior si existe
  if (window.marketConcentrationChart) {
    window.marketConcentrationChart.destroy();
  }
  
  try {
    window.marketConcentrationChart = new Chart(chartCtx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace("0.8", "1")),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || "";
                const value = context.raw || 0;
                
                // Información adicional según el tipo de vista
                let detailValue;
                if (concentrationView === "value") {
                  detailValue = context.dataIndex === 0 
                    ? concentrationData.top10.totalValue 
                    : concentrationData.others.totalValue;
                  
                  // Formatear como moneda
                  const formattedValue = new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    maximumFractionDigits: 0
                  }).format(detailValue);
                  
                  return `${label}: ${value.toFixed(1)}% (${formattedValue})`;
                } else {
                  detailValue = context.dataIndex === 0 
                    ? concentrationData.top10.contracts 
                    : concentrationData.others.contracts;
                    
                  return `${label}: ${value.toFixed(1)}% (${detailValue} contratos)`;
                }
              }
            }
          }
        }
      }
    });
    console.log("Gráfico de concentración de mercado creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de concentración de mercado:", error);
  }
}

/**
 * Inicializa el gráfico de top empresas
 * @param {Array} suppliersData - Datos de las principales empresas
 */
function initializeTopSuppliersChart(suppliersData) {
  console.log("Inicializando gráfico de top empresas...");
  
  const chartCtx = document.getElementById("topSuppliersChart");
  if (!chartCtx) {
    console.error("No se encontró el elemento #topSuppliersChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Ordenar datos según el criterio seleccionado
  const sortedData = [...suppliersData].sort((a, b) => {
    switch (sortSuppliersBy) {
      case "contracts":
        return b.contracts - a.contracts;
      case "avgValue":
        return (b.value / b.contracts) - (a.value / a.contracts);
      case "value":
      default:
        return b.value - a.value;
    }
  });
  
  // Limitar a los top 10 para mejor visualización
  const topData = sortedData.slice(0, 10);
  
  // Preparar datos para el gráfico
  const labels = topData.map(item => {
    // Acortar nombres largos para mejorar visualización
    let name = item.name;
    if (name.length > 25) {
      name = name.substring(0, 22) + "...";
    }
    return name;
  });
  
  let values, suffix, formatterFn;
  
  switch (sortSuppliersBy) {
    case "contracts":
      values = topData.map(item => item.contracts);
      suffix = " contratos";
      formatterFn = value => value.toLocaleString();
      break;
    case "avgValue":
      values = topData.map(item => item.value / item.contracts);
      suffix = "";
      formatterFn = value => new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
      }).format(value);
      break;
    case "value":
    default:
      values = topData.map(item => item.value);
      suffix = "";
      formatterFn = value => new Intl.NumberFormat("es-MX", {
        style: "currency",
        currency: "MXN",
        maximumFractionDigits: 0
      }).format(value);
      break;
  }
  
  const colors = topData.map(item => item.color || "rgba(66, 165, 204, 0.8)");
  
  // Intentar destruir el gráfico anterior si existe
  if (window.topSuppliersChart) {
    window.topSuppliersChart.destroy();
  }
  
  try {
    window.topSuppliersChart = new Chart(chartCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [{
          label: sortSuppliersBy === "contracts" ? "Número de Contratos" : 
                 sortSuppliersBy === "avgValue" ? "Valor Promedio por Contrato" :
                 "Monto Total Adjudicado",
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace("0.8", "1")),
          borderWidth: 1,
          barPercentage: 0.7,
          categoryPercentage: 0.8
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
                return `${context.dataset.label}: ${formatterFn(context.raw)}${suffix}`;
              }
            }
          }
        },
        scales: {
          x: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                // Para montos grandes, mostrar en millones o miles
                if (sortSuppliersBy !== "contracts") {
                  if (value >= 1000000) {
                    return `${(value / 1000000).toFixed(1)}M`;
                  } else if (value >= 1000) {
                    return `${(value / 1000).toFixed(0)}K`;
                  }
                }
                return value;
              }
            }
          }
        }
      }
    });
    console.log("Gráfico de top empresas creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de top empresas:", error);
  }
}

/**
 * Inicializa el gráfico de categorías de empresas
 * @param {Array} categoriesData - Datos de categorías de las empresas
 */
/**
 * Actualiza la tabla de empresas adjudicadas con paginación
 * @param {Array} suppliers - Lista de empresas
 */
function updateSuppliersTable(suppliers) {
  console.log(`Actualizando tabla de empresas, página ${currentSupplierPage}`);
  
  const tableBody = document.getElementById("suppliersTableBody");
  if (!tableBody) {
    console.error("No se encontró el elemento #suppliersTableBody");
    return;
  }
  
  // Limpiar la tabla
  tableBody.innerHTML = "";
  
  // Calcular índices para paginación
  const startIndex = (currentSupplierPage - 1) * supplierItemsPerPage;
  const endIndex = Math.min(startIndex + supplierItemsPerPage, suppliers.length);
  const pageSuppliers = suppliers.slice(startIndex, endIndex);
  
  if (pageSuppliers.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="6" class="text-center py-3">No se encontraron empresas</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  // Añadir filas a la tabla
  pageSuppliers.forEach(supplier => {
    const row = document.createElement("tr");
    
    // Calcular el valor promedio por contrato
    const avgValue = supplier.value / supplier.contracts;
    
    // Formatear valores monetarios
    const formattedValue = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(supplier.value);
    
    const formattedAvgValue = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(avgValue);
    
    row.innerHTML = `
      <td>${supplier.name}</td>
      <td><small>${supplier.id || "N/A"}</small></td>
      <td class="text-center">${supplier.contracts}</td>
      <td class="text-end">${formattedValue}</td>
      <td class="text-end">${formattedAvgValue}</td>
      <td class="text-center">
        <button type="button" class="btn btn-sm btn-outline-info" 
          data-supplier-id="${supplier.id}" onclick="showSupplierDetail('${supplier.id}')">
          <i class="fas fa-info-circle"></i>
        </button>
      </td>
    `;
    
    tableBody.appendChild(row);
  });
}

/**
 * Actualiza los controles de paginación
 */
function updateSupplierPagination() {
  const totalPages = Math.ceil(filteredSuppliers.length / supplierItemsPerPage);
  const pagination = document.querySelector('#supplierDetailModal .pagination');
  if (!pagination) return;
  
  // Actualizar el estado de los botones de navegación
  const prevButton = pagination.querySelector(".page-item:first-child");
  const nextButton = pagination.querySelector(".page-item:last-child");
  
  if (currentSupplierPage <= 1) {
    prevButton.classList.add("disabled");
  } else {
    prevButton.classList.remove("disabled");
  }
  
  if (currentSupplierPage >= totalPages) {
    nextButton.classList.add("disabled");
  } else {
    nextButton.classList.remove("disabled");
  }
  
  // Actualizar los botones numerados
  const pageLinks = pagination.querySelectorAll(".page-item:not(:first-child):not(:last-child)");
  
  // Determinar qué páginas mostrar (siempre mostramos 3)
  let startPage = Math.max(1, currentSupplierPage - 1);
  let endPage = Math.min(startPage + 2, totalPages);
  
  // Ajustar si estamos en las últimas páginas
  if (endPage - startPage < 2) {
    startPage = Math.max(1, endPage - 2);
  }
  
  pageLinks.forEach((link, index) => {
    const pageNum = startPage + index;
    const anchor = link.querySelector("a");
    
    if (pageNum <= totalPages) {
      link.style.display = "";
      anchor.textContent = pageNum;
      
      if (pageNum === currentSupplierPage) {
        link.classList.add("active");
      } else {
        link.classList.remove("active");
      }
    } else {
      link.style.display = "none";
    }
  });
}

/**
 * Filtra la tabla de empresas según término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterSuppliersTable(searchTerm) {
  console.log(`Filtrando empresas por término: ${searchTerm}`);
  
  if (!supplierData || !supplierData[currentSupplierRegion]) {
    return;
  }
  
  searchTerm = searchTerm.toLowerCase().trim();
  
  if (!searchTerm) {
    // Si no hay término de búsqueda, mostrar todas las empresas
    filteredSuppliers = [...supplierData[currentSupplierRegion].suppliers];
  } else {
    // Filtrar por el término de búsqueda
    filteredSuppliers = supplierData[currentSupplierRegion].suppliers.filter(supplier => {
      return (
        supplier.name.toLowerCase().includes(searchTerm) ||
        (supplier.id && supplier.id.toLowerCase().includes(searchTerm))
      );
    });
  }
  
  // Resetear paginación y actualizar tabla
  currentSuppplierPage = 1;
  updateSuppliersTable(filteredSuppliers);
  updateSupplierPagination();
}

/**
 * Muestra detalle de una empresa específica (función placeholder)
 * @param {string} supplierId - ID de la empresa
 */
function showSupplierDetail(supplierId) {
  console.log(`Mostrar detalle de empresa: ${supplierId}`);
  // Esta función podría implementarse para mostrar un modal secundario
  // o redireccionar a una página de detalle de la empresa
  alert(`Información de empresa: ${supplierId}\nFuncionalidad en implementación.`);
}

/**
 * Genera datos de ejemplo en caso de que no se pueda cargar el JSON
 * @returns {Object} Datos de ejemplo para las empresas
 */
function generateSampleSupplierData() {
  // Datos para la región nacional
  const nacionalData = {
    stats: {
      total: 87,
      avgContracts: 14.7,
      avgValue: 1448095.75,
      concentrationIndex: 76.8
    },
    marketConcentration: {
      top10: {
        contracts: 578,
        valuePercentage: 76.8,
        contractsPercentage: 65.4,
        totalValue: 96500000.00
      },
      others: {
        contracts: 705,
        valuePercentage: 23.2,
        contractsPercentage: 34.6,
        totalValue: 29484230.00
      }
    },
    categories: [
      { category: "Construcción", count: 23, color: "rgba(66, 165, 204, 0.8)" },
      { category: "Tecnología", count: 18, color: "rgba(66, 204, 143, 0.8)" },
      { category: "Servicios", count: 15, color: "rgba(230, 193, 84, 0.8)" },
      { category: "Salud", count: 12, color: "rgba(204, 66, 138, 0.8)" },
      { category: "Transporte", count: 9, color: "rgba(138, 86, 208, 0.8)" },
      { category: "Otros", count: 10, color: "rgba(128, 128, 128, 0.8)" }
    ],
    topSuppliers: [
      { 
        name: "Constructora Hernández S.A.", 
        id: "SUP-CON-001", 
        contracts: 45, 
        value: 24500000.00, 
        color: "rgba(66, 165, 204, 0.8)" 
      },
      { 
        name: "TechSolutions Inc.", 
        id: "SUP-TECH-001", 
        contracts: 39, 
        value: 19500000.00, 
        color: "rgba(66, 204, 143, 0.8)" 
      },
      { 
        name: "Grupo Logístico Internacional", 
        id: "SUP-LOG-001", 
        contracts: 27, 
        value: 12500000.00, 
        color: "rgba(66, 184, 204, 0.8)" 
      },
      { 
        name: "Servicios Integrales S.A.", 
        id: "SUP-SERV-001", 
        contracts: 25, 
        value: 9800000.00, 
        color: "rgba(230, 193, 84, 0.8)" 
      },
      { 
        name: "Medical Supplies Corp.", 
        id: "SUP-MED-001", 
        contracts: 21, 
        value: 8200000.00, 
        color: "rgba(138, 86, 208, 0.8)" 
      },
      { 
        name: "Ingeniería Avanzada", 
        id: "SUP-ING-001", 
        contracts: 18, 
        value: 7500000.00, 
        color: "rgba(204, 66, 138, 0.8)" 
      },
      { 
        name: "Transportes Unidos", 
        id: "SUP-TRAN-001", 
        contracts: 15, 
        value: 6300000.00, 
        color: "rgba(231, 74, 59, 0.8)" 
      },
      { 
        name: "Consultores Asociados", 
        id: "SUP-CONS-001", 
        contracts: 12, 
        value: 5200000.00, 
        color: "rgba(47, 132, 168, 0.8)" 
      }
    ],
    suppliers: generateSampleSuppliers(35, "nacional")
  };
  
  // Datos para Hidalgo
  const hidalgoData = {
    stats: {
      total: 22,
      avgContracts: 12.3,
      avgValue: 1150487.92,
      concentrationIndex: 72.5
    },
    marketConcentration: {
      top10: {
        contracts: 148,
        valuePercentage: 72.5,
        contractsPercentage: 61.2,
        totalValue: 23500000.00
      },
      others: {
        contracts: 93,
        valuePercentage: 27.5,
        contractsPercentage: 38.8,
        totalValue: 8912500.00
      }
    },
    categories: [
      { category: "Construcción", count: 7, color: "rgba(66, 165, 204, 0.8)" },
      { category: "Tecnología", count: 4, color: "rgba(66, 204, 143, 0.8)" },
      { category: "Servicios", count: 5, color: "rgba(230, 193, 84, 0.8)" },
      { category: "Salud", count: 3, color: "rgba(204, 66, 138, 0.8)" },
      { category: "Otros", count: 3, color: "rgba(128, 128, 128, 0.8)" }
    ],
    topSuppliers: [
      { 
        name: "Constructora Hidalguense S.A.", 
        id: "HID-CON-001", 
        contracts: 18, 
        value: 7850000.00, 
        color: "rgba(66, 165, 204, 0.8)" 
      },
      { 
        name: "Servicios Tecnológicos de Hidalgo", 
        id: "HID-TECH-001", 
        contracts: 15, 
        value: 5250000.00, 
        color: "rgba(66, 204, 143, 0.8)" 
      },
      { 
        name: "Grupo Hidalgo Logística", 
        id: "HID-LOG-001", 
        contracts: 12, 
        value: 3600000.00, 
        color: "rgba(230, 193, 84, 0.8)" 
      },
      { 
        name: "Servicios Integrales Pachuca", 
        id: "HID-SERV-001", 
        contracts: 10, 
        value: 2800000.00, 
        color: "rgba(138, 86, 208, 0.8)" 
      },
      { 
        name: "Suministros Médicos Hidalgo", 
        id: "HID-MED-001", 
        contracts: 8, 
        value: 2200000.00, 
        color: "rgba(204, 66, 138, 0.8)" 
      }
    ],
    suppliers: generateSampleSuppliers(22, "hidalgo")
  };
  
  // Datos para Jalisco
  const jaliscoData = {
    stats: {
      total: 28,
      avgContracts: 13.5,
      avgValue: 1325845.36,
      concentrationIndex: 74.3
    },
    marketConcentration: {
      top10: {
        contracts: 210,
        valuePercentage: 74.3,
        contractsPercentage: 63.8,
        totalValue: 28500000.00
      },
      others: {
        contracts: 119,
        valuePercentage: 25.7,
        contractsPercentage: 36.2,
        totalValue: 9850000.00
      }
    },
    categories: [
      { category: "Construcción", count: 8, color: "rgba(66, 165, 204, 0.8)" },
      { category: "Tecnología", count: 6, color: "rgba(66, 204, 143, 0.8)" },
      { category: "Servicios", count: 5, color: "rgba(230, 193, 84, 0.8)" },
      { category: "Salud", count: 4, color: "rgba(204, 66, 138, 0.8)" },
      { category: "Transporte", count: 3, color: "rgba(138, 86, 208, 0.8)" },
      { category: "Otros", count: 2, color: "rgba(128, 128, 128, 0.8)" }
    ],
    topSuppliers: [
      { 
        name: "Constructora Jalisciense S.A.", 
        id: "JAL-CON-001", 
        contracts: 20, 
        value: 8750000.00, 
        color: "rgba(66, 165, 204, 0.8)" 
      },
      { 
        name: "Innovaciones Tecnológicas Jalisco", 
        id: "JAL-TECH-001", 
        contracts: 18, 
        value: 6500000.00, 
        color: "rgba(66, 204, 143, 0.8)" 
      },
      { 
        name: "Transportes y Logística GDL", 
        id: "JAL-LOG-001", 
        contracts: 15, 
        value: 4800000.00, 
        color: "rgba(230, 193, 84, 0.8)" 
      },
      { 
        name: "Servicios Integrales Jalisco", 
        id: "JAL-SERV-001", 
        contracts: 12, 
        value: 3600000.00, 
        color: "rgba(138, 86, 208, 0.8)" 
      },
      { 
        name: "Suministros Médicos Occidentales", 
        id: "JAL-MED-001", 
        contracts: 10, 
        value: 2850000.00, 
        color: "rgba(204, 66, 138, 0.8)" 
      }
    ],
    suppliers: generateSampleSuppliers(28, "jalisco")
  };
  
  return {
    nacional: nacionalData,
    hidalgo: hidalgoData,
    jalisco: jaliscoData
  };
}

/**
 * Genera empresas de muestra
 * @param {number} count - Número de empresas a generar
 * @param {string} region - Región para personalizar datos
 * @returns {Array} Array de empresas de muestra
 */
function generateSampleSuppliers(count, region) {
  // Prefijos para IDs según región
  let prefix = "SUP-";
  if (region === "hidalgo") prefix = "HID-";
  if (region === "jalisco") prefix = "JAL-";
  
  const categories = ["CON", "TECH", "LOG", "SERV", "MED", "ING", "TRAN", "CONS"];
  
  const suppliers = [];
  const baseNames = [
    "Constructora", "Tecnología", "Logística", "Servicios", 
    "Suministros Médicos", "Ingeniería", "Transportes", "Consultores"
  ];
  
  const suffixes = [
    "S.A.", "Inc.", "Internacional", "Integrales",
    "Corp.", "Avanzada", "Unidos", "Asociados"
  ];
  
  // Generar las empresas principales con datos específicos
  for (let i = 0; i < Math.min(8, count); i++) {
    const categoryCode = categories[i % categories.length];
    
    // Calcular monto total en función del número de contratos
    const contracts = Math.floor(Math.random() * 30) + 5;
    const avgContractValue = Math.floor(Math.random() * 300000) + 200000;
    const value = contracts * avgContractValue;
    
    suppliers.push({
      name: `${baseNames[i % baseNames.length]} ${suffixes[i % suffixes.length]}`,
      id: `${prefix}${categoryCode}-${(i + 1).toString().padStart(3, '0')}`,
      contracts: contracts,
      value: value,
      category: getSupplierCategory(categoryCode)
    });
  }
  
  // Generar el resto de empresas con datos aleatorios
  for (let i = suppliers.length; i < count; i++) {
    const categoryIndex = Math.floor(Math.random() * categories.length);
    const categoryCode = categories[categoryIndex];
    
    // Calcular monto total en función del número de contratos
    const contracts = Math.floor(Math.random() * 10) + 1;
    const avgContractValue = Math.floor(Math.random() * 200000) + 100000;
    const value = contracts * avgContractValue;
    
    // Generar nombre aleatorio
    const nameIndex = Math.floor(Math.random() * baseNames.length);
    const suffixIndex = Math.floor(Math.random() * suffixes.length);
    let companyName = `${baseNames[nameIndex]} ${region.charAt(0).toUpperCase() + region.slice(1)}`;
    if (Math.random() > 0.5) {
      companyName += ` ${suffixes[suffixIndex]}`;
    }
    
    suppliers.push({
      name: companyName,
      id: `${prefix}${categoryCode}-${(i + 1).toString().padStart(3, '0')}`,
      contracts: contracts,
      value: value,
      category: getSupplierCategory(categoryCode)
    });
  }
  
  // Ordenar por valor (de mayor a menor)
  return suppliers.sort((a, b) => b.value - a.value);
}

/**
 * Obtiene la categoría de una empresa según su código
 * @param {string} code - Código de categoría
 * @returns {string} Nombre de la categoría
 */
function getSupplierCategory(code) {
  switch (code) {
    case "CON": return "Construcción";
    case "TECH": return "Tecnología";
    case "LOG": return "Logística";
    case "SERV": return "Servicios";
    case "MED": return "Salud";
    case "ING": return "Ingeniería";
    case "TRAN": return "Transporte";
    case "CONS": return "Consultoría";
    default: return "Otros";
  }
}

// Exportar funciones para uso en otros scripts (opcional)
window.supplierModalModule = {
  updateSupplierVisualizations,
  filterSuppliersTable,
  showSupplierDetail
};

function initializeSupplierCategoriesChart(categoriesData) {
  console.log("Inicializando gráfico de categorías de empresas...");
  
  const chartCtx = document.getElementById("supplierCategoriesChart");
  if (!chartCtx) {
    console.error("No se encontró el elemento #supplierCategoriesChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Preparar datos para el gráfico
  const labels = categoriesData.map(item => item.category);
  const values = categoriesData.map(item => item.count);
  const colors = categoriesData.map(item => item.color || "rgba(66, 165, 204, 0.8)");
  
  // Intentar destruir el gráfico anterior si existe
  if (window.supplierCategoriesChart) {
    window.supplierCategoriesChart.destroy();
  }
  
  try {
    window.supplierCategoriesChart = new Chart(chartCtx, {
      type: "polarArea",
      data: {
        labels: labels,
        datasets: [{
          data: values,
          backgroundColor: colors,
          borderColor: colors.map(color => color.replace("0.8", "1")),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 10,
              padding: 8,
              font: {
                size: 10
              }
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} empresas (${percentage}%)`;
              }
            }
          }
        },
        scales: {
          r: {
            ticks: {
              display: false
            }
          }
        }
      }
    });
    console.log("Gráfico de categorías de empresas creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de categorías de empresas:", error);
  }
}