# UBICACIONES RECOMENDADAS PARA FIGURAS EN EL PAPER TÉCNICO

## Formato de Figuras (según especificaciones)

- **Inserción**: Independiente del texto, centrada, con línea de separación
- **Leyenda**: Inferior, ARIAL 9, cursiva
- **Referencia**: "Figura 1", "Figura 2", etc.
- **Leyenda debe incluir**: "[Elaboración propia]" o "[Referencia]"

---

## FIGURAS RECOMENDADAS

### **FIGURA 1: Matriz de Correlación**
**Ubicación**: Sección 1.2 (Análisis Exploratorio de Datos), después del párrafo sobre matriz de correlación

**Contenido**: 
- Matriz de correlación entre variables (irradiancia, temperatura, inclinación, generación)
- Heatmap con valores de correlación
- Colores: verde/rojo para correlaciones positivas/negativas

**Leyenda sugerida**: 
*Figura 1. Matriz de correlación entre variables del dataset. Se observa alta correlación (0,985) entre irradiancia y generación. [Elaboración propia]*

**Texto de referencia en el paper**:
```
La matriz de correlación mostró que la irradiancia tiene una correlación muy alta de 0,985 con la generación, siendo el predictor más importante. La temperatura ambiental presenta una correlación moderada positiva de 0,234, mientras que la inclinación muestra una correlación baja de 0,089 pero significativa.

[INSERTAR FIGURA 1 AQUÍ]

El análisis por estado del cielo demostró...
```

---

### **FIGURA 2: Scatter Plot - Irradiancia vs Generación**
**Ubicación**: Sección 1.2, después de la matriz de correlación

**Contenido**:
- Gráfico de dispersión: irradiancia (eje X) vs generación (eje Y)
- Línea de tendencia
- Muestra la relación lineal fuerte

**Leyenda sugerida**:
*Figura 2. Relación entre irradiancia solar y generación fotovoltaica. Se observa una relación lineal fuerte (r = 0,985). [Elaboración propia]*

---

### **FIGURA 3: Diagrama de Flujo del Simulador**
**Ubicación**: Sección 2.4 (Implementación en Aplicación Web Frontend), después del párrafo sobre flujo de cálculo

**Contenido**:
- Diagrama de flujo mostrando:
  - Entrada de datos del usuario
  - Aplicación del modelo OLS
  - Cálculo de dimensionamiento
  - Análisis financiero
  - Visualización de resultados

**Leyenda sugerida**:
*Figura 3. Diagrama de flujo del proceso de cálculo del simulador. Todos los cálculos se ejecutan en el navegador del usuario. [Elaboración propia]*

**Texto de referencia en el paper**:
```
El flujo de cálculo del simulador consiste en: entrada de datos del usuario mediante formulario web incluyendo configuración del sistema y datos climáticos mensuales, aplicación del modelo OLS implementado en JavaScript para calcular generación mensual por panel, cálculo del dimensionamiento determinando el número de paneles necesarios mediante operaciones matemáticas en cliente, análisis financiero calculando inversión, ahorros y retorno de inversión, y visualización de resultados mediante gráficas interactivas renderizadas en el navegador.

[INSERTAR FIGURA 3 AQUÍ]

La ecuación implementada en JavaScript para cada mes...
```

---

### **FIGURA 4: Captura de Pantalla del Simulador**
**Ubicación**: Sección 2.4, después del diagrama de flujo

**Contenido**:
- Captura de pantalla de la interfaz del simulador
- Muestra el formulario de entrada y resultados
- Interfaz profesional y moderna

**Leyenda sugerida**:
*Figura 4. Interfaz del simulador web desarrollado. La aplicación permite ingresar datos climáticos mensuales y obtener resultados de dimensionamiento en tiempo real. [Elaboración propia]*

---

### **FIGURA 5: Comparación con Benchmarks**
**Ubicación**: Sección 3.1 (Precisión del Modelo), después del párrafo sobre comparación con benchmarks

**Contenido**:
- Gráfico de barras comparando:
  - Nuestro modelo: R² = 0,970, RMSE = 5,8W
  - PVWatts: R² = 0,92-0,95, RMSE = 8-12W
  - SolarGIS: R² = 0,90-0,93, RMSE = 10-15W

**Leyenda sugerida**:
*Figura 5. Comparación de métricas de precisión entre nuestro modelo OLS y benchmarks de la industria. Nuestro modelo supera a las alternativas en ambas métricas. [Elaboración propia]*

**Texto de referencia en el paper**:
```
La comparación con benchmarks de la industria muestra que nuestro modelo con R² de 0,970 y RMSE de 5,8 W supera a PVWatts de NREL que presenta R² entre 0,92 y 0,95 con RMSE de aproximadamente 8 a 12 W, y a SolarGIS que muestra R² entre 0,90 y 0,93 con RMSE de aproximadamente 10 a 15 W.

[INSERTAR FIGURA 5 AQUÍ]
```

---

