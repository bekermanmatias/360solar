# GUÍA PASO A PASO: CONSTRUCCIÓN DE FIGURAS PARA EL PAPER TÉCNICO

Esta guía te explica cómo crear cada figura usando tus datos y herramientas disponibles.

---

## 🛠️ HERRAMIENTAS RECOMENDADAS

- **Python + Matplotlib/Seaborn**: Para gráficos estadísticos (Figuras 1, 2, 5, 6, 7, 8)
- **Excel/Google Sheets**: Alternativa simple para gráficos básicos
- **draw.io (diagrams.net)**: Para diagramas de flujo y arquitectura (Figuras 3, 9)
- **Captura de pantalla**: Para la interfaz del simulador (Figura 4)
- **PowerPoint/Canva**: Alternativa para diagramas si prefieres

---

## 📊 FIGURA 1: MATRIZ DE CORRELACIÓN

### **Método 1: Python (Recomendado)**

**Paso 1**: Crea un script Python (`generar_matriz_correlacion.py`):

```python
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Leer el dataset
df = pd.read_csv('01 - Generacion FV.csv', sep=';', decimal=',')

# Filtrar solo observaciones válidas
df_validas = df[df['generacion_W'] > 0].copy()

# Seleccionar variables numéricas para correlación
variables = ['irradiance_Wm2', 'temperatura_ambiental_°C', 'inclinacion_°', 'generacion_W']
df_corr = df_validas[variables]

# Calcular matriz de correlación
matriz_corr = df_corr.corr()

# Configurar estilo
plt.figure(figsize=(8, 6))
sns.heatmap(matriz_corr, 
            annot=True,  # Mostrar valores
            fmt='.3f',   # 3 decimales
            cmap='RdYlGn',  # Colores: rojo-amarillo-verde
            center=0,
            square=True,
            linewidths=1,
            cbar_kws={"shrink": 0.8},
            vmin=-1, vmax=1)

# Etiquetas más legibles
plt.xticks([0.5, 1.5, 2.5, 3.5], 
           ['Irradiancia\n(W/m²)', 'Temperatura\n(°C)', 'Inclinación\n(°)', 'Generación\n(W)'],
           fontsize=10)
plt.yticks([0.5, 1.5, 2.5, 3.5], 
           ['Irradiancia\n(W/m²)', 'Temperatura\n(°C)', 'Inclinación\n(°)', 'Generación\n(W)'],
           fontsize=10, rotation=0)

plt.title('Matriz de Correlación entre Variables', fontsize=12, fontweight='bold', pad=20)
plt.tight_layout()

# Guardar
plt.savefig('Figura1_MatrizCorrelacion.png', dpi=300, bbox_inches='tight')
plt.savefig('Figura1_MatrizCorrelacion.pdf', bbox_inches='tight')
print("✅ Figura 1 guardada como PNG y PDF")
```

**Paso 2**: Ejecuta el script:
```bash
python generar_matriz_correlacion.py
```

### **Método 2: Excel (Alternativa Simple)**

1. Abre el CSV en Excel
2. Selecciona las columnas: `irradiance_Wm2`, `temperatura_ambiental_°C`, `inclinacion_°`, `generacion_W`
3. Filtra filas donde `generacion_W > 0`
4. Inserta → Gráficos → Correlación (o usa la función CORREL)
5. Crea una tabla de correlaciones
6. Formatea con colores condicionales (verde para valores altos, rojo para bajos)

---

## 📈 FIGURA 2: SCATTER PLOT - IRRADIANCIA VS GENERACIÓN

### **Python (Recomendado)**

Crea `generar_scatter_plot.py`:

```python
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Leer y filtrar datos
df = pd.read_csv('01 - Generacion FV.csv', sep=';', decimal=',')
df_validas = df[df['generacion_W'] > 0].copy()

# Crear gráfico
plt.figure(figsize=(10, 6))

# Scatter plot
plt.scatter(df_validas['irradiance_Wm2'], 
            df_validas['generacion_W'],
            alpha=0.5,  # Transparencia
            s=10,       # Tamaño de puntos
            c='#3498db')  # Color azul

# Línea de tendencia
z = np.polyfit(df_validas['irradiance_Wm2'], df_validas['generacion_W'], 1)
p = np.poly1d(z)
plt.plot(df_validas['irradiance_Wm2'], 
         p(df_validas['irradiance_Wm2']), 
         "r--", 
         linewidth=2, 
         label=f'Tendencia lineal (r = 0,985)')

# Etiquetas y formato
plt.xlabel('Irradiancia Solar (W/m²)', fontsize=12, fontweight='bold')
plt.ylabel('Generación Fotovoltaica (W)', fontsize=12, fontweight='bold')
plt.title('Relación entre Irradiancia Solar y Generación Fotovoltaica', 
          fontsize=13, fontweight='bold', pad=15)
plt.grid(True, alpha=0.3, linestyle='--')
plt.legend(fontsize=10)

plt.tight_layout()
plt.savefig('Figura2_ScatterPlot.png', dpi=300, bbox_inches='tight')
plt.savefig('Figura2_ScatterPlot.pdf', bbox_inches='tight')
print("✅ Figura 2 guardada")
```

