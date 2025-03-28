/**
 * data-loader.js - Funciones para cargar y manejar datos
 * Dashboard de Contratación Pública
 */

/**
 * Carga los datos desde el archivo JSON
 * @param {string} url - URL del archivo JSON
 * @returns {Promise} - Promesa con los datos cargados
 */
async function loadData(url = 'data/sample-data.json') {
  try {
      const response = await fetch(url);
      if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
      }
      const data = await response.json();
      return data;
  } catch (error) {
      console.error('Error al cargar los datos:', error);
      showErrorMessage('No se pudieron cargar los datos. Por favor, intente de nuevo más tarde.');
      return null;
  }
}

/**
* Filtra los datos según los criterios seleccionados
* @param {Object} data - Datos completos
* @param {Object} filters - Criterios de filtrado
* @returns {Object} - Datos filtrados
*/
function filterData(data, filters) {
  // Si no hay datos o filtros, retornar los datos originales
  if (!data || !filters) return data;
  
  // Clonar los datos para no modificar los originales
  let filteredData = JSON.parse(JSON.stringify(data));
  
  // Filtrar releases (contratos)
  if (filteredData.releases && filteredData.releases.length > 0) {
      filteredData.releases = filteredData.releases.filter(release => {
          // Filtro por institución (buyer)
          if (filters.institucion && filters.institucion !== '(All)' && 
              release.buyer && release.buyer.name !== filters.institucion) {
              return false;
          }
          
          // Filtro por año de inicio
          if (filters.anio && filters.anio !== '(Multiple values)' && 
              release.date && !release.date.includes(filters.anio)) {
              return false;
          }
          
          // Filtro por tipo de procedimiento
          if (filters.tipo && filters.tipo !== '(All)' && 
              release.tender && release.tender.procurementMethodDetails !== filters.tipo) {
              return false;
          }
          
          // Filtro por proveedor
          if (filters.proveedor && filters.proveedor.trim() !== '') {
              let hasProvider = false;
              // Buscar en los proveedores de cada adjudicación
              if (release.awards && release.awards.length > 0) {
                  for (const award of release.awards) {
                      if (award.suppliers && award.suppliers.length > 0) {
                          for (const supplier of award.suppliers) {
                              if (supplier.name.toLowerCase().includes(filters.proveedor.toLowerCase())) {
                                  hasProvider = true;
                                  break;
                              }
                          }
                          if (hasProvider) break;
                      }
                  }
              }
              if (!hasProvider) return false;
          }
          
          // Filtro por estatus
          if (filters.estatus && filters.estatus !== '(All)') {
              // Revisar diferentes estados: tender, award, contract
              let matchStatus = false;
              
              if (release.tender && release.tender.status === filters.estatus) {
                  matchStatus = true;
              }
              
              if (!matchStatus && release.awards && release.awards.length > 0) {
                  for (const award of release.awards) {
                      if (award.status === filters.estatus) {
                          matchStatus = true;
                          break;
                      }
                  }
              }
              
              if (!matchStatus && release.contracts && release.contracts.length > 0) {
                  for (const contract of release.contracts) {
                      if (contract.status === filters.estatus) {
                          matchStatus = true;
                          break;
                      }
                  }
              }
              
              if (!matchStatus) return false;
          }
          
          // Filtro por categoría
          if (filters.categoria && filters.categoria !== '(All)' && 
              release.tender && release.tender.mainProcurementCategory !== mapCategoria(filters.categoria)) {
              return false;
          }
          
          // Filtro por rango de monto
          if ((filters.montoMin || filters.montoMax) && release.tender && release.tender.value) {
              const amount = release.tender.value.amount;
              
              if (filters.montoMin && amount < parseFloat(filters.montoMin)) {
                  return false;
              }
              
              if (filters.montoMax && amount > parseFloat(filters.montoMax)) {
                  return false;
              }
          }
          
          // Filtro por fecha
          if (filters.fecha && release.date) {
              const releaseDate = new Date(release.date);
              const filterDate = new Date(filters.fecha);
              
              // Comparar solo fecha (sin hora)
              if (releaseDate.toDateString() !== filterDate.toDateString()) {
                  return false;
              }
          }
          
          // Si pasa todos los filtros, incluir el release
          return true;
      });
  }
  
  // Recalcular estadísticas basadas en los datos filtrados
  recalculateStats(filteredData);
  
  return filteredData;
}

