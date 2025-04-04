/**
 * institution-modal.js
 *
 * Script para el modal de detalles de instituciones públicas
 */

// Variables globales para los gráficos
window.institutionTypeChart = null;
window.topInstitutionsChart = null;
window.institutionTrendChart = null;
let institutionData = null;
let currentInstitutionRegion = "hidalgo";
let sortInstitutionsBy = "contratos"; // 'contratos' o 'monto'

// Inicializar cuando el DOM esté cargado
document.addEventListener("DOMContentLoaded", function () {
  console.log("Inicializando script de modal de instituciones...");

  // Configurar el enlace en la tarjeta para abrir el modal
  const institucionesCard = document.querySelector(".card.bg-gradient-purple");
  if (institucionesCard) {
    const verDetallesLink = institucionesCard.querySelector(".card-footer a");
    if (verDetallesLink) {
      verDetallesLink.setAttribute("data-bs-toggle", "modal");
      verDetallesLink.setAttribute("data-bs-target", "#institutionDetailModal");
      verDetallesLink.removeAttribute("href");
    }
  }

  // Configurar el evento para cuando se muestre el modal
  const institutionModal = document.getElementById("institutionDetailModal");
  if (institutionModal) {
    institutionModal.addEventListener("shown.bs.modal", function () {
      console.log(
        "Modal de instituciones mostrado - Inicializando gráficos..."
      );
      // Cargar datos y luego inicializar visualizaciones
      loadInstitutionData().then(() => {
        // Usar un timeout para asegurar que el DOM esté totalmente renderizado
        setTimeout(function () {
          updateInstitutionVisualizations(currentInstitutionRegion);
        }, 300);
      });
    });
  }

  // Configurar cambio de región
  const regionSelector = document.getElementById("institutionRegionSelector");
  if (regionSelector) {
    regionSelector.addEventListener("change", function () {
      currentInstitutionRegion = this.value;
      const currentRegionLabel = document.getElementById(
        "institutionCurrentRegion"
      );
      if (currentRegionLabel) {
        currentRegionLabel.textContent = this.options[this.selectedIndex].text;
      }
      updateInstitutionVisualizations(currentInstitutionRegion);
    });
  }

  // Configurar cambio entre pastel y dona
  document.getElementById("viewPie")?.addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("viewDonut").classList.remove("active");
    if (window.institutionTypeChart) {
      window.institutionTypeChart.options.cutout = "0%";
      window.institutionTypeChart.update();
    }
  });

  document.getElementById("viewDonut")?.addEventListener("click", function () {
    this.classList.add("active");
    document.getElementById("viewPie").classList.remove("active");
    if (window.institutionTypeChart) {
      window.institutionTypeChart.options.cutout = "50%";
      window.institutionTypeChart.update();
    }
  });

  // Configurar ordenamiento de instituciones
  document
    .getElementById("sortByContracts")
    ?.addEventListener("click", function (e) {
      e.preventDefault();
      sortInstitutionsBy = "contratos";
      updateInstitutionVisualizations(currentInstitutionRegion);
    });

  document
    .getElementById("sortByAmount")
    ?.addEventListener("click", function (e) {
      e.preventDefault();
      sortInstitutionsBy = "monto";
      updateInstitutionVisualizations(currentInstitutionRegion);
    });

  // Configurar filtro por año
  const yearFilter = document.getElementById("institutionYearFilter");
  if (yearFilter) {
    yearFilter.addEventListener("change", function () {
      updateTrendChart(currentInstitutionRegion, this.value);
    });
  }

  // Configurar búsqueda de instituciones
  const searchButton = document.getElementById("searchButton");
  const searchInput = document.getElementById("institutionSearch");
  if (searchButton && searchInput) {
    searchButton.addEventListener("click", function () {
      filterInstitutionsTable(searchInput.value);
    });
    searchInput.addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        filterInstitutionsTable(this.value);
      }
    });
  }
});

/**
 * Carga los datos de instituciones desde un archivo JSON
 * @returns {Promise} Promesa que se resuelve con los datos cargados
 */
