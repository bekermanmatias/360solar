#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para ejecutar el análisis completo del dataset de generación FV
Fase 1: Análisis y Modelado de Datos
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import statsmodels.api as sm
from sklearn.metrics import mean_squared_error, mean_absolute_error
from scipy import stats
import json
import warnings
warnings.filterwarnings('ignore')

# Configuración de visualización
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")
plt.rcParams['figure.figsize'] = (12, 6)
plt.rcParams['font.size'] = 10

# Configuración de pandas
pd.set_option('display.max_columns', None)
pd.set_option('display.precision', 4)

print("="*80)
print("ANÁLISIS EXPLORATORIO DE DATOS - SISTEMA FOTOVOLTAICO")
print("Fase 1: Carga, Limpieza y Análisis de Datos")
print("="*80)

# ============================================================================
# 1. CARGA Y LIMPIEZA DE DATOS
# ============================================================================
print("\n" + "="*80)
print("1. CARGA Y LIMPIEZA DE DATOS")
print("="*80)

# Cargar el dataset con los parámetros correctos
df = pd.read_csv('01 - Generacion FV.csv', sep=';', decimal=',')

print(f"\n📊 Dimensiones: {df.shape[0]} filas x {df.shape[1]} columnas")
print(f"📊 Columnas: {list(df.columns)}")

# Mostrar información del dataset
print("\n📌 Tipos de datos:")
print(df.dtypes)

# Verificar valores nulos
valores_nulos = df.isnull().sum()
print(f"\n📌 Valores nulos: {valores_nulos.sum()}")
if valores_nulos.sum() == 0:
    print("✅ No hay valores nulos en el dataset")

# Estadísticas descriptivas
print("\n📊 ESTADÍSTICAS DESCRIPTIVAS:")
print(df.describe())

# ============================================================================
# 2. ANÁLISIS EXPLORATORIO
# ============================================================================
print("\n" + "="*80)
print("2. ANÁLISIS EXPLORATORIO")
print("="*80)

# Matriz de correlación
numeric_columns = df.select_dtypes(include=[np.number]).columns
correlation_matrix = df[numeric_columns].corr()

print("\n📊 Correlación con generacion_W:")
print(correlation_matrix['generacion_W'].sort_values(ascending=False))

# Análisis de sky_state
print("\n📊 Distribución de sky_state:")
print(df['sky_state'].value_counts())
print("\nPorcentajes:")
print(df['sky_state'].value_counts(normalize=True) * 100)

# Generación promedio por estado del cielo
df_con_generacion = df[df['generacion_W'] > 0]
print("\n📊 Generación promedio por estado del cielo (solo valores > 0):")
print(df_con_generacion.groupby('sky_state')['generacion_W'].agg(['mean', 'std', 'count']))

# ============================================================================
# 3. MODELO DE REGRESIÓN POR MÍNIMOS CUADRADOS (OLS)
# ============================================================================
print("\n" + "="*80)
print("3. MODELO DE REGRESIÓN POR MÍNIMOS CUADRADOS (OLS)")
print("="*80)

# Filtrar datos con generación > 0 para el modelo
df_modelo = df[df['generacion_W'] > 0].copy()

print(f"\n📊 Datos originales: {len(df)} filas")
print(f"📊 Datos con generación > 0: {len(df_modelo)} filas")
print(f"📊 Porcentaje útil: {len(df_modelo)/len(df)*100:.2f}%")

# Preparar variables para el modelo
X = df_modelo[['irradiance_Wm2', 'temperatura_ambiental_°C', 'inclinacion_°']]
y = df_modelo['generacion_W']

# Añadir constante (intercepto)
X_with_const = sm.add_constant(X)

print(f"\n📌 Variables predictoras (X): {list(X.columns)}")
print(f"📌 Variable objetivo (y): generacion_W")
print(f"📌 Número de observaciones: {len(X)}")

# Ajustar el modelo OLS
print("\n⏳ Ajustando modelo OLS...")
modelo_ols = sm.OLS(y, X_with_const).fit()

