/**
 * Solar360 - Estado Global de la Aplicación
 * Archivo: assets/js/state.js
 * 
 * Centraliza todas las variables de estado global
 */

// Estado de gráficos
export const chartState = {
    monthlyChart: null,
    financialChart: null,
    wizardMonthlyChart: null,
    wizardFinancialChart: null,
    wizardDistributionChart: null
};

// Estado de resultados
export const resultsState = {
    ultimosResultados: null,
    ultimaGeneracionMensual: null,
    wizardResultados: null,
    wizardGeneracionMensual: null,
    wizardDatos: null
};

// Estado de ubicación
export const locationState = {
    ubicacionActual: {
        nombre: '',
        lat: null,
        lon: null
    },
    wizardLocation: {
        lat: null,
        lon: null,
        nombre: '',
        psh: null,
        temperatura: null
    }
};

// Estado del mapa
export const mapState = {
    map: null,
    marker: null,
    selectedLat: null,
    selectedLon: null,
    wizardMap: null,
    wizardMapMarker: null,
    ubicacionSeleccionada: null
};

// Estado del wizard
export const wizardState = {
    currentStep: 0,
    totalSteps: 6,
    data: {
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
        inclinacion: 20
    }
};

// Estado de modos
export const modeState = {
    modoActual: 'ubicacion', // 'ubicacion' o 'manual'
    modoDimensionamiento: 'porcentaje', // 'porcentaje' o 'paneles'
    monedaSeleccionada: 'ARS',
    modoConsumo: 'aproximado'
};

// Estado de búsqueda
export const searchState = {
    searchTimeout: null,
    selectedSuggestionIndex: -1
};

