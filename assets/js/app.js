/**
 * Solar360 - Aplicación Principal
 * Archivo: assets/js/app.js
 * 
 * Contiene toda la lógica de inicialización y funciones principales
 * del simulador antiguo que no están en otros módulos específicos
 */

import { MESES } from './config/constants.js';
import { MODELO_CLUSTER } from './config/models.js';
import { calcularGeneracionMensual, calcularResultados } from './utils/calculations.js';
import { mostrarNotificacion } from './utils/notifications.js';
import { initScrollSpy, redimensionarGraficos as redimensionarGraficosUI } from './utils/ui.js';
import { validarDatos } from './utils/validators.js';
import { formatNumber } from './utils/formatters.js';
import { generarGraficaMensual, generarGraficaFinanciera } from './components/charts.js';
import { abrirMapa, cerrarMapa } from './components/map.js';
import { abrirModalSimulador, inicializarWizardModal, actualizarWizardUI } from './components/wizard.js';

// Variables globales para compatibilidad
let monthlyChart = null;
let financialChart = null;
let ultimosResultados = null;
let ultimaGeneracionMensual = null;
let ubicacionActual = {
    nombre: '',
    lat: null,
    lon: null
};

let modoActual = 'ubicacion';
let modoDimensionamiento = 'porcentaje';

// Exportar variables globales
window.ultimosResultados = ultimosResultados;
window.ultimaGeneracionMensual = ultimaGeneracionMensual;
window.ubicacionActual = ubicacionActual;
window.monthlyChart = monthlyChart;
window.financialChart = financialChart;

/**
 * Seleccionar modo ubicación
 */
export function seleccionarModoUbicacion() {
    modoActual = 'ubicacion';
    const modeUbicacion = document.getElementById('modeUbicacion');
    const modeManual = document.getElementById('modeManual');
    
    if (modeUbicacion) modeUbicacion.classList.add('mode-active');
    if (modeManual) modeManual.classList.remove('mode-active');
    
    const seccionUbicacion = document.getElementById('seccionUbicacion');
    const seccionManual = document.getElementById('seccionManual');
    if (seccionUbicacion) seccionUbicacion.style.display = 'block';
    if (seccionManual) seccionManual.style.display = 'none';
    
    if (typeof validarYHabilitarBotonCalcular === 'function') {
        validarYHabilitarBotonCalcular();
    }
}

/**
 * Seleccionar modo manual
 */
export function seleccionarModoManual() {
    modoActual = 'manual';
    const modeUbicacion = document.getElementById('modeUbicacion');
    const modeManual = document.getElementById('modeManual');
    
    if (modeUbicacion) modeUbicacion.classList.remove('mode-active');
    if (modeManual) modeManual.classList.add('mode-active');
    
    const seccionUbicacion = document.getElementById('seccionUbicacion');
    const seccionManual = document.getElementById('seccionManual');
    if (seccionUbicacion) seccionUbicacion.style.display = 'none';
    if (seccionManual) seccionManual.style.display = 'block';
    
    if (typeof validarYHabilitarBotonCalcular === 'function') {
        validarYHabilitarBotonCalcular();
    }
}

/**
 * Actualizar precio panel
 */
export function actualizarPrecioPanel() {
    if (typeof validarYHabilitarBotonCalcular === 'function') {
        validarYHabilitarBotonCalcular();
    }
}

/**
 * Obtener datos del formulario
 */
export function obtenerDatosFormulario() {
    const datos = {
        inclinacion: parseFloat(document.getElementById('inclinacion')?.value || 0),
        consumo: parseFloat(document.getElementById('consumo')?.value || 0),
        consumo_mensual: parseFloat(document.getElementById('consumo')?.value || 0),
        precio_kwh: parseFloat(document.getElementById('precio_kwh')?.value || 0),
        costo_panel: parseFloat(document.getElementById('costo_panel')?.value || 0),
        modo: modoActual,
        modo_dimensionamiento: modoDimensionamiento,
        porcentaje_cobertura: modoDimensionamiento === 'porcentaje'
            ? parseFloat(document.getElementById('porcentaje_cobertura')?.value || 100)
            : null,
        num_paneles_fijo: modoDimensionamiento === 'paneles'
            ? parseInt(document.getElementById('num_paneles_manual')?.value || 1)
            : null,
        psh: [],
        temperatura: []
    };

    for (let i = 1; i <= 12; i++) {
        const pshEl = document.getElementById(`psh_${i}`);
        const tempEl = document.getElementById(`temp_${i}`);
        if (pshEl) datos.psh.push(parseFloat(pshEl.value || 0));
        if (tempEl) datos.temperatura.push(parseFloat(tempEl.value || 0));
    }

    return datos;
}