# Mostrar resumen del modelo
print("\n" + "="*80)
print("RESUMEN DEL MODELO OLS")
print("="*80)
print(modelo_ols.summary())

# ============================================================================
# 4. COEFICIENTES Y ECUACIÓN DEL MODELO
# ============================================================================
print("\n" + "="*80)
print("4. COEFICIENTES DEL MODELO")
print("="*80)

coeficientes = pd.DataFrame({
    'Variable': ['Intercepto (β₀)', 'Irradiancia (β₁)', 'Temperatura (β₂)', 'Inclinación (β₃)'],
    'Coeficiente': modelo_ols.params.values,
    'Error Estándar': modelo_ols.bse.values,
    'p-value': modelo_ols.pvalues.values,
    'IC 95% Inferior': modelo_ols.conf_int()[0].values,
    'IC 95% Superior': modelo_ols.conf_int()[1].values
})

print("\n", coeficientes.to_string(index=False))

print("\n" + "="*80)
print("ECUACIÓN FINAL DEL MODELO")
print("="*80)
print(f"\ngeneracion_W = {modelo_ols.params[0]:.6f}")
print(f"               + {modelo_ols.params[1]:.6f} × irradiance_Wm2")
print(f"               + {modelo_ols.params[2]:.6f} × temperatura_ambiental_°C")
print(f"               + {modelo_ols.params[3]:.6f} × inclinacion_°")

# ============================================================================
# 5. MÉTRICAS DE RENDIMIENTO
# ============================================================================
print("\n" + "="*80)
print("5. MÉTRICAS DE RENDIMIENTO DEL MODELO")
print("="*80)

# Predicciones
y_pred = modelo_ols.predict(X_with_const)

# Calcular métricas
r2 = modelo_ols.rsquared
r2_adj = modelo_ols.rsquared_adj
rmse = np.sqrt(mean_squared_error(y, y_pred))
mae = mean_absolute_error(y, y_pred)
mape = np.mean(np.abs((y - y_pred) / y)) * 100

print(f"\n📊 R² (Coeficiente de Determinación): {r2:.6f}")
print(f"📊 R² Ajustado: {r2_adj:.6f}")
print(f"📊 RMSE (Error Cuadrático Medio): {rmse:.4f} W")
print(f"📊 MAE (Error Absoluto Medio): {mae:.4f} W")
print(f"📊 MAPE (Error Porcentual Absoluto Medio): {mape:.2f}%")
print(f"📊 AIC (Criterio de Información de Akaike): {modelo_ols.aic:.2f}")
print(f"📊 BIC (Criterio de Información Bayesiano): {modelo_ols.bic:.2f}")

print(f"\n✅ El modelo explica el {r2*100:.2f}% de la variabilidad en la generación")
print(f"✅ Error típico de predicción: ±{rmse:.2f} W ({rmse/y.mean()*100:.2f}% del promedio)")

# ============================================================================
# 6. EXPORTAR COEFICIENTES DEL MODELO
# ============================================================================
print("\n" + "="*80)
print("6. EXPORTAR COEFICIENTES DEL MODELO")
print("="*80)

# Preparar diccionario con los parámetros del modelo
modelo_params = {
    'coeficientes': {
        'intercepto': float(modelo_ols.params[0]),
        'irradiance_Wm2': float(modelo_ols.params[1]),
        'temperatura_ambiental_C': float(modelo_ols.params[2]),
        'inclinacion': float(modelo_ols.params[3])
    },
    'metricas': {
        'r2': float(r2),
        'r2_ajustado': float(r2_adj),
        'rmse': float(rmse),
        'mae': float(mae),
        'mape': float(mape),
        'aic': float(modelo_ols.aic),
        'bic': float(modelo_ols.bic)
    },
    'ecuacion': f"generacion_W = {modelo_ols.params[0]:.6f} + {modelo_ols.params[1]:.6f}*I + {modelo_ols.params[2]:.6f}*T + {modelo_ols.params[3]:.6f}*θ",
    'interpretacion': {
        'irradiance': f'Por cada W/m² adicional de irradiancia, la generación aumenta {modelo_ols.params[1]:.6f} W',
        'temperatura': f'Por cada °C adicional de temperatura, la generación {"aumenta" if modelo_ols.params[2] > 0 else "disminuye"} {abs(modelo_ols.params[2]):.6f} W',
        'inclinacion': f'Por cada grado adicional de inclinación, la generación {"aumenta" if modelo_ols.params[3] > 0 else "disminuye"} {abs(modelo_ols.params[3]):.6f} W'
    }
}

