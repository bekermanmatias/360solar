/**
 * Solar360 - Componente Wizard (Simulador Paso a Paso)
 * Archivo: assets/js/components/wizard.js
 * 
 * Contiene todas las funciones del simulador paso a paso
 */

import { MESES, DATOS_EJEMPLO } from '../config/constants.js';
import { MODELO_CLUSTER } from '../config/models.js';
import { calcularGeneracionMensual, calcularResultados, calcularEquivalenciasAmbientales } from '../utils/calculations.js';
import { formatearNumero } from '../utils/formatters.js';
import { mostrarNotificacion } from '../utils/notifications.js';
import { obtenerDatosClimaticos } from './api.js';

// Estado del wizard
let currentWizardStep = 0;
const totalWizardSteps = 6;

// Variables globales para el mapa del wizard
let wizardMap = null;
let wizardMapMarker = null;
let ubicacionSeleccionada = null;

// Variables globales para almacenar datos del wizard
let wizardData = {
    lat: null,
    lon: null,
    ubicacionNombre: '',
    psh: null,
    temperatura: null,
    moneda: 'ARS',
    modoConsumo: 'aproximado',
    consumoMensual: null,
    consumoMensualArray: [],
    precioKwh: null,
    modoDimensionamiento: 'porcentaje',
    porcentajeCobertura: 100,
    numPaneles: null,
    inclinacion: null  // No preseleccionar, el usuario debe elegir
};

// Variables globales para gráficos del wizard
let wizardMonthlyChart = null;
let wizardFinancialChart = null;
let wizardDistributionChart = null;

// Variables de búsqueda
let searchTimeout = null;
let selectedSuggestionIndex = -1;

// Variables del paso 2
let monedaSeleccionada = 'ARS';
let modoConsumo = 'aproximado';

// Funciones principales del wizard
export function abrirModalSimulador() {
    console.log('🔓 Intentando abrir modal simulador...');
    const modal = document.getElementById('modalSimulador');
    if (modal) {
        console.log('✅ Modal encontrado, abriendo...');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentWizardStep = 0;
        actualizarWizardUI();
        console.log('✅ Modal abierto');
    } else {
        console.error('❌ No se encontró el elemento modalSimulador');
    }
}

export function cerrarModalSimulador() {
    const modal = document.getElementById('modalSimulador');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        currentWizardStep = 0;
        actualizarWizardUI();
    }
}

