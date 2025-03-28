/**
 * filters.js
 * 
 * Script para manejar los filtros del dashboard
 */

// Inicializar los filtros cuando el DOM esté cargado
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
});

/**
 * Inicializa los controladores de eventos para los filtros
 */
function initializeFilters() {
    // Botón para aplicar filtros
    document.getElementById('apply-filters').addEventListener('click', function() {
        applyFilters();
    });
    
    // Filtrado instantáneo al cambiar el tipo de contratación (opcional)
    document.getElementById('contract-type').addEventListener('change', function() {
        const contractType = this.value;
        
        // Resaltar la porción correspondiente en el gráfico de métodos de contratación
        if (window.procurementMethodChartModule && typeof window.procurementMethodChartModule.highlightType === 'function') {
            window.procurementMethodChartModule.highlightType(contractType);
        }
    });
    
    // Filtrado instantáneo al cambiar la categoría (opcional)
    document.getElementById('category').addEventListener('change', function() {
        const category = this.value;
        
        // Aplicar filtro al gráfico de categorías
        if (window.categoryChartModule && typeof window.categoryChartModule.filterByCategory === 'function') {
            window.categoryChartModule.filterByCategory(category);
        }
    });
}

/**
 * Aplica todos los filtros seleccionados
 */
function applyFilters() {
    // Obtener valores de los filtros
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const contractType = document.getElementById('contract-type').value;
    const category = document.getElementById('category').value;
    
    console.log('Aplicando filtros:', {
        dateFrom,
        dateTo,
        contractType,
        category
    });
    
    // Mostrar spinner o indicador de carga
    showLoadingIndicators();
    
    // Simular tiempo de procesamiento
    setTimeout(() => {
        // Actualizar cada componente del dashboard con los filtros
        updateDashboardWithFilters(dateFrom, dateTo, contractType, category);
        
        // Mostrar notificación de filtros aplicados
        showFilterAppliedNotification();
    }, 1500);
}

/**
 * Muestra indicadores de carga en los componentes del dashboard
 */
function showLoadingIndicators() {
    const loadingHTML = `
        <div class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Cargando...</span>
            </div>
            <p class="mt-2">Actualizando datos...</p>
        </div>
    `;
    
    // Aplicar a todos los contenedores de gráficos
    document.querySelectorAll('.chart-container').forEach(container => {
        container.innerHTML = loadingHTML;
    });
}

/**
 * Actualiza todos los componentes del dashboard con los filtros aplicados
 */
function updateDashboardWithFilters(dateFrom, dateTo, contractType, category) {
    // Aplicar filtros al mapa
    if (window.mapModule && typeof window.mapModule.filter === 'function') {
        window.mapModule.filter({
            dateFrom,
            dateTo,
            contractType,
            category
        });
    }
    
    // Reiniciar gráficos con nuevos datos filtrados
    
    // En implementación real, esto requeriría peticiones al servidor o filtrado de datos local
    // Para esta demo, simulamos la actualización reinicializando los gráficos
    
    if (window.categoryChartModule && typeof window.categoryChartModule.initialize === 'function') {
        window.categoryChartModule.initialize();
    }
    
    if (window.companyChartModule && typeof window.companyChartModule.initialize === 'function') {
        window.companyChartModule.initialize();
    }
    
    if (window.procurementMethodChartModule && typeof window.procurementMethodChartModule.initialize === 'function') {
        window.procurementMethodChartModule.initialize();
    }
    
    // Actualizar las tarjetas de estadísticas con datos filtrados
    updateStatCards(dateFrom, dateTo, contractType, category);
}

/**
 * Actualiza las tarjetas de estadísticas según los filtros
 */
function updateStatCards(dateFrom, dateTo, contractType, category) {
    if (category !== 'todos' || contractType !== 'todos') {
        // Simular reducción de números basada en filtros
        const reductionFactor = Math.random() * 0.5 + 0.3; // Entre 30% y 80% de los originales
        
        document.querySelector('.card:nth-child(1) .h5').textContent = 
            Math.round(1283 * reductionFactor).toLocaleString();
        
        document.querySelector('.card:nth-child(2) .h5').textContent = 
            '$' + Math.round(125984230 * reductionFactor).toLocaleString();
        
        document.querySelector('.card:nth-child(3) .h5').textContent = 
            Math.round(87 * reductionFactor).toLocaleString();
        
        document.querySelector('.card:nth-child(4) .h5').textContent = 
            Math.round(42 * reductionFactor).toLocaleString();
    } else {
        // Restaurar valores originales
        document.querySelector('.card:nth-child(1) .h5').textContent = '1,283';
        document.querySelector('.card:nth-child(2) .h5').textContent = '$125,984,230';
        document.querySelector('.card:nth-child(3) .h5').textContent = '87';
        document.querySelector('.card:nth-child(4) .h5').textContent = '42';
    }
}

/**
 * Muestra una notificación toast cuando se aplican los filtros
 */
function showFilterAppliedNotification() {
    // Crear el elemento toast
    const toast = document.createElement('div');
    toast.classList.add('position-fixed', 'bottom-0', 'end-0', 'p-3');
    toast.style.zIndex = '5';
    
    toast.innerHTML = `
        <div class="toast show" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="toast-header">
                <strong class="me-auto">Filtros Aplicados</strong>
                <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body">
                Los datos han sido actualizados según los filtros seleccionados.
            </div>
        </div>
    `;
    
    // Añadir toast al body
    document.body.appendChild(toast);
    
    // Eliminar toast después de 3 segundos
    setTimeout(() => {
        document.body.removeChild(toast);
    }, 3000);
}

// Exportar funciones para uso en otros scripts
window.filtersModule = {
    apply: applyFilters
};