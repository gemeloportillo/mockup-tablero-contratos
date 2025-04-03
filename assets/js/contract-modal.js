/**
 * contract-modal.js
 *
 * Script para el modal de detalles de contratos públicos
 * Sigue el mismo patrón de inicialización que otros scripts funcionales del dashboard
 */

// Variables globales para los gráficos
window.contractStatusChart = null;
window.contractTrendChart = null;
window.contractMethodChart = null;
let contractData = null;
let currentContractRegion = "hidalgo";
let currentPage = 1;
let itemsPerPage = 10;
let filteredContracts = [];

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function() {
  console.log("Inicializando script de modal de contratos...");
  
  // Configurar el enlace en la tarjeta para abrir el modal
  const contratosCard = document.querySelector(".card.bg-gradient-primary");
  if (contratosCard) {
    const verDetallesLink = contratosCard.querySelector(".card-footer a");
    if (verDetallesLink) {
      verDetallesLink.setAttribute("data-bs-toggle", "modal");
      verDetallesLink.setAttribute("data-bs-target", "#contractDetailModal");
      verDetallesLink.removeAttribute("href");
    }
  }
  
  // Configurar el evento para cuando se muestre el modal
  const contractModal = document.getElementById("contractDetailModal");
  if (contractModal) {
    contractModal.addEventListener("shown.bs.modal", function() {
      console.log("Modal de contratos mostrado - Inicializando gráficos...");
      // Cargar datos y luego inicializar visualizaciones
      loadContractData().then(() => {
        // Usar un timeout para asegurar que el DOM esté totalmente renderizado
        setTimeout(function() {
          updateContractVisualizations(currentContractRegion);
        }, 300);
      });
    });
  }
  
  // Configurar cambio de región
  const regionSelector = document.getElementById("contractRegionSelector");
  if (regionSelector) {
    regionSelector.addEventListener("change", function() {
      currentContractRegion = this.value;
      const currentRegionLabel = document.getElementById("contractCurrentRegion");
      if (currentRegionLabel) {
        currentRegionLabel.textContent = this.options[this.selectedIndex].text;
      }
      currentPage = 1; // Resetear paginación
      updateContractVisualizations(currentContractRegion);
    });
  }
  
  // Configurar filtro por año para tendencia
  const yearFilter = document.getElementById("contractYearFilter");
  if (yearFilter) {
    yearFilter.addEventListener("change", function() {
      updateTrendChart(currentContractRegion, this.value);
    });
  }
  
  // Configurar búsqueda de contratos
  const searchButton = document.getElementById("contractSearchButton");
  const searchInput = document.getElementById("contractSearch");
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", function() {
      filterContractsTable(searchInput.value);
    });
    searchInput.addEventListener("keyup", function(e) {
      if (e.key === "Enter") {
        filterContractsTable(this.value);
      }
    });
  }
  
  // Configurar paginación
  document.querySelectorAll('.pagination .page-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const pageText = this.textContent;
      
      if (pageText === 'Anterior') {
        if (currentPage > 1) currentPage--;
      } else if (pageText === 'Siguiente') {
        if (currentPage < Math.ceil(filteredContracts.length / itemsPerPage)) {
          currentPage++;
        }
      } else {
        currentPage = parseInt(pageText);
      }
      
      updateContractsTable(filteredContracts);
      updatePagination();
    });
  });
});

/**
 * Carga los datos de contratos desde un archivo JSON
 * @returns {Promise} Promesa que se resuelve con los datos cargados
 */
async function loadContractData() {
  if (contractData) {
    return contractData; // Usar datos en caché si ya se cargaron
  }
  
  try {
    console.log("Intentando cargar datos de contratos desde JSON...");
    const response = await fetch("data/contract-data.json");
    if (!response.ok) {
      throw new Error(`Error al cargar los datos: ${response.status}`);
    }
    contractData = await response.json();
    console.log("Datos de contratos cargados correctamente:", Object.keys(contractData));
    return contractData;
  } catch (error) {
    console.error("Error al cargar datos de contratos:", error);
    // Usar datos de ejemplo si falla la carga
    console.log("Usando datos de ejemplo para contratos");
    contractData = generateSampleContractData();
    return contractData;
  }
}