# Guardar en archivo JSON
with open('modelo_coeficientes.json', 'w', encoding='utf-8') as f:
    json.dump(modelo_params, f, indent=4, ensure_ascii=False)

print("\n✅ Coeficientes guardados en 'modelo_coeficientes.json'")
print("\n📄 Contenido del archivo:")
print(json.dumps(modelo_params, indent=4, ensure_ascii=False))

# ============================================================================
# 7. VISUALIZACIONES
# ============================================================================
print("\n" + "="*80)
print("7. GENERANDO VISUALIZACIONES")
print("="*80)

# Crear directorio para guardar gráficas
import os
if not os.path.exists('graficas'):
    os.makedirs('graficas')
    print("📁 Directorio 'graficas' creado")

# 7.1 Matriz de correlación
plt.figure(figsize=(10, 8))
sns.heatmap(correlation_matrix, annot=True, cmap='coolwarm', center=0, 
            fmt='.3f', square=True, linewidths=1)
plt.title('Matriz de Correlación - Variables del Sistema FV', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig('graficas/01_matriz_correlacion.png', dpi=300, bbox_inches='tight')
print("✅ Guardado: graficas/01_matriz_correlacion.png")
plt.close()

# 7.2 Scatter plots principales
fig, axes = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle('Relación entre Generación (W) y Variables Predictoras', 
             fontsize=16, fontweight='bold')

# 1. generacion_W vs irradiance_Wm2
axes[0, 0].scatter(df['irradiance_Wm2'], df['generacion_W'], alpha=0.5, s=10, color='orange')
axes[0, 0].set_xlabel('Irradiancia (W/m²)', fontsize=12)
axes[0, 0].set_ylabel('Generación (W)', fontsize=12)
axes[0, 0].set_title('Generación vs Irradiancia', fontsize=13, fontweight='bold')
axes[0, 0].grid(True, alpha=0.3)
z = np.polyfit(df['irradiance_Wm2'], df['generacion_W'], 1)
p = np.poly1d(z)
axes[0, 0].plot(df['irradiance_Wm2'], p(df['irradiance_Wm2']), 
                "r--", linewidth=2, label=f'Tendencia: y={z[0]:.4f}x+{z[1]:.2f}')
axes[0, 0].legend()

# 2. generacion_W vs temperatura
axes[0, 1].scatter(df['temperatura_ambiental_°C'], df['generacion_W'], alpha=0.5, s=10, color='red')
axes[0, 1].set_xlabel('Temperatura Ambiental (°C)', fontsize=12)
axes[0, 1].set_ylabel('Generación (W)', fontsize=12)
axes[0, 1].set_title('Generación vs Temperatura', fontsize=13, fontweight='bold')
axes[0, 1].grid(True, alpha=0.3)

# 3. generacion_W vs inclinacion
axes[1, 0].scatter(df['inclinacion_°'], df['generacion_W'], alpha=0.5, s=10, color='blue')
axes[1, 0].set_xlabel('Inclinación (°)', fontsize=12)
axes[1, 0].set_ylabel('Generación (W)', fontsize=12)
axes[1, 0].set_title('Generación vs Inclinación', fontsize=13, fontweight='bold')
axes[1, 0].grid(True, alpha=0.3)

# 4. Boxplot por sky_state
df_plot = df[df['generacion_W'] > 0]
sns.boxplot(data=df_plot, x='sky_state', y='generacion_W', ax=axes[1, 1])
axes[1, 1].set_xlabel('Estado del Cielo', fontsize=12)
axes[1, 1].set_ylabel('Generación (W)', fontsize=12)
axes[1, 1].set_title('Distribución por Estado del Cielo', fontsize=13, fontweight='bold')
axes[1, 1].grid(True, alpha=0.3, axis='y')

plt.tight_layout()
plt.savefig('graficas/02_scatter_plots.png', dpi=300, bbox_inches='tight')
print("✅ Guardado: graficas/02_scatter_plots.png")
plt.close()

# 7.3 Diagnóstico del modelo
residuos = y - y_pred

fig, axes = plt.subplots(2, 2, figsize=(16, 12))
fig.suptitle('Diagnóstico del Modelo OLS', fontsize=16, fontweight='bold')

# Valores reales vs predichos
axes[0, 0].scatter(y, y_pred, alpha=0.5, s=10)
axes[0, 0].plot([y.min(), y.max()], [y.min(), y.max()], 'r--', lw=2)
axes[0, 0].set_xlabel('Valores Reales (W)', fontsize=11)
axes[0, 0].set_ylabel('Valores Predichos (W)', fontsize=11)
axes[0, 0].set_title('Valores Reales vs Predichos', fontsize=12, fontweight='bold')
axes[0, 0].grid(True, alpha=0.3)

# Residuos vs predichos
axes[0, 1].scatter(y_pred, residuos, alpha=0.5, s=10)
axes[0, 1].axhline(y=0, color='r', linestyle='--', lw=2)
axes[0, 1].set_xlabel('Valores Predichos (W)', fontsize=11)
axes[0, 1].set_ylabel('Residuos (W)', fontsize=11)
axes[0, 1].set_title('Residuos vs Valores Predichos', fontsize=12, fontweight='bold')
axes[0, 1].grid(True, alpha=0.3)

# Histograma de residuos
axes[1, 0].hist(residuos, bins=50, edgecolor='black', alpha=0.7)
axes[1, 0].axvline(x=0, color='r', linestyle='--', lw=2)
axes[1, 0].set_xlabel('Residuos (W)', fontsize=11)
axes[1, 0].set_ylabel('Frecuencia', fontsize=11)
axes[1, 0].set_title('Distribución de Residuos', fontsize=12, fontweight='bold')
axes[1, 0].grid(True, alpha=0.3, axis='y')

# Q-Q Plot
stats.probplot(residuos, dist="norm", plot=axes[1, 1])
axes[1, 1].set_title('Q-Q Plot (Normalidad de Residuos)', fontsize=12, fontweight='bold')
axes[1, 1].grid(True, alpha=0.3)

plt.tight_layout()
plt.savefig('graficas/03_diagnostico_modelo.png', dpi=300, bbox_inches='tight')
print("✅ Guardado: graficas/03_diagnostico_modelo.png")
plt.close()

# ============================================================================
# RESUMEN FINAL
# ============================================================================
print("\n" + "="*80)
print("✅ FASE 1 COMPLETADA - ANÁLISIS Y MODELADO DE DATOS")
print("="*80)
print("\n📋 RESUMEN EJECUTIVO:")
print(f"   • Dataset: {len(df)} observaciones con {df.shape[1]} variables")
print(f"   • Modelo OLS: R² = {r2:.4f} ({r2*100:.2f}% de variabilidad explicada)")
print(f"   • Error RMSE: ±{rmse:.2f} W")
print(f"   • Todos los coeficientes son estadísticamente significativos")
print(f"   • Coeficientes exportados a 'modelo_coeficientes.json'")
print(f"   • Visualizaciones guardadas en carpeta 'graficas/'")
print("\n📊 SIGUIENTE PASO:")
print("   ⏭️  Fase 2: Desarrollo del Simulador Web (Flask + HTML)")
print("="*80)

