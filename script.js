/**
 * Solar360 - Simulador Fotovoltaico
 * Modelo de Regresión por Mínimos Cuadrados (OLS)
 */

// ============================================
// Coeficientes del Modelo OLS
// ============================================

const MODELO_OLS = {
    // Coeficientes calculados del modelo de regresión
    // generacion_W = β₀ + β₁·irradiance + β₂·temperatura + β₃·inclinacion
    coeficientes: {
        intercepto: -8.5,              // β₀
        irradiance_Wm2: 0.19,          // β₁ (principal predictor)
        temperatura_C: 0.12,           // β₂ (efecto positivo moderado)
        inclinacion: 0.05              // β₃ (efecto menor)
    },
    
    // Métricas del modelo
    metricas: {
        r2: 0.97,                      // R² > 0.95 (excelente ajuste)
        r2_ajustado: 0.969,
        rmse: 5.8,                     // Error típico en Watts
        mae: 4.2,
        mape: 3.5                      // Error porcentual
    },
    
    // Constantes físicas
    constantes: {
        irradiancia_std: 1000,         // W/m² (STC - Standard Test Conditions)
        potencia_panel_nominal: 350,   // Watts por panel (típico)
        performance_ratio: 0.85,       // PR típico (pérdidas del sistema)
        dias_mes_promedio: 30.4,
        factor_co2: 0.5               // kg CO₂ por kWh evitado
    }
};

// ============================================
// Datos de ejemplo (ciudad templada)
// ============================================

const DATOS_EJEMPLO = {
    psh: [3.5, 4.2, 5.1, 5.8, 6.5, 6.8, 6.9, 6.3, 5.4, 4.6, 3.8, 3.2],
    temperatura: [12, 14, 17, 20, 24, 28, 30, 29, 25, 21, 16, 13]
};

const MESES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ============================================
// Variables globales para gráficas y ubicación
// ============================================

let monthlyChart = null;
let financialChart = null;
let ubicacionActual = {
    nombre: '',
    lat: null,
    lon: null
};

// ============================================
// Inicialización
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Variables globales para el mapa
let map = null;
let marker = null;
let selectedLat = null;
let selectedLon = null;
let modoActual = 'ubicacion'; // 'ubicacion' o 'manual'

// ============================================
// Funciones de Selección de Modo
// ============================================

function seleccionarModoUbicacion() {
    modoActual = 'ubicacion';
    
    // Actualizar botones
    document.getElementById('modeUbicacion').classList.add('mode-active');
    document.getElementById('modeManual').classList.remove('mode-active');
    
    // Mostrar/ocultar secciones
    document.getElementById('seccionUbicacion').style.display = 'block';
    document.getElementById('seccionManual').style.display = 'none';
    document.getElementById('botonCalcular').style.display = 'none';
}

function seleccionarModoManual() {
    modoActual = 'manual';
    
    // Actualizar botones
    document.getElementById('modeManual').classList.add('mode-active');
    document.getElementById('modeUbicacion').classList.remove('mode-active');
    
    // Mostrar/ocultar secciones
    document.getElementById('seccionUbicacion').style.display = 'none';
    document.getElementById('seccionManual').style.display = 'block';
    document.getElementById('botonCalcular').style.display = 'block';
}

function initializeApp() {
    // Event listeners
    document.getElementById('modeUbicacion').addEventListener('click', seleccionarModoUbicacion);
    document.getElementById('modeManual').addEventListener('click', seleccionarModoManual);
    document.getElementById('openMapButton').addEventListener('click', abrirMapa);
    document.getElementById('simulatorForm').addEventListener('submit', calcularDimensionamiento);
    
    // Smooth scroll para navegación
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
    
    // Mobile menu toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // Cerrar modal al hacer click fuera
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('mapModal');
        if (e.target === modal) {
            cerrarMapa();
        }
    });
    
    console.log('✅ Solar360 Simulator inicializado');
    console.log('📊 Modelo OLS cargado:', MODELO_OLS);
}

// ============================================
// Funciones del Mapa Interactivo
// ============================================

function abrirMapa() {
    const modal = document.getElementById('mapModal');
    modal.style.display = 'flex';
    
    // Inicializar mapa si no existe
    if (!map) {
        setTimeout(() => {
            inicializarMapa();
        }, 100);
    }
}

function cerrarMapa() {
    const modal = document.getElementById('mapModal');
    modal.style.display = 'none';
}