/**
 * Calcular dimensionamiento
 */
export async function calcularDimensionamiento(e) {
    if (e) e.preventDefault();

    console.log('🔄 Iniciando cálculo de dimensionamiento...');

    const datos = obtenerDatosFormulario();

    if (!validarDatos(datos)) {
        mostrarNotificacion('⚠️ Por favor completa todos los campos correctamente', 'error');
        return;
    }

    const btnCalcular = document.getElementById('btnCalcularFinal');
    const btnIcon = btnCalcular?.querySelector('.btn-icon');
    const btnText = btnCalcular?.querySelector('span');

    const originalHTML = btnIcon?.innerHTML || '';
    const originalText = btnText?.textContent || '';

    if (btnCalcular) {
        btnCalcular.disabled = true;
        btnCalcular.style.opacity = '0.8';
        btnCalcular.style.cursor = 'wait';
    }

    if (btnIcon) {
        btnIcon.innerHTML = `
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
            </path>
        `;
        btnIcon.style.display = 'block';
    }
    if (btnText) btnText.textContent = 'Calculando...';

    const tiempoCarga = 2000 + Math.random() * 500;

    try {
        await new Promise(resolve => setTimeout(resolve, tiempoCarga));

        const generacionMensual = calcularGeneracionMensual(datos);
        const resultados = calcularResultados(datos, generacionMensual);

        mostrarResultados(resultados, generacionMensual, datos);

        if (btnIcon) btnIcon.innerHTML = originalHTML;
        if (btnText) btnText.textContent = originalText;
        if (btnCalcular) {
            btnCalcular.disabled = false;
            btnCalcular.style.opacity = '1';
            btnCalcular.style.cursor = 'pointer';
        }

        setTimeout(() => {
            const resultsContainer = document.getElementById('resultsContainer');
            if (resultsContainer) {
                resultsContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest'
                });
            }
        }, 100);

        console.log('✅ Cálculo completado:', resultados);

    } catch (error) {
        console.error('❌ Error en el cálculo:', error);

        if (btnIcon) btnIcon.innerHTML = originalHTML;
        if (btnText) btnText.textContent = originalText;
        if (btnCalcular) {
            btnCalcular.disabled = false;
            btnCalcular.style.opacity = '1';
            btnCalcular.style.cursor = 'pointer';
        }

        mostrarNotificacion('⚠️ Error al calcular el dimensionamiento. Por favor intenta nuevamente.', 'error');
    }
}

/**
 * Mostrar resultados
 */
