"""
Script para generar gráfico de dispersión con los 6 clusters
para incluir en el paper académico.

El gráfico muestra:
- Puntos de datos experimentales por cluster
- Líneas de regresión P = β₁ · G para cada cluster
- Colores distintivos y leyenda profesional
"""

import csv
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from collections import defaultdict

# Configuración para calidad de publicación
plt.rcParams['figure.figsize'] = (10, 7)
plt.rcParams['font.size'] = 11
plt.rcParams['font.family'] = 'serif'
plt.rcParams['axes.labelsize'] = 12
plt.rcParams['axes.titlesize'] = 14
plt.rcParams['xtick.labelsize'] = 10
plt.rcParams['ytick.labelsize'] = 10
plt.rcParams['legend.fontsize'] = 10
plt.rcParams['figure.dpi'] = 300
plt.rcParams['savefig.dpi'] = 300
plt.rcParams['savefig.bbox'] = 'tight'

# Colores distintivos para cada cluster (paleta profesional)
colores_clusters = {
    '10_20': '#1f77b4',  # Azul
    '20_20': '#ff7f0e',  # Naranja
    '30_20': '#2ca02c',  # Verde
    '10_45': '#d62728',  # Rojo
    '20_45': '#9467bd',  # Púrpura
    '30_45': '#8c564b'   # Marrón
}

# Leer el CSV y agrupar por clusters
datos_por_cluster = defaultdict(lambda: {'G': [], 'P': []})

print("📊 Leyendo archivo CSV...")

with open('csv/01 - Generacion FV .csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    
    for row in reader:
        try:
            irradiance = float(row['irradiance_Wm2'].replace(',', '.'))
            generacion = float(row['generacion_W'].replace(',', '.'))
            temperatura = float(row['temperatura_ambiental_°C'].replace(',', '.'))
            inclinacion = float(row['inclinacion_°'].replace(',', '.'))
        except (ValueError, KeyError):
            continue
        
        # Filtrar datos con irradiancia = 0
        if irradiance == 0:
            continue
        
        # Discretizar a clusters
        if temperatura <= 15:
            temp_cluster = 10
        elif temperatura <= 25:
            temp_cluster = 20
        else:
            temp_cluster = 30
        
        angle_cluster = 20 if inclinacion < 32.5 else 45
        
        cluster_key = f"{temp_cluster}_{angle_cluster}"
        
        datos_por_cluster[cluster_key]['G'].append(irradiance)
        datos_por_cluster[cluster_key]['P'].append(generacion)

print(f"✅ Datos leídos. Total de clusters: {len(datos_por_cluster)}\n")

# Calcular coeficientes β₁ para cada cluster
coeficientes = {}

for cluster_key in sorted(datos_por_cluster.keys()):
    G = np.array(datos_por_cluster[cluster_key]['G'])
    P = np.array(datos_por_cluster[cluster_key]['P'])
    
    if len(G) == 0:
        continue
    
    # Regresión lineal: P = β₁ · G
    beta1 = np.sum(G * P) / np.sum(G ** 2)
    
    coeficientes[cluster_key] = {
        'beta1': beta1,
        'G': G,
        'P': P
    }

# Crear figura y ejes
fig, ax = plt.subplots(figsize=(10, 7))

# Etiquetas para la leyenda
etiquetas_clusters = {
    '10_20': 'T=10°C, θ=20°',
    '20_20': 'T=20°C, θ=20°',
    '30_20': 'T=30°C, θ=20°',
    '10_45': 'T=10°C, θ=45°',
    '20_45': 'T=20°C, θ=45°',
    '30_45': 'T=30°C, θ=45°'
}

# Graficar primero las líneas de regresión (más transparentes)
for cluster_key in sorted(coeficientes.keys()):
    G = coeficientes[cluster_key]['G']
    P = coeficientes[cluster_key]['P']
    beta1 = coeficientes[cluster_key]['beta1']
    color = colores_clusters[cluster_key]
    
    # Línea de regresión (dibujar primero, más transparente)
    G_min, G_max = G.min(), G.max()
    G_line = np.linspace(G_min, G_max, 100)
    P_line = beta1 * G_line
    
    ax.plot(G_line, P_line, color=color, linewidth=2, linestyle='--', alpha=0.5, zorder=1)

# Luego graficar los puntos de dispersión (más visibles, encima de las líneas)
for cluster_key in sorted(coeficientes.keys()):
    G = coeficientes[cluster_key]['G']
    P = coeficientes[cluster_key]['P']
    color = colores_clusters[cluster_key]
    etiqueta = etiquetas_clusters[cluster_key]
    
    # Gráfico de dispersión con puntos más visibles
    # Tamaño mayor, más opaco, con bordes para mejor contraste
    ax.scatter(G, P, alpha=0.7, s=25, color=color, label=etiqueta, 
               edgecolors='white', linewidths=0.5, zorder=2)

# Configurar ejes
ax.set_xlabel('Irradiancia Global (W/m²)', fontweight='bold')
ax.set_ylabel('Potencia Generada (W)', fontweight='bold')
ax.set_title('Modelo de Regresión Lineal por Cluster\nP = β₁ · G', fontweight='bold', pad=15)

# Grid para mejor legibilidad
ax.grid(True, alpha=0.3, linestyle=':', linewidth=0.5)

# Leyenda
ax.legend(loc='lower right', frameon=True, fancybox=True, shadow=True, 
          title='Clusters Operativos', title_fontsize=10, fontsize=9)

# Ajustar límites de ejes
ax.set_xlim(left=0)
ax.set_ylim(bottom=0)

# Agregar texto con información del modelo
texto_info = 'Modelo: P = β₁ · G (sin intercepto)\nMétodo: Mínimos Cuadrados Ordinarios (OLS)'
ax.text(0.02, 0.98, texto_info, transform=ax.transAxes, 
        fontsize=9, verticalalignment='top',
        bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

plt.tight_layout()

# Guardar gráfico en alta resolución
nombre_archivo = 'grafico_dispersion_clusters.png'
plt.savefig(nombre_archivo, dpi=300, bbox_inches='tight', facecolor='white')
print(f"✅ Gráfico guardado como: {nombre_archivo}")

# También guardar en formato PDF (mejor para papers)
nombre_archivo_pdf = 'grafico_dispersion_clusters.pdf'
plt.savefig(nombre_archivo_pdf, bbox_inches='tight', facecolor='white')
print(f"✅ Gráfico guardado como: {nombre_archivo_pdf}")

# Mostrar resumen de coeficientes
print("\n📊 Resumen de coeficientes β₁ por cluster:")
print("=" * 60)
for cluster_key in sorted(coeficientes.keys()):
    beta1 = coeficientes[cluster_key]['beta1']
    n_datos = len(coeficientes[cluster_key]['G'])
    etiqueta = etiquetas_clusters[cluster_key]
    print(f"{cluster_key:6} ({etiqueta:15}): β₁ = {beta1:.6f}  (N={n_datos})")
print("=" * 60)

plt.show()

