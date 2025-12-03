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
//   Calculados mediante OLS sobre csv/01 - Generacion FV .csv
//   Cluster 1: 10°C, 20°  → β₁ = 0.190800 (N=705 datos, R²=1.0)
//   Cluster 2: 20°C, 20°  → β₁ = 0.183600 (N=703 datos, R²=1.0)
//   Cluster 3: 30°C, 20°  → β₁ = 0.176400 (N=701 datos, R²=1.0)
//   Cluster 4: 10°C, 45°  → β₁ = 0.181260 (N=713 datos, R²=1.0)
//   Cluster 5: 20°C, 45°  → β₁ = 0.174420 (N=714 datos, R²=1.0)
//   Cluster 6: 30°C, 45°  → β₁ = 0.167580 (N=722 datos, R²=1.0)
//
const MODELO_CLUSTER = {
    // Coeficientes β₁ calculados mediante Mínimos Cuadrados Ordinarios (OLS)
    // sobre el dataset experimental: csv/01 - Generacion FV .csv
    // Modelo: P = β₁ · G (sin intercepto, β₀ ≈ 0)
    // R² = 1.0 para todos los clusters (ajuste perfecto)
    betas: {
        '10_20': 0.190800,  // T=10°C, θ=20° | N=705 datos
        '20_20': 0.183600,  // T=20°C, θ=20° | N=703 datos
        '30_20': 0.176400,  // T=30°C, θ=20° | N=701 datos
        '10_45': 0.181260,  // T=10°C, θ=45° | N=713 datos
        '20_45': 0.174420,  // T=20°C, θ=45° | N=714 datos
        '30_45': 0.167580   // T=30°C, θ=45° | N=722 datos
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
// Función para Imprimir Reporte PDF
// ============================================

// ============================================
// Función para Imprimir Reporte PDF
// ============================================

async function imprimirReporteWizard() {
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
        if (!wizardMonthlyChart) generarGraficaMensualWizard();
        if (!wizardDistributionChart) generarGraficaDistribucionWizard();
        if (!wizardFinancialChart) generarGraficaFinancieraWizard();

        // Asegurar que las tablas estén llenas
        llenarTablaMensualWizard();
        llenarTablaAhorroAcumulado();

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

async function generarPDFCompleto(imagenGeneracion = '', imagenDistribucion = '', imagenFinanciera = '') {
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
        // Intentar cargar el logo desde diferentes rutas posibles
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
    const datos = window.wizardDatos || (typeof wizardData !== 'undefined' ? wizardData : {});
    const generacionMensual = window.wizardGeneracionMensual || window.ultimaGeneracionMensual;
    const wizardDataLocal = typeof wizardData !== 'undefined' ? wizardData : {};
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
    // Agregar logo si está disponible
    if (logoImage) {
        try {
            const logoWidth = 35;
            const logoHeight = 12; // Ajustar según proporción del logo
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
        // Solo mostrar título si no hay logo
        doc.setFontSize(24);
        doc.setFont(undefined, 'bold');
        doc.text('Solar360', pageWidth / 2, 25, { align: 'center' });
    }
    doc.setFontSize(14);
    doc.setFont(undefined, 'normal');
    doc.text('Reporte de Simulación Solar', pageWidth / 2, hasLogo ? 25 : 35, { align: 'center' });

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
    const anguloSeleccionado = wizardDataLocal.angulo || 'No especificado';
    
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
        ['Retorno de inversión (ROI)', resultados.roi_anos === Infinity || isNaN(resultados.roi_anos) ? 'N/A' : `${resultados.roi_anos.toFixed(1)} años`],
        ['Ahorro estimado a 25 años', `${simbolo}${formatearNumero((resultados.ahorro_anual || 0) * 25, moneda)}`]
    ]);

    // 4. IMPACTO AMBIENTAL (SECCIÓN AMPLIADA)
    addSectionTitle('Impacto Ambiental');
    
    const co2Anual = resultados.co2_anual || 0;
    const co225Anos = co2Anual * 25;
    const co2Toneladas = co225Anos / 1000;
    
    // Equivalencias ambientales
    const arbolesEquiv = Math.round(co225Anos / 20); // 1 árbol ≈ 20 kg CO₂/año
    const autosEquiv = Math.round(co225Anos / 4200); // 1 auto promedio ≈ 4.2 toneladas CO₂/año
    const vuelosEquiv = Math.round(co2Toneladas / 0.5); // 1 vuelo Buenos Aires-Madrid ≈ 0.5 toneladas CO₂
    const hogaresEquiv = Math.round(co2Toneladas / 4.5); // 1 hogar promedio ≈ 4.5 toneladas CO₂/año
    
    addDataTable([
        ['CO2 evitado por año', `${formatearNumero(co2Anual.toFixed(0), moneda)} kg`],
        ['CO2 evitado en 25 años', `${formatearNumero(co225Anos.toFixed(0), moneda)} kg (${co2Toneladas.toFixed(2)} toneladas)`],
        ['', ''], // Separador
        ['Equivalente a árboles plantados', `~${formatearNumero(arbolesEquiv, moneda)} árboles`],
        ['Equivalente a autos retirados de circulación', `~${formatearNumero(autosEquiv, moneda)} autos por 1 año`],
        ['Equivalente a vuelos evitados', `~${formatearNumero(vuelosEquiv, moneda)} vuelos Buenos Aires-Madrid`],
        ['Equivalente a hogares neutralizados', `~${formatearNumero(hogaresEquiv, moneda)} hogares por 1 año`]
    ]);

    // Texto adicional sobre impacto ambiental
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
    const mesesCompletos = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    // Encabezado de tabla
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
        // La estructura de generacionMensual puede ser un array de objetos con energia_mensual o un array de números
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
    
    // Totales
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

    // 7. GRÁFICOS (si están disponibles)
    if (imagenGeneracion) {
        addSectionTitle('Generación vs Consumo Mensual');
        checkNewPage(80);
        try {
            const imgWidth = pageWidth - 2 * margin;
            const imgHeight = (imgWidth * 0.6); // Mantener proporción
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
    const performanceRatio = (typeof MODELO_CLUSTER !== 'undefined' && MODELO_CLUSTER.constantes && MODELO_CLUSTER.constantes.performance_ratio) 
        ? MODELO_CLUSTER.constantes.performance_ratio 
        : 0.75;
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

    // Retornar el PDF como blob para previsualización
    const pdfBlob = doc.output('blob');
    return pdfBlob;
}

// Función para cargar imagen como base64
function cargarImagenComoBase64(url) {
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

// Función para mostrar previsualización del PDF usando la vista previa del navegador
function mostrarPrevisualizacionPDF(pdfBlob) {
    // Guardar el blob globalmente para descarga
    window.pdfBlobActual = pdfBlob;
    
    // Crear URL del blob
    const pdfUrl = URL.createObjectURL(pdfBlob);
    
    // Abrir en nueva ventana con la vista previa del navegador
    const previewWindow = window.open(pdfUrl, '_blank');
    
    if (!previewWindow) {
        // Si el popup fue bloqueado, mostrar notificación y descargar directamente
        mostrarNotificacion('⚠️ Por favor permite ventanas emergentes para ver la previsualización, o descarga directamente el PDF.', 'warning');
        descargarPDFDesdePreview();
    } else {
        // Mostrar notificación con opción de descargar
        mostrarNotificacion('📄 Vista previa abierta. Puedes descargar el PDF desde el botón de descarga en la barra del navegador.', 'info');
        
        // Limpiar URL después de un tiempo
        setTimeout(() => {
            // No revocar inmediatamente para que el navegador pueda cargar el PDF
        }, 1000);
    }
}

function descargarPDFDesdePreview() {
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

// ============================================
// Inicialización
// ============================================

document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// Variables globales para el mapa
let map = null;
let marker = null;
let selectedLat = null;
let selectedLon = null;
let modoActual = 'ubicacion'; // 'ubicacion' o 'manual'
let modoDimensionamiento = 'porcentaje'; // 'porcentaje' o 'paneles'

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
    console.log('🚀 Inicializando aplicación...');
    
    // Event listeners
    const modeUbicacion = document.getElementById('modeUbicacion');
    const modeManual = document.getElementById('modeManual');
    const openMapButton = document.getElementById('openMapButton');
    const simulatorForm = document.getElementById('simulatorForm');
    
    if (modeUbicacion) {
        modeUbicacion.addEventListener('click', seleccionarModoUbicacion);
    }
    if (modeManual) {
        modeManual.addEventListener('click', seleccionarModoManual);
    }
    if (openMapButton) {
        openMapButton.addEventListener('click', abrirMapa);
    }
    if (simulatorForm) {
        simulatorForm.addEventListener('submit', calcularDimensionamiento);
    }

    // Modal Simulador
    const btnAbrirSimulador = document.getElementById('btnAbrirSimulador');
    const btnCerrarSimulador = document.getElementById('btnCerrarSimulador');
    const modalSimulador = document.getElementById('modalSimulador');
    const navSimulador = document.getElementById('navSimulador');

    console.log('🔍 Buscando botón btnAbrirSimulador:', btnAbrirSimulador);
    if (btnAbrirSimulador) {
        btnAbrirSimulador.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('🖱️ Click en botón Simulación Personalizada');
            abrirModalSimulador();
        });
        console.log('✅ Event listener agregado al botón');
    } else {
        console.error('❌ No se encontró el botón btnAbrirSimulador');
    }

    // Abrir modal desde el menú de navegación
    if (navSimulador) {
        navSimulador.addEventListener('click', function (e) {
            e.preventDefault();
            abrirModalSimulador();
        });
    }

    if (btnCerrarSimulador) {
        btnCerrarSimulador.addEventListener('click', cerrarModalSimulador);
    }

    // Cerrar modal al hacer clic fuera
    if (modalSimulador) {
        modalSimulador.addEventListener('click', function (e) {
            if (e.target === modalSimulador) {
                cerrarModalSimulador();
            }
        });
    }

    // Cerrar modal con ESC
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalSimulador && modalSimulador.classList.contains('active')) {
            cerrarModalSimulador();
        }
    });

    // Inicializar wizard del modal
    inicializarWizardModal();

    // Inicializar sección de dimensionamiento
    inicializarDimensionamiento();

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
    // initHeaderScroll(); // Deshabilitado - el header mantiene el mismo estilo siempre

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
// Modal Simulador Fullscreen
// ============================================

// Variable global para el paso actual del wizard
let currentWizardStep = 0; // Paso 0 = Introducción
const totalWizardSteps = 6; // 0-5 (6 pasos totales: intro, ubicación, factura, dimensionamiento, ángulo, resultados)

function abrirModalSimulador() {
    console.log('🔓 Intentando abrir modal simulador...');
    const modal = document.getElementById('modalSimulador');
    if (modal) {
        console.log('✅ Modal encontrado, abriendo...');
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevenir scroll del body
        // Reiniciar al paso 0 (introducción) cuando se abre el modal
        currentWizardStep = 0;
        if (typeof actualizarWizardUI === 'function') {
            actualizarWizardUI();
        } else {
            console.error('❌ actualizarWizardUI no está definida');
        }
        console.log('✅ Modal abierto');
    } else {
        console.error('❌ No se encontró el elemento modalSimulador');
    }
}

function cerrarModalSimulador() {
    const modal = document.getElementById('modalSimulador');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = ''; // Restaurar scroll del body
        // Reiniciar al paso 0 cuando se cierra
        currentWizardStep = 0;
        actualizarWizardUI();
    }
}

