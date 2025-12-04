/**
 * Solar360 - Componente PDF (Generación de Reportes PDF)
 * Archivo: assets/js/components/pdf.js
 * 
 * Contiene todas las funciones para generar reportes PDF
 */

import { MODELO_CLUSTER } from '../config/models.js';
import { formatearNumero } from '../utils/formatters.js';
import { formatNumber } from '../utils/formatters.js';
import { mostrarNotificacion } from '../utils/notifications.js';
import { generarGraficaMensualWizard, generarGraficaDistribucionWizard, generarGraficaFinancieraWizard } from './charts.js';

/**
 * Imprimir reporte PDF del wizard
 */
export async function imprimirReporteWizard() {
    // 0. Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        mostrarNotificacion('❌ Error: La librería PDF no está disponible. Por favor recarga la página.', 'error');
        console.error('jsPDF no está disponible. Verifica que las librerías se hayan cargado correctamente.');
        return;
    }

    // 1. Validar que existan resultados
    if (!window.wizardResultados || !window.wizardGeneracionMensual) {
        mostrarNotificacion('⚠️ Calcula primero el dimensionamiento antes de descargar el reporte.', 'error');
        return;
    }

    try {
        mostrarNotificacion('📄 Generando reporte PDF...', 'info');

        // 2. Asegurar que todos los gráficos estén generados
        const tabs = document.querySelectorAll('.wizard-tab-pane');
        const originalStyles = [];

        tabs.forEach(tab => {
            originalStyles.push({
                display: tab.style.display,
                visibility: tab.style.visibility,
                position: tab.style.position
            });
            tab.style.display = 'block';
            tab.style.visibility = 'hidden';
            tab.style.position = 'absolute';
            tab.style.top = '-9999px';
        });

        // Generar gráficos si no existen
        const wizardMonthlyChart = window.wizardMonthlyChart;
        const wizardDistributionChart = window.wizardDistributionChart;
        const wizardFinancialChart = window.wizardFinancialChart;

        if (!wizardMonthlyChart) generarGraficaMensualWizard();
        if (!wizardDistributionChart) generarGraficaDistribucionWizard();
        if (!wizardFinancialChart) generarGraficaFinancieraWizard();

        // Asegurar que las tablas estén llenas
        if (typeof window.llenarTablaMensualWizard === 'function') {
            window.llenarTablaMensualWizard();
        }
        if (typeof window.llenarTablaAhorroAcumulado === 'function') {
            window.llenarTablaAhorroAcumulado();
        }

        // Esperar a que los gráficos se rendericen
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 3. Capturar gráficos como imágenes
        let imagenGeneracion = '';
        let imagenDistribucion = '';
        let imagenFinanciera = '';

        try {
            if (wizardMonthlyChart && typeof wizardMonthlyChart.toBase64Image === 'function') {
                imagenGeneracion = wizardMonthlyChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico mensual:', e);
        }

        try {
            if (wizardDistributionChart && typeof wizardDistributionChart.toBase64Image === 'function') {
                imagenDistribucion = wizardDistributionChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico de distribución:', e);
        }

        try {
            if (wizardFinancialChart && typeof wizardFinancialChart.toBase64Image === 'function') {
                wizardFinancialChart.update('none');
                imagenFinanciera = wizardFinancialChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico financiero:', e);
        }

        // 4. Restaurar estilos
        tabs.forEach((tab, index) => {
            tab.style.display = originalStyles[index].display;
            tab.style.visibility = originalStyles[index].visibility;
            tab.style.position = originalStyles[index].position;
            tab.style.top = '';
        });

        // 5. Generar PDF y mostrar previsualización
        const pdfBlob = await generarPDFCompleto(imagenGeneracion, imagenDistribucion, imagenFinanciera);
        
        if (pdfBlob) {
            mostrarPrevisualizacionPDF(pdfBlob);
        } else {
            mostrarNotificacion('✅ Reporte PDF generado exitosamente', 'success');
        }

    } catch (error) {
        console.error('Error generando PDF:', error);
        mostrarNotificacion('❌ Error al generar el reporte. Por favor intenta nuevamente.', 'error');
    }
}

/**
 * Generar PDF completo
 */
export async function generarPDFCompleto(imagenGeneracion = '', imagenDistribucion = '', imagenFinanciera = '') {
    // Verificar que jsPDF esté disponible
    if (typeof window.jspdf === 'undefined' || !window.jspdf.jsPDF) {
        console.error('jsPDF no está disponible. Verifica que la librería se haya cargado correctamente.');
        mostrarNotificacion('❌ Error: La librería PDF no está disponible. Por favor recarga la página.', 'error');
        return null;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Cargar logo
    let logoImage = null;
    try {
        const logoPaths = ['images/logo360.png', './images/logo360.png', '/images/logo360.png'];
        for (const path of logoPaths) {
            try {
                logoImage = await cargarImagenComoBase64(path);
                break;
            } catch (e) {
                continue;
            }
        }
        if (!logoImage) {
            console.warn('No se pudo cargar el logo desde ninguna ruta');
        }
    } catch (e) {
        console.warn('No se pudo cargar el logo:', e);
    }
    
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    let yPos = margin;
    const lineHeight = 7;
    const sectionSpacing = 10;

    const resultados = window.wizardResultados;
    const datos = window.wizardDatos || (typeof window.wizardData !== 'undefined' ? window.wizardData : {});
    const generacionMensual = window.wizardGeneracionMensual || window.ultimaGeneracionMensual;
    const wizardDataLocal = typeof window.wizardData !== 'undefined' ? window.wizardData : {};
    const moneda = wizardDataLocal.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    // Función auxiliar para agregar nueva página si es necesario
    const checkNewPage = (requiredSpace) => {
        if (yPos + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPos = margin;
            return true;
        }
        return false;
    };

    // Función para agregar título de sección
    const addSectionTitle = (title, iconText = '') => {
        checkNewPage(15);
        doc.setFontSize(16);
        doc.setFont(undefined, 'bold');
        doc.setTextColor(0, 100, 150);
        const titleText = iconText ? `${iconText} ${title}` : title;
        doc.text(titleText, margin, yPos);
        yPos += lineHeight + 3;
        doc.setFontSize(10);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
    };

    // Función para agregar tabla de datos
    const addDataTable = (data) => {
        checkNewPage(data.length * 6 + 10);
        data.forEach(([label, value]) => {
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            doc.text(label, margin, yPos);
            doc.setFont(undefined, 'bold');
            doc.text(String(value), pageWidth - margin - doc.getTextWidth(String(value)), yPos);
            yPos += lineHeight;
        });
        yPos += 3;
    };

    // PORTADA
    doc.setFillColor(0, 100, 150);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    let hasLogo = false;
    if (logoImage) {
        try {
            const logoWidth = 60;  // Aumentado de 35 a 60 para mejor visibilidad
            const logoHeight = 20;  // Aumentado proporcionalmente de 12 a 20
            const logoX = (pageWidth - logoWidth) / 2;
            const logoY = 8;
            doc.addImage(logoImage, 'PNG', logoX, logoY, logoWidth, logoHeight);
            hasLogo = true;
        } catch (e) {
            console.warn('Error agregando logo:', e);
            hasLogo = false;
        }
    }
    
    doc.setTextColor(255, 255, 255);
    if (!hasLogo) {
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Solar360', pageWidth / 2, 25, { align: 'center' });
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte de Simulación Solar', pageWidth / 2, hasLogo ? 32 : 35, { align: 'center' });

    yPos = 60;
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    doc.text(`Fecha de generación: ${fechaFormateada}`, margin, yPos);
    yPos += sectionSpacing * 2;

    // 1. DATOS DEL PROYECTO
    addSectionTitle('Datos del Proyecto');
    const ubicacionTexto = datos.ubicacion || wizardDataLocal.ubicacionNombre || 'Ubicación seleccionada';
    const coordenadas = wizardDataLocal.lat && wizardDataLocal.lon
        ? `${wizardDataLocal.lat.toFixed(4)}°, ${wizardDataLocal.lon.toFixed(4)}°`
        : 'No disponible';
    const anguloSeleccionado = wizardDataLocal.inclinacion || datos.inclinacion || 'No especificado';
    
    addDataTable([
        ['Ubicación', ubicacionTexto],
        ['Coordenadas', coordenadas],
        ['Inclinación de paneles', `${anguloSeleccionado}°`],
        ['Consumo mensual', `${(datos.consumo_mensual || wizardDataLocal.consumoMensual || 0).toFixed(0)} kWh`],
        ['Tarifa eléctrica', `${simbolo}${formatearNumero(datos.precio_kwh || wizardDataLocal.precioKwh || 0, moneda)}/kWh`]
    ]);

    // 2. SISTEMA RECOMENDADO
    addSectionTitle('Sistema Recomendado');
    const tipoPanel = wizardDataLocal.tipoPanel === 'premium' ? 'Panel Premium 450W' : 'Panel Estándar 190W';
    addDataTable([
        ['Tipo de panel', tipoPanel],
        ['Cantidad de paneles', `${resultados.num_paneles}`],
        ['Potencia instalada', `${resultados.potencia_total_kw.toFixed(2)} kW`],
        ['Generación anual', `${formatearNumero(resultados.energia_anual_total || resultados.generacion_anual || 0, moneda)} kWh`],
        ['Generación mensual promedio', `${formatearNumero((resultados.energia_anual_total || 0) / 12, moneda)} kWh`],
        ['Cobertura del consumo', `${resultados.cobertura.toFixed(1)}%`]
    ]);

    // 3. ANÁLISIS FINANCIERO
    addSectionTitle('Análisis Financiero');
    addDataTable([
        ['Inversión total estimada', `${simbolo}${formatearNumero(resultados.costo_total || resultados.inversion_total || 0, moneda)}`],
        ['Costo base (BOS)', `${simbolo}${formatearNumero(resultados.costo_base || 0, moneda)}`],
        ['Costo por panel', `${simbolo}${formatearNumero(resultados.costo_por_panel || resultados.costo_panel || 0, moneda)}`],
        [`Total paneles (${resultados.num_paneles} paneles)`, `${simbolo}${formatearNumero(resultados.costo_paneles || 0, moneda)}`],
        ['Ahorro mensual', `${simbolo}${formatearNumero(resultados.ahorro_mensual || 0, moneda)}`],
        ['Ahorro anual', `${simbolo}${formatearNumero(resultados.ahorro_anual || 0, moneda)}`],
        ['Periodo de Recupero', resultados.roi_anos === Infinity || isNaN(resultados.roi_anos) ? 'N/A' : `${resultados.roi_anos.toFixed(1)} años`],
        ['Ahorro estimado a 25 años', `${simbolo}${formatearNumero((resultados.ahorro_anual || 0) * 25, moneda)}`]
    ]);

    // 4. IMPACTO AMBIENTAL
    addSectionTitle('Impacto Ambiental');
    
    const co2Anual = resultados.co2_anual || 0;
    const co225Anos = co2Anual * 25;
    const co2Toneladas = co225Anos / 1000;
    
    const arbolesEquiv = Math.round(co225Anos / 22); // Según paper: 22 kg CO₂/árbol/año
    const autosEquiv = Math.round(co225Anos / 2500); // Según paper: 2500 kg CO₂/auto/año
    const vuelosEquiv = Math.round(co2Toneladas / 0.5);
    const hogaresEquiv = Math.round(co2Toneladas / 4.5);
    
    addDataTable([
        ['CO2 evitado por año', `${formatearNumero(co2Anual.toFixed(0), moneda)} kg`],
        ['CO2 evitado en 25 años', `${formatearNumero(co225Anos.toFixed(0), moneda)} kg (${co2Toneladas.toFixed(2)} toneladas)`],
        ['', ''],
        ['Equivalente a árboles plantados', `~${formatearNumero(arbolesEquiv, moneda)} árboles`],
        ['Equivalente a autos retirados de circulación', `~${formatearNumero(autosEquiv, moneda)} autos por 1 año`],
        ['Equivalente a vuelos evitados', `~${formatearNumero(vuelosEquiv, moneda)} vuelos Buenos Aires-Madrid`],
        ['Equivalente a hogares neutralizados', `~${formatearNumero(hogaresEquiv, moneda)} hogares por 1 año`]
    ]);

    checkNewPage(20);
    doc.setFontSize(9);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text('Nota: Las equivalencias son aproximadas y basadas en promedios internacionales.', margin, yPos);
    yPos += lineHeight;
    doc.text('El impacto real puede variar según la fuente de energía de la red eléctrica local.', margin, yPos);
    yPos += sectionSpacing;

    // 5. DATOS CLIMÁTICOS MENSUALES
    addSectionTitle('Datos Climáticos Mensuales');
    checkNewPage(80);
    
    const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    
    doc.setFontSize(9);
    doc.setFont(undefined, 'bold');
    doc.text('Mes', margin, yPos);
    doc.text('PSH', margin + 30, yPos);
    doc.text('Temp.', margin + 45, yPos);
    doc.text('Generación', margin + 60, yPos);
    doc.text('Consumo', margin + 85, yPos);
    doc.text('Balance', margin + 110, yPos);
    yPos += lineHeight;
    
    doc.setFont(undefined, 'normal');
    const consumoMensual = datos.consumo_mensual || wizardDataLocal.consumoMensual || 0;
    let generacionTotal = 0;
    let consumoTotal = 0;
    
    meses.forEach((mes, index) => {
        checkNewPage(8);
        let generacion = 0;
        if (generacionMensual && generacionMensual[index]) {
            if (typeof generacionMensual[index] === 'object' && generacionMensual[index].energia_mensual) {
                generacion = generacionMensual[index].energia_mensual * (resultados.num_paneles || 1);
            } else {
                generacion = generacionMensual[index] * (resultados.num_paneles || 1);
            }
        }
        const consumo = consumoMensual;
        const balance = generacion - consumo;
        generacionTotal += generacion;
        consumoTotal += consumo;
        
        doc.text(mes, margin, yPos);
        doc.text(datos.psh && datos.psh[index] ? datos.psh[index].toFixed(2) : '-', margin + 30, yPos);
        doc.text(datos.temperatura && datos.temperatura[index] ? `${datos.temperatura[index].toFixed(1)}°C` : '-', margin + 45, yPos);
        doc.text(generacion.toFixed(0), margin + 60, yPos);
        doc.text(consumo.toFixed(0), margin + 85, yPos);
        doc.setFont(undefined, balance >= 0 ? 'bold' : 'normal');
        if (balance >= 0) {
            doc.setTextColor(0, 150, 0);
        } else {
            doc.setTextColor(200, 0, 0);
        }
        doc.text(balance >= 0 ? `+${balance.toFixed(0)}` : balance.toFixed(0), margin + 110, yPos);
        doc.setFont(undefined, 'normal');
        doc.setTextColor(0, 0, 0);
        yPos += lineHeight;
    });
    
    checkNewPage(10);
    doc.setFont(undefined, 'bold');
    doc.text('TOTAL', margin, yPos);
    doc.text(`${(datos.psh ? datos.psh.reduce((a, b) => a + b, 0) / 12 : 0).toFixed(2)}`, margin + 30, yPos);
    doc.text(`${(datos.temperatura ? datos.temperatura.reduce((a, b) => a + b, 0) / 12 : 0).toFixed(1)}°C`, margin + 45, yPos);
    doc.text(generacionTotal.toFixed(0), margin + 60, yPos);
    doc.text(consumoTotal.toFixed(0), margin + 85, yPos);
    const balanceTotal = generacionTotal - consumoTotal;
    if (balanceTotal >= 0) {
        doc.setTextColor(0, 150, 0);
    } else {
        doc.setTextColor(200, 0, 0);
    }
    doc.text(balanceTotal >= 0 ? `+${balanceTotal.toFixed(0)}` : balanceTotal.toFixed(0), margin + 110, yPos);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);
    yPos += sectionSpacing * 2;

    // 6. ANÁLISIS ESTACIONAL
    addSectionTitle('Análisis por Estación');
    checkNewPage(30);
    
    const estaciones = [
        { nombre: 'Verano (Dic-Feb)', indices: [11, 0, 1] },
        { nombre: 'Otoño (Mar-May)', indices: [2, 3, 4] },
        { nombre: 'Invierno (Jun-Ago)', indices: [5, 6, 7] },
        { nombre: 'Primavera (Sep-Nov)', indices: [8, 9, 10] }
    ];
    
    estaciones.forEach(est => {
        checkNewPage(8);
        const generacionEst = est.indices.reduce((sum, idx) => {
            if (generacionMensual && generacionMensual[idx]) {
                if (typeof generacionMensual[idx] === 'object' && generacionMensual[idx].energia_mensual) {
                    return sum + (generacionMensual[idx].energia_mensual * (resultados.num_paneles || 1));
                } else {
                    return sum + (generacionMensual[idx] * (resultados.num_paneles || 1));
                }
            }
            return sum;
        }, 0);
        const consumoEst = consumoMensual * 3;
        const porcentaje = consumoMensual > 0 ? (generacionEst / consumoEst * 100) : 0;
        
        doc.setFontSize(10);
        doc.setFont(undefined, 'bold');
        doc.text(est.nombre, margin, yPos);
        yPos += lineHeight;
        doc.setFont(undefined, 'normal');
        doc.text(`  Generación: ${generacionEst.toFixed(0)} kWh`, margin + 5, yPos);
        yPos += lineHeight;
        doc.text(`  Consumo: ${consumoEst.toFixed(0)} kWh`, margin + 5, yPos);
        yPos += lineHeight;
        doc.text(`  Cobertura: ${porcentaje.toFixed(1)}%`, margin + 5, yPos);
        yPos += lineHeight;
    });
    yPos += sectionSpacing;

    // 7. GRÁFICOS
    if (imagenGeneracion) {
        addSectionTitle('Generación vs Consumo Mensual');
        checkNewPage(80);
        try {
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (imgWidth * 0.6);
            doc.addImage(imagenGeneracion, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + sectionSpacing;
        } catch (e) {
            console.warn('Error agregando gráfico de generación:', e);
        }
    }

    if (imagenDistribucion) {
        addSectionTitle('Distribución de Energía (Ley de Generación Distribuida)');
        checkNewPage(80);
        try {
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (imgWidth * 0.6);
            doc.addImage(imagenDistribucion, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + sectionSpacing;
        } catch (e) {
            console.warn('Error agregando gráfico de distribución:', e);
        }
    }

    if (imagenFinanciera) {
        addSectionTitle('Análisis Financiero (10 años)');
        checkNewPage(80);
        try {
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (imgWidth * 0.6);
            doc.addImage(imagenFinanciera, 'PNG', margin, yPos, imgWidth, imgHeight);
            yPos += imgHeight + sectionSpacing;
        } catch (e) {
            console.warn('Error agregando gráfico financiero:', e);
        }
    }

    // 8. ESPECIFICACIONES TÉCNICAS
    addSectionTitle('Especificaciones Técnicas');
    checkNewPage(30);
    doc.setFontSize(10);
    const performanceRatio = MODELO_CLUSTER.constantes.performance_ratio || 0.75;
    doc.text(`• Eficiencia del sistema: ${(performanceRatio * 100).toFixed(0)}%`, margin, yPos);
    yPos += lineHeight;
    doc.text('• Degradación anual estimada: 0.5%', margin, yPos);
    yPos += lineHeight;
    doc.text('• Vida útil esperada del sistema: 25-30 años', margin, yPos);
    yPos += lineHeight;
    doc.text('• Garantía de rendimiento: 25 años', margin, yPos);
    yPos += lineHeight;
    doc.text('• Mantenimiento recomendado: Limpieza semestral', margin, yPos);
    yPos += sectionSpacing * 2;

    // FOOTER
    checkNewPage(20);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont(undefined, 'italic');
    doc.text('Solar360 • La Plata, Buenos Aires • info@solar360.com.ar', pageWidth / 2, yPos, { align: 'center' });
    yPos += lineHeight;
    doc.text('Este reporte es informativo. Se recomienda evaluación técnica en sitio antes de realizar la instalación.', pageWidth / 2, yPos, { align: 'center' });

    const pdfBlob = doc.output('blob');
    return pdfBlob;
}

/**
 * Cargar imagen como base64
 */
export function cargarImagenComoBase64(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            try {
                const dataURL = canvas.toDataURL('image/png');
                resolve(dataURL);
            } catch (e) {
                reject(e);
            }
        };
        img.onerror = reject;
        img.src = url;
    });
}

/**
 * Mostrar previsualización del PDF
 */
export function mostrarPrevisualizacionPDF(pdfBlob) {
    window.pdfBlobActual = pdfBlob;
    
    const pdfUrl = URL.createObjectURL(pdfBlob);
    const previewWindow = window.open(pdfUrl, '_blank');
    
    if (!previewWindow) {
        mostrarNotificacion('⚠️ Por favor permite ventanas emergentes para ver la previsualización, o descarga directamente el PDF.', 'warning');
        descargarPDFDesdePreview();
    } else {
        mostrarNotificacion('📄 Vista previa abierta. Puedes descargar el PDF desde el botón de descarga en la barra del navegador.', 'info');
    }
}

/**
 * Descargar PDF desde preview
 */
export function descargarPDFDesdePreview() {
    if (window.pdfBlobActual) {
        const fecha = new Date();
        const nombreArchivo = `Reporte_Solar360_${fecha.getFullYear()}${String(fecha.getMonth() + 1).padStart(2, '0')}${String(fecha.getDate()).padStart(2, '0')}.pdf`;
        const url = URL.createObjectURL(window.pdfBlobActual);
        const a = document.createElement('a');
        a.href = url;
        a.download = nombreArchivo;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        mostrarNotificacion('✅ Reporte PDF descargado exitosamente', 'success');
    }
}

/**
 * Imprimir reporte (simulador antiguo)
 */
export function imprimirReporte() {
    if (!window.ultimosResultados || !window.ultimaGeneracionMensual) {
        mostrarNotificacion('⚠️ Calcula primero el dimensionamiento antes de imprimir.', 'error');
        return;
    }

    const printReport = document.getElementById('printReport');
    if (!printReport) {
        console.error('Error: no se encontró el contenedor printReport.');
        return;
    }

    let imagenGeneracion = '';
    let imagenFinanciera = '';

    setTimeout(() => {
        try {
            if (window.monthlyChart && typeof window.monthlyChart.toBase64Image === 'function') {
                imagenGeneracion = window.monthlyChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico de generación:', e);
        }

        try {
            if (window.financialChart && typeof window.financialChart.toBase64Image === 'function') {
                window.financialChart.update('none');
                imagenFinanciera = window.financialChart.toBase64Image('image/png', 1.0);
            }
        } catch (e) {
            console.warn('No se pudo capturar gráfico financiero:', e);
        }

        printReport.innerHTML = generarContenidoBoleta(imagenGeneracion, imagenFinanciera);
        printReport.style.display = 'block';

        setTimeout(() => {
            window.print();
            printReport.style.display = 'none';
        }, 300);
    }, 200);
}

/**
 * Generar contenido de boleta (simulador antiguo)
 */
export function generarContenidoBoleta(imagenGeneracion = '', imagenFinanciera = '') {
    const fecha = new Date();
    const fechaFormateada = fecha.toLocaleDateString('es-AR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const horaFormateada = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });

    const inclinacion = document.getElementById('inclinacion')?.value || 'No especificado';
    const consumo = parseFloat(document.getElementById('consumo')?.value) || 0;
    const precioKwh = parseFloat(document.getElementById('precio_kwh')?.value) || 0;

    const tipoPanel = 'Módulo FV 360-Ref 190W - $200.000';

    const ubicacionTexto = window.ubicacionActual?.nombre || 'Ubicación personalizada';
    const coordenadas = window.ubicacionActual?.lat && window.ubicacionActual?.lon
        ? `${window.ubicacionActual.lat.toFixed(4)}°, ${window.ubicacionActual.lon.toFixed(4)}°`
        : 'No disponible';

    const r = window.ultimosResultados;

    return `
        <div class="print-wrapper">
            <header class="print-header">
                <h1>Solar360</h1>
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
                <h2><i class="ti ti-bolt"></i> Sistema Recomendado</h2>
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
                <h2><i class="ti ti-currency-dollar"></i> Análisis Financiero</h2>
                <table>
                    <tbody>
                        <tr><td>Inversión total estimada</td><td>$${formatNumber(r.costo_total.toFixed(0))}</td></tr>
                        <tr><td>Costo base (BOS)</td><td>$${formatNumber(r.costo_base.toFixed(0))}</td></tr>
                        <tr><td>Costo por panel</td><td>$${formatNumber(r.costo_por_panel.toFixed(0))}</td></tr>
                        <tr><td>Total paneles (${r.num_paneles} × $${formatNumber(r.costo_por_panel.toFixed(0))})</td><td>$${formatNumber(r.costo_paneles.toFixed(0))}</td></tr>
                        <tr><td>Ahorro mensual</td><td>$${formatNumber(r.ahorro_mensual.toFixed(0))}</td></tr>
                        <tr><td>Ahorro anual</td><td>$${formatNumber(r.ahorro_anual.toFixed(0))}</td></tr>
                        <tr><td>Periodo de Recupero</td><td>${r.roi_anos.toFixed(1)} años</td></tr>
                        <tr><td>Ahorro estimado a 25 años</td><td>$${formatNumber((r.ahorro_anual * 25).toFixed(0))}</td></tr>
                    </tbody>
                </table>
            </section>

            <section class="print-section">
                <h2><i class="ti ti-world"></i> Impacto Ambiental</h2>
                <table>
                    <tbody>
                        <tr><td>CO₂ evitado por año</td><td>${formatNumber(r.co2_anual.toFixed(0))} kg</td></tr>
                        <tr><td>CO₂ evitado en 25 años</td><td>${formatNumber((r.co2_anual * 25).toFixed(0))} kg</td></tr>
                        <tr><td>Equivalente árboles plantados (25 años)</td><td>~${formatNumber((r.co2_anual * 25 / 22).toFixed(0))} árboles</td></tr>
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
                <h2><i class="ti ti-currency-dollar"></i> Análisis Financiero (10 años)</h2>
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

/**
 * Generar tabla mensual para boleta
 */
export function generarTablaMensualBoleta() {
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return meses.map((mes, index) => {
        const psh = document.getElementById(`psh_${index + 1}`)?.value || '-';
        const temp = document.getElementById(`temp_${index + 1}`)?.value || '-';
        const energiaPorPanel = window.ultimaGeneracionMensual[index].energia_mensual.toFixed(2);
        const energiaTotal = (window.ultimaGeneracionMensual[index].energia_mensual * window.ultimosResultados.num_paneles).toFixed(1);

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

/**
 * Generar análisis estacional para boleta
 */
export function generarAnalisisEstacionalBoleta() {
    const temporadas = {
        '☀️ Verano (Dic-Feb)': [11, 0, 1],
        '🍂 Otoño (Mar-May)': [2, 3, 4],
        '❄️ Invierno (Jun-Ago)': [5, 6, 7],
        '🌸 Primavera (Sep-Nov)': [8, 9, 10]
    };

    return Object.entries(temporadas).map(([nombre, indices]) => {
        const promedio = indices.reduce((acum, idx) => (
            acum + window.ultimaGeneracionMensual[idx].energia_mensual * window.ultimosResultados.num_paneles
        ), 0) / indices.length;

        return `
            <tr>
                <td>${nombre}</td>
                <td style="text-align:right;"><strong>${promedio.toFixed(1)} kWh/mes</strong></td>
            </tr>
        `;
    }).join('');
}

// Exportar al scope global para compatibilidad
window.imprimirReporteWizard = imprimirReporteWizard;
window.generarPDFCompleto = generarPDFCompleto;
window.cargarImagenComoBase64 = cargarImagenComoBase64;
window.mostrarPrevisualizacionPDF = mostrarPrevisualizacionPDF;
window.descargarPDFDesdePreview = descargarPDFDesdePreview;
window.imprimirReporte = imprimirReporte;
window.generarContenidoBoleta = generarContenidoBoleta;
window.generarTablaMensualBoleta = generarTablaMensualBoleta;
window.generarAnalisisEstacionalBoleta = generarAnalisisEstacionalBoleta;

