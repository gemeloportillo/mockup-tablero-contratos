# Dashboard de Contratación Pública

Un dashboard interactivo para visualizar y analizar datos de contrataciones públicas siguiendo el estándar OCDS (Open Contracting Data Standard).

## Características

- **Panel de Control**: Visualiza estadísticas clave y métricas de contratación pública.
- **Filtros Avanzados**: Filtra datos por institución, proveedor, tipo de procedimiento y más.
- **Gráficos Interactivos**: Visualiza contratos por empresa, métodos de contratación y categorías.
- **Tablas de Datos**: Consulta información detallada sobre contratos recientes.
- **Diseño Responsivo**: Compatible con dispositivos móviles y de escritorio.
- **Exportación de Datos**: Exporta gráficos y datos en formatos CSV y PDF.

## Tecnologías Utilizadas

- HTML5, CSS3 y JavaScript
- Bootstrap 5 para la interfaz responsiva
- Chart.js para gráficos interactivos
- Font Awesome y Bootstrap Icons para iconografía

## Estructura del Proyecto

```
dashboard-contratacion-publica/
│
├── index.html                            # Archivo principal HTML
│
├── assets/                               # Todos los recursos estáticos
│   ├── css/
│   │   ├── charts.css                    # Estilos gráficas
│   │   ├── styles.css                    # Estilos principales
│   │   ├── dashboard.css                 # Estilos específicos del dashboard
│   │   ├── filters.css                   # Estilos para los filtros
│   │   ├── map.css                       # Estilos mapa
│   │   ├── mapa.css                      # Estilos mapa
│   │   └── responsive.css                # Reglas de media queries para responsividad
│   │
│   ├── imgs/                             # Imágenes e iconos
│   │   ├── ico_s6.svg                    # Icono sistema 6
│   │   └── logo_pdn-transparente.svg     # Icono PDN
│   │
│   ├── js/
│   │   ├── category-chart.js             # Código gráfica de categoría
│   │   ├── charts.js                     # Código para todas las gráficas (Chart.js)
│   │   ├── company-chart.js              # Código gráfica de compañía
│   │   ├── contract-modal.js             # Código modal de contratos
│   │   ├── contracts-data.js             # Código datos de contrato
│   │   ├── currency-modal.js             # Código modal de valores por moneda
│   │   ├── institution-modal.js          # Código modal de instituciones
│   │   ├── main.js                       # Código principal
│   │   ├── map.js                        # Código mapa
│   │   ├── procurement-method-chart.js   # Código gráfico Métodos de Contratación
│   │   ├── supplier-modal.js             # Código grafica de empresas adjudicadas
│   │   ├── filters.js                    # Lógica para los filtros
│   │   ├── data-loader.js                # Carga y procesamiento de datos
│   │   └── utils.js                      # Funciones utilitarias
│   │
│   └── vendors/                          # Bibliotecas de terceros
│       ├── bootstrap/
│       ├── chart.js/
│       └── fontawesome/
│
├── data/                                 # Datos de muestra JSON
│   ├── contract-data.json                # Datos de ejemplo de contratos detallados
│   ├── currency-data.json                # Datos de ejemplo para valores por moneda
│   ├── institution-data.json             # Datos de ejemplo para instituciones
│   ├── mexico_estados.json               # Datos de ejemplo estados
│   ├── sample-data.json                  # Datos de ejemplo
│   └── supplier-data.json                # Datos de ejemplo para empresas adjudicadas
│
├── pages/                                # Páginas adicionales
│   ├── contracts.html                    # Página de contratos detallados
│   ├── providers.html                    # Página de proveedores
│   ├── tenders.html                      # Página de licitaciones
│   └── settings.html                     # Configuración
│
└── README.md                             # Documentación del proyecto
```

## Instalación y Uso

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/dashboard-contratacion-publica.git
   cd dashboard-contratacion-publica
   ```

2. **Instalación de dependencias**
   Si utilizas npm para gestionar las dependencias de frontend:
   ```bash
   npm install
   ```
   
   Alternativamente, puedes usar las versiones CDN incluidas en el proyecto.

3. **Ejecuta el proyecto**
   Para desarrollo local, puedes usar un servidor web simple como:
   ```bash
   npx serve
   ```
   o
   ```bash
   python -m http.server
   ```

4. **Abre el proyecto en tu navegador**
   Navega a `http://localhost:3000` o el puerto que te indique tu servidor.

## Personalización

### Datos

Para usar tus propios datos de contratación pública:

1. Reemplaza el archivo `data/sample-data.json` con tu propio archivo JSON siguiendo el esquema OCDS.
2. Ajusta la ruta del archivo en `dataLoader.loadData()` en `main.js` si es necesario.

### Tema

Para cambiar los colores y estilos:

1. Modifica las variables CSS en `assets/css/styles.css`.
2. Ajusta los colores de los gráficos en `assets/js/charts.js`.

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Créditos

- Desarrollado por [Tu Nombre/Empresa]
- Basado en el estándar [Open Contracting Data Standard (OCDS)](https://standard.open-contracting.org/)
- Utiliza [Bootstrap](https://getbootstrap.com/), [Chart.js](https://www.chartjs.org/) y otras bibliotecas de código abierto

## Contacto

Para preguntas o soporte, contáctanos en [tu-email@example.com].