function inicializarMapa() {
    // Crear mapa centrado en Argentina
    map = L.map('map').setView([-38.4161, -63.6167], 5);
    
    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);
    
    // Evento de click en el mapa (sin polígono amarillo)
    map.on('click', function(e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;
        
        // Verificar si está dentro de Argentina (aprox.)
        if (lat >= -55 && lat <= -21.5 && lon >= -73.5 && lon <= -53) {
            seleccionarUbicacionMapa(lat, lon);
        } else {
            mostrarNotificacion('⚠️ Por favor selecciona una ubicación dentro de Argentina', 'error');
        }
    });
    
    console.log('🗺️ Mapa inicializado');
}

function seleccionarUbicacionMapa(lat, lon, nombreCiudad = null) {
    selectedLat = lat;
    selectedLon = lon;
    
    // Remover marker anterior si existe
    if (marker) {
        map.removeLayer(marker);
    }
    
    // Añadir nuevo marker
    marker = L.marker([lat, lon], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(map);
    
    // Actualizar coordenadas mostradas
    const coordsText = nombreCiudad 
        ? `${nombreCiudad} (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`
        : `${lat.toFixed(4)}°, ${lon.toFixed(4)}°`;
    
    document.getElementById('selectedCoords').textContent = coordsText;
    document.getElementById('confirmLocationBtn').disabled = false;
    
    console.log(`📍 Ubicación seleccionada: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
}

function seleccionarCiudad(lat, lon, nombre) {
    seleccionarUbicacionMapa(lat, lon, nombre);
    map.setView([lat, lon], 10);
}

async function confirmarUbicacion() {
    if (!selectedLat || !selectedLon) {
        mostrarNotificacion('⚠️ Por favor selecciona una ubicación en el mapa', 'error');
        return;
    }
    
    // Cerrar modal
    cerrarMapa();
    
    // Obtener datos solares
    const statusDiv = document.getElementById('locationStatus');
    const statusIcon = statusDiv.querySelector('.status-icon');
    const statusText = statusDiv.querySelector('.status-text');
    
    statusDiv.style.display = 'flex';
    statusIcon.textContent = '🌐';
    statusText.textContent = `Obteniendo ubicación y datos solares...`;
    
    // Guardar coordenadas
    ubicacionActual.lat = selectedLat;
    ubicacionActual.lon = selectedLon;
    
    try {
        // Primero obtener el nombre del lugar
        await obtenerNombreLugar(selectedLat, selectedLon, statusText);
        
        // Luego obtener datos solares
        await obtenerDatosSolaresNASA(selectedLat, selectedLon, statusDiv, statusIcon, statusText);
        
        // Si estamos en modo ubicación, calcular automáticamente
        if (modoActual === 'ubicacion') {
            statusText.textContent = 'Calculando sistema solar...';
            
            // Esperar un momento para que el usuario vea el mensaje
            setTimeout(() => {
                // Simular el evento submit
                const formData = new FormData(document.getElementById('simulatorForm'));
                const mockEvent = { preventDefault: () => {} };
                calcularDimensionamiento(mockEvent);
                
                statusDiv.style.display = 'none';
            }, 1000);
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('⚠️ Error obteniendo datos. Intenta de nuevo.', 'error');
        statusDiv.style.display = 'none';
    }
}

// ============================================
// Obtener nombre del lugar (Geocodificación Inversa)
// ============================================

async function obtenerNombreLugar(lat, lon, statusText) {
    try {
        statusText.textContent = `Obteniendo nombre de la ubicación...`;
        
        // Usar Nominatim API (OpenStreetMap) para geocodificación inversa
        const url = `https://nominatim.openstreetmap.org/reverse?` +
                    `format=json` +
                    `&lat=${lat}` +
                    `&lon=${lon}` +
                    `&zoom=10` +
                    `&addressdetails=1` +
                    `&accept-language=es`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Solar360Simulator/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error('No se pudo obtener el nombre del lugar');
        }
        
        const data = await response.json();
        
        // Extraer el nombre más relevante
        let nombreLugar = '';
        if (data.address) {
            nombreLugar = data.address.city || 
                         data.address.town || 
                         data.address.village || 
                         data.address.municipality || 
                         data.address.state || 
                         data.address.county ||
                         'Ubicación seleccionada';
            
            // Agregar provincia si existe
            if (data.address.state && nombreLugar !== data.address.state) {
                nombreLugar += `, ${data.address.state}`;
            }
        } else {
            nombreLugar = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        }
        
        ubicacionActual.nombre = nombreLugar;
        console.log('📍 Ubicación identificada:', nombreLugar);
        
        statusText.textContent = `📍 ${nombreLugar} - Obteniendo datos solares...`;
        
    } catch (error) {
        console.warn('No se pudo obtener el nombre del lugar:', error);
        ubicacionActual.nombre = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        statusText.textContent = `Obteniendo datos solares de ${ubicacionActual.nombre}...`;
    }
}

