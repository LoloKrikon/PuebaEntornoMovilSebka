document.addEventListener('DOMContentLoaded', function () {
    var startBtn = document.getElementById('start-ar-btn');
    var stopBtn = document.getElementById('stop-ar-btn');
    var landing = document.getElementById('landing');
    var arContainer = document.getElementById('ar-container');
    var scene = document.getElementById('ar-scene');
    var marker = document.getElementById('marker');
    var hint = document.getElementById('ar-hint');
    var status = document.getElementById('loading-status');
    var btnText = startBtn.querySelector('.btn-ar-text');
    var video = document.getElementById('ar-video');
    var started = false;

    scene.addEventListener('loaded', function () {
        startBtn.disabled = false;
        btnText.textContent = 'Iniciar Experiencia AR';
        status.textContent = 'Pulsa para empezar';
        status.classList.add('ready');
    });

    // iniciar AR
    startBtn.addEventListener('click', async function () {
        if (started) return;
        landing.classList.add('hidden');
        arContainer.classList.remove('hidden');
        hint.classList.remove('hidden');

        try {
            await video.play();
            video.muted = false;
        } catch (e) {
            console.warn('video play fallo:', e);
        }

        try {
            var sys = scene.systems['mindar-image-system'];
            if (sys) {
                await sys.start();
                started = true;
            } else {
                scene.addEventListener('renderstart', async function () {
                    var s = scene.systems['mindar-image-system'];
                    if (s) {
                        await s.start();
                        started = true;
                    }
                }, { once: true });
            }
        } catch (e) {
            console.error('error camara:', e);
            landing.classList.remove('hidden');
            arContainer.classList.add('hidden');
        }
    });

    // cerrar AR
    stopBtn.addEventListener('click', function () {
        if (!started) return;
        var sys = scene.systems['mindar-image-system'];
        if (sys) sys.stop();
        video.pause();
        video.muted = true;
        started = false;
        arContainer.classList.add('hidden');
        landing.classList.remove('hidden');
    });

    // cuando detecta o pierde la imagen
    marker.addEventListener('targetFound', function () {
        hint.classList.add('hidden');
        video.play();
        video.muted = false;
    });

    marker.addEventListener('targetLost', function () {
        hint.classList.remove('hidden');
        video.pause();
        video.muted = true;
    });
});
