let modeloUrl = "";
let escalaActual = "1 1 1";
let nombreActual = "";
let infoActual = "";

// para saber si es iphone o no
function esApple() {
    return [
        'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
}

// aqui va el tema de mover y girar el modelo con los dedos
AFRAME.registerComponent('gestos', {
    init: function () {
        this.moverDedo = this.moverDedo.bind(this);
        this.inicioToque = this.inicioToque.bind(this);
        this.xAnterior = 0;
        this.distanciaInicial = 0;
        this.escalaInicial = 1;

        window.addEventListener('touchstart', this.inicioToque);
        window.addEventListener('touchmove', this.moverDedo);
    },
    remove: function() {
        window.removeEventListener('touchstart', this.inicioToque);
        window.removeEventListener('touchmove', this.moverDedo);
    },
    inicioToque: function(e) {
        if (e.touches.length === 1) {
            this.xAnterior = e.touches[0].pageX;
        } else if (e.touches.length === 2) {
            this.distanciaInicial = this.getDist(e.touches);
            this.escalaInicial = this.el.getAttribute('scale').x;
        }
    },
    getDist: function(t) {
        let dx = t[0].pageX - t[1].pageX;
        let dy = t[0].pageY - t[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    },
    moverDedo: function (e) {
        if (!this.el.sceneEl.is('ar-mode')) return;

        if (e.touches.length === 1) {
            // rotar (1 dedo)
            let xToque = e.touches[0].pageX;
            let diffX = xToque - this.xAnterior;
            this.xAnterior = xToque;

            let rot = this.el.getAttribute('rotation');
            rot.y += diffX * 0.5;
            this.el.setAttribute('rotation', rot);
            
        } else if (e.touches.length === 2) {
            // zoom / escala (2 dedos)
            let dActual = this.getDist(e.touches);
            let f = dActual / this.distanciaInicial;
            let sFinal = this.escalaInicial * f;
            
            // limites para q no se rompa
            sFinal = Math.min(Math.max(sFinal, 0.00001), 2);
            this.el.setAttribute('scale', {x: sFinal, y: sFinal, z: sFinal});
        }
    }
});

// manejamos el hit test para el suelo
AFRAME.registerComponent('hit-test-handler', {
    init: function () {
        let self = this;
        this.hitSource = null;
        this.localSpace = null;
        this.yaPuesto = false;
        this.objModelo = null;

        let info = document.getElementById('instruction');
        let loading = document.getElementById('loading-text');

        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            let sess = this.el.sceneEl.renderer.xr.getSession();
            loading.style.display = 'none';

            sess.requestReferenceSpace('viewer').then((sp) => {
                sess.requestHitTestSource({ space: sp }).then((src) => {
                    self.hitSource = src;
                });
            });

            // intentamos pillar el suelo
            sess.requestReferenceSpace('local-floor').then((sp) => {
                self.localSpace = sp;
            }).catch(() => {
                sess.requestReferenceSpace('local').then((sp) => {
                    self.localSpace = sp;
                });
            });

            sess.addEventListener('select', () => {
                if (self.el.getAttribute('visible') && !self.yaPuesto) {
                    let m = document.createElement('a-entity');
                    m.setAttribute('gltf-model', modeloUrl);
                    m.setAttribute('position', self.el.getAttribute('position'));
                    
                    let s = escalaActual.split(' ');
                    m.setAttribute('scale', {x: parseFloat(s[0]), y: parseFloat(s[1]), z: parseFloat(s[2])});
                    
                    m.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
                    m.setAttribute('gestos', ''); // metemos lo de girar y zoom

                    self.el.sceneEl.appendChild(m);
                    self.objModelo = m;
                    self.yaPuesto = true;

                    self.el.setAttribute('visible', 'false');
                    info.innerText = "¡Listo! Gira con 1 dedo o haz zoom con 2";

                    setTimeout(() => { info.style.display = 'none'; }, 4000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            self.hitSource = null;
            info.style.display = 'none';
            loading.style.display = 'none';
            document.getElementById('ar-button').style.display = 'block';
            self.yaPuesto = false;
            self.objModelo = null;
        });
    },

    tick: function () {
        if (this.yaPuesto) return;
        let info = document.getElementById('instruction');

        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.hitSource || !this.localSpace) return;
            let frame = this.el.sceneEl.frame;
            if (!frame) return;

            let hits = frame.getHitTestResults(this.hitSource);
            if (hits.length > 0) {
                let pose = hits[0].getPose(this.localSpace);
                this.el.setAttribute('visible', 'true');
                this.el.setAttribute('position', pose.transform.position);
                info.innerText = "Toca para plantar el modelo";
            } else {
                this.el.setAttribute('visible', 'false');
                info.innerText = "Buscando suelo...";
            }
        }
    }
});

// al cargar la pagina
window.onload = () => {
    let btnVer = document.getElementById('ar-button');
    let btnInfo = document.getElementById('info-button');
    let cardInfo = document.getElementById('info-card');
    let btnCerrarInfo = document.getElementById('close-info');
    let iosLink = document.getElementById('enlace-ios');
    let info = document.getElementById('instruction');
    let loading = document.getElementById('loading-text');
    let escena = document.querySelector('a-scene');
    let menu = document.getElementById('selection-menu');
    let botones = document.querySelectorAll('.option-button');

    botones.forEach(b => {
        b.addEventListener('click', () => {
            modeloUrl = b.getAttribute('data-glb');
            iosLink.href = b.getAttribute('data-usdz');
            escalaActual = b.getAttribute('data-scale') || '1 1 1';
            
            // guardamos info para la ficha
            nombreActual = b.innerText;
            infoActual = b.getAttribute('data-info');

            botones.forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            btnVer.style.display = 'block';
            
            // mostramos el boton info por si quiere leer antes de entrar
            btnInfo.style.display = 'flex';
        });
    });

    btnInfo.addEventListener('click', () => {
        document.getElementById('info-title').innerText = nombreActual;
        document.getElementById('info-text').innerText = infoActual;
        cardInfo.style.display = 'block';
    });

    btnCerrarInfo.addEventListener('click', () => {
        cardInfo.style.display = 'none';
    });

    btnVer.addEventListener('click', () => {
        if (esApple()) {
            iosLink.click();
        } else {
            if (escena.hasLoaded) {
                escena.enterVR(true);
                btnVer.style.display = 'none';
                menu.style.display = 'none';
                info.style.display = 'block';
                loading.style.display = 'block';
            }
        }
    });

    escena.addEventListener('exit-vr', () => {
        info.style.display = 'none';
        loading.style.display = 'none';
        btnVer.style.display = 'block';
        menu.style.display = 'block';
        btnInfo.style.display = 'block';
        cardInfo.style.display = 'none';
    });
};
