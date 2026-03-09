document.addEventListener("DOMContentLoaded", function () {
  const playButton = document.getElementById('playButton');
  const video = document.getElementById('alpha');
  const sceneEl = document.querySelector('a-scene');

  // Start AR and video after an explicit user gesture (fixes autoplay and policy errors)
  playButton.addEventListener('click', async () => {
    playButton.style.display = 'none';
    try {
      await video.play();
      video.muted = false;
    } catch (e) {
      console.warn('Video play failed:', e);
    }

    // Start mindar system when available
    try {
      if (sceneEl && sceneEl.systems && sceneEl.systems['mindar-image-system']) {
        await sceneEl.systems['mindar-image-system'].start();
      } else if (sceneEl) {
        sceneEl.addEventListener('renderstart', async () => {
          try {
            if (sceneEl.systems && sceneEl.systems['mindar-image-system']) {
              await sceneEl.systems['mindar-image-system'].start();
            }
          } catch (err) {
            mostrarErrorCamara(err);
          }
        }, { once: true });
      }
    } catch (err) {
      mostrarErrorCamara(err);
    }
  });

  // Mostrar alerta si falla la cámara o se deniegan los permisos
  function mostrarErrorCamara(err) {
    console.error('Error al iniciar AR:', err);
    alert(" No se ha podido acceder a la cámara.\n\nPor favor, asegúrate de haber dado permiso cuando el navegador te lo pida o revisa la configuración de privacidad de tu dispositivo.");

    // Ocultar cualquier pantalla de carga que se haya quedado enganchada
    const overlays = document.querySelectorAll('.mindar-ui-overlay');
    overlays.forEach(overlay => overlay.style.display = 'none');

    playButton.style.display = 'block'; // Volver a mostrar el botón
    video.pause();
  }

  // Attach target found/lost handlers when marker entity is ready
  const marker = document.getElementById('marker');
  if (marker) {
    marker.addEventListener('targetFound', () => {
      console.log('target found');
      video.play();
      video.muted = false;
    });
    marker.addEventListener('targetLost', () => {
      console.log('target lost');
      video.pause();
      video.muted = true;
    });
  }

});

/*
--- codigo muerto ---
la funcion no se llama desde ningun sitio en el HTML ni en el resto del js.
Probablemente se usaba para pruebas.
 
function apagado(){
  const v = document.getElementById('alpha');
  if (v) { v.pause(); v.muted = true; }
}
*/
