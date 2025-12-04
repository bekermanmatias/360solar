# Solar360 - Simulador de Paneles Solares

Sitio web profesional para la instalación de paneles solares en Argentina. Incluye un simulador interactivo paso a paso que permite calcular el potencial de ahorro energético y financiero de sistemas fotovoltaicos utilizando datos satelitales históricos de la NASA.

## 🌟 Características Principales

### Landing Page
- Diseño moderno y responsive
- Secciones informativas sobre productos y tecnología
- Formulario de contacto integrado
- Navegación fluida con scroll spy

### Simulador Interactivo (Wizard Paso a Paso)
- **Paso 1: Ubicación**
  - Mapa interactivo con Leaflet
  - Búsqueda de direcciones con Nominatim
  - Obtención automática de datos climáticos desde NASA POWER API
  - Vista de mapa y satélite
  
- **Paso 2: Consumo**
  - Selector de moneda (ARS/USD)
  - Consumo aproximado o específico mensual
  - Precio por kWh configurable
  
- **Paso 3: Dimensionamiento**
  - Cálculo automático según porcentaje de cobertura deseado
  - Slider interactivo para ajustar cobertura (25-100%)
  
- **Paso 4: Ángulo de Instalación**
  - 20° - Instalación coplanar (estética y económica)
  - 45° - Optimización anual (máxima eficiencia)
  
- **Paso 5: Resultados**
  - **General**: KPIs principales, paneles recomendados, veredicto
  - **Análisis Energético**: Gráficos mensuales, tabla detallada, ley de generación distribuida
  - **Impacto Ambiental**: CO₂ evitado, equivalencias ambientales, ODS
  - **Análisis Financiero**: Gráfico de flujo de fondos, ROI, tabla de ahorro acumulado
  - **Tu Instalación**: Especificaciones técnicas, espacio requerido

### Funcionalidades Técnicas
- **Modelo de Clusters**: 6 clusters operativos con regresión lineal
- **Datos Climáticos en Tiempo Real**: Integración con NASA POWER API y OpenMeteo (fallback)
- **Geocodificación**: Nominatim para búsqueda de ubicaciones
- **Cálculos Precisos**: Basados en metodología validada científicamente
- **Exportación PDF**: Generación de reportes completos con jsPDF y html2canvas

## 🚀 Inicio Rápido

### Prerrequisitos
- Node.js 16+ y npm

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd 360solar

# Instalar dependencias
npm install
```

### Desarrollo

```bash
# Iniciar servidor de desarrollo con Vite
npm run dev

# El servidor se abrirá automáticamente en http://localhost:3000
```

### Producción

```bash
# Construir para producción
npm run build

# Previsualizar build de producción
npm run preview
```

## 📁 Estructura del Proyecto

```
360solar/
├── index.html                 # Página principal
├── sobre-nosotros.html        # Página sobre nosotros
├── styles.css                 # Estilos principales
├── vite.config.js            # Configuración de Vite
├── package.json              # Dependencias y scripts
│
├── assets/
│   ├── js/
│   │   ├── main.js           # Punto de entrada principal
│   │   ├── app.js            # Lógica principal de la aplicación
│   │   ├── state.js          # Gestión de estado global
│   │   │
│   │   ├── config/
│   │   │   ├── constants.js  # Constantes y configuración
│   │   │   └── models.js     # Modelos de clusters y coeficientes β₁
│   │   │
│   │   ├── components/
│   │   │   ├── wizard.js     # Lógica del wizard paso a paso
│   │   │   ├── map.js        # Funcionalidad de mapas Leaflet
│   │   │   ├── api.js        # Integraciones con APIs externas
│   │   │   ├── charts.js     # Gráficos con Chart.js
│   │   │   └── pdf.js        # Generación de PDFs
│   │   │
│   │   └── utils/
│   │       ├── calculations.js   # Cálculos de generación y resultados
│   │       ├── formatters.js     # Formateo de números y monedas
│   │       ├── validators.js     # Validación de datos
│   │       ├── validation.js     # Validación del modelo
│   │       ├── notifications.js  # Sistema de notificaciones
│   │       └── ui.js             # Utilidades de UI
│   │
│   └── css/                   # Estilos adicionales (si aplica)
│
├── images/                    # Recursos multimedia
├── csv/                       # Datasets experimentales
│   └── README.md             # Documentación del dataset
│
├── VALIDACION_MODELO.md      # Documentación técnica del modelo
└── README.md                  # Este archivo
```

## 🛠️ Tecnologías

### Frontend
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos y responsive
- **JavaScript (ES6+)** - Lógica modular con imports/exports
- **Vite** - Build tool y dev server ultra-rápido

### Librerías Externas
- **Chart.js 4.4.0** - Gráficos interactivos
- **Leaflet 1.9.4** - Mapas interactivos
- **jsPDF 2.5.1** - Generación de PDFs
- **html2canvas 1.4.1** - Captura de pantalla para PDFs
- **Font Awesome 6.5.1** - Iconos

### APIs Externas
- **NASA POWER API** - Datos climáticos históricos (irradiancia solar, temperatura)
- **OpenMeteo Archive API** - Fallback para datos climáticos
- **Nominatim (OpenStreetMap)** - Geocodificación y búsqueda de direcciones

## 📊 Modelo de Cálculo

El simulador utiliza un **modelo de clusters** validado científicamente:

### Clusters Operativos
6 combinaciones de temperatura (10°C, 20°C, 30°C) e inclinación (20°, 45°)

### Función de Generación
```
P = β₁ × G
```
Donde:
- `P`: Potencia generada (W)
- `β₁`: Coeficiente de eficiencia del cluster
- `G`: Irradiancia solar (W/m²)

### Coeficientes β₁
| Cluster | Condiciones (T, θ) | β₁ (Eficiencia) |
|---------|-------------------|------------------|
| 1 | 10°C, 20° | 0.1908 (19.08%) |
| 2 | 20°C, 20° | 0.1836 (18.36%) |
| 3 | 30°C, 20° | 0.1764 (17.64%) |
| 4 | 10°C, 45° | 0.1813 (18.13%) |
| 5 | 20°C, 45° | 0.1744 (17.44%) |
| 6 | 30°C, 45° | 0.1676 (16.76%) |

### Performance Ratio
- PR = 0.85 (pérdidas del sistema)

### Modelo BOS (Balance of System)
- Costo Base: $1,500,000 ARS (inversor, tableros, estructura, cableado, mano de obra)
- Costo por Panel: $200,000 ARS (panel + instalación incremental)

Para más detalles técnicos, consulta [VALIDACION_MODELO.md](./VALIDACION_MODELO.md)

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo en http://localhost:3000

# Producción
npm run build        # Construye la aplicación para producción
npm run preview      # Previsualiza el build de producción
```

