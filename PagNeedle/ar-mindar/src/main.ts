import { onStart, WebXR, addComponent } from "@needle-tools/engine";

// configuramos el AR de needle
onStart(context => {
    const xr = addComponent(context.scene, WebXR);
    xr.createARButton = true;
    xr.createVRButton = false;
    xr.createQRCode = false;
    xr.createSendToQuestButton = false;
    xr.autoPlace = true;
    xr.usdzSrc = "./assets/tu-modelo.usdz";
});

// quitamos el enlace de needle.tools del DOM cuando aparezca
setInterval(() => {
    // buscamos en el dom normal
    document.querySelectorAll('a[href*="needle.tools"]').forEach(el => el.remove());
    // buscamos tambien en el shadow dom del componente needle-engine
    const needle = document.querySelector('needle-engine');
    if (needle?.shadowRoot) {
        needle.shadowRoot.querySelectorAll('a[href*="needle.tools"]').forEach(el => el.remove());
    }
}, 500);