### **FIGURA 6: Gráfica de Generación Mensual (Caso de Prueba)**
**Ubicación**: Sección 3.2 (Casos de Prueba), después del caso de la casa familiar

**Contenido**:
- Gráfico de barras mostrando generación mensual (kWh) para el caso de prueba
- 12 meses del año
- Muestra variabilidad estacional

**Leyenda sugerida**:
*Figura 6. Generación mensual estimada para el caso de prueba (casa familiar, 8 paneles). Se observa mayor generación en verano y menor en invierno. [Elaboración propia]*

**Texto de referencia en el paper**:
```
Para una casa familiar urbana con consumo de 300 kWh por mes, ubicación en ciudad templada con PSH promedio de 5,2 horas por día, temperatura promedio de 22°C e inclinación de 30°, el simulador recomienda 8 paneles con potencia instalada de 2,8 kW, generación anual de 3.605 kWh, inversión de 1.600 dólares, ahorro anual de 540 dólares y retorno de inversión de 3,0 años. Los resultados son coherentes con calculadoras comerciales.

[INSERTAR FIGURA 6 AQUÍ]

Para una pequeña empresa...
```

---

### **FIGURA 7: Análisis Financiero (5 años)**
**Ubicación**: Sección 3.2, después del caso de pequeña empresa

**Contenido**:
- Gráfico de líneas mostrando:
  - Inversión inicial (año 0)
  - Ahorros acumulados (años 1-5)
  - Flujo neto acumulado
  - Punto de equilibrio (ROI)

**Leyenda sugerida**:
*Figura 7. Proyección financiera a 5 años para el caso de prueba de pequeña empresa en La Plata (30 paneles, 10,5 kW). Muestra el punto de equilibrio (ROI de 4,0 años) y la evolución de ahorros acumulados. [Elaboración propia]*

---

### **FIGURA 8: Bandas de Incertidumbre**
**Ubicación**: Sección 3.3 (Bandas de Incertidumbre), después de la ecuación (3)

**Contenido**:
- Gráfico mostrando:
  - Energía estimada (línea central)
  - Intervalo de confianza superior e inferior
  - Banda sombreada de incertidumbre

**Leyenda sugerida**:
*Figura 8. Bandas de incertidumbre para la estimación de generación anual. El intervalo de confianza del 95% se calcula basado en el RMSE del modelo. [Elaboración propia]*

**Texto de referencia en el paper**:
```
IC_95% = E_anual ± (RMSE × 1,96 × √(N_meses × dias))		                     	          		(3)

[INSERTAR FIGURA 8 AQUÍ]

Para el caso de la casa familiar, la energía estimada es de 3.605 kWh por año con una incertidumbre de ±180 kWh por año, resultando en un rango de 3.425 a 3.785 kWh por año.
```

---

### **FIGURA 9: Arquitectura Frontend-Only**
**Ubicación**: Sección 2.4, al inicio de la subsección

**Contenido**:
- Diagrama de arquitectura mostrando:
  - Navegador del usuario
  - HTML/CSS/JavaScript
  - Modelo OLS en JavaScript
  - Chart.js para visualizaciones
  - Sin servidor backend

**Leyenda sugerida**:
*Figura 9. Arquitectura de la aplicación web frontend-only. Todos los componentes se ejecutan en el navegador del usuario sin requerir servidor. [Elaboración propia]*

---

## RESUMEN DE FIGURAS RECOMENDADAS

| # | Nombre | Sección | Tipo | Prioridad |
|---|--------|---------|------|-----------|
| 1 | Matriz de Correlación | 1.2 | Heatmap | Alta |
| 2 | Scatter Plot Irradiancia | 1.2 | Gráfico dispersión | Media |
| 3 | Diagrama de Flujo | 2.4 | Diagrama | Alta |
| 4 | Captura Simulador | 2.4 | Screenshot | Alta |
| 5 | Comparación Benchmarks | 3.1 | Gráfico barras | Alta |
| 6 | Generación Mensual | 3.2 | Gráfico barras | Media |
| 7 | Análisis Financiero | 3.2 | Gráfico líneas | Media |
| 8 | Bandas Incertidumbre | 3.3 | Gráfico con bandas | Alta |
| 9 | Arquitectura | 2.4 | Diagrama | Media |

---

## NOTAS IMPORTANTES

1. **Todas las figuras deben estar en color** (según especificaciones del formato)

2. **Formato de inserción en el paper**:
   ```
   [Línea separadora]
   
   [FIGURA CENTRADA]
   
   [Leyenda en ARIAL 9, cursiva, centrada]
   Figura X. Descripción de la figura. [Elaboración propia]
   
   [Línea separadora]
   ```

3. **Referencias en el texto**: Cuando menciones una figura, usa "Figura 1", "Figura 2", etc.

4. **Prioridad**: Las figuras marcadas con "Alta" prioridad son las más importantes para el paper.

5. **Tamaño**: Las figuras deben ser claras y legibles, pero no ocupar más de media página cada una.

