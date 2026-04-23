/**
 * Solar360 - Componente Map (Funcionalidad de Mapas Leaflet)
 * Archivo: assets/js/components/map.js
 * 
 * Contiene toda la funcionalidad de mapas para selección de ubicación
 */

import { mostrarNotificacion } from '../utils/notifications.js';

// Variables globales para el mapa
let map = null;
let marker = null;
let selectedLat = null;
let selectedLon = null;

// Variable global para ubicación actual (compartida con app.js)
let ubicacionActual = {
    nombre: '',
    lat: null,
    lon: null
};

/**
 * Abrir modal del mapa
 */
export function abrirMapa() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'flex';

        // Inicializar mapa si no existe
        if (!map) {
            setTimeout(() => {
                inicializarMapa();
            }, 100);
        }
    }
}

/**
 * Cerrar modal del mapa
 */
export function cerrarMapa() {
    const modal = document.getElementById('mapModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

/**
 * Inicializar mapa Leaflet
 */
export function inicializarMapa() {
    // Crear mapa centrado en Argentina
    map = L.map('map').setView([-38.4161, -63.6167], 5);

    // Añadir capa de OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);

    // Evento de click en el mapa
    map.on('click', function (e) {
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

/**
 * Seleccionar ubicación en el mapa
 */
export function seleccionarUbicacionMapa(lat, lon, nombreCiudad = null) {
    selectedLat = lat;
    selectedLon = lon;

    // Remover marker anterior si existe
    if (marker && map) {
        map.removeLayer(marker);
    }

    // Añadir nuevo marker
    if (map) {
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

        const coordsElement = document.getElementById('selectedCoords');
        const confirmBtn = document.getElementById('confirmLocationBtn');
        
        if (coordsElement) coordsElement.textContent = coordsText;
        if (confirmBtn) confirmBtn.disabled = false;

        console.log(`📍 Ubicación seleccionada: ${lat.toFixed(2)}°, ${lon.toFixed(2)}°`);
    }
}

/**
 * Seleccionar ciudad predefinida
 */
export function seleccionarCiudad(lat, lon, nombre) {
    seleccionarUbicacionMapa(lat, lon, nombre);
    if (map) {
        map.setView([lat, lon], 10);
    }
}

/**
 * Confirmar ubicación seleccionada
 */
export async function confirmarUbicacion() {
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

    if (!button || !buttonIcon || !buttonText) {
        console.error('No se encontraron elementos del botón');
        return;
    }

    // Mostrar spinner en el botón
    buttonIcon.innerHTML = '<div class="spinner"></div>';
    buttonText.textContent = 'Obteniendo datos...';
    button.disabled = true;
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

        // Luego obtener datos solares
        await obtenerDatosSolaresNASA(selectedLat, selectedLon, buttonIcon, buttonText);

        // Mostrar mensaje de confirmación
        const nombreUbicacion = ubicacionActual.nombre || `${selectedLat.toFixed(2)}°, ${selectedLon.toFixed(2)}°`;
        buttonIcon.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 18px; height: 18px; flex-shrink: 0;"><path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        buttonText.textContent = `Datos obtenidos para ${nombreUbicacion}`;
        buttonText.style.whiteSpace = 'normal';
        buttonText.style.wordWrap = 'break-word';
        buttonText.style.overflow = 'visible';
        button.classList.remove('btn-success');
        button.style.background = '';
        button.style.boxShadow = '';
        button.disabled = false;

        // Validar si ahora se puede habilitar el botón calcular
        // validarYHabilitarBotonCalcular se llama desde app.js cuando es necesario
        if (typeof window.validarYHabilitarBotonCalcular === 'function') {
            window.validarYHabilitarBotonCalcular();
        }

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

/**
 * Obtener nombre del lugar (Geocodificación Inversa)
 */
export async function obtenerNombreLugar(lat, lon, buttonText) {
    try {
        if (buttonText) {
            buttonText.textContent = 'Obteniendo nombre de la ubicación...';
        }

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

        if (buttonText) {
            buttonText.textContent = `${nombreLugar} - Obteniendo datos...`;
        }

    } catch (error) {
        console.warn('No se pudo obtener el nombre del lugar:', error);
        ubicacionActual.nombre = `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        if (buttonText) {
            buttonText.textContent = `Obteniendo datos...`;
        }
    }
}

/**
 * Obtener datos solares de NASA POWER API
 */
export async function obtenerDatosSolaresNASA(lat, lon, buttonIcon, buttonText) {
    try {
        if (buttonText) {
            buttonText.textContent = 'Obteniendo datos...';
        }

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

        // Extraer datos mensuales robustamente (NASA incluye también un agregado anual)
        const irradiance = data?.properties?.parameter?.ALLSKY_SFC_SW_DWN || {};
        const temperature = data?.properties?.parameter?.T2M || {};
        const yearPrefix = String(year);
        const mesesKeys = Object.keys(irradiance)
            .filter((key) => {
                if (!key.startsWith(yearPrefix) || key.length !== 6) return false;
                const month = Number(key.slice(4, 6));
                return month >= 1 && month <= 12;
            })
            .sort();

        if (mesesKeys.length !== 12) {
            throw new Error('NASA POWER devolvió meses incompletos');
        }

        // Rellenar formulario (guardar datos internamente)
        for (let i = 0; i < 12; i++) {
            const mesKey = mesesKeys[i];

            // PSH ≈ Irradiancia diaria (kWh/m²/día)
            const psh = Number(irradiance[mesKey]);
            const temp = Number(temperature[mesKey]);

            if (Number.isFinite(psh) && psh >= 0 && Number.isFinite(temp)) {
                const pshElement = document.getElementById(`psh_${i + 1}`);
                const tempElement = document.getElementById(`temp_${i + 1}`);
                if (pshElement) pshElement.value = psh.toFixed(1);
                if (tempElement) tempElement.value = temp.toFixed(1);
            }
        }

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

/**
 * API Alternativa: Open-Meteo
 */
export async function obtenerDatosSolaresOpenMeteo(lat, lon, buttonIcon, buttonText) {
    try {
        if (buttonText) {
            buttonText.textContent = 'Obteniendo datos (Open-Meteo)...';
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

                const pshElement = document.getElementById(`psh_${i + 1}`);
                const tempElement = document.getElementById(`temp_${i + 1}`);
                if (pshElement) pshElement.value = psh;
                if (tempElement) tempElement.value = avgTemp.toFixed(1);
            }
        }

        console.log('✅ Datos climáticos guardados internamente (Open-Meteo)');

    } catch (error) {
        console.error('Error consultando Open-Meteo:', error);
        throw error;
    }
}

/**
 * Obtener datos de ubicación automáticamente (LEGACY - ya no se usa)
 */
export async function obtenerDatosUbicacion() {
    const statusDiv = document.getElementById('locationStatus');
    if (!statusDiv) return;
    
    const statusIcon = statusDiv.querySelector('.status-icon');
    const statusText = statusDiv.querySelector('.status-text');

    // Mostrar estado de carga
    statusDiv.style.display = 'flex';
    if (statusIcon) statusIcon.textContent = '⏳';
    if (statusText) statusText.textContent = 'Obteniendo tu ubicación...';

    // Verificar si geolocalización está disponible
    if (!navigator.geolocation) {
        if (statusIcon) statusIcon.textContent = '❌';
        if (statusText) statusText.textContent = 'Tu navegador no soporta geolocalización';
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

        if (statusIcon) statusIcon.textContent = '🌐';
        if (statusText) statusText.textContent = `Ubicación: ${lat.toFixed(2)}°, ${lon.toFixed(2)}° - Consultando datos solares...`;

        // Obtener datos solares de NASA POWER API
        await obtenerDatosSolaresNASA(lat, lon, statusDiv, statusIcon, statusText);

    } catch (error) {
        console.error('Error obteniendo ubicación:', error);

        if (error.code === 1) {
            if (statusIcon) statusIcon.textContent = '🔒';
            if (statusText) statusText.textContent = 'Permiso de ubicación denegado';
            mostrarNotificacion('⚠️ Debes permitir el acceso a tu ubicación', 'error');
        } else if (error.code === 2) {
            if (statusIcon) statusIcon.textContent = '❌';
            if (statusText) statusText.textContent = 'No se pudo obtener tu ubicación';
            mostrarNotificacion('⚠️ Error obteniendo ubicación. Usa datos de ejemplo.', 'error');
        } else {
            if (statusIcon) statusIcon.textContent = '❌';
            if (statusText) statusText.textContent = 'Tiempo de espera agotado';
            mostrarNotificacion('⚠️ Tiempo agotado. Intenta de nuevo.', 'error');
        }

        setTimeout(() => statusDiv.style.display = 'none', 4000);
    }
}

// Exportar variables globales para compatibilidad
export { ubicacionActual, selectedLat, selectedLon, map, marker };

// Exportar al scope global para compatibilidad
window.abrirMapa = abrirMapa;
window.cerrarMapa = cerrarMapa;
window.inicializarMapa = inicializarMapa;
window.seleccionarUbicacionMapa = seleccionarUbicacionMapa;
window.seleccionarCiudad = seleccionarCiudad;
window.confirmarUbicacion = confirmarUbicacion;
window.obtenerNombreLugar = obtenerNombreLugar;
window.obtenerDatosSolaresNASA = obtenerDatosSolaresNASA;
window.obtenerDatosSolaresOpenMeteo = obtenerDatosSolaresOpenMeteo;
window.obtenerDatosUbicacion = obtenerDatosUbicacion;

