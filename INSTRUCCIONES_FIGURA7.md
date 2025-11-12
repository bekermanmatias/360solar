# 💰 INSTRUCCIONES: FIGURA 7 - ANÁLISIS FINANCIERO (5 AÑOS)

## 🎯 Método recomendado: Captura directa del simulador

**Ventajas:**
- ✅ Datos 100% reales y precisos
- ✅ Mismo estilo visual que la aplicación
- ✅ Más rápido (no requiere Python)
- ✅ Muestra el análisis financiero exacto del caso de prueba

---

## 🚀 PASO 1: Abrir el simulador

1. **Abre tu simulador** en Vercel o localmente
2. Navega a la sección **"Simulador"**

---

## 📍 PASO 2: Configurar el caso de prueba (La Plata)

### **Caso de Prueba: Pequeña Empresa en La Plata**

1. **Parámetros del Sistema:**
   - **Inclinación de Paneles**: 35°
   - **Consumo Mensual**: 1.200 kWh
   - **Precio por kWh**: 180 ARS
   - **Tipo de Panel**: High Efficiency 350W - $380.000

2. **Datos Climáticos:**
   - Haz clic en **"Seleccionar Ubicación en el Mapa"**
   - Busca y selecciona **"La Plata, Buenos Aires, Argentina"**
   - O ingresa coordenadas: **-34.9215°, -57.9545°**
   - Espera a que se carguen los datos de **NASA POWER** automáticamente
   - **Nota**: Si los datos de PSH no son exactamente 6,0 horas, puedes ajustarlos manualmente en "Modo Experto" o usar los valores que proporciona NASA POWER para La Plata

3. **Calcular:**
   - Haz clic en **"Calcular Dimensionamiento"**
   - Espera a que se generen los resultados

---

## 📸 PASO 3: Capturar el gráfico

### **Método A: Captura del gráfico específico (RECOMENDADO)**

1. **Ubica el gráfico** "Análisis Financiero (5 años)" en la sección de resultados
2. **Desplázate hacia abajo** si es necesario para ver el gráfico completo
3. **Usa una herramienta de captura:**
   - **Windows**: `Win + Shift + S` → Selecciona solo el área del gráfico
   - **Extensión de navegador**: "Nimbus Screenshot" o "Awesome Screenshot"
   - **Snipping Tool**: Herramienta nativa de Windows
4. **Asegúrate de que se vean las 3 líneas:**
   - ✅ **Línea roja**: Inversión Inicial
   - ✅ **Línea verde**: Ahorros Acumulados
   - ✅ **Línea azul**: Flujo Neto Acumulado
   - ✅ Ejes con etiquetas (Tiempo, Dinero)
   - ✅ Leyenda con las 3 líneas identificadas
   - ✅ Valores en el gráfico (si están visibles)

### **Método B: Captura de pantalla completa**

1. Toma una captura de toda la sección de resultados
2. Recorta solo el área del gráfico "Análisis Financiero (5 años)"
3. Asegúrate de mantener buena resolución

---

## ✂️ PASO 4: Editar la imagen (opcional)

1. **Abre la captura** en Paint, GIMP, Photoshop, etc.
2. **Recorta** para mostrar solo el gráfico
3. **Ajusta el tamaño** si es necesario (máximo ancho: 800-1200px)
4. **Verifica que sea legible**: líneas, valores, etiquetas, leyenda

---

## 💾 PASO 5: Guardar

1. Guarda como: **`Figura7_AnalisisFinanciero.png`**
2. **Resolución**: Mínimo 300 DPI (si es posible)
3. **Formato**: PNG (mejor calidad) o JPG de alta calidad

---

## 📊 Datos esperados (referencia)

Con La Plata como ubicación y los parámetros del caso de prueba de pequeña empresa, deberías obtener aproximadamente:
- **Paneles recomendados**: 30 paneles
- **Potencia instalada**: ~10,5 kW
- **Generación anual**: ~15.840 kWh
- **Inversión**: ~$11.400.000 ARS (30 paneles × $380.000)
- **Ahorro anual**: ~$2.851.200 ARS (15.840 kWh × $180/kWh)
- **ROI**: ~4,0 años
- **Flujo neto a 5 años**: Positivo (proyecto rentable)

---

## ✅ PASO 3: Verificar resultados

Después de ejecutar, deberías ver:

```
💰 Generando Figura 7: Análisis Financiero (5 años)...
   → Inversión inicial: $3,040,000 ARS
   → Ahorro anual: $648,900 ARS
   → ROI: 4.7 años
   → Punto de equilibrio: Año 5
   → Creando gráfico...
   → Guardando imágenes...

✅ ¡Figura 7 generada exitosamente!
   → Archivos guardados:
      • Figura7_AnalisisFinanciero.png (300 DPI)
      • Figura7_AnalisisFinanciero.pdf
```

Y se crearán dos archivos en la carpeta:
- `Figura7_AnalisisFinanciero.png` (imagen de alta resolución)
- `Figura7_AnalisisFinanciero.pdf` (formato vectorial)

---

## 🎨 ¿Cómo se ve la figura?

La figura muestra **3 líneas** en un gráfico de líneas:

### **Línea Roja: Inversión Inicial**
- Horizontal en valor negativo (Año 0)
- Representa el gasto inicial
- Marca cuadrada

### **Línea Verde: Ahorros Acumulados**
- Línea ascendente desde Año 0
- Muestra el crecimiento de ahorros año a año
- Marca circular

### **Línea Azul: Flujo Neto Acumulado**
- Comienza en negativo (inversión inicial)
- Cruza el cero en el punto de equilibrio (ROI)
- Termina en positivo (ganancia neta)
- Área sombreada azul cuando es positivo
- Marca triangular

