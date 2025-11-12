"""
Script para generar la FIGURA 6: Gráfica de Generación Mensual (Caso de Prueba)
Paper Técnico - Simulador Fotovoltaico

NOTA: Este script genera datos de ejemplo basados en el caso de prueba del paper.
Si tienes datos reales del simulador, puedes reemplazarlos.
"""

import matplotlib.pyplot as plt
import numpy as np

# Configurar estilo para mejor calidad
plt.style.use('default')

print("📅 Generando Figura 6: Gráfica de Generación Mensual (Caso de Prueba)...")

# Datos mensuales para el caso de prueba (casa familiar, 8 paneles)
# Estos valores son aproximados basados en el caso del paper
# Si tienes datos reales del simulador, reemplázalos aquí
meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
         'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

# Generación mensual estimada (kWh) - Patrón típico para Argentina
# Mayor generación en verano (dic-ene-feb), menor en invierno (jun-jul)
generacion_kwh = [
    320,  # Enero (verano)
    280,  # Febrero (verano)
    250,  # Marzo (otoño)
    200,  # Abril (otoño)
    180,  # Mayo (invierno)
    150,  # Junio (invierno - mínimo)
    160,  # Julio (invierno)
    200,  # Agosto (invierno)
    250,  # Septiembre (primavera)
    300,  # Octubre (primavera)
    350,  # Noviembre (primavera/verano)
    380   # Diciembre (verano - máximo)
]

# Calcular promedio anual para referencia
promedio_anual = np.mean(generacion_kwh)
total_anual = sum(generacion_kwh)

print(f"   → Generación anual total: {total_anual:.0f} kWh")
print(f"   → Promedio mensual: {promedio_anual:.1f} kWh")

# Crear el gráfico
print("   → Creando gráfico...")
fig, ax = plt.subplots(figsize=(12, 6))

# Colores: amarillo para verano, naranja para invierno
colores = []
for i, mes in enumerate(meses):
    # Verano (dic, ene, feb, nov) = amarillo más intenso
    if i in [0, 1, 10, 11]:  # Ene, Feb, Nov, Dic
        colores.append('#FDB813')  # Amarillo
    # Invierno (may, jun, jul) = naranja más claro
    elif i in [4, 5, 6]:  # May, Jun, Jul
        colores.append('#FFA500')  # Naranja
    # Transición (mar, abr, ago, sep, oct) = amarillo medio
    else:
        colores.append('#FFD700')  # Amarillo dorado

# Crear barras
bars = ax.bar(meses, generacion_kwh, 
               color=colores, 
               edgecolor='black', 
               linewidth=1.5,
               alpha=0.9,
               width=0.7)

# Agregar valores en las barras
for bar, val in zip(bars, generacion_kwh):
    height = bar.get_height()
    ax.text(bar.get_x() + bar.get_width()/2., height + 5,
             f'{int(val)}', 
             ha='center', 
             va='bottom', 
             fontsize=10,
             fontweight='bold')

# Línea de promedio anual
ax.axhline(y=promedio_anual, 
           color='red', 
           linestyle='--', 
           linewidth=2, 
           alpha=0.7,
           label=f'Promedio anual ({promedio_anual:.0f} kWh/mes)')

# Etiquetas y formato
ax.set_xlabel('Mes', fontsize=12, fontweight='bold')
ax.set_ylabel('Energía Generada (kWh)', fontsize=12, fontweight='bold')
ax.set_title('Generación Mensual Estimada - Caso de Prueba (8 paneles, 2.8 kW)', 
             fontsize=13, fontweight='bold', pad=15)

# Grid para mejor legibilidad
ax.grid(True, alpha=0.3, axis='y', linestyle='--', linewidth=0.8)
ax.set_axisbelow(True)

# Ajustar límites del eje Y
ax.set_ylim([0, max(generacion_kwh) * 1.15])

# Leyenda
ax.legend(loc='upper right', fontsize=10, framealpha=0.9)

# Agregar anotación con total anual
ax.text(0.98, 0.02, f'Total anual: {total_anual:.0f} kWh',
        transform=ax.transAxes,
        fontsize=10,
        ha='right',
        va='bottom',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5),
        fontweight='bold')

# Ajustar layout
plt.tight_layout()

# Guardar en alta resolución
print("   → Guardando imágenes...")
plt.savefig('Figura6_GeneracionMensual.png', 
            dpi=300, 
            bbox_inches='tight', 
            facecolor='white')
plt.savefig('Figura6_GeneracionMensual.pdf', 
            bbox_inches='tight', 
            facecolor='white')

print("\n✅ ¡Figura 6 generada exitosamente!")
print("   → Archivos guardados:")
print("      • Figura6_GeneracionMensual.png (300 DPI)")
print("      • Figura6_GeneracionMensual.pdf")
print(f"\n📊 Estadísticas del caso de prueba:")
print(f"   → Paneles: 8")
print(f"   → Potencia instalada: 2.8 kW")
print(f"   → Generación anual: {total_anual:.0f} kWh")
print(f"   → Generación mensual promedio: {promedio_anual:.1f} kWh")
print(f"   → Mes con mayor generación: Diciembre ({max(generacion_kwh)} kWh)")
print(f"   → Mes con menor generación: Junio ({min(generacion_kwh)} kWh)")
print("\n💡 La figura muestra la variabilidad estacional típica en Argentina.")

# Mostrar el gráfico (opcional)
# plt.show()

