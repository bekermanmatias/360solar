/**
 * Solar360 - Constantes y Configuración
 * Archivo: assets/js/config/constants.js
 */

// Meses del año
export const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// Datos de ejemplo (ciudad templada)
export const DATOS_EJEMPLO = {
    psh: [3.5, 4.2, 5.1, 5.8, 6.5, 6.8, 6.9, 6.3, 5.4, 4.6, 3.8, 3.2],
    temperatura: [12, 14, 17, 20, 24, 28, 30, 29, 25, 21, 16, 13]
};

// Configuración de monedas
export const MONEDAS = {
    ARS: { simbolo: '$', nombre: 'Pesos Argentinos' },
    USD: { simbolo: 'US$', nombre: 'Dólares Estadounidenses' }
};

// Configuración del wizard
export const WIZARD_CONFIG = {
    totalSteps: 6,
    stepNames: [
        'Introducción',
        'Ubicación',
        'Factura Eléctrica',
        'Dimensionamiento',
        'Ángulo de Paneles',
        'Resultados'
    ]
};

// Configuración de API
export const API_CONFIG = {
    nasaPower: {
        baseUrl: 'https://power.larc.nasa.gov/api/temporal/daily/point',
        parameters: 'ALLSKY_SFC_SW_DWN,T2M',
        community: 'RE'
    },
    openMeteo: {
        baseUrl: 'https://api.open-meteo.com/v1/forecast'
    },
    nominatim: {
        baseUrl: 'https://nominatim.openstreetmap.org/reverse'
    }
};

// Configuración de mapas
export const MAP_CONFIG = {
    defaultCenter: [-34.9215, -57.9545], // La Plata, Argentina
    defaultZoom: 6,
    minZoom: 3,
    maxZoom: 18
};

// Configuración de gráficos
export const CHART_CONFIG = {
    colors: {
        primary: '#10b981',
        secondary: '#3b82f6',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#06b6d4'
    },
    responsive: true,
    maintainAspectRatio: false
};

