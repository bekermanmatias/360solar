# 🔄 INSTRUCCIONES: FIGURA 3 - DIAGRAMA DE FLUJO DEL SIMULADOR

## 🎯 ¿Qué necesitas?

1. **draw.io (diagrams.net)** - GRATIS y online: https://app.diagrams.net/
   - O descarga la app: https://github.com/jgraph/drawio-desktop/releases
2. **Alternativa**: PowerPoint, Canva, o cualquier editor de diagramas

---

## 🚀 MÉTODO 1: draw.io (RECOMENDADO - GRATIS)

### PASO 1: Abrir draw.io

1. Ve a: **https://app.diagrams.net/**
2. O descarga la app desde: https://github.com/jgraph/drawio-desktop/releases

### PASO 2: Crear nuevo diagrama

1. Haz clic en **"Create New Diagram"**
2. Selecciona **"Blank Diagram"**
3. Haz clic en **"Create"**

### PASO 3: Configurar la página

1. Ve a **File → Page Setup**
2. Tamaño: **A4** o **Letter**
3. Orientación: **Horizontal (Landscape)**
4. Haz clic en **"Apply"**

### PASO 4: Crear el diagrama de flujo

Sigue estos pasos para crear cada elemento:

#### **Elemento 1: Entrada de Datos**
1. Arrastra un **rectángulo** desde la barra lateral izquierda
2. Colócalo en la parte superior izquierda
3. Haz doble clic y escribe:
   ```
   ENTRADA DE DATOS DEL USUARIO
   • Configuración del sistema
   • Datos climáticos mensuales
   ```
