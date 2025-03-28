/**
 * map.js
 * 
 * Script para la implementación del mapa interactivo de México con GeoJSON y D3.js
 */

// Variables globales
let methodsChart; // Referencia al gráfico de métodos de contratación
let selectedState = null; // Estado actualmente seleccionado

/**
 * Función principal para inicializar el mapa
 */
function initializeMap() {
    console.log("Inicializando mapa de México...");
    const mapContainer = document.getElementById('mexico-map');
    const tooltip = document.getElementById('map-tooltip');
    
    if (!mapContainer || !tooltip) {
        console.error('Elementos del mapa no encontrados');
        return;
    }
    
    // Mostrar indicador de carga
    mapContainer.innerHTML = `
        <div class="loading-indicator">
            <div class="spinner-border text-primary mb-3" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p>Cargando mapa de México...</p>
        </div>
    `;
    
    // Obtener referencia al gráfico de métodos de contratación existente
    if (window.methodsChart) {
        methodsChart = window.methodsChart;
    } else {
        // Inicializar gráfico si no existe
        initializeMethodsChart();
    }
    
    // Dimensiones del mapa
    const width = mapContainer.clientWidth;
    const height = 450;
    
    // Limpiar el contenedor
    mapContainer.innerHTML = '';
    
    // Crear SVG para el mapa
    const svg = d3.select("#mexico-map")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("preserveAspectRatio", "xMidYMid meet");
    
    // Crear una proyección geográfica para México
    const projection = d3.geoMercator()
        .center([-102, 23])  // Coordenadas aproximadas del centro de México
        .scale(1200)
        .translate([width / 2, height / 2]);
    
    // Crear un generador de paths
    const pathGenerator = d3.geoPath().projection(projection);
    
    // Cargar el archivo GeoJSON
    console.log("Cargando archivo GeoJSON...");
    fetch('./data/mexico_estados.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo cargar el archivo GeoJSON: ' + response.statusText);
            }
            return response.json();
        })
        .then(geoData => {
            // Convertir todos los nombres de estados a mayúsculas
            geoData.features.forEach(feature => {
              if (feature.properties.ESTADO) {
                  feature.properties.ESTADO = feature.properties.ESTADO.toUpperCase();
              }
            });
            console.log("GeoJSON cargado correctamente");
            console.log("Estructura del primer estado en el GeoJSON:", geoData.features[0]);
            
            // Crear grupo para los estados
            const states = svg.append("g")
                .attr("class", "states");
            
            // Añade esto después de cargar el GeoJSON y antes de dibujar los estados
            console.log("Nombres de estados en el GeoJSON:", geoData.features.map(f => f.properties.ESTADO));
            console.log("Nombres de estados en los datos:", Object.keys(window.datosContratosPorEstado)); 
            
            // Función para normalizar los nombres de los estados
            function normalizeStateName(name) {
              if (!name) return '';
              return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            }
            
            // Dibujar cada estado
            states.selectAll("path")
                .data(geoData.features)
                .enter()
                .append("path")
                .attr("d", pathGenerator)
                .attr("class", function(d) {
                  const stateName = d.properties.ESTADO;
                  if (!stateName) {
                      console.warn("Estado sin nombre:", d);
                      return "state";
                  }
                  
                  // Normalizar el nombre del estado para la búsqueda en los datos
                  const normalizedName = normalizeStateName(stateName);
                  
                  // Buscar en los datos normalizados
                  let contratos = 0;
                  
                  // Primero intentar encontrar coincidencia exacta
                  if (window.datosContratosPorEstado[stateName]) {
                      contratos = window.datosContratosPorEstado[stateName];
                  } 
                  // Si no hay coincidencia exacta, buscar en versiones normalizadas
                  else {
                      for (const key in window.datosContratosPorEstado) {
                          if (normalizeStateName(key) === normalizedName) {
                              contratos = window.datosContratosPorEstado[key];
                              break;
                          }
                      }
                  }
                  
                  const colorClass = getColorByContractCount(contratos);
                  return `state ${colorClass}`;
                })
                .attr("fill", function(d) {
                    const stateName = d.properties.ESTADO;
                    if (!stateName) return "#e0e0e0"; // Color por defecto
                    
                    // Normalizar el nombre del estado para la búsqueda en los datos
                    const normalizedName = normalizeStateName(stateName);
                    
                    // Buscar en los datos normalizados
                    let contratos = 0;
                    
                    // Primero intentar encontrar coincidencia exacta
                    if (window.datosContratosPorEstado[stateName]) {
                        contratos = window.datosContratosPorEstado[stateName];
                    } 
                    // Si no hay coincidencia exacta, buscar en versiones normalizadas
                    else {
                        for (const key in window.datosContratosPorEstado) {
                            if (normalizeStateName(key) === normalizedName) {
                                contratos = window.datosContratosPorEstado[key];
                                break;
                            }
                        }
                    }
                    
                    // Usar el valor hexadecimal del color directamente
                    return getColorValueByClass(getColorByContractCount(contratos));
                })
                .attr("stroke", "#ffffff")
                .attr("stroke-width", 1)
                .attr("data-name", d => d.properties.ESTADO)
                .on("mouseover", function(event, d) {
                  const stateName = d.properties.ESTADO;
                  if (!stateName) return;
                  
                  const normalizedName = normalizeStateName(stateName);
                  let contratos = 0;
                  let dataKey = stateName;
                  
                  // Buscar datos del estado
                  if (window.datosContratosPorEstado[stateName]) {
                      contratos = window.datosContratosPorEstado[stateName];
                  } else {
                      for (const key in window.datosContratosPorEstado) {
                          if (normalizeStateName(key) === normalizedName) {
                              contratos = window.datosContratosPorEstado[key];
                              dataKey = key; // Guardar la clave que coincide para usar con estadosDatosContratacion
                              break;
                          }
                      }
                  }
                  
                  // Mostrar tooltip
                  tooltip.style.display = "block";
                  tooltip.style.left = (event.pageX + 10) + "px";
                  tooltip.style.top = (event.pageY - 25) + "px";
                  tooltip.innerHTML = `<strong>${stateName}</strong><br>Contratos: ${contratos}`;
                  
                  // Efecto visual
                  d3.select(this)
                      .attr("stroke-width", 2)
                      .attr("stroke", "#333");
                  
                  // Actualizar gráfico solo si no hay un estado seleccionado
                  if (!selectedState && methodsChart) {
                      updateMethodsChart(dataKey);
                  }
              })
                .on("mouseout", function() {
                    // Ocultar tooltip
                    tooltip.style.display = "none";
                    
                    // Restaurar estilo si no es el estado seleccionado
                    if (!d3.select(this).classed("state-selected")) {
                        d3.select(this)
                            .attr("stroke-width", 1)
                            .attr("stroke", "#fff");
                    }
                    
                    // Restaurar gráfico nacional si no hay estado seleccionado
                    if (!selectedState && methodsChart) {
                        updateMethodsChart(null);
                    }
                })

                                
                .on("click", function(event, d) {
                    const stateName = d.properties.ESTADO;
                    if (!stateName) return;
                    
                    // Deseleccionar estado anteriormente seleccionado
                    d3.selectAll(".state-selected")
                        .classed("state-selected", false)
                        .attr("stroke-width", 1)
                        .attr("stroke", "#fff");
                    
                    // Si se hace clic en el mismo estado, deseleccionarlo
                    if (selectedState === stateName) {
                        selectedState = null;
                        if (methodsChart) updateMethodsChart(null);
                        // AGREGAR ESTA LÍNEA:
                        updateRecentContractsTable(null);
                        console.log("Estado deseleccionado");
                        return;
                    }
                    
                    // Seleccionar el estado actual
                    selectedState = stateName;
                    d3.select(this)
                        .classed("state-selected", true)
                        .attr("stroke-width", 2)
                        .attr("stroke", "#333");
                    
                    // Actualizar información del estado seleccionado
                    if (methodsChart) updateMethodsChart(stateName);
                    // AGREGAR ESTA LÍNEA:
                    updateRecentContractsTable(stateName);
                    
                    console.log(`Estado seleccionado: ${stateName}`);
                });

            
            // Añadir zoom y pan al mapa
            const zoom = d3.zoom()
                .scaleExtent([1, 8])
                .on("zoom", (event) => {
                    states.attr("transform", event.transform);
                });
            
            svg.call(zoom);
            
            // Asegurarse de que la leyenda del mapa esté presente
            if (!document.querySelector('.map-legend')) {
                const legend = document.createElement('div');
                legend.className = 'map-legend';
                legend.innerHTML = `
                    <div class="legend-title mb-2">Contratos por Estado</div>
                    <div class="legend-item">
                        <span class="legend-color density-low"></span>
                        <span>Menos de 50</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color density-medium"></span>
                        <span>50 - 100</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color density-high"></span>
                        <span>101 - 150</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-color density-very-high"></span>
                        <span>Más de 150</span>
                    </div>
                `;
                mapContainer.appendChild(legend);
            }
            
            console.log("Mapa inicializado correctamente");
             // Inicializar tabla de contratos con datos nacionales
            updateRecentContractsTable(null);  // AÑADE ESTA LÍNEA
        })
        .catch(error => {
            console.error('Error al cargar el mapa:', error);
            mapContainer.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Error al cargar el mapa: ${error.message}
                </div>
            `;
        });
}

/**
 * Inicializa el gráfico de métodos de contratación
 */
function initializeMethodsChart() {
    const methodsCtx = document.getElementById('procurementMethodChart');
    if (!methodsCtx) return;
    
    methodsChart = new Chart(methodsCtx.getContext('2d'), {
        type: 'doughnut',
        data: window.methodsDataNacional,
        options: {
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Guardar referencia global
    window.methodsChart = methodsChart;
}

/**
 * Actualiza el gráfico de métodos de contratación según el estado seleccionado
 * @param {string} stateName - Nombre del estado seleccionado
 */
function updateMethodsChart(stateName) {
  if (!methodsChart) return;
  
  const regionTitle = document.getElementById('region-title');
  if (!regionTitle) return;
  
  if (stateName) {
      let data = null;
      
      // Primero intentar coincidencia exacta
      if (window.estadosDatosContratacion[stateName]) {
          data = window.estadosDatosContratacion[stateName].data;
      } 
      // Si no hay coincidencia, buscar por nombre normalizado
      else {
          const normalizedName = normalizeStateName(stateName);
          for (const key in window.estadosDatosContratacion) {
              if (normalizeStateName(key) === normalizedName) {
                  data = window.estadosDatosContratacion[key].data;
                  stateName = key; // Usar el nombre original para mostrar
                  break;
              }
          }
      }
      
      if (data) {
          methodsChart.data.datasets[0].data = data;
          methodsChart.update();
          regionTitle.textContent = `Datos de ${stateName}`;
      } else {
          // Si no hay datos, volver a los datos nacionales
          methodsChart.data.datasets[0].data = window.methodsDataNacional.datasets[0].data;
          methodsChart.update();
          regionTitle.textContent = "Datos a nivel nacional";
      }
  } else {
      // Si no se pasa nombre, mostrar datos nacionales
      methodsChart.data.datasets[0].data = window.methodsDataNacional.datasets[0].data;
      methodsChart.update();
      regionTitle.textContent = "Datos a nivel nacional";
  }
}

/**
 * Actualiza la tabla de contratos recientes según el estado seleccionado
 * @param {string} stateName - Nombre del estado seleccionado
 */
function updateRecentContractsTable(stateName) {
  const tableBody = document.querySelector('#recentContractsTable tbody');
  if (!tableBody) {
    console.warn('Tabla de contratos recientes no encontrada');
    return;
  }
  
  // Determinamos qué datos mostrar
  let contractsToShow = [];
  
  if (stateName) {
    // Buscar por nombre exacto
    if (window.estadosContratosRecientes[stateName]) {
      contractsToShow = window.estadosContratosRecientes[stateName];
    } else {
      // Buscar por nombre normalizado
      const normalizedName = normalizeStateName(stateName);
      for (const key in window.estadosContratosRecientes) {
        if (normalizeStateName(key) === normalizedName) {
          contractsToShow = window.estadosContratosRecientes[key];
          break;
        }
      }
    }
    
    // Si aún no tenemos datos para el estado, mostrar datos nacionales
    if (contractsToShow.length === 0) {
      contractsToShow = window.estadosContratosRecientes["NACIONAL"];
    }
  } else {
    // Si no hay estado seleccionado, mostrar datos nacionales
    contractsToShow = window.estadosContratosRecientes["NACIONAL"];
  }
  
  // Actualizar título de la sección de contratos si existe
  const contractsTitle = document.querySelector('#recentContractsTitle');
  if (contractsTitle) {
    if (stateName) {
      contractsTitle.textContent = `Contratos Recientes: ${stateName}`;
    } else {
      // Texto explícito para datos nacionales
      contractsTitle.textContent = "Contratos Recientes a nivel nacional"; 
    }
  }
  
  // Limpiar tabla
  tableBody.innerHTML = '';
  
  // Llenar con nuevos datos
  contractsToShow.forEach(contract => {
    const row = document.createElement('tr');
    
    // Formatear monto con separadores de miles
    const formattedAmount = new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(contract.monto);
    
    // Estado del contrato con clase de badge correspondiente
    const badgeClass = contract.estado === 'Activo' ? 'bg-success' : 'bg-warning';
    
    row.innerHTML = `
      <td>${contract.id}</td>
      <td>${contract.proveedor}</td>
      <td>${formattedAmount}</td>
      <td>${contract.fecha}</td>
      <td><span class="badge ${badgeClass}">${contract.estado}</span></td>
    `;
    
    tableBody.appendChild(row);
  });
  
  console.log(`Tabla de contratos actualizada para: ${stateName || 'Nacional'}`);
}

/**
 * Función auxiliar para normalizar nombres de estados
 * @param {string} name - Nombre del estado
 * @returns {string} Nombre normalizado
 */
function normalizeStateName(name) {
  if (!name) return '';
  return name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
}

/**
 * Obtiene la clase de color según la cantidad de contratos
 * @param {number} count - Cantidad de contratos
 * @returns {string} Clase CSS para el color
 */
function getColorByContractCount(count) {
    if (count < 50) return "density-low";
    if (count < 100) return "density-medium";
    if (count < 150) return "density-high";
    return "density-very-high";
}

/**
 * Obtiene el valor de color según la clase CSS
 * @param {string} className - Nombre de la clase CSS
 * @returns {string} Valor hexadecimal del color
 */
function getColorValueByClass(className) {
  switch(className) {
      case "density-low": return "#c2e6f2";
      case "density-medium": return "#80c9df";
      case "density-high": return "#42a5cc";
      case "density-very-high": return "#1e7899";
      default: return "#e0e0e0";
  }
}

/**
 * Exporta los datos del estado seleccionado como CSV
 */
function exportStateDataAsCSV() {
    if (!selectedState) {
        alert('Por favor, seleccione un estado primero.');
        return;
    }
    
    const stateData = {
        nombre: selectedState,
        contratos: window.datosContratosPorEstado[selectedState] || 0,
        metodos: window.estadosDatosContratacion[selectedState] ? 
                 window.estadosDatosContratacion[selectedState].data : [0,0,0,0]
    };
    
    // Crear CSV
    let csv = 'Nombre,Contratos,Licitación Abierta,Licitación Selectiva,Contratación Directa,Licitación Limitada\n';
    csv += `${stateData.nombre},${stateData.contratos},${stateData.metodos[0]},${stateData.metodos[1]},${stateData.metodos[2]},${stateData.metodos[3]}`;
    
    // Descargar
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `datos_${selectedState.toLowerCase().replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

/**
 * Añade controles de zoom al mapa
 */
function addZoomControls() {
    const mapContainer = document.getElementById('mexico-map');
    if (!mapContainer) return;
    
    // Verificar si los controles ya existen
    if (document.querySelector('.zoom-controls')) return;
    
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button class="btn btn-sm btn-light" id="zoom-in" title="Acercar">
            <i class="fas fa-search-plus"></i>
        </button>
        <button class="btn btn-sm btn-light" id="zoom-out" title="Alejar">
            <i class="fas fa-search-minus"></i>
        </button>
        <button class="btn btn-sm btn-light" id="zoom-reset" title="Restablecer">
            <i class="fas fa-undo"></i>
        </button>
    `;
    mapContainer.appendChild(zoomControls);
}

// Inicializar cuando el DOM esté cargado (si se carga este script de forma independiente)
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM cargado en map.js");
    
    // Solo inicializar si no se inicializa desde main.js
    if (!window.dashboardInitialized) {
        console.log("Inicializando desde map.js...");
        
        // Crear datos globales por defecto si no existen
        if (!window.methodsDataNacional) {
            window.methodsDataNacional = {
                labels: ['Licitación Abierta', 'Licitación Selectiva', 'Contratación Directa', 'Licitación Limitada'],
                datasets: [{
                    data: [45, 25, 20, 10],
                    backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
                    hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
                    hoverBorderColor: "rgba(234, 236, 244, 1)",
                }]
            };
        }
        
        // Inicializar mapa
        initializeMap();

        // Inicializar tabla de contratos con datos nacionales
        updateRecentContractsTable(null);  // AÑADE ESTA LÍNEA

        
        // Conectar eventos de exportación
        document.querySelectorAll('.dropdown-item').forEach(item => {
            if (item.textContent.includes('Exportar como CSV')) {
                item.addEventListener('click', exportStateDataAsCSV);
            }
        });
    }
});

// Exponer funciones para uso en otros módulos
window.mapUtils = {
    initializeMap: initializeMap,
    updateMethodsChart: updateMethodsChart,
    exportStateDataAsCSV: exportStateDataAsCSV,
    addZoomControls: addZoomControls
};