async function loadInstitutionData() {
  if (institutionData) {
    return institutionData; // Usar datos en caché si ya se cargaron
  }

  try {
    console.log("Intentando cargar datos de instituciones desde JSON...");
    const response = await fetch("data/institution-data.json");
    if (!response.ok) {
      throw new Error(`Error al cargar los datos: ${response.status}`);
    }
    institutionData = await response.json();
    console.log(
      "Datos de instituciones cargados correctamente:",
      Object.keys(institutionData)
    );
    return institutionData;
  } catch (error) {
    console.error("Error al cargar datos de instituciones:", error);
    // Usar datos de ejemplo si falla la carga
    console.log("Usando datos de ejemplo para instituciones");
    institutionData = generateSampleInstitutionData();
    return institutionData;
  }
}

/**
 * Actualiza todas las visualizaciones con los datos de la región seleccionada
 * @param {string} region - Región seleccionada
 */
function updateInstitutionVisualizations(region) {
  console.log(
    `Actualizando visualizaciones de instituciones para región: ${region}`
  );

  if (!institutionData || !institutionData[region]) {
    console.error(`No hay datos disponibles para la región: ${region}`);
    return;
  }

  const regionData = institutionData[region];

  // Inicializar/actualizar los gráficos
  console.log("Inicializando gráficos de instituciones...");
  initializeTypeChart(regionData.tiposInstitucion);
  initializeTopInstitutionsChart(regionData.topInstituciones);
  updateTrendChart(region, "all");

  // Actualizar la tabla de instituciones
  updateInstitutionsTable(
    regionData.topInstituciones,
    regionData.tiposInstitucion
  );
}

/**
 * Inicializa el gráfico de tipo de instituciones
 * @param {Array} typeData - Datos de tipos de institución
 */
function initializeTypeChart(typeData) {
  console.log("Inicializando gráfico de tipos de institución...");

  const typeCtx = document.getElementById("institutionTypeChart");
  if (!typeCtx) {
    console.error("No se encontró el elemento #institutionTypeChart");
    return;
  }

  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error(
      "Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada."
    );
    return;
  }

  // Preparar los datos para el gráfico
  const labels = typeData.map((item) => item.tipo);
  const values = typeData.map((item) => item.cantidad);
  const colors = typeData.map((item) => item.color);

  // Intentar destruir el gráfico anterior si existe
  try {
    if (window.institutionTypeChart) {
      window.institutionTypeChart.destroy();
      console.log("Gráfico anterior de tipos destruido correctamente");
    }
  } catch (e) {
    console.error("Error al destruir gráfico anterior de tipos:", e);
  }

  try {
    console.log("Creando nuevo gráfico de tipos de institución...");
    window.institutionTypeChart = new Chart(typeCtx, {
      type: "pie",
      data: {
        labels: labels,
        datasets: [
          {
            data: values,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("0.8", "1")),
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "0%", // Inicia como gráfico de pastel
        plugins: {
          legend: {
            position: "right",
            labels: {
              boxWidth: 12,
              padding: 15,
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const label = context.label || "";
                const value = context.raw || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              },
            },
          },
        },
      },
    });
    console.log("Gráfico de tipos de institución creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de tipos de institución:", error);
  }
}

/**
 * Inicializa el gráfico de top instituciones
 * @param {Array} institutionsData - Datos de instituciones
 */
