"""
Script para generar la FIGURA 8: Bandas de Incertidumbre
Paper Técnico - Simulador Fotovoltaico

NOTA: Este script genera las bandas de incertidumbre basadas en el caso de prueba
del paper (casa familiar en La Plata).
"""

import matplotlib.pyplot as plt

# Configurar estilo para mejor calidad
plt.style.use('default')

print("📉 Generando Figura 8: Bandas de Incertidumbre...")

# Datos del caso de prueba (casa familiar en La Plata)
# Según el paper: energía anual de 3.605 kWh, incertidumbre de ±180 kWh
energia_anual = 3605  # kWh
incertidumbre_kwh = 180  # kWh (según paper: ±180 kWh por año)
rmse = 5.8  # W (RMSE del modelo para referencia)

# NOTA: La ecuación (3) del paper da un valor teórico, pero el paper menciona
# explícitamente ±180 kWh como la incertidumbre calculada para este caso.
# Usamos el valor del paper directamente.

# Rango de confianza del 95%
energia_superior = energia_anual + incertidumbre_kwh
energia_inferior = energia_anual - incertidumbre_kwh

print(f"   → Energía anual estimada: {energia_anual} kWh")
print(f"   → Incertidumbre (±): {incertidumbre_kwh:.0f} kWh")
print(f"   → Rango de confianza 95%: {energia_inferior:.0f} - {energia_superior:.0f} kWh")

# Crear el gráfico con barras de error (más visual)
print("   → Creando gráfico...")
fig, ax = plt.subplots(figsize=(10, 7))

# Crear un gráfico de barras de error horizontal
x_pos = 0.5
y_pos = energia_anual

# Banda de incertidumbre (área sombreada vertical)
ax.fill_betweenx([energia_inferior, energia_superior], 
                 x_pos - 0.3, x_pos + 0.3,
                 alpha=0.3, 
                 color='orange', 
                 label=f'Intervalo de Confianza 95% (±{incertidumbre_kwh:.0f} kWh)',
                 edgecolor='orange',
                 linewidth=2)

# Línea central (energía estimada) con marcador grande
ax.plot([x_pos - 0.3, x_pos + 0.3], [y_pos, y_pos], 
        'b-', 
        linewidth=4, 
        label=f'Energía Estimada ({energia_anual} kWh)',
        zorder=5)

ax.plot(x_pos, y_pos, 
        'bo', 
        markersize=15,
        zorder=6)

# Líneas de límites con marcadores
ax.plot([x_pos - 0.3, x_pos + 0.3], [energia_superior, energia_superior], 
        'r--', 
        linewidth=2.5, 
        alpha=0.8, 
        label=f'Límite Superior ({energia_superior:.0f} kWh)',
        zorder=3)

ax.plot(x_pos, energia_superior, 
        'ro', 
        markersize=10,
        zorder=4)

ax.plot([x_pos - 0.3, x_pos + 0.3], [energia_inferior, energia_inferior], 
        'r--', 
        linewidth=2.5, 
        alpha=0.8, 
        label=f'Límite Inferior ({energia_inferior:.0f} kWh)',
        zorder=3)

ax.plot(x_pos, energia_inferior, 
        'ro', 
        markersize=10,
        zorder=4)

# Agregar barras de error verticales para mayor claridad
ax.errorbar(x_pos, y_pos, 
           yerr=[[y_pos - energia_inferior], [energia_superior - y_pos]], 
           fmt='none',
           ecolor='black',
           elinewidth=2,
           capsize=15,
           capthick=2,
           zorder=2)

# Formato del gráfico
ax.set_xlim([0, 1])
ax.set_ylim([energia_inferior - 100, energia_superior + 100])
ax.set_ylabel('Energía Anual (kWh)', fontsize=12, fontweight='bold')
ax.set_title('Bandas de Incertidumbre para Generación Anual Estimada\nCaso de Prueba: Casa Familiar en La Plata', 
             fontsize=13, fontweight='bold', pad=15)

# Ocultar eje X (no es necesario mostrar)
ax.set_xticks([])
ax.set_xlabel('')

# Grid para mejor legibilidad
ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.8, axis='y')
ax.set_axisbelow(True)

# Leyenda
ax.legend(loc='upper right', fontsize=10, framealpha=0.9, shadow=True)

# Agregar anotación con información
info_text = 'Rango de Confianza 95%:\n'
info_text += f'{energia_inferior:.0f} - {energia_superior:.0f} kWh\n\n'
info_text += f'Incertidumbre: ±{incertidumbre_kwh:.0f} kWh\n'
info_text += f'Basado en RMSE = {rmse} W'

ax.text(0.02, 0.98, info_text,
        transform=ax.transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.9, edgecolor='black', linewidth=1.5),
        fontweight='bold')

# Ajustar layout
plt.tight_layout()

# Guardar en alta resolución
print("   → Guardando imágenes...")
plt.savefig('Figura8_BandasIncertidumbre.png', 
            dpi=300, 
            bbox_inches='tight', 
            facecolor='white')
plt.savefig('Figura8_BandasIncertidumbre.pdf', 
            bbox_inches='tight', 
            facecolor='white')

print("\n✅ ¡Figura 8 generada exitosamente!")
print("   → Archivos guardados:")
print("      • Figura8_BandasIncertidumbre.png (300 DPI)")
print("      • Figura8_BandasIncertidumbre.pdf")
print(f"\n📊 Resumen de incertidumbre:")
print(f"   → Energía estimada: {energia_anual} kWh")
print(f"   → Incertidumbre: ±{incertidumbre_kwh:.0f} kWh")
print(f"   → Rango inferior: {energia_inferior:.0f} kWh")
print(f"   → Rango superior: {energia_superior:.0f} kWh")
print(f"   → Basado en RMSE: {rmse} W")
print("\n💡 La figura muestra el intervalo de confianza del 95% para la estimación anual.")

# Mostrar el gráfico (opcional)
# plt.show()