/**
 * Actualiza todas las visualizaciones con los datos de la región seleccionada
 * @param {string} region - Región seleccionada
 */
function updateContractVisualizations(region) {
  console.log(`Actualizando visualizaciones de contratos para región: ${region}`);
  
  if (!contractData || !contractData[region]) {
    console.error(`No hay datos disponibles para la región: ${region}`);
    return;
  }
  
  const regionData = contractData[region];
  
  // Actualizar las estadísticas generales
  updateContractStatistics(regionData.stats);
  
  // Inicializar/actualizar los gráficos
  console.log("Inicializando gráficos de contratos...");
  initializeStatusChart(regionData.statusDistribution);
  updateTrendChart(region, document.getElementById("contractYearFilter")?.value || "2025");
  initializeMethodChart(regionData.methodDistribution);
  
  // Actualizar la tabla de contratos
  filteredContracts = [...regionData.contracts];
  updateContractsTable(filteredContracts);
  updatePagination();
}

/**
 * Actualiza las estadísticas generales de contratos
 * @param {Object} stats - Datos estadísticos
 */
function updateContractStatistics(stats) {
  console.log("Actualizando estadísticas de contratos...");
  
  // Actualizar contadores
  document.getElementById("totalContractsCount").textContent = stats.total.toLocaleString();
  document.getElementById("activeContractsCount").textContent = stats.active.toLocaleString();
  
  // Formatear valor promedio como moneda
  const avgValue = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0
  }).format(stats.avgValue);
  document.getElementById("averageContractValue").textContent = avgValue;
  
  // Actualizar duración promedio
  document.getElementById("averageDuration").textContent = `${stats.avgDuration} días`;
}

/**
 * Inicializa el gráfico de distribución de estado de contratos
 * @param {Array} statusData - Datos de estado de contratos
 */
