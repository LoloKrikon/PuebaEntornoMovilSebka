let archivoGltf = "";
let escalaModelo = "1 1 1";

function checkIOS() {
    return [
        'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
}

// Componente para rotar el modelo con el dedo
AFRAME.registerComponent('gesture-handler', {
    init: function () {
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.lastTouchX = 0;
        
        window.addEventListener('touchstart', this.handleTouchStart);
        window.addEventListener('touchmove', this.handleTouchMove);
    },
    remove: function() {
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
    },
    handleTouchStart: function(evt) {
        if (evt.touches.length === 1) {
            this.lastTouchX = evt.touches[0].pageX;
        }
    },
    handleTouchMove: function (evt) {
        if (evt.touches.length === 1 && this.el.sceneEl.is('ar-mode')) {
            let touchX = evt.touches[0].pageX;
            let deltaX = touchX - this.lastTouchX;
            this.lastTouchX = touchX;

            // Rotamos la entidad sobre el eje Y
            let rotation = this.el.getAttribute('rotation');
            rotation.y += deltaX * 0.5;
            this.el.setAttribute('rotation', rotation);
        }
    }
});

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
            txtCargando.style.display = 'none';

            sess.requestReferenceSpace('viewer').then((space) => {
                sess.requestHitTestSource({ space: space }).then((source) => {
                    ctx.hitSource = source;
                });
            });

            sess.requestReferenceSpace('local-floor').then((space) => {
                ctx.localSpace = space;
            }).catch(() => {
                sess.requestReferenceSpace('local').then((space) => {
                    ctx.localSpace = space;
                });
            });

            sess.addEventListener('select', () => {
                if (ctx.el.getAttribute('visible') && !ctx.modeloPuesto) {
                    let modelObj = document.createElement('a-entity');
                    modelObj.setAttribute('gltf-model', archivoGltf);
                    modelObj.setAttribute('position', ctx.el.getAttribute('position'));
                    modelObj.setAttribute('scale', escalaModelo);
                    modelObj.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
                    
                    // Añadimos el componente de rotación táctil
                    modelObj.setAttribute('gesture-handler', '');

                    ctx.el.sceneEl.appendChild(modelObj);
                    ctx.modeloActual = modelObj;
                    ctx.modeloPuesto = true;

                    ctx.el.setAttribute('visible', 'false');
                    txtInfo.innerText = "¡Colocado! Desliza para rotar";
                    btnReset.style.display = 'block';

                    setTimeout(() => { txtInfo.style.display = 'none'; }, 3000);
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

        btnReset.addEventListener('click', () => {
            if (ctx.modeloActual) {
                ctx.el.sceneEl.removeChild(ctx.modeloActual);
                ctx.modeloActual = null;
            }
            ctx.modeloPuesto = false;
            ctx.el.setAttribute('visible', 'false');
            btnReset.style.display = 'none';
            txtInfo.innerText = "Mueve el móvil para buscar el suelo";
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