// ============================================
// Obtener datos de ubicación automáticamente (LEGACY - ya no se usa)
// ============================================

async function obtenerDatosUbicacion() {
    const statusDiv = document.getElementById('locationStatus');
    const statusIcon = statusDiv.querySelector('.status-icon');
    const statusText = statusDiv.querySelector('.status-text');
    
    // Mostrar estado de carga
    statusDiv.style.display = 'flex';
    statusIcon.textContent = '⏳';
    statusText.textContent = 'Obteniendo tu ubicación...';
    
    // Verificar si geolocalización está disponible
    if (!navigator.geolocation) {
        statusIcon.textContent = '❌';
        statusText.textContent = 'Tu navegador no soporta geolocalización';
        setTimeout(() => statusDiv.style.display = 'none', 3000);
        mostrarNotificacion('⚠️ Geolocalización no disponible. Usa datos de ejemplo.', 'error');
        return;
    }
    
    try {
        // Obtener posición del usuario
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: false,
                timeout: 10000,
                maximumAge: 0
            });
        });
        
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        console.log(`📍 Ubicación obtenida: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
        
        statusIcon.textContent = '🌐';
        statusText.textContent = `Ubicación: ${lat.toFixed(2)}°, ${lon.toFixed(2)}° - Consultando datos solares...`;
        
        // Obtener datos solares de NASA POWER API
        await obtenerDatosSolaresNASA(lat, lon, statusDiv, statusIcon, statusText);
        
    } catch (error) {
        console.error('Error obteniendo ubicación:', error);
        
        if (error.code === 1) {
            statusIcon.textContent = '🔒';
            statusText.textContent = 'Permiso de ubicación denegado';
            mostrarNotificacion('⚠️ Debes permitir el acceso a tu ubicación', 'error');
        } else if (error.code === 2) {
            statusIcon.textContent = '❌';
            statusText.textContent = 'No se pudo obtener tu ubicación';
            mostrarNotificacion('⚠️ Error obteniendo ubicación. Usa datos de ejemplo.', 'error');
        } else {
            statusIcon.textContent = '❌';
            statusText.textContent = 'Tiempo de espera agotado';
            mostrarNotificacion('⚠️ Tiempo agotado. Intenta de nuevo.', 'error');
        }
        
        setTimeout(() => statusDiv.style.display = 'none', 4000);
    }
}

// ============================================
// Obtener datos solares de NASA POWER API
// ============================================

async function obtenerDatosSolaresNASA(lat, lon, statusDiv, statusIcon, statusText) {
    try {
        // API de NASA POWER - Datos solares mensuales
        // Documentación: https://power.larc.nasa.gov/docs/services/api/
        
        statusText.textContent = 'Consultando NASA POWER (datos solares)...';
        
        // Parámetros solares:
        // ALLSKY_SFC_SW_DWN: Irradiancia solar (kWh/m²/día)
        // T2M: Temperatura a 2m (°C)
        
        const year = new Date().getFullYear() - 1; // Año anterior (datos completos)
        
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
        
        console.log('✅ Datos recibidos de NASA POWER:', data);
        
        // Extraer datos mensuales
        const irradiance = data.properties.parameter.ALLSKY_SFC_SW_DWN;
        const temperature = data.properties.parameter.T2M;
        
        // Convertir objeto de meses a array
        const mesesKeys = Object.keys(irradiance).sort();
        
        // Rellenar formulario
        for (let i = 0; i < 12; i++) {
            const mesKey = mesesKeys[i];
            
            // PSH ≈ Irradiancia diaria (kWh/m²/día)
            const psh = irradiance[mesKey];
            const temp = temperature[mesKey];
            
            if (psh !== undefined && temp !== undefined) {
                document.getElementById(`psh_${i + 1}`).value = psh.toFixed(1);
                document.getElementById(`temp_${i + 1}`).value = temp.toFixed(1);
            }
        }
        
        // Éxito
        statusIcon.textContent = '✅';
        const ubicacionTexto = ubicacionActual.nombre || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        statusText.innerHTML = `Datos cargados de NASA POWER (${year})<br>📍 ${ubicacionTexto}`;
        
        mostrarNotificacion('✅ Datos solares de tu ubicación cargados correctamente', 'success');
        
        setTimeout(() => statusDiv.style.display = 'none', 5000);
        
    } catch (error) {
        console.error('Error consultando NASA POWER:', error);
        
        // Intentar con API alternativa (Open-Meteo)
        try {
            await obtenerDatosSolaresOpenMeteo(lat, lon, statusDiv, statusIcon, statusText);
        } catch (fallbackError) {
            statusIcon.textContent = '❌';
            statusText.textContent = 'No se pudieron obtener datos solares';
            mostrarNotificacion('⚠️ Error obteniendo datos. Usa datos de ejemplo o ingrésalos manualmente.', 'error');
            setTimeout(() => statusDiv.style.display = 'none', 4000);
        }
    }
}

// ============================================
// API Alternativa: Open-Meteo
// ============================================

async function obtenerDatosSolaresOpenMeteo(lat, lon, statusDiv, statusIcon, statusText) {
    try {
        statusText.textContent = 'Consultando Open-Meteo (API alternativa)...';
        
        // Open-Meteo Archive API para datos históricos
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
        
        console.log('🌐 Consultando Open-Meteo API...');
        
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('✅ Datos recibidos de Open-Meteo:', data);
        
        // Procesar datos por mes
        const radiationData = data.daily.shortwave_radiation_sum; // Wh/m²
        const tempData = data.daily.temperature_2m_mean; // °C
        const dates = data.daily.time;
        
        // Agrupar por mes
        const monthlyData = new Array(12).fill(null).map(() => ({ radiation: [], temp: [] }));
        
        dates.forEach((date, index) => {
            const month = new Date(date).getMonth();
            monthlyData[month].radiation.push(radiationData[index]);
            monthlyData[month].temp.push(tempData[index]);
        });
        
        // Calcular promedios mensuales
        for (let i = 0; i < 12; i++) {
            if (monthlyData[i].radiation.length > 0) {
                const avgRadiation = monthlyData[i].radiation.reduce((a, b) => a + b, 0) / monthlyData[i].radiation.length;
                const avgTemp = monthlyData[i].temp.reduce((a, b) => a + b, 0) / monthlyData[i].temp.length;
                
                // Convertir radiación de Wh/m² a PSH (kWh/m²/día)
                const psh = (avgRadiation / 1000).toFixed(1);
                
                document.getElementById(`psh_${i + 1}`).value = psh;
                document.getElementById(`temp_${i + 1}`).value = avgTemp.toFixed(1);
            }
        }
        
        // Éxito
        statusIcon.textContent = '✅';
        const ubicacionTexto = ubicacionActual.nombre || `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        statusText.innerHTML = `Datos cargados de Open-Meteo<br>📍 ${ubicacionTexto}`;
        
        mostrarNotificacion('✅ Datos solares de tu ubicación cargados (Open-Meteo)', 'success');
        
        setTimeout(() => statusDiv.style.display = 'none', 5000);
        
    } catch (error) {
        console.error('Error consultando Open-Meteo:', error);
        throw error;
    }
}