## 📝 Uso del Simulador

1. **Abrir el simulador**: Haz clic en "Calcular ahorro" en la página principal
2. **Seleccionar ubicación**: 
   - Busca una dirección o haz clic en el mapa
   - Los datos climáticos se obtendrán automáticamente
3. **Ingresar consumo**: 
   - Indica tu consumo mensual aproximado
   - Configura el precio por kWh
4. **Dimensionar sistema**: 
   - Ajusta el porcentaje de cobertura deseado (25-100%)
5. **Elegir ángulo**: 
   - 20° para instalación coplanar (más económica)
   - 45° para máxima eficiencia anual
6. **Ver resultados**: 
   - Explora las diferentes pestañas de resultados
   - Descarga el reporte completo en PDF

## 🌐 APIs Utilizadas

### NASA POWER API
```javascript
// Ejemplo de consulta
const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?` +
    `parameters=ALLSKY_SFC_SW_DWN,T2M` +
    `&community=RE` +
    `&longitude=${lon}` +
    `&latitude=${lat}` +
    `&start=2023&end=2023&format=JSON`;
```

### OpenMeteo Archive API (Fallback)
```javascript
// Ejemplo de consulta
const url = `https://archive-api.open-meteo.com/v1/archive?` +
    `latitude=${lat}&longitude=${lon}` +
    `&start_date=${startDate}&end_date=${endDate}` +
    `&daily=shortwave_radiation_sum,temperature_2m_mean&timezone=auto`;
```

### Nominatim (Geocodificación)
```javascript
// Ejemplo de geocodificación inversa
const url = `https://nominatim.openstreetmap.org/reverse?` +
    `format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=es`;
```

## 📚 Documentación Adicional

- **[VALIDACION_MODELO.md](./VALIDACION_MODELO.md)** - Validación técnica del modelo de clusters
- **[csv/README.md](./csv/README.md)** - Documentación del dataset experimental

## 🎨 Características de Diseño

- **Diseño Responsive**: Optimizado para móviles, tablets y desktop
- **UI Moderna**: Interfaz limpia y profesional
- **Animaciones Suaves**: Transiciones fluidas entre pasos
- **Accesibilidad**: Navegación por teclado y etiquetas ARIA

## 🔒 Notas Importantes

- Los precios y parámetros están configurados para Argentina (2025)
- El simulador utiliza datos climáticos históricos de la NASA (2023)
- Los resultados son estimaciones y pueden variar según condiciones reales
- Se requiere conexión a internet para obtener datos climáticos

## 📧 Contacto

Para más información sobre instalaciones de paneles solares:
- Email: info@solar360.com.ar
- Teléfono: +54 11 1234-5678
- Ubicación: La Plata, Buenos Aires

## 📄 Licencia

© 2025 Solar360. Todos los derechos reservados. | Ingeniería Solar de Precisión

---

**Desarrollado con ❤️ usando Vite, JavaScript ES6+ y APIs de datos climáticos**
