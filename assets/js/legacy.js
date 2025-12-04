/**
 * Solar360 - Código Legacy
 * Archivo: assets/js/legacy.js
 * 
 * Este archivo carga el script.js original como módulo
 * para mantener toda la funcionalidad durante la migración
 */

// Cargar el script original dinámicamente
// Esto asegura que todas las funciones globales estén disponibles
export async function loadLegacyCode() {
    // El script.js original se carga directamente en index.html
    // Este módulo solo exporta funciones para compatibilidad
    
    // Esperar a que el DOM esté listo
    if (document.readyState === 'loading') {
        await new Promise(resolve => {
            document.addEventListener('DOMContentLoaded', resolve);
        });
    }
    
    // Esperar un momento para que script.js se cargue
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('✅ Código legacy cargado');
}

