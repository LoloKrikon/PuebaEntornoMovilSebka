document.addEventListener('DOMContentLoaded', function () {
    const startBtn = document.getElementById('start-ar-btn');
    const stopBtn = document.getElementById('stop-ar-btn');
    const landing = document.getElementById('landing');
    const arContainer = document.getElementById('ar-container');
    const arScene = document.getElementById('ar-scene');
    const marker = document.getElementById('marker');
    const arHint = document.getElementById('ar-hint');
    const loadingStatus = document.getElementById('loading-status');
    const btnText = startBtn.querySelector('.btn-ar-text');

    let arStarted = false;

    // Wait for A-Frame assets to finish loading
    arScene.addEventListener('loaded', function () {
        startBtn.disabled = false;
        startBtn.classList.remove('loading');
        btnText.textContent = 'Iniciar Experiencia AR';
        loadingStatus.textContent = 'Modelo listo. ¡Pulsa para empezar!';
        loadingStatus.classList.add('ready');
    });

    // Handle asset load errors
    arScene.addEventListener('error', function () {
        btnText.textContent = 'Error al cargar';
        loadingStatus.textContent = 'No se pudo cargar el modelo. Comprueba assets/model.glb';
        loadingStatus.classList.add('error');
    });

    // START AR
    startBtn.addEventListener('click', async function () {
        if (arStarted) return;

        landing.classList.add('hidden');
        arContainer.classList.remove('hidden');
        arHint.classList.remove('hidden');

        try {
            const mindARSystem = arScene.systems['mindar-image-system'];
            if (mindARSystem) {
                await mindARSystem.start();
                arStarted = true;
            } else {
                arScene.addEventListener('renderstart', async function () {
                    const sys = arScene.systems['mindar-image-system'];
                    if (sys) {
                        await sys.start();
                        arStarted = true;
                    }
                }, { once: true });
            }
        } catch (e) {
            console.error('Error starting AR:', e);
            loadingStatus.textContent = 'Error al iniciar la cámara. ¿Permiso denegado?';
            loadingStatus.classList.add('error');
            landing.classList.remove('hidden');
            arContainer.classList.add('hidden');
        }
    });

    // STOP AR
    stopBtn.addEventListener('click', function () {
        if (!arStarted) return;

        const mindARSystem = arScene.systems['mindar-image-system'];
        if (mindARSystem) {
            mindARSystem.stop();
        }
        arStarted = false;

        arContainer.classList.add('hidden');
        landing.classList.remove('hidden');
    });

    // TARGET FOUND / LOST events
    if (marker) {
        marker.addEventListener('targetFound', function () {
            arHint.classList.add('hidden');
        });

        marker.addEventListener('targetLost', function () {
            arHint.classList.remove('hidden');
        });
    }
});
