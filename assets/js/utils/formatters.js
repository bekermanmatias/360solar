/**
 * Solar360 - Funciones de Formateo
 * Archivo: assets/js/utils/formatters.js
 */

/**
 * Formatea un número según la moneda especificada
 * @param {number} numero - Número a formatear
 * @param {string} moneda - Moneda ('ARS' o 'USD')
 * @returns {string} - Número formateado
 */
export function formatearNumero(numero, moneda = 'ARS') {
    if (moneda === 'USD') {
        return new Intl.NumberFormat('en-US', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        }).format(numero);
    } else {
        return new Intl.NumberFormat('es-AR', { 
            minimumFractionDigits: 0, 
            maximumFractionDigits: 0 
        }).format(numero);
    }
}

/**
 * Formatea un número genérico (sin moneda)
 * @param {number} num - Número a formatear
 * @returns {string} - Número formateado
 */
export function formatNumber(num) {
    return new Intl.NumberFormat('es-ES', {
        maximumFractionDigits: 0
    }).format(num);
}

/**
 * Formatea el nombre de una dirección para mostrar
 * @param {string} nombreCompleto - Nombre completo de la dirección
 * @returns {string} - Nombre formateado
 */
export function formatearNombreDireccion(nombreCompleto) {
    if (!nombreCompleto) return '';
    
    // Extraer solo el nombre principal (antes de la coma si existe)
    const partes = nombreCompleto.split(',');
    return partes[0].trim();
}

/**
 * Formatea un porcentaje
 * @param {number} valor - Valor a formatear
 * @param {number} decimales - Número de decimales (default: 1)
 * @returns {string} - Porcentaje formateado
 */
export function formatearPorcentaje(valor, decimales = 1) {
    return `${valor.toFixed(decimales)}%`;
}

/**
 * Formatea una fecha
 * @param {Date} fecha - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
export function formatearFecha(fecha = new Date()) {
    const opciones = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return new Intl.DateTimeFormat('es-AR', opciones).format(fecha);
}

/**
 * Formatea energía en kWh
 * @param {number} energia - Energía en kWh
 * @param {number} decimales - Número de decimales (default: 0)
 * @returns {string} - Energía formateada
 */
export function formatearEnergia(energia, decimales = 0) {
    return `${formatNumber(energia.toFixed(decimales))} kWh`;
}

/**
 * Formatea potencia en kW
 * @param {number} potencia - Potencia en kW
 * @param {number} decimales - Número de decimales (default: 2)
 * @returns {string} - Potencia formateada
 */
export function formatearPotencia(potencia, decimales = 2) {
    return `${potencia.toFixed(decimales)} kW`;
}

