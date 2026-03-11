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
                // si el anillo se esta viendo y no hemos puesto aun el modelo 3d
                if (ctx.el.getAttribute('visible') && !ctx.modeloPuesto) {

                    // creamos la entidad 3d
                    let modelObj = document.createElement('a-entity');
                    modelObj.setAttribute('gltf-model', archivoGltf);
                    modelObj.setAttribute('position', ctx.el.getAttribute('position'));
                    
                    // reducimos el tamaño porque el archivo que te mandaron es gigante (2%)
                    modelObj.setAttribute('scale', '0.02 0.02 0.02');
                    
                    // activamos las animaciones para que el robot se mueva en bucle
                    modelObj.setAttribute('animation-mixer', 'loop: repeat; timeScale: 1');

                    // lo añadimos a la escena
                    ctx.el.sceneEl.appendChild(modelObj);
                    ctx.modeloPuesto = true;

                    ctx.el.setAttribute('visible', 'false');
                    txtInfo.innerText = "¡Ya está!";

                    // quitar mensaje a los 2 segundos
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
    
    let btnOp1 = document.getElementById('btn-opcion1');
    let btnOp2 = document.getElementById('btn-opcion2');
    let selectionMenu = document.getElementById('selection-menu');

    // Lógica selección Opción 1
    btnOp1.addEventListener('click', () => {
        archivoGltf = "./assets/Robot_Happy.glb";
        linkIos.href = "./assets/Robot_Happy.usdz";
        btnOp1.classList.add('active');
        btnOp2.classList.remove('active');
        btnMain.style.display = 'block'; // Mostrar el botón Ver en AR
    });

    // Lógica selección Opción 2
    btnOp2.addEventListener('click', () => {
        archivoGltf = "./assets/Robot_Headplay.glb";
        linkIos.href = "./assets/Robot_Headplay.usdz";
        btnOp2.classList.add('active');
        btnOp1.classList.remove('active');
        btnMain.style.display = 'block'; // Mostrar el botón Ver en AR
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
