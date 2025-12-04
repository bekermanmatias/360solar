/**
 * Solar360 - Script de Validación del Modelo
 * Archivo: assets/js/utils/validation.js
 * 
 * Valida que el simulador implemente correctamente la metodología del paper:
 * - Modelo de Clusters con 6 escenarios (T: 10,20,30°C × θ: 20,45°)
 * - Regresión Lineal Simple: P = β₁ × G (donde β₀ ≈ 0)
 * - Cálculo de generación con PR = 0.85
 * - Modelo BOS: Costo Base $1.5M + Costo por Panel $200k
 */

import { MODELO_CLUSTER, seleccionarClusterBeta1 } from '../config/models.js';
import { calcularGeneracionMensual, calcularResultados } from './calculations.js';

/**
 * Valida los coeficientes β₁ según Tabla 1 del documento
 */
export function validarCoeficientesBeta() {
    const esperados = {
        '10_20': 0.1908,  // Cluster 1: 19.08%
        '20_20': 0.1836,  // Cluster 2: 18.36%
        '30_20': 0.1764,  // Cluster 3: 17.64%
        '10_45': 0.1813,  // Cluster 4: 18.13%
        '20_45': 0.1744,  // Cluster 5: 17.44%
        '30_45': 0.1676   // Cluster 6: 16.76%
    };

    const resultados = {
        correctos: 0,
        incorrectos: 0,
        detalles: []
    };

    for (const [key, esperado] of Object.entries(esperados)) {
        const actual = MODELO_CLUSTER.betas[key];
        const diferencia = Math.abs(actual - esperado);
        const tolerancia = 0.0001; // Tolerancia para errores de redondeo

        if (diferencia <= tolerancia) {
            resultados.correctos++;
            resultados.detalles.push({
                cluster: key,
                esperado,
                actual,
                estado: '✓ CORRECTO'
            });
        } else {
            resultados.incorrectos++;
            resultados.detalles.push({
                cluster: key,
                esperado,
                actual,
                diferencia,
                estado: '✗ ERROR'
            });
        }
    }

    return resultados;
}

/**
 * Valida la función de selección de cluster
 */
export function validarSeleccionCluster() {
    const casosPrueba = [
        { temp: 10, angle: 20, esperado: '10_20', beta: 0.1908 },
        { temp: 20, angle: 20, esperado: '20_20', beta: 0.1836 },
        { temp: 30, angle: 20, esperado: '30_20', beta: 0.1764 },
        { temp: 10, angle: 45, esperado: '10_45', beta: 0.1813 },
        { temp: 20, angle: 45, esperado: '20_45', beta: 0.1744 },
        { temp: 30, angle: 45, esperado: '30_45', beta: 0.1676 },
        // Casos límite
        { temp: 15, angle: 20, esperado: '10_20', beta: 0.1908 }, // T ≤ 15 → 10°C
        { temp: 16, angle: 20, esperado: '20_20', beta: 0.1836 }, // 15 < T ≤ 25 → 20°C
        { temp: 25, angle: 20, esperado: '20_20', beta: 0.1836 },
        { temp: 26, angle: 20, esperado: '30_20', beta: 0.1764 }, // T > 25 → 30°C
        { temp: 20, angle: 32, esperado: '20_20', beta: 0.1836 }, // θ < 32.5 → 20°
        { temp: 20, angle: 33, esperado: '20_45', beta: 0.1744 }  // θ ≥ 32.5 → 45°
    ];

    const resultados = {
        correctos: 0,
        incorrectos: 0,
        detalles: []
    };

    casosPrueba.forEach(caso => {
        const beta = seleccionarClusterBeta1(caso.temp, caso.angle);
        const diferencia = Math.abs(beta - caso.beta);
        const tolerancia = 0.0001;

        if (diferencia <= tolerancia) {
            resultados.correctos++;
            resultados.detalles.push({
                temp: caso.temp,
                angle: caso.angle,
                esperado: caso.esperado,
                beta_esperado: caso.beta,
                beta_obtenido: beta,
                estado: '✓ CORRECTO'
            });
        } else {
            resultados.incorrectos++;
            resultados.detalles.push({
                temp: caso.temp,
                angle: caso.angle,
                esperado: caso.esperado,
                beta_esperado: caso.beta,
                beta_obtenido: beta,
                diferencia,
                estado: '✗ ERROR'
            });
        }
    });

    return resultados;
}