---

## 🔄 FIGURA 3: DIAGRAMA DE FLUJO DEL SIMULADOR

### **Método: draw.io (diagrams.net) - GRATIS Y FÁCIL**

**Paso 1**: Ve a https://app.diagrams.net/ (o descarga la app)

**Paso 2**: Crea un nuevo diagrama de flujo con estos elementos:

```
┌─────────────────────────────────┐
│  ENTRADA DE DATOS DEL USUARIO   │
│  • Configuración del sistema    │
│  • Datos climáticos mensuales   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  APLICACIÓN DEL MODELO OLS      │
│  (JavaScript en navegador)      │
│  • Cálculo generación mensual   │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  CÁLCULO DE DIMENSIONAMIENTO    │
│  • Número de paneles necesarios │
│  • Potencia instalada           │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  ANÁLISIS FINANCIERO            │
│  • Inversión inicial            │
│  • Ahorros estimados           │
│  • ROI                          │
└──────────────┬──────────────────┘
               │
               ▼
┌─────────────────────────────────┐
│  VISUALIZACIÓN DE RESULTADOS    │
│  • Gráficas interactivas        │
│  • Métricas y resúmenes         │
└─────────────────────────────────┘
```

**Paso 3**: 
- Usa formas rectangulares para procesos
- Flechas para flujo
- Colores: amarillo para entrada, azul para procesos, verde para salida
- Fuente: Arial, tamaño 10-12

**Paso 4**: Exporta como PNG (300 DPI) y PDF

### **Alternativa: PowerPoint**
1. Insertar → Formas → Rectángulos y flechas
2. Crea el mismo flujo
3. Guarda como imagen PNG de alta resolución

---

## 📸 FIGURA 4: CAPTURA DE PANTALLA DEL SIMULADOR

### **Ya la tienes! Solo necesitas optimizarla:**

**Paso 1**: Toma una captura de pantalla completa del simulador funcionando
- Usa la herramienta de captura de Windows (Win + Shift + S)
- O usa herramientas como Snipping Tool, Lightshot, etc.

**Paso 2**: Edita la imagen:
- Recorta para mostrar solo la parte relevante
- Asegúrate de que se vean:
  - Panel de configuración (izquierda)
  - Resultados con gráficos (derecha)
  - Interfaz completa y profesional

**Paso 3**: Guarda como:
- `Figura4_CapturaSimulador.png` (alta resolución, 300 DPI)
- Formato: PNG o JPG de alta calidad

**Consejo**: Si quieres una captura más profesional:
- Abre el simulador en Vercel
- Usa herramientas como "Full Page Screen Capture" (extensión Chrome)
- O usa herramientas como Snagit, Greenshot

---

## 📊 FIGURA 5: COMPARACIÓN CON BENCHMARKS

### **Python (Recomendado)**

Crea `generar_comparacion_benchmarks.py`:

