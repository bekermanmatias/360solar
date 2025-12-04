/**
 * Solar360 - Funciones de Cálculo
 * Archivo: assets/js/utils/calculations.js
 */

import { MODELO_CLUSTER, seleccionarClusterBeta1 } from '../config/models.js';
import { MESES } from '../config/constants.js';

/**
 * Calcula la generación mensual usando el modelo de clusters
 * @param {Object} datos - Datos del sistema (psh, temperatura, inclinacion)
 * @returns {Array} - Array con la generación mensual
 */
/**
 * Calcula la generación mensual usando el modelo de clusters según el paper (Sección 5.2)
 * Fórmula del paper: E_{u,m} = (β₁·G_m) × HSP_m × Días_m / 1000 [kWh/mes]
 * 
 * Donde:
 * - β₁: Coeficiente del cluster (eficiencia)
 * - G_m: Irradiancia promedio del mes (W/m²). Usamos G_ref = 1000 W/m² (STC)
 * - HSP_m: Horas de sol pico del mes (kWh/m²/día) - ya tenemos en psh
 * - Días_m: Días del mes
 * 
 * Simplificando: E_{u,m} = (β₁ × 1000) × PSH_m × Días_m / 1000 = β₁ × PSH_m × Días_m
 * 
 * @param {Object} datos - Datos del sistema (psh, temperatura, inclinacion)
 * @returns {Array} - Array con la generación mensual
 */
export function calcularGeneracionMensual(datos) {
    const generacion = [];
    
    // Días por mes
    const diasPorMes = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    for (let mes = 0; mes < 12; mes++) {
        const temperaturaMes = datos.temperatura[mes];
        const inclinacionUser = datos.inclinacion;
        const psh = datos.psh[mes]; // HSP_m (Horas de Sol Pico en kWh/m²/día)
        const diasMes = diasPorMes[mes];

        // Selección de cluster → β₁ (según T_mes y θ_user)
        const beta1 = seleccionarClusterBeta1(temperaturaMes, inclinacionUser);

        // Energía mensual por panel según fórmula del paper (Sección 5.2, Paso A)
        // E_{u,m} = (β₁·G_m) × HSP_m × Días_m / 1000
        // Con G_m = 1000 W/m² (irradiancia de referencia STC)
        // Simplificando: E_{u,m} = β₁ × PSH_m × Días_m
        const energia_mensual_kWh = beta1 * psh * diasMes;

        generacion.push({
            mes: MESES[mes],
            psh: psh,
            temperatura: temperaturaMes,
            beta1_cluster: beta1,
            energia_mensual: energia_mensual_kWh
        });
    }

    return generacion;
}

/**
 * Calcula los resultados finales del sistema
 * @param {Object} datos - Datos del sistema
 * @param {Array} generacionMensual - Generación mensual calculada
 * @returns {Object} - Resultados completos del cálculo
 */
export function calcularResultados(datos, generacionMensual) {
    // Energía total anual por panel
    const energia_anual_por_panel = generacionMensual.reduce((sum, mes) => sum + mes.energia_mensual, 0);

    // Energía anual requerida
    const energia_anual_requerida = datos.consumo_mensual * 12;

    // Calcular número de paneles según el modo de dimensionamiento
    let num_paneles;
    let porcentaje_objetivo = null;

    if (datos.modo_dimensionamiento === 'paneles' && datos.num_paneles_fijo) {
        // Modo: Elegir cantidad de paneles
        num_paneles = datos.num_paneles_fijo;
    } else {
        // Modo: Reducir factura por porcentaje
        const porcentaje = datos.porcentaje_cobertura || 100;
        porcentaje_objetivo = porcentaje;
        const energia_objetivo = energia_anual_requerida * (porcentaje / 100);
        num_paneles = Math.ceil(energia_objetivo / energia_anual_por_panel);
    }

    // Energía total del sistema
    const energia_anual_total = energia_anual_por_panel * num_paneles;
    const energia_mensual_promedio = energia_anual_total / 12;

    // Costos con modelo BOS (Balance of System)
    const costo_base = MODELO_CLUSTER.constantes.costo_base_bos;
    const costo_paneles = num_paneles * MODELO_CLUSTER.constantes.costo_por_panel;
    const costo_total = costo_base + costo_paneles;

    // Ahorros
    const ahorro_anual = energia_anual_total * datos.precio_kwh;
    const ahorro_mensual = ahorro_anual / 12;

    // Periodo de Recupero (Payback)
    let roi_anos = Infinity;
    if (ahorro_anual > 0) {
        roi_anos = costo_total / ahorro_anual;
    }

    // Cobertura del consumo
    const cobertura = (energia_anual_total / energia_anual_requerida) * 100;

    // Impacto ambiental
    const co2_anual = energia_anual_total * MODELO_CLUSTER.constantes.factor_co2;
    const co2_25_anos = co2_anual * 25;

    // Potencia total instalada
    const potencia_total_kw = (num_paneles * MODELO_CLUSTER.constantes.potencia_panel_nominal) / 1000;

    return {
        num_paneles,
        potencia_total_kw,
        energia_anual_total,
        energia_mensual_promedio,
        cobertura,
        costo_base,
        costo_paneles,
        costo_total,
        ahorro_anual,
        ahorro_mensual,
        roi_anos,
        co2_anual,
        co2_25_anos,
        porcentaje_objetivo,
        modo_dimensionamiento: datos.modo_dimensionamiento,
        tipo_panel: datos.tipo_panel || 'estandar',
        precio_kwh: datos.precio_kwh
    };
}

/**
 * Calcula el ahorro acumulado a N años (sin inflación)
 * @param {number} ahorroAnual - Ahorro anual base
 * @param {number} anos - Número de años
 * @returns {number} - Ahorro acumulado total
 */
export function calcularAhorroAcumulado(ahorroAnual, anos = 25) {
    // Sin inflación: simplemente multiplicar el ahorro anual por los años
    return ahorroAnual * anos;
}

/**
 * Calcula equivalencias ambientales
 * @param {number} co2Anual - CO₂ evitado anual en kg
 * @returns {Object} - Equivalencias ambientales
 */
/**
 * Calcula equivalencias ambientales según el paper (Sección 5.4)
 * @param {number} co2Anual - CO₂ evitado anual en kg
 * @returns {Object} - Equivalencias ambientales
 */
export function calcularEquivalenciasAmbientales(co2Anual) {
    const co225Anos = co2Anual * 25;
    
    return {
        arboles: Math.round(co225Anos / 22), // 1 árbol ≈ 22 kg CO₂/año (según paper)
        autos: Math.round(co225Anos / 2500), // 1 auto ≈ 2500 kg CO₂/año (según paper)
        vuelos: Math.round(co225Anos / 500), // 1 vuelo BA-Madrid ≈ 500 kg CO₂
        hogares: Math.round(co225Anos / 4000) // 1 hogar ≈ 4000 kg CO₂/año (mantenido)
    };
}