export function mostrarResultados(resultados, generacionMensual, datos = null) {
    ultimosResultados = resultados;
    ultimaGeneracionMensual = generacionMensual;
    window.ultimosResultados = resultados;
    window.ultimaGeneracionMensual = generacionMensual;

    if (!datos) {
        datos = obtenerDatosFormulario();
    }

    const resultsPreview = document.getElementById('resultsPreview');
    if (resultsPreview) {
        resultsPreview.style.display = 'none';
    }

    const resultsContainer = document.getElementById('resultsContainer');
    if (resultsContainer) {
        resultsContainer.style.display = 'flex';
        resultsContainer.classList.add('show');
    }

    const tipoPanelTexto = 'Módulo FV 360-Ref 190w';
    const consumoMensual = parseFloat(document.getElementById('consumo')?.value || 0);

    // KPIs Principales
    const kpiInversion = document.getElementById('kpiInversion');
    const kpiInversionDetail = document.getElementById('kpiInversionDetail');
    if (kpiInversion) kpiInversion.textContent = `$${formatNumber(resultados.costo_total)}`;
    if (kpiInversionDetail) kpiInversionDetail.textContent =
        `Base: $${formatNumber(resultados.costo_base)} + ${resultados.num_paneles} paneles`;

    const kpiAhorroMensual = document.getElementById('kpiAhorroMensual');
    const kpiAhorroAnual = document.getElementById('kpiAhorroAnual');
    if (kpiAhorroMensual) kpiAhorroMensual.textContent = `$${formatNumber(resultados.ahorro_mensual)}`;
    if (kpiAhorroAnual) kpiAhorroAnual.textContent = `$${formatNumber(resultados.ahorro_anual)}/año`;

    const kpiSistema = document.getElementById('kpiSistema');
    const kpiSistemaDetail = document.getElementById('kpiSistemaDetail');
    if (kpiSistema) kpiSistema.textContent = `${resultados.num_paneles} Paneles + Inversor`;
    if (kpiSistemaDetail) kpiSistemaDetail.textContent =
        `${tipoPanelTexto} • ${resultados.potencia_total_kw.toFixed(2)} kW`;

    const arbolesEquiv = Math.round(resultados.co2_anual / 20);
    const kpiImpacto = document.getElementById('kpiImpacto');
    const kpiImpactoDetail = document.getElementById('kpiImpactoDetail');
    if (kpiImpacto) kpiImpacto.textContent = `${formatNumber(resultados.co2_anual)} kg CO₂`;
    if (kpiImpactoDetail) kpiImpactoDetail.textContent = `Equivale a plantar ${arbolesEquiv} árboles`;

    // Vista Detallada - Finanzas
    const detailROI = document.getElementById('detailROI');
    if (detailROI) {
        if (resultados.roi_anos === Infinity || isNaN(resultados.roi_anos)) {
            detailROI.textContent = 'N/A';
        } else {
            detailROI.textContent = `${resultados.roi_anos.toFixed(1)} años`;
        }
    }

    const detailCostoBase = document.getElementById('detailCostoBase');
    const detailCostoPaneles = document.getElementById('detailCostoPaneles');
    const detailCostoTotal = document.getElementById('detailCostoTotal');
    if (detailCostoBase) detailCostoBase.textContent = `$${formatNumber(resultados.costo_base)}`;
    if (detailCostoPaneles) detailCostoPaneles.textContent =
        `$${formatNumber(resultados.costo_paneles)} (${resultados.num_paneles} paneles)`;
    if (detailCostoTotal) detailCostoTotal.textContent = `$${formatNumber(resultados.costo_total)}`;

    const ahorro25Anos = resultados.ahorro_anual * 25;
    const detailAhorro25Anos = document.getElementById('detailAhorro25Anos');
    if (detailAhorro25Anos) detailAhorro25Anos.textContent = `$${formatNumber(ahorro25Anos)}`;

    // Vista Detallada - Energía
    llenarTablaMensual(generacionMensual, resultados.num_paneles, consumoMensual);

    const summaryGeneracionAnual = document.getElementById('summaryGeneracionAnual');
    const summaryCobertura = document.getElementById('summaryCobertura');
    if (summaryGeneracionAnual) summaryGeneracionAnual.textContent =
        `${formatNumber(resultados.energia_anual_total)} kWh`;

    let coberturaTexto;
    if (resultados.modo_dimensionamiento === 'paneles') {
        coberturaTexto = `${resultados.cobertura.toFixed(0)}%`;
    } else {
        const porcentajeSeleccionado = resultados.porcentaje_objetivo || 100;
        coberturaTexto = porcentajeSeleccionado < 100
            ? `${resultados.cobertura.toFixed(0)}% (objetivo: ${porcentajeSeleccionado}%)`
            : `${resultados.cobertura.toFixed(0)}%`;
    }
    if (summaryCobertura) summaryCobertura.textContent = coberturaTexto;

    const energiaAnualRequerida = consumoMensual * 12;
    const excedentesAnuales = resultados.energia_anual_total - energiaAnualRequerida;
    const summaryExcedentes = document.getElementById('summaryExcedentes');
    const summaryExcedentesValue = document.getElementById('summaryExcedentesValue');
    if (summaryExcedentes && summaryExcedentesValue) {
        if (excedentesAnuales > 0) {
            summaryExcedentes.style.display = 'block';
            summaryExcedentesValue.textContent = `${formatNumber(excedentesAnuales)} kWh`;
        } else {
            summaryExcedentes.style.display = 'none';
        }
    }

    // Vista Detallada - Equipamiento
    const equipPanelModelo = document.getElementById('equipPanelModelo');
    const equipPanelCantidad = document.getElementById('equipPanelCantidad');
    const equipPanelPotencia = document.getElementById('equipPanelPotencia');
    const equipPanelPrecio = document.getElementById('equipPanelPrecio');
    if (equipPanelModelo) equipPanelModelo.textContent = tipoPanelTexto;
    if (equipPanelCantidad) equipPanelCantidad.textContent = resultados.num_paneles;
    if (equipPanelPotencia) equipPanelPotencia.textContent = resultados.potencia_total_kw.toFixed(2);
    if (equipPanelPrecio) equipPanelPrecio.textContent = `$${formatNumber(resultados.costo_por_panel)}`;

    const superficieNecesaria = resultados.num_paneles * 1.6;
    const equipSuperficie = document.getElementById('equipSuperficie');
    if (equipSuperficie) equipSuperficie.textContent = `${superficieNecesaria.toFixed(1)} m² (aprox.)`;

    const inclinacion = document.getElementById('inclinacion')?.value || '45';
    const equipInclinacion = document.getElementById('equipInclinacion');
    if (equipInclinacion) equipInclinacion.textContent = `${inclinacion}°`;

    inicializarVistaDetallada();
}

