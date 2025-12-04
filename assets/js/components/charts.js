/**
 * Solar360 - Componente Charts (Generación de Gráficos Chart.js)
 * Archivo: assets/js/components/charts.js
 * 
 * Contiene todas las funciones para generar gráficos con Chart.js
 */

import { MESES } from '../config/constants.js';
import { formatearNumero } from '../utils/formatters.js';
import { formatNumber } from '../utils/formatters.js';

// Variables globales para gráficos del simulador antiguo
let monthlyChart = null;
let financialChart = null;

// Variables globales para gráficos del wizard
let wizardMonthlyChart = null;
let wizardFinancialChart = null;
let wizardDistributionChart = null;

/**
 * Generar gráfica mensual (simulador antiguo)
 */
export function generarGraficaMensual(generacionMensual, numPaneles, consumoMensual) {
    const ctx = document.getElementById('monthlyChart');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (monthlyChart) {
        monthlyChart.destroy();
    }

    const energias = generacionMensual.map(mes => parseFloat((mes.energia_mensual * numPaneles).toFixed(1)));
    const consumos = new Array(12).fill(consumoMensual); // Consumo constante para todos los meses

    monthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MESES,
            datasets: [
                {
                    label: 'Generación (kWh)',
                    data: energias,
                    backgroundColor: 'rgba(253, 184, 19, 0.8)',
                    borderColor: 'rgba(253, 184, 19, 1)',
                    borderWidth: 2,
                    borderRadius: 8
                },
                {
                    label: 'Consumo (kWh)',
                    type: 'line',
                    data: consumos,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    borderWidth: 3,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            const valor = context.parsed.y;
                            let label = `${context.dataset.label}: ${valor} kWh`;

                            // Si es el dataset de generación, calcular excedente/déficit
                            if (context.datasetIndex === 0) {
                                const consumo = consumoMensual;
                                const diferencia = valor - consumo;
                                if (diferencia > 0) {
                                    label += ` (Excedente: +${diferencia.toFixed(1)} kWh)`;
                                } else if (diferencia < 0) {
                                    label += ` (Déficit: ${diferencia.toFixed(1)} kWh)`;
                                } else {
                                    label += ` (Equilibrado)`;
                                }
                            }

                            return label;
                        }
                    },
                    titleFont: {
                        size: window.innerWidth < 768 ? 11 : 13
                    },
                    bodyFont: {
                        size: window.innerWidth < 768 ? 11 : 12
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energía (kWh)',
                        font: {
                            size: window.innerWidth < 768 ? 11 : 12
                        }
                    },
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 10 : 11
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mes',
                        font: {
                            size: window.innerWidth < 768 ? 11 : 12
                        }
                    },
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 9 : 10
                        },
                        maxRotation: window.innerWidth < 768 ? 45 : 0,
                        minRotation: window.innerWidth < 768 ? 45 : 0
                    }
                }
            }
        }
    });
}

/**
 * Generar gráfica financiera (simulador antiguo)
 */
