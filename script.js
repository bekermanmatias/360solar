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
        potencia_panel_nominal: 190,   // Watts por panel (según dataset experimental)
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
// Modelo por Clusters (P = β₁ · G) según paper
// ============================================
//
// Este modelo reemplaza el uso de temperatura e inclinación como variables libres
// en la regresión. Ahora:
//   - T_mes y θ_user solo sirven para elegir uno de los 6 clusters.
//   - La relación física se modela como P = β₁ · G, con β₁ fijo por cluster.
//
// Clusters (Sección 3.1 y Tabla 4.1 del paper):
//   Cluster 1: 10°C, 20°  → β₁ = 0.1908
//   Cluster 2: 20°C, 20°  → β₁ = 0.1836
//   Cluster 3: 30°C, 20°  → β₁ = 0.1764
//   Cluster 4: 10°C, 45°  → β₁ = 0.1813
//   Cluster 5: 20°C, 45°  → β₁ = 0.1744
//   Cluster 6: 30°C, 45°  → β₁ = 0.1676
//
const MODELO_CLUSTER = {
    betas: {
        '10_20': 0.1908,
        '20_20': 0.1836,
        '30_20': 0.1764,
        '10_45': 0.1813,
        '20_45': 0.1744,
        '30_45': 0.1676
    },
    metricas: {
        r2: 1.0
    },
    constantes: {
        irradiancia_ref_Wm2: 1000,     // G_ref aproximado (STC)
        potencia_panel_nominal: 190,   // W/panel (según dataset: β₁ promedio ≈ 0.19 → 190W)
        performance_ratio: 0.85,       // η_sistema del paper
        dias_mes_promedio: 30.4,
        factor_co2: 0.5,
        // Modelo de costos BOS (Balance of System)
        costo_base_bos: 1500000,       // Costo fijo: inversor, tablero, instalación base
        costo_por_panel: 200000        // Costo por panel (panel + instalación incremental)
    }
};

/**
 * Discretiza la temperatura mensual y la inclinación del usuario
 * al cluster más cercano, devolviendo el β₁ correspondiente.
 *
 * - Temperatura: se aproxima a {10, 20, 30}°C por vecindad
 * - Inclinación: se aproxima a 20° o 45° (umbral 32.5°)
 */
function seleccionarClusterBeta1(temperaturaMes, inclinacionUser) {
    let tempCluster;
    if (temperaturaMes <= 15) {
        tempCluster = 10;
    } else if (temperaturaMes <= 25) {
        tempCluster = 20;
    } else {
        tempCluster = 30;
    }

    const angleCluster = inclinacionUser < 32.5 ? 20 : 45;
    const key = `${tempCluster}_${angleCluster}`;
    const beta = MODELO_CLUSTER.betas[key];

    if (beta === undefined) {
        console.warn('Cluster no encontrado, usando 20°C, 20° por defecto');
        return MODELO_CLUSTER.betas['20_20'];
    }

    return beta;
}

// ============================================
// Variables globales para gráficas y ubicación
// ============================================

let monthlyChart = null;
let financialChart = null;
let ultimosResultados = null;
let ultimaGeneracionMensual = null;
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
    
    // Validar si se puede habilitar el botón calcular
    validarYHabilitarBotonCalcular();
}

function seleccionarModoManual() {
    modoActual = 'manual';
    
    // Actualizar botones
    document.getElementById('modeManual').classList.add('mode-active');
    document.getElementById('modeUbicacion').classList.remove('mode-active');
    
    // Mostrar/ocultar secciones
    document.getElementById('seccionUbicacion').style.display = 'none';
    document.getElementById('seccionManual').style.display = 'block';
    
    // Validar si se puede habilitar el botón calcular
    validarYHabilitarBotonCalcular();
}

function redimensionarGraficos() {
    // Redimensionar gráficos si existen
    if (monthlyChart) {
        monthlyChart.resize();
    }
    if (financialChart) {
        financialChart.resize();
    }
}

