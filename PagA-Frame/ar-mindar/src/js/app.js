// ruta del modelo (android) - se asigna al elegir opción
let archivoGltf = "";

// comprobar si el sistema es iOS
function checkIOS() {
    return [
        'iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod'
    ].includes(navigator.platform)
        || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
        || (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream);
}

// componente hecho a mano para colocar el objeto donde toca la persona
AFRAME.registerComponent('hit-test-handler', {
    init: function () {
        let ctx = this;
        this.hitSource = null;
        this.localSpace = null;
        this.modeloPuesto = false;

        let txtInfo = document.getElementById('instruction');

        this.el.sceneEl.renderer.xr.addEventListener('sessionstart', () => {
            let sess = this.el.sceneEl.renderer.xr.getSession();

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
                    
                    // Aseguramos tamaño original (los castillos deberían venir bien escalados)
                    modelObj.setAttribute('scale', '1 1 1');
                    
                    modelObj.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');

                    ctx.el.sceneEl.appendChild(modelObj);
                    ctx.modeloPuesto = true;

                    ctx.el.setAttribute('visible', 'false');
                    txtInfo.innerText = "¡Colocado!";

                    setTimeout(() => { txtInfo.style.display = 'none'; }, 2000);
                }
            });
        });

        this.el.sceneEl.renderer.xr.addEventListener('sessionend', () => {
            // cuando cerramos el ar reseteamos cosas
            ctx.hitSource = null;
            txtInfo.style.display = 'none';
            document.getElementById('ar-button').style.display = 'block';
            ctx.modeloPuesto = false;
        });
    },

    tick: function () {
        // si ya lo hemos puesto no hacemos nada mas
        if (this.modeloPuesto) return;

        let txtInfo = document.getElementById('instruction');

        // si estamos dentro de ar buscando el hit
        if (this.el.sceneEl.is('ar-mode')) {
            if (!this.hitSource || !this.localSpace) return;

            let currentFrame = this.el.sceneEl.frame;
            if (!currentFrame) return;

            let hits = currentFrame.getHitTestResults(this.hitSource);

            if (hits.length > 0) {
                // pillamos la posicion en el plano
                let pose = hits[0].getPose(this.localSpace);

                // enseñamos el anillo
                this.el.setAttribute('visible', 'true');
                this.el.setAttribute('position', pose.transform.position);

                txtInfo.innerText = "Toca para poner el modelo";
            } else {
                // si no hay plano ocultamos el anillo
                this.el.setAttribute('visible', 'false');
                txtInfo.innerText = "Buscando el suelo...";
            }
        }
    }
});

// al cargar la pagina preparamos botones
window.onload = () => {
    let btnMain = document.getElementById('ar-button');
    let linkIos = document.getElementById('enlace-ios');
    let txtInfo = document.getElementById('instruction');
    let mainScene = document.querySelector('a-scene');
    
    let selectionMenu = document.getElementById('selection-menu');
    let optionButtons = document.querySelectorAll('.option-button');

    // Lógica dinámica para cualquier botón de opción usando data-attributes
    optionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Asignar los archivos
            archivoGltf = btn.getAttribute('data-glb');
            linkIos.href = btn.getAttribute('data-usdz');
            
            // Gestionar la clase 'active' visualmente
            optionButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Mostrar el botón principal
            btnMain.style.display = 'block';
        });
    });

    btnMain.addEventListener('click', () => {
        if (checkIOS()) {
            // en apple forzamos click al enlace usdz
            linkIos.click();
        } else {
            // en android le decimos a aframe que abra el webxr
            if (mainScene.hasLoaded) {
                mainScene.enterVR(true);
                btnMain.style.display = 'none';
                selectionMenu.style.display = 'none'; // ocultar menu en AR
                txtInfo.style.display = 'block';
            }
        }
    });

    mainScene.addEventListener('exit-vr', function () {
        txtInfo.style.display = 'none';
        btnMain.style.display = 'block';
        selectionMenu.style.display = 'block'; // mostrar menu al salir
    });
};
