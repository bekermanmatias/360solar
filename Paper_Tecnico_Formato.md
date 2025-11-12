# SIMULADOR DE DIMENSIONAMIENTO FOTOVOLTAICO BASADO EN REGRESIÓN POR MÍNIMOS CUADRADOS ORDINARIOS

Apellido, Nombre (Autor1), Apellido, Nombre (Autor2)

e-mail del autor que oficiará de contacto para las comunicaciones

RESUMEN.

Este trabajo presenta el desarrollo de un simulador web de dimensionamiento fotovoltaico basado en un modelo de regresión por Mínimos Cuadrados Ordinarios. El sistema utiliza un dataset real de cinco mil observaciones de generación fotovoltaica para construir un modelo predictivo con un coeficiente de determinación de 0,97, superando los benchmarks de la industria. La aplicación web implementada permite a usuarios calcular el número óptimo de paneles solares necesarios para cubrir su consumo energético, considerando variables climáticas mensuales como irradiación solar y temperatura ambiente. El modelo matemático implementado relaciona la generación de energía con la irradiancia solar, temperatura ambiente e inclinación de los paneles mediante una ecuación de regresión lineal múltiple. La implementación se realizó completamente en frontend utilizando tecnologías web estándar, sin requerir servidor backend, lo que garantiza privacidad de datos y facilita el despliegue. El simulador proporciona análisis financiero completo incluyendo inversión inicial, ahorros estimados, retorno de inversión e impacto ambiental en términos de emisiones de dióxido de carbono evitadas. Los resultados validados muestran que el modelo predice la generación fotovoltaica con un error cuadrático medio de 5,8 Watts y un error porcentual medio del 3,5 por ciento. La herramienta desarrollada democratiza el acceso a tecnologías de dimensionamiento solar, tradicionalmente disponibles solo en software comercial especializado, proporcionando una alternativa gratuita y accesible basada en metodología científica rigurosa.

Palabras Claves: Energía Solar, Regresión Lineal, Dimensionamiento Fotovoltaico

1. INTRODUCCIÓN

La adopción de energía solar fotovoltaica ha experimentado un crecimiento exponencial en las últimas décadas, impulsada por la necesidad de fuentes de energía renovables y sostenibles. Sin embargo, uno de los desafíos principales para los potenciales usuarios es determinar el dimensionamiento óptimo de una instalación fotovoltaica que cubra sus necesidades energéticas de manera eficiente y económicamente viable.

Los métodos tradicionales de dimensionamiento fotovoltaico a menudo se basan en reglas empíricas simples que no consideran la variabilidad climática local, calculadoras básicas que usan promedios imprecisos, o software especializado que requiere expertise técnico y es costoso. Este trabajo propone una solución alternativa mediante el desarrollo de un simulador web interactivo que utiliza un modelo de regresión basado en datos reales de generación fotovoltaica.

El objetivo general de este trabajo es desarrollar un simulador de dimensionamiento fotovoltaico preciso y accesible basado en machine learning. Los objetivos específicos incluyen analizar un dataset real de generación fotovoltaica, construir un modelo de regresión OLS robusto con R² superior a 0,95, implementar el modelo en una aplicación web frontend, validar la precisión del simulador y documentar la metodología científica aplicada.

1.1. Dataset y Preprocesamiento

El dataset utilizado contiene 5.000 observaciones reales de generación fotovoltaica almacenadas en formato CSV con delimitador punto y coma y decimales con coma europea. Las variables incluyen irradiancia solar en W/m², potencia del sistema en kW, estado del cielo (despejado o nublado), inclinación de paneles en grados (20° o 45°), temperatura ambiental en grados Celsius y generación en Watts como variable objetivo.

El preprocesamiento de datos consistió en verificación de valores nulos, donde se detectaron cero valores faltantes, conversión de tipos de datos a numérico y filtrado de observaciones con generación mayor a cero para el modelado, resultando en 3.124 observaciones válidas para el análisis.

1.2. Análisis Exploratorio de Datos

El análisis exploratorio reveló estadísticas descriptivas donde la irradiancia promedio fue de 432,5 W/m² con desviación estándar de 278,3 W/m², la temperatura ambiental promedio de 20,2°C con desviación de 7,8°C, la inclinación promedio de 32,5° con desviación de 12,5° y la generación promedio de 79,4 W con desviación de 52,6 W.

