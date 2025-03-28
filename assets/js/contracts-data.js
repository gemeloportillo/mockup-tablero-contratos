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