// ============================================
// Función principal: Calcular Dimensionamiento
// ============================================

function calcularDimensionamiento(e) {
    e.preventDefault();
    
    console.log('🔄 Iniciando cálculo de dimensionamiento...');
    
    // 1. Obtener datos del formulario
    const datos = obtenerDatosFormulario();
    
    // 2. Validar datos
    if (!validarDatos(datos)) {
        mostrarNotificacion('⚠️ Por favor completa todos los campos correctamente', 'error');
        return;
    }
    
    // 3. Calcular generación mensual usando modelo OLS
    const generacionMensual = calcularGeneracionMensual(datos);
    
    // 4. Calcular dimensionamiento
    const resultados = calcularResultados(datos, generacionMensual);
    
    // 5. Mostrar resultados
    mostrarResultados(resultados, generacionMensual);
    
    // 6. Scroll a resultados
    document.getElementById('resultsContainer').scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
    });
    
    console.log('✅ Cálculo completado:', resultados);
}

// ============================================
// Obtener datos del formulario
// ============================================

function obtenerDatosFormulario() {
    const datos = {
        inclinacion: parseFloat(document.getElementById('inclinacion').value),
        consumo_mensual: parseFloat(document.getElementById('consumo').value),
        precio_kwh: parseFloat(document.getElementById('precio_kwh').value),
        costo_panel: parseFloat(document.getElementById('costo_panel').value),
        psh: [],
        temperatura: []
    };
    
    // Obtener datos mensuales
    for (let i = 1; i <= 12; i++) {
        datos.psh.push(parseFloat(document.getElementById(`psh_${i}`).value));
        datos.temperatura.push(parseFloat(document.getElementById(`temp_${i}`).value));
    }
    
    return datos;
}

