"""
Script para generar la FIGURA 7: Análisis Financiero (5 años)
Paper Técnico - Simulador Fotovoltaico

NOTA: Este script genera datos basados en el caso de prueba del paper.
Si tienes datos reales del simulador, puedes reemplazarlos.
"""

import matplotlib.pyplot as plt
import numpy as np

# Configurar estilo para mejor calidad
plt.style.use('default')

print("💰 Generando Figura 7: Análisis Financiero (5 años)...")

# Datos del caso de prueba (pequeña empresa)
# Según el paper: inversión de 11.400.000 ARS, ahorro anual de 2.851.200 ARS
inversion_inicial = -11400000  # Negativo (gasto inicial) - 30 paneles × $380.000
ahorro_anual = 2851200         # 15.840 kWh × $180/kWh

# Calcular datos para 5 años
anos = ['Año 0', 'Año 1', 'Año 2', 'Año 3', 'Año 4', 'Año 5']
inversion = [inversion_inicial, 0, 0, 0, 0, 0]
ahorros_acum = [0, ahorro_anual, ahorro_anual*2, ahorro_anual*3, 
                ahorro_anual*4, ahorro_anual*5]
flujo_neto = []
acumulado = inversion_inicial

for i in range(6):
    if i == 0:
        flujo_neto.append(inversion_inicial)
    else:
        acumulado += ahorro_anual
        flujo_neto.append(acumulado)

# Calcular punto de equilibrio (ROI)
roi_anos = abs(inversion_inicial) / ahorro_anual
print(f"   → Inversión inicial: ${abs(inversion_inicial):,.0f} ARS")
print(f"   → Ahorro anual: ${ahorro_anual:,.0f} ARS")
print(f"   → ROI: {roi_anos:.1f} años")
print(f"   → Punto de equilibrio: Año {int(np.ceil(roi_anos))}")

# Crear el gráfico
print("   → Creando gráfico...")
fig, ax = plt.subplots(figsize=(12, 7))

# Línea 1: Inversión Inicial (roja)
ax.plot(anos, inversion, 
        'r-', 
        linewidth=2.5, 
        marker='s', 
        markersize=10,
        label='Inversión Inicial',
        alpha=0.8)

# Línea 2: Ahorros Acumulados (verde)
ax.plot(anos, ahorros_acum, 
        'g-', 
        linewidth=2.5, 
        marker='o', 
        markersize=10,
        label='Ahorros Acumulados',
        alpha=0.8)

# Línea 3: Flujo Neto Acumulado (azul) con área sombreada
ax.plot(anos, flujo_neto, 
        'b-', 
        linewidth=3, 
        marker='^', 
        markersize=10,
        label='Flujo Neto Acumulado',
        alpha=0.9)

# Área sombreada bajo la línea de flujo neto
ax.fill_between(anos, flujo_neto, 0, 
                where=[f >= 0 for f in flujo_neto],
                alpha=0.2, 
                color='blue',
                interpolate=True)

# Línea de referencia en y=0 (punto de equilibrio)
ax.axhline(y=0, color='black', linestyle='--', linewidth=1.5, alpha=0.5, zorder=0)

# Marcar punto de equilibrio
equilibrio_ano = int(np.ceil(roi_anos))
if equilibrio_ano <= 5:
    equilibrio_idx = equilibrio_ano
    ax.plot(anos[equilibrio_idx], flujo_neto[equilibrio_idx], 
            'ko', markersize=12, zorder=5)
    ax.annotate(f'Punto de Equilibrio\n(Año {equilibrio_ano})',
                xy=(equilibrio_idx, flujo_neto[equilibrio_idx]),
                xytext=(equilibrio_idx + 0.5, flujo_neto[equilibrio_idx] + 500000),
                fontsize=10,
                fontweight='bold',
                bbox=dict(boxstyle='round', facecolor='yellow', alpha=0.7),
                arrowprops=dict(arrowstyle='->', connectionstyle='arc3,rad=0.2', lw=2))

# Etiquetas y formato
ax.set_xlabel('Tiempo', fontsize=12, fontweight='bold')
ax.set_ylabel('Dinero (ARS)', fontsize=12, fontweight='bold')
ax.set_title('Análisis Financiero a 5 Años - Pequeña Empresa (30 paneles, 10.5 kW)', 
             fontsize=14, fontweight='bold', pad=15)

# Formatear eje Y con separadores de miles
def format_money(value, _):
    if value >= 0:
        return f'${value/1000:.0f}K'
    else:
        return f'-${abs(value)/1000:.0f}K'

ax.yaxis.set_major_formatter(plt.FuncFormatter(format_money))

# Grid para mejor legibilidad
ax.grid(True, alpha=0.3, linestyle='--', linewidth=0.8)
ax.set_axisbelow(True)

# Leyenda
ax.legend(loc='best', fontsize=11, framealpha=0.9, shadow=True)

# Agregar información adicional
info_text = f'Inversión: ${abs(inversion_inicial):,.0f}\nAhorro anual: ${ahorro_anual:,.0f}\nROI: {roi_anos:.1f} años'
ax.text(0.02, 0.98, info_text,
        transform=ax.transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.8),
        fontweight='bold')

# Ajustar límites del eje Y para mejor visualización
y_min = min(min(flujo_neto), inversion_inicial) * 1.1
y_max = max(max(ahorros_acum), max(flujo_neto)) * 1.1
ax.set_ylim([y_min, y_max])

# Ajustar layout
plt.tight_layout()

# Guardar en alta resolución
print("   → Guardando imágenes...")
plt.savefig('Figura7_AnalisisFinanciero.png', 
            dpi=300, 
            bbox_inches='tight', 
            facecolor='white')
plt.savefig('Figura7_AnalisisFinanciero.pdf', 
            bbox_inches='tight', 
            facecolor='white')

print("\n✅ ¡Figura 7 generada exitosamente!")
print("   → Archivos guardados:")
print("      • Figura7_AnalisisFinanciero.png (300 DPI)")
print("      • Figura7_AnalisisFinanciero.pdf")
print(f"\n📊 Resumen financiero:")
print(f"   → Inversión inicial: ${abs(inversion_inicial):,.0f} ARS")
print(f"   → Ahorro anual: ${ahorro_anual:,.0f} ARS")
print(f"   → Ahorro acumulado (5 años): ${ahorros_acum[5]:,.0f} ARS")
print(f"   → Flujo neto (5 años): ${flujo_neto[5]:,.0f} ARS")
print(f"   → ROI: {roi_anos:.1f} años")
print("\n💡 La figura muestra el punto de equilibrio y la recuperación de la inversión.")

# Mostrar el gráfico (opcional)
# plt.show()

