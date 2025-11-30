"""
Script para calcular coeficientes β₁ del modelo de regresión lineal
usando Mínimos Cuadrados Ordinarios (OLS) sobre el dataset experimental.

Modelo: P = β₁ · G
Donde:
  - P: Potencia en Watts (generacion_W)
  - G: Irradiancia en W/m² (irradiance_Wm2)
  - β₁: Coeficiente de eficiencia (pendiente de la recta)
"""

import csv
import numpy as np
from collections import defaultdict

# Leer el CSV
datos_por_cluster = defaultdict(lambda: {'G': [], 'P': []})

print("📊 Leyendo archivo CSV...")

with open('csv/01 - Generacion FV .csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f, delimiter=';')
    
    for row in reader:
        # Convertir valores (usar punto como separador decimal)
        try:
            irradiance = float(row['irradiance_Wm2'].replace(',', '.'))
            generacion = float(row['generacion_W'].replace(',', '.'))
            temperatura = float(row['temperatura_ambiental_°C'].replace(',', '.'))
            inclinacion = float(row['inclinacion_°'].replace(',', '.'))
        except (ValueError, KeyError) as e:
            continue
        
        # Filtrar datos con irradiancia = 0 (según paper, sección 3.2)
        if irradiance == 0:
            continue
        
        # Discretizar a clusters
        # Temperatura: aproximar a {10, 20, 30}°C
        if temperatura <= 15:
            temp_cluster = 10
        elif temperatura <= 25:
            temp_cluster = 20
        else:
            temp_cluster = 30
        
        # Inclinación: aproximar a 20° o 45°
        angle_cluster = 20 if inclinacion < 32.5 else 45
        
        # Clave del cluster
        cluster_key = f"{temp_cluster}_{angle_cluster}"
        
        # Agregar datos al cluster
        datos_por_cluster[cluster_key]['G'].append(irradiance)
        datos_por_cluster[cluster_key]['P'].append(generacion)

print(f"✅ Datos leídos. Total de clusters: {len(datos_por_cluster)}\n")

# Calcular regresión lineal para cada cluster usando Mínimos Cuadrados
# Modelo: P = β₁ · G (sin intercepto, según paper β₀ ≈ 0)

coeficientes = {}

print("🔢 Calculando coeficientes β₁ por cluster (Mínimos Cuadrados)...\n")
print("=" * 80)
print(f"{'Cluster':<12} {'Condiciones':<20} {'β₁':<12} {'R²':<10} {'N datos':<10}")
print("=" * 80)

for cluster_key in sorted(datos_por_cluster.keys()):
    G = np.array(datos_por_cluster[cluster_key]['G'])
    P = np.array(datos_por_cluster[cluster_key]['P'])
    
    if len(G) == 0:
        continue
    
    # Regresión lineal simple: P = β₁ · G
    # Mínimos Cuadrados: β₁ = Σ(G·P) / Σ(G²)
    # (sin intercepto, ya que β₀ ≈ 0 según el paper)
    
    beta1 = np.sum(G * P) / np.sum(G ** 2)
    
    # Calcular R²
    P_pred = beta1 * G
    SS_res = np.sum((P - P_pred) ** 2)
    SS_tot = np.sum((P - np.mean(P)) ** 2)
    r2 = 1 - (SS_res / SS_tot) if SS_tot > 0 else 0
    
    # Extraer condiciones del cluster
    temp, angle = cluster_key.split('_')
    condiciones = f"T={temp}°C, θ={angle}°"
    
    coeficientes[cluster_key] = {
        'beta1': beta1,
        'r2': r2,
        'n_datos': len(G)
    }
    
    print(f"{cluster_key:<12} {condiciones:<20} {beta1:<12.6f} {r2:<10.4f} {len(G):<10}")

print("=" * 80)
print()

# Comparar con valores actuales en el código
valores_actuales = {
    '10_20': 0.1908,
    '20_20': 0.1836,
    '30_20': 0.1764,
    '10_45': 0.1813,
    '20_45': 0.1744,
    '30_45': 0.1676
}

print("📋 Comparación con valores actuales en el código:\n")
print("=" * 80)
print(f"{'Cluster':<12} {'Valor Actual':<15} {'Valor Calculado':<18} {'Diferencia':<12} {'% Error':<10}")
print("=" * 80)

diferencias_significativas = False

for cluster_key in sorted(coeficientes.keys()):
    if cluster_key in valores_actuales:
        valor_actual = valores_actuales[cluster_key]
        valor_calculado = coeficientes[cluster_key]['beta1']
        diferencia = abs(valor_actual - valor_calculado)
        error_pct = (diferencia / valor_actual) * 100 if valor_actual != 0 else 0
        
        if diferencia > 0.001:  # Tolerancia de 0.001
            diferencias_significativas = True
            marca = "⚠️"
        else:
            marca = "✅"
        
        print(f"{cluster_key:<12} {valor_actual:<15.6f} {valor_calculado:<18.6f} {diferencia:<12.6f} {error_pct:<10.2f}% {marca}")

print("=" * 80)
print()

# Generar código JavaScript actualizado
print("📝 Generando código JavaScript actualizado...\n")

js_code = """const MODELO_CLUSTER = {
    betas: {
"""
for cluster_key in sorted(coeficientes.keys()):
    beta1 = coeficientes[cluster_key]['beta1']
    js_code += f"        '{cluster_key}': {beta1:.6f},\n"

js_code = js_code.rstrip(',\n') + "\n"
js_code += """    },
    metricas: {
        r2: 1.0
    },
    constantes: {
        irradiancia_ref_Wm2: 1000,     // G_ref aproximado (STC)
        potencia_panel_nominal: 190,   // W/panel (según dataset: β₁ promedio ≈ 0.19 → 190W)
        performance_ratio: 0.85,       // η_sistema del paper
        dias_mes_promedio: 30.4,
        factor_co2: 0.5,
        // Modelo de costos BOS (Balance of System)
        costo_base_bos: 1500000,       // Costo fijo: inversor, tablero, instalación base
        costo_por_panel: 200000        // Costo por panel (panel + instalación incremental)
    }
};"""

print(js_code)
print()

if diferencias_significativas:
    print("⚠️  HAY DIFERENCIAS SIGNIFICATIVAS. Se recomienda actualizar los valores en script.js")
else:
    print("✅ Los valores coinciden con los calculados del dataset.")