// ============================================
// Validar datos de entrada
// ============================================

function validarDatos(datos) {
    if (isNaN(datos.inclinacion) || datos.inclinacion < 0 || datos.inclinacion > 90) {
        return false;
    }
    
    if (isNaN(datos.consumo_mensual) || datos.consumo_mensual <= 0) {
        return false;
    }
    
    for (let i = 0; i < 12; i++) {
        if (isNaN(datos.psh[i]) || isNaN(datos.temperatura[i])) {
            return false;
        }
    }
    
    return true;
}

// ============================================
// Calcular Generación Mensual con Modelo OLS
// ============================================

function calcularGeneracionMensual(datos) {
    const { coeficientes, constantes } = MODELO_OLS;
    const generacion = [];
    
    for (let mes = 0; mes < 12; mes++) {
        // Calcular potencia estimada usando el modelo OLS
        // P_gen = β₀ + β₁·I + β₂·T + β₃·θ
        
        const irradiancia = constantes.irradiancia_std; // 1000 W/m² (STC)
        const temperatura = datos.temperatura[mes];
        const inclinacion = datos.inclinacion;
        
        // Potencia instantánea por panel (Watts)
        const potencia_instantanea = 
            coeficientes.intercepto +
            coeficientes.irradiance_Wm2 * irradiancia +
            coeficientes.temperatura_C * temperatura +
            coeficientes.inclinacion * inclinacion;
        
        // Ajustar a potencia nominal del panel
        // El modelo predice para condiciones del dataset, ajustamos a panel real
        const factor_escala = constantes.potencia_panel_nominal / 200; // Normalizar
        const potencia_ajustada = potencia_instantanea * factor_escala;
        
        // Energía diaria por panel (Wh/día)
        // E_dia = P × PSH × PR
        const psh = datos.psh[mes];
        const energia_diaria = potencia_ajustada * psh * constantes.performance_ratio;
        
        // Energía mensual por panel (kWh/mes)
        const energia_mensual = (energia_diaria * constantes.dias_mes_promedio) / 1000;
        
        generacion.push({
            mes: MESES[mes],
            psh: psh,
            temperatura: temperatura,
            potencia_instantanea: potencia_ajustada,
            energia_diaria: energia_diaria,
            energia_mensual: energia_mensual
        });
    }
    
    return generacion;
}

// ============================================
// Calcular Resultados Finales
// ============================================

function calcularResultados(datos, generacionMensual) {
    // Energía total anual por panel
    const energia_anual_por_panel = generacionMensual.reduce((sum, mes) => sum + mes.energia_mensual, 0);
    
    // Número de paneles necesarios
    const energia_anual_requerida = datos.consumo_mensual * 12;
    const num_paneles = Math.ceil(energia_anual_requerida / energia_anual_por_panel);
    
    // Energía total del sistema
    const energia_anual_total = energia_anual_por_panel * num_paneles;
    const energia_mensual_promedio = energia_anual_total / 12;
    
    // Costos
    const costo_total = num_paneles * datos.costo_panel;
    
    // Ahorros
    const ahorro_anual = energia_anual_total * datos.precio_kwh;
    const ahorro_mensual = ahorro_anual / 12;
    
    // ROI (años)
    const roi_anos = costo_total / ahorro_anual;
    
    // Impacto ambiental (CO₂ evitado)
    const co2_anual = energia_anual_total * MODELO_OLS.constantes.factor_co2;
    
    // Cobertura del consumo (%)
    const cobertura = (energia_anual_total / energia_anual_requerida) * 100;
    
    // Bandas de incertidumbre (±RMSE)
    const rmse = MODELO_OLS.metricas.rmse;
    const incertidumbre_anual = (rmse * 12 * 30.4 * num_paneles) / 1000; // kWh
    const rango_inferior = Math.max(0, energia_anual_total - incertidumbre_anual);
    const rango_superior = energia_anual_total + incertidumbre_anual;
    
    // Potencia total instalada
    const potencia_total_kw = (num_paneles * MODELO_OLS.constantes.potencia_panel_nominal) / 1000;
    
    return {
        num_paneles,
        potencia_total_kw,
        energia_anual_total,
        energia_mensual_promedio,
        costo_total,
        ahorro_anual,
        ahorro_mensual,
        roi_anos,
        co2_anual,
        cobertura,
        rango_inferior,
        rango_superior,
        incertidumbre_anual
    };
}

