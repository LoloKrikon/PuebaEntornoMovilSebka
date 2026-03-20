
# Mejoras para la Web: Arquitectura de Servidor y Carga Dinámica
Actualmente, todos los modelos 3D (.glb y .usdz) están guardados dentro de la propia carpeta del proyecto. 
Esto funciona bien para unos pocos archivos, pero si quieres tener 50 castillos o muchos objetos, la web se volvería muy pesada y lenta de cargar.

Aquí te explico cómo se podría mejorar usando un servidor externo y peticiones dinámicas.

## 1. El Concepto de "Backend"
En lugar de tener los archivos en la estructura de carpetas, los tendríamos en un servidor externo o servicio de almacenamiento (como AWS S3, Google Cloud Storage o un servidor propio con Node.js/PHP).

## 2. Base de Datos de Modelos
Tendríamos una base de datos (como MongoDB o MySQL) con una tabla de "Monumentos":
*   **Nombre:** Castillo de Alanís
*   **ID:** alanis_01
*   **URL_GLB:** https://api.tuweb.com/modelos/alanis.glb
*   **URL_USDZ:** https://api.tuweb.com/modelos/alanis.usdz
*   **Info:** Reseña histórica...

## 3. Carga Dinámica (Fetch)
En lugar de escribir los botones a mano en el HTML, el código JavaScript haría una petición (Fetch) al servidor al cargar la web:

```javascript
// Ejemplo de cómo se pediría la lista al servidor
fetch('https://api.tuweb.com/get-monumentos')
  .then(res => res.json())
  .then(data => {
    // Aquí se crearía los botones automáticamente
    data.forEach(monumento => {
      crearBoton(monumento);
    });
  });
```

## 4. Ventajas de este sistema
*   **Velocidad:** La web carga instantáneamente porque no tiene que "escanear" todos los modelos locales al principio. Solo descarga el modelo que el usuario elige.
*   **Escalabilidad:** Podrías añadir 100 castillos nuevos desde un panel de control sin tocar ni una sola línea de código de la web.
*   **Actualización en tiempo real:** Si cambias un modelo por uno mejor en el servidor, se actualiza en todos los móviles de los usuarios al momento.
*   **Seguridad y Organización:** Los archivos no están expuestos en el repositorio de GitHub, sino protegidos en un entorno profesional.

## 5. Herramientas Recomendadas
*   **Almacenamiento:** Firebase Storage o AWS S3 (muy baratos para archivos 3D).
*   **API:** Node.js con Express o un sistema sin servidor como Firebase Cloud Functions.
*   **Base de datos:** Firestore (de Google) es ideal para este tipo de proyectos por su rapidez.

---
*Apuntes para mejora de arquitectura - Proyecto AR Castillos*
