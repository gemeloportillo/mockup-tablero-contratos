/**
 * fix-tooltip.js - Script específico para corregir el tooltip en el gráfico de métodos de contratación
 */

// Ejecutar cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  // Esperar un poco para asegurarnos de que el gráfico ya se ha inicializado
  setTimeout(function() {
    // Verificar si el gráfico existe
    if (window.procurementMethodChart || window.methodsChart) {
      console.log("Aplicando corrección de tooltip para gráfico de métodos de contratación");
      
      // Determinar cuál variable contiene el gráfico
      const chart = window.procurementMethodChart || window.methodsChart;
      
      // Guardar la configuración actual
      const currentOptions = chart.options || {};
      const currentPlugins = currentOptions.plugins || {};
      
      // Configurar específicamente el tooltip
      chart.options = {
        ...currentOptions,
        plugins: {
          ...currentPlugins,
          tooltip: {
            callbacks: {
              label: function(context) {
                try {
                  const label = context.label || '';
                  const value = context.raw || context.parsed || 0;
                  let total = 0;
                  
                  // Calcular el total sumando todos los valores
                  if (context.dataset && Array.isArray(context.dataset.data)) {
                    total = context.dataset.data.reduce(function(sum, val) {
                      return sum + (Number(val) || 0);
                    }, 0);
                  }
                  
                  // Calcular el porcentaje
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                  
                  // Retornar el texto formateado
                  return `${label}: ${value} (${percentage}%)`;
                } catch (e) {
                  console.error("Error en callback de tooltip:", e);
                  return context.label || '';
                }
              }
            }
          }
        }
      };
      
      // Actualizar el gráfico con la nueva configuración
      chart.update();
      
      console.log("Corrección de tooltip aplicada");
    } else {
      console.warn("No se encontró el gráfico de métodos de contratación");
    }
  }, 1000); // Esperar 1 segundo para asegurar que todo esté cargado
});