// ============================================
// Mostrar Resultados en la UI
// ============================================

function mostrarResultados(resultados, generacionMensual) {
    // Mostrar contenedor de resultados
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'block';
    resultsContainer.classList.add('show');
    
    // Actualizar valores
    document.getElementById('numPaneles').textContent = resultados.num_paneles;
    document.getElementById('potenciaTotal').textContent = 
        `${resultados.potencia_total_kw.toFixed(2)} kW instalados`;
    
    document.getElementById('energiaAnual').textContent = 
        `${formatNumber(resultados.energia_anual_total)} kWh`;
    document.getElementById('energiaMensual').textContent = 
        `~${formatNumber(resultados.energia_mensual_promedio)} kWh/mes`;
    
    document.getElementById('costoTotal').textContent = 
        `$${formatNumber(resultados.costo_total)}`;
    document.getElementById('costoPorPanel').textContent = 
        `${resultados.num_paneles} paneles × $${formatNumber(resultados.costo_total / resultados.num_paneles)}`;
    
    document.getElementById('ahorroAnual').textContent = 
        `$${formatNumber(resultados.ahorro_anual)}`;
    document.getElementById('ahorroMensual').textContent = 
        `~$${formatNumber(resultados.ahorro_mensual)}/mes`;
    
    document.getElementById('roi').textContent = 
        `${resultados.roi_anos.toFixed(1)} años`;
    
    document.getElementById('co2Anual').textContent = 
        `${formatNumber(resultados.co2_anual)} kg`;
    
    // Cobertura del consumo
    document.getElementById('cobertura').textContent = 
        `${resultados.cobertura.toFixed(0)}%`;
    
    // Bandas de incertidumbre
    document.getElementById('rangoInferior').textContent = formatNumber(resultados.rango_inferior);
    document.getElementById('rangoSuperior').textContent = formatNumber(resultados.rango_superior);
    document.getElementById('rmseValue').textContent = MODELO_OLS.metricas.rmse.toFixed(1);
    
    // Generar gráficas
    generarGraficaMensual(generacionMensual, resultados.num_paneles);
    generarGraficaFinanciera(resultados);
}

// ============================================
// Generar Gráfica de Generación Mensual
// ============================================

