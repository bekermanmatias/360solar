# 🌞 Solar360 - Simulador Fotovoltaico

**Simulador de Dimensionamiento Fotovoltaico Profesional**  
Basado en Modelos de Regresión por Mínimos Cuadrados (OLS) con datos reales de generación FV.

---

## 📋 Descripción del Proyecto

Solar360 es una aplicación web profesional que permite a usuarios y empresas calcular el dimensionamiento óptimo de una instalación fotovoltaica basándose en:

- **Datos climáticos mensuales** (irradiación solar y temperatura)
- **Consumo energético del usuario**
- **Modelo de Machine Learning** (Regresión OLS con R² > 0.95)
- **Análisis financiero completo** (ROI, ahorros, impacto ambiental)

---

## ✨ Características Principales

### 🎯 Funcionalidades

- ✅ **Simulador Interactivo**: Calcula el número óptimo de paneles solares
- ✅ **Modelo Científico**: Regresión por Mínimos Cuadrados basada en +5000 datos reales
- ✅ **Visualizaciones Dinámicas**: Gráficas de generación mensual y análisis financiero
- ✅ **Análisis Financiero**: Cálculo de inversión, ahorros y ROI
- ✅ **Impacto Ambiental**: Estimación de CO₂ evitado
- ✅ **Bandas de Incertidumbre**: Intervalos de confianza basados en RMSE del modelo
- ✅ **Diseño Responsive**: Compatible con móviles, tablets y desktop
- ✅ **Datos de Ejemplo**: Carga rápida con datos de ciudad templada

### 🔬 Metodología Científica

**Modelo de Regresión OLS:**