/**
* Recalcula las estadísticas basadas en los datos filtrados
* @param {Object} data - Datos filtrados
*/
function recalculateStats(data) {
  // Inicializar contador de estadísticas
  let totalContracts = 0;
  let totalValue = 0;
  let suppliers = new Set();
  let activeTenders = 0;
  
  // Mapeo para contar contratos por empresa
  let contractsByCompany = {};
  
  // Mapeo para contar métodos de contratación
  let procurementMethods = {
      'open': 0,
      'selective': 0,
      'limited': 0,
      'direct': 0
  };
  
  // Procesar releases
  if (data.releases && data.releases.length > 0) {
      data.releases.forEach(release => {
          // Contar contratos
          if (release.contracts && release.contracts.length > 0) {
              totalContracts += release.contracts.length;
              
              // Sumar valor total
              release.contracts.forEach(contract => {
                  if (contract.value && contract.value.amount) {
                      totalValue += contract.value.amount;
                  }
              });
          }
          
          // Contar proveedores únicos
          if (release.awards && release.awards.length > 0) {
              release.awards.forEach(award => {
                  if (award.suppliers && award.suppliers.length > 0) {
                      award.suppliers.forEach(supplier => {
                          suppliers.add(supplier.id);
                          
                          // Contar contratos por empresa
                          if (!contractsByCompany[supplier.name]) {
                              contractsByCompany[supplier.name] = {
                                  contracts: 0,
                                  value: 0
                              };
                          }
                          contractsByCompany[supplier.name].contracts++;
                          
                          // Sumar valor si está disponible
                          if (award.value && award.value.amount) {
                              contractsByCompany[supplier.name].value += award.value.amount;
                          }
                      });
                  }
              });
          }
          
          // Contar licitaciones activas
          if (release.tender && release.tender.status === 'active') {
              activeTenders++;
          }
          
          // Contar métodos de contratación
          if (release.tender && release.tender.procurementMethod) {
              const method = release.tender.procurementMethod;
              if (procurementMethods.hasOwnProperty(method)) {
                  procurementMethods[method]++;
              }
          }
      });
  }
  
  // Convertir contractsByCompany a un array para el gráfico
  const contractsByCompanyArray = Object.keys(contractsByCompany).map(company => ({
      company: company,
      contracts: contractsByCompany[company].contracts,
      value: contractsByCompany[company].value
  }));
  
  // Ordenar por número de contratos (descendente)
  contractsByCompanyArray.sort((a, b) => b.contracts - a.contracts);
  
  // Tomar los primeros 8 para el gráfico
  const topCompanies = contractsByCompanyArray.slice(0, 8);
  
  // Convertir procurementMethods a un array para el gráfico
  const procurementMethodsArray = Object.keys(procurementMethods).map(method => {
      // Calcular porcentaje
      const count = procurementMethods[method];
      const total = Object.values(procurementMethods).reduce((sum, val) => sum + val, 0);
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      
      return {
          method: translateMethod(method),
          count: count,
          percentage: percentage
      };
  });
  
  // Actualizar las estadísticas en el objeto de datos
  data.contractStats = {
      totalContracts: totalContracts,
      totalValue: totalValue,
      totalSuppliers: suppliers.size,
      activeTenders: activeTenders,
      contractsByCompany: topCompanies,
      procurementMethods: procurementMethodsArray,
      // Mantener los datos mensuales originales por ahora (se podrían recalcular si es necesario)
      categoriesMonthly: data.contractStats ? data.contractStats.categoriesMonthly : null
  };
}

/**
* Traduce el método de contratación al español
* @param {string} method - Método en inglés
* @returns {string} - Método traducido
*/
function translateMethod(method) {
  const translations = {
      'open': 'Licitación Abierta',
      'selective': 'Licitación Selectiva',
      'limited': 'Licitación Limitada',
      'direct': 'Contratación Directa'
  };
  
  return translations[method] || method;
}

