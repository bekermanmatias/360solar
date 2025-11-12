# 📈 INSTRUCCIONES: FIGURA 2 - SCATTER PLOT (IRRADIANCIA VS GENERACIÓN)

## 🎯 ¿Qué necesitas?

1. **Python instalado** (versión 3.7 o superior)
2. **Librerías Python**: pandas, matplotlib, numpy, scipy
3. **El archivo CSV**: `01 - Generacion FV.csv` (debe estar en la misma carpeta)

---

## 📦 PASO 1: Instalar librerías (si no las tienes)

Abre la terminal/consola y ejecuta:

```bash
pip install pandas matplotlib numpy scipy
```

O si usas conda:

```bash
conda install pandas matplotlib numpy scipy
```

---

## 🚀 PASO 2: Ejecutar el script

### Opción A: Desde la terminal

1. Abre la terminal/consola
2. Navega a la carpeta del proyecto:
   ```bash
   cd "C:\Users\beker\OneDrive\Escritorio\Repositorios\360solar"
   ```
3. Ejecuta el script:
   ```bash
   python generar_figura2_scatter_plot.py
   ```

### Opción B: Desde un editor (VS Code, PyCharm, etc.)

1. Abre el archivo `generar_figura2_scatter_plot.py`
2. Haz clic derecho → "Run Python File" o presiona F5
3. O ejecuta desde la terminal integrada

---

## ✅ PASO 3: Verificar resultados

Después de ejecutar, deberías ver:

```
📈 Generando Figura 2: Scatter Plot - Irradiancia vs Generación...
   → Leyendo dataset...
   → Filtrando observaciones válidas...
   → Total de observaciones válidas: 3124
   → Correlación calculada: 0.985
   → Creando gráfico...
   → Calculando línea de tendencia...
   → Guardando imágenes...

✅ ¡Figura 2 generada exitosamente!
   → Archivos guardados:
      • Figura2_ScatterPlot.png (300 DPI)
      • Figura2_ScatterPlot.pdf

📊 Estadísticas:
   → Correlación (r): 0.985
   → Observaciones: 3124
   → Irradiancia: 0.0 - 1000.0 W/m²
   → Generación: 0.0 - 200.0 W
```

Y se crearán dos archivos en la carpeta:
- `Figura2_ScatterPlot.png` (imagen de alta resolución)
- `Figura2_ScatterPlot.pdf` (formato vectorial)

---

## 🎨 ¿Cómo se ve la figura?

La figura mostrará:
- **Puntos azules** dispersos: cada punto representa una observación (irradiancia vs generación)
- **Línea roja punteada**: línea de tendencia que muestra la relación lineal
- **Eje X**: Irradiancia Solar (W/m²)
- **Eje Y**: Generación Fotovoltaica (W)
- **Caja de texto**: muestra el valor de correlación (r = 0,985)
- **Grid**: líneas de referencia para facilitar la lectura

---

## 📊 ¿Qué muestra esta figura?

Esta figura demuestra visualmente:
- **Relación lineal fuerte** entre irradiancia y generación
- **Correlación de 0,985**: muy alta, casi perfecta
- **Distribución de datos**: cómo se distribuyen las observaciones
- **Tendencia positiva**: a mayor irradiancia, mayor generación

---

## 🔧 Solución de problemas

### Error: "No module named 'scipy'"
**Solución**: Instala scipy:
```bash
pip install scipy
```

### Error: "FileNotFoundError: '01 - Generacion FV.csv'"
**Solución**: Asegúrate de que:
1. El archivo CSV está en la misma carpeta que el script
2. El nombre del archivo es exactamente: `01 - Generacion FV.csv`

### Los puntos se ven muy juntos
**Solución**: Esto es normal con 3.124 observaciones. El script usa transparencia (alpha=0.4) para mostrar la densidad. Si quieres ver mejor, puedes:
- Aumentar el tamaño de puntos: cambiar `s=15` a `s=20` o más
- Reducir transparencia: cambiar `alpha=0.4` a `alpha=0.6`

### La línea de tendencia no se ve
**Solución**: Verifica que la línea roja punteada esté visible. Si no, ajusta:
```python
ax.plot(x_tendencia, y_tendencia, 
        "r--",                  # Cambia "r--" a "r-" para línea sólida
        linewidth=2.5,          # Aumenta a 3.0 si no se ve
```

---

## 📝 Para el paper técnico

Una vez generada la figura:

1. **Inserta la imagen** en el paper donde dice:
   ```
   [INSERTAR FIGURA 2: Scatter Plot - Irradiancia vs Generación - Elaboración propia]
   ```

2. **Agrega la leyenda** debajo de la figura:
   ```
   Figura 2. Relación entre irradiancia solar y generación fotovoltaica. 
   Se observa una relación lineal fuerte (r = 0,985). [Elaboración propia]
   ```

3. **Formato de la leyenda** (según especificaciones):
   - Fuente: Arial 9pt
   - Estilo: Cursiva
   - Alineación: Centrada

---

## 💡 Personalización opcional

Si quieres ajustar el gráfico, puedes modificar:

### Cambiar color de puntos
```python
c='#3498db',  # Cambia a '#2ecc71' (verde) o '#e74c3c' (rojo)
```

### Cambiar tamaño de puntos
```python
s=15,  # Aumenta a 20 o 25 para puntos más grandes
```

### Cambiar estilo de línea de tendencia
```python
"r--",  # Línea punteada roja
"r-",   # Línea sólida roja
"b-",   # Línea sólida azul
```

### Agregar más información
Puedes agregar estadísticas adicionales en el texto:
```python
textstr = f'r = {correlacion:.3f}\nN = {len(df_validas)}'
```

---

## 🔗 Relación con la Figura 1

- **Figura 1**: Muestra la matriz de correlación completa (todas las variables)
- **Figura 2**: Muestra en detalle la relación más importante (irradiancia vs generación)

Ambas figuras complementan el análisis exploratorio de datos.

---

¿Necesitas ayuda? ¡Pregunta!

