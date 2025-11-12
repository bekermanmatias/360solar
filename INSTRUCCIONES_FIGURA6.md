# 📅 INSTRUCCIONES: FIGURA 6 - GRÁFICA DE GENERACIÓN MENSUAL (CASO DE PRUEBA)

## 🎯 Método recomendado: Captura directa del simulador

**Ventajas:**
- ✅ Datos 100% reales y precisos
- ✅ Mismo estilo visual que la aplicación
- ✅ Más rápido (no requiere Python)
- ✅ Muestra datos reales de NASA POWER para La Plata

---

## 🚀 PASO 1: Abrir el simulador

1. **Abre tu simulador** en Vercel o localmente
2. Navega a la sección **"Simulador"**

---

## 📍 PASO 2: Configurar el caso de prueba (La Plata)

### **Caso de Prueba: Casa Familiar en La Plata**

1. **Parámetros del Sistema:**
   - **Inclinación de Paneles**: 30°
   - **Consumo Mensual**: 300 kWh
   - **Precio por kWh**: 180 ARS
   - **Tipo de Panel**: High Efficiency 350W - $380.000

2. **Datos Climáticos:**
   - Haz clic en **"Seleccionar Ubicación en el Mapa"**
   - Busca y selecciona **"La Plata, Buenos Aires, Argentina"**
   - O ingresa coordenadas: **-34.9215°, -57.9545°**
   - Espera a que se carguen los datos de **NASA POWER** automáticamente
   - Los datos mensuales se llenarán automáticamente con valores reales

3. **Calcular:**
   - Haz clic en **"Calcular Dimensionamiento"**
   - Espera a que se generen los resultados

---

## 📸 PASO 3: Capturar el gráfico

### **Método A: Captura del gráfico específico (RECOMENDADO)**

1. **Ubica el gráfico** "Generación Mensual Estimada" en la sección de resultados
2. **Usa una herramienta de captura:**
   - **Windows**: `Win + Shift + S` → Selecciona solo el área del gráfico
   - **Extensión de navegador**: "Nimbus Screenshot" o "Awesome Screenshot"
   - **Snipping Tool**: Herramienta nativa de Windows
3. **Asegúrate de que se vea:**
   - ✅ Título del gráfico
   - ✅ Ejes con etiquetas (Mes, Energía Generada en kWh)
   - ✅ Las 12 barras mensuales
   - ✅ Valores en las barras (si están visibles)
   - ✅ Leyenda (si está visible)

### **Método B: Captura de pantalla completa**

1. Toma una captura de toda la sección de resultados
2. Recorta solo el área del gráfico "Generación Mensual"
3. Asegúrate de mantener buena resolución

---

## ✂️ PASO 4: Editar la imagen (opcional)

1. **Abre la captura** en Paint, GIMP, Photoshop, etc.
2. **Recorta** para mostrar solo el gráfico
3. **Ajusta el tamaño** si es necesario (máximo ancho: 800-1000px)
4. **Verifica que sea legible**: textos, valores, etiquetas

---

## 💾 PASO 5: Guardar

1. Guarda como: **`Figura6_GeneracionMensual.png`**
2. **Resolución**: Mínimo 300 DPI (si es posible)
3. **Formato**: PNG (mejor calidad) o JPG de alta calidad

---

## 📊 Datos esperados (referencia)

Con La Plata como ubicación y los parámetros del caso de prueba, deberías obtener aproximadamente:
- **Paneles recomendados**: 8-9 paneles
- **Potencia instalada**: ~2.8-3.15 kW
- **Generación anual**: ~3.000-3.600 kWh
- **Variación estacional**: Mayor en verano (dic-ene-feb), menor en invierno (jun-jul)

---

## ✅ PASO 3: Verificar resultados

Después de ejecutar, deberías ver:

```
📅 Generando Figura 6: Gráfica de Generación Mensual (Caso de Prueba)...
   → Generación anual total: 3020 kWh
   → Promedio mensual: 251.7 kWh
   → Creando gráfico...
   → Guardando imágenes...

✅ ¡Figura 6 generada exitosamente!
   → Archivos guardados:
      • Figura6_GeneracionMensual.png (300 DPI)
      • Figura6_GeneracionMensual.pdf
```

