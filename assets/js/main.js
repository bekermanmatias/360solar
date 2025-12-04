/**
 * Solar360 - Punto de Entrada Principal
 * Archivo: assets/js/main.js
 * 
 * Este archivo carga todos los módulos y mantiene compatibilidad
 * con el código existente mientras migramos a una arquitectura modular
 */

// Importar módulos de configuración
import { MESES, DATOS_EJEMPLO } from './config/constants.js';
import { MODELO_OLS, MODELO_CLUSTER, seleccionarClusterBeta1 } from './config/models.js';

// Importar utilidades
import { calcularGeneracionMensual, calcularResultados } from './utils/calculations.js';
import { formatearNumero, formatNumber } from './utils/formatters.js';
import { validarDatos } from './utils/validators.js';
import { ejecutarValidacionCompleta } from './utils/validation.js';
import { mostrarNotificacion } from './utils/notifications.js';
import { initScrollSpy, redimensionarGraficos } from './utils/ui.js';

// Importar componentes
import * as MapComponent from './components/map.js';
import * as ChartsComponent from './components/charts.js';
import * as PDFComponent from './components/pdf.js';
import { abrirModalSimulador, cerrarModalSimulador } from './components/wizard.js';
import * as APIComponent from './components/api.js';

// Importar app
import { initializeApp } from './app.js';

// Exportar todo al scope global para mantener compatibilidad
window.MESES = MESES;
window.DATOS_EJEMPLO = DATOS_EJEMPLO;
window.MODELO_OLS = MODELO_OLS;
window.MODELO_CLUSTER = MODELO_CLUSTER;
window.seleccionarClusterBeta1 = seleccionarClusterBeta1;
window.calcularGeneracionMensual = calcularGeneracionMensual;
window.calcularResultados = calcularResultados;
window.formatearNumero = formatearNumero;
window.formatNumber = formatNumber;
window.validarDatos = validarDatos;
window.mostrarNotificacion = mostrarNotificacion;
window.initScrollSpy = initScrollSpy;
window.redimensionarGraficos = redimensionarGraficos;

// Exportar funciones del wizard al scope global
window.abrirModalSimulador = abrirModalSimulador;
window.cerrarModalSimulador = cerrarModalSimulador;

// Exportar funciones de validación
window.validarModelo = ejecutarValidacionCompleta;

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ Solar360 - Módulos cargados');
        initializeApp();
    });
} else {
    console.log('✅ Solar360 - Módulos cargados');
    initializeApp();
}