export function actualizarWizardUI() {
    document.querySelectorAll('.wizard-step-content').forEach((step) => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum === currentWizardStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    actualizarWizardVisual();

    const btnPrev = document.getElementById('btnWizardPrev');
    const btnNext = document.getElementById('btnWizardNext');
    const wizardNav = document.getElementById('wizardNavigation');
    const wizardContent = document.querySelector('.modal-wizard-content');
    const btnCerrar = document.getElementById('btnCerrarSimulador');

    if (btnCerrar) {
        if (currentWizardStep === 0) {
            btnCerrar.style.display = 'none';
        } else {
            btnCerrar.style.display = 'flex';
        }
    }

    if (wizardNav) {
        if (currentWizardStep === 0) {
            wizardNav.style.display = 'none';
        } else {
            wizardNav.style.display = 'flex';
            wizardNav.style.visibility = 'visible';
            wizardNav.style.opacity = '1';

            // Mostrar botón PDF solo en paso 5
            const navActions = wizardNav.querySelector('.wizard-navigation-actions');
            if (navActions) {
                if (currentWizardStep === 5) {
                    navActions.style.display = 'flex';
                } else {
                    navActions.style.display = 'none';
                }
            }

            // Asegurar que el botón Siguiente siempre esté visible (está fuera de navActions)
            if (btnNext) {
                btnNext.style.display = 'flex';
            }

            if (currentWizardStep === 1) {
                if (wizardContent) wizardContent.classList.add('step-map-active');
                if (btnPrev) btnPrev.style.display = 'none';
                if (btnNext) {
                    btnNext.style.display = 'flex';
                    btnNext.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
                }
            } else {
                if (wizardContent) wizardContent.classList.remove('step-map-active');
                if (btnPrev) {
                    btnPrev.style.display = 'flex';
                }
                if (btnPrev) btnPrev.innerHTML = '<i class="fas fa-arrow-left"></i> Anterior';
                if (btnNext) {
                    btnNext.style.display = 'flex';
                    if (currentWizardStep === totalWizardSteps - 1) {
                        btnNext.innerHTML = 'Finalizar</i>';
                    } else {
                        btnNext.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
                    }
                }
            }
        }
    }

    if (btnPrev) {
        if (currentWizardStep === 1) {
            btnPrev.style.display = 'none';
        } else {
            btnPrev.style.display = 'flex';
            btnPrev.disabled = currentWizardStep <= 0;
        }
    }
}

export function actualizarWizardVisual() {
    const visualContent = document.getElementById('wizardVisualContent');
    if (!visualContent) return;

    if (currentWizardStep === 0) {
        visualContent.className = 'modal-wizard-visual intro-overlay';
        visualContent.innerHTML = `
            <div class="intro-content">
                <div class="intro-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h1 class="intro-title">Simulador</h1>
                <p class="intro-description">
                    Simula tu propio sistema para saber cuánto podes ahorrar con la energía solar en tu consumo eléctrico y emisiones de CO2.
                </p>
            </div>
        `;
    } else if (currentWizardStep === 1) {
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Ingresa tu Ubicación</h2>
                <p class="wizard-instructions-question">¿Dónde te gustaría instalar tu Sistema?</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 20%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 1/5</span>
                </div>
            </div>
        `;
        setTimeout(() => {
            inicializarWizardMapa();
        }, 300);
    } else if (currentWizardStep === 2) {
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Datos de tu Factura</h2>
                <p class="wizard-instructions-question">Ingresa la información de consumo y precio de tu factura eléctrica</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 40%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 2/5</span>
                </div>
            </div>
        `;
    } else if (currentWizardStep === 3) {
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Dimensiona tu Sistema</h2>
                <p class="wizard-instructions-question">Elige cómo quieres dimensionar tu sistema solar: por porcentaje de cobertura o por cantidad de paneles</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 60%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 3/5</span>
                </div>
            </div>
        `;
    } else if (currentWizardStep === 4) {
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Ángulo de Instalación</h2>
                <p class="wizard-instructions-question">Selecciona el ángulo de inclinación de tus paneles. El ángulo influye en la eficiencia de generación de energía</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 80%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 4/5</span>
                </div>
            </div>
        `;
    } else if (currentWizardStep === 5) {
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Tus Resultados</h2>
                <p class="wizard-instructions-question">Aquí está el análisis completo de tu sistema. Revisa los detalles y ajusta según necesites.</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 100%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 5/5</span>
                </div>
            </div>
        `;
        if (window.wizardResultados) {
            setTimeout(() => {
                inicializarWizardResultadosDetallados();
            }, 100);
        }
    } else {
        visualContent.className = 'modal-wizard-visual';
        visualContent.innerHTML = `<img src="images/inicio-sim.jpg" alt="Paneles solares">`;
    }
}

// Importar funciones de gráficos del wizard
import { generarGraficaMensualWizard, generarGraficaFinancieraWizard, generarGraficaDistribucionWizard } from './charts.js';

/**
 * Ir a un paso específico del wizard
 */
export function goToWizardStep(step) {
    if (step < 0 || step >= totalWizardSteps) return;

    if (step > currentWizardStep && !validarPasoActual()) {
        return;
    }

    if (currentWizardStep === 1 && step !== 1 && wizardMap) {
        wizardMap.remove();
        wizardMap = null;
        wizardMapMarker = null;
    }

    currentWizardStep = step;
    actualizarWizardUI();

    if (step === 3) {
        setTimeout(() => {
            inicializarWizardDimensionamiento();
        }, 100);
    } else if (step === 4) {
        setTimeout(() => {
            inicializarWizardAngulo();
        }, 100);
    } else if (step === 5) {
        // Recalcular y regenerar gráficos antes de mostrar resultados
        setTimeout(async () => {
            // Recalcular resultados para asegurar que estén actualizados
            await calcularResultadosWizard();
            // Inicializar vista detallada (esto regenera los gráficos)
            inicializarWizardResultadosDetallados();
        }, 100);
    }

    const content = document.querySelector('.modal-wizard-content');
    if (content) {
        content.scrollTop = 0;
    }
}

/**
 * Validar paso actual
 */
export function validarPasoActual() {
    switch (currentWizardStep) {
        case 1:
            return ubicacionSeleccionada !== null;
        case 2:
            return validarPaso2();
        case 3:
            return validarPaso3();
        case 4:
            return validarPaso4();
        default:
            return true;
    }
}

/**
 * Validar paso 2
 */
export function validarPaso2() {
    if (modoConsumo === 'aproximado') {
        const consumoAprox = document.getElementById('consumoAproximado');
        if (!consumoAprox || !consumoAprox.value || parseFloat(consumoAprox.value) <= 0) {
            mostrarNotificacion('⚠️ Por favor, ingresa un consumo mensual válido', 'error');
            return false;
        }
        wizardData.consumoMensual = parseFloat(consumoAprox.value);
        wizardData.consumoMensualArray = [];
    } else {
        const inputsMensuales = document.querySelectorAll('.monthly-input');
        let tieneValores = false;
        const consumoArray = [];

        inputsMensuales.forEach(input => {
            const valor = parseFloat(input.value);
            if (input.value && valor > 0) {
                tieneValores = true;
                consumoArray.push(valor);
            } else {
                consumoArray.push(0);
            }
        });

        if (!tieneValores) {
            mostrarNotificacion('⚠️ Por favor, ingresa al menos un valor de consumo mensual', 'error');
            return false;
        }

        wizardData.consumoMensualArray = consumoArray;
        wizardData.consumoMensual = consumoArray.reduce((a, b) => a + b, 0) / 12;
    }

    const precioKwh = document.getElementById('precioKwh');
    if (!precioKwh || !precioKwh.value || parseFloat(precioKwh.value) <= 0) {
        mostrarNotificacion('⚠️ Por favor, ingresa un precio por kWh válido', 'error');
        return false;
    }

    wizardData.precioKwh = parseFloat(precioKwh.value);

    return true;
}

/**
 * Validar paso 3
 */
export function validarPaso3() {
    const modoPorcentaje = document.getElementById('wizardModePorcentaje');
    const modoPaneles = document.getElementById('wizardModePaneles');

    if (modoPorcentaje && modoPorcentaje.checked) {
        wizardData.modoDimensionamiento = 'porcentaje';
        const sliderPorcentaje = document.getElementById('wizardPorcentajeCobertura');
        if (sliderPorcentaje) {
            wizardData.porcentajeCobertura = parseInt(sliderPorcentaje.value);
        }
        return true;
    } else if (modoPaneles && modoPaneles.checked) {
        wizardData.modoDimensionamiento = 'paneles';
        const inputPaneles = document.getElementById('wizardNumPanelesManual');

        if (inputPaneles) {
            const numPaneles = parseInt(inputPaneles.value);
            if (inputPaneles.value && !isNaN(numPaneles) && numPaneles > 0) {
                wizardData.numPaneles = numPaneles;
                return true;
            } else {
                mostrarNotificacion('⚠️ Por favor, ingresa un número válido de paneles', 'error');
                return false;
            }
        } else {
            mostrarNotificacion('⚠️ Error: campo de paneles no encontrado', 'error');
            return false;
        }
    } else {
        mostrarNotificacion('⚠️ Por favor, selecciona un modo de dimensionamiento', 'error');
        return false;
    }
}

/**
 * Validar paso 4
 */
export function validarPaso4() {
    const anguloSeleccionado = document.querySelector('#wizardStep4 input[name="wizard_angulo"]:checked');
    if (anguloSeleccionado) {
        wizardData.inclinacion = parseInt(anguloSeleccionado.value);
        return true;
    } else {
        mostrarNotificacion('⚠️ Por favor, selecciona un ángulo de instalación', 'error');
        return false;
    }
}

/**
 * Inicializar wizard modal
 */
export function inicializarWizardModal() {
    const btnPrev = document.getElementById('btnWizardPrev');
    const btnNext = document.getElementById('btnWizardNext');
    const btnIniciar = document.getElementById('btnIniciarSimulador');

    if (btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            goToWizardStep(1);
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentWizardStep > 0) {
                goToWizardStep(currentWizardStep - 1);
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', async () => {
            if (currentWizardStep === 4) {
                if (validarPasoActual()) {
                    await calcularResultadosWizard();
                    goToWizardStep(5);
                }
            } else if (currentWizardStep === 5) {
                // En el paso 5 (resultados), el botón "Finalizar" cierra el modal
                cerrarModalSimulador();
            } else if (currentWizardStep === 1) {
                if (ubicacionSeleccionada) {
                    const ubicacionOK = await confirmarUbicacionWizard();
                    if (ubicacionOK) {
                        goToWizardStep(currentWizardStep + 1);
                    }
                } else {
                    mostrarNotificacion('⚠️ Por favor selecciona una ubicación en el mapa', 'error');
                }
            } else if (currentWizardStep === 2) {
                if (validarPaso2()) {
                    goToWizardStep(currentWizardStep + 1);
                }
            } else if (currentWizardStep < totalWizardSteps - 1) {
                goToWizardStep(currentWizardStep + 1);
            }
        });
    }

    inicializarPaso2();
    inicializarPaso3Wizard();
    inicializarPaso4Wizard();
    actualizarWizardUI();
}

/**
 * Inicializar paso 2
 */
export function inicializarPaso2() {
    const currencyARS = document.getElementById('currencyARS');
    const currencyUSD = document.getElementById('currencyUSD');

    if (currencyARS) {
        currencyARS.addEventListener('click', () => cambiarMoneda('ARS'));
    }

    if (currencyUSD && !currencyUSD.disabled) {
        currencyUSD.addEventListener('click', () => cambiarMoneda('USD'));
    }

    const modeAproximado = document.getElementById('modeAproximado');
    const modeEspecifico = document.getElementById('modeEspecifico');

    if (modeAproximado) {
        modeAproximado.addEventListener('click', () => cambiarModoConsumo('aproximado'));
    }

    if (modeEspecifico && !modeEspecifico.disabled) {
        modeEspecifico.addEventListener('click', () => cambiarModoConsumo('especifico'));
    }
}

/**
 * Cambiar moneda
 */
export function cambiarMoneda(moneda) {
    monedaSeleccionada = moneda;
    wizardData.moneda = moneda;

    const currencyARS = document.getElementById('currencyARS');
    const currencyUSD = document.getElementById('currencyUSD');
    const priceCurrencyDisplay = document.getElementById('priceCurrencyDisplay');
    const precioKwhHelp = document.getElementById('precioKwhHelp');

    if (currencyARS) currencyARS.classList.toggle('active', moneda === 'ARS');
    if (currencyUSD) currencyUSD.classList.toggle('active', moneda === 'USD');

    if (priceCurrencyDisplay) {
        priceCurrencyDisplay.textContent = moneda;
    }

    if (precioKwhHelp) {
        if (moneda === 'ARS') {
            precioKwhHelp.textContent = 'Precio actual aproximado: ~$180 ARS/kWh (Nov 2025)';
        } else {
            precioKwhHelp.textContent = 'Precio actual aproximado: ~$0.20 USD/kWh';
        }
    }
}

/**
 * Cambiar modo consumo
 */
export function cambiarModoConsumo(modo) {
    modoConsumo = modo;
    wizardData.modoConsumo = modo;

    const modeAproximado = document.getElementById('modeAproximado');
    const modeEspecifico = document.getElementById('modeEspecifico');
    const consumoAproximadoSection = document.getElementById('consumoAproximadoSection');
    const consumoEspecificoSection = document.getElementById('consumoEspecificoSection');

    if (modeAproximado) modeAproximado.classList.toggle('active', modo === 'aproximado');
    if (modeEspecifico) modeEspecifico.classList.toggle('active', modo === 'especifico');

    if (consumoAproximadoSection) {
        consumoAproximadoSection.style.display = modo === 'aproximado' ? 'block' : 'none';
    }

    if (consumoEspecificoSection) {
        consumoEspecificoSection.style.display = modo === 'especifico' ? 'block' : 'none';
    }
}

/**
 * Inicializar paso 3 wizard
 */
export function inicializarPaso3Wizard() {
    const radioPorcentaje = document.getElementById('wizardModePorcentaje');
    const radioPaneles = document.getElementById('wizardModePaneles');

    if (radioPorcentaje) {
        radioPorcentaje.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamientoWizard('porcentaje');
        });
    }

    if (radioPaneles && !radioPaneles.disabled) {
        radioPaneles.addEventListener('change', function () {
            if (this.checked && !this.disabled) cambiarModoDimensionamientoWizard('paneles');
        });
    }

    const sliderPorcentaje = document.getElementById('wizardPorcentajeCobertura');
    if (sliderPorcentaje) {
        sliderPorcentaje.addEventListener('input', actualizarDisplayCoberturaWizard);
        sliderPorcentaje.addEventListener('change', actualizarDisplayCoberturaWizard);
    }

    const btnMenos = document.getElementById('wizardBtnMenosPanel');
    const btnMas = document.getElementById('wizardBtnMasPanel');
    const inputPaneles = document.getElementById('wizardNumPanelesManual');

    if (btnMenos) {
        btnMenos.addEventListener('click', function () {
            const valor = parseInt(inputPaneles?.value || 1);
            if (valor > 1 && inputPaneles) {
                inputPaneles.value = valor - 1;
            }
        });
    }

    if (btnMas) {
        btnMas.addEventListener('click', function () {
            const valor = parseInt(inputPaneles?.value || 1);
            if (inputPaneles) {
                inputPaneles.value = valor + 1;
            }
        });
    }

    if (inputPaneles) {
        inputPaneles.addEventListener('input', function () {
            if (this.value < 1) this.value = 1;
        });
    }

    document.querySelectorAll('#wizardStep3 .dimensionamiento-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('input, button, .option-content')) return;

            const mode = this.dataset.mode;
            if (mode === 'porcentaje' && radioPorcentaje) {
                radioPorcentaje.checked = true;
                cambiarModoDimensionamientoWizard('porcentaje');
            } else if (mode === 'paneles' && radioPaneles) {
                radioPaneles.checked = true;
                cambiarModoDimensionamientoWizard('paneles');
            }
        });
    });

    actualizarDisplayCoberturaWizard();

    const cardPorcentaje = document.querySelector('#wizardStep3 .dimensionamiento-option-card[data-mode="porcentaje"]');
    if (cardPorcentaje) {
        cardPorcentaje.classList.add('active');
    }
}

/**
 * Inicializar paso 4 wizard
 */
export function inicializarPaso4Wizard() {
    const radio20 = document.getElementById('wizardAngulo20');
    const radio45 = document.getElementById('wizardAngulo45');

    if (radio20) {
        radio20.addEventListener('change', function () {
            if (this.checked) cambiarAnguloWizard(20);
        });
    }

    if (radio45) {
        radio45.addEventListener('change', function () {
            if (this.checked) cambiarAnguloWizard(45);
        });
    }

    document.querySelectorAll('#wizardStep4 .angulo-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('input')) return;

            const angulo = parseInt(this.dataset.angulo);
            if (angulo === 20 && radio20) {
                radio20.checked = true;
                cambiarAnguloWizard(20);
            } else if (angulo === 45 && radio45) {
                radio45.checked = true;
                cambiarAnguloWizard(45);
            }
        });
    });

    // No preseleccionar ninguna opción - el usuario debe elegir
    // Si ya hay un valor guardado, restaurarlo
    if (wizardData.inclinacion) {
        const angulo = wizardData.inclinacion;
        if (angulo === 20 && radio20) {
            radio20.checked = true;
            cambiarAnguloWizard(20);
        } else if (angulo === 45 && radio45) {
            radio45.checked = true;
            cambiarAnguloWizard(45);
        }
    }
}

/**
 * Cambiar modo dimensionamiento wizard
 */
export function cambiarModoDimensionamientoWizard(mode) {
    wizardData.modoDimensionamiento = mode;

    const controlPorcentaje = document.getElementById('wizardControlPorcentaje');
    const controlPaneles = document.getElementById('wizardControlPaneles');
    const cardPorcentaje = document.querySelector('#wizardStep3 .dimensionamiento-option-card[data-mode="porcentaje"]');
    const cardPaneles = document.querySelector('#wizardStep3 .dimensionamiento-option-card[data-mode="paneles"]');

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
        actualizarPanelesPreviewWizard();
    }
}

/**
 * Actualizar display cobertura wizard
 */
export function actualizarDisplayCoberturaWizard() {
    const slider = document.getElementById('wizardPorcentajeCobertura');
    const display = document.getElementById('wizardCoberturaValue');

    if (slider && display) {
        const valor = parseInt(slider.value);
        display.textContent = `${valor}%`;
    }
}

/**
 * Actualizar paneles preview wizard
 */
export function actualizarPanelesPreviewWizard() {
    const inputPaneles = document.getElementById('wizardNumPanelesManual');
    const previewValue = document.getElementById('wizardPanelesPreviewValue');

    if (!inputPaneles || !previewValue) return;

    const numPaneles = parseInt(inputPaneles.value) || 1;
    previewValue.textContent = `${numPaneles} paneles`;
}

/**
 * Inicializar wizard dimensionamiento
 */
export function inicializarWizardDimensionamiento() {
    inicializarPaso3Wizard();
}

/**
 * Inicializar wizard angulo
 */
export function inicializarWizardAngulo() {
    inicializarPaso4Wizard();
}

/**
 * Cambiar angulo wizard
 */
export function cambiarAnguloWizard(angulo) {
    const card20 = document.querySelector('#wizardStep4 .angulo-option-card[data-angulo="20"]');
    const card45 = document.querySelector('#wizardStep4 .angulo-option-card[data-angulo="45"]');

    if (angulo === 20) {
        if (card20) card20.classList.add('active');
        if (card45) card45.classList.remove('active');
    } else {
        if (card20) card20.classList.remove('active');
        if (card45) card45.classList.add('active');
    }
}

/**
 * Calcular resultados wizard
 */
export async function calcularResultadosWizard() {
    console.log('🔄 Calculando resultados del wizard...');

    try {
        const datos = {
            lat: wizardData.lat,
            lon: wizardData.lon,
            ubicacion: wizardData.ubicacionNombre,
            psh: wizardData.psh || DATOS_EJEMPLO.psh,
            temperatura: wizardData.temperatura || DATOS_EJEMPLO.temperatura,
            inclinacion: wizardData.inclinacion,
            consumo_mensual: wizardData.consumoMensual,
            precio_kwh: wizardData.precioKwh,
            costo_panel: MODELO_CLUSTER.constantes.costo_por_panel,
            modo_dimensionamiento: wizardData.modoDimensionamiento,
            porcentaje_cobertura: wizardData.porcentajeCobertura,
            num_paneles: wizardData.numPaneles
        };

        const generacionMensual = calcularGeneracionMensual(datos);
        const resultados = calcularResultados(datos, generacionMensual);

        mostrarResultadosWizard(resultados, generacionMensual, datos);

    } catch (error) {
        console.error('❌ Error al calcular resultados:', error);
        mostrarNotificacion('⚠️ Error al calcular los resultados. Por favor intenta nuevamente.', 'error');
    }
}

/**
 * Mostrar resultados wizard
 */
export function mostrarResultadosWizard(resultados, generacionMensual, datos) {
    window.wizardResultados = resultados;
    window.wizardGeneracionMensual = generacionMensual;
    window.wizardDatos = datos;

    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    const panoramaAhorroMensual = document.getElementById('wizardPanoramaAhorroMensual');
    if (panoramaAhorroMensual) {
        panoramaAhorroMensual.textContent = `${simbolo}${formatearNumero(resultados.ahorro_mensual, moneda)}`;
    }

    const panoramaROI = document.getElementById('wizardPanoramaROI');
    if (panoramaROI) {
        if (resultados.roi_anos === Infinity || isNaN(resultados.roi_anos)) {
            panoramaROI.textContent = 'N/A';
        } else {
            panoramaROI.textContent = `${resultados.roi_anos.toFixed(1)} años`;
        }
    }

    const panoramaAutoconsumo = document.getElementById('wizardPanoramaAutoconsumo');
    if (panoramaAutoconsumo) {
        panoramaAutoconsumo.textContent = `${resultados.cobertura.toFixed(0)}%`;
    }

    const veredictoRapido = document.getElementById('wizardVeredictoRapido');
    if (veredictoRapido) {
        const pshPromedio = datos.psh.reduce((a, b) => a + b, 0) / datos.psh.length;
        let veredicto = '';
        if (pshPromedio >= 5.5) {
            veredicto = '¡Excelente ubicación! Tu techo tiene un potencial alto.';
        } else if (pshPromedio >= 4.5) {
            veredicto = 'Buena ubicación. Tu techo tiene potencial.';
        } else {
            veredicto = 'Ubicación aceptable. El sistema puede ser una buena inversión.';
        }
        veredictoRapido.textContent = veredicto;
    }

    const panoramaNumPaneles = document.getElementById('wizardPanoramaNumPaneles');
    if (panoramaNumPaneles) {
        panoramaNumPaneles.textContent = resultados.num_paneles || '-';
    }

    llenarDatosAnalisisEnergetico(resultados, generacionMensual, datos);
    llenarDatosInstalacion(resultados, datos);
    llenarDatosImpactoAmbiental();
}

/**
 * Llenar datos análisis energético
 */
export function llenarDatosAnalisisEnergetico(resultados, generacionMensual, datos) {
    const radiacionPromedio = document.getElementById('wizardRadiacionPromedio');
    if (radiacionPromedio) {
        const pshPromedio = datos.psh.reduce((a, b) => a + b, 0) / datos.psh.length;
        radiacionPromedio.textContent = `${pshPromedio.toFixed(2)} kWh/m²/día`;
    }

    const ubicacionNombre = document.getElementById('wizardUbicacionNombre');
    if (ubicacionNombre) {
        ubicacionNombre.textContent = datos.ubicacion || wizardData.ubicacionNombre || 'Ubicación seleccionada';
    }

    const generacionAnual = document.getElementById('wizardGeneracionAnual');
    if (generacionAnual && resultados) {
        generacionAnual.textContent = `${formatearNumero(resultados.energia_anual_total)} kWh/año`;
    }

    const perdidasTemperatura = document.getElementById('wizardPerdidasTemperatura');
    if (perdidasTemperatura) {
        const tempPromedio = datos.temperatura.reduce((a, b) => a + b, 0) / datos.temperatura.length;
        const perdidas = Math.max(0, (tempPromedio - 25) * 0.4);
        perdidasTemperatura.textContent = `${perdidas.toFixed(1)}%`;
    }

    const energiaConsumida = document.getElementById('wizardEnergiaConsumida');
    const energiaInyectada = document.getElementById('wizardEnergiaInyectada');
    if (energiaConsumida && energiaInyectada) {
        const consumoAnual = (datos.consumo_mensual || datos.consumo) * 12;
        const energiaAnual = resultados.energia_anual_total || resultados.generacion_anual || 0;
        const excedentes = Math.max(0, energiaAnual - consumoAnual);
        energiaConsumida.textContent = `${consumoAnual.toFixed(0)} kWh`;
        energiaInyectada.textContent = `${excedentes.toFixed(0)} kWh`;
    }
}

/**
 * Llenar datos instalación
 */
export function llenarDatosInstalacion(resultados, datos) {
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    const productPanelesCantidad = document.getElementById('wizardProductPanelesCantidad');
    const productPotenciaTotal = document.getElementById('wizardProductPotenciaTotal');
    if (productPanelesCantidad) productPanelesCantidad.textContent = resultados.num_paneles;
    if (productPotenciaTotal) {
        const potenciaKW = (resultados.num_paneles * 0.19).toFixed(2);
        productPotenciaTotal.textContent = potenciaKW;
    }

    const productInversorPotencia = document.getElementById('wizardProductInversorPotencia');
    if (productInversorPotencia) {
        const potenciaKW = (resultados.num_paneles * 0.19).toFixed(2);
        productInversorPotencia.textContent = potenciaKW;
    }

    const productEstructuraTipo = document.getElementById('wizardProductEstructuraTipo');
    const productInclinacion = document.getElementById('wizardProductInclinacion');
    const productSoporteImagen = document.getElementById('wizardProductSoporteImagen');

    if (productInclinacion) productInclinacion.textContent = datos.inclinacion;

    if (productEstructuraTipo) {
        if (datos.inclinacion === 20) {
            productEstructuraTipo.textContent = 'Aluminio Anodizado (Coplanar)';
        } else {
            productEstructuraTipo.textContent = 'Aluminio Anodizado (Triángulo)';
        }
    }

    if (productSoporteImagen) {
        if (datos.inclinacion === 20) {
            productSoporteImagen.src = 'images/soporte20.png';
        } else {
            productSoporteImagen.src = 'images/soporte45.png';
        }
        productSoporteImagen.alt = `Estructura de soporte a ${datos.inclinacion}°`;
    }

    const bomPanelesCantidad = document.getElementById('wizardBomPanelesCantidad');
    const bomPanelesModelo = document.getElementById('wizardBomPanelesModelo');
    if (bomPanelesCantidad) bomPanelesCantidad.textContent = `${resultados.num_paneles}x`;
    if (bomPanelesModelo) bomPanelesModelo.textContent = 'Jinko/Longi 450W';

    const bomInversorModelo = document.getElementById('wizardBomInversorModelo');
    if (bomInversorModelo) {
        const potenciaKW = (resultados.num_paneles * 0.45).toFixed(1);
        bomInversorModelo.textContent = `Growatt/Huawei ${potenciaKW}kW`;
    }

    const bomEstructuraTipo = document.getElementById('wizardBomEstructuraTipo');
    if (bomEstructuraTipo) {
        if (datos.inclinacion === 20) {
            bomEstructuraTipo.textContent = 'Aluminio Anodizado (Coplanar)';
        } else {
            bomEstructuraTipo.textContent = 'Aluminio Anodizado (Triángulo)';
        }
    }

    const espacioRequerido = document.getElementById('wizardEspacioRequerido');
    if (espacioRequerido) {
        const superficie = resultados.num_paneles * 1.5;
        espacioRequerido.textContent = `${superficie.toFixed(1)} m²`;
    }

    const techoArea = document.getElementById('wizardTechoArea');
    if (techoArea) {
        const superficie = resultados.num_paneles * 1.5;
        const porcentaje = Math.min(100, (superficie / 50) * 100);
        techoArea.style.width = `${porcentaje}%`;
    }
}

/**
 * Llenar datos impacto ambiental
 */
export function llenarDatosImpactoAmbiental() {
    if (!window.wizardResultados) return;

    const resultados = window.wizardResultados;
    const co2Anual = resultados.co2_anual || 0;
    const co225Anos = resultados.co2_25_anos || (co2Anual * 25);
    
    const equivalencias = calcularEquivalenciasAmbientales(co2Anual);

    // CO₂ evitado por año
    const impactoCO2Anual = document.getElementById('wizardImpactoCO2Anual');
    if (impactoCO2Anual) {
        impactoCO2Anual.textContent = `${formatearNumero(co2Anual, 'ARS')} kg`;
    }

    // CO₂ evitado en 25 años
    const impactoCO225Anos = document.getElementById('wizardImpactoCO225Anos');
    if (impactoCO225Anos) {
        const toneladas = co225Anos / 1000;
        impactoCO225Anos.textContent = `${formatearNumero(toneladas, 'ARS')} ton`;
    }

    // Equivalencias
    const equivalenciaArboles = document.getElementById('wizardEquivalenciaArboles');
    if (equivalenciaArboles) {
        equivalenciaArboles.textContent = `~${formatearNumero(equivalencias.arboles, 'ARS')}`;
    }

    const equivalenciaAutos = document.getElementById('wizardEquivalenciaAutos');
    if (equivalenciaAutos) {
        equivalenciaAutos.textContent = `~${formatearNumero(equivalencias.autos, 'ARS')}`;
    }

    const equivalenciaVuelos = document.getElementById('wizardEquivalenciaVuelos');
    if (equivalenciaVuelos) {
        equivalenciaVuelos.textContent = `~${formatearNumero(equivalencias.vuelos, 'ARS')}`;
    }

    const equivalenciaHogares = document.getElementById('wizardEquivalenciaHogares');
    if (equivalenciaHogares) {
        equivalenciaHogares.textContent = `~${formatearNumero(equivalencias.hogares, 'ARS')}`;
    }
}

/**
 * Inicializar wizard resultados detallados
 */
export function inicializarWizardResultadosDetallados() {
    const tabsContainer = document.getElementById('wizardResultsTabsContainer');
    if (tabsContainer) {
        tabsContainer.style.display = 'block';
    }

    if (window.wizardResultados) {
        llenarVistaDetalladaWizard();
        
        // Regenerar todos los gráficos para asegurar que estén actualizados
        setTimeout(() => {
            // Destruir gráficos existentes si existen
            if (wizardMonthlyChart) {
                wizardMonthlyChart.destroy();
                wizardMonthlyChart = null;
            }
            if (wizardDistributionChart) {
                wizardDistributionChart.destroy();
                wizardDistributionChart = null;
            }
            if (wizardFinancialChart) {
                wizardFinancialChart.destroy();
                wizardFinancialChart = null;
            }
            
            // Regenerar todos los gráficos
            generarGraficaMensualWizard();
            generarGraficaDistribucionWizard();
            generarGraficaFinancieraWizard();
        }, 200);
    }

    const tabs = document.querySelectorAll('#wizardStep5 .wizard-result-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.dataset.tab;

            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const tabPanorama = document.getElementById('wizardTabPanorama');
            const tabEnergia = document.getElementById('wizardTabEnergia');
            const tabImpacto = document.getElementById('wizardTabImpacto');
            const tabFinanzas = document.getElementById('wizardTabFinanzas');
            const tabInstalacion = document.getElementById('wizardTabInstalacion');

            if (tabPanorama) {
                tabPanorama.style.display = 'none';
                tabPanorama.classList.remove('active');
            }
            if (tabEnergia) {
                tabEnergia.style.display = 'none';
                tabEnergia.classList.remove('active');
            }
            if (tabImpacto) {
                tabImpacto.style.display = 'none';
                tabImpacto.classList.remove('active');
            }
            if (tabFinanzas) {
                tabFinanzas.style.display = 'none';
                tabFinanzas.classList.remove('active');
            }
            if (tabInstalacion) {
                tabInstalacion.style.display = 'none';
                tabInstalacion.classList.remove('active');
            }

            let targetPane = null;
            if (tabName === 'panorama') {
                targetPane = tabPanorama;
            } else if (tabName === 'energia') {
                targetPane = tabEnergia;
            } else if (tabName === 'impacto') {
                targetPane = tabImpacto;
            } else if (tabName === 'finanzas') {
                targetPane = tabFinanzas;
            } else if (tabName === 'instalacion') {
                targetPane = tabInstalacion;
            }

            if (targetPane) {
                targetPane.style.display = 'block';
                targetPane.classList.add('active');
            }

            if (tabName === 'energia' && window.wizardGeneracionMensual) {
                if (targetPane) {
                    targetPane.style.display = 'block';
                    targetPane.classList.add('active');
                    let parent = targetPane.parentElement;
                    while (parent && parent !== document.body) {
                        if (window.getComputedStyle(parent).display === 'none') {
                            parent.style.display = 'block';
                        }
                        parent = parent.parentElement;
                    }
                }

                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            if (wizardMonthlyChart) {
                                wizardMonthlyChart.destroy();
                                wizardMonthlyChart = null;
                            }
                            if (wizardDistributionChart) {
                                wizardDistributionChart.destroy();
                                wizardDistributionChart = null;
                            }
                            generarGraficaMensualWizard();
                            generarGraficaDistribucionWizard();
                        }, 100);
                    });
                });
            } else if (tabName === 'impacto' && window.wizardResultados) {
                llenarDatosImpactoAmbiental();
            } else if (tabName === 'finanzas' && window.wizardResultados) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        if (wizardFinancialChart) {
                            wizardFinancialChart.destroy();
                            wizardFinancialChart = null;
                        }
                        generarGraficaFinancieraWizard();
                        llenarTablaAhorroAcumulado();
                    }, 50);
                });
            } else if (tabName === 'instalacion') {
                actualizarImagenInstalacion();
            }
        });
    });

    // La sección de inflación está bloqueada, no se usa en los cálculos
    // Los cálculos se hacen sin inflación
}

/**
 * Llenar vista detallada wizard
 */
export function llenarVistaDetalladaWizard() {
    if (!window.wizardResultados || !window.wizardDatos) return;

    const resultados = window.wizardResultados;
    const datos = window.wizardDatos;
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    const detailROI = document.getElementById('wizardDetailROI');
    if (detailROI) {
        if (resultados.roi_anos === Infinity || isNaN(resultados.roi_anos)) {
            detailROI.textContent = 'N/A';
        } else {
            detailROI.textContent = `${resultados.roi_anos.toFixed(1)} años`;
        }
    }

    const detailCostoBase = document.getElementById('wizardDetailCostoBase');
    if (detailCostoBase) {
        detailCostoBase.textContent = `${simbolo}${formatearNumero(resultados.costo_base, moneda)}`;
    }

    const detailCostoPaneles = document.getElementById('wizardDetailCostoPaneles');
    if (detailCostoPaneles) {
        detailCostoPaneles.textContent = `${simbolo}${formatearNumero(resultados.costo_paneles, moneda)}`;
    }

    const detailCostoTotal = document.getElementById('wizardDetailCostoTotal');
    if (detailCostoTotal) {
        detailCostoTotal.textContent = `${simbolo}${formatearNumero(resultados.costo_total || resultados.inversion_total, moneda)}`;
    }

    const detailAhorro25 = document.getElementById('wizardDetailAhorro25');
    if (detailAhorro25) {
        // Sin inflación: simplemente multiplicar el ahorro anual por 25 años
        const ahorroTotal25 = (resultados.ahorro_anual || 0) * 25;
        detailAhorro25.textContent = `${simbolo}${formatearNumero(ahorroTotal25, moneda)}`;
    }

    const balanceGeneracion = document.getElementById('wizardBalanceGeneracion');
    if (balanceGeneracion) {
        const energiaAnual = resultados.energia_anual_total || resultados.generacion_anual || 0;
        balanceGeneracion.textContent = `${energiaAnual.toFixed(0)} kWh`;
    }

    const balanceInyectado = document.getElementById('wizardBalanceInyectado');
    if (balanceInyectado) {
        const consumoAnual = (datos.consumo_mensual || datos.consumo) * 12;
        const energiaAnual = resultados.energia_anual_total || resultados.generacion_anual || 0;
        const excedentes = Math.max(0, energiaAnual - consumoAnual);
        balanceInyectado.textContent = `${excedentes.toFixed(0)} kWh`;
    }

    const equipPanelModelo = document.getElementById('wizardEquipPanelModelo');
    if (equipPanelModelo) equipPanelModelo.textContent = 'Panel de Referencia 190W';

    const equipPanelCantidad = document.getElementById('wizardEquipPanelCantidad');
    if (equipPanelCantidad) equipPanelCantidad.textContent = resultados.num_paneles;

    const equipPanelPotencia = document.getElementById('wizardEquipPanelPotencia');
    if (equipPanelPotencia) {
        equipPanelPotencia.textContent = `${(resultados.num_paneles * 190 / 1000).toFixed(1)} kW`;
    }

    const equipSuperficie = document.getElementById('wizardEquipSuperficie');
    if (equipSuperficie) {
        const superficie = resultados.num_paneles * 1.5;
        equipSuperficie.textContent = `${superficie.toFixed(1)} m²`;
    }

    const equipInclinacion = document.getElementById('wizardEquipInclinacion');
    if (equipInclinacion) equipInclinacion.textContent = `${datos.inclinacion}°`;

    const equipEstructura = document.getElementById('wizardEquipEstructura');
    if (equipEstructura) {
        if (datos.inclinacion === 20) {
            equipEstructura.textContent = 'Coplanar (20°) - Sin soportes adicionales, menor carga de viento';
        } else {
            equipEstructura.textContent = 'Inclinada (45°) - Requiere soportes triangulares para elevar los paneles';
        }
    }

    const equipPanelPrecio = document.getElementById('wizardEquipPanelPrecio');
    if (equipPanelPrecio) {
        equipPanelPrecio.textContent = `${simbolo}${formatearNumero(resultados.costo_panel, moneda)}`;
    }

    llenarTablaMensualWizard();
}

/**
 * Llenar tabla mensual wizard
 */
export function llenarTablaMensualWizard() {
    if (!window.wizardGeneracionMensual || !window.wizardDatos) return;

    const tbody = document.getElementById('wizardMonthlyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const generacionMensual = window.wizardGeneracionMensual;
    const numPaneles = (window.wizardResultados && window.wizardResultados.num_paneles) ? window.wizardResultados.num_paneles : 1;
    const consumoMensualBase = window.wizardDatos.consumo_mensual || window.wizardDatos.consumo || 350;

    let consumos;
    if (wizardData.modoConsumo === 'especifico' && wizardData.consumoMensualArray && wizardData.consumoMensualArray.length === 12) {
        consumos = wizardData.consumoMensualArray;
    } else {
        consumos = new Array(12).fill(consumoMensualBase);
    }

    generacionMensual.forEach((mes, index) => {
        const energia = mes.energia_mensual * numPaneles;
        const consumo = consumos[index];
        const balance = energia - consumo;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meses[index]}</td>
            <td>${energia.toFixed(1)}</td>
            <td>${consumo.toFixed(1)}</td>
            <td style="color: ${balance >= 0 ? '#2ecc71' : '#e74c3c'}; font-weight: 600;">
                ${balance >= 0 ? '+' : ''}${balance.toFixed(1)}
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * Llenar tabla ahorro acumulado
 */
export function llenarTablaAhorroAcumulado() {
    if (!window.wizardResultados) return;

    const tbody = document.getElementById('wizardAhorroTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const ahorroAnualBase = window.wizardResultados.ahorro_anual || 0;
    const costoTotal = window.wizardResultados.costo_total || window.wizardResultados.inversion_total || 0;
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    const años = [1, 5, 10, 15];

    años.forEach(año => {
        // Sin inflación: el ahorro anual es constante
        const ahorroAcumulado = ahorroAnualBase * año;
        const ahorroAnual = ahorroAnualBase;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0;">${año}</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0;">${simbolo}${formatearNumero(ahorroAcumulado, moneda)}</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0; color: ${ahorroAnual >= 0 ? '#2ecc71' : '#e74c3c'}; font-weight: 600;">${simbolo}${formatearNumero(ahorroAnual, moneda)}</td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Actualizar imagen instalación
 */
export function actualizarImagenInstalacion() {
    if (!window.wizardDatos) return;

    const imagenInstalacion = document.getElementById('wizardInstalacionImage');
    if (imagenInstalacion) {
        const inclinacion = wizardData.inclinacion || window.wizardDatos.inclinacion;
        if (inclinacion === 20) {
            imagenInstalacion.src = 'images/panel20.png';
            imagenInstalacion.alt = 'Instalación solar a 20°';
        } else {
            imagenInstalacion.src = 'images/panel45.png';
            imagenInstalacion.alt = 'Instalación solar a 45°';
        }
    }
}

/**
 * Inicializar wizard mapa
 */
export function inicializarWizardMapa() {
    const mapContainer = document.getElementById('wizardMap');
    if (!mapContainer || wizardMap) return;

    wizardMap = L.map('wizardMap', {
        zoomControl: false,
        maxZoom: 22,
        minZoom: 3,
        zoomSnap: 0.5,
        zoomDelta: 0.5
    }).setView([-38.4161, -63.6167], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 22,
        minZoom: 3
    }).addTo(wizardMap);

    wizardMap.on('click', function (e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        if (wizardMapMarker) {
            wizardMap.removeLayer(wizardMapMarker);
        }

        wizardMapMarker = L.marker([lat, lon]).addTo(wizardMap);
        obtenerNombreDesdeCoordenadas(lat, lon);
    });

    inicializarBusquedaMapa();
    inicializarTogglesMapa();

    L.control.zoom({
        position: 'bottomright',
        zoomInTitle: 'Acercar',
        zoomOutTitle: 'Alejar'
    }).addTo(wizardMap);

    setTimeout(() => {
        wizardMap.invalidateSize();
    }, 100);
}

/**
 * Inicializar búsqueda mapa
 */
export function inicializarBusquedaMapa() {
    const searchInput = document.getElementById('wizardMapSearch');
    const searchBtn = document.querySelector('.wizard-map-search-btn');
    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');

    if (!searchInput || !searchBtn || !suggestionsContainer) return;

    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim();

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        if (!query || query.length < 3) {
            suggestionsContainer.classList.remove('active');
            suggestionsContainer.innerHTML = '';
            selectedSuggestionIndex = -1;
            return;
        }

        searchTimeout = setTimeout(() => {
            buscarSugerencias(query);
        }, 300);
    });

    searchInput.addEventListener('keydown', function (e) {
        const suggestions = suggestionsContainer?.querySelectorAll('.wizard-map-search-suggestion');
        if (!suggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            actualizarSugerenciaSeleccionada(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            actualizarSugerenciaSeleccionada(suggestions);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                seleccionarSugerencia(suggestions[selectedSuggestionIndex]);
            } else {
                buscarDireccion();
            }
        } else if (e.key === 'Escape') {
            suggestionsContainer.classList.remove('active');
            selectedSuggestionIndex = -1;
        }
    });

    searchBtn.addEventListener('click', buscarDireccion);

    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !suggestionsContainer?.contains(e.target)) {
            suggestionsContainer.classList.remove('active');
        }
    });
}

/**
 * Buscar sugerencias
 */
export function buscarSugerencias(query) {
    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');
    const searchInput = document.getElementById('wizardMapSearch');

    if (!suggestionsContainer || !searchInput) return;

    if (!query || query.length < 3) {
        suggestionsContainer.classList.remove('active');
        suggestionsContainer.innerHTML = '';
        return;
    }

    suggestionsContainer.innerHTML = '<div class="wizard-map-search-suggestion" style="text-align: center; color: #999; font-style: italic; pointer-events: none;">Buscando...</div>';
    suggestionsContainer.classList.add('active');
    suggestionsContainer.style.display = 'block';

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=ar&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            suggestionsContainer.innerHTML = '';
            selectedSuggestionIndex = -1;

            if (data && data.length > 0) {
                data.forEach((result, index) => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'wizard-map-search-suggestion';
                    const displayName = formatearNombreDireccion(result.display_name);
                    suggestion.dataset.lat = result.lat;
                    suggestion.dataset.lon = result.lon;
                    suggestion.dataset.name = result.display_name;
                    const highlightedName = resaltarCoincidencia(displayName, query);
                    suggestion.innerHTML = highlightedName;

                    suggestion.addEventListener('click', () => {
                        seleccionarSugerencia(suggestion);
                    });

                    suggestion.addEventListener('mouseenter', () => {
                        selectedSuggestionIndex = index;
                        actualizarSugerenciaSeleccionada(suggestionsContainer.querySelectorAll('.wizard-map-search-suggestion'));
                    });

                    suggestionsContainer.appendChild(suggestion);
                });

                suggestionsContainer.classList.add('active');
                suggestionsContainer.style.display = 'block';
            } else {
                const noResults = document.createElement('div');
                noResults.className = 'wizard-map-search-suggestion';
                noResults.style.textAlign = 'center';
                noResults.style.color = '#999';
                noResults.style.fontStyle = 'italic';
                noResults.style.pointerEvents = 'none';
                noResults.textContent = 'No se encontraron resultados';
                suggestionsContainer.appendChild(noResults);
                suggestionsContainer.classList.add('active');
            }
        })
        .catch(error => {
            console.error('Error al buscar sugerencias:', error);
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
        });
}

/**
 * Formatear nombre dirección
 */
export function formatearNombreDireccion(nombreCompleto) {
    const partes = nombreCompleto.split(',');
    if (partes.length > 3) {
        return partes.slice(0, 3).join(', ').trim();
    }
    return nombreCompleto;
}

/**
 * Resaltar coincidencia
 */
export function resaltarCoincidencia(texto, busqueda) {
    const regex = new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return texto.replace(regex, '<span style="color: var(--primary-color); font-weight: 500;">$1</span>');
}

/**
 * Actualizar sugerencia seleccionada
 */
export function actualizarSugerenciaSeleccionada(suggestions) {
    suggestions.forEach((suggestion, index) => {
        if (index === selectedSuggestionIndex) {
            suggestion.classList.add('active');
            suggestion.scrollIntoView({ block: 'nearest' });
            const lat = parseFloat(suggestion.dataset.lat);
            const lon = parseFloat(suggestion.dataset.lon);
            mostrarPreviewEnMapa(lat, lon, suggestion.dataset.name);
        } else {
            suggestion.classList.remove('active');
        }
    });
}

/**
 * Mostrar preview en mapa
 */
export function mostrarPreviewEnMapa(lat, lon, nombre) {
    if (!wizardMap) return;

    if (wizardMapMarker && wizardMapMarker.options.isPreview) {
        wizardMap.removeLayer(wizardMapMarker);
        wizardMapMarker = null;
    }

    wizardMap.setView([lat, lon], Math.max(wizardMap.getZoom(), 13), {
        animate: true,
        duration: 0.3
    });

    const previewMarker = L.marker([lat, lon], {
        isPreview: true
    }).addTo(wizardMap);

    wizardMapMarker = previewMarker;
}

/**
 * Seleccionar sugerencia
 */
export function seleccionarSugerencia(suggestionElement) {
    const lat = parseFloat(suggestionElement.dataset.lat);
    const lon = parseFloat(suggestionElement.dataset.lon);
    const name = suggestionElement.dataset.name;

    const searchInput = document.getElementById('wizardMapSearch');
    if (searchInput) {
        searchInput.value = name;
    }

    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('active');
    }

    if (wizardMap) {
        wizardMap.setView([lat, lon], 15, {
            animate: true,
            duration: 0.5
        });

        if (wizardMapMarker) {
            wizardMap.removeLayer(wizardMapMarker);
        }

        wizardMapMarker = L.marker([lat, lon]).addTo(wizardMap);

        ubicacionSeleccionada = {
            lat: lat,
            lon: lon,
            nombre: name
        };
    }

    selectedSuggestionIndex = -1;
}

/**
 * Obtener nombre desde coordenadas
 */
export function obtenerNombreDesdeCoordenadas(lat, lon) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                const nombre = data.display_name;
                const searchInput = document.getElementById('wizardMapSearch');
                if (searchInput) {
                    searchInput.value = nombre;
                }
                ubicacionSeleccionada = {
                    lat: lat,
                    lon: lon,
                    nombre: nombre
                };
            } else {
                ubicacionSeleccionada = {
                    lat: lat,
                    lon: lon,
                    nombre: 'Ubicación seleccionada'
                };
            }
        })
        .catch(error => {
            console.error('Error al obtener nombre del lugar:', error);
            ubicacionSeleccionada = {
                lat: lat,
                lon: lon,
                nombre: 'Ubicación seleccionada'
            };
        });
}

/**
 * Buscar dirección
 */
export function buscarDireccion() {
    const searchInput = document.getElementById('wizardMapSearch');
    if (!searchInput || !wizardMap) return;

    const query = searchInput.value.trim();
    if (!query) return;

    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('active');
    }

    const searchBtn = document.querySelector('.wizard-map-search-btn');
    if (searchBtn) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;
    }

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ar&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                const nombre = result.display_name || query;

                wizardMap.setView([lat, lon], 15, {
                    animate: true,
                    duration: 0.5
                });

                if (wizardMapMarker) {
                    wizardMap.removeLayer(wizardMapMarker);
                }

                wizardMapMarker = L.marker([lat, lon]).addTo(wizardMap);

                ubicacionSeleccionada = {
                    lat: lat,
                    lon: lon,
                    nombre: nombre
                };

                searchInput.value = nombre;
            } else {
                alert('No se encontró la dirección. Por favor, intenta con otra búsqueda o selecciona un punto en el mapa.');
            }
        })
        .catch(error => {
            console.error('Error en la búsqueda:', error);
            alert('Error al buscar la dirección. Por favor, intenta nuevamente.');
        })
        .finally(() => {
            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-search"></i>';
                searchBtn.disabled = false;
            }
        });
}

/**
 * Inicializar toggles mapa
 */
export function inicializarTogglesMapa() {
    const toggles = document.querySelectorAll('.wizard-map-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            toggles.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const view = this.dataset.view;

            wizardMap.eachLayer(function (layer) {
                if (layer instanceof L.TileLayer) {
                    wizardMap.removeLayer(layer);
                }
            });

            if (view === 'satellite') {
                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, IGP',
                    maxZoom: 22,
                    minZoom: 3
                }).addTo(wizardMap);
            } else {
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 22,
                    minZoom: 3
                }).addTo(wizardMap);
            }
        });
    });
}

/**
 * Confirmar ubicación wizard
 */
export async function confirmarUbicacionWizard() {
    if (ubicacionSeleccionada) {
        console.log('📍 Ubicación confirmada:', ubicacionSeleccionada);

        wizardData.lat = ubicacionSeleccionada.lat;
        wizardData.lon = ubicacionSeleccionada.lon;
        wizardData.ubicacionNombre = ubicacionSeleccionada.nombre || 'Ubicación seleccionada';

        const wizardStep1 = document.getElementById('wizardStep1');
        const btnNext = document.getElementById('btnWizardNext');
        
        // Deshabilitar botón Siguiente mientras carga
        if (btnNext) {
            btnNext.disabled = true;
            btnNext.style.opacity = '0.5';
            btnNext.style.cursor = 'not-allowed';
        }

        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'wizardLoadingOverlay';
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            gap: 1rem;
        `;
        loadingOverlay.innerHTML = `
            <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite;"></div>
            <p style="color: #333; font-size: 1rem;">Obteniendo datos...</p>
        `;

        if (wizardStep1) {
            wizardStep1.style.position = 'relative';
            wizardStep1.appendChild(loadingOverlay);
        }

        try {
            await obtenerDatosClimaticosWizard(ubicacionSeleccionada.lat, ubicacionSeleccionada.lon);
            loadingOverlay.remove();
            
            // Habilitar botón Siguiente cuando termina la carga
            if (btnNext) {
                btnNext.disabled = false;
                btnNext.style.opacity = '1';
                btnNext.style.cursor = 'pointer';
            }
            
            return true;
        } catch (error) {
            console.error('Error obteniendo datos climáticos:', error);
            loadingOverlay.remove();
            
            // Habilitar botón Siguiente incluso si hay error
            if (btnNext) {
                btnNext.disabled = false;
                btnNext.style.opacity = '1';
                btnNext.style.cursor = 'pointer';
            }
            
            mostrarNotificacion('⚠️ Error obteniendo datos climáticos. Usando datos de ejemplo.', 'error');
            wizardData.psh = DATOS_EJEMPLO.psh;
            wizardData.temperatura = DATOS_EJEMPLO.temperatura;
            return true;
        }
    }
    return false;
}

/**
 * Obtener datos climáticos wizard
 */
export async function obtenerDatosClimaticosWizard(lat, lon) {
    try {
        const year = new Date().getFullYear() - 1;

        const url = `https://power.larc.nasa.gov/api/temporal/monthly/point?` +
            `parameters=ALLSKY_SFC_SW_DWN,T2M` +
            `&community=RE` +
            `&longitude=${lon}` +
            `&latitude=${lat}` +
            `&start=${year}` +
            `&end=${year}` +
            `&format=JSON`;

        console.log('🌐 Consultando NASA POWER API...');

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();

        const pshData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
        const tempData = data.properties.parameter.T2M;

        wizardData.psh = Object.values(pshData);
        wizardData.temperatura = Object.values(tempData);

    } catch (error) {
        console.warn('⚠️ NASA POWER falló, intentando Open-Meteo...');

        const endDate = new Date();
        const startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);

        const url = `https://archive-api.open-meteo.com/v1/archive?` +
            `latitude=${lat}` +
            `&longitude=${lon}` +
            `&start_date=${startDate.toISOString().split('T')[0]}` +
            `&end_date=${endDate.toISOString().split('T')[0]}` +
            `&daily=shortwave_radiation_sum,temperature_2m_mean` +
            `&timezone=auto`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo API Error: ${response.status}`);
        }

        const data = await response.json();

        const radiation = data.daily.shortwave_radiation_sum;
        const temperature = data.daily.temperature_2m_mean;
        const dates = data.daily.time;

        const monthlyData = {};

        dates.forEach((date, index) => {
            const month = new Date(date).getMonth();
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    radiation: [],
                    temperature: []
                };
            }
            if (radiation[index] !== null) {
                monthlyData[month].radiation.push(radiation[index]);
            }
            if (temperature[index] !== null) {
                monthlyData[month].temperature.push(temperature[index]);
            }
        });

        wizardData.psh = [];
        wizardData.temperatura = [];

        for (let i = 0; i < 12; i++) {
            if (monthlyData[i]) {
                const avgRad = monthlyData[i].radiation.reduce((a, b) => a + b, 0) / monthlyData[i].radiation.length;
                const avgTemp = monthlyData[i].temperature.reduce((a, b) => a + b, 0) / monthlyData[i].temperature.length;
                wizardData.psh.push(avgRad / 3.6);
                wizardData.temperatura.push(avgTemp);
            } else {
                wizardData.psh.push(DATOS_EJEMPLO.psh[i]);
                wizardData.temperatura.push(DATOS_EJEMPLO.temperatura[i]);
            }
        }
    }
}

// Exportar funciones y estado para uso global
export {
    currentWizardStep,
    totalWizardSteps,
    wizardMap,
    wizardMapMarker,
    ubicacionSeleccionada,
    wizardData,
    wizardMonthlyChart,
    wizardFinancialChart,
    wizardDistributionChart,
    searchTimeout,
    selectedSuggestionIndex,
    monedaSeleccionada,
    modoConsumo
};

// Exportar al scope global para compatibilidad
window.abrirModalSimulador = abrirModalSimulador;
window.cerrarModalSimulador = cerrarModalSimulador;
window.actualizarWizardUI = actualizarWizardUI;
window.actualizarWizardVisual = actualizarWizardVisual;
window.goToWizardStep = goToWizardStep;
window.validarPasoActual = validarPasoActual;
window.validarPaso2 = validarPaso2;
window.validarPaso3 = validarPaso3;
window.validarPaso4 = validarPaso4;
window.inicializarWizardModal = inicializarWizardModal;
window.inicializarPaso2 = inicializarPaso2;
window.cambiarMoneda = cambiarMoneda;
window.cambiarModoConsumo = cambiarModoConsumo;
window.inicializarPaso3Wizard = inicializarPaso3Wizard;
window.inicializarPaso4Wizard = inicializarPaso4Wizard;
window.calcularResultadosWizard = calcularResultadosWizard;
window.cambiarModoDimensionamientoWizard = cambiarModoDimensionamientoWizard;
window.actualizarDisplayCoberturaWizard = actualizarDisplayCoberturaWizard;
window.actualizarPanelesPreviewWizard = actualizarPanelesPreviewWizard;
window.inicializarWizardDimensionamiento = inicializarWizardDimensionamiento;
window.inicializarWizardAngulo = inicializarWizardAngulo;
window.cambiarAnguloWizard = cambiarAnguloWizard;
window.mostrarResultadosWizard = mostrarResultadosWizard;
window.llenarDatosAnalisisEnergetico = llenarDatosAnalisisEnergetico;
window.llenarDatosInstalacion = llenarDatosInstalacion;
window.llenarDatosImpactoAmbiental = llenarDatosImpactoAmbiental;
window.inicializarWizardResultadosDetallados = inicializarWizardResultadosDetallados;
window.llenarVistaDetalladaWizard = llenarVistaDetalladaWizard;
window.llenarTablaMensualWizard = llenarTablaMensualWizard;
window.llenarTablaAhorroAcumulado = llenarTablaAhorroAcumulado;
window.actualizarImagenInstalacion = actualizarImagenInstalacion;
window.inicializarWizardMapa = inicializarWizardMapa;
window.inicializarBusquedaMapa = inicializarBusquedaMapa;
window.buscarSugerencias = buscarSugerencias;
window.formatearNombreDireccion = formatearNombreDireccion;
window.resaltarCoincidencia = resaltarCoincidencia;
window.actualizarSugerenciaSeleccionada = actualizarSugerenciaSeleccionada;
window.mostrarPreviewEnMapa = mostrarPreviewEnMapa;
window.seleccionarSugerencia = seleccionarSugerencia;
window.obtenerNombreDesdeCoordenadas = obtenerNombreDesdeCoordenadas;
window.buscarDireccion = buscarDireccion;
window.inicializarTogglesMapa = inicializarTogglesMapa;
window.confirmarUbicacionWizard = confirmarUbicacionWizard;
window.obtenerDatosClimaticosWizard = obtenerDatosClimaticosWizard;

// Exportar wizardData al scope global
window.wizardData = wizardData;