function actualizarWizardUI() {
    // Actualizar contenido visible
    document.querySelectorAll('.wizard-step-content').forEach((step) => {
        const stepNum = parseInt(step.dataset.step);
        if (stepNum === currentWizardStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });

    // Actualizar contenido visual de la izquierda
    actualizarWizardVisual();

    // Actualizar botones de navegación
    const btnPrev = document.getElementById('btnWizardPrev');
    const btnNext = document.getElementById('btnWizardNext');
    const wizardNav = document.getElementById('wizardNavigation');
    const wizardContent = document.querySelector('.modal-wizard-content');
    const btnCerrar = document.getElementById('btnCerrarSimulador');

    // Mostrar/ocultar botón de cerrar (X)
    if (btnCerrar) {
        if (currentWizardStep === 0) {
            btnCerrar.style.display = 'none'; // Ocultar en pantalla de introducción
        } else {
            btnCerrar.style.display = 'flex'; // Mostrar en los 5 pasos del wizard
        }
    }

    // Mostrar/ocultar navegación según el paso
    if (wizardNav) {
        if (currentWizardStep === 0) {
            wizardNav.style.display = 'none';
        } else {
            wizardNav.style.display = 'flex';
            wizardNav.style.visibility = 'visible';
            wizardNav.style.opacity = '1';

            // Para el paso 1, agregar clase especial
            if (currentWizardStep === 1) {
                if (wizardContent) wizardContent.classList.add('step-map-active');
                if (btnPrev) {
                    btnPrev.style.display = 'none'; // Ocultar botón Atrás en paso 1
                }
                if (btnNext) {
                    btnNext.style.display = 'flex';
                    btnNext.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
                }
            } else {
                if (wizardContent) wizardContent.classList.remove('step-map-active');
                if (btnPrev) {
                    btnPrev.style.display = 'flex'; // Mostrar botón Atrás en otros pasos
                }
                if (btnPrev) btnPrev.innerHTML = '<i class="fas fa-arrow-left"></i> Anterior';
                if (btnNext) {
                    btnNext.style.display = 'flex';
                    if (currentWizardStep === totalWizardSteps - 1) {
                        btnNext.textContent = 'Finalizar';
                    } else {
                        btnNext.innerHTML = 'Siguiente <i class="fas fa-arrow-right"></i>';
                    }
                }
            }
        }
    }

    if (btnPrev) {
        if (currentWizardStep === 1) {
            btnPrev.style.display = 'none'; // Ocultar completamente en paso 1
        } else {
            btnPrev.style.display = 'flex'; // Mostrar en otros pasos
            btnPrev.disabled = currentWizardStep <= 0;
        }
    }
}

function actualizarWizardVisual() {
    const visualContent = document.getElementById('wizardVisualContent');
    if (!visualContent) return;

    if (currentWizardStep === 0) {
        // Pantalla de introducción
        visualContent.className = 'modal-wizard-visual intro-overlay';
        visualContent.innerHTML = `
            <div class="intro-content">
                <div class="intro-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h1 class="intro-title">Calculadora<br>Paneles<br>Solares</h1>
                <p class="intro-description">
                    Haz tu cálculo de paneles solares para saber cuánto puedes ahorrar con la energía solar en tu consumo eléctrico y emisiones de CO2.
                </p>
            </div>
        `;
    } else if (currentWizardStep === 1) {
        // Paso 1: Indicaciones de ubicación
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Ingresa tu dirección</h2>
                <p class="wizard-instructions-question">¿Dónde te gustaría instalar el Sistema Fotovoltaico?</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 20%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 1/5</span>
                </div>
            </div>
        `;

        // Inicializar mapa cuando se muestra el paso 1
        setTimeout(() => {
            inicializarWizardMapa();
        }, 300);
    } else if (currentWizardStep === 2) {
        // Paso 2: Instrucciones de factura
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Datos de tu Factura</h2>
                <p class="wizard-instructions-question">Ingresa la información de consumo y precio de tu factura eléctrica</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 40%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 2/5</span>
                </div>
            </div>
        `;
    } else if (currentWizardStep === 3) {
        // Paso 3: Instrucciones de dimensionamiento
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Dimensiona tu Sistema</h2>
                <p class="wizard-instructions-question">Elige cómo quieres dimensionar tu sistema solar: por porcentaje de cobertura o por cantidad de paneles</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 60%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 3/5</span>
                </div>
            </div>
        `;
    } else if (currentWizardStep === 4) {
        // Paso 4: Instrucciones de ángulo
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Ángulo de Instalación</h2>
                <p class="wizard-instructions-question">Selecciona el ángulo de inclinación de tus paneles. El ángulo influye en la eficiencia de generación de energía</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 80%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 4/5</span>
                </div>
            </div>
        `;
    } else if (currentWizardStep === 5) {
        // Paso 5: Resultados
        visualContent.className = 'modal-wizard-visual wizard-step-instructions';
        visualContent.innerHTML = `
            <div class="wizard-instructions-content">
                <div class="wizard-logo">
                    <img src="images/logo360.png" alt="Solar360" class="logo-img">
                </div>
                <h2 class="wizard-instructions-title">Tus Resultados</h2>
                <p class="wizard-instructions-question">Aquí está el análisis completo de tu sistema solar. Revisa los detalles y ajusta según necesites.</p>
                <div class="wizard-progress">
                    <div class="wizard-progress-bar">
                        <div class="wizard-progress-fill" style="width: 100%"></div>
                    </div>
                    <span class="wizard-progress-text">Paso 5/5</span>
                </div>
            </div>
        `;

        // Inicializar resultados detallados si ya están calculados
        if (window.wizardResultados) {
            setTimeout(() => {
                inicializarWizardResultadosDetallados();
            }, 100);
        }
    } else {
        // Para otros pasos, mostrar imagen
        visualContent.className = 'modal-wizard-visual';
        visualContent.innerHTML = `<img src="images/inicio-sim.jpg" alt="Paneles solares">`;
    }
}

// Variable global para el mapa del wizard
let wizardMap = null;
let wizardMapMarker = null;
let ubicacionSeleccionada = null;

// Variables globales para almacenar datos del wizard
let wizardData = {
    // Paso 1: Ubicación
    lat: null,
    lon: null,
    ubicacionNombre: '',
    psh: null, // Array de 12 meses
    temperatura: null, // Array de 12 meses

    // Paso 2: Factura
    moneda: 'ARS',
    modoConsumo: 'aproximado', // 'aproximado' o 'especifico'
    consumoMensual: null,
    consumoMensualArray: [], // Array de 12 meses si es específico
    precioKwh: null,

    // Paso 3: Dimensionamiento
    modoDimensionamiento: 'porcentaje', // 'porcentaje' o 'paneles'
    porcentajeCobertura: 100,
    numPaneles: null,

    // Paso 4: Ángulo
    inclinacion: 20 // 20 o 45
};

function inicializarWizardMapa() {
    const mapContainer = document.getElementById('wizardMap');
    if (!mapContainer || wizardMap) return; // Ya está inicializado

    // Crear mapa centrado en Argentina con zoom inicial
    wizardMap = L.map('wizardMap', {
        zoomControl: false, // Lo agregaremos manualmente después
        maxZoom: 22, // Aumentar zoom máximo significativamente
        minZoom: 3,
        zoomSnap: 0.5, // Permitir zoom intermedio
        zoomDelta: 0.5 // Incremento de zoom más suave
    }).setView([-38.4161, -63.6167], 5);

    // Inicializar con vista de mapa (no satélite)
    // Usar CartoDB Positron que tiene mejor cobertura en zoom alto
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 22, // Zoom máximo muy alto
        minZoom: 3
    }).addTo(wizardMap);

    // Evento de click en el mapa
    wizardMap.on('click', function (e) {
        const lat = e.latlng.lat;
        const lon = e.latlng.lng;

        // Eliminar marcador anterior si existe
        if (wizardMapMarker) {
            wizardMap.removeLayer(wizardMapMarker);
        }

        // Agregar nuevo marcador
        wizardMapMarker = L.marker([lat, lon]).addTo(wizardMap);

        // Intentar obtener el nombre del lugar mediante geocodificación inversa
        obtenerNombreDesdeCoordenadas(lat, lon);
    });

    // Inicializar búsqueda
    inicializarBusquedaMapa();

    // Inicializar toggles de vista
    inicializarTogglesMapa();

    // Agregar controles de zoom con límites aumentados
    L.control.zoom({
        position: 'bottomright',
        zoomInTitle: 'Acercar',
        zoomOutTitle: 'Alejar'
    }).addTo(wizardMap);

    // Ajustar tamaño del mapa después de inicializar
    setTimeout(() => {
        wizardMap.invalidateSize();
    }, 100);
}

let searchTimeout = null;
let selectedSuggestionIndex = -1;

function inicializarBusquedaMapa() {
    const searchInput = document.getElementById('wizardMapSearch');
    const searchBtn = document.querySelector('.wizard-map-search-btn');
    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');

    console.log('🔍 Inicializando búsqueda:', { searchInput, searchBtn, suggestionsContainer });

    if (!searchInput || !searchBtn) {
        console.error('❌ No se encontraron elementos de búsqueda');
        return;
    }

    if (!suggestionsContainer) {
        console.error('❌ No se encontró el contenedor de sugerencias');
        return;
    }

    // Autocompletado mientras se escribe
    searchInput.addEventListener('input', function (e) {
        const query = e.target.value.trim();

        // Limpiar timeout anterior
        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        // Ocultar sugerencias si está vacío o tiene menos de 3 caracteres
        if (!query || query.length < 3) {
            if (suggestionsContainer) {
                suggestionsContainer.classList.remove('active');
                suggestionsContainer.innerHTML = '';
            }
            selectedSuggestionIndex = -1;
            return;
        }

        // Esperar 300ms antes de buscar (debounce) - solo si tiene 3 o más caracteres
        searchTimeout = setTimeout(() => {
            buscarSugerencias(query);
        }, 300);
    });

    // Navegación con teclado
    searchInput.addEventListener('keydown', function (e) {
        const suggestions = suggestionsContainer?.querySelectorAll('.wizard-map-search-suggestion');
        if (!suggestions || suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            selectedSuggestionIndex = Math.min(selectedSuggestionIndex + 1, suggestions.length - 1);
            actualizarSugerenciaSeleccionada(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, -1);
            actualizarSugerenciaSeleccionada(suggestions);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
                seleccionarSugerencia(suggestions[selectedSuggestionIndex]);
            } else {
                buscarDireccion();
            }
        } else if (e.key === 'Escape') {
            if (suggestionsContainer) {
                suggestionsContainer.classList.remove('active');
            }
            selectedSuggestionIndex = -1;
        }
    });

    // Buscar al hacer clic en el botón
    searchBtn.addEventListener('click', buscarDireccion);

    // Cerrar sugerencias al hacer clic fuera
    document.addEventListener('click', function (e) {
        if (!searchInput.contains(e.target) && !suggestionsContainer?.contains(e.target)) {
            if (suggestionsContainer) {
                suggestionsContainer.classList.remove('active');
            }
        }
    });
}

function buscarSugerencias(query) {
    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');
    const searchInput = document.getElementById('wizardMapSearch');

    console.log('🔍 Buscando sugerencias para:', query, { suggestionsContainer, searchInput });

    if (!suggestionsContainer || !searchInput) {
        console.error('❌ No se encontraron elementos necesarios');
        return;
    }

    // Validar que tenga al menos 3 caracteres
    if (!query || query.length < 3) {
        suggestionsContainer.classList.remove('active');
        suggestionsContainer.innerHTML = '';
        return;
    }

    console.log('✅ Mostrando indicador de carga');
    // Mostrar indicador de carga
    suggestionsContainer.innerHTML = '<div class="wizard-map-search-suggestion" style="text-align: center; color: #999; font-style: italic; pointer-events: none;">Buscando...</div>';
    suggestionsContainer.classList.add('active');

    // Forzar visibilidad
    suggestionsContainer.style.display = 'block';

    // Usar Nominatim para obtener sugerencias
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=8&countrycodes=ar&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('📥 Respuesta recibida:', data);
            suggestionsContainer.innerHTML = '';
            selectedSuggestionIndex = -1;

            if (data && data.length > 0) {
                console.log(`✅ Encontradas ${data.length} sugerencias`);
                data.forEach((result, index) => {
                    const suggestion = document.createElement('div');
                    suggestion.className = 'wizard-map-search-suggestion';

                    // Formatear el nombre de la dirección de manera más legible
                    const displayName = formatearNombreDireccion(result.display_name);
                    suggestion.dataset.lat = result.lat;
                    suggestion.dataset.lon = result.lon;
                    suggestion.dataset.name = result.display_name;

                    // Resaltar la parte que coincide con la búsqueda
                    const highlightedName = resaltarCoincidencia(displayName, query);
                    suggestion.innerHTML = highlightedName;

                    suggestion.addEventListener('click', () => {
                        seleccionarSugerencia(suggestion);
                    });

                    suggestion.addEventListener('mouseenter', () => {
                        selectedSuggestionIndex = index;
                        actualizarSugerenciaSeleccionada(suggestionsContainer.querySelectorAll('.wizard-map-search-suggestion'));
                    });

                    suggestionsContainer.appendChild(suggestion);
                });

                suggestionsContainer.classList.add('active');
                suggestionsContainer.style.display = 'block';
                console.log('✅ Sugerencias mostradas');
            } else {
                // Mostrar mensaje si no hay resultados
                const noResults = document.createElement('div');
                noResults.className = 'wizard-map-search-suggestion';
                noResults.style.textAlign = 'center';
                noResults.style.color = '#999';
                noResults.style.fontStyle = 'italic';
                noResults.style.pointerEvents = 'none';
                noResults.textContent = 'No se encontraron resultados';
                suggestionsContainer.appendChild(noResults);
                suggestionsContainer.classList.add('active');
            }
        })
        .catch(error => {
            console.error('Error al buscar sugerencias:', error);
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.classList.remove('active');
        });
}

function formatearNombreDireccion(nombreCompleto) {
    // Simplificar el nombre de la dirección para mostrar solo lo más relevante
    const partes = nombreCompleto.split(',');
    if (partes.length > 3) {
        // Tomar las primeras 3 partes (calle, ciudad, provincia)
        return partes.slice(0, 3).join(', ').trim();
    }
    return nombreCompleto;
}

