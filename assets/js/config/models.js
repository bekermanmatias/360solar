/**
 * Solar360 - Modelos de Cálculo
 * Archivo: assets/js/config/models.js
 */

/**
 * Modelo OLS (Ordinary Least Squares)
 * generacion_W = β₀ + β₁·irradiance + β₂·temperatura + β₃·inclinacion
 */
export const MODELO_OLS = {
    coeficientes: {
        intercepto: -8.5,              // β₀
        irradiance_Wm2: 0.19,          // β₁ (principal predictor)
        temperatura_C: 0.12,           // β₂ (efecto positivo moderado)
        inclinacion: 0.05              // β₃ (efecto menor)
    },
    metricas: {
        r2: 0.97,                      // R² > 0.95 (excelente ajuste)
        r2_ajustado: 0.969,
        rmse: 5.8,                     // Error típico en Watts
        mae: 4.2,
        mape: 3.5                      // Error porcentual
    },
    constantes: {
        irradiancia_std: 1000,         // W/m² (STC - Standard Test Conditions)
        potencia_panel_nominal: 190,   // Watts por panel (según dataset experimental)
        performance_ratio: 0.85,       // PR típico (pérdidas del sistema)
        dias_mes_promedio: 30.4,
        factor_co2: 0.5               // kg CO₂ por kWh evitado
    }
};

/**
 * Modelo por Clusters (P = β₁ · G) según paper
 * 
 * Clusters calculados mediante OLS sobre csv/01 - Generacion FV .csv
 * Cluster 1: 10°C, 20°  → β₁ = 0.190800 (N=705 datos, R²=1.0)
 * Cluster 2: 20°C, 20°  → β₁ = 0.183600 (N=703 datos, R²=1.0)
 * Cluster 3: 30°C, 20°  → β₁ = 0.176400 (N=701 datos, R²=1.0)
 * Cluster 4: 10°C, 45°  → β₁ = 0.181260 (N=713 datos, R²=1.0)
 * Cluster 5: 20°C, 45°  → β₁ = 0.174420 (N=714 datos, R²=1.0)
 * Cluster 6: 30°C, 45°  → β₁ = 0.167580 (N=722 datos, R²=1.0)
 */
export const MODELO_CLUSTER = {
    betas: {
        '10_20': 0.190800,  // T=10°C, θ=20° | N=705 datos
        '20_20': 0.183600,  // T=20°C, θ=20° | N=703 datos
        '30_20': 0.176400,  // T=30°C, θ=20° | N=701 datos
        '10_45': 0.181260,  // T=10°C, θ=45° | N=713 datos
        '20_45': 0.174420,  // T=20°C, θ=45° | N=714 datos
        '30_45': 0.167580   // T=30°C, θ=45° | N=722 datos
    },
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
};

/**
 * Discretiza la temperatura mensual y la inclinación del usuario
 * al cluster más cercano, devolviendo el β₁ correspondiente.
 * 
 * @param {number} temperaturaMes - Temperatura promedio del mes
 * @param {number} inclinacionUser - Inclinación de paneles del usuario
 * @returns {number} - Coeficiente β₁ del cluster seleccionado
 */
export function seleccionarClusterBeta1(temperaturaMes, inclinacionUser) {
    let tempCluster;
    if (temperaturaMes <= 15) {
        tempCluster = 10;
    } else if (temperaturaMes <= 25) {
        tempCluster = 20;
    } else {
        tempCluster = 30;
    }

    const angleCluster = inclinacionUser < 32.5 ? 20 : 45;
    const key = `${tempCluster}_${angleCluster}`;
    const beta = MODELO_CLUSTER.betas[key];

    if (beta === undefined) {
        console.warn('Cluster no encontrado, usando 20°C, 20° por defecto');
        return MODELO_CLUSTER.betas['20_20'];
    }

    return beta;
}

