import { Utils } from './utils.js';
import { ARState } from './components.js';
import { MonumentData, generateButtons } from './monuments.js';

let currentName = "";
let currentInfo = "";

window.onload = () => {
    const UI = {
        arBtn: document.getElementById('ar-button'),
        infoBtn: document.getElementById('info-button'),
        infoCard: document.getElementById('info-card'),
        closeCard: document.getElementById('close-info'),
        tutorial: document.getElementById('tutorial'),
        closeTutorial: document.getElementById('close-tutorial'),
        iosLink: document.getElementById('enlace-ios'),
        instruction: document.getElementById('instruction'),
        loading: document.getElementById('loading-text'),
        scene: document.querySelector('a-scene'),
        menu: document.getElementById('selection-menu'),
        optionsGrid: document.querySelector('.options-grid'),
        testGrid: document.querySelector('.test-container')
    };

    if (!localStorage.getItem('tutorial-finished')) {
        UI.tutorial.style.display = 'block';
    }

    UI.closeTutorial.addEventListener('click', () => {
        UI.tutorial.style.display = 'none';
        localStorage.setItem('tutorial-finished', 'true');
    });

    UI.infoBtn.addEventListener('click', () => {
        UI.infoCard.style.display = 'block';
    });

    UI.closeCard.addEventListener('click', () => {
        UI.infoCard.style.display = 'none';
    });

    UI.optionsGrid.innerHTML = '';
    UI.testGrid.innerHTML = '';

    generateButtons(UI.optionsGrid, UI.testGrid, (monument, btn) => {
        ARState.modelUrl = monument.glb;
        ARState.currentScale = monument.scale || '1 1 1';
        
        currentName = monument.name;
        currentInfo = monument.info;
        UI.iosLink.href = monument.usdz;

        document.querySelectorAll('.option-button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        UI.arBtn.style.display = 'block';
        UI.infoBtn.style.display = 'flex';

        document.getElementById('info-title').innerText = currentName;
        document.getElementById('info-text').innerText = currentInfo;
    });

    UI.arBtn.addEventListener('click', () => {
        if (Utils.isAppleDevice()) {
            UI.iosLink.click();
        } else {
            if (UI.scene.hasLoaded) {
                UI.scene.enterVR(true);
                UI.arBtn.style.display = 'none';
                UI.menu.style.display = 'none';
                UI.instruction.style.display = 'block';
                UI.loading.style.display = 'block';
            }
        }
    });

    UI.scene.addEventListener('exit-vr', () => {
        UI.instruction.style.display = 'none';
        UI.loading.style.display = 'none';
        UI.arBtn.style.display = 'block';
        UI.menu.style.display = 'block';
        UI.infoBtn.style.display = 'block';
        UI.infoCard.style.display = 'none';
    });
};
