/**
 * Registro de componentes y shaders de A-Frame
 */

// Estado compartido (sería mejor pasarlo por atributos, pero para el refactor mantenemos la lógica)
export const ARState = {
    modeloUrl: "",
    escalaActual: "1 1 1",
    yaPuesto: false
};

// Material para sombras reales
AFRAME.registerShader('shadow-material', {
    schema: { opacity: { type: 'number', default: 0.4 } },
    init: function (data) {
        this.material = new THREE.ShadowMaterial();
        this.material.opacity = data.opacity;
    },
    update: function (data) {
        this.material.opacity = data.opacity;
    }
});

// Modelo transparente (fantasma)
AFRAME.registerComponent('copia-fantasma', {
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            let obj = this.el.getObject3D('mesh');
            if (obj) {
                obj.traverse(node => {
                    if (node.isMesh) {
                        node.material.transparent = true;
                        node.material.opacity = 0.5;
                    }
                });
            }
        });
    }
});

// Gestos táctiles
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
    inicioToque: function (e) {
        if (e.touches.length === 1) {
            this.xAnterior = e.touches[0].pageX;
        } else if (e.touches.length === 2) {
            this.distanciaInicial = this.getDist(e.touches);
            this.escalaInicial = this.el.getAttribute('scale').x;
        }
    },
    getDist: function (t) {
        let dx = t[0].pageX - t[1].pageX;
        let dy = t[0].pageY - t[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    },
    moverDedo: function (e) {
        if (!this.el.sceneEl.is('ar-mode')) return;
        if (e.touches.length === 1) {
            let xToque = e.touches[0].pageX;
            let diffX = xToque - this.xAnterior;
            this.xAnterior = xToque;
            let rot = this.el.getAttribute('rotation');
            rot.y += diffX * 0.5;
            this.el.setAttribute('rotation', rot);
        } else if (e.touches.length === 2) {
            let dActual = this.getDist(e.touches);
            let f = dActual / this.distanciaInicial;
            let sFinal = this.escalaInicial * f;
            sFinal = Math.min(Math.max(sFinal, 0.00001), 2);
            this.el.setAttribute('scale', { x: sFinal, y: sFinal, z: sFinal });
        }
    }
});

// Detector de suelo y colocación
AFRAME.registerComponent('hit-test-handler', {
    init: function () {
        let self = this;
        this.hitSource = null;
        this.localSpace = null;
        this.objModelo = null;
        this.planoSombra = null;
        this.preview = null;

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

            sess.requestReferenceSpace('local-floor').then((sp) => {
                self.localSpace = sp;
            }).catch(() => {
                sess.requestReferenceSpace('local').then((sp) => {
                    self.localSpace = sp;
                });
            });

            sess.addEventListener('select', () => {
                if (self.el.getAttribute('visible') && !ARState.yaPuesto) {
                    let m = document.createElement('a-entity');
                    m.setAttribute('gltf-model', ARState.modeloUrl);
                    m.setAttribute('position', self.el.getAttribute('position'));

                    let s = ARState.escalaActual.split(' ');
                    m.setAttribute('scale', { x: parseFloat(s[0]), y: parseFloat(s[1]), z: parseFloat(s[2]) });

                    m.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
                    m.setAttribute('gestos', '');
                    m.setAttribute('shadow', 'cast: true; receive: false');
                    m.setAttribute('material', 'roughness: 0.5; metalness: 0.5');

                    let p = document.createElement('a-plane');
                    p.setAttribute('rotation', '-90 0 0');
                    p.setAttribute('position', self.el.getAttribute('position'));
                    p.setAttribute('width', '15');
                    p.setAttribute('height', '15');
                    p.setAttribute('material', 'shader: shadow-material; opacity: 0.4');
                    p.setAttribute('shadow', 'receive: true; cast: false');

                    self.el.sceneEl.appendChild(m);
                    self.el.sceneEl.appendChild(p);
                    self.objModelo = m;
                    self.planoSombra = p;
                    ARState.yaPuesto = true;

                    self.el.setAttribute('visible', 'false');
                    info.innerText = "¡Listo! Gira con 1 dedo o haz zoom con 2";
                    setTimeout(() => { info.style.display = 'none'; }, 4000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            self.hitSource = null;
            if (self.planoSombra) self.el.sceneEl.removeChild(self.planoSombra);
            if (self.objModelo) self.el.sceneEl.removeChild(self.objModelo);
            if (self.preview) self.el.removeChild(self.preview);
            self.preview = null;
            document.getElementById('ar-button').style.display = 'block';
            ARState.yaPuesto = false;
        });
    },

    updatePreview: function () {
        if (this.preview) {
            this.el.removeChild(this.preview);
        }
        let p = document.createElement('a-entity');
        p.setAttribute('gltf-model', ARState.modeloUrl);

        let s = ARState.escalaActual.split(' ');
        p.setAttribute('scale', { x: parseFloat(s[0]), y: parseFloat(s[1]), z: parseFloat(s[2]) });

        p.setAttribute('copia-fantasma', '');
        this.el.appendChild(p);
        this.preview = p;
    },

    tick: function () {
        if (ARState.yaPuesto) return;
        let info = document.getElementById('instruction');
        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.preview) this.updatePreview();
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