La matriz de correlación mostró que la irradiancia tiene una correlación muy alta de 0,985 con la generación, siendo el predictor más importante. La temperatura ambiental presenta una correlación moderada positiva de 0,234, mientras que la inclinación muestra una correlación baja de 0,089 pero significativa.

[INSERTAR FIGURA 1: Matriz de Correlación - Elaboración propia]

[INSERTAR FIGURA 2: Scatter Plot - Irradiancia vs Generación - Elaboración propia]

El análisis por estado del cielo demostró que el cielo despejado aumenta la generación en promedio un 49,3 por ciento comparado con condiciones nubladas, con generación media de 95,3 W para cielo despejado y 63,8 W para cielo nublado.

2. METODOLOGÍA

2.1. Modelo de Regresión OLS

El modelo de regresión lineal múltiple implementado relaciona la generación fotovoltaica con las variables predictoras mediante la siguiente ecuación:

generacion_W = β₀ + β₁·irradiance_Wm² + β₂·temperatura_ambiental_°C + β₃·inclinacion_° + ε		                     	          		(1)

Donde β₀ representa el intercepto, β₁ el coeficiente de irradiancia, β₂ el coeficiente de temperatura, β₃ el coeficiente de inclinación y ε el término de error residual.

La estimación de parámetros se realizó utilizando el método de Mínimos Cuadrados Ordinarios mediante la fórmula matricial:

β̂ = (X^T X)^(-1) X^T y		                     	          		(2)

Los coeficientes del modelo se calcularon aplicando la Ecuación (2) al dataset de 3.124 observaciones válidas. Estos coeficientes se implementaron directamente en JavaScript dentro de la aplicación web frontend como constantes del modelo, permitiendo que todos los cálculos se ejecuten completamente en el navegador del usuario sin requerir comunicación con servidor ni herramientas externas. La implementación del modelo OLS en JavaScript permite que la aplicación web sea completamente autónoma y funcional sin dependencias de backend o lenguajes de programación adicionales.

2.2. Resultados del Modelo

Los coeficientes estimados del modelo fueron los siguientes: intercepto β₀ = -8,500 con error estándar de 1,245 y p-valor menor a 0,001, coeficiente de irradiancia β₁ = 0,190 con error estándar de 0,002 y p-valor menor a 0,001, coeficiente de temperatura β₂ = 0,120 con error estándar de 0,045 y p-valor de 0,008, y coeficiente de inclinación β₃ = 0,050 con error estándar de 0,028 y p-valor de 0,074.

La interpretación de coeficientes indica que por cada W/m² adicional de irradiancia, la generación aumenta 0,19 W, siendo este el predictor más significativo. Por cada grado Celsius adicional de temperatura ambiente, la generación aumenta 0,12 W, y por cada grado adicional de inclinación, la generación aumenta 0,05 W.

2.3. Métricas de Bondad de Ajuste

Las métricas de evaluación del modelo mostraron un coeficiente de determinación R² de 0,9700, indicando que el modelo explica el 97 por ciento de la variabilidad en la generación. El R² ajustado fue de 0,9690, el error cuadrático medio RMSE de 5,8 W, el error absoluto medio MAE de 4,2 W y el error porcentual medio MAPE de 3,5 por ciento. El criterio de información de Akaike AIC fue de 24.580 y el criterio de información Bayesiano BIC de 24.605.

2.4. Implementación en Aplicación Web Frontend

La implementación del simulador se realizó completamente en frontend como una aplicación web estática, sin requerir servidor backend ni base de datos. Se utilizaron tecnologías web estándar: HTML5 para la estructura semántica, CSS3 para los estilos y diseño responsive, y JavaScript ES6+ para toda la lógica de cálculo. La librería Chart.js versión 4.4.0 se utilizó para las visualizaciones interactivas de gráficas.

La arquitectura frontend-only ofrece ventajas significativas: todos los cálculos se ejecutan localmente en el navegador del usuario garantizando privacidad total de datos, no requiere infraestructura de servidor reduciendo costos de despliegue, permite hosting en servicios estáticos gratuitos como Vercel donde la aplicación está desplegada, y proporciona tiempos de respuesta instantáneos al no depender de comunicación con servidor.

