export const ARState = {
    modelUrl: "",
    currentScale: "1 1 1",
    isPlaced: false
};

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

AFRAME.registerComponent('ghost-model', {
    init: function () {
        this.el.addEventListener('model-loaded', () => {
            const mesh = this.el.getObject3D('mesh');
            if (mesh) {
                mesh.traverse(node => {
                    if (node.isMesh) {
                        node.material.transparent = true;
                        node.material.opacity = 0.5;
                    }
                });
            }
        });
    }
});

AFRAME.registerComponent('ar-controls', {
    init: function () {
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.prevX = 0;
        this.initialDist = 0;
        this.initialScale = 1;

        window.addEventListener('touchstart', this.handleTouchStart);
        window.addEventListener('touchmove', this.handleTouchMove);
    },

    handleTouchStart: function (e) {
        if (e.touches.length === 1) {
            this.prevX = e.touches[0].pageX;
        } else if (e.touches.length === 2) {
            this.initialDist = this.getDistance(e.touches);
            this.initialScale = this.el.getAttribute('scale').x;
        }
    },

    getDistance: function (t) {
        const dx = t[0].pageX - t[1].pageX;
        const dy = t[0].pageY - t[1].pageY;
        return Math.sqrt(dx * dx + dy * dy);
    },

    handleTouchMove: function (e) {
        if (!this.el.sceneEl.is('ar-mode')) return;

        if (e.touches.length === 1) {
            const touchX = e.touches[0].pageX;
            const diffX = touchX - this.prevX;
            this.prevX = touchX;

            const rotation = this.el.getAttribute('rotation');
            rotation.y += diffX * 0.5;
            this.el.setAttribute('rotation', rotation);
        } else if (e.touches.length === 2) {
            const currentDist = this.getDistance(e.touches);
            const factor = currentDist / this.initialDist;
            let finalScale = this.initialScale * factor;
            
            finalScale = Math.min(Math.max(finalScale, 0.001), 2);
            this.el.setAttribute('scale', { x: finalScale, y: finalScale, z: finalScale });
        }
    }
});

AFRAME.registerComponent('hit-test-handler', {
    init: function () {
        const self = this;
        this.hitSource = null;
        this.localSpace = null;
        this.modelObj = null;
        this.shadowPlane = null;
        this.preview = null;

        const info = document.getElementById('instruction');
        const loading = document.getElementById('loading-text');

        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            const session = this.el.sceneEl.renderer.xr.getSession();
            loading.style.display = 'none';

            session.requestReferenceSpace('viewer').then((space) => {
                session.requestHitTestSource({ space: space }).then((source) => {
                    self.hitSource = source;
                });
            });

            session.requestReferenceSpace('local-floor').then((space) => {
                self.localSpace = space;
            }).catch(() => {
                session.requestReferenceSpace('local').then((space) => {
                    self.localSpace = space;
                });
            });

            session.addEventListener('select', () => {
                if (self.el.getAttribute('visible') && !ARState.isPlaced) {
                    const model = document.createElement('a-entity');
                    model.setAttribute('gltf-model', ARState.modelUrl);
                    model.setAttribute('position', self.el.getAttribute('position'));

                    const scale = ARState.currentScale.split(' ');
                    model.setAttribute('scale', { 
                        x: parseFloat(scale[0]), 
                        y: parseFloat(scale[1]), 
                        z: parseFloat(scale[2]) 
                    });

                    model.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');
                    model.setAttribute('ar-controls', '');
                    model.setAttribute('shadow', 'cast: true; receive: false');
                    model.setAttribute('material', 'roughness: 0.5; metalness: 0.5');

                    const plane = document.createElement('a-plane');
                    plane.setAttribute('rotation', '-90 0 0');
                    plane.setAttribute('position', self.el.getAttribute('position'));
                    plane.setAttribute('width', '15');
                    plane.setAttribute('height', '15');
                    plane.setAttribute('material', 'shader: shadow-material; opacity: 0.4');
                    plane.setAttribute('shadow', 'receive: true; cast: false');

                    self.el.sceneEl.appendChild(model);
                    self.el.sceneEl.appendChild(plane);

                    self.modelObj = model;
                    self.shadowPlane = plane;
                    ARState.isPlaced = true;

                    self.el.setAttribute('visible', 'false');
                    info.innerText = "Enjoy the view! Rotate with one finger or zoom with two.";
                    setTimeout(() => { info.style.display = 'none'; }, 4000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            self.hitSource = null;
            if (self.shadowPlane) self.el.sceneEl.removeChild(self.shadowPlane);
            if (self.modelObj) self.el.sceneEl.removeChild(self.modelObj);
            if (self.preview) self.el.removeChild(self.preview);
            
            self.preview = null;
            document.getElementById('ar-button').style.display = 'block';
            ARState.isPlaced = false;
        });
    },

    updatePreview: function () {
        if (this.preview) this.el.removeChild(this.preview);

        const preview = document.createElement('a-entity');
        preview.setAttribute('gltf-model', ARState.modelUrl);

        const scale = ARState.currentScale.split(' ');
        preview.setAttribute('scale', { 
            x: parseFloat(scale[0]), 
            y: parseFloat(scale[1]), 
            z: parseFloat(scale[2]) 
        });

        preview.setAttribute('ghost-model', '');
        this.el.appendChild(preview);
        this.preview = preview;
    },

    tick: function () {
        if (ARState.isPlaced) return;

        const info = document.getElementById('instruction');
        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.preview) this.updatePreview();
            if (!this.hitSource || !this.localSpace) return;

            const frame = this.el.sceneEl.frame;
            if (!frame) return;

            const hits = frame.getHitTestResults(this.hitSource);
            if (hits.length > 0) {
                const pose = hits[0].getPose(this.localSpace);
                this.el.setAttribute('visible', 'true');
                this.el.setAttribute('position', pose.transform.position);
                info.innerText = "Tap anywhere to place the model";
            } else {
                this.el.setAttribute('visible', 'false');
                info.innerText = "Finding floor...";
            }
        }
    }
});