/**
 * Inicializar vista detallada
 */
export function inicializarVistaDetallada() {
    const btnVerAnalisis = document.getElementById('btnVerAnalisis');
    const vistaDetallada = document.getElementById('resultsDetailedView');

    if (btnVerAnalisis && vistaDetallada) {
        btnVerAnalisis.addEventListener('click', function () {
            const isExpanded = vistaDetallada.style.display !== 'none';

            if (isExpanded) {
                vistaDetallada.style.display = 'none';
                btnVerAnalisis.classList.remove('expanded');
            } else {
                vistaDetallada.style.display = 'block';
                btnVerAnalisis.classList.add('expanded');

                if (ultimosResultados && ultimaGeneracionMensual) {
                    const consumoMensual = parseFloat(document.getElementById('consumo')?.value || 0);
                    setTimeout(() => {
                        generarGraficaMensual(ultimaGeneracionMensual, ultimosResultados.num_paneles, consumoMensual);
                        generarGraficaFinanciera(ultimosResultados);
                    }, 100);
                }

                setTimeout(() => {
                    vistaDetallada.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 200);
            }
        });
    }

    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            cambiarPestaña(tabName);
        });
    });
}

/**
 * Cambiar pestaña
 */
export function cambiarPestaña(tabName) {
    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    const tab = document.querySelector(`.result-tab[data-tab="${tabName}"]`);
    const pane = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);

    if (tab) tab.classList.add('active');
    if (pane) pane.classList.add('active');

    if ((tabName === 'energia' || tabName === 'finanzas') && ultimosResultados && ultimaGeneracionMensual) {
        setTimeout(() => {
            const consumoMensual = parseFloat(document.getElementById('consumo')?.value || 0);
            if (tabName === 'energia') {
                generarGraficaMensual(ultimaGeneracionMensual, ultimosResultados.num_paneles, consumoMensual);
            } else if (tabName === 'finanzas') {
                generarGraficaFinanciera(ultimosResultados);
            }
        }, 100);
    }
}

/**
 * Llenar tabla mensual
 */
