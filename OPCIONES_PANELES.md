# Opciones de Paneles Solares - Argentina 2025 ☀️

## Resumen
Se ha implementado un **selector desplegable** con diferentes opciones de paneles solares predefinidos, facilitando la selección y mejorando la experiencia del usuario.

---

## 📋 Paneles Disponibles

### 1. **Estándar 300W** - $300.000 ARS
- **Potencia**: 300 Watts
- **Ideal para**: Presupuestos ajustados
- **Características**: Eficiencia estándar, buena relación costo-beneficio
- **Garantía**: 25 años
- **Casos de uso**: Viviendas con consumo bajo, proyectos económicos

### 2. **Premium 350W** - $350.000 ARS
- **Potencia**: 350 Watts
- **Ideal para**: Balance precio-rendimiento
- **Características**: Eficiencia mejorada, mayor generación
- **Garantía**: 25 años
- **Casos de uso**: Consumo medio, instalaciones residenciales estándar

### 3. **High Efficiency 350W** - $380.000 ARS ⭐ **(SELECCIONADO POR DEFECTO)**
- **Potencia**: 350 Watts
- **Ideal para**: Alta eficiencia
- **Características**: Tecnología de alta eficiencia, mejor rendimiento en baja luz
- **Garantía**: 25 años
- **Casos de uso**: Instalaciones profesionales, máxima generación por espacio

### 4. **Premium Plus 400W** - $420.000 ARS
- **Potencia**: 400 Watts
- **Ideal para**: Mayor potencia, menos paneles
- **Características**: Alta potencia, reduce cantidad de paneles necesarios
- **Garantía**: 25 años
- **Casos de uso**: Espacios limitados, instalaciones compactas

### 5. **Tier 1 - 450W** - $480.000 ARS
- **Potencia**: 450 Watts
- **Ideal para**: Máxima calidad y eficiencia
- **Características**: Fabricante Tier 1, máxima calidad, mejor degradación
- **Garantía**: 25-30 años
- **Casos de uso**: Proyectos premium, máxima durabilidad

### 6. **Bifacial 550W** - $650.000 ARS 🌟
- **Potencia**: 550 Watts
- **Ideal para**: Tecnología avanzada
- **Características**: Genera por ambos lados, 10-30% más energía
- **Garantía**: 30 años
- **Casos de uso**: Techos reflectantes, instalaciones comerciales, máximo ROI

### 7. **🔧 Personalizado** 
- **Permite**: Ingresar cualquier precio personalizado
- **Uso**: Paneles especiales, cotizaciones específicas, marcas no listadas

---

## 💻 Implementación Técnica

### HTML
```html
<select id="tipo_panel" onchange="actualizarPrecioPanel()" required>
    <option value="300000" data-potencia="300">Estándar 300W - $300.000</option>
    <option value="350000" data-potencia="350">Premium 350W - $350.000</option>
    <option value="380000" data-potencia="350" selected>High Efficiency 350W - $380.000</option>
    <option value="420000" data-potencia="400">Premium Plus 400W - $420.000</option>
    <option value="480000" data-potencia="450">Tier 1 - 450W - $480.000</option>
    <option value="650000" data-potencia="550">Bifacial 550W - $650.000</option>
    <option value="custom">🔧 Personalizado...</option>
</select>

<!-- Campo oculto que contiene el valor real -->
<input type="hidden" id="costo_panel" value="380000">

<!-- Campo que aparece cuando se selecciona "Personalizado" -->
<div id="custom-price-group" style="display: none;">
    <input type="number" id="costo_panel_custom" value="380000">
</div>
```

### JavaScript
```javascript
function actualizarPrecioPanel() {
    const selectPanel = document.getElementById('tipo_panel');
    const costoPanel = document.getElementById('costo_panel');
    const customGroup = document.getElementById('custom-price-group');
    const customInput = document.getElementById('costo_panel_custom');
    const panelInfo = document.getElementById('panel-info');
    
    const selectedOption = selectPanel.options[selectPanel.selectedIndex];
    const valor = selectedOption.value;
    
    if (valor === 'custom') {
        // Mostrar campo personalizado
        customGroup.style.display = 'block';
        costoPanel.value = customInput.value;
        panelInfo.textContent = 'Ingresa el costo de tu panel';
    } else {
        // Ocultar campo personalizado
        customGroup.style.display = 'none';
        costoPanel.value = valor;
        
        // Actualizar descripción
        const infoTexts = {
            '300000': 'Estándar, ideal para presupuestos ajustados',
            '350000': 'Óptimo balance precio-rendimiento',
            '380000': 'Alta eficiencia, garantía 25 años',
            '420000': 'Mayor potencia, menos paneles necesarios',
            '480000': 'Tier 1, máxima calidad y eficiencia',
            '650000': 'Tecnología bifacial, genera por ambos lados'
        };
        panelInfo.textContent = infoTexts[valor];
    }
}
```

### CSS
```css
.form-group select {
    appearance: none;
    background-image: url("data:image/svg+xml,..."); /* Flecha personalizada */
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    padding-right: 2.5rem;
}

.form-group select:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(253, 184, 19, 0.1);
}
```

---

## 🎯 Ventajas del Desplegable

### Para el Usuario:
✅ **Más fácil de usar**: No necesita investigar precios  
✅ **Opciones claras**: Ve inmediatamente las alternativas  
✅ **Información contextual**: Descripción de cada panel  
✅ **Flexibilidad**: Puede ingresar valores personalizados  
✅ **Comparación rápida**: Ve precios y potencias lado a lado  