function initializeTopInstitutionsChart(institutionsData) {
  console.log("Inicializando gráfico de top instituciones...");

  const topCtx = document.getElementById("topInstitutionsChart");
  if (!topCtx) {
    console.error("No se encontró el elemento #topInstitutionsChart");
    return;
  }

  // Verificar que Chart.js esté disponible
  if (typeof Chart === "undefined") {
    console.error(
      "Chart.js no está disponible. Asegúrate de que la biblioteca esté cargada."
    );
    return;
  }

  // Ordenar datos según el criterio seleccionado
  const sortedData = [...institutionsData].sort((a, b) => {
    return sortInstitutionsBy === "contratos"
      ? b.contratos - a.contratos
      : b.monto - a.monto;
  });

  // Limitar a los 5 principales para mejor visualización
  const topData = sortedData.slice(0, 5);

  // Preparar los datos para el gráfico
  const labels = topData.map((item) => {
    // Acortar nombres largos para mejorar visualización
    let name = item.institucion;
    if (name.length > 25) {
      name = name.substring(0, 22) + "...";
    }
    return name;
  });

  const values = topData.map((item) =>
    sortInstitutionsBy === "contratos" ? item.contratos : item.monto
  );
  const colors = topData.map((item) => item.color);

  // Intentar destruir el gráfico anterior si existe
  try {
    if (window.topInstitutionsChart) {
      window.topInstitutionsChart.destroy();
      console.log(
        "Gráfico anterior de top instituciones destruido correctamente"
      );
    }
  } catch (e) {
    console.error(
      "Error al destruir gráfico anterior de top instituciones:",
      e
    );
  }

  try {
    console.log("Creando nuevo gráfico de top instituciones...");
    window.topInstitutionsChart = new Chart(topCtx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label:
              sortInstitutionsBy === "contratos"
                ? "Número de Contratos"
                : "Monto Adjudicado (MXN)",
            data: values,
            backgroundColor: colors,
            borderColor: colors.map((color) => color.replace("0.8", "1")),
            borderWidth: 1,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const value = context.raw;
                if (sortInstitutionsBy === "monto") {
                  return new Intl.NumberFormat("es-MX", {
                    style: "currency",
                    currency: "MXN",
                    maximumFractionDigits: 0,
                  }).format(value);
                } else {
                  return `${value} contratos`;
                }
              },
            },
          },
        },
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text:
                sortInstitutionsBy === "contratos"
                  ? "Número de Contratos"
                  : "Monto Adjudicado (MXN)",
            },
            ticks: {
              callback: function (value) {
                if (sortInstitutionsBy === "monto" && value >= 1000000) {
                  return (value / 1000000).toFixed(1) + "M";
                }
                return value;
              },
            },
          },
        },
      },
    });
    console.log("Gráfico de top instituciones creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de top instituciones:", error);
  }
}


/**
 * Actualiza el gráfico de tendencia por año
 * @param {string} region - Región seleccionada
 * @param {string} yearFilter - Filtro de años ('all', 'last3', 'last5')
 */