export function llenarTablaMensual(generacionMensual, numPaneles, consumoMensual) {
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    generacionMensual.forEach((mes) => {
        const generacionTotal = mes.energia_mensual * numPaneles;
        const balance = generacionTotal - consumoMensual;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        const balanceText = balance >= 0
            ? `+${balance.toFixed(1)} kWh`
            : `${balance.toFixed(1)} kWh`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${mes.mes}</strong></td>
            <td>${generacionTotal.toFixed(1)}</td>
            <td>${consumoMensual.toFixed(1)}</td>
            <td class="balance-${balanceClass}">${balanceText}</td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Inicializar dimensionamiento
 */
export function inicializarDimensionamiento() {
    document.querySelectorAll('.dimensionamiento-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('input')) {
                return;
            }

            const mode = this.dataset.mode;
            const radio = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
            if (radio) {
                radio.checked = true;
                cambiarModoDimensionamiento(mode);
            }
        });
    });

    const radioPorcentaje = document.getElementById('modePorcentaje');
    const radioPaneles = document.getElementById('modePaneles');

    if (radioPorcentaje) {
        radioPorcentaje.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamiento('porcentaje');
        });
    }

    if (radioPaneles) {
        radioPaneles.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamiento('paneles');
        });
    }

    const sliderPorcentaje = document.getElementById('porcentaje_cobertura');
    if (sliderPorcentaje) {
        sliderPorcentaje.addEventListener('input', actualizarDisplayCobertura);
        sliderPorcentaje.addEventListener('change', actualizarDisplayCobertura);
    }

    document.querySelectorAll('.cobertura-badge').forEach(badge => {
        badge.addEventListener('click', function () {
            const valor = parseInt(this.dataset.value);
            if (sliderPorcentaje) {
                sliderPorcentaje.value = valor;
                actualizarDisplayCobertura();
            }
            document.querySelectorAll('.cobertura-badge').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    const btnMenos = document.getElementById('btnMenosPanel');
    const btnMas = document.getElementById('btnMasPanel');
    const inputPaneles = document.getElementById('num_paneles_manual');

    if (btnMenos) {
        btnMenos.addEventListener('click', function () {
            const valor = parseInt(inputPaneles?.value || 1);
            if (valor > 1 && inputPaneles) {
                inputPaneles.value = valor - 1;
                actualizarPanelesPreview();
            }
        });
    }

    if (btnMas) {
        btnMas.addEventListener('click', function () {
            const valor = parseInt(inputPaneles?.value || 1);
            if (inputPaneles) {
                inputPaneles.value = valor + 1;
                actualizarPanelesPreview();
            }
        });
    }

    if (inputPaneles) {
        inputPaneles.addEventListener('input', function () {
            if (this.value < 1) this.value = 1;
            actualizarPanelesPreview();
        });
        inputPaneles.addEventListener('change', actualizarPanelesPreview);
    }

    document.querySelectorAll('.paneles-quick-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const cantidad = parseInt(this.dataset.paneles);
            if (inputPaneles) {
                inputPaneles.value = cantidad;
                actualizarPanelesPreview();
            }
            document.querySelectorAll('.paneles-quick-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    actualizarDisplayCobertura();

    const cardPorcentaje = document.querySelector('.dimensionamiento-option-card[data-mode="porcentaje"]');
    if (cardPorcentaje) {
        cardPorcentaje.classList.add('active');
    }
}

/**
 * Cambiar modo dimensionamiento
 */
export function cambiarModoDimensionamiento(mode) {
    modoDimensionamiento = mode;

    const controlPorcentaje = document.getElementById('controlPorcentaje');
    const controlPaneles = document.getElementById('controlPaneles');
    const cardPorcentaje = document.querySelector('.dimensionamiento-option-card[data-mode="porcentaje"]');
    const cardPaneles = document.querySelector('.dimensionamiento-option-card[data-mode="paneles"]');

    if (mode === 'porcentaje') {
        if (controlPorcentaje) controlPorcentaje.style.display = 'block';
        if (controlPaneles) controlPaneles.style.display = 'none';
        if (cardPorcentaje) cardPorcentaje.classList.add('active');
        if (cardPaneles) cardPaneles.classList.remove('active');
    } else {
        if (controlPorcentaje) controlPorcentaje.style.display = 'none';
        if (controlPaneles) controlPaneles.style.display = 'block';
        if (cardPorcentaje) cardPorcentaje.classList.remove('active');
        if (cardPaneles) cardPaneles.classList.add('active');
        actualizarPanelesPreview();
    }
}

/**
 * Actualizar display cobertura
 */
export function actualizarDisplayCobertura() {
    const slider = document.getElementById('porcentaje_cobertura');
    const display = document.getElementById('cobertura_value');

    if (slider && display) {
        const valor = parseInt(slider.value);
        display.textContent = `${valor}%`;
    }
}

/**
 * Actualizar paneles preview
 */
export function actualizarPanelesPreview() {
    const inputPaneles = document.getElementById('num_paneles_manual');
    const previewValue = document.getElementById('panelesPreviewValue');

    if (!inputPaneles || !previewValue) return;

    const numPaneles = parseInt(inputPaneles.value) || 1;

    try {
        const datosTemp = obtenerDatosFormulario();

        if (!datosTemp.psh || datosTemp.psh.length === 0 || datosTemp.psh.some(p => !p || isNaN(p))) {
            previewValue.textContent = 'Completa los datos climáticos';
            return;
        }

        const generacionMensual = calcularGeneracionMensual(datosTemp);
        const energiaAnualPorPanel = generacionMensual.reduce((sum, mes) => sum + mes.energia_mensual, 0);
        const energiaAnualTotal = energiaAnualPorPanel * numPaneles;

        const consumoMensual = parseFloat(document.getElementById('consumo')?.value || 350);
        const energiaAnualRequerida = consumoMensual * 12;
        const cobertura = (energiaAnualTotal / energiaAnualRequerida) * 100;

        previewValue.textContent = `${Math.min(cobertura, 100).toFixed(0)}%`;
    } catch (error) {
        previewValue.textContent = 'Completa los datos climáticos';
    }
}

/**
 * Validar y habilitar botón calcular
 */
export function validarYHabilitarBotonCalcular() {
    const btnCalcular = document.getElementById('btnCalcularFinal');
    if (!btnCalcular) return;
    
    let puedeCalcular = true;

    const inclinacion = document.getElementById('inclinacion')?.value;
    const consumo = document.getElementById('consumo')?.value;
    const precio_kwh = document.getElementById('precio_kwh')?.value;

    if (!inclinacion || inclinacion === '' || (inclinacion !== '20' && inclinacion !== '45')) {
        puedeCalcular = false;
    }
    if (!consumo || consumo === '' || isNaN(parseFloat(consumo)) || parseFloat(consumo) <= 0) {
        puedeCalcular = false;
    }
    if (!precio_kwh || precio_kwh === '' || isNaN(parseFloat(precio_kwh)) || parseFloat(precio_kwh) <= 0) {
        puedeCalcular = false;
    }

    if (modoActual === 'ubicacion') {
        const buttonText = document.getElementById('buttonText');
        if (!buttonText || !buttonText.textContent.includes('Datos obtenidos para')) {
            puedeCalcular = false;
        }
    } else if (modoActual === 'manual') {
        for (let i = 1; i <= 12; i++) {
            const psh = document.getElementById(`psh_${i}`)?.value;
            const temp = document.getElementById(`temp_${i}`)?.value;

            if (!psh || psh === '' || isNaN(parseFloat(psh)) || parseFloat(psh) < 0) {
                puedeCalcular = false;
                break;
            }
            if (!temp || temp === '' || isNaN(parseFloat(temp))) {
                puedeCalcular = false;
                break;
            }
        }
    }

    if (puedeCalcular) {
        btnCalcular.disabled = false;
        btnCalcular.style.opacity = '1';
        btnCalcular.style.cursor = 'pointer';
    } else {
        btnCalcular.disabled = true;
        btnCalcular.style.opacity = '0.6';
        btnCalcular.style.cursor = 'not-allowed';
    }
}

/**
 * Agregar validación en tiempo real
 */
export function agregarValidacionTiempoReal() {
    const inclinacion = document.getElementById('inclinacion');
    const consumo = document.getElementById('consumo');
    const precio_kwh = document.getElementById('precio_kwh');

    if (inclinacion) inclinacion.addEventListener('change', validarYHabilitarBotonCalcular);
    if (consumo) {
        consumo.addEventListener('input', validarYHabilitarBotonCalcular);
        consumo.addEventListener('change', validarYHabilitarBotonCalcular);
    }
    if (precio_kwh) {
        precio_kwh.addEventListener('input', validarYHabilitarBotonCalcular);
        precio_kwh.addEventListener('change', validarYHabilitarBotonCalcular);
    }

    for (let i = 1; i <= 12; i++) {
        const psh = document.getElementById(`psh_${i}`);
        const temp = document.getElementById(`temp_${i}`);
        if (psh) {
            psh.addEventListener('input', validarYHabilitarBotonCalcular);
            psh.addEventListener('change', validarYHabilitarBotonCalcular);
        }
        if (temp) {
            temp.addEventListener('input', validarYHabilitarBotonCalcular);
            temp.addEventListener('change', validarYHabilitarBotonCalcular);
        }
    }
}

/**
 * Inicializar wizard modal
 */
// inicializarWizardModal se importa desde wizard.js

/**
 * Inicialización principal
 */
export function initializeApp() {
    console.log('🚀 Inicializando aplicación...');
    
    const modeUbicacion = document.getElementById('modeUbicacion');
    const modeManual = document.getElementById('modeManual');
    const openMapButton = document.getElementById('openMapButton');
    const simulatorForm = document.getElementById('simulatorForm');
    
    if (modeUbicacion) {
        modeUbicacion.addEventListener('click', seleccionarModoUbicacion);
    }
    if (modeManual) {
        modeManual.addEventListener('click', seleccionarModoManual);
    }
    if (openMapButton) {
        openMapButton.addEventListener('click', abrirMapa);
    }
    if (simulatorForm) {
        simulatorForm.addEventListener('submit', calcularDimensionamiento);
    }

    const btnAbrirSimulador = document.getElementById('btnAbrirSimulador');
    const btnCerrarSimulador = document.getElementById('btnCerrarSimulador');
    const btnCerrarWizard = document.getElementById('btnCerrarWizard');
    const modalSimulador = document.getElementById('modalSimulador');
    const navSimulador = document.getElementById('navSimulador');

    console.log('🔍 Verificando botones del simulador:', {
        btnAbrirSimulador: !!btnAbrirSimulador,
        btnCerrarSimulador: !!btnCerrarSimulador,
        btnCerrarWizard: !!btnCerrarWizard,
        modalSimulador: !!modalSimulador,
        navSimulador: !!navSimulador,
        abrirModalSimulador: typeof abrirModalSimulador
    });

    if (btnAbrirSimulador) {
        btnAbrirSimulador.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔘 Botón clickeado, abriendo modal...');
            // Intentar usar la función importada primero, luego la global
            const abrirFunc = abrirModalSimulador || window.abrirModalSimulador;
            if (typeof abrirFunc === 'function') {
                abrirFunc();
            } else {
                console.error('❌ abrirModalSimulador no está disponible', {
                    abrirModalSimulador: typeof abrirModalSimulador,
                    windowAbrir: typeof window.abrirModalSimulador
                });
                // Fallback: intentar abrir el modal directamente
                const modal = document.getElementById('modalSimulador');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            }
        });
    } else {
        console.error('❌ No se encontró el botón btnAbrirSimulador');
    }

    if (navSimulador) {
        navSimulador.addEventListener('click', function (e) {
            // Si estamos en la página del simulador, no hacer nada (ya estamos ahí)
            if (document.body.classList.contains('simulador-page')) {
                return;
            }
            // Si el enlace apunta a simulador.html, dejar que el navegador maneje la navegación
            const href = navSimulador.getAttribute('href');
            if (href && href.includes('simulador.html')) {
                return; // Dejar que el navegador maneje la navegación
            }
            // Si no, intentar abrir modal (compatibilidad con versiones antiguas)
            e.preventDefault();
            abrirModalSimulador();
        });
    }

    if (btnCerrarSimulador) {
        btnCerrarSimulador.addEventListener('click', function() {
            if (typeof window.cerrarModalSimulador === 'function') {
                window.cerrarModalSimulador();
            }
        });
    }

    if (btnCerrarWizard) {
        btnCerrarWizard.addEventListener('click', function() {
            if (typeof window.cerrarModalSimulador === 'function') {
                window.cerrarModalSimulador();
            }
        });
    }

    if (modalSimulador) {
        modalSimulador.addEventListener('click', function (e) {
            if (e.target === modalSimulador) {
                if (typeof window.cerrarModalSimulador === 'function') {
                    window.cerrarModalSimulador();
                }
            }
        });
    }

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalSimulador && modalSimulador.classList.contains('active')) {
            if (typeof window.cerrarModalSimulador === 'function') {
                window.cerrarModalSimulador();
            }
        }
    });

    // Inicializar wizard solo si existe (puede estar en modal o en página completa)
    if (document.getElementById('btnIniciarSimulador') || document.body.classList.contains('simulador-page')) {
        inicializarWizardModal();
    }
    inicializarDimensionamiento();
    agregarValidacionTiempoReal();
    validarYHabilitarBotonCalcular();
    
    // Si estamos en la página del simulador, inicializar desde el paso 0
    if (document.body.classList.contains('simulador-page')) {
        // Asegurar que el body tenga scroll habilitado
        document.body.style.overflow = '';
        document.body.style.overflowX = 'hidden';
        document.body.style.overflowY = 'auto';
        
        // Resetear al paso 0 y actualizar UI
        if (typeof window.goToWizardStep === 'function') {
            window.goToWizardStep(0);
        } else {
            actualizarWizardUI();
        }
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            const target = document.querySelector(href);
            if (target) {
                // Calcular el offset del header fijo
                const header = document.querySelector('.header');
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;

    if (mobileToggle && navMenu) {
        // Función para cerrar el menú
        const cerrarMenu = () => {
            navMenu.classList.remove('active');
            mobileToggle.classList.remove('active');
            body.classList.remove('menu-open');
        };

        // Función para abrir/cerrar el menú
        const toggleMenu = (e) => {
            e.stopPropagation();
            const isActive = navMenu.classList.contains('active');
            
            if (isActive) {
                cerrarMenu();
            } else {
                navMenu.classList.add('active');
                mobileToggle.classList.add('active');
                body.classList.add('menu-open');
            }
        };

        // Toggle al hacer clic en el botón hamburguesa
        mobileToggle.addEventListener('click', toggleMenu);

        // Cerrar menú al hacer clic en un enlace
        const navLinks = navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Pequeño delay para permitir la navegación
                setTimeout(() => {
                    cerrarMenu();
                }, 100);
            });
        });

        // Cerrar menú al hacer clic fuera o en el overlay
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    cerrarMenu();
                }
            }
        });

        // Cerrar menú con la tecla Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                cerrarMenu();
            }
        });

        // Prevenir scroll del body cuando el menú está abierto
        const observer = new MutationObserver(() => {
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
            } else {
                body.style.overflow = '';
            }
        });

        observer.observe(navMenu, { attributes: true, attributeFilter: ['class'] });
    }

    window.addEventListener('click', (e) => {
        const modal = document.getElementById('mapModal');
        if (e.target === modal) {
            cerrarMapa();
        }
    });

    initScrollSpy();

    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            redimensionarGraficosUI();
        }, 250);
    });

    console.log('✅ Solar360 Simulator inicializado');
}

// Exportar al scope global para compatibilidad
window.seleccionarModoUbicacion = seleccionarModoUbicacion;
window.seleccionarModoManual = seleccionarModoManual;
window.actualizarPrecioPanel = actualizarPrecioPanel;
window.obtenerDatosFormulario = obtenerDatosFormulario;
window.calcularDimensionamiento = calcularDimensionamiento;
window.mostrarResultados = mostrarResultados;
window.inicializarVistaDetallada = inicializarVistaDetallada;
window.cambiarPestaña = cambiarPestaña;
window.llenarTablaMensual = llenarTablaMensual;
window.inicializarDimensionamiento = inicializarDimensionamiento;
window.cambiarModoDimensionamiento = cambiarModoDimensionamiento;
window.actualizarDisplayCobertura = actualizarDisplayCobertura;
window.actualizarPanelesPreview = actualizarPanelesPreview;
window.validarYHabilitarBotonCalcular = validarYHabilitarBotonCalcular;
window.agregarValidacionTiempoReal = agregarValidacionTiempoReal;
window.inicializarWizardModal = inicializarWizardModal;
window.initializeApp = initializeApp;

