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

// material para sombras reales
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

// componente para los puntos de informacion (hotspots)
AFRAME.registerComponent('punto-info', {
    schema: {
        texto: {type: 'string', default: 'Información'}
    },
    init: function () {
        let el = this.el;
        let data = this.data;
        
        // creamos el circulo flotante
        el.setAttribute('geometry', {primitive: 'circle', radius: 0.08});
        el.setAttribute('material', {color: '#007AFF', opacity: 0.8, emissive: '#007AFF', emissiveIntensity: 0.5});
        el.setAttribute('class', 'interactuable');
        
        // animacion de latido
        el.setAttribute('animation', {
            property: 'scale',
            dir: 'alternate',
            dur: 1000,
            easing: 'easeInOutSine',
            loop: true,
            to: '1.2 1.2 1.2'
        });

        // icono 'i' dentro del punto
        let texto = document.createElement('a-text');
        texto.setAttribute('value', 'i');
        texto.setAttribute('align', 'center');
        texto.setAttribute('color', 'white');
        texto.setAttribute('width', '2');
        texto.setAttribute('position', '0 0 0.01');
        el.appendChild(texto);

        // al hacer click o tocar
        el.addEventListener('click', () => {
            document.getElementById('info-title').innerText = "Punto de Interés";
            document.getElementById('info-text').innerText = data.texto;
            document.getElementById('info-card').style.display = 'block';
        });
    }
});

// mover y girar con los dedos
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
            this.el.setAttribute('scale', {x: sFinal, y: sFinal, z: sFinal});
        }
    }
});

// detector de suelo y colocar modelo
AFRAME.registerComponent('hit-test-handler', {
    init: function () {
        let self = this;
        this.hitSource = null;
        this.localSpace = null;
        this.yaPuesto = false;
        this.objModelo = null;
        this.planoSombra = null;
        this.puntos = [];

        let info = document.getElementById('instruction');
        let loading = document.getElementById('loading-text');
        let audio = document.getElementById('sonido-ar');

        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            let sess = this.el.sceneEl.renderer.xr.getSession();
            loading.style.display = 'none';
            
            // play sonido ambiente
            audio.play().catch(() => console.log("esperando toque para audio"));

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
                if (self.el.getAttribute('visible') && !self.yaPuesto) {
                    let m = document.createElement('a-entity');
                    m.setAttribute('gltf-model', modeloUrl);
                    m.setAttribute('position', self.el.getAttribute('position'));
                    
                    // escala inicial en 0 para animacion de entrada
                    m.setAttribute('scale', '0 0 0');
                    
                    let s = escalaActual.split(' ');
                    let fScale = {x: parseFloat(s[0]), y: parseFloat(s[1]), z: parseFloat(s[2])};

                    // animacion de crecimiento
                    m.setAttribute('animation', {
                        property: 'scale',
                        to: fScale.x + ' ' + fScale.y + ' ' + fScale.z,
                        dur: 1000,
                        easing: 'easeOutElastic'
                    });
                    
                    m.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
                    m.setAttribute('gestos', '');
                    m.setAttribute('shadow', 'cast: true; receive: false');

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
                    self.yaPuesto = true;

                    // añadir hotspots de ejemplo
                    this.ponerPuntos(self.el.getAttribute('position'));

                    self.el.setAttribute('visible', 'false');
                    info.innerText = "¡Listo! Gira con 1 dedo o haz zoom con 2";
                    setTimeout(() => { info.style.display = 'none'; }, 4000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            self.hitSource = null;
            audio.pause();
            audio.currentTime = 0;
            if (self.planoSombra) self.el.sceneEl.removeChild(self.planoSombra);
            if (self.objModelo) self.el.sceneEl.removeChild(self.objModelo);
            self.puntos.forEach(pt => self.el.sceneEl.removeChild(pt));
            self.puntos = [];
            document.getElementById('ar-button').style.display = 'block';
            self.yaPuesto = false;
        });
    },

    ponerPuntos: function(pos) {
        let puntosData = [
            {pos: {x: pos.x + 0.3, y: pos.y + 0.5, z: pos.z}, txt: "Esta torre servía como punto de vigilancia principal."},
            {pos: {x: pos.x - 0.2, y: pos.y + 0.3, z: pos.z + 0.2}, txt: "La entrada principal fue reconstruida en el siglo XV."}
        ];

        puntosData.forEach(d => {
            let pt = document.createElement('a-entity');
            pt.setAttribute('punto-info', {texto: d.txt});
            pt.setAttribute('position', d.pos);
            pt.setAttribute('look-at', '[camera]'); // para que miren siempre al usuario
            this.el.sceneEl.appendChild(pt);
            this.puntos.push(pt);
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
            nombreActual = b.innerText;
            infoActual = b.getAttribute('data-info');
            botones.forEach(btn => btn.classList.remove('active'));
            b.classList.add('active');
            btnVer.style.display = 'block';
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