```python
import matplotlib.pyplot as plt
import numpy as np

# Datos de comparación
modelos = ['Nuestro\nModelo', 'PVWatts\n(NREL)', 'SolarGIS']
r2_medio = [0.970, 0.935, 0.915]  # Valores promedio
r2_min = [0.970, 0.92, 0.90]
r2_max = [0.970, 0.95, 0.93]

rmse_medio = [5.8, 10.0, 12.5]  # Valores promedio
rmse_min = [5.8, 8.0, 10.0]
rmse_max = [5.8, 12.0, 15.0]

# Crear figura con dos subplots
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(12, 5))

# Gráfico 1: R²
x = np.arange(len(modelos))
width = 0.6

# Barras con rangos (opcional, puedes usar solo valores medios)
bars1 = ax1.bar(x, r2_medio, width, 
                color=['#2ecc71', '#3498db', '#95a5a6'],
                edgecolor='black', linewidth=1.5)

# Agregar valores en las barras
for i, (bar, val) in enumerate(zip(bars1, r2_medio)):
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height + 0.01,
             f'{val:.3f}', ha='center', va='bottom', fontweight='bold')

ax1.set_ylabel('Coeficiente de Determinación (R²)', fontsize=11, fontweight='bold')
ax1.set_title('Comparación de R²', fontsize=12, fontweight='bold', pad=10)
ax1.set_xticks(x)
ax1.set_xticklabels(modelos, fontsize=10)
ax1.set_ylim([0.85, 1.0])
ax1.grid(True, alpha=0.3, axis='y', linestyle='--')

# Gráfico 2: RMSE
bars2 = ax2.bar(x, rmse_medio, width,
                color=['#2ecc71', '#3498db', '#95a5a6'],
                edgecolor='black', linewidth=1.5)

for i, (bar, val) in enumerate(zip(bars2, rmse_medio)):
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height + 0.3,
             f'{val:.1f} W', ha='center', va='bottom', fontweight='bold')

ax2.set_ylabel('RMSE (W)', fontsize=11, fontweight='bold')
ax2.set_title('Comparación de RMSE', fontsize=12, fontweight='bold', pad=10)
ax2.set_xticks(x)
ax2.set_xticklabels(modelos, fontsize=10)
ax2.set_ylim([0, 18])
ax2.grid(True, alpha=0.3, axis='y', linestyle='--')

plt.tight_layout()
plt.savefig('Figura5_ComparacionBenchmarks.png', dpi=300, bbox_inches='tight')
plt.savefig('Figura5_ComparacionBenchmarks.pdf', bbox_inches='tight')
print("✅ Figura 5 guardada")
```

### **Alternativa: Excel**
1. Crea una tabla con los valores
2. Insertar → Gráfico de barras
3. Formatea con colores (verde para tu modelo, azul/gris para otros)

---

## 📅 FIGURA 6: GRÁFICA DE GENERACIÓN MENSUAL

### **Método: Usar datos del simulador directamente**

**Opción A: Captura del gráfico del simulador**
1. Abre tu simulador en Vercel
2. Ingresa los datos del caso de prueba (casa familiar):
   - Consumo: 300 kWh/mes
   - Inclinación: 30°
   - PSH promedio: 5,2 horas
   - Temperatura: 22°C
3. Calcula el dimensionamiento
4. Toma captura del gráfico "Generación Mensual Estimada"
5. Recorta y guarda como `Figura6_GeneracionMensual.png`

**Opción B: Recrear en Python/Excel**

Si quieres más control, extrae los datos mensuales del simulador y crea el gráfico:

```python
import matplotlib.pyplot as plt
import numpy as np

# Datos mensuales (ejemplo - reemplaza con datos reales del simulador)
meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
generacion_kwh = [320, 280, 250, 200, 180, 150,  # Invierno (menor)
                  160, 200, 250, 300, 350, 380]  # Verano (mayor)

plt.figure(figsize=(12, 5))
bars = plt.bar(meses, generacion_kwh, 
               color='#f39c12', edgecolor='black', linewidth=1)

# Agregar valores en las barras
for bar, val in zip(bars, generacion_kwh):
    height = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2., height + 5,
             f'{int(val)}', ha='center', va='bottom', fontsize=9)

plt.xlabel('Mes', fontsize=12, fontweight='bold')
plt.ylabel('Energía Generada (kWh)', fontsize=12, fontweight='bold')
plt.title('Generación Mensual Estimada - Caso de Prueba (8 paneles)', 
          fontsize=13, fontweight='bold', pad=15)
plt.grid(True, alpha=0.3, axis='y', linestyle='--')
plt.ylim([0, max(generacion_kwh) * 1.15])

plt.tight_layout()
plt.savefig('Figura6_GeneracionMensual.png', dpi=300, bbox_inches='tight')
plt.savefig('Figura6_GeneracionMensual.pdf', bbox_inches='tight')
print("✅ Figura 6 guardada")
```

---

## 💰 FIGURA 7: ANÁLISIS FINANCIERO (5 AÑOS)

### **Método: Usar gráfico del simulador o recrear**

