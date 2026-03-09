# Experiencia AR Sebka

Este proyecto es una aplicación web de Realidad Aumentada (WebXR) que utiliza la cámara del dispositivo móvil para detectar una imagen específica (target) y reproducir un vídeo con un efecto de croma (fondo transparente) superpuesto sobre ella en el mundo real.

## Herramientas Utilizadas
- **A-Frame (v1.5.0):** Para renderizar la escena en 3D y colocar el vídeo en un plano.
- **MindAR (v1.1.5):** Motor de seguimiento de imágenes para activar la cámara del dispositivo y detectar cuándo aparece la imagen `Enara.png`.
- **aframe-chromakey-material:** Plugin necesario para hacer transparente el fondo verde (`0.1 0.9 0.2`) del vídeo.


## Modificaciones y Mejoras Realizadas

### 1. Refactorización del Código Base

- **Separación de Lógica:** 
Se ha dividido el archivo original (que contenía todo junto) en tres archivos esenciales siguiendo las buenas prácticas: `index.html` (estructura), `styles.css` (diseño) y `ar.js` (lógica y comportamiento).

- **Estructura HTML5:** 
Se añadió la etiqueta `<!DOCTYPE html>`, el sistema de codificación `<meta charset="UTF-8">` y un `<title>` para evitar problemas de visualización en navegadores móviles.

- **Eliminación de Código Muerto:** 
Se han detectado y comentado funciones (como `apagado()`) y reglas CSS sin uso real para limpiar el proyecto.


### 2. Mejoras de Interfaz (UX/UI)

- **Botón Inicial Adaptable:** 
El botón negro gigante ha pasado a usar medidas relativas (`clamp` y `vw`) para asegurar que se ve proporcionado tanto en móviles grandes como pequeños, además de estar centrado perfectamente.

- **Carga de Vídeo (Pre-carga):** 
El archivo de vídeo utilizado (`asset.mp4` de 16MB) es pesado. Se ha añadido un estado "Cargando..." que bloquea el botón de Inicio hasta que la web está segura de que el vídeo se ha descargado lo suficiente para reproducirse sin tirones.

- **Botón de Cerrar AR:** 
Ahora el usuario ya no necesita refrescar la página entera para salir de la cámara. Se ha añadido el botón "**Cerrar AR**", que apaga el motor de MindAR y detiene el vídeo, devolviéndonos a la pantalla inicial limpiamente.

- **Instrucciones en Pantalla:** 
Se añadió un globo de texto ("📷 Apunta la cámara a la imagen") que solo aparece cuando la cámara está encendida y *no* sabe a dónde enfocar, guiando al usuario. Desaparece cuando MindAR entra en seguimiento.

### 3. Manejo de Errores y Experiencia
- **Detección de Permisos de Cámara:** 
Si el usuario pulsa "Bloquear" cuando su navegador le pide permisos de cámara, o si el navegador tiene el acceso capado por privacidad, la librería se quedaba pillada en la pantalla de carga infinita. Ahora se usa un bloque `try/catch` que detecta el fallo, lanza un `alert` nativo avisando del problema de privacidad, y esconde los mensajes de error visuales de la librería para devolverte al botón de inicio.
