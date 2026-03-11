import { onStart, WebXR, addComponent } from "@needle-tools/engine";

// configuramos el AR de needle
onStart(context => {
    const xr = addComponent(context.scene, WebXR);
    xr.createARButton = false; // DESACTIVAMOS el botón por defecto de Needle para no tener 2 botones
    xr.createVRButton = false;
    xr.createQRCode = false;
    xr.createSendToQuestButton = false;
    xr.autoPlace = true;
    xr.usdzSrc = "./assets/tu-modelo.usdz";
});

// quitamos el enlace de needle y botones webxr dobles del DOM
setInterval(() => {
    document.querySelectorAll('a[href*="needle.tools"]').forEach(el => el.remove());
    const needle = document.querySelector('needle-engine');
    if (needle?.shadowRoot) {
        needle.shadowRoot.querySelectorAll('a[href*="needle.tools"]').forEach(el => el.remove());
        // ocultar la zona de botones predeterminada por si acaso
        needle.shadowRoot.querySelectorAll('.webxr-buttons, .desktop-ar-button').forEach(el => {
            (el as HTMLElement).style.display = 'none';
        });
    }
}, 500);