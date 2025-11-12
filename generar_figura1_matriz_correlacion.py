"""
Script para generar la FIGURA 1: Matriz de Correlación
Paper Técnico - Simulador Fotovoltaico
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np

# Configurar estilo para mejor calidad
plt.style.use('default')
sns.set_palette("husl")

print("📊 Generando Figura 1: Matriz de Correlación...")

# Paso 1: Leer el dataset
print("   → Leyendo dataset...")
df = pd.read_csv('01 - Generacion FV.csv', sep=';', decimal=',')

# Paso 2: Filtrar solo observaciones válidas (generacion_W > 0)
print("   → Filtrando observaciones válidas...")
df_validas = df[df['generacion_W'] > 0].copy()
print(f"   → Total de observaciones válidas: {len(df_validas)}")

# Paso 3: Seleccionar variables numéricas para correlación
variables = ['irradiance_Wm2', 'temperatura_ambiental_°C', 'inclinacion_°', 'generacion_W']
df_corr = df_validas[variables]

# Paso 4: Calcular matriz de correlación
print("   → Calculando matriz de correlación...")
matriz_corr = df_corr.corr()

# Mostrar valores en consola
print("\n📋 Matriz de Correlación:")
print(matriz_corr.round(3))

# Paso 5: Crear el gráfico
print("\n   → Creando gráfico...")
fig, ax = plt.subplots(figsize=(9, 7))

# Crear heatmap con seaborn
sns.heatmap(matriz_corr, 
            annot=True,           # Mostrar valores en cada celda
            fmt='.3f',            # 3 decimales
            cmap='RdYlGn',        # Colores: rojo-amarillo-verde
            center=0,             # Centro en 0
            square=True,          # Celdas cuadradas
            linewidths=1.5,       # Grosor de líneas entre celdas
            linecolor='white',    # Color de líneas
            cbar_kws={"shrink": 0.8, "label": "Coeficiente de Correlación"},
            vmin=-1,              # Valor mínimo
            vmax=1,               # Valor máximo
            ax=ax)

# Personalizar etiquetas de ejes
etiquetas = ['Irradiancia\n(W/m²)', 'Temperatura\n(°C)', 'Inclinación\n(°)', 'Generación\n(W)']
ax.set_xticks([0.5, 1.5, 2.5, 3.5])
ax.set_xticklabels(etiquetas, fontsize=11, fontweight='bold')
ax.set_yticks([0.5, 1.5, 2.5, 3.5])
ax.set_yticklabels(etiquetas, fontsize=11, fontweight='bold', rotation=0)

# Título
ax.set_title('Matriz de Correlación entre Variables', 
             fontsize=14, fontweight='bold', pad=20)

# Ajustar layout
plt.tight_layout()

# Guardar en alta resolución
print("   → Guardando imágenes...")
plt.savefig('Figura1_MatrizCorrelacion.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig('Figura1_MatrizCorrelacion.pdf', bbox_inches='tight', facecolor='white')
print("\n✅ ¡Figura 1 generada exitosamente!")
print("   → Archivos guardados:")
print("      • Figura1_MatrizCorrelacion.png (300 DPI)")
print("      • Figura1_MatrizCorrelacion.pdf")
print("\n💡 La figura está lista para insertar en el paper técnico.")

# Mostrar el gráfico (opcional)
# plt.show()

