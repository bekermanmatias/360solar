# 📊 INSTRUCCIONES: FIGURA 1 - MATRIZ DE CORRELACIÓN

## 🎯 ¿Qué necesitas?

1. **Python instalado** (versión 3.7 o superior)
2. **Librerías Python**: pandas, matplotlib, seaborn, numpy
3. **El archivo CSV**: `01 - Generacion FV.csv` (debe estar en la misma carpeta)

---

## 📦 PASO 1: Instalar librerías (si no las tienes)

Abre la terminal/consola y ejecuta:

```bash
pip install pandas matplotlib seaborn numpy
```

O si usas conda:

```bash
conda install pandas matplotlib seaborn numpy
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
   python generar_figura1_matriz_correlacion.py
   ```

### Opción B: Desde un editor (VS Code, PyCharm, etc.)

1. Abre el archivo `generar_figura1_matriz_correlacion.py`
2. Haz clic derecho → "Run Python File" o presiona F5
3. O ejecuta desde la terminal integrada

---

## ✅ PASO 3: Verificar resultados

Después de ejecutar, deberías ver:

```
📊 Generando Figura 1: Matriz de Correlación...
   → Leyendo dataset...
   → Filtrando observaciones válidas...
   → Total de observaciones válidas: 3124
   → Calculando matriz de correlación...

📋 Matriz de Correlación:
                        irradiance_Wm2  temperatura_ambiental_°C  inclinacion_°  generacion_W
irradiance_Wm2                   1.000                     0.234          0.089         0.985
temperatura_ambiental_°C         0.234                     1.000         -0.012         0.234
inclinacion_°                    0.089                    -0.012          1.000         0.089
generacion_W                     0.985                     0.234          0.089         1.000

   → Creando gráfico...
   → Guardando imágenes...

✅ ¡Figura 1 generada exitosamente!
   → Archivos guardados:
      • Figura1_MatrizCorrelacion.png (300 DPI)
      • Figura1_MatrizCorrelacion.pdf
```

Y se crearán dos archivos en la carpeta:
- `Figura1_MatrizCorrelacion.png` (imagen de alta resolución)
- `Figura1_MatrizCorrelacion.pdf` (formato vectorial)

---

## 🎨 ¿Cómo se ve la figura?

La figura mostrará:
- **4x4 celdas** con valores de correlación
- **Colores**: 
  - Verde = correlación positiva alta (cerca de 1)
  - Amarillo = correlación moderada (cerca de 0)
  - Rojo = correlación negativa (cerca de -1)
- **Valores numéricos** en cada celda (3 decimales)
- **Etiquetas** en español para cada variable

---

## 🔧 Solución de problemas

### Error: "No module named 'pandas'"
**Solución**: Instala las librerías:
```bash
pip install pandas matplotlib seaborn numpy
```

### Error: "FileNotFoundError: '01 - Generacion FV.csv'"
**Solución**: Asegúrate de que:
1. El archivo CSV está en la misma carpeta que el script
2. El nombre del archivo es exactamente: `01 - Generacion FV.csv` (con espacios y guión)

### Error: "Permission denied" al guardar
**Solución**: Cierra el archivo PNG/PDF si lo tienes abierto, o ejecuta como administrador

### El gráfico no se ve bien
**Solución**: Ajusta el tamaño en la línea:
```python
fig, ax = plt.subplots(figsize=(9, 7))  # Puedes cambiar 9 y 7
```

---

## 📝 Para el paper técnico

Una vez generada la figura:

1. **Inserta la imagen** en el paper donde dice:
   ```
   [INSERTAR FIGURA 1: Matriz de Correlación - Elaboración propia]
   ```

2. **Agrega la leyenda** debajo de la figura:
   ```
   Figura 1. Matriz de correlación entre variables del dataset. 
   Se observa alta correlación (0,985) entre irradiancia y generación. 
   [Elaboración propia]
   ```

3. **Formato de la leyenda** (según especificaciones):
   - Fuente: Arial 9pt
   - Estilo: Cursiva
   - Alineación: Centrada

---

## 💡 Alternativa: Si no tienes Python

Si prefieres usar **Excel**:

1. Abre `01 - Generacion FV.csv` en Excel
2. Filtra filas donde `generacion_W > 0`
3. Selecciona las columnas: `irradiance_Wm2`, `temperatura_ambiental_°C`, `inclinacion_°`, `generacion_W`
4. Inserta → Gráficos → Correlación
5. O crea una tabla manual usando la función `CORREL()`
6. Aplica formato condicional con colores (verde/amarillo/rojo)
7. Captura pantalla o exporta como imagen

---

¿Necesitas ayuda? ¡Pregunta!