### **Elementos adicionales:**
- **Línea negra punteada** en y=0 (punto de equilibrio)
- **Marcador especial** en el punto de equilibrio
- **Anotación** indicando el año de equilibrio
- **Caja de información** con datos clave

---

## 📊 ¿Qué muestra esta figura?

Esta figura demuestra:
- **Punto de equilibrio (ROI)**: Cuándo se recupera la inversión
- **Crecimiento de ahorros**: Cómo aumentan los ahorros año a año
- **Flujo neto**: Balance total (inversión + ahorros)
- **Viabilidad financiera**: Si el proyecto es rentable a 5 años
- **Visualización clara**: Fácil de entender para no técnicos

---

## 🔧 Solución de problemas

### Los valores no coinciden con el paper

**Solución**: El script usa valores del caso de prueba. Para ajustarlos:

```python
# Caso de prueba: casa familiar
inversion_inicial = -3040000  # 8 paneles × $380.000
ahorro_anual = 648900         # 3.605 kWh × $180/kWh

# Caso de prueba: pequeña empresa
inversion_inicial = -11400000  # 30 paneles × $380.000
ahorro_anual = 2851200         # 15.840 kWh × $180/kWh
```

### El punto de equilibrio no se marca

**Solución**: Si el ROI es mayor a 5 años, el marcador no aparecerá. Puedes:
1. Aumentar el rango de años: cambiar `range(6)` a `range(7)` o más
2. O ajustar el umbral en el código

### Quiero cambiar el formato de moneda

**Solución**: Modifica la función `format_money`:

```python
def format_money(value, _):
    # Formato con millones
    if abs(value) >= 1000000:
        return f'${value/1000000:.1f}M'
    else:
        return f'${value/1000:.0f}K'
```

### Los colores no se ven bien

**Solución**: Puedes cambiar los colores:

```python
# Línea de inversión
ax.plot(..., 'r-', ...)  # Cambia 'r' a 'c' (cyan), 'm' (magenta), etc.

# Línea de ahorros
ax.plot(..., 'g-', ...)  # Cambia 'g' a otro color

# Línea de flujo neto
ax.plot(..., 'b-', ...)  # Cambia 'b' a otro color
```

---

## 📝 Para el paper técnico

Una vez generada la figura:

1. **Inserta la imagen** en el paper donde dice:
   ```
   [INSERTAR FIGURA 7: Análisis Financiero (5 años) - Elaboración propia]
   ```

2. **Agrega la leyenda** debajo de la figura:
   ```
   Figura 7. Proyección financiera a 5 años para el caso de prueba de pequeña 
   empresa en La Plata (30 paneles, 10,5 kW). Muestra el punto de equilibrio 
   (ROI de 4,0 años) y la evolución de ahorros acumulados. [Elaboración propia]
   ```

3. **Formato de la leyenda** (según especificaciones):
   - Fuente: Arial 9pt
   - Estilo: Cursiva
   - Alineación: Centrada

---

## 💡 OPCIÓN ALTERNATIVA: Script Python (si prefieres más control)

Si quieres recrear el gráfico con Python para tener más control sobre el formato:

1. **Anota los valores** del simulador para el caso de pequeña empresa:
   - Inversión total (debería ser ~$11.400.000 ARS)
   - Ahorro anual (debería ser ~$2.851.200 ARS)
2. **Usa el script** `generar_figura7_analisis_financiero.py`
3. **Reemplaza los valores** en el script:
   ```python
   inversion_inicial = -11400000  # 30 paneles × $380.000
   ahorro_anual = 2851200         # 15.840 kWh × $180/kWh
   ```

**Cuándo usar esta opción:**
- Si necesitas ajustar colores, tamaños, o formato específico
- Si quieres agregar elementos adicionales (anotaciones, etc.)
- Si la captura no tiene suficiente calidad

---

## 🔗 Relación con otras figuras

- **Figura 6**: Muestra la generación mensual (aspecto técnico)
- **Figura 7**: Muestra el análisis financiero (aspecto económico)
- Ambas figuras complementan el caso de prueba mostrando diferentes perspectivas

---

## 📊 Datos del caso de prueba (referencia)

Según el paper técnico:
- **Pequeña empresa**
- **Consumo**: 1.200 kWh por mes
- **PSH promedio**: 6,0 horas por día
- **Temperatura promedio**: 25°C
- **Inclinación**: 35°
- **Paneles recomendados**: 30 paneles
- **Potencia instalada**: 10,5 kW
- **Generación anual**: 15.840 kWh
- **Inversión**: 11.400.000 pesos argentinos (30 paneles × $380.000)
- **Ahorro anual**: 2.851.200 pesos argentinos (15.840 kWh × $180/kWh)
- **ROI**: 4,0 años
- **Flujo neto a 5 años**: Positivo (proyecto rentable)

---

## 💡 Personalización opcional

### Agregar más años

Si quieres mostrar 10 años en lugar de 5:

```python
anos = ['Año 0', 'Año 1', ..., 'Año 10']  # Extiende la lista
# Ajusta los cálculos para 10 años
```

### Agregar inflación

Si quieres considerar inflación:

```python
tasa_inflacion = 0.20  # 20% anual
ahorro_anual_ajustado = ahorro_anual * (1 + tasa_inflacion) ** año
```

### Agregar degradación de paneles

Si quieres considerar pérdida de eficiencia:

```python
degradacion_anual = 0.005  # 0.5% anual
ahorro_anual_ajustado = ahorro_anual * (1 - degradacion_anual) ** año
```

---

¿Necesitas ayuda? ¡Pregunta!

