"""
Script para generar la FIGURA 2: Scatter Plot - Irradiancia vs Generación
Paper Técnico - Simulador Fotovoltaico
"""

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from scipy import stats

# Configurar estilo para mejor calidad
plt.style.use('default')

print("📈 Generando Figura 2: Scatter Plot - Irradiancia vs Generación...")

# Paso 1: Leer y filtrar datos
print("   → Leyendo dataset...")
df = pd.read_csv('01 - Generacion FV.csv', sep=';', decimal=',')

print("   → Filtrando observaciones válidas...")
df_validas = df[df['generacion_W'] > 0].copy()
print(f"   → Total de observaciones válidas: {len(df_validas)}")

# Paso 2: Calcular correlación
correlacion = df_validas['irradiance_Wm2'].corr(df_validas['generacion_W'])
print(f"   → Correlación calculada: {correlacion:.3f}")

# Paso 3: Crear el gráfico
print("   → Creando gráfico...")
fig, ax = plt.subplots(figsize=(10, 7))

# Scatter plot con transparencia para ver densidad
ax.scatter(df_validas['irradiance_Wm2'], 
           df_validas['generacion_W'],
           alpha=0.4,           # Transparencia para ver densidad de puntos
           s=15,                # Tamaño de puntos
           c='#3498db',         # Color azul
           edgecolors='none',    # Sin bordes en puntos
           label='Observaciones')

# Calcular y dibujar línea de tendencia
print("   → Calculando línea de tendencia...")
z = np.polyfit(df_validas['irradiance_Wm2'], df_validas['generacion_W'], 1)
p = np.poly1d(z)

# Crear puntos para la línea de tendencia
x_tendencia = np.linspace(df_validas['irradiance_Wm2'].min(), 
                          df_validas['irradiance_Wm2'].max(), 
                          100)
y_tendencia = p(x_tendencia)

# Dibujar línea de tendencia
ax.plot(x_tendencia, y_tendencia, 
        "r--",                  # Línea roja punteada
        linewidth=2.5, 
        label=f'Tendencia lineal (r = {correlacion:.3f})',
        alpha=0.8)

# Etiquetas y formato
ax.set_xlabel('Irradiancia Solar (W/m²)', fontsize=12, fontweight='bold')
ax.set_ylabel('Generación Fotovoltaica (W)', fontsize=12, fontweight='bold')
ax.set_title('Relación entre Irradiancia Solar y Generación Fotovoltaica', 
             fontsize=14, fontweight='bold', pad=15)

# Grid para mejor legibilidad
ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.8)

# Leyenda
ax.legend(loc='upper left', fontsize=10, framealpha=0.9)

# Ajustar límites de ejes para mejor visualización
ax.set_xlim([-50, df_validas['irradiance_Wm2'].max() * 1.05])
ax.set_ylim([-10, df_validas['generacion_W'].max() * 1.05])

# Agregar texto con información de la correlación
textstr = f'r = {correlacion:.3f}'
props = dict(boxstyle='round', facecolor='wheat', alpha=0.5)
ax.text(0.05, 0.95, textstr, transform=ax.transAxes, fontsize=11,
        verticalalignment='top', bbox=props, fontweight='bold')

# Ajustar layout
plt.tight_layout()

# Guardar en alta resolución
print("   → Guardando imágenes...")
plt.savefig('Figura2_ScatterPlot.png', dpi=300, bbox_inches='tight', facecolor='white')
plt.savefig('Figura2_ScatterPlot.pdf', bbox_inches='tight', facecolor='white')
print("\n✅ ¡Figura 2 generada exitosamente!")
print("   → Archivos guardados:")
print("      • Figura2_ScatterPlot.png (300 DPI)")
print("      • Figura2_ScatterPlot.pdf")
print(f"\n📊 Estadísticas:")
print(f"   → Correlación (r): {correlacion:.3f}")
print(f"   → Observaciones: {len(df_validas)}")
print(f"   → Irradiancia: {df_validas['irradiance_Wm2'].min():.1f} - {df_validas['irradiance_Wm2'].max():.1f} W/m²")
print(f"   → Generación: {df_validas['generacion_W'].min():.1f} - {df_validas['generacion_W'].max():.1f} W")
print("\n💡 La figura está lista para insertar en el paper técnico.")

# Mostrar el gráfico (opcional)
# plt.show()