**Opción A: Captura del simulador**
1. En el simulador, después de calcular, toma captura del gráfico "Análisis Financiero (5 años)"
2. Asegúrate de que se vean las 3 líneas:
   - Inversión Inicial (roja)
   - Ahorros Acumulados (verde)
   - Flujo Neto Acumulado (azul)
3. Guarda como `Figura7_AnalisisFinanciero.png`

**Opción B: Recrear en Python**

```python
import matplotlib.pyplot as plt
import numpy as np

# Datos del caso de prueba
inversion_inicial = -3040000  # Negativo (gasto)
ahorro_anual = 648900

# Calcular datos para 5 años
años = ['Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5']
inversion = [inversion_inicial, 0, 0, 0, 0, 0]
ahorros_acum = [0, ahorro_anual, ahorro_anual*2, ahorro_anual*3, 
                ahorro_anual*4, ahorro_anual*5]
flujo_neto = [inversion_inicial, 
              inversion_inicial + ahorro_anual,
              inversion_inicial + ahorro_anual*2,
              inversion_inicial + ahorro_anual*3,
              inversion_inicial + ahorro_anual*4,
              inversion_inicial + ahorro_anual*5]

plt.figure(figsize=(12, 6))
plt.plot(años, inversion, 'r-', linewidth=2.5, marker='o', 
         markersize=8, label='Inversión Inicial')
plt.plot(años, ahorros_acum, 'g-', linewidth=2.5, marker='s', 
         markersize=8, label='Ahorros Acumulados')
plt.plot(años, flujo_neto, 'b-', linewidth=2.5, marker='^', 
         markersize=8, label='Flujo Neto Acumulado')

# Línea de referencia en y=0
plt.axhline(y=0, color='black', linestyle='--', linewidth=1, alpha=0.5)

plt.xlabel('Tiempo', fontsize=12, fontweight='bold')
plt.ylabel('Dinero (ARS)', fontsize=12, fontweight='bold')
plt.title('Análisis Financiero a 5 Años - Caso de Prueba', 
          fontsize=13, fontweight='bold', pad=15)
plt.legend(loc='best', fontsize=10, framealpha=0.9)
plt.grid(True, alpha=0.3, linestyle='--')

# Formatear eje Y con separadores de miles
ax = plt.gca()
ax.yaxis.set_major_formatter(plt.FuncFormatter(lambda x, p: f'${x/1000:.0f}K'))

plt.tight_layout()
plt.savefig('Figura7_AnalisisFinanciero.png', dpi=300, bbox_inches='tight')
plt.savefig('Figura7_AnalisisFinanciero.pdf', bbox_inches='tight')
print("✅ Figura 7 guardada")
```

---

## 📉 FIGURA 8: BANDAS DE INCERTIDUMBRE

### **Python (Recomendado)**

Crea `generar_bandas_incertidumbre.py`:

```python
import matplotlib.pyplot as plt
import numpy as np

# Datos del caso de prueba
energia_anual = 3605  # kWh
rmse = 5.8  # W
n_meses = 12
dias_promedio = 30.4

# Calcular incertidumbre
incertidumbre = rmse * 1.96 * np.sqrt(n_meses * dias_promedio)  # En Wh
incertidumbre_kwh = incertidumbre / 1000  # Convertir a kWh

# Rango de confianza
energia_superior = energia_anual + incertidumbre_kwh
energia_inferior = energia_anual - incertidumbre_kwh

# Crear gráfico
fig, ax = plt.subplots(figsize=(10, 6))

# Banda de incertidumbre
x = np.array([0, 1])
y_superior = np.array([energia_superior, energia_superior])
y_inferior = np.array([energia_inferior, energia_inferior])

ax.fill_between(x, y_inferior, y_superior, 
                alpha=0.3, color='orange', 
                label=f'Intervalo de Confianza 95% (±{incertidumbre_kwh:.0f} kWh)')

# Línea central (energía estimada)
ax.plot(x, [energia_anual, energia_anual], 
        'b-', linewidth=3, label=f'Energía Estimada ({energia_anual} kWh)')

# Líneas de límites
ax.plot(x, y_superior, 'r--', linewidth=2, alpha=0.7, 
        label=f'Límite Superior ({energia_superior:.0f} kWh)')
ax.plot(x, y_inferior, 'r--', linewidth=2, alpha=0.7, 
        label=f'Límite Inferior ({energia_inferior:.0f} kWh)')

# Formato
ax.set_xlim([-0.1, 1.1])
ax.set_ylim([energia_inferior - 50, energia_superior + 50])
ax.set_ylabel('Energía Anual (kWh)', fontsize=12, fontweight='bold')
ax.set_title('Bandas de Incertidumbre para Generación Anual Estimada', 
             fontsize=13, fontweight='bold', pad=15)
ax.legend(loc='best', fontsize=10, framealpha=0.9)
ax.grid(True, alpha=0.3, linestyle='--')
ax.set_xticks([])  # Ocultar eje X

# Agregar anotación
ax.annotate(f'Rango: {energia_inferior:.0f} - {energia_superior:.0f} kWh',
            xy=(0.5, energia_anual), xytext=(0.5, energia_anual + 100),
            fontsize=11, ha='center',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
            arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0'))

plt.tight_layout()
plt.savefig('Figura8_BandasIncertidumbre.png', dpi=300, bbox_inches='tight')
plt.savefig('Figura8_BandasIncertidumbre.pdf', bbox_inches='tight')
print("✅ Figura 8 guardada")
```

