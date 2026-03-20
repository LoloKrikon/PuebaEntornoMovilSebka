# Informe del Proyecto: Visor de Monumentos en Realidad Aumentada (AR)

Este proyecto es una aplicación web de Realidad Aumentada diseñada para visualizar modelos 3D de monumentos históricos (como castillos y torres) directamente sobre el suelo de la habitación usando la cámara del móvil.

---

## 🏗️ Estructura General

### 1. `index.html` (El Esqueleto)
Es el archivo principal que carga todo lo demás. Contiene:
*   **Librerías:** Carga **A-Frame** (el motor 3D) y **A-Frame Extras** (para animaciones).
*   **Interfaz de Usuario (UI):** Aquí están definidos el menú de selección, el tutorial de pasos, la ficha de información y los avisos de "Buscando suelo...".
*   **Escena 3D (`<a-scene>`):** Define el mundo virtual, las luces, la cámara y el sistema de "Hit Test" (la tecnología que detecta el suelo real para colocar los modelos).

### 2. `src/css/style.css` (El Estilo)
Se encarga de que la aplicación se vea moderna y profesional.
*   **Efecto Crystal (Glassmorphism):** Usa fondos translúcidos con desenfoque (`backdrop-filter: blur`) para que los menús parezcan de cristal flotando sobre la cámara.
*   **Adaptación Móvil:** Asegura que los botones sean fáciles de pulsar en pantallas pequeñas.
*   **Tutorial:** Da formato a los pasos numerados del principio para que sean claros.

### 3. `src/js/` (El Cerebro)
Aquí reside toda la lógica de programación en JavaScript:

*   **`app.js`**: Es el director de orquesta. Controla cuándo se abre el menú, qué pasa al pulsar "Ver en AR", cómo cambia la información según el monumento elegido y gestiona la entrada/salida del modo Realidad Aumentada.
*   **`components.js`**: Contiene las piezas personalizadas que no vienen de serie en A-Frame:
    *   `hit-test-handler`: Lo más importante. Es el código que detecta el suelo para saber dónde colocar el modelo final.
    *   `ar-controls`: Permite que el usuario rote el modelo con un dedo o le cambie el tamaño pellizcando la pantalla (pinch-to-zoom).
    *   `shadow-material`: Crea una sombra realista en el suelo debajo del monumento.
*   **`monuments.js`**: Es la "base de datos" del proyecto. Aquí se guardan los nombres, las rutas de los archivos 3D (`.glb` para Android, `.usdz` para iPhone) y los textos Descriptivos de cada monumento. Si quieres añadir un monumento nuevo, este es el sitio.
*   **`utils.js`**: Pequeñas funciones de ayuda, como detectar si el usuario está usando un iPhone para lanzarle la experiencia nativa de Apple (Quick Look).

---

## 📦 Los Modelos 3D (`assets/`)
El proyecto maneja dos tipos de formatos para máxima compatibilidad:
*   **GLB (en `assets/GLB/`):** Formato estándar para Android y navegadores web. Permiten texturas de alta calidad y animaciones.
*   **USDZ (en `assets/USDZ/`):** Formato específico de Apple. Es necesario para que los usuarios de iPhone tengan una experiencia fluida sin descargar aplicaciones.

---

## 🚀 Flujo de Usuario (Cómo funciona)
1.  **Entrada:** El usuario ve un tutorial rápido.
2.  **Selección:** Elige un monumento del menú inferior.
3.  **Activación:** Al pulsar "Ver en AR", se activa la cámara.
4.  **Escaneo:** El sistema busca superficies planas (el suelo) en modo silencioso.
5.  **Colocación:** En cuanto el sistema detecta el suelo, el usuario solo tiene que tocar la pantalla y el monumento aparece de forma sólida y directa.
6.  **Interacción:** El usuario puede rodear el monumento, rotarlo o leer información detallada pulsando el botón ( i ).

---

*Informe generado por Antigravity para Lolo.*