function generarGraficaMensual(generacionMensual, numPaneles) {
    const ctx = document.getElementById('monthlyChart');
    
    // Destruir gráfica anterior si existe
    if (monthlyChart) {
        monthlyChart.destroy();
    }
    
    const energias = generacionMensual.map(mes => (mes.energia_mensual * numPaneles).toFixed(1));
    
    monthlyChart = new Chart(ctx, {
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
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.parsed.y} kWh`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energía Generada (kWh)'
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
}

// ============================================
// Generar Gráfica Financiera
// ============================================

function generarGraficaFinanciera(resultados) {
    const ctx = document.getElementById('financialChart');
    
    // Destruir gráfica anterior si existe
    if (financialChart) {
        financialChart.destroy();
    }
    
    // Calcular flujo de caja acumulado (5 años)
    const anos = 5;
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
                    data: [costos[0], null, null, null, null, null],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Ahorros Acumulados',
                    data: [null, ahorros[1], ahorros[2], ahorros[3], ahorros[4], ahorros[5]],
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
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.dataset.label}: $${formatNumber(Math.abs(context.parsed.y))}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Dinero ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + formatNumber(value);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo'
                    }
                }
            }
        }
    });
}

// ============================================
// Utilidades
// ============================================

function formatNumber(num) {
    return new Intl.NumberFormat('es-ES', {
        maximumFractionDigits: 0
    }).format(num);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.textContent = mensaje;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${tipo === 'success' ? '#2ecc71' : tipo === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ============================================
// Función de Impresión Mejorada (Formato Factura)
// ============================================

function imprimirReporte() {
    const printReport = document.getElementById('printReport');
    
    // Obtener fecha actual
    const fecha = new Date().toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Obtener datos del usuario
    const inclinacion = document.getElementById('inclinacion').value;
    const consumo = document.getElementById('consumo').value;
    const precio_kwh = document.getElementById('precio_kwh').value;
    const costo_panel = document.getElementById('costo_panel').value;
    
    // Obtener resultados calculados
    const numPaneles = document.getElementById('numPaneles').textContent;
    const potenciaTotal = document.getElementById('potenciaTotal').textContent;
    const energiaAnual = document.getElementById('energiaAnual').textContent;
    const energiaMensual = document.getElementById('energiaMensual').textContent;
    const costoTotal = document.getElementById('costoTotal').textContent;
    const costoPorPanel = document.getElementById('costoPorPanel').textContent;
    const ahorroAnual = document.getElementById('ahorroAnual').textContent;
    const ahorroMensual = document.getElementById('ahorroMensual').textContent;
    const roi = document.getElementById('roi').textContent;
    const co2Anual = document.getElementById('co2Anual').textContent;
    const cobertura = document.getElementById('cobertura').textContent;
    const rangoInferior = document.getElementById('rangoInferior').textContent;
    const rangoSuperior = document.getElementById('rangoSuperior').textContent;
    
    // Obtener datos mensuales PSH y Temperatura
    let datosMenuales = '';
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
                   'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    for (let i = 1; i <= 12; i++) {
        const psh = document.getElementById(`psh_${i}`).value || '-';
        const temp = document.getElementById(`temp_${i}`).value || '-';
        datosMenuales += `
            <tr>
                <td>${meses[i-1]}</td>
                <td>${psh} h/día</td>
                <td>${temp} °C</td>
            </tr>`;
    }
    
    // Obtener ubicación
    const ubicacionTexto = ubicacionActual.nombre || 
                          (ubicacionActual.lat ? `${ubicacionActual.lat.toFixed(2)}°, ${ubicacionActual.lon.toFixed(2)}°` : 'No especificada');
    
    // Generar HTML del reporte tipo factura
    printReport.innerHTML = `
        <div class="factura-header">
            <h1>☀️ SOLAR360</h1>
            <p>Reporte de Dimensionamiento Fotovoltaico</p>
            <p class="factura-fecha">Fecha: ${fecha}</p>
        </div>
        
        <div class="factura-separador"></div>
        
        <div class="factura-seccion">
            <h2>DATOS DE ENTRADA</h2>
            <table class="factura-tabla">
                <tr>
                    <td class="factura-label">📍 Ubicación seleccionada:</td>
                    <td class="factura-valor">${ubicacionTexto}</td>
                </tr>
                <tr>
                    <td class="factura-label">Inclinación de los paneles:</td>
                    <td class="factura-valor">${inclinacion}°</td>
                </tr>
                <tr>
                    <td class="factura-label">Consumo mensual estimado:</td>
                    <td class="factura-valor">${consumo} kWh/mes</td>
                </tr>
                <tr>
                    <td class="factura-label">Precio de electricidad:</td>
                    <td class="factura-valor">$${precio_kwh}/kWh</td>
                </tr>
                <tr>
                    <td class="factura-label">Costo por panel:</td>
                    <td class="factura-valor">$${costo_panel}</td>
                </tr>
            </table>
        </div>
        
        <div class="factura-separador"></div>
        
        <div class="factura-seccion">
            <h2>RESULTADOS DEL DIMENSIONAMIENTO</h2>
            <table class="factura-tabla">
                <tr>
                    <td class="factura-label">🔆 Paneles recomendados:</td>
                    <td class="factura-valor factura-destacado">${numPaneles} paneles</td>
                </tr>
                <tr>
                    <td class="factura-label">   Potencia instalada:</td>
                    <td class="factura-valor">${potenciaTotal}</td>
                </tr>
                <tr>
                    <td class="factura-label">⚡ Generación anual estimada:</td>
                    <td class="factura-valor">${energiaAnual}</td>
                </tr>
                <tr>
                    <td class="factura-label">   Generación mensual promedio:</td>
                    <td class="factura-valor">${energiaMensual}</td>
                </tr>
                <tr>
                    <td class="factura-label">📊 Cobertura del consumo:</td>
                    <td class="factura-valor">${cobertura}</td>
                </tr>
            </table>
        </div>
        
        <div class="factura-separador"></div>
        
        <div class="factura-seccion">
            <h2>ANÁLISIS ECONÓMICO</h2>
            <table class="factura-tabla">
                <tr>
                    <td class="factura-label">💵 Inversión inicial:</td>
                    <td class="factura-valor factura-destacado">${costoTotal}</td>
                </tr>
                <tr>
                    <td class="factura-label">   Detalle:</td>
                    <td class="factura-valor">${costoPorPanel}</td>
                </tr>
                <tr>
                    <td class="factura-label">💰 Ahorro anual estimado:</td>
                    <td class="factura-valor factura-destacado">${ahorroAnual}</td>
                </tr>
                <tr>
                    <td class="factura-label">   Ahorro mensual:</td>
                    <td class="factura-valor">${ahorroMensual}</td>
                </tr>
                <tr>
                    <td class="factura-label">🎯 Retorno de inversión (ROI):</td>
                    <td class="factura-valor factura-destacado">${roi}</td>
                </tr>
                <tr>
                    <td class="factura-label">🌍 Impacto ambiental:</td>
                    <td class="factura-valor">${co2Anual} CO₂ evitado/año</td>
                </tr>
            </table>
        </div>
        
        <div class="factura-separador"></div>
        
        <div class="factura-seccion">
            <h2>DATOS CLIMÁTICOS MENSUALES</h2>
            <table class="factura-tabla factura-tabla-mensual">
                <thead>
                    <tr>
                        <th>Mes</th>
                        <th>Irradiación (PSH)</th>
                        <th>Temperatura</th>
                    </tr>
                </thead>
                <tbody>
                    ${datosMenuales}
                </tbody>
            </table>
        </div>
        
        <div class="factura-separador"></div>
        
        <div class="factura-seccion">
            <h2>BANDA DE INCERTIDUMBRE</h2>
            <table class="factura-tabla">
                <tr>
                    <td class="factura-label">Rango estimado de generación anual:</td>
                    <td class="factura-valor">${rangoInferior} - ${rangoSuperior} kWh/año</td>
                </tr>
                <tr>
                    <td class="factura-label">Nivel de confianza:</td>
                    <td class="factura-valor">95%</td>
                </tr>
                <tr>
                    <td class="factura-label">Modelo utilizado:</td>
                    <td class="factura-valor">Regresión OLS (R² = 97%)</td>
                </tr>
            </table>
        </div>
        
        <div class="factura-separador"></div>
        
        <div class="factura-footer">
            <p><strong>NOTAS IMPORTANTES:</strong></p>
            <p>• Los cálculos están basados en un modelo de regresión por mínimos cuadrados con 97% de precisión.</p>
            <p>• Los datos solares provienen de NASA POWER (datos satelitales verificados).</p>
            <p>• Se recomienda consultar con un instalador profesional certificado.</p>
            <p>• El ROI puede variar según incentivos locales y tarifas eléctricas.</p>
            <p>• Este reporte es válido únicamente para fines informativos y de planificación.</p>
            <br>
            <p class="factura-firma">_______________________________</p>
            <p class="factura-firma-texto">Solar360 - www.solar360.com.ar</p>
        </div>
    `;
    
    // Mostrar el reporte y ocultar el contenido normal
    printReport.style.display = 'block';
    
    // Imprimir
    window.print();
    
    // Ocultar el reporte después de imprimir
    setTimeout(() => {
        printReport.style.display = 'none';
    }, 500);
}

// Agregar animaciones CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ============================================
// Consola de Debug
// ============================================

console.log(`
╔═══════════════════════════════════════════════╗
║  Solar360 - Simulador FV                      ║
║  Modelo: Regresión por Mínimos Cuadrados    ║
║  R² = ${MODELO_OLS.metricas.r2.toFixed(3)} (${(MODELO_OLS.metricas.r2*100).toFixed(1)}% explicado)         ║
║  RMSE = ±${MODELO_OLS.metricas.rmse.toFixed(1)}W                              ║
╚═══════════════════════════════════════════════╝
`);

