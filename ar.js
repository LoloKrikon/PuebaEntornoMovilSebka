document.addEventListener('DOMContentLoaded', function () {
    var startBtn = document.getElementById('start-btn');
    var closeBtn = document.getElementById('close-btn');
    var landing = document.getElementById('landing');
    var arContainer = document.getElementById('ar-container');
    var scene = document.getElementById('ar-scene');
    var marker = document.getElementById('marker');
    var video = document.getElementById('ar-video');
    var started = false;

    startBtn.addEventListener('click', async function () {
        if (started) return;
        landing.classList.add('hidden');
        arContainer.classList.remove('hidden');

        try {
            await video.play();
            video.muted = false;
        } catch (e) {
            console.warn('video play fallo:', e);
        }

        if (scene.systems && scene.systems['mindar-image-system']) {
            scene.systems['mindar-image-system'].start();
            started = true;
        } else {
            scene.addEventListener('renderstart', function () {
                if (scene.systems['mindar-image-system']) {
                    scene.systems['mindar-image-system'].start();
                    started = true;
                }
            }, { once: true });
        }
    });

    closeBtn.addEventListener('click', function () {
        if (!started) return;
        if (scene.systems['mindar-image-system']) {
            scene.systems['mindar-image-system'].stop();
        }
        video.pause();
        video.muted = true;
        started = false;
        arContainer.classList.add('hidden');
        landing.classList.remove('hidden');
    });

    marker.addEventListener('targetFound', function () {
        video.play();
        video.muted = false;
    });

    marker.addEventListener('targetLost', function () {
        video.pause();
        video.muted = true;
    });
});
