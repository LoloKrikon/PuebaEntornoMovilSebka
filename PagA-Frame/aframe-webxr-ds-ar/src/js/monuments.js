/**
 * Datos y gestión de los monumentos
 */

export const MonumentData = [
    {
        id: 'alanis',
        name: 'Alanís',
        glb: './assets/GLB/CastilloAlanisBAKE.glb',
        usdz: './assets/USDZ/CastilloAlanisBAKE.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Fortificación mudéjar del siglo XIV. Situada sobre un cerro, fue clave en la defensa de la Sierra Norte de Sevilla.'
    },
    {
        id: 'constantina',
        name: 'Constantina',
        glb: './assets/GLB/CastilloConstantinaBAKE.glb',
        usdz: './assets/USDZ/CastilloConstantinaBAKE.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Fortaleza de origen árabe construida sobre restos romanos. Su torre del homenaje vigila toda la localidad.'
    },
    {
        id: 'victoria',
        name: 'T. Victoria',
        glb: './assets/GLB/TorreVictoriaBAKE.glb',
        usdz: './assets/USDZ/TorreVictoriaBAKE.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Antigua torre del convento de la Victoria en Estepa. Destaca por su estilo barroco y sus impresionantes vistas.'
    },
    {
        id: 'equipacion',
        name: 'Equipación',
        glb: './assets/GLB/Equipacion.glb',
        usdz: './assets/USDZ/Equipacion.usdz',
        scale: '0.05 0.05 0.05',
        info: 'Modelo 3D detallado de la equipación deportiva. Visualiza cada detalle y textura en realidad aumentada.'
    },
    {
        id: 'robot-happy',
        name: 'Robot Feliz',
        glb: './assets/GLB/Robot_Happy.glb',
        usdz: './assets/USDZ/Robot_Happy.usdz',
        scale: '0.02 0.02 0.02',
        info: 'Diseño de un pequeño robot animado en estado alegre.'
    },
    {
        id: 'robot-headplay',
        name: 'Robot Jugando',
        glb: './assets/GLB/Robot_Headplay.glb',
        usdz: './assets/USDZ/Robot_Headplay.usdz',
        scale: '0.02 0.02 0.02',
        info: 'Diseño animado de un robot realizando movimientos con la cabeza.'
    },
    {
        id: 'animado',
        name: 'Prueba 3D animado',
        glb: './assets/GLB/Fox.glb',
        usdz: './assets/USDZ/toy_drummer.usdz',
        scale: '0.02 0.02 0.02',
        info: 'Zorro animado para pruebas de WebXR. Permite verificar las animaciones y el refresco de la escena.',
        isTest: true
    }
];

export function generateButtons(container, testContainer, onSelect) {
    MonumentData.forEach(monumento => {
        const btn = document.createElement('button');
        btn.className = 'option-button' + (monumento.isTest ? ' btn-test' : '');
        btn.id = `btn-${monumento.id}`;
        btn.innerText = monumento.name;
        
        btn.addEventListener('click', () => {
            onSelect(monumento, btn);
        });

        if (monumento.isTest) {
            testContainer.appendChild(btn);
        } else {
            container.appendChild(btn);
        }
    });
}