/**
* Mapea una categoría en español a su equivalente en el esquema OCDS
* @param {string} categoria - Categoría en español
* @returns {string} - Categoría en inglés según OCDS
*/
function mapCategoria(categoria) {
  const mapping = {
      'Bienes': 'goods',
      'Medicamentos': 'goods',
      'Material de Curación': 'goods',
      'Equipos Médicos': 'goods',
      'Servicios': 'services',
      'Servicios Generales': 'services',
      'Obras': 'works'
  };
  
  return mapping[categoria] || categoria;
}

/**
* Muestra un mensaje de error en la interfaz
* @param {string} message - Mensaje de error
*/
function showErrorMessage(message) {
  // Crear un elemento para mostrar el error
  const errorDiv = document.createElement('div');
  errorDiv.className = 'alert alert-danger';
  errorDiv.role = 'alert';
  errorDiv.textContent = message;
  
  // Agregar al DOM
  const container = document.querySelector('.container-fluid');
  container.insertBefore(errorDiv, container.firstChild);
  
  // Desaparecer después de 5 segundos
  setTimeout(() => {
      errorDiv.classList.add('fade-out');
      setTimeout(() => errorDiv.remove(), 500);
  }, 5000);
}

/**
* Genera datos aleatorios para la tabla de contratos recientes
* @param {Array} releases - Releases de OCDS
* @returns {Array} - Datos formateados para la tabla
*/
function generateTableData(releases) {
  if (!releases || releases.length === 0) {
      return [];
  }
  
  // Obtener los contratos más recientes
  const contracts = [];
  
  releases.forEach(release => {
      if (release.contracts && release.contracts.length > 0) {
          release.contracts.forEach(contract => {
              // Encontrar el proveedor correspondiente
              let supplierName = "Desconocido";
              if (release.awards && release.awards.length > 0) {
                  for (const award of release.awards) {
                      if (award.id === contract.awardID && award.suppliers && award.suppliers.length > 0) {
                          supplierName = award.suppliers[0].name;
                          break;
                      }
                  }
              }
              
              contracts.push({
                  id: contract.id,
                  supplier: supplierName,
                  amount: contract.value && contract.value.amount ? contract.value.amount : 0,
                  currency: contract.value && contract.value.currency ? contract.value.currency : 'USD',
                  date: contract.dateSigned ? new Date(contract.dateSigned) : null,
                  status: contract.status || 'unknown'
              });
          });
      }
  });
  
  // Ordenar por fecha (más reciente primero)
  contracts.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date - a.date;
  });
  
  // Tomar los primeros 5 contratos
  return contracts.slice(0, 5);
}

/**
* Genera datos para las barras de progreso de licitaciones
* @param {Array} releases - Releases de OCDS
* @returns {Array} - Datos de progreso
*/
function generateProgressData(releases) {
  if (!releases || releases.length === 0) {
      return [];
  }
  
  // Filtrar solo las licitaciones (tenders)
  const tenders = releases.filter(release => 
      release.tender && release.tender.title && release.tender.status !== 'complete'
  ).map(release => ({
      title: release.tender.title,
      // Simular progreso basado en el estado
      progress: getProgressByStatus(release.tender.status)
  })).slice(0, 5); // Tomar solo los primeros 5
  
  return tenders;
}

/**
* Obtiene un valor de progreso basado en el estado
* @param {string} status - Estado de la licitación
* @returns {number} - Valor de progreso (0-100)
*/
function getProgressByStatus(status) {
  const progressMap = {
      'planning': 20,
      'planned': 40,
      'active': 60,
      'cancelled': 100,
      'unsuccessful': 100,
      'complete': 100,
      'withdrawn': 100
  };
  
  return progressMap[status] || 50; // 50% por defecto
}

// Exportar funciones públicas
window.dataLoader = {
  loadData,
  filterData,
  generateTableData,
  generateProgressData
};