function initializeApp() {
    // Event listeners
    document.getElementById('modeUbicacion').addEventListener('click', seleccionarModoUbicacion);
    document.getElementById('modeManual').addEventListener('click', seleccionarModoManual);
    document.getElementById('openMapButton').addEventListener('click', abrirMapa);
    document.getElementById('simulatorForm').addEventListener('submit', calcularDimensionamiento);
    
    // Agregar validación en tiempo real a todos los campos
    agregarValidacionTiempoReal();
    
    // Validar estado inicial del botón
    validarYHabilitarBotonCalcular();
    
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
    
    // Scroll Spy - Activar sección actual en el menú
    initScrollSpy();
    
    // Header scroll effect
    initHeaderScroll();
    
    // Listener para redimensionar gráficos cuando cambie el tamaño de la ventana
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            redimensionarGraficos();
        }, 250);
    });
    
    console.log('✅ Solar360 Simulator inicializado');
}

// ============================================
// Scroll Spy para el Menú de Navegación
// ============================================

function initScrollSpy() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollPosition = window.scrollY + 100; // Offset para activar antes
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

// ============================================
// Header Scroll Effect - Hide/Show on scroll
// ============================================

function initHeaderScroll() {
    const header = document.querySelector('.header');
    let lastScroll = 0;
    let ticking = false;
    
    window.addEventListener('scroll', () => {
        if (!ticking) {
            window.requestAnimationFrame(() => {
                const currentScroll = window.scrollY;
                
                // Si estamos en la parte superior, siempre mostrar el header
                if (currentScroll <= 50) {
                    header.classList.remove('scrolled');
                    header.classList.remove('header-hidden');
                    header.classList.add('header-visible');
                } else {
                    header.classList.add('scrolled');
                    
                    // Scroll hacia abajo: ocultar header
                    if (currentScroll > lastScroll && currentScroll > 100) {
                        header.classList.remove('header-visible');
                        header.classList.add('header-hidden');
                    }
                    // Scroll hacia arriba: mostrar header
                    else if (currentScroll < lastScroll) {
                        header.classList.remove('header-hidden');
                        header.classList.add('header-visible');
                    }
                }
                
                lastScroll = currentScroll;
                ticking = false;
            });
            
            ticking = true;
        }
    });
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

// ============================================
// Actualizar Precio de Panel (simplificado - panel estándar único)
// ============================================

function actualizarPrecioPanel() {
    // Panel estándar fijo según modelo experimental
    // No hay selector, solo validación
    validarYHabilitarBotonCalcular();
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
    
    // Obtener referencias al botón
    const button = document.getElementById('openMapButton');
    const buttonIcon = document.getElementById('buttonIcon');
    const buttonText = document.getElementById('buttonText');
    
    // Mostrar spinner en el botón (mantener color primario)
    buttonIcon.innerHTML = '<div class="spinner"></div>';
    buttonText.textContent = 'Obteniendo datos...';
    button.disabled = true;
    // Asegurar que mantenga el estilo primario durante la carga
    if (!button.classList.contains('btn-success')) {
        button.style.background = '';
        button.style.boxShadow = '';
    }
    
    // Guardar coordenadas
    ubicacionActual.lat = selectedLat;
    ubicacionActual.lon = selectedLon;
    
    try {
        // Primero obtener el nombre del lugar
        await obtenerNombreLugar(selectedLat, selectedLon, buttonText);
        
        // Luego obtener datos solares (solo guarda datos, no calcula)
        await obtenerDatosSolaresNASA(selectedLat, selectedLon, buttonIcon, buttonText);
        
        // Mostrar mensaje de confirmación en el botón (mantener color primario amarillo)
        const nombreUbicacion = ubicacionActual.nombre || `${selectedLat.toFixed(2)}°, ${selectedLon.toFixed(2)}°`;
        buttonIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; flex-shrink: 0;"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        buttonText.textContent = `Datos obtenidos para ${nombreUbicacion}`;
        buttonText.style.whiteSpace = 'normal';
        buttonText.style.wordWrap = 'break-word';
        buttonText.style.overflow = 'visible';
        // Mantener color primario amarillo (no cambiar a verde)
        button.classList.remove('btn-success');
        button.style.background = '';
        button.style.boxShadow = '';
        button.disabled = false;
        
        // Validar si ahora se puede habilitar el botón calcular
        validarYHabilitarBotonCalcular();
        
    } catch (error) {
        console.error('Error:', error);
        mostrarNotificacion('⚠️ Error obteniendo datos. Intenta de nuevo.', 'error');
        // Restaurar botón a estado inicial
        buttonIcon.innerHTML = '<svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; flex-shrink: 0;"><path d="M1 6v16l7-4 8 4 7-4V2l-7 4-8-4-7 4zm7-4v16m8-12v16"/></svg>';
        buttonText.textContent = 'Seleccionar Ubicación en el Mapa';
        buttonText.style.whiteSpace = 'normal';
        buttonText.style.wordWrap = 'break-word';
        buttonText.style.overflow = 'visible';
        button.classList.remove('btn-success');
        button.style.background = '';
        button.style.boxShadow = '';
        button.disabled = false;
    }
}

// ============================================
// Obtener nombre del lugar (Geocodificación Inversa)
// ============================================

async function obtenerNombreLugar(lat, lon, buttonText) {
    try {
        buttonText.textContent = 'Obteniendo nombre de la ubicación...';
        
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
        
        buttonText.textContent = `${nombreLugar} - Obteniendo datos solares...`;
        
    } catch (error) {
        console.warn('No se pudo obtener el nombre del lugar:', error);
        ubicacionActual.nombre = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        buttonText.textContent = `Obteniendo datos solares...`;
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

async function obtenerDatosSolaresNASA(lat, lon, buttonIcon, buttonText) {
    try {
        // API de NASA POWER - Datos solares mensuales
        // Documentación: https://power.larc.nasa.gov/docs/services/api/
        
        // El spinner ya está mostrado en el botón, solo actualizamos el texto si es necesario
        if (buttonText) {
            buttonText.textContent = 'Obteniendo datos solares...';
        }
        
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
        
        // Rellenar formulario (guardar datos internamente)
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
        
        // Datos guardados - NO calcular automáticamente
        // El mensaje de confirmación se mostrará en confirmarUbicacion()
        console.log('✅ Datos climáticos guardados internamente');
        
    } catch (error) {
        console.error('Error consultando NASA POWER:', error);
        
        // Intentar con API alternativa (Open-Meteo)
        try {
            await obtenerDatosSolaresOpenMeteo(lat, lon, buttonIcon, buttonText);
        } catch (fallbackError) {
            throw new Error('No se pudieron obtener datos solares');
        }
    }
}

// ============================================
// API Alternativa: Open-Meteo
// ============================================

async function obtenerDatosSolaresOpenMeteo(lat, lon, buttonIcon, buttonText) {
    try {
        // El spinner ya está mostrado en el botón, solo actualizamos el texto si es necesario
        if (buttonText) {
            buttonText.textContent = 'Obteniendo datos solares (Open-Meteo)...';
        }
        
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
        
        // Datos guardados - NO calcular automáticamente
        console.log('✅ Datos climáticos guardados internamente (Open-Meteo)');
        
    } catch (error) {
        console.error('Error consultando Open-Meteo:', error);
        throw error;
    }
}

// ============================================
// Validar y Habilitar Botón Calcular
// ============================================

function validarYHabilitarBotonCalcular() {
    const btnCalcular = document.getElementById('btnCalcularFinal');
    let puedeCalcular = true;
    
    // 1. Validar campos de Parámetros del Sistema
    const inclinacion = document.getElementById('inclinacion').value;
    const consumo = document.getElementById('consumo').value;
    const precio_kwh = document.getElementById('precio_kwh').value;
    
    // Inclinación: solo acepta 20° o 45°
    if (!inclinacion || inclinacion === '' || (inclinacion !== '20' && inclinacion !== '45')) {
        puedeCalcular = false;
    }
    if (!consumo || consumo === '' || isNaN(parseFloat(consumo)) || parseFloat(consumo) <= 0) {
        puedeCalcular = false;
    }
    if (!precio_kwh || precio_kwh === '' || isNaN(parseFloat(precio_kwh)) || parseFloat(precio_kwh) <= 0) {
        puedeCalcular = false;
    }
    
    // 2. Validar datos climáticos según el modo
    if (modoActual === 'ubicacion') {
        // En modo ubicación: verificar que el botón muestre "Datos obtenidos para..."
        const buttonText = document.getElementById('buttonText');
        if (!buttonText || !buttonText.textContent.includes('Datos obtenidos para')) {
            puedeCalcular = false;
        }
    } else if (modoActual === 'manual') {
        // En modo manual: verificar que todos los 12 meses estén completos
        for (let i = 1; i <= 12; i++) {
            const psh = document.getElementById(`psh_${i}`).value;
            const temp = document.getElementById(`temp_${i}`).value;
            
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
    
    // 3. Habilitar o deshabilitar el botón
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

// ============================================
// Agregar Validación en Tiempo Real
// ============================================

function agregarValidacionTiempoReal() {
    // Campos de Parámetros del Sistema
    document.getElementById('inclinacion').addEventListener('change', validarYHabilitarBotonCalcular);
    document.getElementById('consumo').addEventListener('input', validarYHabilitarBotonCalcular);
    document.getElementById('consumo').addEventListener('change', validarYHabilitarBotonCalcular);
    document.getElementById('precio_kwh').addEventListener('input', validarYHabilitarBotonCalcular);
    document.getElementById('precio_kwh').addEventListener('change', validarYHabilitarBotonCalcular);
    
    // Campos de datos manuales (modo experto)
    for (let i = 1; i <= 12; i++) {
        document.getElementById(`psh_${i}`).addEventListener('input', validarYHabilitarBotonCalcular);
        document.getElementById(`psh_${i}`).addEventListener('change', validarYHabilitarBotonCalcular);
        document.getElementById(`temp_${i}`).addEventListener('input', validarYHabilitarBotonCalcular);
        document.getElementById(`temp_${i}`).addEventListener('change', validarYHabilitarBotonCalcular);
    }
}

// ============================================
// Función principal: Calcular Dimensionamiento
// ============================================

async function calcularDimensionamiento(e) {
    e.preventDefault();
    
    console.log('🔄 Iniciando cálculo de dimensionamiento...');
    
    // 1. Obtener datos del formulario
    const datos = obtenerDatosFormulario();
    
    // 2. Validar datos
    if (!validarDatos(datos)) {
        mostrarNotificacion('⚠️ Por favor completa todos los campos correctamente', 'error');
        return;
    }
    
    // 3. Mostrar estado de carga en el botón
    const btnCalcular = document.getElementById('btnCalcularFinal');
    const btnIcon = btnCalcular.querySelector('.btn-icon');
    const btnText = btnCalcular.querySelector('span');
    
    // Guardar estado original
    const originalHTML = btnIcon.innerHTML;
    const originalText = btnText.textContent;
    
    // Cambiar a estado de carga
    btnCalcular.disabled = true;
    btnCalcular.style.opacity = '0.8';
    btnCalcular.style.cursor = 'wait';
    
    // Crear spinner SVG animado
    btnIcon.innerHTML = `
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" opacity="0.3"/>
        <path d="M12 2 A10 10 0 0 1 22 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
        </path>
    `;
    btnIcon.style.display = 'block';
    btnText.textContent = 'Calculando...';
    
    // Simular tiempo de procesamiento (2-2.5 segundos)
    const tiempoCarga = 2000 + Math.random() * 500; // Entre 2 y 2.5 segundos
    
    try {
        // Esperar tiempo de carga simulado
        await new Promise(resolve => setTimeout(resolve, tiempoCarga));
        
        // 4. Calcular generación mensual usando modelo OLS
        const generacionMensual = calcularGeneracionMensual(datos);
        
        // 5. Calcular dimensionamiento
        const resultados = calcularResultados(datos, generacionMensual);
        
        // 6. Mostrar resultados
        mostrarResultados(resultados, generacionMensual);
        
        // 7. Restaurar botón
        btnIcon.innerHTML = originalHTML;
        btnText.textContent = originalText;
        btnCalcular.disabled = false;
        btnCalcular.style.opacity = '1';
        btnCalcular.style.cursor = 'pointer';
        
        // 8. Scroll a resultados
        setTimeout(() => {
            document.getElementById('resultsContainer').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }, 100);
        
        console.log('✅ Cálculo completado:', resultados);
        
    } catch (error) {
        console.error('❌ Error en el cálculo:', error);
        
        // Restaurar botón en caso de error
        btnIcon.innerHTML = originalHTML;
        btnText.textContent = originalText;
        btnCalcular.disabled = false;
        btnCalcular.style.opacity = '1';
        btnCalcular.style.cursor = 'pointer';
        
        mostrarNotificacion('⚠️ Error al calcular el dimensionamiento. Por favor intenta nuevamente.', 'error');
    }
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
    // Inclinación: solo acepta 20° o 45° (valores del modelo experimental)
    if (isNaN(datos.inclinacion) || (datos.inclinacion !== 20 && datos.inclinacion !== 45)) {
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
    const { constantes } = MODELO_CLUSTER;
    const generacion = [];

    for (let mes = 0; mes < 12; mes++) {
        const temperaturaMes = datos.temperatura[mes];
        const inclinacionUser = datos.inclinacion;
        const psh = datos.psh[mes];

        // Selección de cluster → β₁ (según T_mes y θ_user)
        const beta1 = seleccionarClusterBeta1(temperaturaMes, inclinacionUser);

        // Potencia instantánea por panel (W) para G_ref
        const P_panel = beta1 * constantes.irradiancia_ref_Wm2;

        // Energía diaria neta por panel (Wh/día) con PR
        const energia_diaria_Wh = P_panel * psh * constantes.performance_ratio;

        // Energía mensual por panel (kWh/mes)
        const energia_mensual_kWh = (energia_diaria_Wh * constantes.dias_mes_promedio) / 1000;

        generacion.push({
            mes: MESES[mes],
            psh: psh,
            temperatura: temperaturaMes,
            beta1_cluster: beta1,
            potencia_instantanea: P_panel,
            energia_diaria: energia_diaria_Wh,
            energia_mensual: energia_mensual_kWh
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
    
    // Costos con modelo BOS (Balance of System)
    // Costo Total = Costo Base (BOS) + (N × Costo por Panel)
    const costo_base = MODELO_CLUSTER.constantes.costo_base_bos;
    const costo_paneles = num_paneles * MODELO_CLUSTER.constantes.costo_por_panel;
    const costo_total = costo_base + costo_paneles;
    
    // Ahorros
    const ahorro_anual = energia_anual_total * datos.precio_kwh;
    const ahorro_mensual = ahorro_anual / 12;
    
    // ROI (años)
    const roi_anos = costo_total / ahorro_anual;
    
    // Impacto ambiental (CO₂ evitado)
    const co2_anual = energia_anual_total * MODELO_CLUSTER.constantes.factor_co2;
    
    // Cobertura del consumo (%)
    const cobertura = (energia_anual_total / energia_anual_requerida) * 100;
    
    // Bandas de incertidumbre (±σ)
    // En el paper R² = 1.0, por lo que la varianza residual es prácticamente nula.
    // Aquí mantenemos la estructura pero con incertidumbre muy baja (≈0).
    const incertidumbre_anual = 0; // kWh, puede ajustarse si se calibra con nuevos datos
    const rango_inferior = Math.max(0, energia_anual_total - incertidumbre_anual);
    const rango_superior = energia_anual_total + incertidumbre_anual;
    
    // Potencia total instalada
    const potencia_total_kw = (num_paneles * MODELO_CLUSTER.constantes.potencia_panel_nominal) / 1000;
    
    return {
        num_paneles,
        potencia_total_kw,
        energia_anual_total,
        energia_mensual_promedio,
        costo_total,
        costo_base,
        costo_paneles,
        costo_por_panel: MODELO_CLUSTER.constantes.costo_por_panel,
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
    // Guardar resultados para la impresión
    ultimosResultados = resultados;
    ultimaGeneracionMensual = generacionMensual;
    
    // Ocultar preview y mostrar resultados reales
    const resultsPreview = document.getElementById('resultsPreview');
    if (resultsPreview) {
        resultsPreview.style.display = 'none';
    }
    
    const resultsContainer = document.getElementById('resultsContainer');
    resultsContainer.style.display = 'flex';
    resultsContainer.classList.add('show');
    
    // Panel estándar según modelo experimental
    const tipoPanelTexto = 'Panel de Referencia 190W';
    
    // Actualizar valores con tipo de panel
    document.getElementById('numPaneles').textContent = resultados.num_paneles;
    document.getElementById('potenciaTotal').textContent = 
        `${tipoPanelTexto} • ${resultados.potencia_total_kw.toFixed(2)} kW`;
    
    document.getElementById('energiaAnual').textContent = 
        `${formatNumber(resultados.energia_anual_total)} kWh`;
    document.getElementById('energiaMensual').textContent = 
        `~${formatNumber(resultados.energia_mensual_promedio)} kWh/mes`;
    
    document.getElementById('costoTotal').textContent = 
        `$${formatNumber(resultados.costo_total)}`;
    document.getElementById('costoPorPanel').textContent = 
        `Base: $${formatNumber(resultados.costo_base)} + ${resultados.num_paneles} paneles × $${formatNumber(resultados.costo_por_panel)}`;
    
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
    
    // Generar gráficas
    const consumoMensual = parseFloat(document.getElementById('consumo').value);
    generarGraficaMensual(generacionMensual, resultados.num_paneles, consumoMensual);
    generarGraficaFinanciera(resultados);
}

// ============================================
// Generar Gráfica de Generación Mensual
// ============================================

function generarGraficaMensual(generacionMensual, numPaneles, consumoMensual) {
    const ctx = document.getElementById('monthlyChart');
    
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
                        label: function(context) {
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
                        label: function(context) {
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
                        callback: function(value) {
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
// Funcionalidad de impresión estilo boleta
// ============================================

function imprimirReporte() {
    if (!ultimosResultados || !ultimaGeneracionMensual) {
        mostrarNotificacion('⚠️ Calcula primero el dimensionamiento antes de imprimir.', 'error');
        return;
    }

    const printReport = document.getElementById('printReport');
    if (!printReport) {
        console.error('Error: no se encontró el contenedor printReport.');
        return;
    }

    // Capturar gráficos como imágenes base64
    let imagenGeneracion = '';
    let imagenFinanciera = '';

    // Esperar un momento para asegurar que los gráficos estén renderizados
    setTimeout(() => {
        try {
            if (monthlyChart && typeof monthlyChart.toBase64Image === 'function') {
                imagenGeneracion = monthlyChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico de generación:', e);
        }

        try {
            if (financialChart && typeof financialChart.toBase64Image === 'function') {
                imagenFinanciera = financialChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico financiero:', e);
        }

        printReport.innerHTML = generarContenidoBoleta(imagenGeneracion, imagenFinanciera);
        printReport.style.display = 'block';

        // Esperar un momento más para que las imágenes se carguen
        setTimeout(() => {
            window.print();
            printReport.style.display = 'none';
        }, 200);
    }, 100);
}

function generarContenidoBoleta(imagenGeneracion = '', imagenFinanciera = '') {
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const horaFormateada = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const inclinacion = document.getElementById('inclinacion').value;
    const consumo = parseFloat(document.getElementById('consumo').value);
    const precioKwh = parseFloat(document.getElementById('precio_kwh').value);

    const tipoPanel = 'Panel de Referencia 190W - $200.000';

    const ubicacionTexto = ubicacionActual.nombre || 'Ubicación personalizada';
    const coordenadas = ubicacionActual.lat && ubicacionActual.lon
        ? `${ubicacionActual.lat.toFixed(4)}°, ${ubicacionActual.lon.toFixed(4)}°`
        : 'No disponible';

    const r = ultimosResultados;

    return `
        <div class="print-wrapper">
            <header class="print-header">
                <h1>☀ SOLAR360</h1>
                <p class="print-subtitle">Resumen de Dimensionamiento Solar</p>
                <p class="print-date">${fechaFormateada} • ${horaFormateada}</p>
            </header>

            <section class="print-section">
                <h2>📍 Datos del Proyecto</h2>
                <table>
                    <tbody>
                        <tr><td>Ubicación</td><td>${ubicacionTexto}</td></tr>
                        <tr><td>Coordenadas</td><td>${coordenadas}</td></tr>
                        <tr><td>Inclinación de paneles</td><td>${inclinacion}°</td></tr>
                        <tr><td>Consumo mensual</td><td>${consumo.toFixed(0)} kWh</td></tr>
                        <tr><td>Tarifa eléctrica</td><td>$${precioKwh.toFixed(2)}/kWh</td></tr>
                    </tbody>
                </table>
            </section>

            <section class="print-section">
                <h2>⚡ Sistema Recomendado</h2>
                <table>
                    <tbody>
                        <tr><td>Tipo de panel</td><td>${tipoPanel}</td></tr>
                        <tr><td>Cantidad de paneles</td><td><strong>${r.num_paneles}</strong></td></tr>
                        <tr><td>Potencia instalada</td><td>${r.potencia_total_kw.toFixed(2)} kW</td></tr>
                        <tr><td>Generación anual</td><td>${formatNumber(r.energia_anual_total.toFixed(0))} kWh</td></tr>
                        <tr><td>Generación mensual promedio</td><td>${formatNumber(r.energia_mensual_promedio.toFixed(0))} kWh</td></tr>
                        <tr><td>Cobertura del consumo</td><td>${r.cobertura.toFixed(1)}%</td></tr>
                    </tbody>
                </table>
            </section>

            <section class="print-section">
                <h2>💰 Análisis Financiero</h2>
                <table>
                    <tbody>
                        <tr><td>Inversión total estimada</td><td>$${formatNumber(r.costo_total.toFixed(0))}</td></tr>
                        <tr><td>Costo base (BOS)</td><td>$${formatNumber(r.costo_base.toFixed(0))}</td></tr>
                        <tr><td>Costo por panel</td><td>$${formatNumber(r.costo_por_panel.toFixed(0))}</td></tr>
                        <tr><td>Total paneles (${r.num_paneles} × $${formatNumber(r.costo_por_panel.toFixed(0))})</td><td>$${formatNumber(r.costo_paneles.toFixed(0))}</td></tr>
                        <tr><td>Ahorro mensual</td><td>$${formatNumber(r.ahorro_mensual.toFixed(0))}</td></tr>
                        <tr><td>Ahorro anual</td><td>$${formatNumber(r.ahorro_anual.toFixed(0))}</td></tr>
                        <tr><td>Retorno de inversión</td><td>${r.roi_anos.toFixed(1)} años</td></tr>
                        <tr><td>Ahorro estimado a 25 años</td><td>$${formatNumber((r.ahorro_anual * 25).toFixed(0))}</td></tr>
                    </tbody>
                </table>
            </section>

            <section class="print-section">
                <h2>🌍 Impacto Ambiental</h2>
                <table>
                    <tbody>
                        <tr><td>CO₂ evitado por año</td><td>${formatNumber(r.co2_anual.toFixed(0))} kg</td></tr>
                        <tr><td>CO₂ evitado en 25 años</td><td>${formatNumber((r.co2_anual * 25).toFixed(0))} kg</td></tr>
                        <tr><td>Equivalente árboles plantados (25 años)</td><td>~${formatNumber((r.co2_anual * 25 / 20).toFixed(0))} árboles</td></tr>
                    </tbody>
                </table>
            </section>

            <section class="print-section">
                <h2>☀ Datos Climáticos Mensuales</h2>
                <table class="print-table-monthly">
                    <thead>
                        <tr>
                            <th>Mes</th>
                            <th>PSH (h/día)</th>
                            <th>Temp. (°C)</th>
                            <th>Generación por panel (kWh)</th>
                            <th>Generación total (kWh)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${generarTablaMensualBoleta()}
                    </tbody>
                </table>
                <p class="print-footnote">Datos climáticos históricos para la ubicación seleccionada</p>
            </section>

            <section class="print-section">
                <h2>📊 Generación por Estación</h2>
                <table>
                    <tbody>
                        ${generarAnalisisEstacionalBoleta()}
                    </tbody>
                </table>
            </section>

            ${imagenGeneracion ? `
            <section class="print-section print-chart-section">
                <h2>📈 Generación vs Consumo Mensual</h2>
                <div class="print-chart-container">
                    <img src="${imagenGeneracion}" alt="Gráfico de Generación vs Consumo Mensual" class="print-chart-image" />
                </div>
                <p class="print-footnote">Barras amarillas: Generación. Línea roja: Consumo. Permite visualizar excedentes y déficits mensuales.</p>
            </section>
            ` : ''}

            ${imagenFinanciera ? `
            <section class="print-section print-chart-section">
                <h2>💰 Análisis Financiero (5 años)</h2>
                <div class="print-chart-container">
                    <img src="${imagenFinanciera}" alt="Gráfico de Análisis Financiero" class="print-chart-image" />
                </div>
            </section>
            ` : ''}

            <section class="print-section">
                <h2>🔧 Especificaciones Técnicas</h2>
                <ul class="print-list">
                    <li>Eficiencia del sistema: ${(MODELO_CLUSTER.constantes.performance_ratio * 100).toFixed(0)}%</li>
                    <li>Degradación anual estimada: 0.5%</li>
                    <li>Vida útil esperada del sistema: 25-30 años</li>
                    <li>Garantía de rendimiento: 25 años</li>
                </ul>
            </section>

            <footer class="print-footer">
                <p><strong>Solar360</strong> • La Plata, Buenos Aires • info@solar360.com.ar • +54 11 1234-5678</p>
                <p class="print-footnote">Este reporte es informativo. Se recomienda evaluación técnica en sitio antes de realizar la instalación.</p>
            </footer>
        </div>
    `;
}

function generarTablaMensualBoleta() {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return meses.map((mes, index) => {
        const psh = document.getElementById(`psh_${index + 1}`)?.value || '-';
        const temp = document.getElementById(`temp_${index + 1}`)?.value || '-';
        const energiaPorPanel = ultimaGeneracionMensual[index].energia_mensual.toFixed(2);
        const energiaTotal = (ultimaGeneracionMensual[index].energia_mensual * ultimosResultados.num_paneles).toFixed(1);

        return `
            <tr>
                <td>${mes}</td>
                <td>${psh}</td>
                <td>${temp}</td>
                <td>${energiaPorPanel}</td>
                <td>${energiaTotal}</td>
            </tr>
        `;
    }).join('');
}

function generarAnalisisEstacionalBoleta() {
    const temporadas = {
        '☀️ Verano (Dic-Feb)': [11, 0, 1],
        '🍂 Otoño (Mar-May)': [2, 3, 4],
        '❄️ Invierno (Jun-Ago)': [5, 6, 7],
        '🌸 Primavera (Sep-Nov)': [8, 9, 10]
    };

    return Object.entries(temporadas).map(([nombre, indices]) => {
        const promedio = indices.reduce((acum, idx) => (
            acum + ultimaGeneracionMensual[idx].energia_mensual * ultimosResultados.num_paneles
        ), 0) / indices.length;

        return `
            <tr>
                <td>${nombre}</td>
                <td style="text-align:right;"><strong>${promedio.toFixed(1)} kWh/mes</strong></td>
            </tr>
        `;
    }).join('');
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
║  Sistema de cálculo optimizado                ║
╚═══════════════════════════════════════════════╝
`);