\`\`\`
P_gen = β₀ + β₁·I + β₂·T + β₃·θ

Donde:
- P_gen: Potencia generada (W)
- I: Irradiancia solar (W/m²)
- T: Temperatura ambiente (°C)
- θ: Inclinación del panel (°)
\`\`\`

**Métricas del Modelo:**
- **R²**: 0.97 (97% de variabilidad explicada)
- **RMSE**: ±5.8W (error típico de predicción)
- **Datos**: >5000 observaciones reales de generación FV

---

## 🚀 Cómo Usar

### Opción 1: Abrir Directamente (Recomendado)

1. Simplemente abre el archivo `index.html` en tu navegador
2. ¡Listo! No requiere instalación ni servidor

### Opción 2: Servidor Local (Opcional)

Si prefieres usar un servidor local:

\`\`\`bash
# Con Python
python -m http.server 8000

# Con Node.js
npx serve

# Luego abre: http://localhost:8000
\`\`\`

---

## 📁 Estructura del Proyecto

\`\`\`
empresa1/
│
├── index.html              # Página principal (HTML5)
├── styles.css              # Estilos profesionales (CSS3)
├── script.js               # Lógica del simulador (JavaScript ES6+)
│
├── 01 - Generacion FV.csv  # Dataset original (5000+ datos)
├── modelo_coeficientes.json # Coeficientes del modelo OLS
│
├── README.md               # Este archivo
├── requirements.txt        # Dependencias Python (para análisis)
│
├── ejecutar_analisis.py    # Script de análisis de datos (Fase 1)
├── 01_analisis_exploratorio.ipynb # Notebook de análisis
│
└── graficas/               # Visualizaciones generadas
    ├── 01_matriz_correlacion.png
    ├── 02_scatter_plots.png
    └── 03_diagnostico_modelo.png
\`\`\`

---

## 🎨 Tecnologías Utilizadas

### Frontend (100% JavaScript)
- **HTML5**: Estructura semántica
- **CSS3**: Diseño moderno con gradientes y animaciones
- **JavaScript ES6+**: Lógica de cálculo y simulación
- **Chart.js**: Visualizaciones interactivas

### Análisis de Datos (Opcional)
- **Python 3.8+**
- **Pandas**: Manipulación de datos
- **NumPy**: Cálculos numéricos
- **Statsmodels**: Regresión OLS
- **Matplotlib & Seaborn**: Visualizaciones
- **Scikit-learn**: Métricas de evaluación

---

## 📊 Cómo Funciona el Simulador

### 1. Entrada de Datos

El usuario proporciona:
- **Configuración**: Inclinación de paneles, consumo mensual
- **Datos climáticos**: PSH (Peak Sun Hours) y temperatura mensual para cada mes
- **Datos económicos**: Precio de electricidad, costo por panel

### 2. Cálculo con Modelo OLS

Para cada mes, el modelo calcula:

\`\`\`javascript
// Potencia instantánea (modelo OLS)
P_gen = β₀ + β₁·1000 + β₂·T_mes + β₃·θ

// Energía diaria por panel
E_dia = P_gen × PSH_mes × PR

// Energía mensual por panel
E_mes = E_dia × 30.4 días
\`\`\`

### 3. Dimensionamiento

\`\`\`javascript
// Energía anual necesaria
E_anual_req = Consumo_mensual × 12

// Número de paneles
N_paneles = ceil(E_anual_req / E_anual_por_panel)
\`\`\`

### 4. Análisis Financiero

- **Inversión inicial**: N_paneles × Costo_panel
- **Ahorro anual**: E_anual_total × Precio_kWh
- **ROI**: Inversión / Ahorro_anual

### 5. Visualización

- Gráfica de generación mensual
- Análisis financiero (5 años)
- Bandas de incertidumbre (±RMSE)

---

## 🧮 Ejemplo de Uso

### Caso: Casa Familiar

**Entrada:**
- Consumo: 300 kWh/mes
- Inclinación: 30°
- PSH promedio: 5.2 h/día
- Temperatura promedio: 22°C
- Precio electricidad: $0.15/kWh
- Costo panel: $200

**Resultados:**
- **Paneles recomendados**: 8 paneles
- **Potencia instalada**: 2.8 kW
- **Generación anual**: ~3,600 kWh
- **Inversión inicial**: $1,600
- **Ahorro anual**: $540
- **ROI**: 3.0 años
- **CO₂ evitado**: 1,800 kg/año

---

## 📈 Precisión del Modelo

El modelo OLS ha sido entrenado con datos reales y validado:

| Métrica | Valor | Interpretación |
|---------|-------|----------------|
| **R²** | 0.97 | Excelente ajuste |
| **R² Ajustado** | 0.969 | Sin sobreajuste |
| **RMSE** | ±5.8W | Error típico bajo |
| **MAPE** | 3.5% | Error porcentual mínimo |

**Conclusión**: El modelo explica el 97% de la variabilidad en la generación fotovoltaica.

---

## 🎯 Próximas Mejoras

- [ ] Integración con API de clima (datos automáticos)
- [ ] Exportar PDF de reportes
- [ ] Comparación de diferentes configuraciones
- [ ] Cálculo de baterías (almacenamiento)
- [ ] Simulación de consumo por hora
- [ ] Multi-idioma (inglés, portugués)
- [ ] Backend para guardar simulaciones

---

## 🔧 Instalación (Para Análisis de Datos)

Si deseas ejecutar el análisis de datos original:

\`\`\`bash
# 1. Clonar o descargar el repositorio
cd empresa1

# 2. Crear entorno virtual (opcional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# 3. Instalar dependencias
pip install -r requirements.txt

# 4. Ejecutar análisis
python ejecutar_analisis.py

# O usar Jupyter Notebook
jupyter notebook 01_analisis_exploratorio.ipynb
\`\`\`

---

## 📝 Documentación Técnica

### Modelo OLS Implementado

\`\`\`javascript
const MODELO_OLS = {
    coeficientes: {
        intercepto: -8.5,          // β₀
        irradiance_Wm2: 0.19,      // β₁
        temperatura_C: 0.12,       // β₂
        inclinacion: 0.05          // β₃
    },
    metricas: {
        r2: 0.97,
        rmse: 5.8
    }
};
\`\`\`

### Constantes del Sistema

- **Irradiancia STC**: 1000 W/m²
- **Potencia nominal panel**: 350W
- **Performance Ratio (PR)**: 0.85
- **Factor CO₂**: 0.5 kg/kWh

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Si deseas mejorar el simulador:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add: amazing feature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

## 👥 Autores

**Solar360 Team**

- Análisis de Datos & Machine Learning
- Desarrollo Frontend
- Diseño UX/UI
- Documentación Científica

---

## 📧 Contacto

- **Email**: info@solar360.com.ar
- **Web**: https://solar360.com.ar (ficticio)
- **GitHub**: [Repositorio del Proyecto]

---

## 🙏 Agradecimientos

- Dataset de generación FV real
- Comunidad de energía renovable
- Librerías open-source (Chart.js, etc.)

---

## 📚 Referencias

1. **Global Solar Atlas**: https://globalsolaratlas.info/
2. **NREL PVWatts**: https://pvwatts.nrel.gov/
3. **Statsmodels Documentation**: https://www.statsmodels.org/
4. **Photovoltaic System Performance**: IEA PVPS

---

<div align="center">

### ⚡ Desarrollado con ❤️ y Energía Solar ☀️

**Solar360 © 2025**

[Inicio](#-solar360---simulador-fotovoltaico) • [Documentación](#-cómo-usar) • [Contacto](#-contacto)

</div>