---

## 🏗️ FIGURA 9: DIAGRAMA DE ARQUITECTURA FRONTEND-ONLY

### **Método: draw.io (Recomendado)**

**Paso 1**: Ve a https://app.diagrams.net/

**Paso 2**: Crea un diagrama de arquitectura con estos elementos:

```
┌─────────────────────────────────────────────────────┐
│              NAVEGADOR DEL USUARIO                  │
│                  (Chrome, Firefox, etc.)            │
└─────────────────────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    HTML5     │ │    CSS3     │ │ JavaScript   │
│  Estructura  │ │   Estilos   │ │   ES6+       │
│  Semántica   │ │  Responsive │ │   Lógica     │
└──────────────┘ └──────────────┘ └──────┬───────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
                    ▼                    ▼                    ▼
        ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
        │  Modelo OLS      │  │   Chart.js       │  │  NASA POWER API  │
        │  (Coeficientes   │  │   Visualizaciones│  │  (Fetch desde    │
        │   Pre-calculados)│  │   Interactivas   │  │   Frontend)      │
        └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │
                    ▼
        ┌──────────────────────────────────────┐
        │     CÁLCULOS EN TIEMPO REAL          │
        │     (Sin servidor backend)           │
        └──────────────────────────────────────┘
```

**Paso 3**: 
- Usa cajas rectangulares para componentes
- Colores diferentes para cada capa (HTML/CSS/JS)
- Flechas mostrando el flujo
- Agrega texto "100% Frontend - Sin Backend" en algún lugar visible

**Paso 4**: Exporta como PNG (300 DPI) y PDF

### **Alternativa: PowerPoint o Canva**
- Mismo concepto, crea las cajas y flechas
- Usa colores consistentes
- Exporta como imagen de alta resolución

---

## 📋 CHECKLIST FINAL

Antes de insertar las figuras en el paper, verifica:

- [ ] Todas las figuras están en **color**
- [ ] Resolución mínima: **300 DPI** para impresión
- [ ] Formato guardado: **PNG** (para Word) y **PDF** (para LaTeX)
- [ ] Tamaño apropiado: máximo media página cada una
- [ ] Textos legibles: fuentes Arial o similar, tamaño mínimo 9pt
- [ ] Leyendas preparadas con formato: *Figura X. Descripción. [Elaboración propia]*
- [ ] Nombres de archivo consistentes: `Figura1_...`, `Figura2_...`, etc.

---

## 🎨 CONSEJOS DE DISEÑO

1. **Colores consistentes**:
   - Verde (#2ecc71): Tu modelo, valores positivos
   - Azul (#3498db): Procesos, datos intermedios
   - Amarillo (#f39c12): Energía solar, valores destacados
   - Rojo (#e74c3c): Inversión, valores negativos
   - Gris (#95a5a6): Benchmarks, comparaciones

2. **Tipografía**:
   - Títulos: Arial Bold, 12-13pt
   - Etiquetas: Arial, 10-11pt
   - Valores: Arial, 9-10pt

3. **Elementos visuales**:
   - Líneas de grid sutiles (alpha=0.3)
   - Bordes en gráficos de barras (linewidth=1-1.5)
   - Marcadores en gráficos de líneas (markersize=6-8)

---

## 🚀 SCRIPT AUTOMÁTICO (OPCIONAL)

Si quieres generar todas las figuras de una vez, crea `generar_todas_figuras.py` que llame a todos los scripts anteriores.

¿Necesitas ayuda con alguna figura específica? ¡Pregunta!