function updateTrendChart(region, yearFilter) {
  console.log(
    `Actualizando gráfico de tendencia para región ${region} con filtro ${yearFilter}`
  );

  if (
    !institutionData ||
    !institutionData[region] ||
    !institutionData[region].contratacionesPorAnio
  ) {
    console.error("No hay datos de tendencia disponibles para la región");
    return;
  }

  const trendData = institutionData[region].contratacionesPorAnio;
  const trendCtx = document.getElementById("institutionTrendChart");

  if (!trendCtx) {
    console.error("No se encontró el elemento #institutionTrendChart");
    return;
  }

  // Filtrar los años según la selección
  let years = [...trendData.anios];
  let secretarias = [...trendData.secretarias];
  let descentralizados = [...trendData.descentralizados];
  let estatales = [...trendData.estatales];

  if (yearFilter === "last3") {
    const startIndex = years.length - 3;
    years = years.slice(startIndex);
    secretarias = secretarias.slice(startIndex);
    descentralizados = descentralizados.slice(startIndex);
    estatales = estatales.slice(startIndex);
  } else if (yearFilter === "last5") {
    const startIndex = years.length - 5;
    years = years.slice(startIndex);
    secretarias = secretarias.slice(startIndex);
    descentralizados = descentralizados.slice(startIndex);
    estatales = estatales.slice(startIndex);
  }

  // Intentar destruir el gráfico anterior si existe
  try {
    if (window.institutionTrendChart) {
      window.institutionTrendChart.destroy();
      console.log("Gráfico anterior de tendencia destruido correctamente");
    }
  } catch (e) {
    console.error("Error al destruir gráfico anterior de tendencia:", e);
  }

  try {
    console.log("Creando nuevo gráfico de tendencia...");
    window.institutionTrendChart = new Chart(trendCtx, {
      type: "line",
      data: {
        labels: years,
        datasets: [
          {
            label: "Secretarías",
            data: secretarias,
            borderColor: "rgba(66, 165, 204, 1)",
            backgroundColor: "rgba(66, 165, 204, 0.1)",
            fill: true,
            tension: 0.3,
          },
          {
            label: "Órganos Descentralizados",
            data: descentralizados,
            borderColor: "rgba(66, 204, 143, 1)",
            backgroundColor: "rgba(66, 204, 143, 0.1)",
            fill: true,
            tension: 0.3,
          },
          {
            label:
              region === "nacional"
                ? "Gobiernos Estatales"
                : "Gobiernos Municipales",
            data: estatales,
            borderColor: "rgba(230, 193, 84, 1)",
            backgroundColor: "rgba(230, 193, 84, 0.1)",
            fill: true,
            tension: 0.3,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: "index",
          intersect: false,
        },
        plugins: {
          legend: {
            position: "top",
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.dataset.label}: ${context.raw} contratos`;
              },
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: "Número de Contratos",
            },
          },
          x: {
            title: {
              display: true,
              text: "Año",
            },
          },
        },
      },
    });
    console.log("Gráfico de tendencia creado correctamente");
  } catch (error) {
    console.error("Error al crear el gráfico de tendencia:", error);
  }
}

/**
 * Actualiza la tabla de instituciones
 * @param {Array} institutions - Datos de instituciones
 * @param {Array} types - Datos de tipos de institución
 */
function updateInstitutionsTable(institutions, types) {
  console.log("Actualizando tabla de instituciones...");

  const tableBody = document.getElementById("institutionsTableBody");
  if (!tableBody) {
    console.error("No se encontró el elemento #institutionsTableBody");
    return;
  }

  // Limpiar la tabla
  tableBody.innerHTML = "";

  // Crear un mapa de tipos para asignarlos a cada institución
  const typeMap = {};
  types.forEach((type, index) => {
    // Asignar tipos de forma cíclica a las instituciones
    typeMap[index % types.length] = type.tipo;
  });

  // Añadir filas a la tabla
  institutions.forEach((institution, index) => {
    const row = document.createElement("tr");

    // Formatear el monto con formato de moneda
    const formattedAmount = new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(institution.monto);

    row.innerHTML = `
      <td>${institution.institucion}</td>
      <td>${typeMap[index % types.length]}</td>
      <td class="text-center">${institution.contratos}</td>
      <td class="text-end">${formattedAmount}</td>
    `;

    tableBody.appendChild(row);
  });
}

/**
 * Filtra la tabla de instituciones según término de búsqueda
 * @param {string} searchTerm - Término de búsqueda
 */
function filterInstitutionsTable(searchTerm) {
  if (!searchTerm) {
    // Si no hay término de búsqueda, restaurar la tabla completa
    updateInstitutionVisualizations(currentInstitutionRegion);
    return;
  }

  console.log(`Filtrando tabla por término: ${searchTerm}`);

  const tableBody = document.getElementById("institutionsTableBody");
  if (!tableBody) return;

  const rows = tableBody.querySelectorAll("tr");

  searchTerm = searchTerm.toLowerCase();

  // Filtrar las filas según el término de búsqueda
  rows.forEach((row) => {
    const institutionName = row.cells[0].textContent.toLowerCase();
    const institutionType = row.cells[1].textContent.toLowerCase();

    if (
      institutionName.includes(searchTerm) ||
      institutionType.includes(searchTerm)
    ) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

/**
 * Genera datos de ejemplo en caso de que no se pueda cargar el JSON
 * @returns {Object} Datos de ejemplo para las instituciones
 */
function generateSampleInstitutionData() {
  return {
    nacional: {
      totalInstituciones: 36,
      tiposInstitucion: [
        {
          tipo: "Secretaría de Estado",
          cantidad: 12,
          color: "rgba(66, 165, 204, 0.8)",
          badgeClass: "bg-primary",
        },
        {
          tipo: "Órgano Descentralizado",
          cantidad: 8,
          color: "rgba(66, 204, 143, 0.8)",
          badgeClass: "bg-success",
        },
        {
          tipo: "Empresa Productiva del Estado",
          cantidad: 2,
          color: "rgba(66, 184, 204, 0.8)",
          badgeClass: "bg-info",
        },
        {
          tipo: "Gobierno Estatal",
          cantidad: 6,
          color: "rgba(230, 193, 84, 0.8)",
          badgeClass: "bg-warning",
        },
        {
          tipo: "Organismo Autónomo",
          cantidad: 5,
          color: "rgba(138, 86, 208, 0.8)",
          badgeClass: "bg-purple",
        },
        {
          tipo: "Otros",
          cantidad: 3,
          color: "rgba(128, 128, 128, 0.8)",
          badgeClass: "bg-secondary",
        },
      ],
      topInstituciones: [
        {
          institucion: "Secretaría de Salud",
          contratos: 187,
          monto: 426823789.25,
          color: "rgba(66, 165, 204, 0.8)",
        },
        {
          institucion: "Petróleos Mexicanos",
          contratos: 165,
          monto: 1235678234.56,
          color: "rgba(66, 204, 143, 0.8)",
        },
        {
          institucion: "Secretaría de Educación Pública",
          contratos: 145,
          monto: 312546789.34,
          color: "rgba(66, 184, 204, 0.8)",
        },
        {
          institucion: "Comisión Federal de Electricidad",
          contratos: 132,
          monto: 892345789.12,
          color: "rgba(230, 193, 84, 0.8)",
        },
        {
          institucion: "Instituto Mexicano del Seguro Social",
          contratos: 121,
          monto: 578923456.78,
          color: "rgba(138, 86, 208, 0.8)",
        },
      ],
      contratacionesPorAnio: {
        anios: ["2018", "2019", "2020", "2021", "2022", "2023"],
        secretarias: [132, 145, 158, 173, 192, 205],
        descentralizados: [97, 103, 115, 126, 134, 148],
        estatales: [65, 78, 87, 94, 105, 112],
      },
    },
    hidalgo: {
      totalInstituciones: 12,
      tiposInstitucion: [
        {
          tipo: "Secretaría Estatal",
          cantidad: 5,
          color: "rgba(66, 165, 204, 0.8)",
          badgeClass: "bg-primary",
        },
        {
          tipo: "Órgano Descentralizado",
          cantidad: 3,
          color: "rgba(66, 204, 143, 0.8)",
          badgeClass: "bg-success",
        },
        {
          tipo: "Gobierno Municipal",
          cantidad: 3,
          color: "rgba(230, 193, 84, 0.8)",
          badgeClass: "bg-warning",
        },
        {
          tipo: "Organismo Autónomo",
          cantidad: 1,
          color: "rgba(138, 86, 208, 0.8)",
          badgeClass: "bg-purple",
        },
      ],
      topInstituciones: [
        {
          institucion: "Secretaría de Obras Públicas de Hidalgo",
          contratos: 58,
          monto: 156782345.67,
          color: "rgba(66, 165, 204, 0.8)",
        },
        {
          institucion: "Secretaría de Salud de Hidalgo",
          contratos: 52,
          monto: 98765432.12,
          color: "rgba(66, 204, 143, 0.8)",
        },
        {
          institucion: "Secretaría de Educación Pública de Hidalgo",
          contratos: 47,
          monto: 87654321.98,
          color: "rgba(66, 184, 204, 0.8)",
        },
        {
          institucion: "Municipio de Pachuca",
          contratos: 38,
          monto: 76543210.87,
          color: "rgba(230, 193, 84, 0.8)",
        },
        {
          institucion: "Sistema DIF Hidalgo",
          contratos: 32,
          monto: 54321098.76,
          color: "rgba(138, 86, 208, 0.8)",
        },
      ],
      contratacionesPorAnio: {
        anios: ["2018", "2019", "2020", "2021", "2022", "2023"],
        secretarias: [32, 38, 42, 48, 53, 58],
        descentralizados: [21, 25, 28, 31, 35, 38],
        municipales: [15, 18, 22, 25, 28, 32],
      },
    },
  };
}

// Exportar funciones para uso en otros scripts (opcional)
window.institutionModalModule = {
  updateInstitutionVisualizations,
  initializeTypeChart,
  initializeTopInstitutionsChart,
  updateTrendChart,
};