Y se crearán dos archivos en la carpeta:
- `Figura6_GeneracionMensual.png` (imagen de alta resolución)
- `Figura6_GeneracionMensual.pdf` (formato vectorial)

---

## 🎨 ¿Cómo se ve la figura?

La figura muestra:
- **12 barras** (una por cada mes del año)
- **Colores diferenciados**:
  - Amarillo intenso: Verano (Dic, Ene, Feb, Nov)
  - Amarillo dorado: Transición (Mar, Abr, Ago, Sep, Oct)
  - Naranja: Invierno (May, Jun, Jul)
- **Valores numéricos** en cada barra
- **Línea de promedio anual** (roja punteada)
- **Total anual** en la esquina inferior derecha
- **Variabilidad estacional** claramente visible

---

## 📊 ¿Qué muestra esta figura?

Esta figura demuestra:
- **Variabilidad estacional**: Mayor generación en verano, menor en invierno
- **Patrón típico de Argentina**: Invierno con menor irradiación solar
- **Datos del caso de prueba**: 8 paneles, 2.8 kW, generación anual de ~3.605 kWh
- **Distribución mensual**: Cómo se distribuye la generación a lo largo del año

---

## 🔧 Solución de problemas

### Los valores no coinciden con el paper

**Solución**: El script usa valores aproximados. Para usar valores exactos:

1. Calcula el caso de prueba en tu simulador
2. Anota los valores mensuales del gráfico
3. Reemplázalos en el script:
   ```python
   generacion_kwh = [
       350,  # Enero (tu valor real)
       320,  # Febrero (tu valor real)
       # ... etc
   ]
   ```

### Quiero usar datos de otro caso de prueba

**Solución**: Modifica los valores y el título:

```python
# Para el caso de pequeña empresa (30 paneles)
generacion_kwh = [
    1500,  # Enero
    1400,  # Febrero
    # ... etc
]

ax.set_title('Generación Mensual - Pequeña Empresa (30 paneles, 10.5 kW)', ...)
```

### Los colores no se ven bien

**Solución**: Puedes cambiar los colores:

```python
# Todos amarillos
colores = ['#FDB813'] * 12

# O colores personalizados
colores = ['#FDB813', '#FFD700', '#FFA500', ...]  # Uno por mes
```

---

## 📝 Para el paper técnico

Una vez generada la figura:

1. **Inserta la imagen** en el paper donde dice:
   ```
   [INSERTAR FIGURA 6: Gráfica de Generación Mensual (Caso de Prueba) - Elaboración propia]
   ```

2. **Agrega la leyenda** debajo de la figura:
   ```
   Figura 6. Generación mensual estimada para el caso de prueba 
   (casa familiar, 8 paneles). Se observa mayor generación en verano 
   y menor en invierno. [Elaboración propia]
   ```

3. **Formato de la leyenda** (según especificaciones):
   - Fuente: Arial 9pt
   - Estilo: Cursiva
   - Alineación: Centrada

---

## 💡 OPCIÓN ALTERNATIVA: Script Python (si prefieres más control)

Si quieres recrear el gráfico con Python para tener más control sobre el formato:

1. **Anota los valores mensuales** del gráfico del simulador
2. **Usa el script** `generar_figura6_generacion_mensual.py`
3. **Reemplaza los valores** con los datos reales de La Plata

**Cuándo usar esta opción:**
- Si necesitas ajustar colores, tamaños, o formato específico
- Si quieres agregar elementos adicionales (líneas de referencia, etc.)
- Si la captura no tiene suficiente calidad

---

## 🔗 Relación con otras figuras

- **Figura 4**: Muestra la interfaz completa del simulador
- **Figura 6**: Muestra un resultado específico (generación mensual)
- **Figura 7**: Muestra el análisis financiero del mismo caso

Estas figuras complementan el caso de prueba mostrando diferentes aspectos.

---

## 📊 Datos del caso de prueba (referencia)

Según el paper técnico:
- **Casa familiar urbana**
- **Consumo**: 300 kWh/mes
- **PSH promedio**: 5,2 horas/día
- **Temperatura promedio**: 22°C
- **Inclinación**: 30°
- **Paneles recomendados**: 8
- **Potencia instalada**: 2,8 kW
- **Generación anual**: 3.605 kWh

---

¿Necesitas ayuda? ¡Pregunta!

