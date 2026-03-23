# Análisis Técnico: Proyecto 8th Wall Jose (`8walJose`)

Este proyecto es una implementación avanzada de **8th Wall** en la que se utiliza el sistema **ECS (Entity Component System)** junto con un **Shader de Croma** personalizado.

---

## 🏗️ Arquitectura del Proyecto

### 1. Independencia Total (Self-Hosted)
A diferencia de los ejemplos básicos que llaman a servidores externos, Jose ha incluido la carpeta `external/` que contiene:
*   `xr.js`: El motor de 8th Wall local. No necesita **AppKey** porque ya está en el servidor de Jose.
*   `runtime.js`: Las librerías de soporte necesarias para que el navegador entienda el motor de vision.

### 2. El Cerebro: `bundle.js`
Este archivo contiene toda la lógica del proyecto y es muy interesante por dos motivos:
#### A. Configuración de Escena (`sceneConfig`)
En lugar de crear la escena paso a paso con código de Three.js, Jose usa un objeto JSON gigante que define dónde están las luces (`Ambient Light`, `Directional Light`) y los objetos (`Plano`, `Box`).

#### B. El Shader de Croma (Lo más profesional)
Jose ha escrito un código llamado **Shader** (en lenguaje GLSL) que analiza cada píxel del vídeo `video1.mp4`. 
*   **¿Qué hace?**: Busca el color verde exacto (`new Color(0.1, 0.9, 0.2)`) y le dice al navegador que lo haga transparente (`alpha = 0`). 
*   **Para qué sirve**: Esto permite que una persona grabada sobre fondo verde parezca estar físicamente en la habitación, sin ningún recuadro negro o verde alrededor.

### 3. Interacción del Usuario
El código escucha al botón con ID `show-plano-btn`:
1.  **Al pulsar**: Hace visible el objeto "Plano", resetea el vídeo al segundo 0 y le da al "Play". Además, esconde el botón para que no estorbe.
2.  **Al terminar**: Jose ha puesto un "escuchador" de eventos (`ended`) que detecta cuando el vídeo acaba para volver a esconder el plano y mostrar de nuevo el botón de inicio.

---

## 📍 Conclusión para los Monumentos
Este sistema es ideal si más adelante queremos que tus castillos tengan un **guía virtual** (un vídeo de una persona explicando la historia) que aparezca delante del monumento con el fondo transparente.