function resaltarCoincidencia(texto, busqueda) {
    // Resaltar la parte que coincide con la búsqueda (sin negrita, solo color sutil)
    const regex = new RegExp(`(${busqueda.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return texto.replace(regex, '<span style="color: var(--primary-color); font-weight: 500;">$1</span>');
}

function actualizarSugerenciaSeleccionada(suggestions) {
    suggestions.forEach((suggestion, index) => {
        if (index === selectedSuggestionIndex) {
            suggestion.classList.add('active');
            suggestion.scrollIntoView({ block: 'nearest' });

            // Mostrar preview en el mapa cuando se navega con las flechas
            const lat = parseFloat(suggestion.dataset.lat);
            const lon = parseFloat(suggestion.dataset.lon);
            mostrarPreviewEnMapa(lat, lon, suggestion.dataset.name);
        } else {
            suggestion.classList.remove('active');
        }
    });
}

function mostrarPreviewEnMapa(lat, lon, nombre) {
    if (!wizardMap) return;

    // Eliminar marcador de preview anterior si existe
    if (wizardMapMarker && wizardMapMarker.options.isPreview) {
        wizardMap.removeLayer(wizardMapMarker);
        wizardMapMarker = null;
    }

    // Centrar mapa en la ubicación (con animación suave)
    wizardMap.setView([lat, lon], Math.max(wizardMap.getZoom(), 13), {
        animate: true,
        duration: 0.3
    });

    // Agregar marcador temporal de preview
    const previewMarker = L.marker([lat, lon], {
        isPreview: true
    }).addTo(wizardMap);

    // Guardar referencia temporal
    wizardMapMarker = previewMarker;
}

function seleccionarSugerencia(suggestionElement) {
    const lat = parseFloat(suggestionElement.dataset.lat);
    const lon = parseFloat(suggestionElement.dataset.lon);
    const name = suggestionElement.dataset.name;

    const searchInput = document.getElementById('wizardMapSearch');
    if (searchInput) {
        searchInput.value = name; // Solo mostrar el nombre, nunca coordenadas
    }

    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('active');
    }

    // Centrar mapa en la ubicación seleccionada
    if (wizardMap) {
        wizardMap.setView([lat, lon], 15, {
            animate: true,
            duration: 0.5
        });

        // Eliminar marcador anterior
        if (wizardMapMarker) {
            wizardMap.removeLayer(wizardMapMarker);
        }

        // Agregar nuevo marcador definitivo (sin flag de preview)
        wizardMapMarker = L.marker([lat, lon]).addTo(wizardMap);

        // Guardar ubicación seleccionada
        ubicacionSeleccionada = {
            lat: lat,
            lon: lon,
            nombre: name
        };
    }

    selectedSuggestionIndex = -1;
}

function obtenerNombreDesdeCoordenadas(lat, lon) {
    // Geocodificación inversa para obtener el nombre del lugar
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.display_name) {
                const nombre = data.display_name;

                // Actualizar campo de búsqueda con el nombre del lugar
                const searchInput = document.getElementById('wizardMapSearch');
                if (searchInput) {
                    searchInput.value = nombre;
                }

                // Guardar ubicación seleccionada con nombre
                ubicacionSeleccionada = {
                    lat: lat,
                    lon: lon,
                    nombre: nombre
                };
            } else {
                // Si no se encuentra nombre, usar una descripción genérica
                ubicacionSeleccionada = {
                    lat: lat,
                    lon: lon,
                    nombre: 'Ubicación seleccionada'
                };
            }
        })
        .catch(error => {
            console.error('Error al obtener nombre del lugar:', error);
            // En caso de error, usar descripción genérica
            ubicacionSeleccionada = {
                lat: lat,
                lon: lon,
                nombre: 'Ubicación seleccionada'
            };
        });
}

function buscarDireccion() {
    const searchInput = document.getElementById('wizardMapSearch');
    if (!searchInput || !wizardMap) return;

    const query = searchInput.value.trim();
    if (!query) return;

    // Cerrar sugerencias si están abiertas
    const suggestionsContainer = document.getElementById('wizardMapSearchSuggestions');
    if (suggestionsContainer) {
        suggestionsContainer.classList.remove('active');
    }

    // Mostrar indicador de carga
    const searchBtn = document.querySelector('.wizard-map-search-btn');
    if (searchBtn) {
        searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        searchBtn.disabled = true;
    }

    // Usar Nominatim para geocodificación
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1&countrycodes=ar&addressdetails=1`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);
                const nombre = result.display_name || query;

                // Centrar mapa en la ubicación encontrada
                wizardMap.setView([lat, lon], 15, {
                    animate: true,
                    duration: 0.5
                });

                // Eliminar marcador anterior
                if (wizardMapMarker) {
                    wizardMap.removeLayer(wizardMapMarker);
                }

                // Agregar nuevo marcador
                wizardMapMarker = L.marker([lat, lon]).addTo(wizardMap);

                // Guardar ubicación seleccionada
                ubicacionSeleccionada = {
                    lat: lat,
                    lon: lon,
                    nombre: nombre
                };

                // Actualizar campo de búsqueda solo con el nombre (nunca coordenadas)
                searchInput.value = nombre;
            } else {
                alert('No se encontró la dirección. Por favor, intenta con otra búsqueda o selecciona un punto en el mapa.');
            }
        })
        .catch(error => {
            console.error('Error en la búsqueda:', error);
            alert('Error al buscar la dirección. Por favor, intenta nuevamente.');
        })
        .finally(() => {
            // Restaurar botón de búsqueda
            if (searchBtn) {
                searchBtn.innerHTML = '<i class="fas fa-search"></i>';
                searchBtn.disabled = false;
            }
        });
}

function inicializarTogglesMapa() {
    const toggles = document.querySelectorAll('.wizard-map-toggle');

    toggles.forEach(toggle => {
        toggle.addEventListener('click', function () {
            // Remover active de todos
            toggles.forEach(t => t.classList.remove('active'));
            // Agregar active al clickeado
            this.classList.add('active');

            const view = this.dataset.view;

            // Remover todas las capas de tiles
            wizardMap.eachLayer(function (layer) {
                if (layer instanceof L.TileLayer) {
                    wizardMap.removeLayer(layer);
                }
            });

            // Agregar nueva capa según la vista
            if (view === 'satellite') {
                // Usar una capa de satélite con zoom máximo aumentado
                L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                    attribution: '&copy; Esri, Maxar, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, IGP',
                    maxZoom: 22, // Aumentar zoom máximo
                    minZoom: 3
                }).addTo(wizardMap);
            } else {
                // Vista de mapa normal (inicial) - usar CartoDB
                L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
                    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                    subdomains: 'abcd',
                    maxZoom: 22, // Zoom máximo muy alto
                    minZoom: 3
                }).addTo(wizardMap);
            }
        });
    });
}

async function confirmarUbicacionWizard() {
    if (ubicacionSeleccionada) {
        console.log('📍 Ubicación confirmada:', ubicacionSeleccionada);

        // Guardar ubicación en wizardData
        wizardData.lat = ubicacionSeleccionada.lat;
        wizardData.lon = ubicacionSeleccionada.lon;
        wizardData.ubicacionNombre = ubicacionSeleccionada.nombre || 'Ubicación seleccionada';

        // Crear overlay de carga
        const wizardStep1 = document.getElementById('wizardStep1');
        const loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'wizardLoadingOverlay';
        loadingOverlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;
        loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div style="margin-bottom: 1.5rem;">
                    <svg width="60" height="60" viewBox="0 0 50 50" style="animation: spin 1s linear infinite;">
                        <circle cx="25" cy="25" r="20" stroke="#FDB813" stroke-width="4" fill="none" stroke-dasharray="31.4 31.4" stroke-linecap="round">
                            <animateTransform attributeName="transform" type="rotate" from="0 25 25" to="360 25 25" dur="1s" repeatCount="indefinite"/>
                        </circle>
                    </svg>
                </div>
                <p style="font-size: 1.1rem; font-weight: 600; color: #2c3e50; margin: 0;">Obteniendo datos climáticos...</p>
                <p style="font-size: 0.9rem; color: #7f8c8d; margin-top: 0.5rem;">Por favor espera un momento</p>
            </div>
        `;

        if (wizardStep1) {
            wizardStep1.appendChild(loadingOverlay);
        }

        // Deshabilitar botón Siguiente
        const btnNext = document.getElementById('btnWizardNext');
        if (btnNext) {
            btnNext.disabled = true;
            btnNext.style.opacity = '0.5';
            btnNext.style.cursor = 'not-allowed';
        }

        try {
            // Obtener datos climáticos de la API
            await obtenerDatosClimaticosWizard(ubicacionSeleccionada.lat, ubicacionSeleccionada.lon);

            // Remover overlay
            if (loadingOverlay && loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }

            // Restaurar botón
            if (btnNext) {
                btnNext.disabled = false;
                btnNext.style.opacity = '1';
                btnNext.style.cursor = 'pointer';
            }

            // NO mostrar notificación verde
            return true;
        } catch (error) {
            console.error('❌ Error obteniendo datos climáticos:', error);

            // Remover overlay
            if (loadingOverlay && loadingOverlay.parentNode) {
                loadingOverlay.remove();
            }

            // Restaurar botón
            if (btnNext) {
                btnNext.disabled = false;
                btnNext.style.opacity = '1';
                btnNext.style.cursor = 'pointer';
            }

            mostrarNotificacion('⚠️ Error obteniendo datos climáticos. Usando valores por defecto.', 'warning');

            // Usar datos de ejemplo
            wizardData.psh = DATOS_EJEMPLO.psh;
            wizardData.temperatura = DATOS_EJEMPLO.temperatura;

            return true; // Permitir continuar con datos de ejemplo
        }
    }
    return false;
}

async function obtenerDatosClimaticosWizard(lat, lon) {
    try {
        // Intentar primero con NASA POWER API
        const year = new Date().getFullYear() - 1;

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
        const pshData = data.properties.parameter.ALLSKY_SFC_SW_DWN;
        const tempData = data.properties.parameter.T2M;

        // Convertir objeto a array [ene, feb, mar, ...]
        wizardData.psh = Object.values(pshData);
        wizardData.temperatura = Object.values(tempData);

        console.log('📊 Datos climáticos procesados:');
        console.log('   PSH:', wizardData.psh);
        console.log('   Temperatura:', wizardData.temperatura);

    } catch (error) {
        console.warn('⚠️ NASA POWER falló, intentando Open-Meteo...');

        // Intentar con Open-Meteo como fallback
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

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Open-Meteo API Error: ${response.status}`);
        }

        const data = await response.json();

        // Procesar datos diarios a mensuales
        const radiation = data.daily.shortwave_radiation_sum;
        const temperature = data.daily.temperature_2m_mean;
        const dates = data.daily.time;

        // Agrupar por mes
        const monthlyData = {};

        dates.forEach((date, index) => {
            const month = new Date(date).getMonth();
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    radiation: [],
                    temperature: []
                };
            }
            if (radiation[index] !== null) {
                monthlyData[month].radiation.push(radiation[index]);
            }
            if (temperature[index] !== null) {
                monthlyData[month].temperature.push(temperature[index]);
            }
        });

        // Calcular promedios mensuales
        wizardData.psh = [];
        wizardData.temperatura = [];

        for (let i = 0; i < 12; i++) {
            if (monthlyData[i]) {
                const avgRad = monthlyData[i].radiation.reduce((a, b) => a + b, 0) / monthlyData[i].radiation.length;
                const avgTemp = monthlyData[i].temperature.reduce((a, b) => a + b, 0) / monthlyData[i].temperature.length;

                // Convertir MJ/m² a kWh/m²/día
                wizardData.psh.push(avgRad / 3.6);
                wizardData.temperatura.push(avgTemp);
            } else {
                wizardData.psh.push(DATOS_EJEMPLO.psh[i]);
                wizardData.temperatura.push(DATOS_EJEMPLO.temperatura[i]);
            }
        }

        console.log('✅ Datos obtenidos de Open-Meteo');
    }
}

function goToWizardStep(step) {
    if (step < 0 || step >= totalWizardSteps) return;

    // Validar paso actual antes de avanzar
    if (step > currentWizardStep && !validarPasoActual()) {
        return;
    }

    // Limpiar mapa si se sale del paso 1
    if (currentWizardStep === 1 && step !== 1 && wizardMap) {
        wizardMap.remove();
        wizardMap = null;
        wizardMapMarker = null;
    }

    currentWizardStep = step;
    actualizarWizardUI();

    // Inicializar controles específicos del paso
    if (step === 3) {
        // Inicializar dimensionamiento cuando se entra al paso 3
        setTimeout(() => {
            inicializarWizardDimensionamiento();
        }, 100);
    } else if (step === 4) {
        // Inicializar selección de ángulo cuando se entra al paso 4
        setTimeout(() => {
            inicializarWizardAngulo();
        }, 100);
    } else if (step === 5) {
        // Inicializar pestañas de resultados cuando se entra al paso 5
        setTimeout(() => {
            inicializarWizardResultadosDetallados();
        }, 100);
    }

    // Scroll al inicio del contenido
    const content = document.querySelector('.modal-wizard-content');
    if (content) {
        content.scrollTop = 0;
    }
}

function validarPasoActual() {
    // Validar cada paso antes de avanzar
    switch (currentWizardStep) {
        case 1:
            // Validar ubicación seleccionada
            return ubicacionSeleccionada !== null;
        case 2:
            // Validar datos de factura
            return validarPaso2();
        case 3:
            // Validar y guardar dimensionamiento
            return validarPaso3();
        case 4:
            // Validar y guardar ángulo seleccionado
            return validarPaso4();
        default:
            return true;
    }
}

function validarPaso3() {
    const modoPorcentaje = document.getElementById('modePorcentaje');
    const modoPaneles = document.getElementById('modePaneles');

    if (modoPorcentaje && modoPorcentaje.checked) {
        wizardData.modoDimensionamiento = 'porcentaje';
        const sliderPorcentaje = document.getElementById('wizardPorcentajeCobertura');
        if (sliderPorcentaje) {
            wizardData.porcentajeCobertura = parseInt(sliderPorcentaje.value);
        }
        console.log('✅ Dimensionamiento por porcentaje:', wizardData.porcentajeCobertura + '%');
        return true;
    } else if (modoPaneles && modoPaneles.checked) {
        wizardData.modoDimensionamiento = 'paneles';
        const inputPaneles = document.getElementById('wizardNumPaneles');

        if (inputPaneles) {
            const numPaneles = parseInt(inputPaneles.value);
            console.log('🔍 Validando paneles - Input value:', inputPaneles.value, 'Parsed:', numPaneles);

            if (inputPaneles.value && !isNaN(numPaneles) && numPaneles > 0) {
                wizardData.numPaneles = numPaneles;
                console.log('✅ Dimensionamiento por paneles:', wizardData.numPaneles);
                return true;
            } else {
                mostrarNotificacion('⚠️ Por favor, ingresa un número válido de paneles', 'error');
                return false;
            }
        } else {
            console.error('❌ No se encontró el input wizardNumPaneles');
            mostrarNotificacion('⚠️ Error: campo de paneles no encontrado', 'error');
            return false;
        }
    } else {
        mostrarNotificacion('⚠️ Por favor, selecciona un modo de dimensionamiento', 'error');
        return false;
    }
}

