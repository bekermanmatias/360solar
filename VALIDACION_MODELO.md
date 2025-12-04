# Validación del Modelo Solar360

Este documento explica cómo validar que el simulador implementa correctamente la metodología descrita en el paper técnico.

## Metodología del Paper

El simulador utiliza un **modelo de clusters** con regresión lineal simple:

1. **6 Clusters Operativos**: Combinaciones de temperatura (10°C, 20°C, 30°C) e inclinación (20°, 45°)
2. **Función de Generación**: `P = β₁ × G` (donde β₀ ≈ 0)
3. **Coeficientes β₁**: Según Tabla 1 del documento
4. **Performance Ratio (PR)**: 0.85 (pérdidas del sistema)
5. **Modelo BOS**: Costo Base $1.5M + Costo por Panel $200k

## Coeficientes β₁ (Tabla 1 del Documento)

| Cluster | Condiciones (T, θ) | β₁ (Eficiencia) | R² |
|---------|-------------------|-----------------|-----|
| 1 | 10°C, 20° | 0.1908 (19.08%) | 1.0 |
| 2 | 20°C, 20° | 0.1836 (18.36%) | 1.0 |
| 3 | 30°C, 20° | 0.1764 (17.64%) | 1.0 |
| 4 | 10°C, 45° | 0.1813 (18.13%) | 1.0 |
| 5 | 20°C, 45° | 0.1744 (17.44%) | 1.0 |
| 6 | 30°C, 45° | 0.1676 (16.76%) | 1.0 |

## Algoritmo de Dimensionamiento

Según Sección 5.1 del documento:

1. **Selección de Cluster**: Discretiza `T_mes` al valor más cercano {10, 20, 30}°C y `θ_user` a {20, 45}°
2. **Cálculo de Potencia**: `P_panel (W) = β₁ × 1000 W/m²`
3. **Cálculo de Energía**: `E_unit (kWh) = (P_panel × HSP × 30) / 1000`
4. **Número de Paneles**: `N = ⌈E_obj / (E_unit × PR)⌉` donde PR = 0.85
5. **Costo Total**: `Costo = $1.5M (BOS) + N × $200k`

## Cómo Validar

### Opción 1: Validación Automática (Recomendada)

Abre la consola del navegador (F12) y ejecuta:

```javascript
// Ejecutar validación completa
validarModelo()
```

Esto ejecutará todas las validaciones y mostrará un reporte detallado.

### Opción 2: Validaciones Individuales

```javascript
// Validar solo los coeficientes β₁
validarCoeficientes()

// Validar la selección de cluster
validarCluster()

// Validar el cálculo de generación (caso: La Plata)
validarGeneracion()
```

### Opción 3: Validación Manual

#### 1. Verificar Coeficientes β₁

```javascript
// Ver todos los coeficientes
console.log(MODELO_CLUSTER.betas)

// Verificar un cluster específico
console.log(MODELO_CLUSTER.betas['20_20']) // Debe ser 0.1836
```

#### 2. Verificar Selección de Cluster

```javascript
// Probar diferentes temperaturas e inclinaciones
seleccionarClusterBeta1(20, 20)  // Debe retornar 0.1836
seleccionarClusterBeta1(30, 45)  // Debe retornar 0.1676
seleccionarClusterBeta1(10, 45)  // Debe retornar 0.1813
```

#### 3. Verificar Constantes

```javascript
// Performance Ratio debe ser 0.85
console.log(MODELO_CLUSTER.constantes.performance_ratio) // 0.85

// Costo Base BOS debe ser $1.5M
console.log(MODELO_CLUSTER.constantes.costo_base_bos) // 1500000

// Costo por panel debe ser $200k
console.log(MODELO_CLUSTER.constantes.costo_por_panel) // 200000
```

#### 4. Validar Cálculo Completo (Caso: La Plata)

Según el documento, para La Plata con:
- Consumo: 350 kWh/mes
- Inclinación: 45°
- Resultado esperado: ~17 paneles, ~4200 kWh/año

```javascript
// Crear datos de prueba
const datos = {
    consumo_mensual: 350,
    precio_kwh: 180,
    inclinacion: 45,
    temperatura: [24.8, 24.2, 20.4, 14.8, 8.4, 9.9, 6.1, 8.7, 13.4, 17.9, 19.1, 20.6],
    psh: [7.86, 6.01, 4.99, 3.25, 2.70, 2.10, 2.62, 2.92, 4.76, 5.85, 6.90, 7.70]
};

// Calcular generación
const generacion = calcularGeneracionMensual(datos);

// Calcular resultados
const resultados = calcularResultados(datos, generacion);

// Verificar resultados
console.log('Paneles:', resultados.num_paneles); // Debe ser ~17
console.log('Energía anual:', resultados.energia_anual_total); // Debe ser ~4200 kWh
console.log('Costo total:', resultados.costo_total); // Debe ser ~$4.9M
console.log('ROI:', resultados.roi_anos); // Debe ser ~6.1 años
```

## Validaciones Esperadas

### ✅ Coeficientes β₁
- Todos los 6 coeficientes deben coincidir exactamente con la Tabla 1
- Tolerancia: ±0.0001 (errores de redondeo)

### ✅ Selección de Cluster
- T ≤ 15°C → Cluster 10°C
- 15°C < T ≤ 25°C → Cluster 20°C
- T > 25°C → Cluster 30°C
- θ < 32.5° → Cluster 20°
- θ ≥ 32.5° → Cluster 45°

### ✅ Cálculo de Generación
- Fórmula: `P = β₁ × G` donde G = 1000 W/m² (STC)
- Energía diaria: `E_diaria = P × HSP × PR`
- Energía mensual: `E_mensual = E_diaria × 30.4 / 1000`

### ✅ Modelo BOS
- Costo Base: $1,500,000 ARS
- Costo por Panel: $200,000 ARS
- Costo Total: `BOS + (N × $200k)`

### ✅ Caso de Prueba: La Plata
- Paneles: 16-18 (tolerancia ±2)
- Energía anual: 4000-4500 kWh
- ROI: 5.5-6.5 años

## Interpretación de Resultados

Si todas las validaciones pasan:
- ✅ El simulador implementa correctamente la metodología del paper
- ✅ Los cálculos son matemáticamente correctos
- ✅ El modelo es consistente con los datos experimentales

Si alguna validación falla:
- ⚠️ Revisar los detalles en la consola
- ⚠️ Verificar que los valores en `models.js` coincidan con el documento
- ⚠️ Verificar que las fórmulas en `calculations.js` sean correctas

## Archivos Relevantes

- `assets/js/config/models.js`: Define los coeficientes β₁ y constantes
- `assets/js/utils/calculations.js`: Implementa el algoritmo de cálculo
- `assets/js/utils/validation.js`: Script de validación automática

## Notas Técnicas

1. **Precisión de β₁**: Los valores en el código tienen más decimales que en el documento (ej: 0.181260 vs 0.1813) debido a que se almacenan con mayor precisión. La validación usa una tolerancia de ±0.0001.

2. **Discretización de Temperatura**: El algoritmo aproxima la temperatura al cluster más cercano. Por ejemplo, 22°C se aproxima a 20°C (cluster 2).

3. **Performance Ratio**: El PR de 0.85 se aplica en el cálculo de energía diaria, no en el número de paneles. Esto es equivalente matemáticamente a aplicar PR en el denominador.

4. **Modelo BOS**: El costo base ($1.5M) incluye inversor, tableros, estructura base, cableado y mano de obra. El costo por panel ($200k) incluye el panel y la instalación incremental.

