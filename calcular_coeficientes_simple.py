"""
Script simple para calcular coeficientes del modelo OLS
sin necesidad de instalar muchas librerías
"""

# Intentar con numpy y cálculo manual si pandas no está disponible
try:
    import pandas as pd
    import numpy as np
    from numpy.linalg import lstsq
    
    # Cargar datos
    df = pd.read_csv('01 - Generacion FV.csv', sep=';', decimal=',')
    df_modelo = df[df['generacion_W'] > 0].copy()
    
    # Variables
    X = df_modelo[['irradiance_Wm2', 'temperatura_ambiental_°C', 'inclinacion_°']].values
    y = df_modelo['generacion_W'].values
    
    # Añadir columna de unos para intercepto
    X_with_const = np.column_stack([np.ones(len(X)), X])
    
    # Resolver con mínimos cuadrados
    coef, residuals, rank, s = lstsq(X_with_const, y, rcond=None)
    
    # Calcular R²
    y_pred = X_with_const @ coef
    ss_res = np.sum((y - y_pred) ** 2)
    ss_tot = np.sum((y - np.mean(y)) ** 2)
    r2 = 1 - (ss_res / ss_tot)
    
    # Calcular RMSE
    rmse = np.sqrt(np.mean((y - y_pred) ** 2))
    
    print("="*80)
    print("COEFICIENTES DEL MODELO OLS")
    print("="*80)
    print(f"\nIntercepto (β₀): {coef[0]:.6f}")
    print(f"Irradiancia (β₁): {coef[1]:.6f}")
    print(f"Temperatura (β₂): {coef[2]:.6f}")
    print(f"Inclinación (β₃): {coef[3]:.6f}")
    print(f"\nR²: {r2:.6f}")
    print(f"RMSE: {rmse:.4f} W")
    
    print("\n" + "="*80)
    print("ECUACIÓN:")
    print("="*80)
    print(f"generacion_W = {coef[0]:.6f}")
    print(f"             + {coef[1]:.6f} × irradiance_Wm2")
    print(f"             + {coef[2]:.6f} × temperatura_°C")
    print(f"             + {coef[3]:.6f} × inclinacion_°")
    
    # Guardar coeficientes
    import json
    resultado = {
        "coeficientes": {
            "intercepto": float(coef[0]),
            "irradiance_Wm2": float(coef[1]),
            "temperatura_C": float(coef[2]),
            "inclinacion": float(coef[3])
        },
        "metricas": {
            "r2": float(r2),
            "rmse": float(rmse)
        }
    }
    
    with open('coeficientes.json', 'w') as f:
        json.dump(resultado, f, indent=4)
    
    print("\n✅ Coeficientes guardados en 'coeficientes.json'")
    
except ImportError as e:
    print("Error: Faltan dependencias. Instala con: pip install pandas numpy")
    print(f"Detalle: {e}")
except Exception as e:
    print(f"Error: {e}")