/**
 * Valida el cálculo de generación según el algoritmo del paper
 * Caso de prueba: La Plata, 350 kWh/mes, 45° inclinación
 */
export function validarCalculoGeneracion() {
    // Datos de ejemplo del paper (La Plata, Buenos Aires)
    const datos = {
        consumo_mensual: 350,
        precio_kwh: 180,
        inclinacion: 45,
        temperatura: [24.8, 24.2, 20.4, 14.8, 8.4, 9.9, 6.1, 8.7, 13.4, 17.9, 19.1, 20.6],
        psh: [7.86, 6.01, 4.99, 3.25, 2.70, 2.10, 2.62, 2.92, 4.76, 5.85, 6.90, 7.70]
    };

    const generacion = calcularGeneracionMensual(datos);
    const resultados = calcularResultados(datos, generacion);

        // Validaciones según el paper
        const validaciones = {
            // El paper indica que para La Plata con 45° se requieren ~17 paneles
            num_paneles_esperado: 17,
            num_paneles_obtenido: resultados.num_paneles,
            num_paneles_correcto: Math.abs(resultados.num_paneles - 17) <= 2, // Tolerancia ±2 paneles

            // Generación anual esperada: ~4200-4400 kWh según el paper
            energia_anual_esperada: 4200,
            energia_anual_obtenida: resultados.energia_anual_total,
            energia_anual_correcta: resultados.energia_anual_total >= 4000 && resultados.energia_anual_total <= 4500,

            // PR debe ser 0.85
            pr_esperado: 0.85,
            pr_obtenido: MODELO_CLUSTER.constantes.performance_ratio,
            pr_correcto: Math.abs(MODELO_CLUSTER.constantes.performance_ratio - 0.85) < 0.01,

            // Modelo BOS: Costo Base $1.5M
            costo_base_esperado: 1500000,
            costo_base_obtenido: resultados.costo_base,
            costo_base_correcto: resultados.costo_base === 1500000,

            // Costo por panel: $200k
            costo_panel_esperado: 200000,
            costo_panel_obtenido: MODELO_CLUSTER.constantes.costo_por_panel,
            costo_panel_correcto: MODELO_CLUSTER.constantes.costo_por_panel === 200000,

            // Cálculo de costo total: BOS + (N × $200k)
            costo_total_esperado: 1500000 + (resultados.num_paneles * 200000),
            costo_total_obtenido: resultados.costo_total,
            costo_total_correcto: Math.abs(resultados.costo_total - (1500000 + resultados.num_paneles * 200000)) < 1000
        };

        // Contar solo las validaciones booleanas (las que terminan en _correcto o _correcta)
        const validacionesBooleanas = Object.entries(validaciones)
            .filter(([key]) => key.endsWith('_correcto') || key.endsWith('_correcta'))
            .map(([, value]) => value);

        return {
            datos,
            generacion,
            resultados,
            validaciones,
            resumen: {
                total_validaciones: validacionesBooleanas.length,
                validaciones_correctas: validacionesBooleanas.filter(v => v === true).length,
                validaciones_incorrectas: validacionesBooleanas.filter(v => v === false).length
            }
        };
}

/**
 * Ejecuta todas las validaciones y genera un reporte
 */