export function generarGraficaFinanciera(resultados) {
    const ctx = document.getElementById('financialChart');
    if (!ctx) return;

    // Destruir gráfica anterior si existe
    if (financialChart) {
        financialChart.destroy();
    }

    // Calcular flujo de caja acumulado (10 años)
    const anos = 10;
    const labels = [];
    const costos = [];
    const ahorros = [];
    const flujoAcumulado = [];

    let acumulado = -resultados.costo_total;

    for (let i = 0; i <= anos; i++) {
        labels.push(`Año ${i}`);

        if (i === 0) {
            costos.push(-resultados.costo_total);
            ahorros.push(0);
        } else {
            costos.push(0);
            ahorros.push(resultados.ahorro_anual * i);
            acumulado += resultados.ahorro_anual;
        }

        flujoAcumulado.push(i === 0 ? -resultados.costo_total : acumulado);
    }

    financialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Inversión Inicial',
                    data: [costos[0], ...Array(anos).fill(null)],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Ahorros Acumulados',
                    data: [null, ...ahorros.slice(1)],
                    backgroundColor: 'rgba(46, 204, 113, 0.2)',
                    borderColor: 'rgba(46, 204, 113, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Flujo Neto Acumulado',
                    data: flujoAcumulado,
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: {
                            size: window.innerWidth < 768 ? 10 : 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: $${formatNumber(Math.abs(context.parsed.y))}`;
                        }
                    },
                    titleFont: {
                        size: window.innerWidth < 768 ? 11 : 13
                    },
                    bodyFont: {
                        size: window.innerWidth < 768 ? 11 : 12
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Dinero ($)',
                        font: {
                            size: window.innerWidth < 768 ? 11 : 12
                        }
                    },
                    ticks: {
                        callback: function (value) {
                            return '$' + formatNumber(value);
                        },
                        font: {
                            size: window.innerWidth < 768 ? 10 : 11
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo',
                        font: {
                            size: window.innerWidth < 768 ? 11 : 12
                        }
                    },
                    ticks: {
                        font: {
                            size: window.innerWidth < 768 ? 9 : 10
                        }
                    }
                }
            }
        }
    });
}

/**
 * Generar gráfica mensual (wizard)
 */
export function generarGraficaMensualWizard() {
    console.log('🎨 Generando gráfico mensual (wizard)...');

    if (!window.wizardGeneracionMensual || !window.wizardDatos || !window.wizardResultados) {
        console.error('❌ Faltan datos');
        return;
    }

    const ctx = document.getElementById('wizardMonthlyChart');
    if (!ctx) {
        console.error('❌ Canvas no encontrado');
        return;
    }

    // Destruir gráfica anterior
    if (wizardMonthlyChart) {
        wizardMonthlyChart.destroy();
    }

    const generacionMensual = window.wizardGeneracionMensual;
    const numPaneles = window.wizardResultados.num_paneles;
    const consumoMensual = window.wizardDatos.consumo_mensual || window.wizardDatos.consumo || 350;

    const energias = generacionMensual.map(mes => parseFloat((mes.energia_mensual * numPaneles).toFixed(1)));

    // Usar datos de consumo mensual específico si está disponible
    let consumos;
    const wizardData = typeof window.wizardData !== 'undefined' ? window.wizardData : {};
    if (wizardData.modoConsumo === 'especifico' && wizardData.consumoMensualArray && wizardData.consumoMensualArray.length === 12) {
        consumos = wizardData.consumoMensualArray;
    } else {
        consumos = new Array(12).fill(consumoMensual);
    }

    // Asegurar que el canvas y su contenedor estén visibles
    const container = ctx.parentElement;
    if (container) {
        container.style.display = 'block';
        container.style.minHeight = '400px';
        container.style.height = '400px';
        container.style.width = '100%';
    }

    ctx.style.display = 'block';
    ctx.style.width = '100%';
    ctx.style.height = '400px';

    // Verificar dimensiones
    const rect = ctx.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        ctx.width = 800;
        ctx.height = 400;
    }

    wizardMonthlyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: MESES,
            datasets: [{
                label: 'Generación (kWh)',
                data: energias,
                backgroundColor: 'rgba(253, 184, 19, 0.8)',
                borderColor: 'rgba(253, 184, 19, 1)',
                borderWidth: 2,
                borderRadius: 8
            }, {
                label: 'Consumo (kWh)',
                type: 'line',
                data: consumos,
                borderColor: 'rgba(231, 76, 60, 1)',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 3,
                borderDash: [5, 5],
                fill: false,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                tension: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energía (kWh)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Mes'
                    }
                }
            }
        }
    });

    // Forzar resize después de un momento
    setTimeout(() => {
        if (wizardMonthlyChart) {
            wizardMonthlyChart.resize();
            console.log('✅ Gráfico mensual generado y resized');
        }
    }, 100);
}

/**
 * Generar gráfica financiera (wizard)
 */
export function generarGraficaFinancieraWizard() {
    if (!window.wizardResultados) {
        console.error('❌ Faltan datos para generar gráfico financiero');
        return;
    }

    const ctx = document.getElementById('wizardFinancialChart');
    if (!ctx) {
        console.error('❌ No se encontró canvas wizardFinancialChart');
        return;
    }

    // Asegurar que el contenedor esté visible
    const container = ctx.closest('.financial-chart-container') || ctx.closest('.wizard-chart-container');
    if (container) {
        container.style.display = 'block';
        container.style.minHeight = '350px';
    }

    // Destruir gráfico anterior si existe
    if (wizardFinancialChart) {
        wizardFinancialChart.destroy();
        wizardFinancialChart = null;
    }

    const resultados = window.wizardResultados;
    const wizardData = typeof window.wizardData !== 'undefined' ? window.wizardData : {};
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    // Calcular datos para 25 años
    const anos = 25;
    const labels = ['Año 0'];
    const inversionInicial = [];
    const ahorrosAcumulados = [];
    const flujoNetoAcumulado = [];

    const inversionTotal = resultados.costo_total || resultados.inversion_total || 0;

    // Inversión inicial: solo un punto en el año 0
    inversionInicial.push(-inversionTotal);
    for (let i = 1; i <= anos; i++) {
        inversionInicial.push(null);
        labels.push(`Año ${i}`);
    }

    // Calcular ahorros acumulados y flujo neto acumulado (sin inflación)
    const ahorroAnual = resultados.ahorro_anual || 0;
    let ahorrosAcum = 0;

    ahorrosAcumulados.push(0);
    flujoNetoAcumulado.push(-inversionTotal);

    for (let i = 1; i <= anos; i++) {
        // Sin inflación: el ahorro anual es constante
        ahorrosAcum += ahorroAnual;
        const flujoNeto = ahorrosAcum - inversionTotal;

        ahorrosAcumulados.push(ahorrosAcum);
        flujoNetoAcumulado.push(flujoNeto);
    }

    wizardFinancialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Inversión Inicial',
                    data: inversionInicial,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 0,
                    fill: false,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                },
                {
                    label: 'Ahorros Acumulados',
                    data: ahorrosAcumulados,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.4
                },
                {
                    label: 'Flujo Neto Acumulado',
                    data: flujoNetoAcumulado,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        boxWidth: 12,
                        padding: 8,
                        font: { size: 12 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.parsed.y === null) return null;
                            return `${context.dataset.label}: ${simbolo}${formatearNumero(context.parsed.y, moneda)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Dinero ($)',
                        font: { size: 12 }
                    },
                    ticks: {
                        callback: function (value) {
                            return simbolo + formatearNumero(value, moneda);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

/**
 * Generar gráfica de distribución (wizard)
 */
export function generarGraficaDistribucionWizard() {
    if (!window.wizardResultados || !window.wizardDatos) {
        console.error('❌ Faltan datos para generar gráfico de distribución');
        return;
    }

    const ctx = document.getElementById('wizardDistributionChart');
    if (!ctx) {
        console.error('❌ No se encontró canvas wizardDistributionChart');
        return;
    }

    // Destruir gráfica anterior si existe
    if (wizardDistributionChart) {
        wizardDistributionChart.destroy();
        wizardDistributionChart = null;
    }

    // Asegurar que el canvas y su contenedor estén visibles
    const container = ctx.closest('.wizard-distribution-chart') || ctx.parentElement;
    if (container) {
        container.style.display = 'block';
        container.style.minHeight = '400px';
        container.style.height = '400px';
        container.style.width = '100%';
    }

    ctx.style.display = 'block';
    ctx.style.width = '100%';
    ctx.style.height = '400px';

    // Verificar dimensiones
    const rect = ctx.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
        ctx.width = 400;
        ctx.height = 400;
    }

    const consumoAnual = (window.wizardDatos.consumo_mensual || window.wizardDatos.consumo) * 12;
    const generacionAnual = window.wizardResultados.energia_anual_total || 0;

    const energiaConsumida = Math.min(consumoAnual, generacionAnual);
    const energiaInyectada = Math.max(0, generacionAnual - consumoAnual);

    wizardDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Energía Autoconsumida', 'Energía Inyectada a la Red'],
            datasets: [{
                data: [energiaConsumida, energiaInyectada],
                backgroundColor: ['rgba(46, 213, 115, 0.8)', 'rgba(253, 184, 19, 0.8)'],
                borderColor: ['rgba(46, 213, 115, 1)', 'rgba(253, 184, 19, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Forzar resize después de un momento
    setTimeout(() => {
        if (wizardDistributionChart) {
            wizardDistributionChart.resize();
            console.log('✅ Gráfico de distribución generado y resized');
        }
    }, 100);
}

/**
 * Redimensionar gráficos cuando cambia el tamaño de la ventana
 */
export function redimensionarGraficos() {
    if (monthlyChart) monthlyChart.resize();
    if (financialChart) financialChart.resize();
    if (wizardMonthlyChart) wizardMonthlyChart.resize();
    if (wizardFinancialChart) wizardFinancialChart.resize();
    if (wizardDistributionChart) wizardDistributionChart.resize();
}

// Exportar variables globales para compatibilidad
export { monthlyChart, financialChart, wizardMonthlyChart, wizardFinancialChart, wizardDistributionChart };

// Exportar al scope global para compatibilidad
window.generarGraficaMensual = generarGraficaMensual;
window.generarGraficaFinanciera = generarGraficaFinanciera;
window.generarGraficaMensualWizard = generarGraficaMensualWizard;
window.generarGraficaFinancieraWizard = generarGraficaFinancieraWizard;
window.generarGraficaDistribucionWizard = generarGraficaDistribucionWizard;
window.redimensionarGraficos = redimensionarGraficos;

