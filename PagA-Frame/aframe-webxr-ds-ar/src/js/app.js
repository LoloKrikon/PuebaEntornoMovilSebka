import { Utils } from './utils.js';
import { ARState } from './components.js'; // Solo para actualizar el estado
import { MonumentData, generateButtons } from './monuments.js';

// Variables para seguimiento del modelo seleccionado actualmente
let nombreActual = "";
let infoActual = "";

window.onload = () => {
    // Referencias al DOM
    const elements = {
        btnVer: document.getElementById('ar-button'),
        btnInfo: document.getElementById('info-button'),
        cardInfo: document.getElementById('info-card'),
        btnCerrarInfo: document.getElementById('close-info'),
        tutorial: document.getElementById('tutorial'),
        btnCerrarTutorial: document.getElementById('close-tutorial'),
        iosLink: document.getElementById('enlace-ios'),
        info: document.getElementById('instruction'),
        loading: document.getElementById('loading-text'),
        escena: document.querySelector('a-scene'),
        menu: document.getElementById('selection-menu'),
        optionsGrid: document.querySelector('.options-grid'),
        testContainer: document.querySelector('.test-container')
    };

    // 1. Tutorial logic
    if (!localStorage.getItem('tutorialVisto')) {
        elements.tutorial.style.display = 'block';
    }

    elements.btnCerrarTutorial.addEventListener('click', () => {
        elements.tutorial.style.display = 'none';
        localStorage.setItem('tutorialVisto', 'true');
    });

    // 2. Info card logic
    elements.btnInfo.addEventListener('click', () => {
        elements.cardInfo.style.display = 'block';
    });

    elements.btnCerrarInfo.addEventListener('click', () => {
        elements.cardInfo.style.display = 'none';
    });

    // 3. Generate monument buttons and handle selection
    // Limpiamos los contenedores por si acaso (aunque ahora los generamos de cero)
    elements.optionsGrid.innerHTML = '';
    elements.testContainer.innerHTML = '';

    generateButtons(elements.optionsGrid, elements.testContainer, (monumento, btn) => {
        // Actualizar estado compartido
        ARState.modeloUrl = monumento.glb;
        ARState.escalaActual = monumento.scale || '1 1 1';
        
        // Actualizar variables locales para la UI
        nombreActual = monumento.name;
        infoActual = monumento.info;
        elements.iosLink.href = monumento.usdz;

        // Feedback visual en botones
        document.querySelectorAll('.option-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Mostrar botones de acción
        elements.btnVer.style.display = 'block';
        elements.btnInfo.style.display = 'flex';

        // Actualizar ficha informativa inmediatamente
        document.getElementById('info-title').innerText = nombreActual;
        document.getElementById('info-text').innerText = infoActual;
    });

    // 4. AR Start logic
    elements.btnVer.addEventListener('click', () => {
        if (Utils.esApple()) {
            elements.iosLink.click();
        } else {
            if (elements.escena.hasLoaded) {
                elements.escena.enterVR(true);
                elements.btnVer.style.display = 'none';
                elements.menu.style.display = 'none';
                elements.info.style.display = 'block';
                elements.loading.style.display = 'block';
            }
        }
    });

    // 5. Scene event handling
    elements.escena.addEventListener('exit-vr', () => {
        elements.info.style.display = 'none';
        elements.loading.style.display = 'none';
        elements.btnVer.style.display = 'block';
        elements.menu.style.display = 'block';
        elements.btnInfo.style.display = 'block';
        elements.cardInfo.style.display = 'none';
    });
};
