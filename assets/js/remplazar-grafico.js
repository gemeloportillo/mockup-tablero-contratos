/**
 * reemplazar-grafico.js - Reemplaza completamente el gráfico de métodos de contratación
 */

// Esperar a que todos los recursos se hayan cargado
window.addEventListener('load', function() {
  // Dar tiempo para que cualquier otro script termine de ejecutarse
  setTimeout(function() {
    // Reemplazar el gráfico completamente
    const canvas = document.getElementById('procurementMethodChart');
    if (!canvas) {
      console.error("No se encontró el canvas para el gráfico de métodos");
      return;
    }
    
    // Limpiar el canvas existente
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Destruir cualquier gráfico existente
    if (window.procurementMethodChart) {
      window.procurementMethodChart.destroy();
      window.procurementMethodChart = null;
    }
    if (window.methodsChart) {
      window.methodsChart.destroy();
      window.methodsChart = null;
    }
    
    // Datos para el nuevo gráfico
    const data = {
      labels: ['Licitación Abierta', 'Licitación Selectiva', 'Contratación Directa', 'Licitación Limitada'],
      datasets: [{
        data: [45, 25, 20, 10],
        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e'],
        hoverBackgroundColor: ['#2e59d9', '#17a673', '#2c9faf', '#dda20a'],
        hoverBorderColor: "rgba(234, 236, 244, 1)",
      }]
    };
    
    // Crear un nuevo gráfico
    window.procurementMethodChart = new Chart(context, {
      type: 'doughnut',
      data: data,
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
            displayColors: false,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.raw || 0;
                // Calcular el total de todos los valores
                const total = context.chart.data.datasets[0].data.reduce((acc, val) => acc + val, 0);
                // Calcular el porcentaje
                const percentage = ((value / total) * 100).toFixed(1);
                // Formato del texto del tooltip
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
    // También actualizar methodsChart para compatibilidad
    window.methodsChart = window.procurementMethodChart;
    window.methodsDataNacional = data;
    
    console.log("Gráfico de métodos de contratación reemplazado completamente");
  }, 1500);
});