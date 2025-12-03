/**
 * Solar360 - Sistema de Notificaciones
 * Archivo: assets/js/utils/notifications.js
 */

/**
 * Muestra una notificación al usuario
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificación ('success', 'error', 'info', 'warning')
 */
export function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${tipo}`;
    notification.textContent = mensaje;
    
    const colors = {
        success: '#2ecc71',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f59e0b'
    };
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${colors[tipo] || colors.info};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
        max-width: 400px;
        font-size: 0.95rem;
        line-height: 1.5;
    `;

    document.body.appendChild(notification);

    // Remover después de 3 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

