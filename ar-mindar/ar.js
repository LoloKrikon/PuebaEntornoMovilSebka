document.addEventListener("DOMContentLoaded", function () {
  const playButton = document.getElementById('playButton');
  const closeButton = document.getElementById('closeButton');
  const arHint = document.getElementById('ar-hint');
  const video = document.getElementById('alpha');
  const sceneEl = document.querySelector('a-scene');

  // Esto espera a que el archivo de video (que pesa mucho) se descargue lo suficiente
  // para que no haya tirones. Cuando está listo, activa el botón principal.
  video.addEventListener('canplaythrough', () => {
    playButton.disabled = false;
    playButton.textContent = 'Iniciar';
  });

  // Evento principal: Que pasa cuando pulsamos el boton de Iniciar
  playButton.addEventListener('click', async () => {
    // Escondemos el boton de inicio y sacamos el de cerrar y las instrucciones
    playButton.style.display = 'none';
    closeButton.style.display = 'block';
    arHint.style.display = 'block';

    try {
      await video.play(); // Le damos al play al video para que el navegador nos dé permiso
      video.pause(); // Lo pausamos inmediatamente para esperar a que detecte la foto
    } catch (e) {
      console.warn('Video play failed:', e);
    }

    // Encendemos la camara de MindAR
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

  // Mostrar alerta nativa de Windows/Android si deniegan la camara
  function mostrarErrorCamara(err) {
    console.error('Error al iniciar AR:', err);
    alert(" No se ha podido acceder a la cámara.\n\nPor favor, asegúrate de haber dado permiso cuando el navegador te lo pida o revisa la configuración de privacidad de tu dispositivo.");

    // Ocultar cualquier pantalla de carga que se haya quedado enganchada
    const overlays = document.querySelectorAll('.mindar-ui-overlay');
    overlays.forEach(overlay => overlay.style.display = 'none');

    playButton.style.display = 'block'; // Volver a poner el boton inicio
    closeButton.style.display = 'none'; // Esconder el boton cerrar
    arHint.style.display = 'none';      // Esconder las instrucciones de apuntar
    video.pause();
  }

  // Funcion del nuevo boton para apagar todo y volver al principio
  closeButton.addEventListener('click', () => {
    if (sceneEl.systems && sceneEl.systems['mindar-image-system']) {
      sceneEl.systems['mindar-image-system'].stop();
    }
    video.pause();
    video.muted = true;
    closeButton.style.display = 'none';
    arHint.style.display = 'none';
    playButton.style.display = 'block'; // Volver a poner el boton inicio
  });

  // Logica de cuando la camara detecta la imagen (enara.png)
  const marker = document.getElementById('marker');
  if (marker) {
    marker.addEventListener('targetFound', () => {
      console.log('target found');
      arHint.style.display = 'none'; // Cuando encuentra la foto borramos el mensaje de ayuda
      video.play();
      video.muted = false;
    });
    marker.addEventListener('targetLost', () => {
      console.log('target lost');
      arHint.style.display = 'block'; // Si apartas la cara de la foto vuelve a salir el mensaje
      video.pause();
      video.muted = true;
    });
  }

});

/*
--- codigo muerto ---
la funcion no se llama desde ningun sitio en el HTML ni en el resto del js.
Probablemente se usaba para pruebas
 
function apagado(){
  const v = document.getElementById('alpha');
  if (v) { v.pause(); v.muted = true; }
}
*/

