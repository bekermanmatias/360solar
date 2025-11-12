# 📉 INSTRUCCIONES: FIGURA 8 - BANDAS DE INCERTIDUMBRE

## 🎯 ¿Qué necesitas?

1. **Python instalado** (versión 3.7 o superior)
2. **Librerías Python**: matplotlib, numpy
3. **Datos del caso de prueba**: Energía anual y RMSE del modelo

---

## 📦 PASO 1: Instalar librerías (si no las tienes)

Abre la terminal/consola y ejecuta:

```bash
pip install matplotlib numpy
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
   python generar_figura8_bandas_incertidumbre.py
   ```

### Opción B: Usar datos reales del simulador

Si quieres usar datos reales del caso de prueba:

1. **Abre tu simulador** en el navegador
2. **Configura el caso de prueba de casa familiar**:
   - Consumo: 300 kWh/mes
   - Inclinación: 30°
   - Ubicación: La Plata
   - Calcula el dimensionamiento
3. **Anota los valores**:
   - Energía anual total
   - Incertidumbre anual (si se muestra)
4. **Reemplaza los valores** en el script:
   ```python
   energia_anual = 3605  # Tu valor real (kWh)
   rmse = 5.8           # RMSE del modelo (W)
   ```

---

## ✅ PASO 3: Verificar resultados

Después de ejecutar, deberías ver:

```
📉 Generando Figura 8: Bandas de Incertidumbre...
   → Energía anual estimada: 3605 kWh
   → Incertidumbre (±): 180 kWh
   → Rango de confianza 95%: 3425 - 3785 kWh
   → Creando gráfico...
   → Guardando imágenes...

✅ ¡Figura 8 generada exitosamente!
   → Archivos guardados:
      • Figura8_BandasIncertidumbre.png (300 DPI)
      • Figura8_BandasIncertidumbre.pdf
```

Y se crearán dos archivos en la carpeta:
- `Figura8_BandasIncertidumbre.png` (imagen de alta resolución)
- `Figura8_BandasIncertidumbre.pdf` (formato vectorial)

---

## 🎨 ¿Cómo se ve la figura?

La figura muestra:

### **Banda de Incertidumbre (Naranja)**
- Área sombreada que representa el intervalo de confianza del 95%
- Rango entre el límite inferior y superior
- Transparencia para ver la línea central

### **Línea Central (Azul)**
- Energía anual estimada (3.605 kWh)
- Línea gruesa con marcadores
- Valor central de la estimación

### **Límites Superior e Inferior (Rojo punteado)**
- Límite superior: Energía + Incertidumbre
- Límite inferior: Energía - Incertidumbre
- Líneas punteadas rojas

### **Elementos adicionales:**
- **Caja de información**: Muestra el rango y la incertidumbre
- **Leyenda**: Identifica cada elemento
- **Grid**: Líneas de referencia para facilitar la lectura

---

## 📊 ¿Qué muestra esta figura?

Esta figura demuestra:
- **Incertidumbre del modelo**: Cómo el RMSE se traduce en incertidumbre anual
- **Intervalo de confianza**: Rango donde se espera que esté la energía real (95% de confianza)
- **Precisión de la estimación**: Visualización clara de la variabilidad esperada
- **Aplicación práctica**: Útil para planificación y toma de decisiones

---

## 🔧 Solución de problemas

### Los valores no coinciden con el paper

**Solución**: El script usa valores del caso de prueba (casa familiar). Para ajustarlos:

```python
# Caso de prueba: casa familiar
energia_anual = 3605  # kWh
rmse = 5.8            # W

# Si quieres usar el caso de pequeña empresa:
energia_anual = 15840  # kWh (30 paneles)
rmse = 5.8             # W (mismo RMSE del modelo)
```

### La incertidumbre parece muy pequeña

**Solución**: Esto es correcto. El RMSE de 5,8 W es muy bajo, lo que resulta en una incertidumbre relativamente pequeña. Si quieres verificar el cálculo:

```python
# Ecuación (3) del paper:
# IC_95% = E_anual ± (RMSE × 1,96 × √(N_meses × dias))
incertidumbre = rmse * 1.96 * np.sqrt(12 * 30.4) / 1000  # En kWh
```

### Quiero mostrar múltiples casos

**Solución**: Puedes crear múltiples bandas:

```python
# Caso 1: Casa familiar
energia1 = 3605
incertidumbre1 = 180

# Caso 2: Pequeña empresa
energia2 = 15840
incertidumbre2 = 800  # Mayor porque más energía

# Crear dos bandas en el mismo gráfico
```

---

## 📝 Para el paper técnico

Una vez generada la figura:

1. **Inserta la imagen** en el paper donde dice:
   ```
   [INSERTAR FIGURA 8: Bandas de Incertidumbre - Elaboración propia]
   ```

2. **Agrega la leyenda** debajo de la figura:
   ```
   Figura 8. Bandas de incertidumbre para la estimación de generación anual. 
   El intervalo de confianza del 95% se calcula basado en el RMSE del modelo 
   (ecuación 3). [Elaboración propia]
   ```

3. **Formato de la leyenda** (según especificaciones):
   - Fuente: Arial 9pt
   - Estilo: Cursiva
   - Alineación: Centrada

---

## 📐 Ecuación utilizada

La figura se basa en la **ecuación (3)** del paper:

```
IC_95% = E_anual ± (RMSE × 1,96 × √(N_meses × dias))
```

Donde:
- **E_anual**: Energía anual estimada (kWh)
- **RMSE**: Error cuadrático medio del modelo (W)
- **1,96**: Factor para intervalo de confianza del 95%
- **N_meses**: 12 meses
- **dias**: Días promedio por mes (30,4)

---

## 💡 Personalización opcional

### Cambiar el nivel de confianza

Si quieres un intervalo del 90% en lugar del 95%:

```python
# Factor para 90% de confianza: 1.645
incertidumbre = rmse * 1.645 * np.sqrt(n_meses * dias_promedio) / 1000
```

### Agregar más información

Puedes agregar texto adicional:

```python
info_text = f'Caso: Casa Familiar en La Plata\n'
info_text += f'Rango: {energia_inferior:.0f} - {energia_superior:.0f} kWh\n'
info_text += f'Incertidumbre: ±{incertidumbre_kwh:.0f} kWh'
```

### Cambiar colores

```python
# Banda de incertidumbre
color='orange'  # Cambia a 'blue', 'green', etc.

# Línea central
'b-'  # Cambia 'b' (azul) a 'r' (rojo), 'g' (verde), etc.
```

---

## 🔗 Relación con otras figuras

- **Figura 5**: Muestra que el RMSE es bajo (5,8 W)
- **Figura 6**: Muestra la generación mensual estimada
- **Figura 8**: Muestra la incertidumbre de esa estimación anual

Esta figura complementa las anteriores mostrando la **confiabilidad** de las estimaciones.

---

## 📊 Datos del caso de prueba (referencia)

Según el paper técnico:
- **Casa familiar en La Plata**
- **Energía anual estimada**: 3.605 kWh
- **RMSE del modelo**: 5,8 W
- **Incertidumbre calculada**: ±180 kWh
- **Rango de confianza 95%**: 3.425 - 3.785 kWh

---

¿Necesitas ayuda? ¡Pregunta!

