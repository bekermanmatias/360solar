/**
 * Solar360 - API y Servicios Externos
 * Archivo: assets/js/components/api.js
 * 
 * Maneja todas las llamadas a APIs externas (NASA, OpenMeteo, Nominatim)
 */

import { API_CONFIG } from '../config/constants.js';
import { mostrarNotificacion } from '../utils/notifications.js';
import { locationState } from '../state.js';

/**
 * Obtiene datos climáticos desde NASA Power API
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} - Datos climáticos (psh, temperatura)
 */
export async function obtenerDatosSolaresNASA(lat, lon) {
    try {
        const { baseUrl, parameters, community } = API_CONFIG.nasaPower;
        const url = `${baseUrl}?parameters=${parameters}&community=${community}&longitude=${lon}&latitude=${lat}&start=2023&end=2023&format=JSON`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener datos de NASA');
        }
        
        const data = await response.json();
        const properties = data.properties?.parameter;
        
        if (!properties) {
            throw new Error('Formato de datos inválido');
        }
        
        // Extraer PSH (irradiancia solar diaria promedio en kWh/m²/día)
        const irradiancia = properties.ALLSKY_SFC_SW_DWN || {};
        const temperatura = properties.T2M || {};
        
        // Convertir a arrays mensuales
        const psh = [];
        const temp = [];
        
        for (let mes = 0; mes < 12; mes++) {
            const mesKey = `2023${String(mes + 1).padStart(2, '0')}`;
            const valoresIrradiancia = Object.values(irradiancia).filter(v => v !== null);
            const valoresTemp = Object.values(temperatura).filter(v => v !== null);
            
            // Calcular promedio mensual
            const pshMes = valoresIrradiancia.length > 0 
                ? valoresIrradiancia.reduce((a, b) => a + b, 0) / valoresIrradiancia.length / 1000 // Convertir W/m² a kWh/m²
                : 4.5; // Valor por defecto
            
            const tempMes = valoresTemp.length > 0
                ? valoresTemp.reduce((a, b) => a + b, 0) / valoresTemp.length
                : 20; // Valor por defecto
            
            psh.push(Math.max(0, pshMes));
            temp.push(tempMes);
        }
        
        return { psh, temperatura: temp, fuente: 'NASA' };
        
    } catch (error) {
        console.error('Error obteniendo datos de NASA:', error);
        throw error;
    }
}

/**
 * Obtiene datos climáticos desde OpenMeteo API (fallback)
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} - Datos climáticos (psh, temperatura)
 */
export async function obtenerDatosSolaresOpenMeteo(lat, lon) {
    try {
        const { baseUrl } = API_CONFIG.openMeteo;
        const url = `${baseUrl}?latitude=${lat}&longitude=${lon}&daily=solar_radiation_sum,temperature_2m_max&timezone=auto&start_date=2023-01-01&end_date=2023-12-31`;
        
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Error al obtener datos de OpenMeteo');
        }
        
        const data = await response.json();
        const daily = data.daily;
        
        if (!daily || !daily.solar_radiation_sum || !daily.temperature_2m_max) {
            throw new Error('Formato de datos inválido');
        }
        
        // Agrupar por mes
        const psh = [];
        const temp = [];
        
        for (let mes = 0; mes < 12; mes++) {
            const inicioMes = new Date(2023, mes, 1);
            const finMes = new Date(2023, mes + 1, 0);
            const diasMes = [];
            const tempsMes = [];
            
            daily.time.forEach((fecha, index) => {
                const fechaObj = new Date(fecha);
                if (fechaObj >= inicioMes && fechaObj <= finMes) {
                    diasMes.push(daily.solar_radiation_sum[index] / 1000); // Convertir a kWh/m²
                    tempsMes.push(daily.temperature_2m_max[index]);
                }
            });
            
            psh.push(diasMes.length > 0 ? diasMes.reduce((a, b) => a + b, 0) / diasMes.length : 4.5);
            temp.push(tempsMes.length > 0 ? tempsMes.reduce((a, b) => a + b, 0) / tempsMes.length : 20);
        }
        
        return { psh, temperatura: temp, fuente: 'OpenMeteo' };
        
    } catch (error) {
        console.error('Error obteniendo datos de OpenMeteo:', error);
        throw error;
    }
}

/**
 * Obtiene el nombre de un lugar desde coordenadas (geocodificación inversa)
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<string>} - Nombre del lugar
 */
export async function obtenerNombreDesdeCoordenadas(lat, lon) {
    try {
        const { baseUrl } = API_CONFIG.nominatim;
        const url = `${baseUrl}?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1&accept-language=es`;
        
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Solar360Simulator/1.0'
            }
        });
        
        if (!response.ok) {
            throw new Error('Error en geocodificación inversa');
        }
        
        const data = await response.json();
        
        if (!data.address) {
            return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
        }
        
        const address = data.address;
        let nombreLugar = address.city || 
                         address.town || 
                         address.village || 
                         address.municipality || 
                         address.state || 
                         address.county || 
                         'Ubicación seleccionada';
        
        if (address.state && nombreLugar !== address.state) {
            nombreLugar += `, ${address.state}`;
        }
        
        return nombreLugar;
        
    } catch (error) {
        console.warn('Error obteniendo nombre del lugar:', error);
        return `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`;
    }
}

/**
 * Obtiene datos climáticos con fallback automático
 * @param {number} lat - Latitud
 * @param {number} lon - Longitud
 * @returns {Promise<Object>} - Datos climáticos
 */
export async function obtenerDatosClimaticos(lat, lon) {
    try {
        // Intentar primero con NASA
        return await obtenerDatosSolaresNASA(lat, lon);
    } catch (error) {
        console.warn('NASA falló, intentando OpenMeteo...', error);
        try {
            // Fallback a OpenMeteo
            return await obtenerDatosSolaresOpenMeteo(lat, lon);
        } catch (error2) {
            console.error('Ambas APIs fallaron:', error2);
            mostrarNotificacion('⚠️ Error obteniendo datos climáticos. Usando valores por defecto.', 'warning');
            // Valores por defecto (promedio para Argentina)
            return {
                psh: [3.5, 4.2, 5.1, 5.8, 6.5, 6.8, 6.9, 6.3, 5.4, 4.6, 3.8, 3.2],
                temperatura: [12, 14, 17, 20, 24, 28, 30, 29, 25, 21, 16, 13],
                fuente: 'Por defecto'
            };
        }
    }
}