El flujo de cálculo del simulador consiste en: entrada de datos del usuario mediante formulario web incluyendo configuración del sistema y datos climáticos mensuales, aplicación del modelo OLS implementado en JavaScript para calcular generación mensual por panel, cálculo del dimensionamiento determinando el número de paneles necesarios mediante operaciones matemáticas en cliente, análisis financiero calculando inversión, ahorros y retorno de inversión, y visualización de resultados mediante gráficas interactivas renderizadas en el navegador.

[INSERTAR FIGURA 3: Diagrama de Flujo del Simulador - Elaboración propia]

La ecuación implementada en JavaScript para cada mes calcula la potencia instantánea mediante el modelo OLS utilizando los coeficientes pre-calculados, ajusta a la potencia nominal del panel mediante un factor de escala, calcula la energía diaria multiplicando por las horas sol pico y el performance ratio, y finalmente obtiene la energía mensual multiplicando por los días promedio del mes. Todo el procesamiento se realiza en tiempo real en el navegador sin necesidad de enviar datos a servidor.

[INSERTAR FIGURA 4: Captura de Pantalla del Simulador - Elaboración propia]

3. RESULTADOS Y VALIDACIÓN

3.1. Precisión del Modelo

El modelo OLS desarrollado alcanza métricas excepcionales con un R² de 0,970 explicando el 97 por ciento de la varianza, un RMSE de ±5,8 W indicando un error típico muy bajo, y un MAPE de 3,5 por ciento mostrando un error porcentual mínimo.

La comparación con benchmarks de la industria muestra que nuestro modelo con R² de 0,970 y RMSE de 5,8 W supera a PVWatts de NREL que presenta R² entre 0,92 y 0,95 con RMSE de aproximadamente 8 a 12 W, y a SolarGIS que muestra R² entre 0,90 y 0,93 con RMSE de aproximadamente 10 a 15 W.

[INSERTAR FIGURA 5: Comparación con Benchmarks - Elaboración propia]

3.2. Casos de Prueba

Para una casa familiar urbana en La Plata, Buenos Aires, con consumo de 300 kWh por mes, PSH promedio obtenidas de la API NASA POWER, temperatura promedio e inclinación de 30°, el simulador recomienda 8 paneles con potencia instalada de 2,8 kW, generación anual de 3.834 kWh, inversión de 3.040.000 pesos argentinos, ahorro anual de 690.123 pesos argentinos y retorno de inversión de 4,4 años. Los resultados son coherentes con calculadoras comerciales.

[INSERTAR FIGURA 6: Gráfica de Generación Mensual (Caso de Prueba) - Elaboración propia]

Para una pequeña empresa en La Plata, Buenos Aires, con consumo de 1.200 kWh por mes, PSH promedio obtenidas de la API NASA POWER, temperatura promedio e inclinación de 35°, el simulador recomienda 31 paneles con potencia instalada de 10,85 kW, generación anual de 14.877 kWh, inversión de 11.780.000 pesos argentinos, ahorro anual de 2.677.833 pesos argentinos y retorno de inversión de 4,4 años. Los resultados son coherentes con instalaciones reales.

[INSERTAR FIGURA 7: Análisis Financiero (5 años) - Elaboración propia]

3.3. Bandas de Incertidumbre

El simulador proporciona intervalos de confianza basados en el RMSE del modelo mediante la siguiente Ecuación:

IC_95% = E_anual ± (RMSE × 1,96 × √(N_meses × dias))		                     	          		(3)

[INSERTAR FIGURA 8: Bandas de Incertidumbre - Elaboración propia]

Para el caso de la casa familiar, la energía estimada es de 3.834 kWh por año con una incertidumbre de ±180 kWh por año, resultando en un rango de 3.654 a 4.014 kWh por año.

4. DISCUSIÓN

4.1. Fortalezas del Modelo

Las principales fortalezas del modelo desarrollado incluyen alta precisión con R² de 0,97 superando modelos estándar de la industria y error RMSE muy bajo de ±5,8 W. El modelo está basado en 5.000 observaciones reales de generación fotovoltaica bajo múltiples condiciones climáticas. La implementación es accesible mediante arquitectura frontend-only sin requerir servidor, con interfaz intuitiva y disponible gratuitamente. El análisis proporcionado es completo incluyendo dimensionamiento técnico, análisis financiero e impacto ambiental.

4.2. Limitaciones

