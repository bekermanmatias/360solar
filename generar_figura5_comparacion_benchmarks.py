"""
Script para generar la FIGURA 5: Comparación con Benchmarks
Paper Técnico - Simulador Fotovoltaico
"""

import matplotlib.pyplot as plt
import numpy as np

# Configurar estilo para mejor calidad
plt.style.use('default')

print("📊 Generando Figura 5: Comparación con Benchmarks...")

# Datos de comparación
modelos = ['Nuestro\nModelo', 'PVWatts\n(NREL)', 'SolarGIS']
r2_medio = [0.970, 0.935, 0.915]  # Valores promedio
rmse_medio = [5.8, 10.0, 12.5]  # Valores promedio en Watts

# Crear figura con dos subplots lado a lado
print("   → Creando gráficos comparativos...")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

# ============================================
# Gráfico 1: R² (Coeficiente de Determinación)
# ============================================
x = np.arange(len(modelos))
width = 0.6

# Colores: verde para nuestro modelo, azul/gris para otros
colores = ['#2ecc71', '#3498db', '#95a5a6']

bars1 = ax1.bar(x, r2_medio, width, 
                color=colores,
                edgecolor='black', 
                linewidth=1.5,
                alpha=0.9)

# Agregar valores en las barras
for i, (bar, val) in enumerate(zip(bars1, r2_medio)):
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height + 0.005,
             f'{val:.3f}', 
             ha='center', 
             va='bottom', 
             fontweight='bold',
             fontsize=11)

ax1.set_ylabel('Coeficiente de Determinación (R²)', 
               fontsize=12, 
               fontweight='bold')
ax1.set_title('Comparación de R²', 
               fontsize=13, 
               fontweight='bold', 
               pad=15)
ax1.set_xticks(x)
ax1.set_xticklabels(modelos, fontsize=11, fontweight='bold')
ax1.set_ylim([0.85, 1.0])
ax1.grid(True, alpha=0.3, axis='y', linestyle='--', linewidth=0.8)
ax1.set_axisbelow(True)

# Línea de referencia en 0.95
ax1.axhline(y=0.95, color='orange', linestyle=':', linewidth=1.5, alpha=0.7, label='Referencia 0.95')
ax1.legend(loc='lower right', fontsize=9)

# ============================================
# Gráfico 2: RMSE (Error Cuadrático Medio)
# ============================================
bars2 = ax2.bar(x, rmse_medio, width,
                color=colores,
                edgecolor='black', 
                linewidth=1.5,
                alpha=0.9)

# Agregar valores en las barras
for i, (bar, val) in enumerate(zip(bars2, rmse_medio)):
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height + 0.3,
             f'{val:.1f} W', 
             ha='center', 
             va='bottom', 
             fontweight='bold',
             fontsize=11)

ax2.set_ylabel('RMSE (W)', 
               fontsize=12, 
               fontweight='bold')
ax2.set_title('Comparación de RMSE', 
               fontsize=13, 
               fontweight='bold', 
               pad=15)
ax2.set_xticks(x)
ax2.set_xticklabels(modelos, fontsize=11, fontweight='bold')
ax2.set_ylim([0, 15])
ax2.grid(True, alpha=0.3, axis='y', linestyle='--', linewidth=0.8)
ax2.set_axisbelow(True)

# Nota: Menor RMSE es mejor
ax2.text(0.5, 0.95, 'Menor es mejor', 
         transform=ax2.transAxes,
         ha='center',
         fontsize=9,
         style='italic',
         color='gray')

# Ajustar layout
plt.tight_layout()

# Guardar en alta resolución
print("   → Guardando imágenes...")
plt.savefig('Figura5_ComparacionBenchmarks.png', 
            dpi=300, 
            bbox_inches='tight', 
            facecolor='white')
plt.savefig('Figura5_ComparacionBenchmarks.pdf', 
            bbox_inches='tight', 
            facecolor='white')

print("\n✅ ¡Figura 5 generada exitosamente!")
print("   → Archivos guardados:")
print("      • Figura5_ComparacionBenchmarks.png (300 DPI)")
print("      • Figura5_ComparacionBenchmarks.pdf")
print("\n📊 Resumen de comparación:")
print(f"   → Nuestro modelo: R² = {r2_medio[0]:.3f}, RMSE = {rmse_medio[0]:.1f} W")
print(f"   → PVWatts: R² = {r2_medio[1]:.3f}, RMSE = {rmse_medio[1]:.1f} W")
print(f"   → SolarGIS: R² = {r2_medio[2]:.3f}, RMSE = {rmse_medio[2]:.1f} W")
print("\n💡 La figura muestra que nuestro modelo supera a los benchmarks en ambas métricas.")

# Mostrar el gráfico (opcional)
# plt.show()

