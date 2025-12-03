/**
 * Solar360 - Funciones de Validación
 * Archivo: assets/js/utils/validators.js
 */

/**
 * Valida los datos de entrada del formulario
 * @param {Object} datos - Datos a validar
 * @returns {boolean} - true si los datos son válidos
 */
export function validarDatos(datos) {
    // Inclinación: solo acepta 20° o 45° (valores del modelo experimental)
    if (isNaN(datos.inclinacion) || (datos.inclinacion !== 20 && datos.inclinacion !== 45)) {
        return false;
    }

    if (isNaN(datos.consumo_mensual) || datos.consumo_mensual <= 0) {
        return false;
    }

    if (isNaN(datos.precio_kwh) || datos.precio_kwh <= 0) {
        return false;
    }

    // Validar datos mensuales
    if (!datos.psh || !datos.temperatura || datos.psh.length !== 12 || datos.temperatura.length !== 12) {
        return false;
    }

    for (let i = 0; i < 12; i++) {
        if (isNaN(datos.psh[i]) || isNaN(datos.temperatura[i])) {
            return false;
        }
        if (datos.psh[i] < 0 || datos.psh[i] > 10) {
            return false; // PSH razonable entre 0 y 10
        }
        if (datos.temperatura[i] < -20 || datos.temperatura[i] > 50) {
            return false; // Temperatura razonable
        }
    }

    return true;
}

/**
 * Valida que un número sea positivo
 * @param {number} valor - Valor a validar
 * @returns {boolean} - true si es positivo
 */
export function esPositivo(valor) {
    return !isNaN(valor) && valor > 0;
}

/**
 * Valida que un valor esté en un rango
 * @param {number} valor - Valor a validar
 * @param {number} min - Valor mínimo
 * @param {number} max - Valor máximo
 * @returns {boolean} - true si está en el rango
 */
export function estaEnRango(valor, min, max) {
    return !isNaN(valor) && valor >= min && valor <= max;
}

/**
 * Valida coordenadas geográficas
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {boolean} - true si las coordenadas son válidas
 */
export function validarCoordenadas(lat, lon) {
    return !isNaN(lat) && !isNaN(lon) && 
           lat >= -90 && lat <= 90 && 
           lon >= -180 && lon <= 180;
}

/**
 * Valida el paso actual del wizard
 * @param {number} paso - Número del paso
 * @returns {boolean} - true si el paso es válido
 */
export function validarPasoWizard(paso) {
    return paso >= 0 && paso <= 5;
}

