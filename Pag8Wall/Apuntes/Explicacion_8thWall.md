# Guía de Funcionamiento: 8th Wall (Open Source)

Has descargado el repositorio de **8thwall/web**. Este repositorio no es solo un visor de modelos, es un **Framework completo** para Realidad Aumentada profesional.

---

## 🏗️ ¿Cómo funciona por dentro?

A diferencia de otras librerías básicas, 8th Wall funciona mediante un **"Pipeline de Cámara"** (una tubería de datos).

1.  **Captura:** La librería toma el control de la cámara del móvil.
2.  **Procesado (XR8):** El motor (`XR8`) analiza cada imagen píxel a píxel para detectar el suelo (SLAM), las luces y tu movimiento.
3.  **Sincronización:** Una vez que sabe dónde está el suelo, envía esos datos a tu motor 3D (sea **Three.js**, **Babylon.js** o **A-Frame**).
4.  **Renderizado:** Tu motor 3D dibuja el castillo en esas coordenadas y tú lo ves "fijo" en el mundo real.

---

## 📂 Archivos clave que deberías aprender (en orden)

Si quieres dominar el proyecto de los castillos, céntrate en estos archivos de los ejemplos:

### 1. `index.html` (La Entrada)
*   **Por qué aprenderlo:** Aquí es donde se configuran los permisos del móvil y se cargan las librerías por CDN. 
*   **En qué fijarse:** Mira las etiquetas `<script src="...">`. Para que 8th Wall funcione, tienen que estar cargadas antes que tu propio código.

### 2. `index.js` (La Lógica Principal)
*   **Por qué aprenderlo:** Es el **cerebro**. Aquí es donde se le dice a 8th Wall: "Empieza a monitorizar el suelo".
*   **Funciones clave:**
    *   `XR8.addCameraPipelineModules(...)`: Conecta el motor con la cámara.
    *   `XR8.run(...)`: Arranca la experiencia AR.

### 3. El ciclo del motor 3D (Render Loop)
*   **En Three.js / Babylon.js:** Tienes que entender cómo se crea una escena (`scene`), cómo se pone una luz (`light`) y cómo se carga un modelo (`GLTFLoader`).
*   **A diferencia de A-Frame**, aquí tú tienes que decirle al programa que tiene que redibujar el castillo 60 veces por segundo para que se vea fluido.

---

## 🚀 Hoja de Ruta Sugerida
1.  **Explora `examples/threejs/placeground`**: Es el ejemplo más sencillo de "Tocar el suelo y poner algo".
2.  **Mira `xrextras`**: Aprende a personalizar la pantalla de carga para que no salga el logo de 8th Wall y pongas el tuyo o el de los castillos.

---

## 🛠️ Funcionamiento Detallado (Versión Three.js Puro)

Ahora que hemos quitado A-Frame, el proyecto funciona con una arquitectura de 3 capas:

### 1. Capa de Visión (Cámara)
El motor de 8th Wall captura el vídeo del móvil y lo analiza en tiempo real. Para que el castillo parezca que está "encima" del suelo, el fondo de la escena 3D tiene que ser **transparente** (`alpha: true`).

### 2. Capa de Rastreo (SLAM - El Cerebro)
8th Wall busca puntos de referencia en el mundo real. Usa un **"Camera Pipeline"** (una tubería de datos). Cada vez que mueves el móvil, 8th Wall le envía las nuevas coordenadas (X, Y, Z) a la cámara virtual de Three.js. Así, aunque tú te muevas, el castillo parece estar quieto en el suelo.

### 3. Capa de Renderizado (Three.js - El Dibujante)
Aquí es donde controlamos todo el aspecto visual:
*   **Luz Ambiental y Direccional:** Imitamos la luz del sol para que el castillo tenga volumen y sombras.
*   **Carga del GLB:** Usamos el `GLTFLoader` de Three.js para traer el archivo del castillo. Lo ponemos como `visible = false` al principio para que no aparezca antes de que el motor de rastreo esté listo.
*   **El Canvas:** Es el lienzo donde se dibuja todo. 8th Wall se encarga de superponerlo perfectamente sobre el vídeo de la cámara.

---

*Guía actualizada por Antigravity para Lolo · Marzo 2026*

