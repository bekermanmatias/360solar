# Dataset Experimental - Generación Fotovoltaica

## Archivo
`01 - Generacion FV .csv`

## Estructura
El archivo contiene datos experimentales con las siguientes columnas:
- `irradiance_Wm2`: Irradiancia solar en W/m²
- `pv_power_kW`: Potencia del panel en kW
- `sky_state`: Estado del cielo (cloudy, clear, etc.)
- `inclinacion_°`: Ángulo de inclinación del panel en grados
- `temperatura_ambiental_°C`: Temperatura ambiente en °C
- `generacion_W`: Generación eléctrica en Watts

## Procesamiento

### Filtrado
Según la metodología del paper (Sección 3.2), se filtran los registros con `irradiance_Wm2 = 0`, ya que representan condiciones nocturnas y distorsionarían el cálculo de eficiencia.

### Clusters
Los datos se agrupan en 6 clusters según:
- **Temperatura**: Discretizada a {10, 20, 30}°C
  - ≤ 15°C → 10°C
  - 15°C < T ≤ 25°C → 20°C
  - > 25°C → 30°C

- **Inclinación**: Discretizada a {20, 45}°
  - < 32.5° → 20°
  - ≥ 32.5° → 45°

### Cálculo de Coeficientes β₁

Para cada cluster, se calcula el coeficiente mediante **Mínimos Cuadrados Ordinarios (OLS)**:

**Modelo**: P = β₁ · G

**Fórmula OLS** (sin intercepto, ya que β₀ ≈ 0 según el paper):
```
β₁ = Σ(G · P) / Σ(G²)
```

Donde:
- G: Irradiancia (W/m²)
- P: Potencia generada (W)

### Resultados

| Cluster | Condiciones | β₁ | R² | N datos |
|---------|-------------|-----|-----|---------|
| 10_20 | T=10°C, θ=20° | 0.190800 | 1.0000 | 705 |
| 20_20 | T=20°C, θ=20° | 0.183600 | 1.0000 | 703 |
| 30_20 | T=30°C, θ=20° | 0.176400 | 1.0000 | 701 |
| 10_45 | T=10°C, θ=45° | 0.181260 | 1.0000 | 713 |
| 20_45 | T=20°C, θ=45° | 0.174420 | 1.0000 | 714 |
| 30_45 | T=30°C, θ=45° | 0.167580 | 1.0000 | 722 |

**Nota**: R² = 1.0 indica un ajuste perfecto del modelo lineal a los datos experimentales.

## Recalcular Coeficientes

Para recalcular los coeficientes si se actualiza el dataset:

```bash
python calcular_coeficientes.py
```

El script:
1. Lee el CSV y filtra datos con irradiancia > 0
2. Agrupa por clusters según temperatura e inclinación
3. Calcula β₁ mediante OLS para cada cluster
4. Compara con valores actuales en `script.js`
5. Genera código JavaScript actualizado

## Referencias

- Paper: "Metodología optimizada para la estimación de potencia en sistemas fotovoltaicos"
- Sección 2: Marco Teórico - Regresión Lineal Simple por Mínimos Cuadrados
- Sección 3.1: Definición de Clusters Operativos
- Sección 3.2: Procesamiento de Datos
- Sección 4.1: Funciones Obtenidas por Cluster