function validarPaso4() {
    const anguloSeleccionado = document.querySelector('#wizardStep4 input[name="wizard_angulo"]:checked');
    if (anguloSeleccionado) {
        wizardData.inclinacion = parseInt(anguloSeleccionado.value);
        console.log('✅ Ángulo seleccionado:', wizardData.inclinacion + '°');
        return true;
    } else {
        mostrarNotificacion('⚠️ Por favor, selecciona un ángulo de instalación', 'error');
        return false;
    }
}

// Variables globales para el paso 2
let monedaSeleccionada = 'ARS';
let modoConsumo = 'aproximado';

// Inicializar wizard cuando se carga el modal
function inicializarWizardModal() {
    const btnPrev = document.getElementById('btnWizardPrev');
    const btnNext = document.getElementById('btnWizardNext');
    const btnIniciar = document.getElementById('btnIniciarSimulador');

    // Botón INICIO de la pantalla de introducción
    if (btnIniciar) {
        btnIniciar.addEventListener('click', () => {
            goToWizardStep(1);
        });
    }

    if (btnPrev) {
        btnPrev.addEventListener('click', () => {
            if (currentWizardStep > 0) {
                goToWizardStep(currentWizardStep - 1);
            }
        });
    }

    if (btnNext) {
        btnNext.addEventListener('click', async () => {
            if (currentWizardStep === 4) {
                // En el paso 4, calcular y avanzar a resultados
                if (validarPasoActual()) {
                    await calcularResultadosWizard();
                    goToWizardStep(5);
                }
            } else if (currentWizardStep === 1) {
                // En el paso 1, confirmar ubicación antes de avanzar
                if (ubicacionSeleccionada) {
                    const ubicacionOK = await confirmarUbicacionWizard();
                    if (ubicacionOK) {
                        goToWizardStep(currentWizardStep + 1);
                    }
                } else {
                    mostrarNotificacion('⚠️ Por favor selecciona una ubicación en el mapa', 'error');
                }
            } else if (currentWizardStep === 2) {
                // Validar paso 2 antes de avanzar
                if (validarPaso2()) {
                    goToWizardStep(currentWizardStep + 1);
                }
            } else if (currentWizardStep < totalWizardSteps - 1) {
                goToWizardStep(currentWizardStep + 1);
            }
        });
    }

    // Inicializar funcionalidad del paso 2
    inicializarPaso2();

    // Inicializar funcionalidad del paso 3
    inicializarPaso3Wizard();

    // Inicializar funcionalidad del paso 4
    inicializarPaso4Wizard();

    // Inicializar UI
    actualizarWizardUI();
}

function inicializarPaso2() {
    // Selector de moneda
    const currencyARS = document.getElementById('currencyARS');
    const currencyUSD = document.getElementById('currencyUSD');

    if (currencyARS) {
        currencyARS.addEventListener('click', () => cambiarMoneda('ARS'));
    }

    if (currencyUSD) {
        currencyUSD.addEventListener('click', () => cambiarMoneda('USD'));
    }

    // Selector de modo de consumo
    const modeAproximado = document.getElementById('modeAproximado');
    const modeEspecifico = document.getElementById('modeEspecifico');

    if (modeAproximado) {
        modeAproximado.addEventListener('click', () => cambiarModoConsumo('aproximado'));
    }

    if (modeEspecifico) {
        modeEspecifico.addEventListener('click', () => cambiarModoConsumo('especifico'));
    }
}

function cambiarMoneda(moneda) {
    monedaSeleccionada = moneda;
    wizardData.moneda = moneda; // Guardar en wizardData

    const currencyARS = document.getElementById('currencyARS');
    const currencyUSD = document.getElementById('currencyUSD');
    const priceCurrencyDisplay = document.getElementById('priceCurrencyDisplay');
    const precioKwhHelp = document.getElementById('precioKwhHelp');

    // Actualizar botones de moneda
    if (currencyARS) currencyARS.classList.toggle('active', moneda === 'ARS');
    if (currencyUSD) currencyUSD.classList.toggle('active', moneda === 'USD');

    // Actualizar display de moneda en precio
    if (priceCurrencyDisplay) {
        priceCurrencyDisplay.textContent = moneda;
    }

    // Actualizar texto de ayuda según moneda
    if (precioKwhHelp) {
        if (moneda === 'ARS') {
            precioKwhHelp.textContent = 'Precio actual aproximado: ~$180 ARS/kWh (Nov 2025)';
        } else {
            precioKwhHelp.textContent = 'Precio actual aproximado: ~$0.20 USD/kWh';
        }
    }
}

function cambiarModoConsumo(modo) {
    modoConsumo = modo;
    wizardData.modoConsumo = modo; // Guardar en wizardData

    const modeAproximado = document.getElementById('modeAproximado');
    const modeEspecifico = document.getElementById('modeEspecifico');
    const consumoAproximadoSection = document.getElementById('consumoAproximadoSection');
    const consumoEspecificoSection = document.getElementById('consumoEspecificoSection');

    // Actualizar botones
    if (modeAproximado) modeAproximado.classList.toggle('active', modo === 'aproximado');
    if (modeEspecifico) modeEspecifico.classList.toggle('active', modo === 'especifico');

    // Mostrar/ocultar secciones
    if (consumoAproximadoSection) {
        consumoAproximadoSection.style.display = modo === 'aproximado' ? 'block' : 'none';
    }

    if (consumoEspecificoSection) {
        consumoEspecificoSection.style.display = modo === 'especifico' ? 'block' : 'none';
    }
}

function validarPaso2() {
    if (modoConsumo === 'aproximado') {
        const consumoAprox = document.getElementById('consumoAproximado');
        if (!consumoAprox || !consumoAprox.value || parseFloat(consumoAprox.value) <= 0) {
            mostrarNotificacion('⚠️ Por favor, ingresa un consumo mensual válido', 'error');
            return false;
        }
        // Guardar en wizardData
        wizardData.consumoMensual = parseFloat(consumoAprox.value);
        wizardData.consumoMensualArray = [];
    } else {
        const inputsMensuales = document.querySelectorAll('.monthly-input');
        let tieneValores = false;
        const consumoArray = [];

        inputsMensuales.forEach(input => {
            const valor = parseFloat(input.value);
            if (input.value && valor > 0) {
                tieneValores = true;
                consumoArray.push(valor);
            } else {
                consumoArray.push(0);
            }
        });

        if (!tieneValores) {
            mostrarNotificacion('⚠️ Por favor, ingresa al menos un valor de consumo mensual', 'error');
            return false;
        }

        // Guardar en wizardData
        wizardData.consumoMensualArray = consumoArray;
        wizardData.consumoMensual = consumoArray.reduce((a, b) => a + b, 0) / 12; // Promedio
    }

    const precioKwh = document.getElementById('precioKwh');
    if (!precioKwh || !precioKwh.value || parseFloat(precioKwh.value) <= 0) {
        mostrarNotificacion('⚠️ Por favor, ingresa un precio por kWh válido', 'error');
        return false;
    }

    // Guardar en wizardData
    wizardData.precioKwh = parseFloat(precioKwh.value);

    console.log('✅ Datos de factura guardados:', {
        moneda: wizardData.moneda,
        modoConsumo: wizardData.modoConsumo,
        consumoMensual: wizardData.consumoMensual,
        precioKwh: wizardData.precioKwh
    });

    return true;
}

function inicializarPaso3Wizard() {
    // Hacer las tarjetas clicables
    document.querySelectorAll('#wizardStep3 .dimensionamiento-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // No activar si se hace clic en un input o botón dentro
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('input')) {
                return;
            }

            const mode = this.dataset.mode;
            const radio = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
            if (radio) {
                radio.checked = true;
                cambiarModoDimensionamientoWizard(mode);
            }
        });
    });

    // Event listeners para los radio buttons
    const radioPorcentaje = document.getElementById('modePorcentaje');
    const radioPaneles = document.getElementById('modePaneles');

    if (radioPorcentaje) {
        radioPorcentaje.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamientoWizard('porcentaje');
        });
    }

    if (radioPaneles) {
        radioPaneles.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamientoWizard('paneles');
        });
    }

    // Slider de porcentaje
    const sliderPorcentaje = document.getElementById('wizardPorcentajeCobertura');
    if (sliderPorcentaje) {
        sliderPorcentaje.addEventListener('input', function () {
            document.getElementById('wizardPorcentajeDisplay').textContent = this.value + '%';
        });
    }

    // Botones +/- para paneles
    const btnMenos = document.querySelector('#wizardControlPaneles .paneles-btn-minus');
    const btnMas = document.querySelector('#wizardControlPaneles .paneles-btn-plus');
    const inputPaneles = document.getElementById('wizardNumPaneles');

    if (btnMenos) {
        btnMenos.addEventListener('click', function () {
            const valor = parseInt(inputPaneles.value) || 1;
            if (valor > 1) {
                inputPaneles.value = valor - 1;
            }
        });
    }

    if (btnMas) {
        btnMas.addEventListener('click', function () {
            const valor = parseInt(inputPaneles.value) || 1;
            inputPaneles.value = valor + 1;
        });
    }

    if (inputPaneles) {
        inputPaneles.addEventListener('input', function () {
            if (this.value < 1) this.value = 1;
        });
    }
}

function inicializarPaso4Wizard() {
    // Event listeners para los radio buttons de ángulo
    const radio20 = document.getElementById('wizardAngulo20');
    const radio45 = document.getElementById('wizardAngulo45');

    if (radio20) {
        radio20.addEventListener('change', function () {
            if (this.checked) {
                console.log('Ángulo seleccionado: 20°');
            }
        });
    }

    if (radio45) {
        radio45.addEventListener('change', function () {
            if (this.checked) {
                console.log('Ángulo seleccionado: 45°');
            }
        });
    }
}

// ============================================
// Calcular Resultados del Wizard
// ============================================

async function calcularResultadosWizard() {
    console.log('🔄 Calculando resultados del wizard...');
    console.log('📊 Datos recopilados:', wizardData);

    try {
        // Preparar objeto de datos para las funciones de cálculo existentes
        const datos = {
            lat: wizardData.lat,
            lon: wizardData.lon,
            ubicacion: wizardData.ubicacionNombre,
            psh: wizardData.psh || DATOS_EJEMPLO.psh,
            temperatura: wizardData.temperatura || DATOS_EJEMPLO.temperatura,
            inclinacion: wizardData.inclinacion,
            consumo_mensual: wizardData.consumoMensual,
            precio_kwh: wizardData.precioKwh,
            costo_panel: MODELO_CLUSTER.constantes.costo_por_panel,
            modo_dimensionamiento: wizardData.modoDimensionamiento,
            porcentaje_cobertura: wizardData.porcentajeCobertura,
            num_paneles: wizardData.numPaneles
        };

        // Calcular generación mensual usando el modelo existente
        const generacionMensual = calcularGeneracionMensual(datos);
        console.log('✅ Generación mensual calculada:', generacionMensual);

        // Calcular resultados finales
        const resultados = calcularResultados(datos, generacionMensual);
        console.log('✅ Resultados calculados:', resultados);

        // Mostrar resultados en el paso 5
        mostrarResultadosWizard(resultados, generacionMensual, datos);

        console.log('✅ Cálculo completado exitosamente');

    } catch (error) {
        console.error('❌ Error al calcular resultados:', error);
        mostrarNotificacion('⚠️ Error al calcular los resultados. Por favor intenta nuevamente.', 'error');
    }
}

// ============================================
// Inicializar Sección de Dimensionamiento
// ============================================