export function ejecutarValidacionCompleta() {
    console.log('='.repeat(60));
    console.log('VALIDACIÓN DEL MODELO SOLAR360');
    console.log('='.repeat(60));

    // 1. Validar coeficientes β₁
    console.log('\n1. VALIDACIÓN DE COEFICIENTES β₁ (Tabla 1 del documento)');
    console.log('-'.repeat(60));
    const validacionBeta = validarCoeficientesBeta();
    console.log(`✓ Correctos: ${validacionBeta.correctos}/6`);
    console.log(`✗ Incorrectos: ${validacionBeta.incorrectos}/6`);
    validacionBeta.detalles.forEach(d => {
        console.log(`  ${d.estado} - Cluster ${d.cluster}: Esperado ${d.esperado}, Obtenido ${d.actual}`);
    });

    // 2. Validar selección de cluster
    console.log('\n2. VALIDACIÓN DE SELECCIÓN DE CLUSTER');
    console.log('-'.repeat(60));
    const validacionCluster = validarSeleccionCluster();
    console.log(`✓ Correctos: ${validacionCluster.correctos}/${validacionCluster.correctos + validacionCluster.incorrectos}`);
    console.log(`✗ Incorrectos: ${validacionCluster.incorrectos}/${validacionCluster.correctos + validacionCluster.incorrectos}`);

    // 3. Validar cálculo de generación
    console.log('\n3. VALIDACIÓN DE CÁLCULO DE GENERACIÓN (Caso: La Plata)');
    console.log('-'.repeat(60));
    const validacionGeneracion = validarCalculoGeneracion();
    console.log(`Número de paneles: ${validacionGeneracion.resultados.num_paneles} (esperado: ~17)`);
    console.log(`Energía anual: ${validacionGeneracion.resultados.energia_anual_total.toFixed(0)} kWh (esperado: ~4200 kWh)`);
    console.log(`Costo total: $${validacionGeneracion.resultados.costo_total.toLocaleString('es-AR')}`);
    console.log(`Periodo de Recupero: ${validacionGeneracion.resultados.roi_anos.toFixed(1)} años`);
    
    console.log('\nValidaciones específicas:');
    Object.entries(validacionGeneracion.validaciones).forEach(([key, value]) => {
        if (key.endsWith('_correcto') || key.endsWith('_correcta')) {
            const estado = value ? '✓' : '✗';
            const nombre = key.replace('_correcto', '').replace('_correcta', '');
            console.log(`  ${estado} ${nombre}`);
        }
    });

    // Resumen final
    console.log('\n' + '='.repeat(60));
    console.log('RESUMEN DE VALIDACIÓN');
    console.log('='.repeat(60));
    
    const totalCoeficientes = validacionBeta.correctos + validacionBeta.incorrectos; // 6
    const totalClusters = validacionCluster.correctos + validacionCluster.incorrectos; // 12
    const totalGeneracion = validacionGeneracion.resumen.total_validaciones; // 6
    
    const totalEsperado = totalCoeficientes + totalClusters + totalGeneracion;
    const totalCorrectas = validacionBeta.correctos + validacionCluster.correctos + validacionGeneracion.resumen.validaciones_correctas;
    
    console.log(`Coeficientes β₁: ${validacionBeta.correctos}/${totalCoeficientes} ✓`);
    console.log(`Selección de Cluster: ${validacionCluster.correctos}/${totalClusters} ✓`);
    console.log(`Cálculo de Generación: ${validacionGeneracion.resumen.validaciones_correctas}/${totalGeneracion} ✓`);
    console.log(`\nTotal: ${totalCorrectas}/${totalEsperado} validaciones correctas`);
    
    if (totalCorrectas === totalEsperado) {
        console.log('\n✓ TODAS LAS VALIDACIONES PASARON CORRECTAMENTE');
        console.log('El simulador implementa correctamente la metodología del paper.');
    } else {
        console.log(`\n✗ ${totalEsperado - totalCorrectas} VALIDACIÓN(ES) FALLARON`);
        console.log('Revisar los detalles arriba para identificar los problemas.');
    }

    return {
        validacionBeta,
        validacionCluster,
        validacionGeneracion,
        todasCorrectas: totalValidaciones === totalEsperado
    };
}

// Exportar para uso en consola del navegador
if (typeof window !== 'undefined') {
    window.validarModelo = ejecutarValidacionCompleta;
    window.validarCoeficientes = validarCoeficientesBeta;
    window.validarCluster = validarSeleccionCluster;
    window.validarGeneracion = validarCalculoGeneracion;
}