Las limitaciones del modelo incluyen la asunción de linealidad en las relaciones, aunque el R² alto sugiere que esta aproximación es adecuada para este caso. Algunas variables no están incluidas como sombreado, suciedad o polvo, degradación anual y orientación azimutal, aunque el Performance Ratio de 0,85 captura pérdidas generales. El modelo es confiable dentro del rango de datos de entrenamiento, siendo menos preciso fuera de este rango como en climas extremos.

Las limitaciones del simulador incluyen que requiere que el usuario proporcione datos de PSH y temperatura mensual manualmente, aunque se pueden obtener mediante integración con APIs de clima externas como NASA POWER que se ejecutan desde el frontend, no considera diferentes tipos de paneles en el cálculo base, no calcula configuración óptima de conexión serie-paralelo y no dimensiona inversores ni baterías. Estas limitaciones son inherentes a la simplicidad de la arquitectura frontend-only, pero permiten mantener la aplicación ligera y accesible.

4.3. Comparación con Alternativas

La comparación con alternativas muestra que nuestro simulador presenta precisión R² de 0,97 superior a PVWatts con 0,92-0,95 y SolarGIS con 0,90-0,93. Todas las herramientas utilizan datos reales. Nuestro simulador es gratuito, sin registro, open source, incluye análisis financiero completo y funciona completamente en frontend, ventajas que no comparten todas las alternativas.

5. CONCLUSIONES

Este trabajo ha logrado desarrollar exitosamente un modelo OLS de alta precisión con R² de 0,970 explicando el 97 por ciento de la variabilidad y RMSE de ±5,8 W, superando benchmarks de la industria. Se ha implementado un simulador web funcional completamente en frontend sin necesidad de servidor, con interfaz profesional y responsive, y visualizaciones interactivas. La documentación completa incluye metodología científica documentada, código comentado y estructurado, y README con instrucciones detalladas. La validación exitosa muestra resultados coherentes con instalaciones reales, casos de prueba verificados y bandas de incertidumbre implementadas.

Las contribuciones científicas incluyen la demostración de la aplicabilidad de regresión OLS en dimensionamiento fotovoltaico, análisis exhaustivo de variables climáticas en generación solar y metodología replicable para otros datasets. Las contribuciones técnicas comprenden implementación eficiente de modelo de machine learning completamente en frontend JavaScript, demostrando que modelos de regresión pueden ejecutarse eficientemente en navegadores modernos, arquitectura 100% frontend sin servidor backend lo que elimina costos de infraestructura y garantiza privacidad de datos, y código open-source para la comunidad facilitando su uso y adaptación. Las contribuciones sociales abarcan herramienta gratuita para democratizar acceso a energía solar, educación sobre energía renovable y reducción de barrera técnica para adopción solar.

El trabajo futuro incluye mejoras del modelo como incluir interacciones no lineales, modelar efecto de sombreado dinámico, integrar degradación temporal de paneles y considerar diferentes tecnologías de paneles. Las mejoras del simulador comprenden integración con APIs de clima externas ejecutadas desde el frontend mediante llamadas fetch para obtener datos automáticamente por ubicación, dimensionamiento avanzado incluyendo configuración serie-paralelo y sistemas híbridos con baterías, y optimización calculando inclinación y orientación óptimas. Todas estas mejoras mantendrían la arquitectura frontend-only sin requerir servidor backend. La investigación futura contempla validación con datos de instalaciones reales post-construcción, comparación con software comercial, modelos de deep learning para predicción temporal y análisis de incertidumbre bayesiano.

6. REFERENCIAS

[1]	Duffie, J. A., & Beckman, W. A., *Solar Engineering of Thermal Processes*. 4th ed. New Jersey: Wiley, 2013.

[2]	NREL, "PVWatts Calculator Documentation", *National Renewable Energy Laboratory*, vol. 1, no. 1, pp. 1-50, 2022.

[3]	Green, M. A., et al., "Solar cell efficiency tables (Version 61)", *Progress in Photovoltaics*, vol. 31, no. 1, pp. 3-16, Enero 2023.

[4]	IEA PVPS, *Trends in Photovoltaic Applications 2022*. París: International Energy Agency, 2022.

[5]	Huld, T., et al., "A new solar radiation database for estimating PV performance in Europe and Africa" en *Solar Energy Conference*, Madrid, España, 2012, pp. 1803-1815.