function inicializarDimensionamiento() {
    // Hacer las tarjetas clicables
    document.querySelectorAll('.dimensionamiento-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // No activar si se hace clic en un input o botón dentro
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.closest('button') || e.target.closest('input')) {
                return;
            }

            const mode = this.dataset.mode;
            const radio = document.getElementById(`mode${mode.charAt(0).toUpperCase() + mode.slice(1)}`);
            if (radio) {
                radio.checked = true;
                cambiarModoDimensionamiento(mode);
            }
        });
    });

    // Radio buttons para cambiar modo
    const radioPorcentaje = document.getElementById('modePorcentaje');
    const radioPaneles = document.getElementById('modePaneles');

    if (radioPorcentaje) {
        radioPorcentaje.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamiento('porcentaje');
        });
    }

    if (radioPaneles) {
        radioPaneles.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamiento('paneles');
        });
    }

    // Slider de porcentaje
    const sliderPorcentaje = document.getElementById('porcentaje_cobertura');
    if (sliderPorcentaje) {
        sliderPorcentaje.addEventListener('input', actualizarDisplayCobertura);
        sliderPorcentaje.addEventListener('change', actualizarDisplayCobertura);
    }

    // Botones rápidos de porcentaje
    document.querySelectorAll('.cobertura-badge').forEach(badge => {
        badge.addEventListener('click', function () {
            const valor = parseInt(this.dataset.value);
            if (sliderPorcentaje) {
                sliderPorcentaje.value = valor;
                actualizarDisplayCobertura();
            }
            // Actualizar estado activo
            document.querySelectorAll('.cobertura-badge').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Botones +/- de paneles
    const btnMenos = document.getElementById('btnMenosPanel');
    const btnMas = document.getElementById('btnMasPanel');
    const inputPaneles = document.getElementById('num_paneles_manual');

    if (btnMenos) {
        btnMenos.addEventListener('click', function () {
            const valor = parseInt(inputPaneles.value) || 1;
            if (valor > 1) {
                inputPaneles.value = valor - 1;
                actualizarPanelesPreview();
            }
        });
    }

    if (btnMas) {
        btnMas.addEventListener('click', function () {
            const valor = parseInt(inputPaneles.value) || 1;
            inputPaneles.value = valor + 1;
            actualizarPanelesPreview();
        });
    }

    if (inputPaneles) {
        inputPaneles.addEventListener('input', function () {
            if (this.value < 1) this.value = 1;
            actualizarPanelesPreview();
        });
        inputPaneles.addEventListener('change', actualizarPanelesPreview);
    }

    // Botones rápidos de paneles
    document.querySelectorAll('.paneles-quick-btn').forEach(btn => {
        btn.addEventListener('click', function () {
            const cantidad = parseInt(this.dataset.paneles);
            if (inputPaneles) {
                inputPaneles.value = cantidad;
                actualizarPanelesPreview();
            }
            // Actualizar estado activo
            document.querySelectorAll('.paneles-quick-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });

    // Inicializar display
    actualizarDisplayCobertura();

    // Marcar la tarjeta activa inicialmente
    const cardPorcentaje = document.querySelector('.dimensionamiento-option-card[data-mode="porcentaje"]');
    if (cardPorcentaje) {
        cardPorcentaje.classList.add('active');
    }
}

function cambiarModoDimensionamiento(mode) {
    modoDimensionamiento = mode;

    const controlPorcentaje = document.getElementById('controlPorcentaje');
    const controlPaneles = document.getElementById('controlPaneles');
    const cardPorcentaje = document.querySelector('.dimensionamiento-option-card[data-mode="porcentaje"]');
    const cardPaneles = document.querySelector('.dimensionamiento-option-card[data-mode="paneles"]');

    if (mode === 'porcentaje') {
        if (controlPorcentaje) controlPorcentaje.style.display = 'block';
        if (controlPaneles) controlPaneles.style.display = 'none';
        if (cardPorcentaje) cardPorcentaje.classList.add('active');
        if (cardPaneles) cardPaneles.classList.remove('active');
    } else {
        if (controlPorcentaje) controlPorcentaje.style.display = 'none';
        if (controlPaneles) controlPaneles.style.display = 'block';
        if (cardPorcentaje) cardPorcentaje.classList.remove('active');
        if (cardPaneles) cardPaneles.classList.add('active');
        actualizarPanelesPreview();
    }
}

function actualizarDisplayCobertura() {
    const slider = document.getElementById('porcentaje_cobertura');
    const display = document.getElementById('cobertura_value');

    if (slider && display) {
        const valor = parseInt(slider.value);
        display.textContent = `${valor}%`;
    }
}

function actualizarPanelesPreview() {
    const inputPaneles = document.getElementById('num_paneles_manual');
    const previewValue = document.getElementById('panelesPreviewValue');

    if (!inputPaneles || !previewValue) return;

    const numPaneles = parseInt(inputPaneles.value) || 1;

    // Obtener datos temporales para calcular
    try {
        const datosTemp = obtenerDatosFormulario();

        // Verificar que tengamos datos climáticos
        if (!datosTemp.psh || datosTemp.psh.length === 0 || datosTemp.psh.some(p => !p || isNaN(p))) {
            previewValue.textContent = 'Completa los datos climáticos';
            return;
        }

        // Calcular generación mensual
        const generacionMensual = calcularGeneracionMensual(datosTemp);
        const energiaAnualPorPanel = generacionMensual.reduce((sum, mes) => sum + mes.energia_mensual, 0);
        const energiaAnualTotal = energiaAnualPorPanel * numPaneles;

        // Calcular cobertura
        const consumoMensual = parseFloat(document.getElementById('consumo').value) || 350;
        const energiaAnualRequerida = consumoMensual * 12;
        const cobertura = (energiaAnualTotal / energiaAnualRequerida) * 100;

        previewValue.textContent = `${Math.min(cobertura, 100).toFixed(0)}%`;
    } catch (error) {
        previewValue.textContent = 'Completa los datos climáticos';
    }
}

// ============================================
// Funciones para el Wizard - Dimensionamiento
// ============================================

function cambiarModoDimensionamientoWizard(mode) {
    wizardData.modoDimensionamiento = mode; // Guardar en wizardData

    const controlPorcentaje = document.getElementById('wizardControlPorcentaje');
    const controlPaneles = document.getElementById('wizardControlPaneles');
    const cardPorcentaje = document.querySelector('#wizardStep3 .dimensionamiento-option-card[data-mode="porcentaje"]');
    const cardPaneles = document.querySelector('#wizardStep3 .dimensionamiento-option-card[data-mode="paneles"]');

    if (mode === 'porcentaje') {
        if (controlPorcentaje) controlPorcentaje.style.display = 'block';
        if (controlPaneles) controlPaneles.style.display = 'none';
        if (cardPorcentaje) cardPorcentaje.classList.add('active');
        if (cardPaneles) cardPaneles.classList.remove('active');
    } else {
        if (controlPorcentaje) controlPorcentaje.style.display = 'none';
        if (controlPaneles) controlPaneles.style.display = 'block';
        if (cardPorcentaje) cardPorcentaje.classList.remove('active');
        if (cardPaneles) cardPaneles.classList.add('active');
        actualizarPanelesPreviewWizard();
    }
}

function actualizarDisplayCoberturaWizard() {
    const slider = document.getElementById('wizardPorcentajeCobertura');
    const display = document.getElementById('wizardCoberturaValue');

    if (slider && display) {
        const valor = parseInt(slider.value);
        display.textContent = `${valor}%`;
    }
}

function actualizarPanelesPreviewWizard() {
    const inputPaneles = document.getElementById('wizardNumPanelesManual');
    const previewValue = document.getElementById('wizardPanelesPreviewValue');

    if (!inputPaneles || !previewValue) return;

    const numPaneles = parseInt(inputPaneles.value) || 1;

    // Obtener datos del wizard para calcular
    try {
        // Obtener consumo del paso 2
        const consumoAproximado = document.getElementById('consumoAproximado');
        const consumoMensualInputs = document.querySelectorAll('#wizardStep2 .monthly-input');

        let consumoMensual = 350; // Default

        if (consumoAproximado && consumoAproximado.value) {
            consumoMensual = parseFloat(consumoAproximado.value);
        } else if (consumoMensualInputs.length > 0) {
            // Calcular promedio de consumo mensual
            let total = 0;
            let count = 0;
            consumoMensualInputs.forEach(input => {
                const val = parseFloat(input.value);
                if (val && val > 0) {
                    total += val;
                    count++;
                }
            });
            if (count > 0) {
                consumoMensual = total / count;
            }
        }

        // Obtener datos climáticos de la ubicación seleccionada
        if (!ubicacionSeleccionada || !ubicacionSeleccionada.psh) {
            previewValue.textContent = 'Completa los pasos anteriores';
            return;
        }

        // Calcular generación mensual (simplificado)
        const pshPromedio = ubicacionSeleccionada.psh.reduce((a, b) => a + b, 0) / 12;
        const potenciaPanel = 190; // W
        const energiaMensualPorPanel = (potenciaPanel * pshPromedio * 30) / 1000; // kWh
        const energiaAnualPorPanel = energiaMensualPorPanel * 12;
        const energiaAnualTotal = energiaAnualPorPanel * numPaneles;

        // Calcular cobertura
        const energiaAnualRequerida = consumoMensual * 12;
        const cobertura = (energiaAnualTotal / energiaAnualRequerida) * 100;

        previewValue.textContent = `${Math.min(cobertura, 100).toFixed(0)}%`;
    } catch (error) {
        previewValue.textContent = 'Completa los pasos anteriores';
    }
}

function inicializarWizardDimensionamiento() {
    // Radio buttons para cambiar modo
    const radioPorcentaje = document.getElementById('wizardModePorcentaje');
    const radioPaneles = document.getElementById('wizardModePaneles');

    if (radioPorcentaje) {
        radioPorcentaje.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamientoWizard('porcentaje');
        });
    }

    if (radioPaneles) {
        radioPaneles.addEventListener('change', function () {
            if (this.checked) cambiarModoDimensionamientoWizard('paneles');
        });
    }

    // Slider de porcentaje
    const sliderPorcentaje = document.getElementById('wizardPorcentajeCobertura');
    if (sliderPorcentaje) {
        sliderPorcentaje.addEventListener('input', actualizarDisplayCoberturaWizard);
        sliderPorcentaje.addEventListener('change', actualizarDisplayCoberturaWizard);
    }

    // Botones +/- de paneles
    const btnMenos = document.getElementById('wizardBtnMenosPanel');
    const btnMas = document.getElementById('wizardBtnMasPanel');
    const inputPaneles = document.getElementById('wizardNumPanelesManual');

    if (btnMenos) {
        btnMenos.addEventListener('click', function () {
            const valor = parseInt(inputPaneles.value) || 1;
            if (valor > 1) {
                inputPaneles.value = valor - 1;
            }
        });
    }

    if (btnMas) {
        btnMas.addEventListener('click', function () {
            const valor = parseInt(inputPaneles.value) || 1;
            inputPaneles.value = valor + 1;
        });
    }

    if (inputPaneles) {
        inputPaneles.addEventListener('input', function () {
            if (this.value < 1) this.value = 1;
        });
    }

    // Click en las tarjetas para cambiar modo
    document.querySelectorAll('#wizardStep3 .dimensionamiento-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // No cambiar si se hace click en un input o botón dentro
            if (e.target.closest('input, button, .option-content')) return;

            const mode = this.dataset.mode;
            if (mode === 'porcentaje' && radioPorcentaje) {
                radioPorcentaje.checked = true;
                cambiarModoDimensionamientoWizard('porcentaje');
            } else if (mode === 'paneles' && radioPaneles) {
                radioPaneles.checked = true;
                cambiarModoDimensionamientoWizard('paneles');
            }
        });
    });

    // Inicializar display
    actualizarDisplayCoberturaWizard();

    // Marcar la tarjeta activa inicialmente
    const cardPorcentaje = document.querySelector('#wizardStep3 .dimensionamiento-option-card[data-mode="porcentaje"]');
    if (cardPorcentaje) {
        cardPorcentaje.classList.add('active');
    }
}

// ============================================
// Funciones para el Wizard - Ángulo de Instalación
// ============================================

function inicializarWizardAngulo() {
    // Radio buttons para cambiar ángulo
    const radio20 = document.getElementById('wizardAngulo20');
    const radio45 = document.getElementById('wizardAngulo45');

    if (radio20) {
        radio20.addEventListener('change', function () {
            if (this.checked) cambiarAnguloWizard(20);
        });
    }

    if (radio45) {
        radio45.addEventListener('change', function () {
            if (this.checked) cambiarAnguloWizard(45);
        });
    }

    // Click en las tarjetas para cambiar ángulo
    document.querySelectorAll('#wizardStep4 .angulo-option-card').forEach(card => {
        card.addEventListener('click', function (e) {
            // No cambiar si se hace click en un input dentro
            if (e.target.closest('input')) return;

            const angulo = parseInt(this.dataset.angulo);
            if (angulo === 20 && radio20) {
                radio20.checked = true;
                cambiarAnguloWizard(20);
            } else if (angulo === 45 && radio45) {
                radio45.checked = true;
                cambiarAnguloWizard(45);
            }
        });
    });

    // Marcar la tarjeta activa inicialmente (45° por defecto)
    const card45 = document.querySelector('#wizardStep4 .angulo-option-card[data-angulo="45"]');
    if (card45) {
        card45.classList.add('active');
    }
}

function cambiarAnguloWizard(angulo) {
    const card20 = document.querySelector('#wizardStep4 .angulo-option-card[data-angulo="20"]');
    const card45 = document.querySelector('#wizardStep4 .angulo-option-card[data-angulo="45"]');

    if (angulo === 20) {
        if (card20) card20.classList.add('active');
        if (card45) card45.classList.remove('active');
    } else {
        if (card20) card20.classList.remove('active');
        if (card45) card45.classList.add('active');
    }
}

// ============================================
// Funciones para el Wizard - Resultados
// ============================================
// Nota: La función calcularResultadosWizard() ya maneja todo el cálculo

function mostrarResultadosWizard(resultados, generacionMensual, datos) {
    // Guardar resultados globalmente para la función de impresión
    window.wizardResultados = resultados;
    window.ultimaGeneracionMensual = generacionMensual;
    window.wizardDatos = datos;

    // Mostrar Panorama General (Solapa 1)
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    // 1. Ahorro Mensual Estimado
    const panoramaAhorroMensual = document.getElementById('wizardPanoramaAhorroMensual');
    if (panoramaAhorroMensual) {
        panoramaAhorroMensual.textContent = `${simbolo}${formatearNumero(resultados.ahorro_mensual, moneda)}`;
    }

    // 2. Tiempo de Repago (ROI)
    const panoramaROI = document.getElementById('wizardPanoramaROI');
    if (panoramaROI) {
        if (resultados.roi_anos === Infinity || isNaN(resultados.roi_anos)) {
            panoramaROI.textContent = 'N/A';
        } else {
            panoramaROI.textContent = `${resultados.roi_anos.toFixed(1)} años`;
        }
    }

    // 3. % de Autoconsumo
    const panoramaAutoconsumo = document.getElementById('wizardPanoramaAutoconsumo');
    if (panoramaAutoconsumo) {
        // Mostrar la cobertura real calculada basada en la generación de los paneles recomendados
        // No limitamos a 100% para mostrar si hay excedentes, o si el usuario prefiere ver la cobertura real
        const porcentajeCobertura = resultados.cobertura;
        panoramaAutoconsumo.textContent = `${porcentajeCobertura.toFixed(0)}%`;
    }

    // Veredicto Rápido
    const veredictoRapido = document.getElementById('wizardVeredictoRapido');
    if (veredictoRapido) {
        const pshPromedio = datos.psh.reduce((a, b) => a + b, 0) / datos.psh.length;
        let veredicto = '';
        if (pshPromedio >= 5.5) {
            veredicto = '¡Excelente ubicación! Tu techo tiene un potencial solar alto.';
        } else if (pshPromedio >= 4.5) {
            veredicto = 'Buena ubicación. Tu techo tiene un potencial solar favorable.';
        } else {
            veredicto = 'Ubicación aceptable. El sistema solar puede ser una buena inversión.';
        }
        veredictoRapido.textContent = veredicto;
    }

    // Guardar resultados para la vista detallada
    window.wizardResultados = resultados;
    window.wizardGeneracionMensual = generacionMensual;
    window.wizardDatos = datos;

    console.log('📊 Guardando datos globales para pestañas:', {
        resultados: window.wizardResultados,
        generacionMensual: window.wizardGeneracionMensual,
        datos: window.wizardDatos
    });

    // Llenar datos de otras solapas (solo texto, no gráficos)
    llenarDatosAnalisisEnergetico(resultados, generacionMensual, datos);
    llenarDatosInstalacion(resultados, datos);

    // Los gráficos se generarán cuando el usuario haga clic en cada pestaña
    // (Chart.js necesita que el canvas esté visible)
}

function llenarDatosAnalisisEnergetico(resultados, generacionMensual, datos) {
    console.log('📝 Llenando datos de Análisis Energético:', { resultados, generacionMensual, datos });

    // Radiación promedio
    const radiacionPromedio = document.getElementById('wizardRadiacionPromedio');
    if (radiacionPromedio) {
        const pshPromedio = datos.psh.reduce((a, b) => a + b, 0) / datos.psh.length;
        radiacionPromedio.textContent = `${pshPromedio.toFixed(2)} kWh/m²/día`;
        console.log('✅ Radiación promedio:', pshPromedio.toFixed(2));
    } else {
        console.error('❌ No se encontró elemento wizardRadiacionPromedio');
    }

    // Ubicación
    const ubicacionNombre = document.getElementById('wizardUbicacionNombre');
    if (ubicacionNombre) {
        ubicacionNombre.textContent = datos.ubicacion || wizardData.ubicacionNombre || 'Ubicación seleccionada';
    }

    // Pérdidas por temperatura
    const perdidasTemperatura = document.getElementById('wizardPerdidasTemperatura');
    if (perdidasTemperatura) {
        const tempPromedio = datos.temperatura.reduce((a, b) => a + b, 0) / datos.temperatura.length;
        // Pérdidas aproximadas: -0.4% por cada °C por encima de 25°C
        const perdidas = Math.max(0, (tempPromedio - 25) * 0.4);
        perdidasTemperatura.textContent = `${perdidas.toFixed(1)}%`;
    }

    // Energía consumida e inyectada
    const energiaConsumida = document.getElementById('wizardEnergiaConsumida');
    const energiaInyectada = document.getElementById('wizardEnergiaInyectada');
    if (energiaConsumida && energiaInyectada) {
        const consumoAnual = (datos.consumo_mensual || datos.consumo) * 12;
        const energiaAnual = resultados.energia_anual_total || resultados.generacion_anual || 0;
        const excedentes = Math.max(0, energiaAnual - consumoAnual);
        energiaConsumida.textContent = `${consumoAnual.toFixed(0)} kWh`;
        energiaInyectada.textContent = `${excedentes.toFixed(0)} kWh`;
    }
}

function llenarDatosInstalacion(resultados, datos) {
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    // === PRODUCTOS (nueva sección) ===
    // Producto 1: Paneles (190W por panel)
    const productPanelesCantidad = document.getElementById('wizardProductPanelesCantidad');
    const productPotenciaTotal = document.getElementById('wizardProductPotenciaTotal');
    if (productPanelesCantidad) {
        productPanelesCantidad.textContent = resultados.num_paneles;
    }
    if (productPotenciaTotal) {
        const potenciaKW = (resultados.num_paneles * 0.19).toFixed(2); // 190W = 0.19kW por panel
        productPotenciaTotal.textContent = potenciaKW;
    }

    // Producto 2: Inversor 360solar
    const productInversorPotencia = document.getElementById('wizardProductInversorPotencia');
    if (productInversorPotencia) {
        const potenciaKW = (resultados.num_paneles * 0.19).toFixed(2); // 190W por panel
        productInversorPotencia.textContent = potenciaKW;
    }

    // Producto 3: Estructura/Soporte
    const productEstructuraTipo = document.getElementById('wizardProductEstructuraTipo');
    const productInclinacion = document.getElementById('wizardProductInclinacion');
    const productSoporteImagen = document.getElementById('wizardProductSoporteImagen');

    if (productInclinacion) {
        productInclinacion.textContent = datos.inclinacion;
    }

    if (productEstructuraTipo) {
        if (datos.inclinacion === 20) {
            productEstructuraTipo.textContent = 'Aluminio Anodizado (Coplanar)';
        } else {
            productEstructuraTipo.textContent = 'Aluminio Anodizado (Triángulo)';
        }
    }

    if (productSoporteImagen) {
        // Mostrar imagen según ángulo seleccionado
        if (datos.inclinacion === 20) {
            productSoporteImagen.src = 'images/soporte20.png';
        } else {
            productSoporteImagen.src = 'images/soporte45.png';
        }
        productSoporteImagen.alt = `Estructura de soporte a ${datos.inclinacion}°`;
    }

    // === BOM (mantener si sigue existiendo en el HTML) ===
    // BOM - Paneles
    const bomPanelesCantidad = document.getElementById('wizardBomPanelesCantidad');
    const bomPanelesModelo = document.getElementById('wizardBomPanelesModelo');
    if (bomPanelesCantidad) {
        bomPanelesCantidad.textContent = `${resultados.num_paneles}x`;
    }
    if (bomPanelesModelo) {
        bomPanelesModelo.textContent = 'Jinko/Longi 450W';
    }

    // BOM - Inversor
    const bomInversorModelo = document.getElementById('wizardBomInversorModelo');
    if (bomInversorModelo) {
        const potenciaKW = (resultados.num_paneles * 0.45).toFixed(1);
        bomInversorModelo.textContent = `Growatt/Huawei ${potenciaKW}kW`;
    }

    // BOM - Estructura
    const bomEstructuraTipo = document.getElementById('wizardBomEstructuraTipo');
    if (bomEstructuraTipo) {
        if (datos.inclinacion === 20) {
            bomEstructuraTipo.textContent = 'Aluminio Anodizado (Coplanar)';
        } else {
            bomEstructuraTipo.textContent = 'Aluminio Anodizado (Triángulo)';
        }
    }

    // Espacio requerido
    const espacioRequerido = document.getElementById('wizardEspacioRequerido');
    if (espacioRequerido) {
        const superficie = resultados.num_paneles * 1.5; // m² aproximado
        espacioRequerido.textContent = `${superficie.toFixed(1)} m²`;
    }

    // Diagrama de techo
    const techoArea = document.getElementById('wizardTechoArea');
    if (techoArea) {
        const superficie = resultados.num_paneles * 1.5;
        // Establecer tamaño visual proporcional (máximo 100%)
        const porcentaje = Math.min(100, (superficie / 50) * 100); // Asumiendo techo de 50m² como referencia
        techoArea.style.width = `${porcentaje}%`;
        techoArea.style.height = `${porcentaje}%`;
    }
}

function inicializarWizardResultadosDetallados() {
    // Las pestañas están siempre visibles desde el inicio
    const tabsContainer = document.getElementById('wizardResultsTabsContainer');
    const tabPanorama = document.getElementById('wizardTabPanorama');
    const tabEnergia = document.getElementById('wizardTabEnergia');
    const tabFinanzas = document.getElementById('wizardTabFinanzas');
    const tabInstalacion = document.getElementById('wizardTabInstalacion');

    // Mostrar pestañas desde el inicio
    if (tabsContainer) {
        tabsContainer.style.display = 'block';
    }

    // Cargar datos detallados si ya existen
    if (window.wizardResultados) {
        llenarVistaDetalladaWizard();
    }

    // Tabs de resultados (4 pestañas: panorama, energia, finanzas, instalacion)
    const tabs = document.querySelectorAll('#wizardStep5 .wizard-result-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.dataset.tab;

            // Actualizar tabs activos
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // Ocultar todos los panes explícitamente
            if (tabPanorama) {
                tabPanorama.style.display = 'none';
                tabPanorama.classList.remove('active');
            }
            if (tabEnergia) {
                tabEnergia.style.display = 'none';
                tabEnergia.classList.remove('active');
            }
            if (tabFinanzas) {
                tabFinanzas.style.display = 'none';
                tabFinanzas.classList.remove('active');
            }
            if (tabInstalacion) {
                tabInstalacion.style.display = 'none';
                tabInstalacion.classList.remove('active');
            }

            // Mostrar el pane correspondiente
            let targetPane = null;
            if (tabName === 'panorama') {
                targetPane = tabPanorama;
            } else if (tabName === 'energia') {
                targetPane = tabEnergia;
            } else if (tabName === 'finanzas') {
                targetPane = tabFinanzas;
            } else if (tabName === 'instalacion') {
                targetPane = tabInstalacion;
            }

            if (targetPane) {
                targetPane.style.display = 'block';
                targetPane.classList.add('active');
                // Asegurar que solo este pane esté visible
                console.log('📌 Mostrando tab:', tabName, 'Ocultando otros tabs');
            }

            // Cargar gráficos cuando la pestaña se hace visible
            if (tabName === 'energia' && window.wizardGeneracionMensual) {
                // Asegurar que el tab esté visible primero
                if (targetPane) {
                    targetPane.style.display = 'block';
                    targetPane.classList.add('active');
                    // Forzar que todos los padres estén visibles
                    let parent = targetPane.parentElement;
                    while (parent && parent !== document.body) {
                        if (window.getComputedStyle(parent).display === 'none') {
                            parent.style.display = 'block';
                        }
                        parent = parent.parentElement;
                    }
                }

                // Esperar a que el navegador renderice el cambio
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            console.log('📊 Pestaña Energía activada, generando gráficos...');
                            // Destruir gráficos anteriores si existen
                            if (wizardMonthlyChart) {
                                wizardMonthlyChart.destroy();
                                wizardMonthlyChart = null;
                            }
                            if (wizardDistributionChart) {
                                wizardDistributionChart.destroy();
                                wizardDistributionChart = null;
                            }
                            generarGraficaMensualWizard();
                            generarGraficaDistribucionWizard();
                        }, 100);
                    });
                });
            } else if (tabName === 'finanzas' && window.wizardResultados) {
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        console.log('💰 Pestaña Finanzas activada, generando gráfico...');
                        // Destruir gráfico anterior si existe
                        if (wizardFinancialChart) {
                            wizardFinancialChart.destroy();
                            wizardFinancialChart = null;
                        }
                        generarGraficaFinancieraWizard();
                        llenarTablaAhorroAcumulado();
                    }, 50);
                });
            } else if (tabName === 'instalacion') {
                actualizarImagenInstalacion();
            }
        });
    });

    // Input de inflación para actualizar gráfico financiero
    const inflacionInput = document.getElementById('wizardInflacionInput');
    const btnRecalcular = document.getElementById('wizardBtnRecalcular');

    if (btnRecalcular) {
        btnRecalcular.addEventListener('click', function () {
            const inflacion = parseFloat(inflacionInput?.value || 3) / 100;
            if (window.wizardResultados) {
                generarGraficaFinancieraWizard(inflacion);
                llenarTablaAhorroAcumulado(inflacion);
            }
        });
    }
}