4. Formato:
   - Color de fondo: **Amarillo** (#FFD700 o #F39C12)
   - Borde: **Negro**, grosor 2px
   - Fuente: **Arial**, tamaño 12pt, negrita

#### **Elemento 2: Aplicación del Modelo OLS**
1. Arrastra otro **rectángulo**
2. Colócalo debajo del primero (centrado)
3. Escribe:
   ```
   APLICACIÓN DEL MODELO OLS
   (JavaScript en navegador)
   • Cálculo generación mensual
   ```
4. Formato:
   - Color de fondo: **Azul claro** (#3498DB)
   - Borde: **Negro**, grosor 2px
   - Fuente: **Arial**, tamaño 12pt, negrita

#### **Elemento 3: Cálculo de Dimensionamiento**
1. Arrastra otro **rectángulo**
2. Colócalo debajo del segundo
3. Escribe:
   ```
   CÁLCULO DE DIMENSIONAMIENTO
   • Número de paneles necesarios
   • Potencia instalada
   ```
4. Formato:
   - Color de fondo: **Azul claro** (#3498DB)
   - Borde: **Negro**, grosor 2px
   - Fuente: **Arial**, tamaño 12pt, negrita

#### **Elemento 4: Análisis Financiero**
1. Arrastra otro **rectángulo**
2. Colócalo debajo del tercero
3. Escribe:
   ```
   ANÁLISIS FINANCIERO
   • Inversión inicial
   • Ahorros estimados
   • ROI
   ```
4. Formato:
   - Color de fondo: **Azul claro** (#3498DB)
   - Borde: **Negro**, grosor 2px
   - Fuente: **Arial**, tamaño 12pt, negrita

#### **Elemento 5: Visualización de Resultados**
1. Arrastra otro **rectángulo**
2. Colócalo en la parte inferior (centrado)
3. Escribe:
   ```
   VISUALIZACIÓN DE RESULTADOS
   • Gráficas interactivas
   • Métricas y resúmenes
   ```
4. Formato:
   - Color de fondo: **Verde claro** (#2ECC71)
   - Borde: **Negro**, grosor 2px
   - Fuente: **Arial**, tamaño 12pt, negrita

#### **Flechas de conexión**
1. Arrastra **flechas** desde la barra lateral
2. Conecta cada rectángulo con el siguiente (de arriba hacia abajo)
3. Formato de flechas:
   - Color: **Negro**
   - Grosor: **2px**
   - Estilo: **Sólida**

### PASO 5: Agregar texto adicional (opcional)

Puedes agregar un texto en la parte inferior:
```
Todos los cálculos se ejecutan en el navegador del usuario
```

### PASO 6: Exportar la figura

1. Ve a **File → Export as → PNG**
2. Configuración:
   - **Zoom**: 300% (para alta resolución)
   - **Border width**: 0
   - **Transparent background**: NO (fondo blanco)
3. Haz clic en **"Export"**
4. Guarda como: **`Figura3_DiagramaFlujo.png`**

**También exporta como PDF:**
1. Ve a **File → Export as → PDF**
2. Guarda como: **`Figura3_DiagramaFlujo.pdf`**

---

## 🎨 MÉTODO 2: PowerPoint (ALTERNATIVA)

### PASO 1: Abrir PowerPoint

1. Crea una nueva presentación
2. Configura la diapositiva: **Diseño → Tamaño de diapositiva → Personalizado**
   - Ancho: 25 cm
   - Alto: 15 cm

### PASO 2: Crear los elementos

1. **Insertar → Formas → Rectángulo**
2. Crea 5 rectángulos con el mismo contenido que en draw.io
3. **Insertar → Formas → Flecha** para conectar

### PASO 3: Formato

- Usa los mismos colores y estilos que en draw.io
- Fuente: Arial, 12pt, negrita

### PASO 4: Exportar

1. **Archivo → Guardar como → Imagen PNG**
2. O **Archivo → Exportar → Cambiar tipo de archivo → PDF**

---

## 📐 ESTRUCTURA DEL DIAGRAMA (REFERENCIA)

```
┌─────────────────────────────────────────┐
│  ENTRADA DE DATOS DEL USUARIO          │
│  • Configuración del sistema            │
│  • Datos climáticos mensuales           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  APLICACIÓN DEL MODELO OLS              │
│  (JavaScript en navegador)              │
│  • Cálculo generación mensual           │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  CÁLCULO DE DIMENSIONAMIENTO            │
│  • Número de paneles necesarios         │
│  • Potencia instalada                   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  ANÁLISIS FINANCIERO                   │
│  • Inversión inicial                   │
│  • Ahorros estimados                   │
│  • ROI                                 │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│  VISUALIZACIÓN DE RESULTADOS           │
│  • Gráficas interactivas               │
│  • Métricas y resúmenes                │
└─────────────────────────────────────────┘
```

---

## 🎨 GUÍA DE COLORES

- **Amarillo** (#F39C12): Entrada de datos (inicio)
- **Azul claro** (#3498DB): Procesos intermedios
- **Verde claro** (#2ECC71): Salida/resultados (fin)
- **Negro**: Bordes y flechas

---

## ✅ CHECKLIST ANTES DE EXPORTAR

- [ ] Todos los rectángulos están alineados verticalmente
- [ ] Las flechas conectan correctamente (de arriba hacia abajo)
- [ ] El texto es legible (Arial 12pt mínimo)
- [ ] Los colores son consistentes
- [ ] Hay suficiente espacio entre elementos
- [ ] El diagrama está centrado en la página
- [ ] Se exportó en 300 DPI (alta resolución)

---

## 📝 Para el paper técnico

Una vez generada la figura:

1. **Inserta la imagen** en el paper donde dice:
   ```
   [INSERTAR FIGURA 3: Diagrama de Flujo del Simulador - Elaboración propia]
   ```

2. **Agrega la leyenda** debajo de la figura:
   ```
   Figura 3. Diagrama de flujo del proceso de cálculo del simulador. 
   Todos los cálculos se ejecutan en el navegador del usuario. 
   [Elaboración propia]
   ```

3. **Formato de la leyenda** (según especificaciones):
   - Fuente: Arial 9pt
   - Estilo: Cursiva
   - Alineación: Centrada

---

## 💡 CONSEJOS

1. **Mantén la simplicidad**: No agregues demasiados detalles
2. **Usa colores consistentes**: Sigue la guía de colores
3. **Alinea bien**: Usa las herramientas de alineación de draw.io
4. **Espaciado uniforme**: Deja el mismo espacio entre elementos
5. **Exporta en alta resolución**: 300 DPI mínimo para impresión

---

## 🔗 Enlaces útiles

- **draw.io online**: https://app.diagrams.net/
- **Tutorial draw.io**: https://www.diagrams.net/doc/faq/svg-export-text-problems
- **Guía de colores**: Usa los códigos hex proporcionados arriba

---

¿Necesitas ayuda? ¡Pregunta!

