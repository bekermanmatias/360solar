/**
 * Solar360 - Utilidades de UI
 * Archivo: assets/js/utils/ui.js
 */

/**
 * Inicializa el scroll spy para el menú de navegación
 */
export function initScrollSpy() {
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

/**
 * Inicializa el efecto de scroll en el header
 */
export function initHeaderScroll() {
    const header = document.querySelector('.header');

    if (!header) return;

    window.addEventListener('scroll', () => {
        window.requestAnimationFrame(() => {
            const currentScroll = window.scrollY;

            // Si estamos en la parte superior, quitar efecto scrolled
            if (currentScroll <= 50) {
                header.classList.remove('scrolled');
            } else {
                header.classList.add('scrolled');
            }
        });
    });
}

/**
 * Redimensiona los gráficos cuando cambia el tamaño de la ventana
 * @param {Array} charts - Array de instancias de Chart.js
 */
export function redimensionarGraficos(charts = []) {
    window.addEventListener('resize', () => {
        charts.forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    });
}