function llenarVistaDetalladaWizard() {
    if (!window.wizardResultados || !window.wizardDatos) return;

    const resultados = window.wizardResultados;
    const datos = window.wizardDatos;
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    // Finanzas
    const detailROI = document.getElementById('wizardDetailROI');
    if (detailROI) {
        if (resultados.roi_anos === Infinity || isNaN(resultados.roi_anos)) {
            detailROI.textContent = 'N/A';
        } else {
            detailROI.textContent = `${resultados.roi_anos.toFixed(1)} años`;
        }
    }

    const detailCostoBase = document.getElementById('wizardDetailCostoBase');
    if (detailCostoBase) {
        detailCostoBase.textContent = `${simbolo}${formatearNumero(resultados.costo_base, moneda)}`;
    }

    const detailCostoPaneles = document.getElementById('wizardDetailCostoPaneles');
    if (detailCostoPaneles) {
        detailCostoPaneles.textContent = `${simbolo}${formatearNumero(resultados.costo_paneles, moneda)}`;
    }

    const detailCostoTotal = document.getElementById('wizardDetailCostoTotal');
    if (detailCostoTotal) {
        detailCostoTotal.textContent = `${simbolo}${formatearNumero(resultados.costo_total || resultados.inversion_total, moneda)}`;
    }

    // Calcular ahorro a 25 años con inflación del 3% anual
    const detailAhorro25 = document.getElementById('wizardDetailAhorro25');
    if (detailAhorro25) {
        let ahorroTotal25 = 0;
        let ahorroAnualActual = resultados.ahorro_anual || 0;
        for (let i = 1; i <= 25; i++) {
            ahorroTotal25 += ahorroAnualActual;
            ahorroAnualActual *= 1.03; // 3% inflación anual
        }
        detailAhorro25.textContent = `${simbolo}${formatearNumero(ahorroTotal25, moneda)}`;
    }

    // Energía - Balance Energético
    const balanceGeneracion = document.getElementById('wizardBalanceGeneracion');
    if (balanceGeneracion) {
        const energiaAnual = resultados.energia_anual_total || resultados.generacion_anual || 0;
        balanceGeneracion.textContent = `${energiaAnual.toFixed(0)} kWh`;
    }

    const balanceInyectado = document.getElementById('wizardBalanceInyectado');
    if (balanceInyectado) {
        const consumoAnual = (datos.consumo_mensual || datos.consumo) * 12;
        const energiaAnual = resultados.energia_anual_total || resultados.generacion_anual || 0;
        const excedentes = Math.max(0, energiaAnual - consumoAnual);
        balanceInyectado.textContent = `${excedentes.toFixed(0)} kWh`;
    }

    // Equipamiento
    const equipPanelModelo = document.getElementById('wizardEquipPanelModelo');
    if (equipPanelModelo) {
        equipPanelModelo.textContent = 'Panel de Referencia 190W';
    }

    const equipPanelCantidad = document.getElementById('wizardEquipPanelCantidad');
    if (equipPanelCantidad) {
        equipPanelCantidad.textContent = resultados.num_paneles;
    }

    const equipPanelPotencia = document.getElementById('wizardEquipPanelPotencia');
    if (equipPanelPotencia) {
        equipPanelPotencia.textContent = `${(resultados.num_paneles * 190 / 1000).toFixed(1)} kW`;
    }

    const equipSuperficie = document.getElementById('wizardEquipSuperficie');
    if (equipSuperficie) {
        const superficie = resultados.num_paneles * 1.5; // m² aproximado
        equipSuperficie.textContent = `${superficie.toFixed(1)} m²`;
    }

    const equipInclinacion = document.getElementById('wizardEquipInclinacion');
    if (equipInclinacion) {
        equipInclinacion.textContent = `${datos.inclinacion}°`;
    }

    const equipEstructura = document.getElementById('wizardEquipEstructura');
    if (equipEstructura) {
        if (datos.inclinacion === 20) {
            equipEstructura.textContent = 'Coplanar (20°) - Sin soportes adicionales, menor carga de viento';
        } else {
            equipEstructura.textContent = 'Inclinada (45°) - Requiere soportes triangulares para elevar los paneles';
        }
    }

    const equipPanelPrecio = document.getElementById('wizardEquipPanelPrecio');
    if (equipPanelPrecio) {
        equipPanelPrecio.textContent = `${simbolo}${formatearNumero(resultados.costo_panel, moneda)}`;
    }

    // Tabla mensual
    llenarTablaMensualWizard();
}