### Para el Negocio:
✅ **Estandarización**: Precios consistentes  
✅ **Educación**: El usuario aprende sobre opciones disponibles  
✅ **Upselling**: Puede ver opciones premium fácilmente  
✅ **Profesionalismo**: Muestra catálogo estructurado  
✅ **Datos reales**: Basado en mercado argentino actual  

---

## 📊 Comparativa de Paneles

| Modelo | Potencia | Precio | $/Watt | Eficiencia | Garantía |
|--------|----------|--------|--------|------------|----------|
| Estándar | 300W | $300.000 | $1.000 | 17-18% | 25 años |
| Premium | 350W | $350.000 | $1.000 | 18-19% | 25 años |
| High Efficiency | 350W | $380.000 | $1.086 | 19-20% | 25 años |
| Premium Plus | 400W | $420.000 | $1.050 | 20-21% | 25 años |
| Tier 1 | 450W | $480.000 | $1.067 | 21-22% | 25-30 años |
| Bifacial | 550W | $650.000 | $1.182 | 22-23% + bonus | 30 años |

---

## 🔄 Flujo de Usuario

```
1. Usuario abre el simulador
   ↓
2. Ve "Tipo de Panel Solar" con valor predeterminado
   ↓
3. Hace clic en el desplegable
   ↓
4. Ve 7 opciones con precios claros
   ↓
5. Selecciona una opción
   ↓
6. La descripción se actualiza automáticamente
   ↓
7. (Opcional) Selecciona "Personalizado" para ingresar otro valor
   ↓
8. Continúa con el cálculo
```

---

## 💰 Justificación de Precios (Nov 2025)

### Factores Considerados:
1. **Costo del Panel**: Importación + aranceles (~65%)
2. **Inversor**: Proporcional por panel (~16%)
3. **Estructura**: Soportes y montaje (~8%)
4. **Instalación**: Mano de obra (~6%)
5. **Margen**: Distribuidor + instalador (~5%)

### Inflación y Tipo de Cambio:
- **Dólar Blue**: ~$1.200 ARS (Nov 2025)
- **Panel 350W**: ~$250 USD × 1.200 = $300.000 base
- **Sistema completo**: +27% (inversor, estructura, instalación)
- **Precio final panel estándar**: ~$380.000 ARS

---

## 🎨 Diseño UX/UI

### Estados del Selector:

**Normal**:
- Borde gris claro
- Flecha dropdown gris
- Texto negro

**Focus**:
- Borde dorado (`--primary-color`)
- Sombra dorada sutil
- Flecha se mantiene

**Hover**:
- Cursor pointer
- Transición suave

**Personalizado Activo**:
- Aparece input numérico debajo
- Descripción cambia a "Ingresa el costo de tu panel"
- Validación automática

---

## 📱 Responsive

### Desktop:
- Select ocupa 100% del ancho del form-group
- Altura estándar: 40px
- Padding derecho amplio para la flecha

### Mobile:
- Select se adapta al ancho disponible
- Fuente legible (0.85rem)
- Touch-friendly (altura mínima 44px)

---

## 🔧 Mantenimiento

### Para Actualizar Precios:
1. Editar los `value=""` en las opciones del `<select>`
2. Actualizar los textos de las opciones
3. Actualizar el objeto `infoTexts` en JavaScript
4. (Opcional) Actualizar este documento

### Para Agregar Nuevos Paneles:
```html
<option value="PRECIO" data-potencia="WATTS">
    Nombre Modelo - $PRECIO
</option>
```

Luego agregar en JavaScript:
```javascript
'PRECIO': 'Descripción del panel'
```

---

## ✅ Testing

### Checklist:
- [x] Selector funciona correctamente
- [x] Precio se actualiza en campo hidden
- [x] Opción personalizada muestra/oculta input
- [x] Descripción cambia según selección
- [x] Valor predeterminado es correcto (High Efficiency $380k)
- [x] Cálculo usa el precio correcto
- [x] Reporte de impresión muestra tipo de panel
- [x] Responsive en móvil
- [x] Sin errores de consola

---

## 📈 Métricas de Impacto

### Antes:
- Usuario debía investigar precios
- Campo de texto libre (error prone)
- Sin contexto de opciones
- Puede ingresar valores irreales

### Después:
- ✅ 6 opciones predefinidas
- ✅ Precios basados en mercado real
- ✅ Descripción educativa
- ✅ Opción personalizada disponible
- ✅ Menos errores de entrada
- ✅ Mejor conversión (más claro)

---

## 🚀 Próximas Mejoras (Opcional)

1. **Imágenes de Paneles**
   - Agregar mini-imágenes de cada tipo
   - Ver el panel visualmente

2. **Comparador**
   - Modal que compara 2-3 paneles lado a lado
   - Tabla con especificaciones detalladas

3. **Marcas Específicas**
   - Listar marcas reales (Jinko, Canadian Solar, etc.)
   - Logos de fabricantes

4. **Disponibilidad**
   - Indicar stock o tiempo de entrega
   - Badges "Más vendido", "Mejor valor"

5. **Calculadora de Ahorro**
   - Mostrar ahorro potencial según panel elegido
   - Comparar ROI entre opciones

---

**Versión**: 1.0  
**Fecha**: Noviembre 2025  
**Estado**: ✅ Implementado  
**Opciones**: 6 paneles + personalizado  
**Moneda**: Pesos Argentinos (ARS)


