let archivoGltf = "";
let escalaModelo = "1 1 1";

function checkIOS() {
    return [
        'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
}

AFRAME.registerComponent('hit-test-handler', {
    init: function () {
        let ctx = this;
        this.hitSource = null;
        this.localSpace = null;
        this.modeloPuesto = false;
        this.modeloActual = null;

        let txtInfo = document.getElementById('instruction');
        let txtCargando = document.getElementById('loading-text');
        let btnReset = document.getElementById('reset-button');

        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            let sess = this.el.sceneEl.renderer.xr.getSession();

            // ocultamos el texto de cargando cuando ya estamos dentro
            txtCargando.style.display = 'none';

            sess.requestReferenceSpace('viewer').then((space) => {
                sess.requestHitTestSource({ space: space }).then((source) => {
                    ctx.hitSource = source;
                });
            });

            sess.requestReferenceSpace('local').then((space) => {
                ctx.localSpace = space;
            });

            sess.addEventListener('select', () => {
                if (ctx.el.getAttribute('visible') && !ctx.modeloPuesto) {
                    let modelObj = document.createElement('a-entity');
                    modelObj.setAttribute('gltf-model', archivoGltf);
                    modelObj.setAttribute('position', ctx.el.getAttribute('position'));
                    modelObj.setAttribute('scale', escalaModelo);
                    modelObj.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');

                    ctx.el.sceneEl.appendChild(modelObj);
                    ctx.modeloActual = modelObj;
                    ctx.modeloPuesto = true;

                    ctx.el.setAttribute('visible', 'false');
                    txtInfo.innerText = "¡Colocado!";

                    // mostramos el botón de reiniciar
                    btnReset.style.display = 'block';

                    setTimeout(() => { txtInfo.style.display = 'none'; }, 2000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            ctx.hitSource = null;
            txtInfo.style.display = 'none';
            txtCargando.style.display = 'none';
            btnReset.style.display = 'none';
            document.getElementById('ar-button').style.display = 'block';
            ctx.modeloPuesto = false;
            ctx.modeloActual = null;
        });

        // lógica del botón reiniciar
        btnReset.addEventListener('click', () => {
            // borramos el modelo que había puesto el usuario
            if (ctx.modeloActual) {
                ctx.el.sceneEl.removeChild(ctx.modeloActual);
                ctx.modeloActual = null;
            }

            // reseteamos el estado para que pueda volver a colocar
            ctx.modeloPuesto = false;
            ctx.el.setAttribute('visible', 'false');

            btnReset.style.display = 'none';
            txtInfo.innerText = "Mueve el móvil despacio para encontrar el suelo";
            txtInfo.style.display = 'block';
        });
    },

    tick: function () {
        if (this.modeloPuesto) return;

        let txtInfo = document.getElementById('instruction');

        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.hitSource || !this.localSpace) return;

            let currentFrame = this.el.sceneEl.frame;
            if (!currentFrame) return;

            let hits = currentFrame.getHitTestResults(this.hitSource);

            if (hits.length > 0) {
                let pose = hits[0].getPose(this.localSpace);

                this.el.setAttribute('visible', 'true');
                this.el.setAttribute('position', pose.transform.position);

                txtInfo.innerText = "Toca para poner el modelo";
            } else {
                this.el.setAttribute('visible', 'false');
                txtInfo.innerText = "Buscando el suelo...";
            }
        }
    }
});

window.onload = () => {
    let btnMain = document.getElementById('ar-button');
    let linkIos = document.getElementById('enlace-ios');
    let txtInfo = document.getElementById('instruction');
    let txtCargando = document.getElementById('loading-text');
    let mainScene = document.querySelector('a-scene');
    let selectionMenu = document.getElementById('selection-menu');
    let optionButtons = document.querySelectorAll('.option-button');

    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            archivoGltf = btn.getAttribute('data-glb');
            linkIos.href = btn.getAttribute('data-usdz');
            escalaModelo = btn.getAttribute('data-scale') || '1 1 1';

            optionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            btnMain.style.display = 'block';
        });
    });

    btnMain.addEventListener('click', () => {
        if (checkIOS()) {
            linkIos.click();
        } else {
            if (mainScene.hasLoaded) {
                mainScene.enterVR(true);
                btnMain.style.display = 'none';
                selectionMenu.style.display = 'none';
                txtInfo.style.display = 'block';

                // mostramos cargando mientras arranca la sesión AR
                txtCargando.style.display = 'block';
            }
        }
    });

    mainScene.addEventListener('exit-vr', function () {
        txtInfo.style.display = 'none';
        txtCargando.style.display = 'none';
        btnMain.style.display = 'block';
        selectionMenu.style.display = 'block';
    });
};