function llenarTablaMensualWizard() {
    if (!window.wizardGeneracionMensual || !window.wizardDatos) return;

    const tbody = document.getElementById('wizardMonthlyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

    const generacionMensual = window.wizardGeneracionMensual;
    const numPaneles = (window.wizardResultados && window.wizardResultados.num_paneles) ? window.wizardResultados.num_paneles : 1;
    const consumoMensualBase = window.wizardDatos.consumo_mensual || window.wizardDatos.consumo || 350;

    // Usar exactamente la misma lógica de consumos que el gráfico mensual
    let consumos;
    if (typeof wizardData !== 'undefined' && wizardData.modoConsumo === 'especifico' && wizardData.consumoMensualArray && wizardData.consumoMensualArray.length === 12) {
        consumos = wizardData.consumoMensualArray;
    } else {
        consumos = new Array(12).fill(consumoMensualBase);
    }

    generacionMensual.forEach((mes, index) => {
        const energia = mes.energia_mensual * numPaneles;
        const consumo = consumos[index];
        const balance = energia - consumo;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${meses[index]}</td>
            <td>${energia.toFixed(1)}</td>
            <td>${consumo.toFixed(1)}</td>
            <td style="color: ${balance >= 0 ? '#2ecc71' : '#e74c3c'}; font-weight: 600;">
                ${balance >= 0 ? '+' : ''}${balance.toFixed(1)}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Variables globales para gráficos del wizard
let wizardMonthlyChart = null;
let wizardFinancialChart = null;
let wizardDistributionChart = null;

function generarGraficaMensualWizard() {
    console.log('🎨 Generando gráfico mensual (wizard)...');

    if (!window.wizardGeneracionMensual || !window.wizardDatos || !window.wizardResultados) {
        console.error('❌ Faltan datos');
        return;
    }

    const ctx = document.getElementById('wizardMonthlyChart');
    if (!ctx) {
        console.error('❌ Canvas no encontrado');
        return;
    }

    // Destruir gráfica anterior
    if (wizardMonthlyChart) {
        wizardMonthlyChart.destroy();
    }

    const generacionMensual = window.wizardGeneracionMensual;
    const numPaneles = window.wizardResultados.num_paneles;
    const consumoMensual = window.wizardDatos.consumo_mensual || window.wizardDatos.consumo || 350;

    const energias = generacionMensual.map(mes => parseFloat((mes.energia_mensual * numPaneles).toFixed(1)));

    // Usar datos de consumo mensual específico si está disponible
    let consumos;
    if (wizardData.modoConsumo === 'especifico' && wizardData.consumoMensualArray && wizardData.consumoMensualArray.length === 12) {
        consumos = wizardData.consumoMensualArray;
    } else {
        consumos = new Array(12).fill(consumoMensual);
    }

    console.log('📊 Datos para gráfico mensual:', {
        energias: energias.slice(0, 3) + '...',
        consumos: consumos.slice(0, 3) + '...',
        numPaneles: numPaneles,
        canvasExists: !!ctx,
        canvasParent: ctx.parentElement?.className
    });

    // Asegurar que el canvas y su contenedor estén visibles
    const container = ctx.parentElement;
    if (container) {
        container.style.display = 'block';
        container.style.minHeight = '400px';
        container.style.height = '400px';
        container.style.width = '100%';
    }

    ctx.style.display = 'block';
    ctx.style.width = '100%';
    ctx.style.height = '400px';

    // Verificar que el canvas tenga dimensiones antes de crear el gráfico
    const rect = ctx.getBoundingClientRect();
    console.log('📐 Dimensiones del canvas:', {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
    });

    // Si no tiene dimensiones, usar valores por defecto (Chart.js con responsive se ajustará)
    if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ Canvas sin dimensiones, usando valores por defecto (Chart.js se ajustará cuando sea visible)');
        // Forzar dimensiones mínimas para que Chart.js pueda crear el gráfico
        ctx.width = 800;
        ctx.height = 400;
    }

    wizardMonthlyChart = new Chart(ctx, {
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
            }, {
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
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Energía (kWh)'
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

    // Forzar resize después de un momento para asegurar renderizado
    setTimeout(() => {
        if (wizardMonthlyChart) {
            wizardMonthlyChart.resize();
            console.log('✅ Gráfico mensual generado y resized');
        }
    }, 100);
}

function generarGraficaFinancieraWizard(inflacionEnergetica = 0.03) {
    if (!window.wizardResultados) {
        console.error('❌ Faltan datos para generar gráfico financiero');
        return;
    }

    const ctx = document.getElementById('wizardFinancialChart');
    if (!ctx) {
        console.error('❌ No se encontró canvas wizardFinancialChart');
        return;
    }

    // Asegurar que el contenedor esté visible
    const container = ctx.closest('.financial-chart-container') || ctx.closest('.wizard-chart-container');
    if (container) {
        container.style.display = 'block';
        container.style.minHeight = '350px';
    }

    // Destruir gráfico anterior si existe
    if (wizardFinancialChart) {
        wizardFinancialChart.destroy();
        wizardFinancialChart = null;
    }

    const resultados = window.wizardResultados;
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    // Calcular datos para 25 años
    const anos = 25;
    const labels = ['Año 0'];
    const inversionInicial = [];
    const ahorrosAcumulados = [];
    const flujoNetoAcumulado = [];

    const inversionTotal = resultados.costo_total || resultados.inversion_total || 0;

    // Inversión inicial: solo un punto en el año 0
    inversionInicial.push(-inversionTotal);
    for (let i = 1; i <= anos; i++) {
        inversionInicial.push(null);
        labels.push(`Año ${i}`);
    }

    // Calcular ahorros acumulados y flujo neto acumulado
    let ahorroAnualActual = resultados.ahorro_anual || 0;
    let ahorrosAcum = 0;

    ahorrosAcumulados.push(0);
    flujoNetoAcumulado.push(-inversionTotal);

    for (let i = 1; i <= anos; i++) {
        ahorrosAcum += ahorroAnualActual;
        const flujoNeto = ahorrosAcum - inversionTotal;

        ahorrosAcumulados.push(ahorrosAcum);
        flujoNetoAcumulado.push(flujoNeto);

        // Aplicar inflación energética
        ahorroAnualActual *= (1 + inflacionEnergetica);
    }

    wizardFinancialChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Inversión Inicial',
                    data: inversionInicial,
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 0,
                    fill: false,
                    pointRadius: 8,
                    pointHoverRadius: 10,
                    showLine: false
                },
                {
                    label: 'Ahorros Acumulados',
                    data: ahorrosAcumulados,
                    borderColor: 'rgba(46, 204, 113, 1)',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5,
                    tension: 0.4
                },
                {
                    label: 'Flujo Neto Acumulado',
                    data: flujoNetoAcumulado,
                    borderColor: 'rgba(52, 152, 219, 1)',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: false,
                    pointRadius: 3,
                    pointHoverRadius: 5,
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
                        font: { size: 12 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function (context) {
                            if (context.parsed.y === null) return null;
                            return `${context.dataset.label}: ${simbolo}${formatearNumero(context.parsed.y, moneda)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    title: {
                        display: true,
                        text: 'Dinero ($)',
                        font: { size: 12 }
                    },
                    ticks: {
                        callback: function (value) {
                            return simbolo + formatearNumero(value, moneda);
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Tiempo',
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

function generarGraficaDistribucionWizard() {
    if (!window.wizardResultados || !window.wizardDatos) {
        console.error('❌ Faltan datos para generar gráfico de distribución');
        return;
    }

    const ctx = document.getElementById('wizardDistributionChart');
    if (!ctx) {
        console.error('❌ No se encontró canvas wizardDistributionChart');
        return;
    }

    // Destruir gráfica anterior si existe
    if (wizardDistributionChart) {
        wizardDistributionChart.destroy();
        wizardDistributionChart = null;
    }

    // Asegurar que el canvas y su contenedor estén visibles
    const container = ctx.closest('.wizard-distribution-chart') || ctx.parentElement;
    if (container) {
        container.style.display = 'block';
        container.style.minHeight = '400px';
        container.style.height = '400px';
        container.style.width = '100%';
    }

    ctx.style.display = 'block';
    ctx.style.width = '100%';
    ctx.style.height = '400px';

    // Verificar dimensiones
    const rect = ctx.getBoundingClientRect();
    console.log('🎨 Generando gráfico de distribución...', {
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0
    });

    // Si no tiene dimensiones, usar valores por defecto (Chart.js con responsive se ajustará)
    if (rect.width === 0 || rect.height === 0) {
        console.warn('⚠️ Canvas sin dimensiones, usando valores por defecto (Chart.js se ajustará cuando sea visible)');
        // Forzar dimensiones mínimas para que Chart.js pueda crear el gráfico
        ctx.width = 400;
        ctx.height = 400;
    }

    const consumoAnual = (window.wizardDatos.consumo_mensual || window.wizardDatos.consumo) * 12;
    const generacionAnual = window.wizardResultados.energia_anual_total || 0;

    const energiaConsumida = Math.min(consumoAnual, generacionAnual);
    const energiaInyectada = Math.max(0, generacionAnual - consumoAnual);

    wizardDistributionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Energía Autoconsumida', 'Energía Inyectada a la Red'],
            datasets: [{
                data: [energiaConsumida, energiaInyectada],
                backgroundColor: ['rgba(46, 213, 115, 0.8)', 'rgba(253, 184, 19, 0.8)'],
                borderColor: ['rgba(46, 213, 115, 1)', 'rgba(253, 184, 19, 1)'],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });

    // Forzar resize después de un momento
    setTimeout(() => {
        if (wizardDistributionChart) {
            wizardDistributionChart.resize();
            console.log('✅ Gráfico de distribución generado y resized');
        }
    }, 100);
}

function llenarTablaAhorroAcumulado(inflacionEnergetica = 0.03) {
    if (!window.wizardResultados) return;

    const tbody = document.getElementById('wizardAhorroTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    const ahorroAnualBase = window.wizardResultados.ahorro_anual || 0;
    const costoTotal = window.wizardResultados.costo_total || window.wizardResultados.inversion_total || 0;
    const moneda = wizardData.moneda || 'ARS';
    const simbolo = moneda === 'USD' ? '$' : '$';

    const años = [1, 5, 10, 15];

    años.forEach(año => {
        let ahorroAcumulado = 0;
        let ahorroAnualActual = ahorroAnualBase;

        for (let i = 1; i <= año; i++) {
            ahorroAcumulado += ahorroAnualActual;
            ahorroAnualActual *= (1 + inflacionEnergetica);
        }

        // Calcular ahorro del año actual (con inflación acumulada)
        const ahorroAnual = ahorroAnualBase * Math.pow(1 + inflacionEnergetica, año - 1);

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0;">${año}</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0;">${simbolo}${formatearNumero(ahorroAcumulado, moneda)}</td>
            <td style="padding: 0.75rem; border-bottom: 1px solid #e0e0e0; color: ${ahorroAnual >= 0 ? '#2ecc71' : '#e74c3c'}; font-weight: 600;">${simbolo}${formatearNumero(ahorroAnual, moneda)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarImagenInstalacion() {
    if (!window.wizardDatos) return;

    const imagenInstalacion = document.getElementById('wizardInstalacionImage');
    if (imagenInstalacion) {
        const inclinacion = wizardData.inclinacion || window.wizardDatos.inclinacion;
        if (inclinacion === 20) {
            imagenInstalacion.src = 'images/panel20.png';
            imagenInstalacion.alt = 'Instalación solar a 20°';
        } else {
            imagenInstalacion.src = 'images/panel45.png';
            imagenInstalacion.alt = 'Instalación solar a 45°';
        }
    }
}

function formatearNumero(numero, moneda = 'ARS') {
    if (moneda === 'USD') {
        return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numero);
    } else {
        return new Intl.NumberFormat('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(numero);
    }
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
        mostrarResultados(resultados, generacionMensual, datos);

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
        consumo: parseFloat(document.getElementById('consumo').value),
        consumo_mensual: parseFloat(document.getElementById('consumo').value),
        precio_kwh: parseFloat(document.getElementById('precio_kwh').value),
        costo_panel: parseFloat(document.getElementById('costo_panel').value),
        modo: modoActual,
        modo_dimensionamiento: modoDimensionamiento,
        porcentaje_cobertura: modoDimensionamiento === 'porcentaje'
            ? parseFloat(document.getElementById('porcentaje_cobertura')?.value || 100)
            : null,
        num_paneles_fijo: modoDimensionamiento === 'paneles'
            ? parseInt(document.getElementById('num_paneles_manual')?.value || 1)
            : null,
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

    // Energía anual requerida
    const energia_anual_requerida = datos.consumo_mensual * 12;

    // Calcular número de paneles según el modo de dimensionamiento
    let num_paneles;
    let porcentaje_objetivo = null;

    if (datos.modo_dimensionamiento === 'paneles' && datos.num_paneles_fijo) {
        // Modo: Elegir cantidad de paneles
        num_paneles = datos.num_paneles_fijo;
    } else {
        // Modo: Reducir factura por porcentaje
        const porcentaje = datos.porcentaje_cobertura || 100;
        porcentaje_objetivo = porcentaje;
        const energia_objetivo = energia_anual_requerida * (porcentaje / 100);
        num_paneles = Math.ceil(energia_objetivo / energia_anual_por_panel);
    }

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
        incertidumbre_anual,
        modo_dimensionamiento: datos.modo_dimensionamiento || 'porcentaje',
        porcentaje_objetivo: porcentaje_objetivo,
        energia_anual_requerida
    };
}

// ============================================
// Mostrar Resultados en la UI
// ============================================

function mostrarResultados(resultados, generacionMensual, datos = null) {
    // Guardar resultados para la impresión
    ultimosResultados = resultados;
    ultimaGeneracionMensual = generacionMensual;

    // Obtener datos del formulario si no se pasaron
    if (!datos) {
        datos = obtenerDatosFormulario();
    }

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
    const consumoMensual = parseFloat(document.getElementById('consumo').value);

    // ============================================
    // VISTA SIMPLE - KPIs Principales
    // ============================================

    // KPI 1: Inversión Total
    const kpiInversion = document.getElementById('kpiInversion');
    const kpiInversionDetail = document.getElementById('kpiInversionDetail');
    if (kpiInversion) kpiInversion.textContent = `$${formatNumber(resultados.costo_total)}`;
    if (kpiInversionDetail) kpiInversionDetail.textContent =
        `Base: $${formatNumber(resultados.costo_base)} + ${resultados.num_paneles} paneles`;

    // KPI 2: Ahorro Mensual
    const kpiAhorroMensual = document.getElementById('kpiAhorroMensual');
    const kpiAhorroAnual = document.getElementById('kpiAhorroAnual');
    if (kpiAhorroMensual) kpiAhorroMensual.textContent = `$${formatNumber(resultados.ahorro_mensual)}`;
    if (kpiAhorroAnual) kpiAhorroAnual.textContent =
        `$${formatNumber(resultados.ahorro_anual)}/año`;

    // KPI 3: Sistema Ideal
    const kpiSistema = document.getElementById('kpiSistema');
    const kpiSistemaDetail = document.getElementById('kpiSistemaDetail');
    if (kpiSistema) kpiSistema.textContent =
        `${resultados.num_paneles} Paneles + Inversor`;
    if (kpiSistemaDetail) kpiSistemaDetail.textContent =
        `${tipoPanelTexto} • ${resultados.potencia_total_kw.toFixed(2)} kW`;

    // KPI 4: Impacto Ambiental (equivalente a árboles)
    const arbolesEquiv = Math.round(resultados.co2_anual / 20); // 1 árbol ≈ 20 kg CO₂/año
    const kpiImpacto = document.getElementById('kpiImpacto');
    const kpiImpactoDetail = document.getElementById('kpiImpactoDetail');
    if (kpiImpacto) kpiImpacto.textContent =
        `${formatNumber(resultados.co2_anual)} kg CO₂`;
    if (kpiImpactoDetail) kpiImpactoDetail.textContent =
        `Equivale a plantar ${arbolesEquiv} árboles`;

    // ============================================
    // VISTA DETALLADA - Pestaña Finanzas
    // ============================================

    // ROI
    const detailROI = document.getElementById('detailROI');
    if (detailROI) {
        if (resultados.roi_anos === Infinity || isNaN(resultados.roi_anos)) {
            detailROI.textContent = 'N/A';
        } else {
            detailROI.textContent = `${resultados.roi_anos.toFixed(1)} años`;
        }
    }

    // Desglose de costos
    const detailCostoBase = document.getElementById('detailCostoBase');
    const detailCostoPaneles = document.getElementById('detailCostoPaneles');
    const detailCostoTotal = document.getElementById('detailCostoTotal');
    if (detailCostoBase) detailCostoBase.textContent = `$${formatNumber(resultados.costo_base)}`;
    if (detailCostoPaneles) detailCostoPaneles.textContent =
        `$${formatNumber(resultados.costo_paneles)} (${resultados.num_paneles} paneles)`;
    if (detailCostoTotal) detailCostoTotal.textContent = `$${formatNumber(resultados.costo_total)}`;

    // Ahorro a 25 años
    const ahorro25Anos = resultados.ahorro_anual * 25;
    const detailAhorro25Anos = document.getElementById('detailAhorro25Anos');
    if (detailAhorro25Anos) detailAhorro25Anos.textContent = `$${formatNumber(ahorro25Anos)}`;

    // ============================================
    // VISTA DETALLADA - Pestaña Energía
    // ============================================

    // Tabla mensual
    llenarTablaMensual(generacionMensual, resultados.num_paneles, consumoMensual);

    // Resumen de energía
    const summaryGeneracionAnual = document.getElementById('summaryGeneracionAnual');
    const summaryCobertura = document.getElementById('summaryCobertura');
    if (summaryGeneracionAnual) summaryGeneracionAnual.textContent =
        `${formatNumber(resultados.energia_anual_total)} kWh`;

    // Cobertura
    let coberturaTexto;
    if (resultados.modo_dimensionamiento === 'paneles') {
        coberturaTexto = `${resultados.cobertura.toFixed(0)}%`;
    } else {
        const porcentajeSeleccionado = resultados.porcentaje_objetivo || 100;
        coberturaTexto = porcentajeSeleccionado < 100
            ? `${resultados.cobertura.toFixed(0)}% (objetivo: ${porcentajeSeleccionado}%)`
            : `${resultados.cobertura.toFixed(0)}%`;
    }
    if (summaryCobertura) summaryCobertura.textContent = coberturaTexto;

    // Excedentes (si hay)
    const energiaAnualRequerida = consumoMensual * 12;
    const excedentesAnuales = resultados.energia_anual_total - energiaAnualRequerida;
    const summaryExcedentes = document.getElementById('summaryExcedentes');
    const summaryExcedentesValue = document.getElementById('summaryExcedentesValue');
    if (summaryExcedentes && summaryExcedentesValue) {
        if (excedentesAnuales > 0) {
            summaryExcedentes.style.display = 'block';
            summaryExcedentesValue.textContent = `${formatNumber(excedentesAnuales)} kWh`;
        } else {
            summaryExcedentes.style.display = 'none';
        }
    }

    // ============================================
    // VISTA DETALLADA - Pestaña Equipamiento
    // ============================================

    const equipPanelModelo = document.getElementById('equipPanelModelo');
    const equipPanelCantidad = document.getElementById('equipPanelCantidad');
    const equipPanelPotencia = document.getElementById('equipPanelPotencia');
    const equipPanelPrecio = document.getElementById('equipPanelPrecio');
    if (equipPanelModelo) equipPanelModelo.textContent = tipoPanelTexto;
    if (equipPanelCantidad) equipPanelCantidad.textContent = resultados.num_paneles;
    if (equipPanelPotencia) equipPanelPotencia.textContent = resultados.potencia_total_kw.toFixed(2);
    if (equipPanelPrecio) equipPanelPrecio.textContent = `$${formatNumber(resultados.costo_por_panel)}`;

    // Superficie necesaria (aprox. 1.6 m² por panel de 190W)
    const superficieNecesaria = resultados.num_paneles * 1.6;
    const equipSuperficie = document.getElementById('equipSuperficie');
    if (equipSuperficie) equipSuperficie.textContent =
        `${superficieNecesaria.toFixed(1)} m² (aprox.)`;

    // Inclinación
    const inclinacion = document.getElementById('inclinacion').value;
    const equipInclinacion = document.getElementById('equipInclinacion');
    if (equipInclinacion) equipInclinacion.textContent = `${inclinacion}°`;

    // ============================================
    // Inicializar eventos del botón y pestañas
    // ============================================
    inicializarVistaDetallada();
}

// ============================================
// Funciones para Vista Detallada
// ============================================

function inicializarVistaDetallada() {
    // Botón para expandir/colapsar vista detallada
    const btnVerAnalisis = document.getElementById('btnVerAnalisis');
    const vistaDetallada = document.getElementById('resultsDetailedView');
    const iconAnalisis = document.getElementById('iconAnalisis');

    if (btnVerAnalisis && vistaDetallada) {
        btnVerAnalisis.addEventListener('click', function () {
            const isExpanded = vistaDetallada.style.display !== 'none';

            if (isExpanded) {
                // Colapsar
                vistaDetallada.style.display = 'none';
                btnVerAnalisis.classList.remove('expanded');
            } else {
                // Expandir
                vistaDetallada.style.display = 'block';
                btnVerAnalisis.classList.add('expanded');

                // Generar gráficas solo cuando se expande (lazy loading)
                if (ultimosResultados && ultimaGeneracionMensual) {
                    const consumoMensual = parseFloat(document.getElementById('consumo').value);
                    setTimeout(() => {
                        generarGraficaMensual(ultimaGeneracionMensual, ultimosResultados.num_paneles, consumoMensual);
                        generarGraficaFinanciera(ultimosResultados);
                    }, 100);
                }

                // Scroll suave a la vista expandida
                setTimeout(() => {
                    vistaDetallada.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 200);
            }
        });
    }

    // Manejar pestañas
    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.dataset.tab;
            cambiarPestaña(tabName);
        });
    });
}

function cambiarPestaña(tabName) {
    // Remover active de todas las pestañas
    document.querySelectorAll('.result-tab').forEach(tab => {
        tab.classList.remove('active');
    });

    // Ocultar todos los panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });

    // Activar pestaña seleccionada
    const tab = document.querySelector(`.result-tab[data-tab="${tabName}"]`);
    const pane = document.getElementById(`tab${tabName.charAt(0).toUpperCase() + tabName.slice(1)}`);

    if (tab) tab.classList.add('active');
    if (pane) pane.classList.add('active');

    // Si es la pestaña de energía o finanzas, asegurar que los gráficos estén renderizados
    if ((tabName === 'energia' || tabName === 'finanzas') && ultimosResultados && ultimaGeneracionMensual) {
        setTimeout(() => {
            const consumoMensual = parseFloat(document.getElementById('consumo').value);
            if (tabName === 'energia') {
                generarGraficaMensual(ultimaGeneracionMensual, ultimosResultados.num_paneles, consumoMensual);
            } else if (tabName === 'finanzas') {
                generarGraficaFinanciera(ultimosResultados);
            }
        }, 100);
    }
}

function llenarTablaMensual(generacionMensual, numPaneles, consumoMensual) {
    const tbody = document.getElementById('monthlyTableBody');
    if (!tbody) return;

    tbody.innerHTML = '';

    generacionMensual.forEach((mes, index) => {
        const generacionTotal = mes.energia_mensual * numPaneles;
        const balance = generacionTotal - consumoMensual;
        const balanceClass = balance >= 0 ? 'positive' : 'negative';
        const balanceText = balance >= 0
            ? `+${balance.toFixed(1)} kWh`
            : `${balance.toFixed(1)} kWh`;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td><strong>${mes.mes}</strong></td>
            <td>${generacionTotal.toFixed(1)}</td>
            <td>${consumoMensual.toFixed(1)}</td>
            <td class="balance-${balanceClass}">${balanceText}</td>
        `;
        tbody.appendChild(row);
    });
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
                        label: function (context) {
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

    // Calcular flujo de caja acumulado (10 años)
    const anos = 10;
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
                    data: [costos[0], ...Array(anos).fill(null)],
                    backgroundColor: 'rgba(231, 76, 60, 0.2)',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Ahorros Acumulados',
                    data: [null, ...ahorros.slice(1)],
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
                        label: function (context) {
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
                        callback: function (value) {
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

    // Esperar un momento para asegurar que los gráficos estén completamente renderizados
    // (especialmente importante para el gráfico de 10 años)
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
                // Forzar actualización del gráfico antes de capturar
                financialChart.update('none');
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
        }, 300);
    }, 200);
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
                <h2>💰 Análisis Financiero (10 años)</h2>
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