function initializeStatusChart(statusData) {
  console.log("Inicializando gráfico de estado de contratos...");
  
  const chartCtx = document.getElementById("contractStatusChart");
  if (!chartCtx) {
    console.error("No se encontró el elemento #contractStatusChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Preparar datos para el gráfico
  const labels = statusData.map(item => item.status);
  const values = statusData.map(item => item.count);
  const colors = [
    "rgba(66, 204, 143, 0.8)",   // active - verde
    "rgba(66, 165, 204, 0.8)",   // pending - azul
    "rgba(230, 193, 84, 0.8)",   // terminated - amarillo
    "rgba(204, 66, 138, 0.8)"    // cancelled - rojo
  ];
  
  // Intentar destruir el gráfico anterior si existe
  if (window.contractStatusChart) {
    window.contractStatusChart.destroy();
  }
  
  try {
    window.contractStatusChart = new Chart(chartCtx, {
      type: "doughnut",
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
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    console.log("Gráfico de estado de contratos creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de estado de contratos:", error);
  }
}

/**
 * Actualiza el gráfico de tendencia mensual de contratos
 * @param {string} region - Región seleccionada
 * @param {string} year - Año seleccionado
 */
function updateTrendChart(region, year) {
  console.log(`Actualizando gráfico de tendencia para región ${region} y año ${year}`);
  
  const chartCtx = document.getElementById("contractTrendChart");
  if (!chartCtx) {
    console.error("No se encontró el elemento #contractTrendChart");
    return;
  }
  
  if (!contractData || !contractData[region] || !contractData[region].trendByMonth) {
    console.error("No hay datos de tendencia disponibles");
    return;
  }
  
  const trendData = contractData[region].trendByMonth;
  
  // Filtrar los datos por año si es necesario
  let filteredData = { ...trendData };
  if (year !== "all") {
    filteredData.months = trendData.months.filter((month, index) => {
      return month.startsWith(year);
    });
    
    // Filtrar los datos correspondientes
    const indices = filteredData.months.map(month => trendData.months.indexOf(month));
    filteredData.counts = indices.map(i => trendData.counts[i]);
    filteredData.values = indices.map(i => trendData.values[i]);
  }
  
  // Formatear las etiquetas para mostrar solo el mes
  const labels = filteredData.months.map(month => {
    // Convertir formato "2025-01" a "Ene"
    const date = new Date(month + "-01");
    return date.toLocaleString("es-MX", { month: "short" });
  });
  
  // Intentar destruir el gráfico anterior si existe
  if (window.contractTrendChart) {
    window.contractTrendChart.destroy();
  }
  
  try {
    window.contractTrendChart = new Chart(chartCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Número de Contratos",
            data: filteredData.counts,
            backgroundColor: "rgba(66, 165, 204, 0.8)",
            borderColor: "rgba(66, 165, 204, 1)",
            borderWidth: 1,
            order: 1,
            yAxisID: "y"
          },
          {
            label: "Valor Total (MXN millones)",
            data: filteredData.values.map(value => value / 1000000), // Convertir a millones
            type: "line",
            borderColor: "rgba(204, 66, 138, 1)",
            backgroundColor: "rgba(204, 66, 138, 0.1)",
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            order: 0,
            yAxisID: "y1"
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false
        },
        plugins: {
          legend: {
            position: "top"
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || "";
                const value = context.raw;
                if (context.datasetIndex === 0) {
                  return `${label}: ${value}`;
                } else {
                  // Formatear valor en millones con 1 decimal
                  return `${label}: ${value.toFixed(1)} M`;
                }
              }
            }
          }
        },
        scales: {
          y: {
            type: "linear",
            display: true,
            position: "left",
            title: {
              display: true,
              text: "Número de Contratos"
            },
            beginAtZero: true
          },
          y1: {
            type: "linear",
            display: true,
            position: "right",
            title: {
              display: true,
              text: "Valor (MXN millones)"
            },
            beginAtZero: true,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
    console.log("Gráfico de tendencia mensual creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de tendencia mensual:", error);
  }
}

/**
 * Inicializa el gráfico de métodos de contratación
 * @param {Array} methodData - Datos de métodos de contratación
 */
function initializeMethodChart(methodData) {
  console.log("Inicializando gráfico de métodos de contratación...");
  
  const chartCtx = document.getElementById("contractMethodChart");
  if (!chartCtx) {
    console.error("No se encontró el elemento #contractMethodChart");
    return;
  }
  
  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error("Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada.");
    return;
  }
  
  // Preparar datos para el gráfico
  const labels = methodData.map(item => item.method);
  const values = methodData.map(item => item.count);
  const colors = [
    "rgba(66, 165, 204, 0.8)",   // open - azul
    "rgba(66, 204, 143, 0.8)",   // selective - verde
    "rgba(230, 193, 84, 0.8)",   // limited - amarillo
    "rgba(204, 66, 138, 0.8)"    // direct - rojo
  ];
  
  // Intentar destruir el gráfico anterior si existe
  if (window.contractMethodChart) {
    window.contractMethodChart.destroy();
  }
  
  try {
    window.contractMethodChart = new Chart(chartCtx, {
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
              padding: 10,
              font: {
                size: 11
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
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    console.log("Gráfico de métodos de contratación creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de métodos de contratación:", error);
  }
}

/**
 * Actualiza la tabla de contratos con paginación
 * @param {Array} contracts - Lista de contratos
 */
function updateContractsTable(contracts) {
  console.log(`Actualizando tabla de contratos, página ${currentPage}`);
  
  const tableBody = document.getElementById("contractsTableBody");
  if (!tableBody) {
    console.error("No se encontró el elemento #contractsTableBody");
    return;
  }
  
  // Limpiar la tabla
  tableBody.innerHTML = "";
  
  // Calcular índices para paginación
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, contracts.length);
  const pageContracts = contracts.slice(startIndex, endIndex);
  
  if (pageContracts.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="7" class="text-center py-3">No se encontraron contratos</td>`;
    tableBody.appendChild(row);
    return;
  }
  
  // Añadir filas a la tabla
  pageContracts.forEach(contract => {
    const row = document.createElement("tr");
    
    // Crear clase para el estado
    let statusClass = "";
    switch (contract.status) {
      case "active":
        statusClass = "bg-success";
        break;
      case "pending":
        statusClass = "bg-info";
        break;
      case "terminated":
        statusClass = "bg-warning";
        break;
      case "cancelled":
        statusClass = "bg-danger";
        break;
      default:
        statusClass = "bg-secondary";
    }
    
    // Formatear el valor como moneda
    const formattedValue = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0
    }).format(contract.value);
    
    // Formatear la fecha
    const date = new Date(contract.date);
    const formattedDate = new Intl.DateTimeFormat("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    }).format(date);
    
    row.innerHTML = `
      <td><small>${contract.id}</small></td>
      <td>${contract.title}</td>
      <td>${contract.supplier}</td>
      <td>${contract.method}</td>
      <td class="text-end">${formattedValue}</td>
      <td class="text-center">
        <span class="badge ${statusClass}">${contract.status}</span>
      </td>
      <td class="text-center"><small>${formattedDate}</small></td>
    `;
    
    tableBody.appendChild(row);
  });
}

/**
 * Actualiza los controles de paginación
 */
function updatePagination() {
  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const pagination = document.querySelector(".pagination");
  if (!pagination) return;
  
  // Actualizar el estado de los botones de navegación
  const prevButton = pagination.querySelector(".page-item:first-child");
  const nextButton = pagination.querySelector(".page-item:last-child");
  
  if (currentPage <= 1) {
    prevButton.classList.add("disabled");
  } else {
    prevButton.classList.remove("disabled");
  }
  
  if (currentPage >= totalPages) {
    nextButton.classList.add("disabled");
  } else {
    nextButton.classList.remove("disabled");
  }
  
  // Actualizar los botones numerados
  const pageLinks = pagination.querySelectorAll(".page-item:not(:first-child):not(:last-child)");
  
  // Determinar qué páginas mostrar (siempre mostramos 3)
  let startPage = Math.max(1, currentPage - 1);
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
      
      if (pageNum === currentPage) {
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
 * Filtra la tabla de contratos según término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterContractsTable(searchTerm) {
  console.log(`Filtrando contratos por término: ${searchTerm}`);
  
  if (!contractData || !contractData[currentContractRegion]) {
    return;
  }
  
  searchTerm = searchTerm.toLowerCase().trim();
  
  if (!searchTerm) {
    // Si no hay término de búsqueda, mostrar todos los contratos
    filteredContracts = [...contractData[currentContractRegion].contracts];
  } else {
    // Filtrar por el término de búsqueda
    filteredContracts = contractData[currentContractRegion].contracts.filter(contract => {
      return (
        contract.id.toLowerCase().includes(searchTerm) ||
        contract.title.toLowerCase().includes(searchTerm) ||
        contract.supplier.toLowerCase().includes(searchTerm) ||
        contract.method.toLowerCase().includes(searchTerm) ||
        contract.status.toLowerCase().includes(searchTerm)
      );
    });
  }
  
  // Resetear paginación y actualizar tabla
  currentPage = 1;
  updateContractsTable(filteredContracts);
  updatePagination();
}

/**
 * Genera datos de ejemplo en caso de que no se pueda cargar el JSON
 * @returns {Object} Datos de ejemplo para los contratos
 */
function generateSampleContractData() {
  // Datos para la región nacional
  const nacionalData = {
    stats: {
      total: 1283,
      active: 752,
      avgValue: 98195.03,
      avgDuration: 173
    },
    statusDistribution: [
      { status: "active", count: 752 },
      { status: "pending", count: 187 },
      { status: "terminated", count: 298 },
      { status: "cancelled", count: 46 }
    ],
    methodDistribution: [
      { method: "open", count: 578 },
      { method: "selective", count: 321 },
      { method: "limited", count: 127 },
      { method: "direct", count: 257 }
    ],
    trendByMonth: {
      months: ["2025-01", "2025-02", "2025-03", "2024-10", "2024-11", "2024-12"],
      counts: [42, 35, 50, 65, 70, 75],
      values: [65000000, 42000000, 78000000, 82000000, 96000000, 102000000]
    },
    contracts: generateSampleContracts(50, "nacional")
  };
  
  // Datos para Hidalgo
  const hidalgoData = {
    stats: {
      total: 327,
      active: 198,
      avgValue: 86421.50,
      avgDuration: 158
    },
    statusDistribution: [
      { status: "active", count: 198 },
      { status: "pending", count: 54 },
      { status: "terminated", count: 62 },
      { status: "cancelled", count: 13 }
    ],
    methodDistribution: [
      { method: "open", count: 148 },
      { method: "selective", count: 85 },
      { method: "limited", count: 32 },
      { method: "direct", count: 62 }
    ],
    trendByMonth: {
      months: ["2025-01", "2025-02", "2025-03", "2024-10", "2024-11", "2024-12"],
      counts: [15, 12, 18, 22, 25, 28],
      values: [18500000, 14200000, 22800000, 24700000, 28900000, 32500000]
    },
    contracts: generateSampleContracts(30, "hidalgo")
  };
  
  // Datos para Jalisco
  const jaliscoData = {
    stats: {
      total: 452,
      active: 286,
      avgValue: 92365.78,
      avgDuration: 165
    },
    statusDistribution: [
      { status: "active", count: 286 },
      { status: "pending", count: 65 },
      { status: "terminated", count: 87 },
      { status: "cancelled", count: 14 }
    ],
    methodDistribution: [
      { method: "open", count: 203 },
      { method: "selective", count: 112 },
      { method: "limited", count: 45 },
      { method: "direct", count: 92 }
    ],
    trendByMonth: {
      months: ["2025-01", "2025-02", "2025-03", "2024-10", "2024-11", "2024-12"],
      counts: [22, 19, 26, 33, 38, 42],
      values: [24500000, 21200000, 28800000, 34700000, 41900000, 49500000]
    },
    contracts: generateSampleContracts(40, "jalisco")
  };
  
  return {
    nacional: nacionalData,
    hidalgo: hidalgoData,
    jalisco: jaliscoData
  };
}

/**
 * Genera contratos de muestra
 * @param {number} count - Número de contratos a generar
 * @param {string} region - Región para personalizar datos
 * @returns {Array} Array de contratos de muestra
 */
function generateSampleContracts(count, region) {
  const statuses = ["active", "pending", "terminated", "cancelled"];
  const methods = ["open", "selective", "limited", "direct"];
  
  const suppliers = [
    "Constructora Hernández S.A.",
    "TechSolutions Inc.",
    "Grupo Logístico Internacional",
    "Servicios Integrales S.A.",
    "Medical Supplies Corp.",
    "Ingeniería Avanzada",
    "Transportes Unidos",
    "Consultores Asociados"
  ];
  
  const titles = [
    "Construcción de puente vehicular",
    "Sistema de gestión documental digital",
    "Servicios de logística para mercancías",
    "Mantenimiento de instituciones educativas",
    "Suministro de equipos médicos",
    "Desarrollo de software gubernamental",
    "Servicio de transporte de personal",
    "Consultoría en procesos administrativos",
    "Infraestructura de telecomunicaciones",
    "Modernización de sistemas hidráulicos"
  ];
  
  // Prefijos para IDs según región
  let prefix = "NAC-";
  if (region === "hidalgo") prefix = "HID-";
  if (region === "jalisco") prefix = "JAL-";
  
  const contracts = [];
  
  for (let i = 0; i < count; i++) {
    // Generar fecha aleatoria en los últimos 6 meses
    const today = new Date();
    const monthsAgo = Math.floor(Math.random() * 6);
    const daysAgo = Math.floor(Math.random() * 30);
    const date = new Date(today);
    date.setMonth(date.getMonth() - monthsAgo);
    date.setDate(date.getDate() - daysAgo);
    
    // Generar valor aleatorio entre 50,000 y 5,000,000
    const value = Math.floor(Math.random() * 4950000) + 50000;
    
    contracts.push({
      id: `${prefix}${2025}-${String(i + 1).padStart(4, '0')}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
      method: methods[Math.floor(Math.random() * methods.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      value: value,
      date: date.toISOString()
    });
  }
  
  // Ordenar por fecha (más reciente primero)
  return contracts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Exportar funciones para uso en otros scripts (opcional)
window.contractModalModule = {
  updateContractVisualizations,
  filterContractsTable,
  updateContractsTable
};