# Proyecto AR Multplataforma con Needle Engine

Bienvenido al proyecto de Realidad Aumentada desarrollado con **Needle Engine** y **Vite**. Este proyecto implementa un visor web 3D puro (Vanilla JS) capaz de lanzar experiencias AR nativas tanto en dispositivos Android como iOS, resolviendo los problemas comunes de compatibilidad entre navegadores móviles.

## Características Principales

**Detección Automática de Suelo (Android):** Utiliza WebXR (`autoPlace`) para escanear la habitación y anclar el modelo 3D en superficies reales planas de forma automática.
**Soporte Nativo iOS (QuickLook):** Inteligencia en el código para detectar si el usuario entra desde un iPhone/iPad, derivándolo dinámicamente al ecosistema QuickLook de Apple mediante un archivo `.usdz`.
**Interfaz Limpia y Personalizada:** Botón global "Ver en AR" personalizado en HTML/CSS, flotante y libre de botones por defecto intrusivos o enlaces a herramientas de terceros.
**Empaquetado Optimizado para GitHub Pages:** Configuración avanzada de Vite alterada a propósito (compresión desactivada) para sortear los clásicos errores 404 al alojar archivos web compilados en servidores de GitHub.

## Tecnologías Utilizadas

*   [Needle Engine](https://needle.tools/) (`@needle-tools/engine`)
*   [Vite](https://vitejs.dev/) (Empaquetador y Servidor Local)
*   **Three.js** (Motor de renderizado interno de Needle)
*   **TypeScript / Vanilla JavaScript**
*   **HTML / CSS** estándar sin frameworks adicionales.

## Estructura de Directorios

El núcleo del código desarrollado por nosotros se encuentra en la carpeta `src/` y en la raíz del proyecto.

*   `index.html`: Punto de entrada que aloja el componente `<needle-engine>`, nuestro botón AR unificado y el script dinámico de detección iOS/Android.
*   `src/main.ts`: Lógica principal. Configuración del módulo WebXR y scripts de limpieza del DOM/Shadow DOM.
*   `src/styles/style.css`: Estilos visuales a pantalla completa.
*   `assets/`: Repositorio de modelos 3D (`.glb` general y `.usdz` para Apple).
*   `vite.config.js`: Modificado expresamente para permitir el despliegue funcional en GitHub Pages.

> Para más detalles explicativos sobre la arquitectura técnica y el uso de cada script, por favor, refiérase al informe de estudio interno que preparó el equipo de desarrollo.

## Cómo Ejecutar en Desarrollo (Local)

1. Abre la terminal en el directorio `PagNeedle/ar-mindar`.
2. Instala las dependencias del proyecto (solo la primera vez):
   ```bash
   npm install
   ```
3. Inicia el servidor de pruebas local:
   ```bash
   npm run dev
   ```
4. Podrás ver y probar la web accediendo a la dirección local que te devuelva la terminal (ej: `http://localhost:3000`).
