let archivoGltf = "";
let escalaModelo = "1 1 1";

function checkIOS() {
    return [
        'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
}

// COMPONENTE DE GESTOS AVANZADOS (Rotar, Escalar y Mover)
AFRAME.registerComponent('gesture-handler', {
    init: function () {
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.lastTouchX = 0;
        this.initialDistance = 0;
        this.initialScale = 1;

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
        } else if (evt.touches.length === 2) {
            this.initialDistance = this.getDistance(evt.touches);
            this.initialScale = this.el.getAttribute('scale').x;
        }
    },
    getDistance: function(touches) {
        let dx = touches[0].pageX - touches[1].pageX;
        let dy = touches[0].pageY - touches[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    },
    handleTouchMove: function (evt) {
        if (!this.el.sceneEl.is('ar-mode')) return;

        if (evt.touches.length === 1) {
            // ROTACIÓN (1 dedo)
            let touchX = evt.touches[0].pageX;
            let deltaX = touchX - this.lastTouchX;
            this.lastTouchX = touchX;

            let rotation = this.el.getAttribute('rotation');
            rotation.y += deltaX * 0.5;
            this.el.setAttribute('rotation', rotation);
            
        } else if (evt.touches.length === 2) {
            // ESCALADO / PINCH (2 dedos)
            let currentDistance = this.getDistance(evt.touches);
            let factor = currentDistance / this.initialDistance;
            let newScale = this.initialScale * factor;
            
            // Limitamos un poco la escala para que no desaparezca ni sea infinito
            newScale = Math.min(Math.max(newScale, 0.00001), 2);
            this.el.setAttribute('scale', {x: newScale, y: newScale, z: newScale});
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

            sess.addEventListener('select', (evt) => {
                // Solo ponemos el modelo si NO hay ya uno puesto
                if (ctx.el.getAttribute('visible') && !ctx.modeloPuesto) {
                    let modelObj = document.createElement('a-entity');
                    modelObj.setAttribute('gltf-model', archivoGltf);
                    modelObj.setAttribute('position', ctx.el.getAttribute('position'));
                    
                    // Convertimos la string de escala del botón a objeto de A-Frame
                    let s = escalaModelo.split(' ');
                    modelObj.setAttribute('scale', {x: parseFloat(s[0]), y: parseFloat(s[1]), z: parseFloat(s[2])});
                    
                    modelObj.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
                    modelObj.setAttribute('gesture-handler', '');

                    ctx.el.sceneEl.appendChild(modelObj);
                    ctx.modeloActual = modelObj;
                    ctx.modeloPuesto = true;

                    ctx.el.setAttribute('visible', 'false');
                    txtInfo.innerText = "¡Colocado! Usa 1 dedo para rotar y 2 para escala";

                    setTimeout(() => { txtInfo.style.display = 'none'; }, 4000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            ctx.hitSource = null;
            txtInfo.style.display = 'none';
            txtCargando.style.display = 'none';
            document.getElementById('ar-button').style.display = 'block';
            ctx.modeloPuesto = false;
            ctx.modeloActual = null;
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
                txtInfo.innerText = "Buscando superficie plana...";
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
